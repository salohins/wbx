// src/components/ParallaxScene.tsx
"use client";

import React from "react";
import {
    motion,
    type MotionValue,
    useMotionTemplate,
    useTransform,
} from "framer-motion";

export type ParallaxLayerConfig = {
    id: string;
    src: string;
    alt?: string;

    depth: number; // 0..1+ (back -> front)

    /** Base/local layer offsets (static or MV) */
    x?: number | MotionValue<number>;
    y?: number | MotionValue<number>;
    scale?: number | MotionValue<number>;

    opacity?: number | MotionValue<number>;
    blur?: number | MotionValue<number>;

    zIndex?: number;
    blendMode?: React.CSSProperties["mixBlendMode"];
    pointerEvents?: "none" | "auto";

    /** ✅ Pose overrides (per-pose deltas / multipliers) */
    poseX?: number | MotionValue<number>;
    poseY?: number | MotionValue<number>;
    /** multiplier (1 = no change). Final scale = baseScale * (layerScale+depthZoom) * poseScaleMul */
    poseScaleMul?: number | MotionValue<number>;
    /** multiplier (1 = no change). Final opacity = layerOpacity * poseOpacityMul */
    poseOpacityMul?: number | MotionValue<number>;
    /** extra blur added on top of base blur */
    poseBlurAdd?: number | MotionValue<number>;
};

type MaybeMV = number | MotionValue<number>;

function isMV(v: MaybeMV): v is MotionValue<number> {
    return typeof v !== "number";
}
function asMV(v: MaybeMV): MotionValue<number> {
    return v as MotionValue<number>;
}

type Props = {
    mx: MotionValue<number>;
    my: MotionValue<number>;

    layers: ParallaxLayerConfig[];
    disabled?: boolean;
    className?: string;

    strengthX?: MaybeMV;
    strengthY?: MaybeMV;
    depthScale?: MaybeMV;

    /** pose/camera controls */
    baseX?: MaybeMV;
    baseY?: MaybeMV;
    baseScale?: MaybeMV;

    /** pushes near layers down more than far layers */
    frontDrop?: MaybeMV;
};

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
}: Props) {
    // Convert “maybe motion values” to motion values by creating transforms
    const sx = isMV(strengthX) ? asMV(strengthX) : useTransform(mx, () => strengthX);
    const sy = isMV(strengthY) ? asMV(strengthY) : useTransform(my, () => strengthY);
    const ds = isMV(depthScale) ? asMV(depthScale) : useTransform(mx, () => depthScale);

    const bx = isMV(baseX) ? asMV(baseX) : useTransform(mx, () => baseX);
    const by = isMV(baseY) ? asMV(baseY) : useTransform(my, () => baseY);
    const bs = isMV(baseScale) ? asMV(baseScale) : useTransform(mx, () => baseScale);

    const fd = isMV(frontDrop) ? asMV(frontDrop) : useTransform(my, () => frontDrop);

    // helper: turn a MaybeMV into an MV without allocating a new motion value
    // For numbers we wrap via useTransform on mx/my (constant transform).
    const mvX = (v: MaybeMV) => (isMV(v) ? asMV(v) : useTransform(mx, () => v));
    const mvY = (v: MaybeMV) => (isMV(v) ? asMV(v) : useTransform(my, () => v));

    return (
        <div className={["absolute inset-0", className].filter(Boolean).join(" ")}>
            {layers.map((L) => {
                const Lx = L.x ?? 0;
                const Ly = L.y ?? 0;

                const poseX = L.poseX ?? 0;
                const poseY = L.poseY ?? 0;

                const layerOpacity = L.opacity ?? 1;
                const poseOpacityMul = L.poseOpacityMul ?? 1;

                const layerBlur = L.blur ?? 0;
                const poseBlurAdd = L.poseBlurAdd ?? 0;

                const poseScaleMul = L.poseScaleMul ?? 1;

                // ✅ x/y from: base pan + mouse parallax + local offsets + pose deltas
                const x = useTransform([mx, sx, bx, mvX(Lx), mvX(poseX)], ([m, s, b, local, px]) => {
                    const par = disabled ? 0 : m * s * L.depth;
                    return b + par + local + px;
                });

                const y = useTransform([my, sy, by, fd, mvY(Ly), mvY(poseY)], ([m, s, b, drop, local, py]) => {
                    const par = disabled ? 0 : m * s * L.depth;
                    const extraDrop = drop * L.depth; // front layers drop more
                    return b + par + local + extraDrop + py;
                });

                // ✅ scale from: base zoom + per-layer scale + depthScale, then poseScaleMul
                const scale = useTransform([ds, bs, mvX(L.scale ?? 1), mvX(poseScaleMul)], ([dscale, bscale, layerBase, pMul]) => {
                    const depthZoom = disabled ? 0 : Math.abs(L.depth) * dscale;
                    return bscale * (layerBase + depthZoom) * pMul;
                });

                // ✅ opacity + pose multiplier (MV-friendly)
                const opacity = useTransform([mvX(layerOpacity), mvX(poseOpacityMul)], ([o, mul]) => o * mul);

                // ✅ blur: base + pose add (MV-friendly) -> filter string via useMotionTemplate
                const blurPx = useTransform([mvX(layerBlur), mvX(poseBlurAdd)], ([b0, b1]) => Math.max(0, b0 + b1));
                const filter = useMotionTemplate`blur(${blurPx}px)`;

                return (
                    <motion.div
                        key={L.id}
                        className="absolute inset-0"
                        style={{
                            x,
                            y,
                            scale,
                            zIndex: L.zIndex ?? 0,
                            opacity,
                            filter: (L.blur || L.poseBlurAdd) ? filter : undefined,
                            mixBlendMode: L.blendMode,
                            pointerEvents: L.pointerEvents ?? "none",
                            willChange: "transform, filter, opacity",
                        }}
                    >
                        <img
                            src={L.src}
                            alt={L.alt ?? ""}
                            className="absolute inset-0 h-full w-full object-cover"
                            draggable={false}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}