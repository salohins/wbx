import React, { ReactNode } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

type SlideItem = { id: string; order: number };
type BleedItem = { id: string; order: number; layer: "behind" | "front" };

function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const m = window.matchMedia(query);
        const onChange = () => setMatches(m.matches);

        setMatches(m.matches);

        if (m.addEventListener) m.addEventListener("change", onChange);
        else m.addListener(onChange);

        return () => {
            if (m.removeEventListener) m.removeEventListener("change", onChange);
            else m.removeListener(onChange);
        };
    }, [query]);

    return matches;
}

function useElementWidth<T extends HTMLElement>() {
    const ref = React.useRef<T | null>(null);
    const [width, setWidth] = React.useState(0);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const ro = new ResizeObserver(() => setWidth(el.clientWidth || 0));
        ro.observe(el);
        setWidth(el.clientWidth || 0);

        return () => ro.disconnect();
    }, []);

    return [ref, width] as const;
}

type DesktopAlign = "top" | "center" | "bottom";

type SnapCtxType = {
    isMobile: boolean;

    // slides
    register: (id: string, order: number) => void;
    unregister: (id: string) => void;
    setNode: (id: string, node: ReactNode) => void;

    // bleed
    registerBleed: (id: string, order: number, layer: "behind" | "front") => void;
    unregisterBleed: (id: string) => void;
    setBleedNode: (id: string, node: ReactNode) => void;
};

const SnapCtx = React.createContext<SnapCtxType | null>(null);

type SnapSectionProps = {
    sectionId?: string;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;

    /**
     * Desktop only:
     * - "top": content starts at the top
     * - "center": content vertically centered
     * - "bottom": content at the bottom
     *
     * Mobile is ALWAYS centered.
     */
    desktopAlign?: DesktopAlign;

    // container width class (Tailwind), e.g. "max-w-7xl"
    maxWidth?: string;

    /**
     * If your bleed is purely decorative, leave this false so it doesn't block clicks.
     * If you want interactive bleed content (buttons etc.), set true.
     */
    bleedPointerEvents?: boolean;

    /**
     * Prevent full-bleed glows/blur from creating horizontal page scroll.
     * Default true, because bleed is usually decorative.
     *
     * (Not used for the mobile slider anymore.)
     */
    clipBleed?: boolean;
};

const desktopAlignClass: Record<DesktopAlign, string> = {
    top: "justify-start",
    center: "justify-center",
    bottom: "justify-end",
};

