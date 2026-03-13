// screens/InfoScreen.tsx
import React, { useEffect, useMemo, useRef } from "react";

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

export function InfoScreenFixedBackground() {
    const containerRef = useScreenScrollRef();

    const poseRef = useRef<ScrollPoseState>({
        activeIndex: 0,
        between: 0,
        sectionId: "about",
    });

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
                    { id: "m1", y: 40 },
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

        const readSectionsFromDocument = () => {
            const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
            return nodes.map((el) => ({
                el,
                id: el.getAttribute("data-section") || "unknown",
            }));
        };

        const attachVirtual = () => {
            let sections = readSectionsFromDocument();
            if (!sections.length) {
                raf = requestAnimationFrame(attachVirtual);
                return;
            }

            const recompute = () => {
                sections = readSectionsFromDocument();
            };

            const onProgress = (ev: Event) => {
                const e = ev as CustomEvent<{ progress: number }>;
                const progress = clamp01(e.detail?.progress ?? 0);

                const count = sections.length;
                if (count <= 1) {
                    poseRef.current.activeIndex = 0;
                    poseRef.current.between = 0;
                    poseRef.current.sectionId = sections[0]?.id ?? "about";
                    return;
                }

                const idxFloat = progress * (count - 1);
                const idx = Math.max(0, Math.min(count - 1, Math.floor(idxFloat)));
                const between = clamp01(idxFloat - idx);

                poseRef.current.activeIndex = idx;
                poseRef.current.between = idx === count - 1 ? 0 : between;
                poseRef.current.sectionId = sections[idx]?.id ?? "unknown";
            };

            onProgress(new CustomEvent("snap:progress", { detail: { progress: 0 } }));

            window.addEventListener("resize", recompute, { passive: true });
            window.addEventListener("snap:progress", onProgress as EventListener);

            cleanup = () => {
                window.removeEventListener("resize", recompute as EventListener);
                window.removeEventListener("snap:progress", onProgress as EventListener);
            };
        };

        const attachRealScroll = () => {
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

            compute();
            onScroll();

            const ro = new ResizeObserver(() => {
                compute();
                onScroll();
            });
            ro.observe(container);

            window.addEventListener("resize", compute, { passive: true });
            container.addEventListener("scroll", onScroll, { passive: true });

            cleanup = () => {
                window.removeEventListener("resize", compute as EventListener);
                container.removeEventListener("scroll", onScroll as EventListener);
                ro.disconnect();
            };
        };

        const tryAttach = () => {
            const container = containerRef.current;
            const looksScrollable =
                !!container && container.scrollHeight > container.clientHeight + 1;

            if (looksScrollable) attachRealScroll();
            else attachVirtual();
        };

        tryAttach();

        return () => {
            if (raf) cancelAnimationFrame(raf);
            cleanup?.();
        };
    }, [containerRef]);

    return (
        <AboutParallaxBackgroundWebGL
            poseRef={poseRef}
            poses={desktopPoses}
            mobilePoses={mobilePoses}
            active={true}
        />
    );
}

export function InfoScreen() {
    const t = useTranslation();

    return (
        <div className="absolute inset-0 h-full">
            <AboutUsSection />
            <PhilosophySection />
            <StatsDashboardSection />
        </div>
    );
}