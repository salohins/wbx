import React, { useEffect, useRef, useState } from "react";

type LoopVideoProps = {
  src: string;
  poster?: string;
  type?: string;
  className?: string;
  objectClassName?: string;
  onReady?: () => void;
  onError?: () => void;
  fadeMs?: number;
  autoPlay?: boolean;
  playWhenVisible?: boolean;
  visibilityThreshold?: number;
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
  playWhenVisible = true,
  visibilityThreshold = 0.35,
}: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [isVisible, setIsVisible] = useState(!playWhenVisible);

  useEffect(() => {
    setReady(false);
  }, [src]);

  useEffect(() => {
    if (!playWhenVisible) return;

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= visibilityThreshold);
      },
      {
        threshold: [0, visibilityThreshold, 0.6, 1],
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [playWhenVisible, visibilityThreshold]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = true;

    try {
      v.load?.();
    } catch { }

    const shouldPlay = autoPlay && (!playWhenVisible || isVisible);

    if (shouldPlay) {
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => { });
      }
    } else {
      v.pause();
    }
  }, [src, autoPlay, playWhenVisible, isVisible]);

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
      autoPlay={autoPlay}
      loop
      muted
      playsInline
      controls={false}
      preload="metadata"
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