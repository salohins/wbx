// src/canvas/HeroCanvas.tsx
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import * as THREE from "three";
import Hero3DModel from "./Hero3D";
import { useScreenScrollRef } from "../../app/ScreenScrollContext";

type ScrollPoseState = {
    activeIndex: number; // section index
    between: number; // 0..1 blend to next section
    sectionId: string; // debug
};

function clamp01(n: number) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
}

/* ------------------------------------------------------------------
    RADIAL SPRITE GLOW
------------------------------------------------------------------ */
function useRadialGlowTexture() {
    return useMemo(() => {
        const size = 512;
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d")!;

        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0.0, "rgba(255, 25, 25, 1)");
        g.addColorStop(0.22, "rgba(255, 25, 25, 0.60)");
        g.addColorStop(0.55, "rgba(255, 25, 25, 0.22)");
        g.addColorStop(1.0, "rgba(255, 25, 25, 0)");

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);

        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        return tex;
    }, []);
}

function BottomRedGlow({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) {
    const map = useRadialGlowTexture();
    const { camera, viewport } = useThree();

    useFrame(() => {
        if (!groupRef.current) return;

        const camPos = new THREE.Vector3();
        const forward = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);

        camera.getWorldPosition(camPos);
        camera.getWorldDirection(forward);
        up.applyQuaternion(camera.quaternion);

        const bottomY = -(viewport.height / 2) + 0.55;

        groupRef.current.position.copy(camPos);
        groupRef.current.position.addScaledVector(forward, 4.0);
        groupRef.current.position.addScaledVector(up, bottomY);
    });

    return (
        <group ref={groupRef}>

        </group>
    );
}

function FXBackground() {
    const group = useRef<THREE.Group>(null);

    const particles = useMemo(() => {
        const g = new THREE.BufferGeometry();
        const count = 250;
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            pos[i * 3 + 0] = (Math.random() - 0.5) * 6;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }

        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        return g;
    }, []);

    useFrame(({ clock }) => {
        if (!group.current) return;
        const t = clock.getElapsedTime();
        group.current.rotation.y = t * 0.15;
        group.current.rotation.x = Math.sin(t * 0.1) * 0.4;
    });

    return (
        <group ref={group} position={[0, 0, -3]}>
            <points geometry={particles}>
                <pointsMaterial color="#ff3d3d" size={0.035} transparent opacity={0.2} />
            </points>
        </group>
    );
}

/* ------------------------------------------------------------------
    MAIN
------------------------------------------------------------------ */
export function HeroCanvas() {
    const glowRef = useRef<THREE.Group>(null);

    // ScreenWrapper scroll container
    const containerRef = useScreenScrollRef();

    // ✅ this is the only thing the 3D model needs: where we are in section timeline
    const poseRef = useRef<ScrollPoseState>({ activeIndex: 0, between: 0, sectionId: "hero" });

    // debug throttle
    const lastLogRef = useRef(0);

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

                const scrollTop = container.scrollTop;
                const viewTop = scrollTop; // offsetTop is container-scoped already

                // Find current section by nearest offsetTop <= scrollTop
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

                const between =
                    nextTop <= curTop ? 0 : clamp01((viewTop - curTop) / (nextTop - curTop));

                poseRef.current.activeIndex = idx;
                poseRef.current.between = idx === sections.length - 1 ? 0 : between;
                poseRef.current.sectionId = cur.id;

                const now = performance.now();
                if (now - lastLogRef.current > 1000) {
                    lastLogRef.current = now;
                    console.log("[HeroCanvas] section", cur.id, "idx", idx, "between", poseRef.current.between.toFixed(3));
                }
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
    }, [containerRef]);

    return (
        <Canvas
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                preserveDrawingBuffer: true,
            }}
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.2, 12], fov: 60, near: 0.1, far: 2000 }}
            onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
                gl.autoClear = true;
            }}
        >
            <FXBackground />
            <BottomRedGlow groupRef={glowRef} />

            <ambientLight intensity={0} />
            <directionalLight position={[5, 5, 3]} intensity={0} />
            <pointLight position={[0, -3.2, 2]} intensity={0} color="#ff1a1a" />

            <Suspense fallback={null}>
                {/* ✅ one ref, no prop churn, no rerenders */}
                <Hero3DModel poseRef={poseRef} />
            </Suspense>

            <EffectComposer multisampling={0}>
                <SelectiveBloom selection={glowRef} intensity={3} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
            </EffectComposer>
        </Canvas>
    );
}
