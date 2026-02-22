import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '../store/uiStore'
import { TAB_ORDER } from '../app/tabs'

import { HomeScreen } from '../screens/HomeScreen'
import { InfoScreen } from '../screens/InfoScreen'
import { ProjectsScreen } from '../screens/ProjectsScreen'
import { ContactScreen } from '../screens/ContactScreen'

const SCREENS = {
    home: <HomeScreen />,
    about: <InfoScreen />,
    projects: <ProjectsScreen />,
    contact: <ContactScreen />,
}

export function TabSlider() {
    const activeTab = useUIStore((s) => s.activeTab)

    const index = TAB_ORDER.indexOf(activeTab)

    return (
        <AnimatePresence initial={false}>
            <motion.div
                key={activeTab}
                initial={{ x: 100 * index }}
                animate={{ x: 0 }}
                exit={{ x: -100 * index }}
                transition={{
                    duration: 0.35,
                    ease: 'easeInOut',
                }}
                className="absolute inset-0 w-full h-full"
            >
                {SCREENS[activeTab]}
            </motion.div>
        </AnimatePresence>
    )
}
