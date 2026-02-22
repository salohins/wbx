// sections/About/AboutParallaxBackground.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { motionValue, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ParallaxScene, type ParallaxLayerConfig } from "../../components/ParallaxScene";

type ScrollPoseState = {
    activeIndex: number;
    between: number; // 0..1
    sectionId?: string;
};

export type ParallaxPose = {
    baseX: number; // px
    baseY: number; // px
    baseScale: number; // zoom

    gain: number; // mouse sensitivity multiplier
    strengthX: number; // px
    strengthY: number; // px

    depthScale: number; // extra depth zoom feel
    frontDrop: number; // pushes near layers down more

    layerOverrides?: Array<{
        id: string;
        x?: number;
        y?: number;
        scale?: number; // 1 = no change
        opacity?: number; // 1 = no change
        blur?: number; // 0 = no change
    }>;
};

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

function smoothstep01(x: number) {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
}

function damp(current: number, target: number, lambda: number, dt: number) {
    const k = 1 - Math.exp(-lambda * dt);
    return current + (target - current) * k;
}

type LayerChannels = {
    x: MotionValue<number>;
    y: MotionValue<number>;
    scale: MotionValue<number>;
    opacity: MotionValue<number>;
    blur: MotionValue<number>;
};

function getOv(p: ParallaxPose | undefined, id: string) {
    const o = p?.layerOverrides?.find((x) => x.id === id);
    return {
        x: o?.x ?? 0,
        y: o?.y ?? 0,
        scale: o?.scale ?? 1,
        opacity: o?.opacity ?? 1,
        blur: o?.blur ?? 0,
    };
}

export type AboutParallaxBackgroundProps = {
    poseRef: React.RefObject<ScrollPoseState>;
    poses?: ParallaxPose[];

    accent?: string;
    trackRef?: React.RefObject<HTMLElement>;

    active?: boolean;
    enterMs?: number;

    fovFromScale?: number; // e.g. 0.86
};

