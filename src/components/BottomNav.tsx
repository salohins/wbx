import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '../hooks/useTranslation'
import {
    HomeIcon,
    InformationCircleIcon,
    Squares2X2Icon,
    EnvelopeIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'

type BottomNavProps = {
    variant?: 'bottom' | 'inline'
    className?: string
}

export function BottomNav({ variant = 'bottom', className = '' }: BottomNavProps) {
    const t = useTranslation()
    const isInline = variant === 'inline'
    const location = useLocation()

    const navRef = React.useRef<HTMLElement | null>(null)
    const itemRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

    const [indicator, setIndicator] = React.useState<{ left: number; width: number; visible: boolean }>({
        left: 0,
        width: 0,
        visible: false,
    })

    const updateIndicator = React.useCallback(() => {
        const navEl = navRef.current
        if (!navEl) return

        // Match your routes. If you have nested routes, you can adjust this logic.
        const path = location.pathname === '/' ? '/' : location.pathname
        const activeEl =
            itemRefs.current[path] ||
            // fallback: try to match first segment e.g. "/projects/123" -> "/projects"
            itemRefs.current['/' + path.split('/')[1]]

        if (!activeEl) {
            setIndicator((s) => ({ ...s, visible: false }))
            return
        }

        const navRect = navEl.getBoundingClientRect()
        const itemRect = activeEl.getBoundingClientRect()

        // ✅ Underline sizing + centering tweaks
        const UNDERLINE_INSET = 18 // px (try 12–28)

        const left = itemRect.left - navRect.left + UNDERLINE_INSET
        const width = Math.max(12, itemRect.width - UNDERLINE_INSET * 2)

        setIndicator({
            left,
            width,
            visible: true,
        })
    }, [location.pathname])

    React.useLayoutEffect(() => {
        updateIndicator()
    }, [updateIndicator])

    React.useEffect(() => {
        // Keep it correct on resize / font load / layout shifts
        const onResize = () => updateIndicator()
        window.addEventListener('resize', onResize)

        const navEl = navRef.current
        let ro: ResizeObserver | null = null
        if (navEl && 'ResizeObserver' in window) {
            ro = new ResizeObserver(() => updateIndicator())
            ro.observe(navEl)
        }

        return () => {
            window.removeEventListener('resize', onResize)
            ro?.disconnect()
        }
    }, [updateIndicator])

    return (
        <nav
            ref={navRef}
            className={`
                fixed
                ${isInline
                    ? `
                        h-16
                        rounded-2xl
                        overflow-hidden
                        border border-neutral-300
                        dark:border-white/20
                        flex items-center justify-center
                        gap-0
                        px-2 py-1
                        w-fit
                        bg-neutral-100/50
                        dark:bg-neutral-800/50
                    `
                    : `
                        fixed bottom-4 z-40 right-4 left-4
                        h-16
                        rounded-2xl
                        backdrop-blur-xl
                        shadow-[0_10px_30px_rgba(0,0,0,0.12)]

                        bg-white/80
                        dark:bg-neutral-900/80
                        border border-white/90
                        dark:border-white/10

                        flex justify-around items-center
                    `}
                ${className}
            `}
        >
            {/* Sliding underline sitting on the container border (doesn't affect layout) */}
            <motion.div
                aria-hidden
                className={`
                    absolute
                    left-0
                    bottom-0 md:bottom-[2px]
                    h-[3px] md:h-[2px]
                    rounded-full

                    bg-neutral-900/80
                    dark:bg-neutral-200/70
                `}
                initial={false}
                animate={{
                    x: indicator.left,
                    width: indicator.width,
                    opacity: indicator.visible ? 1 : 0,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 40,
                    mass: 0.6,
                }}
                style={{
                    // avoids subpixel fuzz on some screens
                    willChange: 'transform,width',
                }}
            />

            <NavItem
                to="/"
                label={t.ui.navigation.home}
                icon={HomeIcon}
                setRef={(el) => (itemRefs.current['/'] = el)}
            />
            <NavItem
                to="/about"
                label={t.ui.navigation.info}
                icon={InformationCircleIcon}
                setRef={(el) => (itemRefs.current['/about'] = el)}
            />
            <NavItem
                to="/projects"
                label={t.ui.navigation.projects}
                icon={Squares2X2Icon}
                setRef={(el) => (itemRefs.current['/projects'] = el)}
            />
            <NavItem
                to="/faq"
                label={t.ui.navigation.faq}
                icon={QuestionMarkCircleIcon}
                setRef={(el) => (itemRefs.current['/faq'] = el)}
            />
            <NavItem
                to="/contact"
                label={t.ui.navigation.contact}
                icon={EnvelopeIcon}
                setRef={(el) => (itemRefs.current['/contact'] = el)}
            />
        </nav>
    )
}

function NavItem({
    to,
    label,
    icon: Icon,
    setRef,
}: {
    to: string
    label: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    setRef: (el: HTMLDivElement | null) => void
}) {
    return (
        <NavLink to={to} end>
            {({ isActive }) => (
                <div
                    ref={setRef}
                    className={`
                        relative
                        h-12
                        px-3
                        rounded-xl

                        flex flex-col items-center justify-center
                        gap-0.5
                        text-xs
                        select-none

                        min-w-[75px]
                        text-center

                        transition-all
                        duration-300
                        [transition-timing-function:cubic-bezier(.2,.8,.2,1)]

                        text-neutral-900 dark:text-white
                        active:scale-95

                        ${isActive
                            ? 'opacity-100 translate-y-[-1px]'
                            : 'opacity-60 hover:opacity-90 hover:translate-y-[-1px]'}
                    `}
                >
                    <Icon
                        className={`
                            h-6 w-6
                            transition-transform
                            duration-300
                            [transition-timing-function:cubic-bezier(.2,.8,.2,1)]
                            ${isActive ? 'scale-120 -translate-y-0.5' : 'scale-100'}
                        `}
                    />

                    <span className="text-[11px] font-medium leading-none">{label}</span>
                </div>
            )}
        </NavLink>
    )
}
