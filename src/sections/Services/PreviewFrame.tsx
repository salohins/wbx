import React, { useEffect, useMemo, useRef } from "react";
import {
    AnimatePresence,
    animate,
    motion,
    useMotionTemplate,
    useMotionValue,
} from "framer-motion";

import type { ServiceId } from "./services.types";
import { WebsitePreview } from "./previews/WebsitePreview";
import { ToolsPreview } from "./previews/ToolsPreview";
import { BrandingPreview } from "./previews/BrandingPreview";

function getAccent(active: ServiceId) {
    if (active === "websites") return "rgba(255, 30, 30, 0.22)";
    if (active === "tools") return "rgba(34, 197, 94, 0.20)";
    return "rgba(168, 85, 247, 0.18)";
}

export function PreviewFrame({ active }: { active: ServiceId }) {
    const accent = useMemo(() => getAccent(active), [active]);

    // ✅ Motion values (Framer owns transform => no more "tilt disappeared")
    const y = useMotionValue(0);
    const rx = useMotionValue(3);
    const ry = useMotionValue(-3);

    const transform =
        useMotionTemplate`translate3d(0, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;

    // ✅ keep refs to running loop animations so we can stop/resume cleanly
    const loopRefs = useRef<{
        y?: ReturnType<typeof animate>;
        rx?: ReturnType<typeof animate>;
        ry?: ReturnType<typeof animate>;
    }>({});

    const stopLoop = () => {
        loopRefs.current.y?.stop();
        loopRefs.current.rx?.stop();
        loopRefs.current.ry?.stop();
        loopRefs.current = {};
    };

    const startLoop = () => {
        // ✅ IMPORTANT: closed loop (end === start) so it loops beautifully
        const y0 = y.get();
        const rx0 = rx.get();
        const ry0 = ry.get();

        const D = 7.2; // smoother/slower than 7.2

        // ✅ tuned amplitudes (more balanced + less "one direction")
        const Y_AMP = 10;
        const RX_AMP = 1.15;
        const RY_AMP = 3.8;

        // ✅ slight phase drift per axis => feels organic, less repetitive
        const Dy = D * 1.0;
        const Drx = D * 1.06;
        const Dry = D * 0.94;

        loopRefs.current.y = animate(y, [y0, y0 - Y_AMP, y0, y0 + Y_AMP, y0], {
            duration: Dy,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
        });

        loopRefs.current.rx = animate(rx, [rx0, rx0 + RX_AMP, rx0, rx0 - RX_AMP, rx0], {
            duration: Drx,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
        });

        // ✅ symmetric around ry0 => no bias to one side
        loopRefs.current.ry = animate(ry, [ry0, ry0 + RY_AMP, ry0, ry0 - RY_AMP, ry0], {
            duration: Dry,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
        });
    };

    useEffect(() => {
        startLoop();
        return () => stopLoop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className={[
                "relative w-full",
                "md:w-[min(46vw,820px)]",
                "aspect-[3/4]",
                "max-h-[min(82svh,900px)]",
            ].join(" ")}
        >
            <div
                className={[
                    "group relative h-full overflow-visible",
                    "[perspective:1200px]",
                    // ✅ smoother, slower, more premium hover zoom
                    "transition-transform duration-[1050ms]",
                    "ease-[cubic-bezier(0.12,0.9,0.2,1)]",
                    "delay-[30ms]",
                    "md:hover:scale-[1.03]",
                    "origin-center",
                ].join(" ")}
            >
                {/* ✅ TILT LAYER (true 3D again, controlled by Framer) */}
                <motion.div
                    className={["relative h-full will-change-transform transform-gpu"].join(" ")}
                    style={{ transform }}
                    onHoverStart={() => {
                        // pause loop exactly where it is
                        stopLoop();

                        // ✅ smooth straighten (no tilting while hovered)
                        animate(y, 0, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
                        animate(rx, 0, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
                        animate(ry, 0, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
                    }}
                    onHoverEnd={() => {
                        // resume loop from current (no snap)
                        stopLoop();
                        startLoop();
                    }}
                >
                    
                   

                    {/* TABLET SHELL */}
                    <div
                        className={[
                            // ✅ lift uses "top" so it won't fight transform
                            "relative top-0",
                            // ✅ smoother + slower lift + shadow change
                            "transition-[top,box-shadow] duration-[1050ms]",
                            "ease-[cubic-bezier(0.12,0.9,0.2,1)]",
                            "delay-[30ms]",
                            "md:group-hover:-top-1",

                            "h-full rounded-[56px] bg-[#0a0a0a] border border-white/10",
                            "shadow-[0_30px_120px_rgba(0,0,0,0.70)]",
                            "md:group-hover:shadow-[0_16px_60px_rgba(0,0,0,0.38)]",
                        ].join(" ")}
                    >
                        {/* side buttons */}
                        <div aria-hidden className="absolute -left-[3px] top-[140px] z-30 h-10 w-[3px] rounded-full bg-white/15" />
                        <div aria-hidden className="absolute -left-[3px] top-[195px] z-30 h-16 w-[3px] rounded-full bg-white/15" />
                        <div aria-hidden className="absolute -right-[3px] top-[175px] z-30 h-20 w-[3px] rounded-full bg-white/15" />

                        {/* CLIP WRAPPER */}
                        <div className="absolute inset-0 rounded-[56px] overflow-hidden">
                            <div
                                aria-hidden
                                className="absolute inset-0 rounded-[56px] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_40%,rgba(255,255,255,0.06))] opacity-60 transition-opacity duration-500 group-hover:opacity-80"
                            />

                            {/* ✅ bezel shine (UNCHANGED) */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-[0.9] motion-safe:animate-[shine_3.8s_ease-in-out_infinite] motion-reduce:hidden"
                                style={{
                                    background:
                                        "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.55) 40%, transparent 80%)",
                                }}
                            />

                            {/* SCREEN */}
                            <div className="absolute inset-[10px] rounded-[46px] overflow-hidden bg-transparent border border-white/10">
                                

                               

                                {/* notch */}
                                <div
                                    aria-hidden
                                    className="absolute left-1/2 -translate-x-1/2 top-[10px] h-[28px] w-[180px] rounded-full bg-black/90 border border-white/10 z-50"
                                >
                                    <div
                                        aria-hidden
                                        className="absolute inset-[1px] rounded-full"
                                        style={{
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
                                        }}
                                    />

                                    <div className="absolute inset-0 flex items-center justify-between px-5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-white/10 border border-white/10" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-white/18" />
                                            <div className="h-2 w-6 rounded-full bg-white/10 border border-white/10" />
                                        </div>

                                        <div className="h-1.5 w-12 rounded-full bg-white/10" />

                                        <div className="relative h-4 w-4 rounded-full bg-white/8 border border-white/12">
                                            <div className="absolute inset-[2px] rounded-full bg-black/80" />
                                            <div className="absolute left-[4px] top-[3px] h-1.5 w-1.5 rounded-full bg-white/20" />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative h-full">
                                    <AnimatePresence mode="sync" initial={false}>
                                        <motion.div
                                            key={active}
                                            initial={{
                                                opacity: 0,
                                                y: 18,
                                                scale: 0.985,
                           
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                        
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -14,
                                                scale: 1.01,
                                           
                                            }}
                                            transition={{
                                                duration: 0.42,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                            className="absolute inset-0 z-10"
                                        >
                                            <motion.div
                                                aria-hidden
                                                initial={{ opacity: 0, x: "-40%" }}
                                                animate={{ opacity: 0.18, x: "40%" }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                                                className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
                                                style={{
                                                    background:
                                                        "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.65) 48%, transparent 80%)",
                                                }}
                                            />

                                                {active === "websites" && <WebsitePreview />}
                                                {active === "tools" && <ToolsPreview />}
                                                {active === "branding" && <BrandingPreview />}
                                        </motion.div>
                                    </AnimatePresence>

                                    <div
                                        aria-hidden
                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 h-1.5 w-28 rounded-full bg-white/18 z-40"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
        @keyframes shine {
          0% { transform: translateX(-60%); }
          50% { transform: translateX(60%); }
          100% { transform: translateX(-60%); }
        }
      `}</style>
        </div>
    );
}
