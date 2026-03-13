import { BrowserRouter } from 'react-router-dom'

import { TopBar } from '../components/TopBar'
import { BottomNav } from '../components/BottomNav'
import { MainViewport } from './MainViewport'
import { useUIStore } from '../store/uiStore'
import { AnimatedScreens } from './AnimatedScreens'

function GlobalBackground() {
    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden transform-gpu will-change-transform"
        >
            {/* base */}
            <div className="absolute inset-0 bg-[#eef2ee] dark:bg-[#050816]" />

            {/* color fields */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(16,185,129,0.30),transparent_34%)] dark:bg-[radial-gradient(circle_at_14%_16%,rgba(16,185,129,0.18),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(59,130,246,0.24),transparent_30%)] dark:bg-[radial-gradient(circle_at_84%_18%,rgba(56,189,248,0.14),transparent_36%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_78%,rgba(168,85,247,0.18),transparent_34%)] dark:bg-[radial-gradient(circle_at_74%_78%,rgba(139,92,246,0.14),transparent_40%)]" />

            {/* composition wash */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.00),rgba(15,23,42,0.03))] dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.22),rgba(2,6,23,0.10),rgba(0,0,0,0))]" />

            {/* extra light-mode definition */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),rgba(255,255,255,0.02),rgba(15,23,42,0.04))] dark:hidden" />

            {/* bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white/30 via-white/5 to-transparent dark:from-black/55 dark:via-black/20 dark:to-transparent" />

            {/* Swiss grid */}
            <div className="absolute inset-0 opacity-[0.50] dark:opacity-[0.14]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,.16)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.16)_1px,transparent_1px)] bg-[size:80px_80px]" />

                <div className="absolute inset-0 hidden md:block bg-[linear-gradient(to_right,rgba(15,23,42,.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,.07)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:20px_20px]" />

                <div className="absolute inset-0 bg-white md:[mask-image:radial-gradient(ellipse_at_center,transparent_14%,black_82%)] dark:bg-black dark:md:[mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
            </div>

            {/* subtle center contrast ring for light mode */}
            <div className="absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_center,transparent_32%,rgba(15,23,42,0.045)_100%)]" />

            {/* grain */}
            <div
                className="
                    absolute inset-0 opacity-[0.04] dark:opacity-[0.055]
                    mix-blend-multiply dark:mix-blend-overlay
                    [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]
                "
            />
        </div>
    );
}

export function AppLayout() {
    const theme = useUIStore((state) => state.theme)

    return (
        <BrowserRouter>
            <div
                className={`
                    h-screen w-screen relative overflow-hidden
                    flex flex-col
                    ${theme === 'dark' ? 'dark' : ''}
                `}
            >
                {/* Desktop: put BottomNav into TopBar center */}
                <TopBar>
                    <div className="hidden md:flex items-center justify-center w-full">
                        <BottomNav variant="inline" />
                    </div>
                </TopBar>
                <GlobalBackground />

                <MainViewport>
                    <AnimatedScreens />
                </MainViewport>

                {/* Mobile: keep BottomNav at the bottom */}
                <div className="md:hidden">
                    <BottomNav variant="bottom" />
                </div>
            </div>
        </BrowserRouter>
    )
}