export function SnapSection({
    sectionId,
    title,
    subtitle,
    children,
    className = "",
    desktopAlign = "center",
    maxWidth = "max-w-7xl",
    bleedPointerEvents = false,
    clipBleed = true,
}: SnapSectionProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const isMobile = !isDesktop;

    // stores the actual slide ReactNodes without causing re-renders
    const nodesRef = React.useRef<Map<string, ReactNode>>(new Map());
    // stores the actual bleed ReactNodes without causing re-renders
    const bleedNodesRef = React.useRef<Map<string, ReactNode>>(new Map());

    // ✅ IMPORTANT: refs don't trigger renders; bump this to refresh slider content
    const [, bumpNodeVersion] = React.useState(0);

    // ✅ prevent re-render spam while dragging: only bump once per id (or when removed)
    const seenNodeIdsRef = React.useRef<Set<string>>(new Set());
    const seenBleedIdsRef = React.useRef<Set<string>>(new Set());

    // stores only id/order list (this is what renders the slider)
    const [slideList, setSlideList] = React.useState<SlideItem[]>([]);
    // stores bleed id/order/layer list (rendered outside maxWidth box)
    const [bleedList, setBleedList] = React.useState<BleedItem[]>([]);

    // ✅ mobile slider tracking
    const [activeIndex, setActiveIndex] = React.useState(0);

    // ✅ Framer Motion: use MotionValue (no React re-render per frame)
    const x = useMotionValue(0);

    // ✅ measure viewport width for snap math
    const [viewportRef, viewportW] = useElementWidth<HTMLDivElement>();

    // ✅ keep a stable "current index" ref for drag math
    const activeIndexRef = React.useRef(0);
    React.useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    // ✅ defer state updates so snap animation doesn’t hitch on first frame
    const setActiveIndexDeferred = React.useCallback((next: number) => {
        requestAnimationFrame(() => {
            const startTransition = (React as any).startTransition as undefined | ((cb: () => void) => void);
            if (startTransition) startTransition(() => setActiveIndex(next));
            else setActiveIndex(next);
        });
    }, []);

    const setNode = React.useCallback((id: string, node: ReactNode) => {
        nodesRef.current.set(id, node);

        // ✅ bump ONLY the first time this id is seen (prevents jitter)
        if (!seenNodeIdsRef.current.has(id)) {
            seenNodeIdsRef.current.add(id);
            bumpNodeVersion((v) => v + 1);
        }
    }, []);

    const register = React.useCallback((id: string, order: number) => {
        setSlideList((prev) => {
            const existing = prev.find((s) => s.id === id);

            const next = existing
                ? prev.map((s) => (s.id === id ? { id, order } : s))
                : [...prev, { id, order }];

            next.sort((a, b) => a.order - b.order);

            // bail out if nothing changed (prevents pointless re-renders)
            if (
                prev.length === next.length &&
                prev.every((p, i) => p.id === next[i].id && p.order === next[i].order)
            ) {
                return prev;
            }

            return next;
        });
    }, []);

    const unregister = React.useCallback((id: string) => {
        nodesRef.current.delete(id);
        seenNodeIdsRef.current.delete(id);
        setSlideList((prev) => prev.filter((s) => s.id !== id));
        bumpNodeVersion((v) => v + 1);
    }, []);

    // ----- BLEED REGISTRY -----
    const setBleedNode = React.useCallback((id: string, node: ReactNode) => {
        bleedNodesRef.current.set(id, node);

        if (!seenBleedIdsRef.current.has(id)) {
            seenBleedIdsRef.current.add(id);
            bumpNodeVersion((v) => v + 1);
        }
    }, []);

    const registerBleed = React.useCallback(
        (id: string, order: number, layer: "behind" | "front") => {
            setBleedList((prev) => {
                const existing = prev.find((b) => b.id === id);

                const next = existing
                    ? prev.map((b) => (b.id === id ? { id, order, layer } : b))
                    : [...prev, { id, order, layer }];

                // stable ordering by: layer first (behind -> front), then order
                next.sort((a, b) => {
                    if (a.layer !== b.layer) return a.layer === "behind" ? -1 : 1;
                    return a.order - b.order;
                });

                // bail out if nothing changed
                if (
                    prev.length === next.length &&
                    prev.every(
                        (p, i) =>
                            p.id === next[i].id &&
                            p.order === next[i].order &&
                            p.layer === next[i].layer
                    )
                ) {
                    return prev;
                }

                return next;
            });
        },
        []
    );

    const unregisterBleed = React.useCallback((id: string) => {
        bleedNodesRef.current.delete(id);
        seenBleedIdsRef.current.delete(id);
        setBleedList((prev) => prev.filter((b) => b.id !== id));
        bumpNodeVersion((v) => v + 1);
    }, []);

    // ✅ make context value stable
    const ctxValue = React.useMemo(
        () => ({
            isMobile,
            register,
            unregister,
            setNode,
            registerBleed,
            unregisterBleed,
            setBleedNode,
        }),
        [isMobile, register, unregister, setNode, registerBleed, unregisterBleed, setBleedNode]
    );

    // Outer content alignment:
    // - Mobile: always centered
    // - Desktop: configurable
    const align = isMobile ? "justify-center" : desktopAlignClass[desktopAlign];
    const slideCount = slideList.length;

    const clampIndex = React.useCallback(
        (i: number) => Math.max(0, Math.min(slideCount - 1, i)),
        [slideCount]
    );

    // keep activeIndex valid when slides appear/disappear
    React.useEffect(() => {
        if (!isMobile) return;
        setActiveIndex((i) => clampIndex(i));
    }, [isMobile, clampIndex]);

    // ✅ snap to index (motion value) — START ANIMATION FIRST, then update React state deferred
    const snapToIndex = React.useCallback(
        (i: number, opts?: { instant?: boolean }) => {
            const next = clampIndex(i);

            // ✅ keep ref correct immediately (drag math + next swipe)
            activeIndexRef.current = next;

            const w = viewportW || 1;
            const target = -next * w;

            if (opts?.instant) {
                x.set(target);
                setActiveIndex(next);
                return;
            }

            // ✅ start snap animation first (no React commit yet)
            animate(x, target, {
                type: "tween",
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
            });

            // ✅ defer state update (prevents micro-freeze right after release)
            setActiveIndexDeferred(next);
        },
        [clampIndex, viewportW, x, setActiveIndexDeferred]
    );

    // ✅ when viewportW changes (rotation / resize), keep the same index aligned
    React.useEffect(() => {
        if (!isMobile) return;
        snapToIndex(activeIndexRef.current, { instant: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile, viewportW]);

    // ✅ clamp x into valid bounds when layout changes (prevents "weird dimension")
    React.useEffect(() => {
        if (!isMobile) return;
        if (viewportW <= 0) return;

        const minX = -(Math.max(0, slideCount - 1) * viewportW);
        const maxX = 0;

        const current = x.get();
        if (current < minX) x.set(minX);
        if (current > maxX) x.set(maxX);
    }, [isMobile, viewportW, slideCount, x]);

    const showDots = isMobile && slideCount > 1;

    // resolve bleed nodes in the sorted order
    const bleedBehind = bleedList
        .filter((b) => b.layer === "behind")
        .map((b) => bleedNodesRef.current.get(b.id) ?? null);

    const bleedFront = bleedList
        .filter((b) => b.layer === "front")
        .map((b) => bleedNodesRef.current.get(b.id) ?? null);

    const bleedWrapperBase = [
        "absolute inset-0",
        clipBleed ? "" : "",
        bleedPointerEvents ? "pointer-events-auto" : "pointer-events-none",
    ]
        .filter(Boolean)
        .join(" ");

    // ✅ Shadow gutter (tune this number)
    const SHADOW_GUTTER_PX = 28;

    return (
        <section
            id={sectionId}
            data-section={sectionId}
            className={[
                "relative h-full w-full flex justify-center snap-start",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            style={{
                // ✅ prevents page-level horizontal dragging without using overflow:hidden
                overflowX: "clip",
                // ✅ kills horizontal rubber-band on mobile
                overscrollBehaviorX: "none",
            }}
        >
            <SnapCtx.Provider value={ctxValue}>
                {bleedBehind.length > 0 && (
                    <div className={`${bleedWrapperBase} z-0`}>{bleedBehind}</div>
                )}

                <div className={`relative z-10 h-full w-full flex flex-col ${maxWidth} ${align}`}>
                    {(title || subtitle) && (
                        <div className="absolute top-0 left-0 md:relative z-20 w-full ">
                            <div
                                className="bg-neutral-100/10 dark:bg-neutral-900/10 backdrop-blur-md pt-4 pb-3 px-5   "
                                style={{
                                    // ✅ when swiping title, don't allow browser horizontal pan
                                    touchAction: "pan-y",
                                }}
                            >
                                {title && (
                                    <h2 className="text-neutral-900 dark:text-white text-lg font-medium md:text-4xl md:font-bold">
                                        {title}
                                    </h2>
                                )}
                                {subtitle && (
                                    <p className="mt-1 text-sm md:text-lg text-neutral-600 dark:text-white/70 font-normal">
                                        {subtitle}
                                    </p>
                                )}


                            </div>
                            {showDots && (
                                <div className="mt-3 px-5 flex items-center gap-2">
                                    {Array.from({ length: slideCount }).map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => snapToIndex(i)}
                                            aria-label={`Go to slide ${i + 1}`}
                                            className={[
                                                "h-2.5 w-2.5 rounded-full transition-transform bg-white",
                                                i === activeIndex ? "scale-110 opacity-100" : "opacity-40",
                                            ].join(" ")}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative z-0 h-full md:h-auto w-full min-h-0">
                        {isDesktop && <div className="h-full w-full px-6">{children}</div>}

                        {isMobile && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 opacity-0 pointer-events-none"
                            >
                                {children}
                            </div>
                        )}

                        {isMobile && (
                            <div
                                ref={viewportRef}
                                className="h-full w-full"
                                style={{
                                    // keep your existing behavior; no overflow hidden
                                    overflow: "",
                                    paddingLeft: SHADOW_GUTTER_PX,
                                    paddingRight: SHADOW_GUTTER_PX,
                                }}
                            >
                                <motion.div
                                    className="h-full flex"
                                    style={{
                                        x,
                                        marginLeft: -SHADOW_GUTTER_PX,
                                        marginRight: -SHADOW_GUTTER_PX,
                                        willChange: "transform",
                                        touchAction: "pan-y",
                                    }}
                                    drag={viewportW > 0 && slideCount > 1 ? "x" : false}
                                    dragElastic={0.08}
                                    dragMomentum={false} // ✅ no fling -> no "dimension"
                                    onDragStart={() => {
                                        // ✅ stop any running animation so drag doesn't fight it
                                        (x as any).stop?.();
                                    }}
                                    dragConstraints={{
                                        left: -(Math.max(0, slideCount - 1) * (viewportW || 0)),
                                        right: 0,
                                    }}
                                    onDragEnd={(_, info) => {
                                        const w = viewportW || 1;
                                        const offsetX = info.offset.x;
                                        const velocityX = info.velocity.x;

                                        let next = activeIndexRef.current;

                                        const SWIPE_DIST = w * 0.18;
                                        const SWIPE_VEL = 600;

                                        if (offsetX < -SWIPE_DIST || velocityX < -SWIPE_VEL) next += 1;
                                        else if (offsetX > SWIPE_DIST || velocityX > SWIPE_VEL) next -= 1;

                                        snapToIndex(next);
                                    }}
                                >
                                    {slideList.map((s) => (
                                        <div
                                            key={s.id}
                                            className="shrink-0 h-full"
                                            style={{ width: viewportW || "100%" }}
                                        >
                                            <div className="w-full h-full flex flex-col px-5 justify-center items-center">
                                                {nodesRef.current.get(s.id) ?? null}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>

                {bleedFront.length > 0 && (
                    <div className={`${bleedWrapperBase} z-20`}>{bleedFront}</div>
                )}
            </SnapCtx.Provider>
        </section>
    );
}

SnapSection.Slide = function Slide({
    id,
    order = 0,
    children,
}: {
    id: string;
    order?: number;
    children: React.ReactNode;
}) {
    const ctx = React.useContext(SnapCtx);

    React.useEffect(() => {
        if (!ctx) return;
        ctx.register(id, order);
        return () => ctx.unregister(id);
    }, [ctx, id, order]);

    React.useEffect(() => {
        if (!ctx) return;
        ctx.setNode(id, children);
    }, [ctx, id, children]);

    if (!ctx) return <>{children}</>;
    return ctx.isMobile ? null : <>{children}</>;
};

SnapSection.Bleed = function Bleed({
    id,
    order = 0,
    layer = "behind",
    children,
}: {
    id: string;
    order?: number;
    layer?: "behind" | "front";
    children: React.ReactNode;
}) {
    const ctx = React.useContext(SnapCtx);

    React.useEffect(() => {
        if (!ctx) return;
        ctx.registerBleed(id, order, layer);
        return () => ctx.unregisterBleed(id);
    }, [ctx, id, order, layer]);

    React.useEffect(() => {
        if (!ctx) return;
        ctx.setBleedNode(id, children);
    }, [ctx, id, children]);

    if (!ctx) return <>{children}</>;
    return null;
};