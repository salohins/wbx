// SnapSection.tsx
import React, { ReactNode } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

type SlideFactory = (api: {
    Slide: (props: { children: ReactNode; className?: string }) => JSX.Element
}) => ReactNode[]

interface SnapSectionProps {
    sectionId?: string
    title?: string
    subtitle?: string
    children?: ReactNode
    className?: string

    /**
     * Optional: explicit slides (used for sections like Projects)
     * - Mobile: native scroll snap
     * - Desktop: framer swipe
     */
    slides?: ReactNode[]
}

function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState(() => {
        if (typeof window === 'undefined') return false
        return window.matchMedia(query).matches
    })

    React.useEffect(() => {
        if (typeof window === 'undefined') return
        const m = window.matchMedia(query)
        const onChange = () => setMatches(m.matches)

        if (m.addEventListener) m.addEventListener('change', onChange)
        else m.addListener(onChange)

        setMatches(m.matches)

        return () => {
            if (m.removeEventListener) m.removeEventListener('change', onChange)
            else m.removeListener(onChange)
        }
    }, [query])

    return matches
}

export function SnapSection({
    sectionId,
    title,
    subtitle,
    children,
    className = '',
    slides,
}: SnapSectionProps) {
    const isLg = useMediaQuery('(min-width: 1024px)') // used to adjust the slider based on screen size

    // public Slide wrapper (also used internally by factories)
    const Slide = React.useCallback(
        ({ children, className = '' }: { children: ReactNode; className?: string }) => (
            <div className={`h-full w-full ${className}`}>{children}</div>
        ),
        []
    )

    /**
     * ✅ Child slide factory support:
     * SnapSection can’t “look inside <Services />”.
     * So Services must expose slides via a static property:
     * (Services as any).snapSectionSlides = (api) => [...]
     */
    const childSlideFactory = React.useMemo<SlideFactory | null>(() => {
        if (!children) return null
        if (!React.isValidElement(children)) return null
        const t: any = children.type
        return t?.snapSectionSlides ?? null
    }, [children])

    /**
     * Slide resolution priority:
     * 1) explicit slides prop (Projects etc.)
     * 2) child snapSectionSlides (Services mobile)
     */
    const resolvedSlides = React.useMemo<ReactNode[] | null>(() => {
        if (Array.isArray(slides) && slides.length) return slides
        if (childSlideFactory) return childSlideFactory({ Slide }) ?? []
        return null
    }, [slides, childSlideFactory, Slide])

    const slideCount = resolvedSlides?.length ?? 0

    /**
     * ✅ Behavior rules:
     * - Desktop: ALWAYS render children normally (so Services keeps left/right layout)
     *   EXCEPT when explicit `slides` prop is provided (Projects): then desktop swipe.
     * - Mobile: if we have 2+ slides, use carousel. Otherwise render children.
     */
    const mobileCarouselEnabled = !isLg && slideCount > 1
    const desktopSwipeEnabled = isLg && Array.isArray(slides) && slideCount > 1 // only explicit slides get desktop swipe

    const [activeIndex, setActiveIndex] = React.useState(0)

    React.useEffect(() => {
        if (!(mobileCarouselEnabled || desktopSwipeEnabled)) return
        setActiveIndex((i) => Math.max(0, Math.min(i, slideCount - 1)))
    }, [mobileCarouselEnabled, desktopSwipeEnabled, slideCount])

    const clampIndex = (i: number) => Math.max(0, Math.min(slideCount - 1, i))

    // -----------------------------
    // Desktop swipe (explicit slides only)
    // -----------------------------
    const stageRef = React.useRef<HTMLDivElement | null>(null)
    const x = useMotionValue(0)
    const [stageW, setStageW] = React.useState(1)
    const animStopRef = React.useRef<null | (() => void)>(null)
    const isDraggingRef = React.useRef(false)

    const stopAnim = React.useCallback(() => {
        if (animStopRef.current) {
            animStopRef.current()
            animStopRef.current = null
        }
    }, [])

    React.useEffect(() => {
        if (!desktopSwipeEnabled) return
        const el = stageRef.current
        if (!el) return

        const ro = new ResizeObserver(() => {
            const w = Math.max(1, Math.round(el.clientWidth))
            setStageW(w)
        })

        ro.observe(el)
        setStageW(Math.max(1, Math.round(el.clientWidth || 1)))

        return () => ro.disconnect()
    }, [desktopSwipeEnabled])

    React.useEffect(() => {
        if (!desktopSwipeEnabled) return
        stopAnim()
        x.stop()
        x.set(-activeIndex * stageW)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stageW, desktopSwipeEnabled])

    const snapToIndex = React.useCallback(
        (idx: number) => {
            const next = clampIndex(idx)
            stopAnim()
            x.stop()

            const target = -next * stageW
            const controls = animate(x, target, {
                type: 'spring',
                stiffness: 520,
                damping: 48,
                mass: 0.6,
            })
            animStopRef.current = () => controls.stop()

            setActiveIndex(next)
        },
        [stageW, stopAnim, x, slideCount]
    )

    React.useEffect(() => {
        if (!desktopSwipeEnabled) return
        if (isDraggingRef.current) return
        stopAnim()
        x.stop()
        const controls = animate(x, -activeIndex * stageW, {
            type: 'spring',
            stiffness: 520,
            damping: 48,
            mass: 0.6,
        })
        animStopRef.current = () => controls.stop()
        return () => controls.stop()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIndex, desktopSwipeEnabled])

    const SNAP_THRESHOLD = 0.12
    const FLICK_VELOCITY = 380

    const snapDesktopByGesture = (offsetX: number, velocityX: number) => {
        const threshold = stageW * SNAP_THRESHOLD
        let next = activeIndex

        if (offsetX < -threshold || velocityX < -FLICK_VELOCITY) next = activeIndex + 1
        if (offsetX > threshold || velocityX > FLICK_VELOCITY) next = activeIndex - 1

        snapToIndex(next)
    }

    // -----------------------------
    // Mobile native scroll + snap tracking
    // -----------------------------
    const mobileScrollerRef = React.useRef<HTMLDivElement | null>(null)
    const [mobileTick, setMobileTick] = React.useState(0)

    const setMobileScroller = React.useCallback((node: HTMLDivElement | null) => {
        mobileScrollerRef.current = node
        if (node) setMobileTick((t) => t + 1)
    }, [])

    React.useEffect(() => {
        if (!mobileCarouselEnabled) return
        const el = mobileScrollerRef.current
        if (!el) return

        let raf = 0
        const update = () => {
            const w = el.clientWidth
            if (!w) return
            const next = clampIndex(Math.round(el.scrollLeft / w))
            setActiveIndex(next)
        }

        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(update)
        }

        el.addEventListener('scroll', onScroll, { passive: true })
        update()
        requestAnimationFrame(update)

        return () => {
            cancelAnimationFrame(raf)
            el.removeEventListener('scroll', onScroll as any)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mobileCarouselEnabled, slideCount, mobileTick])

    const scrollToIndex = (i: number) => {
        const next = clampIndex(i)

        if (desktopSwipeEnabled) {
            snapToIndex(next)
            return
        }

        const el = mobileScrollerRef.current
        if (!el) return
        const w = el.clientWidth
        el.scrollTo({ left: next * w, behavior: 'smooth' })
        setActiveIndex(next)
    }

    const scrollerClass = 'h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide'
    const showDots = (mobileCarouselEnabled || desktopSwipeEnabled) && slideCount > 1
    const showHeader = Boolean(title || subtitle)

    return (
        <section id={sectionId} data-section={sectionId} className={`h-full snap-start relative ${className}`}>
            {/* Header (owned by SnapSection) */}
            {showHeader && (
                <div className="absolute top-0 left-0 right-0 z-10">
                    <div className="pt-4 pb-3 px-5">
                        {title && <h2 className="font-white text-lg font-medium md:text-3xl md:font-semibold">{title}</h2>}
                        {subtitle && <p className="mt-1 text-sm md:text-base text-white/70">{subtitle}</p>}

                        {showDots && (
                            <div className="mt-3 flex items-center gap-2">
                                {Array.from({ length: slideCount }).map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => scrollToIndex(i)}
                                        aria-label={`Go to slide ${i + 1}`}
                                        className={[
                                            'h-2.5 w-2.5 rounded-full transition-transform bg-white',
                                            i === activeIndex ? 'scale-110 opacity-100' : 'opacity-40',
                                        ].join(' ')}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="h-full w-full overflow-hidden">
                {/* MOBILE: if child provides slides -> carousel */}
                {!isLg ? (
                    mobileCarouselEnabled && resolvedSlides ? (
                        <div ref={setMobileScroller} className={`${scrollerClass} w-full`}>
                            {resolvedSlides.map((slide, index) => (
                                <div key={index} className="w-full h-full shrink-0 snap-start">
                                    <div className="h-full w-full">{slide}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full w-full">{children}</div>
                    )
                ) : (
                    // DESKTOP:
                    // - Services: always children (keeps left/right)
                    // - Projects: explicit slides -> framer swipe
                    desktopSwipeEnabled && resolvedSlides ? (
                        <div ref={stageRef} className="h-full w-full relative  isolate" style={{ touchAction: 'pan-y' }}>
                            <motion.div
                                className="h-full flex will-change-transform"
                                style={{ x }}
                                drag="x"
                                dragListener
                                dragMomentum={false}
                                dragElastic={0.08}
                                dragTransition={{ power: 0.15, timeConstant: 180 }}
                                onDragStart={() => {
                                    isDraggingRef.current = true
                                    stopAnim()
                                    x.stop()
                                }}
                                onDragEnd={(_, info) => {
                                    isDraggingRef.current = false
                                    snapDesktopByGesture(info.offset.x, info.velocity.x)
                                }}
                                dragConstraints={{
                                    left: -Math.max(0, (slideCount - 1) * stageW),
                                    right: 0,
                                }}
                            >
                                {resolvedSlides.map((slide, index) => (
                                    <div key={index} className="h-full shrink-0" style={{ width: stageW }}>
                                        {slide}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    ) : (
                        <div className="h-full w-full">{children}</div>
                    )
                )}
            </div>
        </section>
    )
}

// keep helper for external factories
SnapSection.Slide = function Slide({
    children,
    className = '',
}: {
    children: ReactNode
    className?: string
}) {
    return <div className={`h-full w-full ${className}`}>{children}</div>
}
