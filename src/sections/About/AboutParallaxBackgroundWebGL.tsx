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
        blur?: number;
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

function damp(current: number, target: number, lambda: number, dt: number) {
    return THREE.MathUtils.damp(current, target, lambda, dt);
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
        const rx = viewAspect / imgAspect;
        tex.repeat.set(rx, 1);
        tex.offset.set((1 - rx) / 2, 0);
    } else {
        const ry = imgAspect / viewAspect;
        tex.repeat.set(1, ry);
        tex.offset.set(0, (1 - ry) / 2);
    }

    tex.needsUpdate = true;
}

function detectTouchPrimary() {
    if (typeof window === "undefined") return false;

    const mqCoarse = window.matchMedia?.("(pointer: coarse)");
    const mqNoHover = window.matchMedia?.("(hover: none)");
    const hasTouchPoints = (navigator.maxTouchPoints ?? 0) > 0;

    return !!mqCoarse?.matches && !!mqNoHover?.matches && hasTouchPoints;
}

const MOBILE_BP = 900;

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
    onReady,
}: {
    poseRef: React.RefObject<ScrollPoseState>;
    poses: ParallaxPose[];
    layers: LayerDef[];
    enablePointer: boolean;
    onReady?: () => void;
}) {
    const { camera, gl, size } = useThree();

    const urls = useMemo(() => layers.map((l) => l.src), [layers]);
    const maps = useLoader(THREE.TextureLoader, urls);

    const readySentRef = useRef(false);

    useEffect(() => {
        readySentRef.current = false;
    }, [urls.join("|")]);

    useEffect(() => {
        const maxAniso = gl.capabilities.getMaxAnisotropy();

        for (const tex of maps) {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = Math.min(8, maxAniso);
            tex.needsUpdate = true;
        }
    }, [gl, maps]);

    useEffect(() => {
        for (const tex of maps) applyTextureCover(tex, size.width, size.height);
    }, [maps, size.width, size.height]);

    useEffect(() => {
        const cam = camera as THREE.OrthographicCamera;
        cam.left = -size.width / 2;
        cam.right = size.width / 2;
        cam.top = size.height / 2;
        cam.bottom = -size.height / 2;
        cam.near = -2000;
        cam.far = 2000;
        cam.updateProjectionMatrix();
    }, [camera, size]);

    const mx = useRef(0);
    const my = useRef(0);

    useEffect(() => {
        if (!enablePointer) {
            mx.current = 0;
            my.current = 0;
            return;
        }

        const onMove = (e: PointerEvent) => {
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

    const baseXRef = useRef(0);
    const baseYRef = useRef(0);
    const baseScaleRef = useRef(1);
    const strengthXRef = useRef(0);
    const strengthYRef = useRef(0);
    const gainRef = useRef(1);
    const depthScaleRef = useRef(0);
    const frontDropRef = useRef(0);

    const initializedRef = useRef(false);

    const initKey = useMemo(
        () => `${layers.map((l) => l.src).join("|")}__${poses.length}__${size.width}x${size.height}`,
        [layers, poses.length, size.width, size.height]
    );

    useEffect(() => {
        initializedRef.current = false;
    }, [initKey]);

    useFrame((state, dt) => {
        if (!poses.length) return;

        const idxRaw = poseRef.current?.activeIndex ?? 0;
        const betweenRaw = poseRef.current?.between ?? 0;

        const idx = Math.max(0, Math.min(idxRaw, poses.length - 1));
        const nextIdx = Math.min(idx + 1, poses.length - 1);
        const between = smoothstep01(betweenRaw);

        const a = poses[idx];
        const b = poses[nextIdx];
        const lerp = (aa: number, bb: number) => aa + (bb - aa) * between;

        const targetBaseX = lerp(a.baseX, b.baseX);
        const targetBaseY = lerp(a.baseY, b.baseY);
        const targetBaseScale = lerp(a.baseScale, b.baseScale);
        const targetStrengthX = lerp(a.strengthX, b.strengthX);
        const targetStrengthY = lerp(a.strengthY, b.strengthY);
        const targetGain = lerp(a.gain, b.gain);
        const targetDepthScale = lerp(a.depthScale, b.depthScale);
        const targetFrontDrop = lerp(a.frontDrop, b.frontDrop);

        const cam = state.camera as THREE.OrthographicCamera;

        if (!initializedRef.current) {
            initializedRef.current = true;

            baseXRef.current = targetBaseX;
            baseYRef.current = targetBaseY;
            baseScaleRef.current = targetBaseScale;
            strengthXRef.current = targetStrengthX;
            strengthYRef.current = targetStrengthY;
            gainRef.current = targetGain;
            depthScaleRef.current = targetDepthScale;
            frontDropRef.current = targetFrontDrop;

            cam.position.set(targetBaseX, -targetBaseY, 10);
            cam.updateProjectionMatrix();
            cam.updateMatrixWorld();

            for (const L of layers) {
                const mesh = meshRefs.current[L.id];
                if (!mesh) continue;

                const aOv = getOv(a, L.id);
                const bOv = getOv(b, L.id);

                const ovX = lerp(aOv.x, bOv.x);
                const ovY = lerp(aOv.y, bOv.y);
                const ovS = lerp(aOv.scale, bOv.scale);
                const ovO = lerp(aOv.opacity, bOv.opacity);

                const depthZoom = Math.abs(L.depth) * targetDepthScale;
                const drop = targetFrontDrop * L.depth;

                mesh.position.set(ovX, -(L.baseY + drop + ovY), mesh.position.z);

                const s = targetBaseScale * (L.baseScale + depthZoom) * ovS;
                mesh.scale.setScalar(s);

                const mat = mesh.material as THREE.MeshBasicMaterial;
                mat.opacity = (L.baseOpacity ?? 1) * ovO;
            }

            if (!readySentRef.current) {
                readySentRef.current = true;
                requestAnimationFrame(() => {
                    onReady?.();
                });
            }

            return;
        }

        baseXRef.current = damp(baseXRef.current, targetBaseX, 20, dt);
        baseYRef.current = damp(baseYRef.current, targetBaseY, 20, dt);
        baseScaleRef.current = damp(baseScaleRef.current, targetBaseScale, 20, dt);

        strengthXRef.current = damp(strengthXRef.current, targetStrengthX, 20, dt);
        strengthYRef.current = damp(strengthYRef.current, targetStrengthY, 20, dt);
        gainRef.current = damp(gainRef.current, targetGain, 20, dt);

        depthScaleRef.current = damp(depthScaleRef.current, targetDepthScale, 20, dt);
        frontDropRef.current = damp(frontDropRef.current, targetFrontDrop, 20, dt);

        const baseX = baseXRef.current;
        const baseY = baseYRef.current;
        const baseScale = baseScaleRef.current;
        const strengthX = strengthXRef.current;
        const strengthY = strengthYRef.current;
        const gain = gainRef.current;
        const depthScale = depthScaleRef.current;
        const frontDrop = frontDropRef.current;

        const mX = enablePointer ? -mx.current * gain : 0;
        const mY = enablePointer ? -my.current * gain : 0;

        cam.position.x = damp(cam.position.x, baseX + mX * strengthX * 0.25, 6, dt);
        cam.position.y = damp(cam.position.y, -(baseY + mY * strengthY * 0.25), 6, dt);
        cam.updateMatrixWorld();

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

            const targetX = parX + ovX;
            const targetY = -(L.baseY + drop + ovY) - parY;
            const targetScale = baseScale * (L.baseScale + depthZoom) * ovS;
            const targetOpacity = (L.baseOpacity ?? 1) * ovO;

            mesh.position.x = damp(mesh.position.x, targetX, 8, dt);
            mesh.position.y = damp(mesh.position.y, targetY, 8, dt);

            const nextScale = damp(mesh.scale.x, targetScale, 6, dt);
            mesh.scale.setScalar(nextScale);

            const mat = mesh.material as THREE.MeshBasicMaterial;
            mat.opacity = damp(mat.opacity, targetOpacity, 6, dt);
        }
    });

    return (
        <>
            {layers.map((L, i) => {
                const map = maps[i];
                const z = i * 0.01;

                const initialPose = poses[0];
                const ov = getOv(initialPose, L.id);
                const depthZoom = Math.abs(L.depth) * initialPose.depthScale;
                const drop = initialPose.frontDrop * L.depth;

                const initialX = ov.x;
                const initialY = -(L.baseY + drop + ov.y);
                const initialScale = initialPose.baseScale * (L.baseScale + depthZoom) * ov.scale;
                const initialOpacity = (L.baseOpacity ?? 1) * ov.opacity;

                return (
                    <mesh
                        key={L.id}
                        ref={(m) => {
                            meshRefs.current[L.id] = m;
                        }}
                        position={[initialX, initialY, z]}
                        scale={[initialScale, initialScale, 1]}
                    >
                        <planeGeometry args={[size.width, size.height]} />
                        <meshBasicMaterial
                            transparent
                            depthWrite={false}
                            depthTest={false}
                            map={map}
                            opacity={initialOpacity}
                        />
                    </mesh>
                );
            })}
        </>
    );
}

export type AboutParallaxBackgroundWebGLProps = {
    poseRef: React.RefObject<ScrollPoseState>;
    poses?: ParallaxPose[];
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

    const [isMobileViewport, setIsMobileViewport] = useState(() =>
        typeof window !== "undefined" ? detectMobileViewport() : false
    );

    const [touchPrimary, setTouchPrimary] = useState(() =>
        typeof window !== "undefined" ? detectTouchPrimary() : false
    );

    const [sceneReady, setSceneReady] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mqCoarse = window.matchMedia?.("(pointer: coarse)");
        const mqNoHover = window.matchMedia?.("(hover: none)");

        const update = () => {
            setIsMobileViewport(detectMobileViewport());
            setTouchPrimary(detectTouchPrimary());
            setSceneReady(false);
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

    const poses = useMemo(() => {
        const desktop = posesProp ?? [];
        const mobile = mobilePoses ?? desktop;
        return isMobileViewport ? mobile : desktop;
    }, [posesProp, mobilePoses, isMobileViewport]);

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

    useEffect(() => {
        setSceneReady(false);
    }, [isMobileViewport, sortedLayers]);

    if (!enable) return null;

    const nativeDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const dpr = Math.min(2, nativeDpr);

    return (
        <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <div
                className="absolute inset-0"
                style={{
                    opacity: sceneReady ? 1 : 0,
                    transition: "opacity 700ms ease",
                    willChange: "opacity",
                }}
            >
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
                        <Scene
                            poseRef={poseRef}
                            poses={poses}
                            layers={sortedLayers}
                            enablePointer={enablePointer}
                            onReady={() => setSceneReady(true)}
                        />
                    </Suspense>
                </Canvas>
            </div>
        </div>
    );
}