export function AboutParallaxBackground({
    poseRef,
    poses: posesProp,
    accent = "rgba(255,255,255,0.10)",
    trackRef,
    active = true,
    enterMs = 750,
    fovFromScale = 0.86,
}: AboutParallaxBackgroundProps) {
    const reducedMotion = useReducedMotionLike();

    const isTouch = useMemo(() => {
        if (typeof window === "undefined") return false;
        return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }, []);

    const enable = active && !reducedMotion;
    const enablePointer = enable && !isTouch; // ✅ disable finger-driven parallax

    // raw normalized mouse around center
    const mxRaw = useMotionValue(0);
    const myRaw = useMotionValue(0);

    // pose/camera motion values (scroll-driven)
    const baseX = useMotionValue(0);
    const baseY = useMotionValue(0);
    const baseScale = useMotionValue(1);

    const gainMV = useMotionValue(1.6);
    const strengthX = useMotionValue(200);
    const strengthY = useMotionValue(200);
    const depthScale = useMotionValue(0.5);
    const frontDrop = useMotionValue(0);

    // entrance controls
    const entering = useRef(false);
    const enterT = useMotionValue(1); // 0..1
    const fog = useMotionValue(0.0); // 0..1

    // final mouse after gain + invert (camera style)
    const mx = useTransform([mxRaw, gainMV], ([m, g]) => -m * g);
    const my = useTransform([myRaw, gainMV], ([m, g]) => -m * g);

    // track against viewport OR provided trackRef
    const localTrackRef = useRef<HTMLDivElement | null>(null);
    const targetRef = (trackRef as React.RefObject<HTMLElement | null>) ?? localTrackRef;

    // rAF throttle pointer updates
    const rafMouse = useRef<number | null>(null);
    const pendingMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // ✅ If pointer parallax disabled (mobile), hard reset to center so nothing drifts
    useEffect(() => {
        if (enablePointer) return;
        mxRaw.set(0);
        myRaw.set(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enablePointer]);

    useEffect(() => {
        if (!enablePointer) return;

        const commit = () => {
            rafMouse.current = null;
            mxRaw.set(pendingMouse.current.x);
            myRaw.set(pendingMouse.current.y);
        };

        const schedule = () => {
            if (rafMouse.current != null) return;
            rafMouse.current = requestAnimationFrame(commit);
        };

        const onPointerMove = (e: PointerEvent) => {
            const el = targetRef.current;
            const r =
                el?.getBoundingClientRect() ?? {
                    left: 0,
                    top: 0,
                    width: window.innerWidth || 1,
                    height: window.innerHeight || 1,
                };

            if (r.width <= 1 || r.height <= 1) return;

            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;

            pendingMouse.current.x = px - 0.5;
            pendingMouse.current.y = py - 0.5;
            schedule();
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            if (rafMouse.current != null) cancelAnimationFrame(rafMouse.current);
        };
    }, [enablePointer, mxRaw, myRaw, targetRef]);

    // ✅ BASE LAYERS (unchanged order + settings)
    const baseLayers: ParallaxLayerConfig[] = useMemo(
        () => [
            { id: "m1", src: "/images/parallax/m1.png", depth: 0.1, scale: 1.5, y: 0, zIndex: 6, opacity: 1 },
            { id: "m2", src: "/images/parallax/m2.png", depth: 0.35, scale: 1.5, y: 50, zIndex: 5, opacity: 1 },
            { id: "m3", src: "/images/parallax/m3.png", depth: 0.6, scale: 1, y: 50, zIndex: 4 },
            { id: "m4", src: "/images/parallax/m4.png", depth: 0.9, scale: 1.06, y: 200, zIndex: 3 },
            { id: "m5", src: "/images/parallax/m5.png", depth: 1.2, scale: 1, y: 0, zIndex: 2 },
            { id: "m6", src: "/images/parallax/m6.png", depth: 1.4, scale: 1, y: 150, zIndex: 1, opacity: 1 },
        ],
        []
    );

    const poses = posesProp ?? [];

    const layerMVsRef = useRef<Map<string, LayerChannels> | null>(null);

    if (!layerMVsRef.current) {
        const map = new Map<string, LayerChannels>();
        for (const l of baseLayers) {
            map.set(l.id, {
                x: motionValue(0),
                y: motionValue(0),
                scale: motionValue(1),
                opacity: motionValue(1),
                blur: motionValue(0),
            });
        }
        layerMVsRef.current = map;
    } else {
        for (const l of baseLayers) {
            if (!layerMVsRef.current.has(l.id)) {
                layerMVsRef.current.set(l.id, {
                    x: motionValue(0),
                    y: motionValue(0),
                    scale: motionValue(1),
                    opacity: motionValue(1),
                    blur: motionValue(0),
                });
            }
        }
    }

    const posedLayers: ParallaxLayerConfig[] = useMemo(() => {
        const map = layerMVsRef.current!;
        return baseLayers.map((l) => {
            const mv = map.get(l.id);
            if (!mv) return l;

            return {
                ...l,
                poseX: mv.x,
                poseY: mv.y,
                poseScaleMul: mv.scale,
                poseOpacityMul: mv.opacity,
                poseBlurAdd: mv.blur,
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseLayers]);

    useEffect(() => {
        if (!active) return;

        entering.current = true;
        enterT.set(0);
        fog.set(0);

        let raf = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const p = Math.min(1, (now - start) / Math.max(1, enterMs));
            const s = smoothstep01(p);

            enterT.set(s);

            const fogVal = 0.15 + 0.55 * Math.sin(Math.PI * s);
            fog.set(fogVal);

            if (p < 1) raf = requestAnimationFrame(tick);
            else entering.current = false;
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [active, enterMs, enterT, fog]);

    useEffect(() => {
        if (!enable) return;

        const hasPoses = poses.length > 0;

        let raf = 0;
        let last = performance.now();

        const tick = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            const tEnter = enterT.get();
            const enterMix = entering.current ? tEnter : 1;

            if (!hasPoses) {
                raf = requestAnimationFrame(tick);
                return;
            }

            const idxRaw = poseRef.current?.activeIndex ?? 0;
            const betweenRaw = poseRef.current?.between ?? 0;

            const idx = Math.max(0, Math.min(idxRaw, poses.length - 1));
            const between = smoothstep01(betweenRaw);

            const a = poses[idx];
            const b = poses[Math.min(idx + 1, poses.length - 1)];

            const lerp = (aa: number, bb: number) => aa + (bb - aa) * between;

            const tx = lerp(a.baseX, b.baseX);
            const ty = lerp(a.baseY, b.baseY);
            const ts = lerp(a.baseScale, b.baseScale);

            const tg = lerp(a.gain, b.gain);
            const sX = lerp(a.strengthX, b.strengthX);
            const sY = lerp(a.strengthY, b.strengthY);
            const dS = lerp(a.depthScale, b.depthScale);
            const fD = lerp(a.frontDrop, b.frontDrop);

            // FOV entrance: only scale transitions
            const nBaseX = tx;
            const nBaseY = ty;
            const nScale = fovFromScale;

            const mix = (from: number, to: number) => from + (to - from) * enterMix;

            baseX.set(damp(baseX.get(), nBaseX, 10, dt));
            baseY.set(damp(baseY.get(), nBaseY, 10, dt));
            baseScale.set(damp(baseScale.get(), mix(nScale, ts), 10, dt));

            gainMV.set(damp(gainMV.get(), tg, 10, dt));
            strengthX.set(damp(strengthX.get(), sX, 10, dt));
            strengthY.set(damp(strengthY.get(), sY, 10, dt));
            depthScale.set(damp(depthScale.get(), dS, 10, dt));
            frontDrop.set(damp(frontDrop.get(), fD, 10, dt));

            const map = layerMVsRef.current!;
            for (const l of baseLayers) {
                const mv = map.get(l.id);
                if (!mv) continue;

                const aOv = getOv(a, l.id);
                const bOv = getOv(b, l.id);

                const ox = lerp(aOv.x, bOv.x);
                const oy = lerp(aOv.y, bOv.y);
                const os = lerp(aOv.scale, bOv.scale);
                const oo = lerp(aOv.opacity, bOv.opacity);
                const ob = lerp(aOv.blur, bOv.blur);

                const lx = mix(0, ox);
                const ly = mix(0, oy);
                const ls = mix(1, os);
                const lo = mix(1, oo);
                const lb = mix(0, ob);

                mv.x.set(damp(mv.x.get(), lx, 10, dt));
                mv.y.set(damp(mv.y.get(), ly, 10, dt));
                mv.scale.set(damp(mv.scale.get(), ls, 10, dt));
                mv.opacity.set(damp(mv.opacity.get(), lo, 10, dt));
                mv.blur.set(damp(mv.blur.get(), lb, 10, dt));
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [
        enable,
        poseRef,
        poses,
        baseLayers,
        baseX,
        baseY,
        baseScale,
        gainMV,
        strengthX,
        strengthY,
        depthScale,
        frontDrop,
        enterT,
        fovFromScale,
    ]);

    const fogOpacity = useTransform(fog, (v) => Math.max(0, Math.min(1, v)));

    return (
        <div ref={localTrackRef} aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
            <ParallaxScene
                mx={mx}
                my={my}
                disabled={!enable}
                layers={posedLayers}
                strengthX={strengthX}
                strengthY={strengthY}
                depthScale={depthScale}
                baseX={baseX}
                baseY={baseY}
                baseScale={baseScale}
                frontDrop={frontDrop}
            />

            {/* fog / mist */}
            <div
                className="absolute inset-0 blur-[18px]"
                style={{
                    opacity: fogOpacity as any,
                    background:
                        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10), transparent 55%)," +
                        "radial-gradient(circle at 70% 45%, rgba(255,255,255,0.08), transparent 60%)," +
                        "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.30))",
                }}
            />

            {/* accent glow */}
            <div
                className="absolute -inset-24 blur-[90px] opacity-55"
                style={{ background: `radial-gradient(circle, ${accent}, transparent 62%)` }}
            />
        </div>
    );
}