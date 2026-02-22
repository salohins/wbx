// screens/InfoScreen.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

import { SnapSection } from "../components/SnapSection";
import { useTranslation } from "../hooks/useTranslation";
import { AboutParallaxBackground } from "../sections/About/AboutParallaxBackground";
import type { ParallaxPose } from "../sections/About/AboutParallaxBackground";
import { useScreenScrollRef } from "../app/ScreenScrollContext";

type ScrollPoseState = {
    activeIndex: number;
    between: number;
    sectionId?: string;
};

function clamp01(n: number) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function InfoScreen() {
    const t = useTranslation();

    // ✅ Vite/React-Router route detection
    const { pathname } = useLocation();
    const isAboutRoute = pathname === "/about" || pathname.startsWith("/about/");

    // ✅ same scroll container ref as HeroCanvas
    const containerRef = useScreenScrollRef();

    // ✅ background reads this without rerenders
    const poseRef = useRef<ScrollPoseState>({
        activeIndex: 0,
        between: 0,
        sectionId: "about",
    });

    /**
     * ✅ POSES = your "camera keyframes" per section.
     * activeIndex picks the current pose, "between" blends to the next pose.
     *
     * Global pose fields:
     * - baseX/baseY: camera pan in pixels (moves the whole scene)
     * - baseScale: camera zoom (1 = normal, >1 = closer)
     * - gain: mouse sensitivity (how much mx/my affects layers)
     * - strengthX/strengthY: parallax travel in px (multiplied by depth)
     * - depthScale: extra depth zoom based on layer.depth (adds pop)
     * - frontDrop: pushes nearer layers down more (drop * depth)
     *
     * NEW per-pose: layerOverrides (optional)
     * - x/y: additive offsets per layer (px)
     * - scale: multiplier (1 = no change)
     * - opacity: multiplier (1 = no change)
     * - blur: additive blur in px
     */
    const poses: ParallaxPose[] = useMemo(
        () => [
            // ---------------------------------------------------------
            // 0) ABOUT — calm, wide, minimal fog / movement
            // ---------------------------------------------------------
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
                    { id: "m6", blur: .6, },

                ]

                /* optional: per-layer pose styling for THIS section
                layerOverrides: [
                    // far layers: slightly softer/hazier
                    { id: "m1", opacity: 0.95, blur: 0.5 },
                    { id: "m2", opacity: 0.98, blur: 0.3 },

                    // keep foreground clean
                    { id: "m6", blur: 0, opacity: 1 },
                ], */
            },

            // ---------------------------------------------------------
            // 1) PHILOSOPHY — closer camera, stronger parallax
            // ---------------------------------------------------------
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
                    // push mid layers a bit for composition
                    { id: "m1", blur: 3, y: 150 },
                    { id: "m2", y: 70, blur: 0.5 },
                    { id: "m4", y: 10 },
                    { id: "m4", y: 0 },
                    { id: "m5", y: -20 },
                    { id: "m6", y: 30, blur: .3 }
                ],
            },

            // ---------------------------------------------------------
            // 2) VALUES — cinematic "closest" pose, big reveal
            // ---------------------------------------------------------
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
                    // foreground pushes further down, gets bigger (multiplier)

                    // deepen separation: lift mid layers up a touch

                    { id: "m5", x: -10, y: -20, blur: .5 },
                    { id: "m6", x: 0, y: 0 },
                    { id: "m2", y: 100, blur: 2 },
                    { id: "m3", y: 100, blur: 1 },
                    { id: "m4", y: 100, blur: 1 },

                    // far layers become hazier in this pose
                    { id: "m1", blur: 5, y: 200, x: 20 },
                    { id: "m3", y: 0, blur: 1 },
                ],
            },
        ],
        []
    );

    useEffect(() => {
        // only run pose tracking while /about is active (so entrance can re-trigger)
        if (!isAboutRoute) return;

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

            compute();
            onScroll();

            window.addEventListener("resize", compute, { passive: true });
            container.addEventListener("scroll", onScroll, { passive: true });

            cleanup = () => {
                window.removeEventListener("resize", compute as any);
                container.removeEventListener("scroll", onScroll as any);
            };
        };

        tryAttach();

        return () => {
            if (raf) cancelAnimationFrame(raf);
            cleanup?.();
        };
    }, [containerRef, isAboutRoute]);

    return (
        <div className="absolute inset-0 h-full">
            {/* ✅ fixed background; entrance anim re-triggers when route re-enters /about */}
            <div className="pointer-events-none fixed inset-0 z--1">
                <AboutParallaxBackground
                    poseRef={poseRef}
                    poses={poses}
                    active={isAboutRoute}
                    enterMs={1000}           // ✅ speed of the FOV transition
                    fovFromScale={0.8}     // ✅ "wide lens" start (0.80 wider, 0.92 subtler)
                />
            </div>

            <SnapSection sectionId="about">
                <div className="h-full w-full max-w-3xl mx-auto px-6 flex flex-col justify-center">
                    <h1 className="text-4xl font-semibold mb-6">About WebX</h1>
                    <p className="text-lg leading-relaxed opacity-80">
                        We design and build modern digital products with a strong focus on clarity,
                        performance, and long-term scalability. Our work sits at the intersection of
                        design, technology, and strategy.
                    </p>
                </div>
            </SnapSection>

            <SnapSection sectionId="philosophy">
                <div className="h-full w-full max-w-3xl mx-auto px-6 flex flex-col justify-center">
                    <h2 className="text-3xl font-medium mb-6">Our Philosophy</h2>
                    <ul className="space-y-4 text-lg opacity-80">
                        <li>• Design follows intent, not trends</li>
                        <li>• Technology should simplify, not complicate</li>
                        <li>• Good systems age well</li>
                        <li>• Automation beats repetition</li>
                    </ul>
                </div>
            </SnapSection>

            <SnapSection sectionId="values">
                <div className="h-full w-full max-w-3xl mx-auto px-6 flex flex-col justify-center">
                    <h2 className="text-3xl font-medium mb-6">What sets us apart</h2>
                    <div className="grid grid-cols-1 gap-6 text-lg opacity-80">
                        <p>We don’t sell templates or shortcuts. Every solution is built around real requirements.</p>
                        <p>We think in systems, not pages — so your product can grow without breaking.</p>
                        <p>We value long-term partnerships over quick wins.</p>
                    </div>
                </div>
            </SnapSection>
        </div>
    );
}