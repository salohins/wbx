// sections/Contact/ContactDeviceFrame.tsx
import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ContactFormScreen } from "./ContactFormScreen";

function Pencil({ attached = true }: { attached?: boolean }) {
    const BODY_BG_ATTACHED =
        "linear-gradient(90deg," +
        " #7d7d7d 0%," +
        " #f3f3f3 16%," +
        " #ececec 44%," +
        " #ececec 62%," +
        " #9c9c9c 100%)";

    const BODY_BG_DETACHED =
        "linear-gradient(90deg," +
        " #8e8e8e 0%," +
        " #c9c9c9 10%," +
        " #efefef 44%," +
        " #f0f0f0 62%," +
        " #999999 100%)";

    return (
        <motion.div
            aria-hidden
            className="absolute top-[86px] -right-[22px] z-50 pointer-events-none"
            initial={false}
            animate={
                attached
                    ? {
                        x: 0,
                        y: 0,
                        rotateZ: 0,
                        rotateX: 0,
                        rotateY: 0,
                        scale: 1,
                        filter: "blur(0px)",
                    }
                    : {
                        x: -70,
                        y: -26,
                        rotateZ: -5,
                        rotateX: 5,
                        scale: 1.07,
                        filter: "blur(0.1px)",
                    }
            }
            transition={{
                type: "spring",
                stiffness: 220,
                damping: 24,
                mass: 0.95,
            }}
            style={{
                transformStyle: "preserve-3d",
                transformOrigin: "top right",
            }}
        >
            <div
                className={[
                    "relative h-[460px] w-[20px] rounded-full",
                    "shadow-[0_18px_40px_rgba(0,0,0,0.8)]",
                ].join(" ")}
                style={{
                    transform: "translateZ(18px)",
                    background: attached ? BODY_BG_ATTACHED : BODY_BG_DETACHED,
                }}
            >
                <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-full pointer-events-none"
                    initial={false}
                    animate={{ opacity: attached ? 0.5 : 0.2 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    style={{
                        boxShadow:
                            "inset 0 0 0 1px rgba(255,255,255,0.35), inset 3px 0 7px rgba(0,0,0,0.22), inset -3px 0 9px rgba(0,0,0,1)",
                    }}
                />
                <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-full pointer-events-none"
                    initial={false}
                    animate={{ opacity: attached ? 0 : 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    style={{
                        boxShadow:
                            "inset 0 0 0 1px rgba(255,255,255,0.40), inset 2px 0 6px rgba(0,0,0,0.14), inset -2px 0 7px rgba(0,0,0,0.0)",
                    }}
                />

                <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    initial={false}
                    animate={attached ? { opacity: 0.0 } : { opacity: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    style={{
                        background:
                            "radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.86), rgb(143, 143, 143) 75%, rgb(0, 0, 0) 100%)",
                        mixBlendMode: "screen",
                    }}
                />

                <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    initial={false}
                    animate={attached ? { opacity: 0.0 } : { opacity: 0.01 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    style={{
                        background:
                            "radial-gradient(circle at 0% 0%, rgb(255, 255, 255), rgb(0, 0, 0) 75%, rgb(0, 0, 0) 100%)",
                    }}
                />

                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] h-[18px] w-[12px]">
                    <motion.div
                        className="absolute inset-0"
                        initial={false}
                        style={{
                            borderRadius: "0 0 999px 999px",
                            background:
                                "linear-gradient(90deg," +
                                " #cfcfcf 0%," +
                                " #cfcfcf 35%," +
                                " #d4d4d4 55%," +
                                " #999999 100%)",
                            border: "1px solid rgba(0,0,0,0.16)",
                        }}
                        animate={{
                            boxShadow: attached
                                ? "inset 2px 0 4px rgba(0,0,0,0.20), inset -2px 0 5px rgba(0,0,0,0.24)"
                                : "inset 2px 0 4px rgba(0,0,0,0.14), inset -2px 0 5px rgba(0,0,0,0.16)",
                        }}
                        transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    >
                        <motion.div
                            aria-hidden
                            className="absolute inset-0"
                            initial={false}
                            animate={{ opacity: attached ? 0 : 1 }}
                            transition={{ type: "spring", stiffness: 220, damping: 26 }}
                            style={{
                                borderRadius: "0 0 999px 999px",
                                background:
                                    "linear-gradient(90deg," +
                                    " rgba(255,255,255,0.55) 0%," +
                                    " rgba(255,255,255,0.18) 34%," +
                                    " rgba(255,255,255,0.70) 56%," +
                                    " rgba(255,255,255,0.10) 100%)",
                                mixBlendMode: "screen",
                                filter: "blur(0.2px)",
                            }}
                        />

                        <motion.div
                            aria-hidden
                            className="absolute left-[3px] top-[2px] bottom-[2px] w-[2px] rounded-full"
                            initial={false}
                            animate={{ opacity: attached ? 0.35 : 0.75 }}
                            transition={{ type: "spring", stiffness: 220, damping: 26 }}
                            style={{
                                background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.05))",
                                mixBlendMode: "screen",
                            }}
                        />
                    </motion.div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-18px] h-[10px] w-[7px]">
                    <motion.div
                        aria-hidden
                        className="absolute inset-0"
                        initial={false}
                        animate={{ opacity: attached ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 26 }}
                        style={{
                            borderRadius: "0 0 999px 999px",
                            background: "linear-gradient(180deg, #5a5a5a, #2a2a2a)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
                        }}
                    />
                    <motion.div
                        aria-hidden
                        className="absolute inset-0"
                        initial={false}
                        animate={{ opacity: attached ? 0 : 1 }}
                        transition={{ type: "spring", stiffness: 220, damping: 26 }}
                        style={{
                            borderRadius: "0 0 999px 999px",
                            background: "linear-gradient(180deg, #6a6a6a, #3a3a3a)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.26)",
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

function PencilMagnetRail() {
    return (
        <div
            aria-hidden
            className="absolute top-[74px] -right-[2px] z-40 h-[178px] w-[10px] rounded-l-full bg-black/35 blur-[0.2px]"
            style={{
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 22px rgba(0,0,0,0.35)",
                opacity: 0.55,
            }}
        />
    );
}

export function ContactDeviceFrame({ accent }: { accent: string }) {
    const [hovered, setHovered] = useState(false);

    // ✅ Only render pen on devices with real hover + fine pointer (mouse/trackpad)
    const [canHoverFine, setCanHoverFine] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
        const update = () => setCanHoverFine(!!mq.matches);

        update();
        mq.addEventListener?.("change", update);
        return () => mq.removeEventListener?.("change", update);
    }, []);

    const y = useMotionValue(0);
    const rx = useMotionValue(3);
    const ry = useMotionValue(-3);

    const transform = useMotionTemplate`translate3d(0, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;

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
        const y0 = y.get();
        const rx0 = rx.get();
        const ry0 = ry.get();

        const D = 7.2;
        const Y_AMP = 10;
        const RX_AMP = 1.15;
        const RY_AMP = 3.8;

        loopRefs.current.y = animate(y, [y0, y0 - Y_AMP, y0, y0 + Y_AMP, y0], {
            duration: D * 1.0,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
        });

        loopRefs.current.rx = animate(rx, [rx0, rx0 + RX_AMP, rx0, rx0 - RX_AMP, rx0], {
            duration: D * 1.06,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
        });

        loopRefs.current.ry = animate(ry, [ry0, ry0 + RY_AMP, ry0, ry0 - RY_AMP, ry0], {
            duration: D * 0.94,
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
                "h-[min(70svh,900px)]",
                "mx-auto max-w-[520px]",
                "md:mx-0 md:max-w-none",
                "md:w-[min(46vw,820px)] md:h-auto md:aspect-[3/4]",
            ].join(" ")}
        >
            <div
                className={[
                    "group relative h-full overflow-visible",
                    "[perspective:1200px]",
                    "transition-transform duration-[1050ms]",
                    "ease-[cubic-bezier(0.12,0.9,0.2,1)]",
                    "delay-[30ms]",
                    "md:hover:scale-[1.03]",
                    "origin-center",
                ].join(" ")}
            >
                <motion.div
                    className="relative h-full will-change-transform transform-gpu"
                    style={{ transform }}
                    onHoverStart={() => {
                        setHovered(true);

                        stopLoop();
                        animate(y, 0, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
                        animate(rx, 0, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
                        animate(ry, 0, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
                    }}
                    onHoverEnd={() => {
                        setHovered(false);
                        stopLoop();
                        startLoop();
                    }}
                >
                    {/* ✅ Pencil + magnet rail — ONLY on hover+fine pointer devices */}
                    {canHoverFine && (
                        <>
                            <PencilMagnetRail />
                            <Pencil attached={!hovered} />
                        </>
                    )}

                    {/* glow */}
                    <div
                        className="pointer-events-none absolute -inset-10 blur-[70px] transition-opacity duration-500 group-hover:opacity-90"
                        style={{ background: `radial-gradient(circle, ${accent}, transparent 62%)` }}
                    />
                    <div className="pointer-events-none absolute -inset-16 bg-black/40 blur-[90px] transition-opacity duration-500 group-hover:opacity-60" />

                    {/* TABLET SHELL */}
                    <div
                        className={[
                            "relative top-0",
                            "transition-[top,box-shadow] duration-[1050ms]",
                            "ease-[cubic-bezier(0.12,0.9,0.2,1)]",
                            "delay-[30ms]",
                            "md:group-hover:-top-1",
                            "h-full rounded-[56px] bg-[#0a0a0a] border border-white/10",
                            "shadow-[0_30px_120px_rgba(0,0,0,0.70)]",
                            "md:group-hover:shadow-[0_16px_60px_rgba(0,0,0,0.38)]",
                        ].join(" ")}
                    >
                        <div aria-hidden className="absolute -left-[3px] top-[140px] z-30 h-10 w-[3px] rounded-full bg-white/15" />
                        <div aria-hidden className="absolute -left-[3px] top-[195px] z-30 h-16 w-[3px] rounded-full bg-white/15" />
                        <div aria-hidden className="absolute -right-[3px] top-[175px] z-30 h-20 w-[3px] rounded-full bg-white/15" />

                        <div className="absolute inset-0 rounded-[56px] overflow-hidden">
                            <div
                                aria-hidden
                                className="absolute inset-0 rounded-[56px] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_40%,rgba(255,255,255,0.06))] opacity-60 transition-opacity duration-500 group-hover:opacity-80"
                            />

                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-[0.9] motion-safe:animate-[shine_3.8s_ease-in-out_infinite] motion-reduce:hidden"
                                style={{
                                    background:
                                        "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.55) 40%, transparent 80%)",
                                }}
                            />

                            <div className="absolute inset-[10px] rounded-[46px] overflow-hidden bg-transparent border border-white/10">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 z-0"
                                    style={{
                                        background:
                                            "radial-gradient(circle at 50% 12%, rgba(255,255,255,0.06), transparent 55%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.10), transparent 60%)",
                                    }}
                                />

                                <div className="relative h-full z-10">
                                    <ContactFormScreen />
                                </div>

                                <div
                                    aria-hidden
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 h-1.5 w-28 rounded-full bg-white/18 z-40"
                                />
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