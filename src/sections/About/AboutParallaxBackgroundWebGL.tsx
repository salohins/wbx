"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

type ScrollPoseState = {
    activeIndex: number;
    between: number; // 0..1
    sectionId?: string;
};

export type ParallaxPose = {
    baseX: number;
    baseY: number;
    baseScale: number;

    gain: number;
    strengthX: number;
    strengthY: number;

    depthScale: number;
    frontDrop: number;

    layerOverrides?: Array<{
        id: string;
        x?: number;
        y?: number;
        scale?: number;
        opacity?: number;
        blur?: number; // ignored here
    }>;
};

type LayerDef = {
    id: string;
    src: string;
    depth: number;
    baseScale: number;
    baseY: number;
    zIndex: number;
    baseOpacity?: number;
};

function smoothstep01(x: number) {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
}

function useReducedMotionLike() {
    const [reduced, setReduced] = React.useState(false);
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mq) return;
        const onChange = () => setReduced(!!mq.matches);
        onChange();
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);
    return reduced;
}

function getOv(p: ParallaxPose | undefined, id: string) {
    const o = p?.layerOverrides?.find((x) => x.id === id);
    return {
        x: o?.x ?? 0,
        y: o?.y ?? 0,
        scale: o?.scale ?? 1,
        opacity: o?.opacity ?? 1,
    };
}

/** DOM-like `object-cover` without resizing geometry: crop via texture repeat/offset. */
function applyTextureCover(tex: THREE.Texture, viewW: number, viewH: number) {
    const img: any = tex.image;
    const imgW = img?.width;
    const imgH = img?.height;
    if (!imgW || !imgH || !viewW || !viewH) return;

    const viewAspect = viewW / viewH;
    const imgAspect = imgW / imgH;

    tex.repeat.set(1, 1);
    tex.offset.set(0, 0);

    if (imgAspect > viewAspect) {
        // wider -> crop left/right
        const rx = viewAspect / imgAspect;
        tex.repeat.set(rx, 1);
        tex.offset.set((1 - rx) / 2, 0);
    } else {
        // taller -> crop top/bottom
        const ry = imgAspect / viewAspect;
        tex.repeat.set(1, ry);
        tex.offset.set(0, (1 - ry) / 2);
    }

    tex.needsUpdate = true;
}

/** Touch-primary detection ONLY for disabling pointer parallax (not for picking mobile assets). */
function detectTouchPrimary() {
    if (typeof window === "undefined") return false;

    const mqCoarse = window.matchMedia?.("(pointer: coarse)");
    const mqNoHover = window.matchMedia?.("(hover: none)");
    const hasTouchPoints = (navigator.maxTouchPoints ?? 0) > 0;

    return !!mqCoarse?.matches && !!mqNoHover?.matches && hasTouchPoints;
}

/** ✅ Breakpoint-based mobile detection for assets/poses. */
const MOBILE_BP = 900; // tweak: 768 / 820 / 900
function detectMobileViewport() {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BP;
}

function pickSrc(id: string, isMobile: boolean) {
    return isMobile ? `/images/parallax/mobile/${id}.png` : `/images/parallax/${id}.png`;
}

