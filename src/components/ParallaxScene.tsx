// src/components/ParallaxScene.tsx
"use client";

import React, { useMemo } from "react";
import { motion, type MotionValue, useMotionTemplate, useTransform } from "framer-motion";

export type ParallaxLayerConfig = {
    id: string;
    src: string;
    alt?: string;
    depth: number;

    x?: number | MotionValue<number>;
    y?: number | MotionValue<number>;
    scale?: number | MotionValue<number>;

    opacity?: number | MotionValue<number>;
    blur?: number | MotionValue<number>;

    zIndex?: number;
    blendMode?: React.CSSProperties["mixBlendMode"];
    pointerEvents?: "none" | "auto";

    poseX?: number | MotionValue<number>;
    poseY?: number | MotionValue<number>;
    poseScaleMul?: number | MotionValue<number>;
    poseOpacityMul?: number | MotionValue<number>;
    poseBlurAdd?: number | MotionValue<number>;
};

type MaybeMV = number | MotionValue<number>;
function isMV(v: MaybeMV): v is MotionValue<number> {
    return typeof v !== "number";
}

function mvConst(ref: MotionValue<number>, v: number) {
    // constant MV derived from another MV (so we don’t allocate new motion values)
    return useTransform(ref, () => v);
}

function useMaybeMV(anchor: MotionValue<number>, v: MaybeMV) {
    return isMV(v) ? v : mvConst(anchor, v);
}

function ParallaxLayer({
    L,
    mx,
    my,
    sx,
    sy,
    ds,
    bx,
    by,
    bs,
    fd,
    disabled,
}: {
    L: ParallaxLayerConfig;
    mx: MotionValue<number>;
    my: MotionValue<number>;
    sx: MotionValue<number>;
    sy: MotionValue<number>;
    ds: MotionValue<number>;
    bx: MotionValue<number>;
    by: MotionValue<number>;
    bs: MotionValue<number>;
    fd: MotionValue<number>;
    disabled?: boolean;
}) {
    const Lx = useMaybeMV(mx, L.x ?? 0);
    const Ly = useMaybeMV(my, L.y ?? 0);

    const poseX = useMaybeMV(mx, L.poseX ?? 0);
    const poseY = useMaybeMV(my, L.poseY ?? 0);

    const layerOpacity = useMaybeMV(mx, L.opacity ?? 1);
    const poseOpacityMul = useMaybeMV(mx, L.poseOpacityMul ?? 1);

    const layerBlur = useMaybeMV(mx, L.blur ?? 0);
    const poseBlurAdd = useMaybeMV(mx, L.poseBlurAdd ?? 0);

    const poseScaleMul = useMaybeMV(mx, L.poseScaleMul ?? 1);
    const layerScale = useMaybeMV(mx, L.scale ?? 1);

    const x = useTransform([mx, sx, bx, Lx, poseX], ([m, s, b, local, px]) => {
        const par = disabled ? 0 : m * s * L.depth;
        return b + par + local + px;
    });

    const y = useTransform([my, sy, by, fd, Ly, poseY], ([m, s, b, drop, local, py]) => {
        const par = disabled ? 0 : m * s * L.depth;
        const extraDrop = drop * L.depth;
        return b + par + local + extraDrop + py;
    });

    const scale = useTransform([ds, bs, layerScale, poseScaleMul], ([dscale, bscale, layerBase, pMul]) => {
        const depthZoom = disabled ? 0 : Math.abs(L.depth) * dscale;
        return bscale * (layerBase + depthZoom) * pMul;
    });

    const opacity = useTransform([layerOpacity, poseOpacityMul], ([o, mul]) => o * mul);

    // Blur is expensive on mobile GPUs. Keep it optional.
    const blurPx = useTransform([layerBlur, poseBlurAdd], ([b0, b1]) => Math.max(0, b0 + b1));
    const filter = useMotionTemplate`blur(${blurPx}px)`;
    const useFilter = (L.blur ?? 0) > 0 || (L.poseBlurAdd ?? 0) > 0;

    return (
        <motion.div
            className="absolute inset-0"
            style={{
                x,
                y,
                scale,
                zIndex: L.zIndex ?? 0,
                opacity,
                filter: useFilter ? filter : undefined,

                mixBlendMode: L.blendMode,
                pointerEvents: L.pointerEvents ?? "none",

                // helps reduce flicker on mobile
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
            }}
        >
            <img
                src={L.src}
                alt={L.alt ?? ""}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
                // helps avoid decode stutter
                decoding="async"
                loading="eager"
            />
        </motion.div>
    );
}

export function ParallaxScene({
    mx,
    my,
    layers,
    disabled,
    className,
    strengthX = 40,
    strengthY = 22,
    depthScale = 0.02,
    baseX = 0,
    baseY = 0,
    baseScale = 1,
    frontDrop = 0,
}: {
    mx: MotionValue<number>;
    my: MotionValue<number>;
    layers: ParallaxLayerConfig[];
    disabled?: boolean;
    className?: string;

    strengthX?: MaybeMV;
    strengthY?: MaybeMV;
    depthScale?: MaybeMV;

    baseX?: MaybeMV;
    baseY?: MaybeMV;
    baseScale?: MaybeMV;

    frontDrop?: MaybeMV;
}) {
    const sx = useMaybeMV(mx, strengthX);
    const sy = useMaybeMV(my, strengthY);
    const ds = useMaybeMV(mx, depthScale);

    const bx = useMaybeMV(mx, baseX);
    const by = useMaybeMV(my, baseY);
    const bs = useMaybeMV(mx, baseScale);

    const fd = useMaybeMV(my, frontDrop);

    const stableLayers = useMemo(() => layers, [layers]);

    return (
        <div className={["absolute inset-0", className].filter(Boolean).join(" ")}>
            {stableLayers.map((L) => (
                <ParallaxLayer
                    key={L.id}
                    L={L}
                    mx={mx}
                    my={my}
                    sx={sx}
                    sy={sy}
                    ds={ds}
                    bx={bx}
                    by={by}
                    bs={bs}
                    fd={fd}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}