// sections/Projects/LoopVideo.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type LoopVideoProps = {
  src: string;
  poster?: string;
  type?: string; // default "video/mp4"
  className?: string; // extra classes on <video>
  objectClassName?: string; // object-fit/pos classes
  onReady?: () => void;
  onError?: () => void;

  /** optional: control fade timing */
  fadeMs?: number; // default 500
  /** optional: if you ever want to disable autoplay externally */
  autoPlay?: boolean; // default true

  /** ✅ NEW: force pause (e.g. when offscreen) */
  paused?: boolean;

  /** ✅ NEW: reduce work when paused */
  unloadWhenPaused?: boolean; // default true
};

export function LoopVideo({
  src,
  poster,
  type = "video/mp4",
  className,
  objectClassName = "object-cover object-center",
  onReady,
  onError,
  fadeMs = 500,
  autoPlay = true,
  paused = false,
  unloadWhenPaused = true,
}: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  // Track tab visibility (pause in background tabs)
  const [tabHidden, setTabHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setTabHidden(document.visibilityState === "hidden");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Effective pause state
  const shouldPause = paused || tabHidden || !autoPlay;

  // Reset readiness when src changes
  useEffect(() => {
    setReady(false);
  }, [src]);

  // (Optional) drop network/decode load when paused by swapping preload
  // Note: browsers may not fully "unload" a video without removing src,
  // but preload=none + pause is still a big win.
  const preload = useMemo(() => {
    if (!unloadWhenPaused) return "metadata";
    return shouldPause ? "none" : "metadata";
  }, [shouldPause, unloadWhenPaused]);

  // Apply src / load / play-pause logic
  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // autoplay-safe defaults
    v.muted = true;
    v.playsInline = true;

    // iOS/Safari: load() helps after src changes
    try {
      v.load?.();
    } catch {}

    // If we should pause: pause immediately and exit
    if (shouldPause) {
      try {
        v.pause();
      } catch {}
      return;
    }

    // Try to play when active
    const p = v.play();
    if (p && typeof (p as any).catch === "function") {
      (p as any).catch(() => {
        // ignore autoplay rejection — user gesture would be required
      });
    }
  }, [src, shouldPause]);

  // Extra safety: if paused changes while mounted, pause/resume instantly
  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    if (shouldPause) {
      try {
        v.pause();
      } catch {}
      return;
    }

    const p = v.play();
    if (p && typeof (p as any).catch === "function") (p as any).catch(() => {});
  }, [shouldPause]);

  return (
    <video
      ref={ref}
      className={[
        "h-full w-full",
        objectClassName,
        "transition-opacity",
        ready ? "opacity-100" : "opacity-0",
        className ?? "",
      ].join(" ")}
      style={{ transitionDuration: `${fadeMs}ms` }}
      poster={poster}
      autoPlay={!shouldPause} // ✅ don’t advertise autoplay when paused
      loop
      muted
      playsInline
      controls={false}
      preload={preload as any}
      disablePictureInPicture
      onCanPlay={() => {
        setReady(true);
        onReady?.();
      }}
      onError={() => {
        onError?.();
      }}
    >
      <source src={src} type={type} />
    </video>
  );
}