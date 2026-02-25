// screens/InfoScreen.tsx
import React, { useEffect, useMemo, useRef } from "react";

import { SnapSection } from "../components/SnapSection";
import { useTranslation } from "../hooks/useTranslation";
import { AboutParallaxBackgroundWebGL } from "../sections/About/AboutParallaxBackgroundWebGL";
import type { ParallaxPose } from "../sections/About/AboutParallaxBackgroundWebGL";
import { useScreenScrollRef } from "../app/ScreenScrollContext";
import { AboutUsSection } from "../sections/About/AboutUsSection";
import { PhilosophySection } from "../sections/About/PhilosophySection";
import { StatsDashboardSection } from "../sections/About/StatsDashboardSection";

type ScrollPoseState = {
    activeIndex: number;
    between: number;
    sectionId?: string;
};

function clamp01(n: number) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function InfoScreen() {
    // Keep it, but don't assume it's a function.
    // (Your hook likely returns an object, so calling it throws.)
    const t = useTranslation();

    // ✅ same scroll container ref as HeroCanvas
    const containerRef = useScreenScrollRef();

    // ✅ background reads this without rerenders
    const poseRef = useRef<ScrollPoseState>({
        activeIndex: 0,
        between: 0,
        sectionId: "about",
    });

    // =========================
    // DESKTOP POSES (default)
    // =========================
    const desktopPoses: ParallaxPose[] = useMemo(
        () => [
            {
                baseX: 0,
                baseY: 0,
                baseScale: 1,
                gain: 1.1,
                strengthX: 160,
                strengthY: 140,
                depthScale: 0.18,
                frontDrop: 200,
                layerOverrides: [
                    { id: "m1", blur: 0.5 },
                    { id: "m2", blur: 0 },
                    { id: "m3", blur: 0.3 },
                    { id: "m4", blur: 0.5 },
                    { id: "m5", blur: 0.7 },
                    { id: "m6", blur: 0.6 },
                ],
            },
            {
                baseX: 0,
                baseY: 0,
                baseScale: 1.1,
                gain: 1,
                strengthX: 240,
                strengthY: 210,
                depthScale: 0.4,
                frontDrop: 100,
                layerOverrides: [
                    { id: "m1", blur: 3, y: 150 },
                    { id: "m2", y: 70, blur: 0.5 },
                    { id: "m4", y: 0 },
                    { id: "m5", y: -20 },
                    { id: "m6", y: 30, blur: 0.3 },
                ],
            },
            {
                baseX: 0,
                baseY: 0,
                baseScale: 1.26,
                gain: 1,
                strengthX: 360,
                strengthY: 310,
                depthScale: 0.5,
                frontDrop: 500,
                layerOverrides: [
                    { id: "m5", x: -10, y: -20, blur: 0.5 },
                    { id: "m6", x: 0, y: 0 },
                    { id: "m2", y: 100, blur: 2 },
                    { id: "m3", y: 100, blur: 1 },
                    { id: "m4", y: 100, blur: 1 },
                    { id: "m1", blur: 5, y: 200, x: 20 },
                ],
            },
        ],
        []
    );

    // =========================
    // MOBILE POSES (example)
    // - calmer, less drift, less scaling
    // =========================
    const mobilePoses: ParallaxPose[] = useMemo(
        () => [
            {
                baseX: 0,
                baseY: 0,
                baseScale: 1.0,
                gain: 1.0,
                strengthX: 80,
                strengthY: 80,
                depthScale: 0.12,
                frontDrop: 120,
                layerOverrides: [
                    { id: "m1", y: 40, },
                    { id: "m2", y: 20 },
                    { id: "m3", y: 30 },
                    { id: "m5", y: 30 },
                    { id: "m6", y: 10 },
                ],
            },
            {
                baseX: 0,
                baseY: 0,
                baseScale: 1.06,
                gain: 1.0,
                strengthX: 120,
                strengthY: 120,
                depthScale: 0.22,
                frontDrop: 0,
                layerOverrides: [
                    { id: "m1", y: 200 },
                    { id: "m2", y: 100 },
                    { id: "m3", y: 50 },
                    { id: "m4", y: 5 },
                    { id: "m5", y: 20 },
                ],
            },
            {
                baseX: 0,
                baseY: 0,
                baseScale: 1.2,
                gain: 1.0,
                strengthX: 150,
                strengthY: 150,
                depthScale: 0.28,
                frontDrop: 220,
                layerOverrides: [
                    { id: "m5", y: -10 },
                    { id: "m1", y: 20 },
                    { id: "m3", y: 10 },
                    { id: "m6", y: -20 },
                ],
            },
        ],
        []
    );

    useEffect(() => {
        let cleanup: (() => void) | null = null;
        let raf = 0;

        const tryAttach = () => {
            const container = containerRef.current;
            if (!container) {
                raf = requestAnimationFrame(tryAttach);
                return;
            }

            const getSections = () =>
                Array.from(container.querySelectorAll<HTMLElement>("[data-section]")).map((el) => ({
                    el,
                    id: el.getAttribute("data-section") || "unknown",
                }));

            let sections = getSections();
            if (!sections.length) {
                raf = requestAnimationFrame(tryAttach);
                return;
            }

            const compute = () => {
                sections = getSections();
            };

            const onScroll = () => {
                if (!sections.length) return;

                const viewTop = container.scrollTop;

                let idx = 0;
                for (let i = 0; i < sections.length; i++) {
                    const top = sections[i].el.offsetTop;
                    if (top <= viewTop + 1) idx = i;
                    else break;
                }

                const cur = sections[idx];
                const next = sections[Math.min(idx + 1, sections.length - 1)];

                const curTop = cur.el.offsetTop;
                const nextTop = next.el.offsetTop;

                const between = nextTop <= curTop ? 0 : clamp01((viewTop - curTop) / (nextTop - curTop));

                poseRef.current.activeIndex = idx;
                poseRef.current.between = idx === sections.length - 1 ? 0 : between;
                poseRef.current.sectionId = cur.id;
            };

            // ✅ Run once immediately
            compute();
            onScroll();

            // ✅ Keep sections list fresh if layout changes after first mount
            const ro = new ResizeObserver(() => {
                compute();
                onScroll();
            });
            ro.observe(container);

            window.addEventListener("resize", compute, { passive: true });
            container.addEventListener("scroll", onScroll, { passive: true });

            cleanup = () => {
                window.removeEventListener("resize", compute as any);
                container.removeEventListener("scroll", onScroll as any);
                ro.disconnect();
            };
        };

        tryAttach();

        return () => {
            if (raf) cancelAnimationFrame(raf);
            cleanup?.();
        };
    }, [containerRef]);

    return (
        <div className="absolute inset-0 h-full">
            {/* ✅ ALWAYS mounted background */}
            <div className="pointer-events-none fixed inset-0 z--1">
                <AboutParallaxBackgroundWebGL
                    poseRef={poseRef}
                    poses={desktopPoses}
                    mobilePoses={mobilePoses}
                    active={true}
                />
            </div>

            <AboutUsSection />

            <PhilosophySection />

            <StatsDashboardSection />
        </div>
    );
}