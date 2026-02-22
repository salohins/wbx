// sections/About/AboutParallaxSection.tsx
"use client";

import React, { useMemo, useRef } from "react";
import { useMotionValue } from "framer-motion";
import { SnapSection } from "../../components/SnapSection2";
import { ParallaxScene, type ParallaxLayerConfig } from "../../components/ParallaxScene";

// put this ABOVE AboutParallaxSection in AboutParallaxSection.tsx
function useReducedMotionLike() {
    const [reduced, setReduced] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mq) return;

        const onChange = () => setReduced(!!mq.matches);
        onChange();

        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else mq.addListener(onChange);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", onChange);
            else mq.removeListener(onChange);
        };
    }, []);

    return reduced;
}

export function AboutParallaxSection({
    sectionId = "about",
    title = "About",
    subtitle = "Swiss-clean visuals. High-end motion. Built fast.",
    imageSrc, // you can ignore this now if you want, or keep as fallback
    imageAlt = "",
    accent = "rgba(255,255,255,0.10)",
    maxWidth = "max-w-7xl",
    desktopAlign = "top",
}: Props) {
    const reducedMotion = useReducedMotionLike();

    const isTouch = useMemo(() => {
        if (typeof window === "undefined") return false;
        return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }, []);

    const enablePointerParallax = !reducedMotion && !isTouch;

    // ✅ immediate, no springs
    const mx = useMotionValue(0);
    const my = useMotionValue(0);

    // ✅ this defines the coordinate system (the section area)
    const trackRef = useRef<HTMLDivElement | null>(null);

    // ✅ rAF throttle so we don’t spam motion updates
    const rafRef = useRef<number | null>(null);
    const pendingRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    React.useEffect(() => {
        if (!enablePointerParallax) return;

        const commit = () => {
            rafRef.current = null;
            mx.set(pendingRef.current.x);
            my.set(pendingRef.current.y);
        };

        const schedule = () => {
            if (rafRef.current != null) return;
            rafRef.current = requestAnimationFrame(commit);
        };

        const onPointerMove = (e: PointerEvent) => {
            const el = trackRef.current;
            if (!el) return;

            const r = el.getBoundingClientRect();
            if (r.width <= 1 || r.height <= 1) return;

            const px = (e.clientX - r.left) / r.width; // 0..1-ish
            const py = (e.clientY - r.top) / r.height; // 0..1-ish

            // ✅ NO CLAMP. Just normalize around center.
            // If cursor goes outside the rect, px/py can go <0 or >1 naturally.
            const gain = 1.6; // increase for deeper effect without clamp hacks
            let nx = (px - 0.5) * gain;
            let ny = (py - 0.5) * gain;

            // camera-style parallax invert (remove if you want same-direction)
            nx = -nx;
            ny = -ny;

            pendingRef.current.x = nx;
            pendingRef.current.y = ny;
            schedule();
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, [enablePointerParallax, mx, my]);

    // ✅ YOUR “INTERFACE”: keep EXACT order + settings (unchanged)
    const layers: ParallaxLayerConfig[] = useMemo(
        () => [
            { id: "m1", src: "/images/parallax/m1.png", depth: 0.1, scale: 2, y: 0, zIndex: 6, opacity: 1 },
            { id: "m2", src: "/images/parallax/m2.png", depth: 0.3, scale: 1.5, y: 50, zIndex: 5, opacity: 1 },
            { id: "m3", src: "/images/parallax/m3.png", depth: 0.6, scale: 1.08, y: 50, zIndex: 4, },
            { id: "m4", src: "/images/parallax/m4.png", depth: 0.8, scale: 1.06, y: 200, zIndex: 3 },
            { id: "m5", src: "/images/parallax/m5.png", depth: .9, scale: 1.04, y: 0, zIndex: 2 },
            { id: "m6", src: "/images/parallax/m6.png", depth: 1, scale: 1.02, y: 150, zIndex: 1, opacity: 1 },
        ],
        []
    );

    const bgVignette = useMemo(
        () =>
            "radial-gradient(circle at 50% 20%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.85) 100%)",
        []
    );

    return (
        <SnapSection
            sectionId={sectionId}
            title={title}
            subtitle={subtitle}
            maxWidth={maxWidth}
            desktopAlign={desktopAlign}
            className="relative"
        >
            <div ref={trackRef} className="relative h-[100svh] w-full">
                <SnapSection.Bleed id="about-bg" order={0} layer="behind">
                    <ParallaxScene
                        mx={mx}
                        my={my}
                        disabled={!enablePointerParallax}
                        strengthX={200}
                        strengthY={200}
                        depthScale={0.5}
                        layers={layers}
                    />

                    <div aria-hidden className="absolute inset-0" style={{ background: bgVignette }} />

                    <div
                        aria-hidden
                        className="absolute -inset-24 blur-[90px] opacity-55"
                        style={{ background: `radial-gradient(circle, ${accent}, transparent 62%)` }}
                    />
                </SnapSection.Bleed>
            </div>
        </SnapSection>
    );
}