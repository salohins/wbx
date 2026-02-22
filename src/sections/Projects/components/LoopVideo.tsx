// sections/Projects/LoopVideo.tsx
import React, { useEffect, useRef, useState } from "react";

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
}: LoopVideoProps) {
    const ref = useRef<HTMLVideoElement | null>(null);
    const [ready, setReady] = useState(false);

    // Reset readiness when src changes (prevents showing old frame)
    useEffect(() => {
        setReady(false);
    }, [src]);

    // Try to start playback when mounted / when src changes
    useEffect(() => {
        const v = ref.current;
        if (!v) return;

        // always safe for autoplay policies
        v.muted = true;
        v.playsInline = true;

        // iOS/Safari sometimes needs load() before play() after src change
        try {
            v.load?.();
        } catch { }

        if (!autoPlay) return;

        const p = v.play();
        if (p && typeof (p as any).catch === "function") {
            (p as any).catch(() => {
                // ignore autoplay rejection — user gesture would be required
            });
        }
    }, [src, autoPlay]);

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
            // "canplay" is usually enough; "canplaythrough" can be flaky on mobile
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
