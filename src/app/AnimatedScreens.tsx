// AnimatedScreens.tsx
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'

import { HomeScreen } from '../screens/HomeScreen'
import { InfoScreen } from '../screens/InfoScreen'
import { ProjectsScreen } from '../screens/ProjectsScreen'
import { ContactScreen } from '../screens/ContactScreen'
import { ScreenWrapper } from './ScreenWrapper'

const SCREENS = [
    { path: '/', Component: HomeScreen },
    { path: '/about', Component: InfoScreen },
    { path: '/projects', Component: ProjectsScreen },
    { path: '/contact', Component: ContactScreen },
]

export function AnimatedScreens() {
    const location = useLocation()

    const activeIndex = useMemo(
        () => SCREENS.findIndex((s) => s.path === location.pathname),
        [location.pathname]
    )

    return (
        <div className="relative w-full h-full overflow-hidden">
            {SCREENS.map(({ path, Component }, index) => {
                const isActive = index === activeIndex

                return (
                    <motion.div
                        key={path}
                        className="absolute inset-0"
                        initial={false}
                        animate={{
                            opacity: isActive ? 1 : 0,
                        }}
                        transition={{
                            duration: 0.45,
                            ease: [0.22, 1, 0.36, 1], // baby smooth
                        }}
                        style={{
                            pointerEvents: isActive ? 'auto' : 'none',
                            // ✅ keep mounted but ensure only active is visually on top
                            zIndex: isActive ? 2 : 1,
                            willChange: 'opacity',
                        }}
                        aria-hidden={!isActive}
                    >
                        <ScreenWrapper>
                            <Component />
                        </ScreenWrapper>
                    </motion.div>
                )
            })}
        </div>
    )
}
