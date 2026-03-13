// src/canvas/HeroCanvas.tsx
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Hero3DModel from "./Hero3D";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useScreenScrollRef } from "../../app/ScreenScrollContext";

type ScrollPoseState = {
  activeIndex: number;
  between: number; // 0..1
  sectionId: string;
};

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function smoothstep01(x: number) {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------
   QUALITY HEURISTICS
------------------------------------------------------------------ */
function getDeviceTier() {
  const nav = navigator as any;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const dpr = window.devicePixelRatio ?? 1;

  const veryLow =
    (memory && memory <= 4) ||
    cores <= 4 ||
    (dpr >= 2 && memory && memory <= 6);

  const medium = !veryLow && ((memory && memory <= 8) || cores <= 6);

  return veryLow ? "low" : medium ? "mid" : "high";
}

/* ------------------------------------------------------------------
   FPS MONITOR
------------------------------------------------------------------ */
function useFpsDegrade(enabled: boolean) {
  const [forceLow, setForceLow] = useState(false);
  const state = useRef({ last: performance.now(), frames: 0, fps: 60 });

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;

    const tick = () => {
      const now = performance.now();
      state.current.frames += 1;

      const dt = now - state.current.last;
      if (dt >= 1000) {
        const fps = (state.current.frames * 1000) / dt;
        state.current.fps = fps;
        state.current.frames = 0;
        state.current.last = now;

        if (fps < 45) setForceLow(true);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  return forceLow;
}

/* ------------------------------------------------------------------
   FX BACKGROUND
------------------------------------------------------------------ */
function FXBackground({ quality }: { quality: "high" | "mid" | "low" }) {
  const group = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const g = new THREE.BufferGeometry();

    const count = quality === "low" ? 70 : quality === "mid" ? 140 : 250;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [quality]);

  const frameSkip = quality === "low" ? 2 : 1;
  const frameCount = useRef(0);

  useFrame(({ clock }) => {
    if (!group.current) return;

    frameCount.current += 1;
    if (frameSkip > 1 && frameCount.current % frameSkip !== 0) return;

    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.15;
    group.current.rotation.x = Math.sin(t * 0.1) * 0.4;
  });

  return (
    <group ref={group} position={[0, 0, -3]}>
      <points geometry={particles}>
        <pointsMaterial
          color="#ff3d3d"
          size={quality === "low" ? 0.028 : 0.033}
          transparent
          opacity={quality === "low" ? 0.12 : 0.2}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------
   RADIAL GLOW TEXTURE
------------------------------------------------------------------ */
function useRadialGlowTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;

    const size = 512;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");

    if (!ctx) return null;

    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );

    g.addColorStop(0.0, "rgba(255, 255, 255, 1)");
    g.addColorStop(0.22, "rgba(255, 255, 255, 0.60)");
    g.addColorStop(0.55, "rgba(255, 255, 255, 0.22)");
    g.addColorStop(1.0, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* ------------------------------------------------------------------
   GLOW COLORS PER SECTION
------------------------------------------------------------------ */
const GLOW_COLORS = [
  "#ff1f2d",
  "#22d3ee",
  "#ee6322",
  "#2291c5",
  "#2258ee",
  "#22c55e",
  "#ff1f2d",
] as const;

/* ------------------------------------------------------------------
   BOTTOM GLOW
------------------------------------------------------------------ */
function BottomGlow({
  groupRef,
  poseRef,
  quality,
  lightRef,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  poseRef: React.RefObject<ScrollPoseState>;
  quality: "high" | "mid" | "low";
  lightRef: React.RefObject<THREE.PointLight | null>;
}) {
  const map = useRadialGlowTexture();
  const { camera, viewport } = useThree();

  const mat1 = useRef<THREE.SpriteMaterial>(null);
  const mat2 = useRef<THREE.SpriteMaterial>(null);
  const mat3 = useRef<THREE.SpriteMaterial>(null);

  const cA = useRef(new THREE.Color());
  const cB = useRef(new THREE.Color());
  const cOut = useRef(new THREE.Color());

  const camPos = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    return () => {
      map?.dispose();
    };
  }, [map]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    camera.getWorldPosition(camPos.current);
    camera.getWorldDirection(forward.current);
    up.current.set(0, 1, 0).applyQuaternion(camera.quaternion);

    const bottomY =
      quality === "low"
        ? -(viewport.height / 2) + 0.35
        : -(viewport.height / 2) + 0.55;

    const forwardOffset =
      quality === "low" ? 3.2 : quality === "mid" ? 3.6 : 4.0;

    groupRef.current.position.copy(camPos.current);
    groupRef.current.position.addScaledVector(forward.current, forwardOffset);
    groupRef.current.position.addScaledVector(up.current, bottomY);

    const idx = poseRef.current?.activeIndex ?? 0;
    const between = smoothstep01(poseRef.current?.between ?? 0);

    const a = GLOW_COLORS[Math.min(idx, GLOW_COLORS.length - 1)];
    const b = GLOW_COLORS[Math.min(idx + 1, GLOW_COLORS.length - 1)];

    cA.current.set(a);
    cB.current.set(b);
    cOut.current.copy(cA.current).lerp(cB.current, between);

    const t = clock.getElapsedTime();
    const pulse1 = 0.94 + Math.sin(t * 1.25) * 0.05;
    const pulse2 = 0.92 + Math.sin(t * 1.55 + 0.8) * 0.08;
    const pulse3 = 0.95 + Math.sin(t * 1.05 + 1.7) * 0.06;

    if (mat1.current) {
      mat1.current.color.copy(cOut.current);
      mat1.current.opacity = (quality === "low" ? 0.08 : 0.1) * pulse1;
    }

    if (mat2.current) {
      mat2.current.color.copy(cOut.current);
      mat2.current.opacity =
        (quality === "low" ? 0.34 : quality === "mid" ? 0.42 : 0.5) * pulse2;
    }

    if (mat3.current) {
      mat3.current.color.copy(cOut.current);
      mat3.current.opacity =
        (quality === "low" ? 0.12 : quality === "mid" ? 0.16 : 0.2) * pulse3;
    }

    if (lightRef.current) {
      lightRef.current.color.copy(cOut.current);
      lightRef.current.intensity =
        quality === "low" ? 6 : quality === "mid" ? 10 : 14;
    }
  });

  if (!map) return null;

  const scale1 = quality === "low" ? [8, 8, 1] : [10, 10, 1];
  const scale2 =
    quality === "low"
      ? [15, 18, 1]
      : quality === "mid"
        ? [18, 21, 1]
        : [20, 24, 1];
  const scale3 =
    quality === "low"
      ? [22, 15, 1]
      : quality === "mid"
        ? [26, 17, 1]
        : [30, 20, 1];

  return (
    <group ref={groupRef}>
      <sprite position={[0, -5, -20]} scale={scale1 as [number, number, number]}>
        <spriteMaterial
          ref={mat1}
          map={map}
          color="#ff1f2d"
          transparent
          opacity={0.1}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      <sprite position={[0, -5, -10]} scale={scale2 as [number, number, number]}>
        <spriteMaterial
          ref={mat2}
          map={map}
          color="#ff1f2d"
          transparent
          opacity={0.5}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      <sprite position={[0, 0, -10]} scale={scale3 as [number, number, number]}>
        <spriteMaterial
          ref={mat3}
          map={map}
          color="#ff1f2d"
          transparent
          opacity={0.2}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}

/* ------------------------------------------------------------------
   MAIN
------------------------------------------------------------------ */
export function HeroCanvas() {
  const poseRef = useRef<ScrollPoseState>({
    activeIndex: 0,
    between: 0,
    sectionId: "hero",
  });

  const glowRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);
  const containerRef = useScreenScrollRef();

  const initialTier = useMemo<"high" | "mid" | "low">(() => {
    if (typeof window === "undefined") return "high";
    return getDeviceTier() as "high" | "mid" | "low";
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  const { scroll } = useScrollProgress({
    containerRef,
    axis: "y",
    raf: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(media.matches);

    update();

    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener(update);

    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener(update);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>("[data-section]")
    ).map((el) => ({
      el,
      id: el.getAttribute("data-section") || "unknown",
    }));

    if (!sections.length) {
      poseRef.current.activeIndex = 0;
      poseRef.current.between = 0;
      poseRef.current.sectionId = "hero";
      return;
    }

    let idx = 0;
    for (let i = 0; i < sections.length; i++) {
      const top = sections[i].el.offsetTop;
      if (top <= scroll + 1) idx = i;
      else break;
    }

    const cur = sections[idx];
    const next = sections[Math.min(idx + 1, sections.length - 1)];

    const curTop = cur.el.offsetTop;
    const nextTop = next.el.offsetTop;

    const between =
      nextTop <= curTop
        ? 0
        : clamp01((scroll - curTop) / (nextTop - curTop));

    poseRef.current.activeIndex = idx;
    poseRef.current.between = idx === sections.length - 1 ? 0 : between;
    poseRef.current.sectionId = cur.id;
  }, [scroll, containerRef]);

  const forceLow = useFpsDegrade(true);
  const quality: "high" | "mid" | "low" = forceLow ? "low" : initialTier;

  const dpr = quality === "low" ? 0.75 : quality === "mid" ? 0.9 : 1.5;

  return (
    <Canvas
      style={{ pointerEvents: "none" }}
      gl={{
        antialias: quality === "high",
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        precision: "highp",
      }}
      dpr={dpr}
      camera={{ position: [0, 0.2, 12], fov: 60, near: 0.1, far: 2000 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.autoClear = true;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <FXBackground quality={quality} />

      <BottomGlow
        groupRef={glowRef}
        poseRef={poseRef}
        quality={quality}
        lightRef={glowLightRef}
      />

      <pointLight
        ref={glowLightRef}
        position={[0, -3.2, 2]}
        intensity={14}
        color="#ff1a1a"
        distance={18}
        decay={2}
      />

      <Suspense fallback={null}>
        <Hero3DModel poseRef={poseRef} />
      </Suspense>
    </Canvas>
  );
}