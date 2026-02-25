// src/canvas/HeroCanvas.tsx
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import * as THREE from "three";
import Hero3DModel from "./Hero3D";
import { useScreenScrollRef } from "../../app/ScreenScrollContext";

type ScrollPoseState = {
  activeIndex: number;
  between: number; // 0..1
  sectionId: string;
};

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/* ------------------------------------------------------------------
   QUALITY HEURISTICS (aggressive)
------------------------------------------------------------------ */
function getDeviceTier() {
  const nav = navigator as any;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4; // GB (may be undefined)
  const dpr = window.devicePixelRatio ?? 1;

  const veryLow =
    (memory && memory <= 4) ||
    cores <= 4 ||
    (dpr >= 2 && memory && memory <= 6);

  const medium =
    !veryLow && ((memory && memory <= 8) || cores <= 6);

  return veryLow ? "low" : medium ? "mid" : "high";
}

/* ------------------------------------------------------------------
   FPS MONITOR: auto-degrade if FPS tanks
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
   RADIAL SPRITE GLOW TEXTURE
------------------------------------------------------------------ */
function useRadialGlowTexture(size: number) {
  return useMemo(() => {
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
  }, [size]);
}

function BottomRedGlow({ groupRef, quality }: { groupRef: React.RefObject<THREE.Group>; quality: "high" | "mid" | "low" }) {
  useRadialGlowTexture(quality === "low" ? 128 : quality === "mid" ? 192 : 256);

  const { camera, viewport } = useThree();

  const camPos = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(() => {
    if (!groupRef.current) return;

    camera.getWorldPosition(camPos);
    camera.getWorldDirection(forward);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);

    const bottomY = -(viewport.height / 2) + 0.55;

    groupRef.current.position.copy(camPos);
    groupRef.current.position.addScaledVector(forward, 4.0);
    groupRef.current.position.addScaledVector(up, bottomY);
  });

  return <group ref={groupRef} />;
}

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
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------
   MAIN
------------------------------------------------------------------ */
export function HeroCanvas() {
  const glowRef = useRef<THREE.Group>(null);

  const containerRef = useScreenScrollRef();
  const poseRef = useRef<ScrollPoseState>({ activeIndex: 0, between: 0, sectionId: "hero" });

  const initialTier = useMemo<"high" | "mid" | "low">(() => {
    if (typeof window === "undefined") return "high";
    return getDeviceTier() as any;
  }, []);

  const forceLow = useFpsDegrade(true);
  const quality: "high" | "mid" | "low" = forceLow ? "low" : initialTier;

  const dpr = quality === "low" ? 0.75 : quality === "mid" ? 1 : 1.5;

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let raf = 0;

    // Cache sections from the real DOM (works on desktop AND mobile slider)
    const readSectionsFromDocument = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
      return nodes.map((el) => ({
        el,
        id: el.getAttribute("data-section") || "unknown",
      }));
    };

    // ✅ Virtual pose from progress (mobile slider)
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
          poseRef.current.sectionId = sections[0]?.id ?? "hero";
          return;
        }

        const idxFloat = progress * (count - 1);
        const idx = Math.max(0, Math.min(count - 1, Math.floor(idxFloat)));
        const between = clamp01(idxFloat - idx);

        poseRef.current.activeIndex = idx;
        poseRef.current.between = idx === count - 1 ? 0 : between;
        poseRef.current.sectionId = sections[idx]?.id ?? "unknown";
      };

      // Initialize
      onProgress(new CustomEvent("snap:progress", { detail: { progress: 0 } }));

      window.addEventListener("resize", recompute, { passive: true });
      window.addEventListener("snap:progress", onProgress as any);

      cleanup = () => {
        window.removeEventListener("resize", recompute as any);
        window.removeEventListener("snap:progress", onProgress as any);
      };
    };

    // ✅ Real scroll container mode (desktop)
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

      window.addEventListener("resize", compute, { passive: true });
      container.addEventListener("scroll", onScroll, { passive: true });

      cleanup = () => {
        window.removeEventListener("resize", compute as any);
        container.removeEventListener("scroll", onScroll as any);
      };
    };

    const tryAttach = () => {
      // If we have a real scroll container (desktop), use it.
      // Otherwise (mobile slider), use virtual progress.
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
    <Canvas
      gl={{
        antialias: quality === "high" ? true : false,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        precision: quality === "low" ? "mediump" : "highp",
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
      <BottomRedGlow groupRef={glowRef} quality={quality} />

      <ambientLight intensity={0} />
      <directionalLight position={[5, 5, 3]} intensity={0} />
      <pointLight position={[0, -3.2, 2]} intensity={0} color="#ff1a1a" />

      <Suspense fallback={null}>
        <Hero3DModel poseRef={poseRef} />
      </Suspense>

      {quality === "high" ? (
        <EffectComposer multisampling={0}>
          <SelectiveBloom
            selection={glowRef}
            intensity={2.5}
            luminanceThreshold={0.12}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}