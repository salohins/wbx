// AnimatedScreens.tsx
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

import { HomeScreen } from "../screens/HomeScreen";
import { InfoScreen } from "../screens/InfoScreen";
import { ProjectsScreen } from "../screens/ProjectsScreen";
import { ContactScreen } from "../screens/ContactScreen";
import { ScreenWrapper } from "./ScreenWrapper";
import { FaqSection } from "../sections/Faq/FaqSection";

// ✅ fixed BG components
import { HeroCanvas } from "../sections/Hero/HeroCanvas";
// import { OtherFixedBg } from "../sections/Somewhere/OtherFixedBg";

export function AnimatedScreens() {
  const location = useLocation();

  // ✅ choose fixed layers per route
  const fixedLayers =
    location.pathname === "/"
      ? [
        <div key="hero-canvas" className="pointer-events-none fixed inset-0 z-[0]">
          <HeroCanvas />
        </div>,
        // <div key="other" className="fixed inset-0 z-[0]"> <OtherFixedBg /> </div>,
      ]
      : undefined;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "opacity" }}
        >
          <ScreenWrapper fixedLayers={fixedLayers}>
            <Routes location={location}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/about" element={<InfoScreen />} />
              <Route path="/projects" element={<ProjectsScreen />} />
              <Route path="/faq" element={<FaqSection />} />
              <Route path="/contact" element={<ContactScreen />} />
            </Routes>
          </ScreenWrapper>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}