import { BrowserRouter } from 'react-router-dom'

import { TopBar } from '../components/TopBar'
import { BottomNav } from '../components/BottomNav'
import { MainViewport } from './MainViewport'
import { useUIStore } from '../store/uiStore'
import { AnimatedScreens } from './AnimatedScreens'

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