function Scene({
    poseRef,
    poses,
    layers,
    enablePointer,
}: {
    poseRef: React.RefObject<ScrollPoseState>;
    poses: ParallaxPose[];
    layers: LayerDef[];
    enablePointer: boolean;
}) {
    const { camera, gl, size } = useThree();

    const urls = useMemo(() => layers.map((l) => l.src), [layers]);
    const maps = useLoader(THREE.TextureLoader, urls);

    // Setup textures once loaded
    useEffect(() => {
        const maxAniso = gl.capabilities.getMaxAnisotropy();

        for (const tex of maps) {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;

            // mipmaps + better minification for crispness
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;

            tex.anisotropy = Math.min(8, maxAniso);
            tex.needsUpdate = true;
        }
    }, [gl, maps]);

    // cover crop
    useEffect(() => {
        for (const tex of maps) applyTextureCover(tex, size.width, size.height);
    }, [maps, size.width, size.height]);

    // Ortho camera where 1 unit = 1 pixel
    useEffect(() => {
        const cam = camera as THREE.OrthographicCamera;
        cam.left = -size.width / 2;
        cam.right = size.width / 2;
        cam.top = size.height / 2;
        cam.bottom = -size.height / 2;
        cam.near = -2000;
        cam.far = 2000;
        cam.position.set(0, 0, 10);
        cam.updateProjectionMatrix();
    }, [camera, size]);

    // Pointer normalized -0.5..0.5
    const mx = useRef(0);
    const my = useRef(0);

    useEffect(() => {
        if (!enablePointer) {
            mx.current = 0;
            my.current = 0;
            return;
        }

        const onMove = (e: PointerEvent) => {
            // ✅ hard block any touch/pen movement
            if (e.pointerType !== "mouse") return;

            const px = e.clientX / Math.max(1, window.innerWidth);
            const py = e.clientY / Math.max(1, window.innerHeight);
            mx.current = px - 0.5;
            my.current = py - 0.5;
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [enablePointer]);

    const meshRefs = useRef<Record<string, THREE.Mesh | null>>({});

    useFrame((state) => {
        if (!poses.length) return;

        const idxRaw = poseRef.current?.activeIndex ?? 0;
        const betweenRaw = poseRef.current?.between ?? 0;

        const idx = Math.max(0, Math.min(idxRaw, poses.length - 1));
        const between = smoothstep01(betweenRaw);

        const a = poses[idx];
        const b = poses[Math.min(idx + 1, poses.length - 1)];
        const lerp = (aa: number, bb: number) => aa + (bb - aa) * between;

        const baseX = lerp(a.baseX, b.baseX);
        const baseY = lerp(a.baseY, b.baseY);
        const baseScale = lerp(a.baseScale, b.baseScale);

        const strengthX = lerp(a.strengthX, b.strengthX);
        const strengthY = lerp(a.strengthY, b.strengthY);
        const gain = lerp(a.gain, b.gain);

        const depthScale = lerp(a.depthScale, b.depthScale);
        const frontDrop = lerp(a.frontDrop, b.frontDrop);

        const mX = enablePointer ? -mx.current * gain : 0;
        const mY = enablePointer ? -my.current * gain : 0;

        // global camera drift (stable)
        const cam = state.camera as THREE.OrthographicCamera;
        cam.position.x = baseX + mX * strengthX * 0.25;
        cam.position.y = -(baseY + mY * strengthY * 0.25);
        cam.updateMatrixWorld();

        // per-layer parallax (no snapping)
        for (const L of layers) {
            const mesh = meshRefs.current[L.id];
            if (!mesh) continue;

            const aOv = getOv(a, L.id);
            const bOv = getOv(b, L.id);

            const ovX = lerp(aOv.x, bOv.x);
            const ovY = lerp(aOv.y, bOv.y);
            const ovS = lerp(aOv.scale, bOv.scale);
            const ovO = lerp(aOv.opacity, bOv.opacity);

            const parX = mX * strengthX * L.depth;
            const parY = mY * strengthY * L.depth;

            const depthZoom = Math.abs(L.depth) * depthScale;
            const drop = frontDrop * L.depth;

            mesh.position.x = parX + ovX;
            mesh.position.y = -(L.baseY + drop + ovY) + -parY;

            const s = baseScale * (L.baseScale + depthZoom) * ovS;
            mesh.scale.setScalar(s);

            const mat = mesh.material as THREE.MeshBasicMaterial;
            mat.opacity = (L.baseOpacity ?? 1) * ovO;
        }
    });

    return (
        <>
            {layers.map((L, i) => {
                const map = maps[i];
                const z = i * 0.01;

                return (
                    <mesh
                        key={L.id}
                        ref={(m) => {
                            meshRefs.current[L.id] = m;
                        }}
                        position={[0, 0, z]}
                    >
                        <planeGeometry args={[size.width, size.height]} />
                        <meshBasicMaterial
                            transparent
                            depthWrite={false}
                            depthTest={false}
                            map={map}
                            opacity={L.baseOpacity ?? 1}
                        />
                    </mesh>
                );
            })}
        </>
    );
}

export type AboutParallaxBackgroundWebGLProps = {
    poseRef: React.RefObject<ScrollPoseState>;

    /** default (desktop) poses */
    poses?: ParallaxPose[];

    /** optional mobile-specific poses */
    mobilePoses?: ParallaxPose[];

    active?: boolean;
};

export function AboutParallaxBackgroundWebGL({
    poseRef,
    poses: posesProp,
    mobilePoses,
    active = true,
}: AboutParallaxBackgroundWebGLProps) {
    const reducedMotion = useReducedMotionLike();
    const enable = active && !reducedMotion;

    // ✅ separate concerns:
    // - isMobileViewport => assets + poses
    // - touchPrimary     => disable pointer parallax
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [touchPrimary, setTouchPrimary] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mqCoarse = window.matchMedia?.("(pointer: coarse)");
        const mqNoHover = window.matchMedia?.("(hover: none)");

        const update = () => {
            setIsMobileViewport(detectMobileViewport());
            setTouchPrimary(detectTouchPrimary());
        };

        update();
        mqCoarse?.addEventListener?.("change", update);
        mqNoHover?.addEventListener?.("change", update);
        window.addEventListener("resize", update);

        return () => {
            mqCoarse?.removeEventListener?.("change", update);
            mqNoHover?.removeEventListener?.("change", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    const enablePointer = enable && !touchPrimary;

    // ✅ pick the correct pose set by viewport breakpoint
    const poses = useMemo(() => {
        const desktop = posesProp ?? [];
        const mobile = mobilePoses ?? desktop;
        return isMobileViewport ? mobile : desktop;
    }, [posesProp, mobilePoses, isMobileViewport]);

    // ✅ load correct textures by viewport breakpoint
    const layers: LayerDef[] = useMemo(
        () => [
            { id: "m1", src: pickSrc("m1", isMobileViewport), depth: 0.1, baseScale: 1.5, baseY: 0, zIndex: 6, baseOpacity: 1 },
            { id: "m2", src: pickSrc("m2", isMobileViewport), depth: 0.35, baseScale: 1.5, baseY: 50, zIndex: 5, baseOpacity: 1 },
            { id: "m3", src: pickSrc("m3", isMobileViewport), depth: 0.6, baseScale: 1.0, baseY: 50, zIndex: 4 },
            { id: "m4", src: pickSrc("m4", isMobileViewport), depth: 0.9, baseScale: 1.06, baseY: 200, zIndex: 3 },
            { id: "m5", src: pickSrc("m5", isMobileViewport), depth: 1.2, baseScale: 1.0, baseY: 0, zIndex: 2 },
            { id: "m6", src: pickSrc("m6", isMobileViewport), depth: 1.4, baseScale: 1.0, baseY: 150, zIndex: 1, baseOpacity: 1 },
        ],
        [isMobileViewport]
    );

    const sortedLayers = useMemo(() => {
        return [...layers].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    }, [layers]);

    if (!enable) return null;

    const nativeDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const dpr = Math.min(2, nativeDpr);

    return (
        <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <Canvas
                orthographic
                dpr={dpr}
                gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: "high-performance",
                }}
                frameloop="always"
                events={null as any}
                onCreated={(state) => {
                    state.gl.setClearColor(0x000000, 0);
                    state.gl.outputColorSpace = THREE.SRGBColorSpace;

                    state.events?.disconnect?.();
                    const el = state.gl.domElement;
                    el.style.pointerEvents = "none";
                    el.style.touchAction = "none";
                }}
            >
                <Suspense fallback={null}>
                    <Scene poseRef={poseRef} poses={poses} layers={sortedLayers} enablePointer={enablePointer} />
                </Suspense>
            </Canvas>
        </div>
    );
}