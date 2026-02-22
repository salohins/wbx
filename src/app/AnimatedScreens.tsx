// AnimatedScreens.tsx
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

import { HomeScreen } from "../screens/HomeScreen";
import { InfoScreen } from "../screens/InfoScreen";
import { ProjectsScreen } from "../screens/ProjectsScreen";
import { ContactScreen } from "../screens/ContactScreen";
import { ScreenWrapper } from "./ScreenWrapper";

export function AnimatedScreens() {
  const location = useLocation();

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Unmount inactive pages (fixes hidden pages still running heavy work) */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1], // baby smooth
          }}
          style={{ willChange: "opacity" }}
        >
          <ScreenWrapper>
            {/* Render ONLY the active route */}
            <Routes location={location}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/about" element={<InfoScreen />} />
              <Route path="/projects" element={<ProjectsScreen />} />
              <Route path="/contact" element={<ContactScreen />} />
            </Routes>
          </ScreenWrapper>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}