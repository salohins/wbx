// sections/About/PhilosophySection.tsx
import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SnapSection } from "../../components/SnapSection2";

/* -------------------- time loop (sin/cos) -------------------- */

function useTimeLoop(active = true) {
    const t = useMotionValue(0);

    React.useEffect(() => {
        if (!active) return;
        let raf = 0;
        const start = performance.now();

        const tick = () => {
            const now = performance.now();
            t.set((now - start) / 1000); // seconds
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [active, t]);

    return t;
}

/* -------------------- Floating wrapper (mobile-safe) -------------------- */

function useCoarsePointer() {
    const [coarse, setCoarse] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const m = window.matchMedia("(pointer: coarse)");
        const onChange = () => setCoarse(m.matches);
        onChange();
        if (m.addEventListener) m.addEventListener("change", onChange);
        else m.addListener(onChange);
        return () => {
            if (m.removeEventListener) m.removeEventListener("change", onChange);
            else m.removeListener(onChange);
        };
    }, []);

    return coarse;
}

function Float3D({
    children,
    intensity = 1,
    phase = 0,
    className = "",
    mode = "auto", // "auto" | "desktop3d" | "mobile2d"
}: {
    children: React.ReactNode;
    intensity?: number;
    phase?: number;
    className?: string;
    mode?: "auto" | "desktop3d" | "mobile2d";
}) {
    const t = useTimeLoop(true);
    const coarse = useCoarsePointer();

    const effectiveMode = mode === "auto" ? (coarse ? "mobile2d" : "desktop3d") : mode;

    // shared motion
    const y = useTransform(t, (s) => Math.sin(s * 1.2 + phase) * 10 * intensity);
    const x = useTransform(t, (s) => Math.cos(s * 0.9 + phase) * 4 * intensity);
    const rz = useTransform(t, (s) => Math.sin(s * 0.65 + phase) * 1.1 * intensity);

    const sy = useSpring(y, { stiffness: 55, damping: 18, mass: 0.8 });
    const sx = useSpring(x, { stiffness: 55, damping: 18, mass: 0.8 });
    const srz = useSpring(rz, { stiffness: 55, damping: 18, mass: 0.8 });

    // desktop-only 3D tilt
    const rx = useTransform(t, (s) => Math.sin(s * 0.8 + phase) * 6 * intensity);
    const ry = useTransform(t, (s) => Math.cos(s * 1.05 + phase) * 9 * intensity);

    const srx = useSpring(rx, { stiffness: 45, damping: 16, mass: 0.9 });
    const sry = useSpring(ry, { stiffness: 45, damping: 16, mass: 0.9 });

    return (
        <motion.div
            className={className}
            style={{
                translateZ: 0,
                willChange: "transform",
                x: sx,
                y: sy,
                rotateZ: srz,
                ...(effectiveMode === "desktop3d"
                    ? {
                        transformPerspective: 1200 as any,
                        rotateX: srx,
                        rotateY: sry,
                        transformStyle: "preserve-3d" as any,
                    }
                    : {}),
            }}
        >
            {children}
        </motion.div>
    );
}

/**
 * ✅ HERO float: super stable (no "drunk" wobble)
 * - single slow rhythm
 * - no rotateZ
 * - no side drift
 */
function FloatHero3D({
    children,
    phase = 0,
    className = "",
}: {
    children: React.ReactNode;
    phase?: number;
    className?: string;
}) {
    const t = useTimeLoop(true);

    const base = useTransform(t, (s) => s * 0.28 + phase); // slow, one rhythm

    const y = useTransform(base, (v) => Math.sin(v) * 7); // float
    const ry = useTransform(base, (v) => Math.sin(v) * 2.2); // tiny yaw

    // optional tiny pitch (kept very small to avoid wobble)
    const rx = useTransform(base, (v) => Math.cos(v) * 0.6);

    const sy = useSpring(y, { stiffness: 28, damping: 26, mass: 1.25 });
    const sry = useSpring(ry, { stiffness: 22, damping: 26, mass: 1.25 });
    const srx = useSpring(rx, { stiffness: 22, damping: 26, mass: 1.25 });

    return (
        <motion.div
            className={className}
            style={{
                translateZ: 0,
                willChange: "transform",
                transformPerspective: 1600 as any,
                transformStyle: "preserve-3d" as any,
                y: sy,
                rotateY: sry,
                rotateX: srx, // remove if you want zero "nodding"
            }}
        >
            {children}
        </motion.div>
    );
}

/* -------------------- content -------------------- */

const PHILO_TILES = [
    {
        id: "purpose",
        icon: "spark",
        title: "Zielgerichtetes Design",
        body: "Klare Botschaften, eine starke visuelle Hierarchie und Nutzerführung, die ohne Reibung zu Entscheidungen führt.",
    },
    {
        id: "simplicity",
        icon: "cube",
        title: "Technologie soll vereinfachen",
        body: "Saubere Architektur und wartbare Systeme – statt fragiler Setups, die mit der Zeit immer schwerer zu ändern sind.",
    },
    {
        id: "performance",
        icon: "bolt",
        title: "Performance schafft Vertrauen",
        body: "Geschwindigkeit, Barrierefreiheit und Struktur beeinflussen SEO, Conversion und die Wahrnehmung Ihrer Marke.",
    },
    {
        id: "automation",
        icon: "loop",
        title: "Wiederholbares automatisieren",
        body: "Wo es sinnvoll ist, ersetzen wir manuelle Arbeit durch Automation – für konsistente Abläufe und bessere Skalierbarkeit.",
    },
] as const;

/* -------------------- glass -------------------- */

function FrameGlass({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={[
                "relative overflow-hidden border",
                "rounded-[32px]",
                "border-black/10 dark:border-white/12",
                "bg-white/75 dark:bg-neutral-950/60",
                "backdrop-blur-xl",
                "shadow-[0_18px_60px_rgba(0,0,0,0.10)] dark:shadow-[0_26px_90px_rgba(0,0,0,0.40)]",
                className,
            ].join(" ")}
        >
            {/* sheen */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-0 right-0 h-48 bg-gradient-to-b from-white/55 via-white/10 to-transparent dark:from-white/12 dark:via-transparent dark:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-black/5 dark:from-white/10 dark:to-black/25" />
            </div>

            {/* subtle noise */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
                }}
            />

            <div className="relative">{children}</div>
        </div>
    );
}

function Specs() {
    const t = useTimeLoop(true);
    const a1 = useTransform(t, (s) => 0.18 + (Math.sin(s * 0.8) + 1) * 0.15);
    const a2 = useTransform(t, (s) => 0.12 + (Math.cos(s * 0.9 + 1.2) + 1) * 0.12);
    const y1 = useTransform(t, (s) => Math.sin(s * 0.7) * 10);
    const y2 = useTransform(t, (s) => Math.cos(s * 0.6 + 1.5) * 8);

    return (
        <div className="pointer-events-none absolute inset-0">
            <motion.div
                style={{ opacity: a1, y: y1 }}
                className="absolute left-[18%] top-[32%] h-1.5 w-1.5 rounded-full bg-white/40 dark:bg-white/25"
            />
            <motion.div
                style={{ opacity: a2, y: y2 }}
                className="absolute left-[74%] top-[44%] h-1 w-1 rounded-full bg-white/35 dark:bg-white/20"
            />
        </div>
    );
}

/* -------------------- Big Icons (previous design) -------------------- */

function BigIcon({ name }: { name: (typeof PHILO_TILES)[number]["icon"] }) {
    const stroke = "text-neutral-900/75 dark:text-white/85";
    const shell =
        "h-14 w-14 rounded-[22px] border border-black/10 dark:border-white/12 bg-white/55 dark:bg-white/10 backdrop-blur-md grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)]";

    if (name === "spark") {
        return (
            <div className={shell} aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" className={stroke} fill="none">
                    <path
                        d="M12 2l1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-3.5L12 2z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        );
    }
    if (name === "cube") {
        return (
            <div className={shell} aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" className={stroke} fill="none">
                    <path d="M12 2l8 4v12l-8 4-8-4V6l8-4z" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M12 2v20" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                    <path d="M4 6l8 4 8-4" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                </svg>
            </div>
        );
    }
    if (name === "bolt") {
        return (
            <div className={shell} aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" className={stroke} fill="none">
                    <path
                        d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        );
    }
    return (
        <div className={shell} aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" className={stroke} fill="none">
                <path d="M20 12a8 8 0 10-2.3 5.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M20 12v-6m0 6h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
        </div>
    );
}

/* -------------------- Tiles: icon on top -------------------- */

function TileGlass({
    icon,
    title,
    body,
}: {
    icon: (typeof PHILO_TILES)[number]["icon"];
    title: string;
    body: string;
}) {
    return (
        <FrameGlass className="h-full">
            <Specs />
            <div className="px-7 py-8 flex flex-col items-start">
                <BigIcon name={icon} />
                <div className="mt-5 text-[18px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    {title}
                </div>
                <div className="mt-2 text-[15px] leading-relaxed text-neutral-700 dark:text-white/70">{body}</div>
            </div>
        </FrameGlass>
    );
}

function TileMobileSlide({
    icon,
    title,
    body,
    index,
    total,
}: {
    icon: (typeof PHILO_TILES)[number]["icon"];
    title: string;
    body: string;
    index: number;
    total: number;
}) {
    return (
        <div className="w-full max-w-[560px]">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-600 dark:text-white/60">
                    Prinzip {index} / {total}
                </span>
            </div>

            <FrameGlass className="rounded-3xl">
                <Specs />
                <div className="p-6 flex flex-col items-start">
                    <BigIcon name={icon} />
                    <h4 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] leading-tight text-neutral-900 dark:text-white">
                        {title}
                    </h4>
                    <div className="mt-3 text-[16px] leading-relaxed text-neutral-700 dark:text-white/75">{body}</div>
                </div>
            </FrameGlass>

            <p className="mt-4 text-xs text-neutral-500 dark:text-white/45 text-center">
                Wischen Sie nach links/rechts für weitere Inhalte
            </p>
        </div>
    );
}

/* -------------------- Section -------------------- */

export function PhilosophySection() {
    return (
        <SnapSection
            sectionId="philosophy"
            title="Philosophie"
            subtitle="Ein Prinzip: Klarheit."
            className="text-neutral-900 dark:text-white"
            maxWidth="max-w-7xl"
            desktopAlign="center"
            mobileSliderMode="peek"
            mobilePeekGutterPx={26}
            clipBleed={false}
        >
            {/* DESKTOP */}
            <div className="hidden lg:block w-full">
                <div className="mx-auto w-full max-w-[1200px]">
                    <div className="flex flex-col items-center">
                        {/* Center statement */}
                        <div className="relative w-full h-[250px] flex items-center justify-center" style={{ perspective: 1600 }}>
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="h-[420px] w-[420px] rounded-full bg-neutral-900/6 dark:bg-white/10 blur-3xl" />
                            </div>

                            {/* ✅ stable hero float (no drunk wobble) */}
                            <FloatHero3D phase={0}>
                                <FrameGlass className="rounded-[44px]">
                                    <Specs />
                                    <div className="px-12 py-12 text-center">
                                        <h3 className="text-[64px] leading-[0.98] font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">
                                            Klarheit liefert schneller.
                                        </h3>
                                        <div className="mt-4 text-[16px] leading-relaxed text-neutral-700 dark:text-white/70 max-w-[760px] mx-auto">
                                            Zielgerichtetes Design, einfache Systeme und performance-orientierte Umsetzung – damit Sie wachsen, ohne neu zu bauen.
                                        </div>
                                    </div>
                                </FrameGlass>
                            </FloatHero3D>
                        </div>

                        {/* ONE ROW BELOW */}
                        <div className="mt-6 w-full">
                            <div className="grid grid-cols-12 gap-6 items-stretch">
                                {PHILO_TILES.map((t, idx) => (
                                    <div key={t.id} className="col-span-3" style={{ perspective: 1200 }}>
                                        <SnapSection.Slide id={`philo:${t.id}`} order={idx}>
                                            <Float3D intensity={0.65} phase={idx * 0.9} mode="desktop3d">
                                                <TileGlass icon={t.icon} title={t.title} body={t.body} />
                                            </Float3D>
                                        </SnapSection.Slide>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden w-full h-full">
                <div className="h-full w-full px-6 py-10">
                    <div className="mb-6">
                        <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                            004 — PHILOSOPHIE
                        </div>

                        <div className="mt-4" style={{ perspective: 900 }}>
                            <Float3D intensity={0.55} phase={0.2} mode="mobile2d">
                                <FrameGlass className="rounded-3xl px-7 py-9 text-center">
                                    <Specs />
                                    <div className="text-[34px] leading-[1.02] font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white">
                                        Klarheit liefert schneller.
                                    </div>
                                    <div className="mt-3 text-[15px] leading-relaxed text-neutral-700 dark:text-white/70">
                                        Zielgerichtetes Design, einfache Systeme und performance-orientierte Umsetzung.
                                    </div>
                                </FrameGlass>
                            </Float3D>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-[560px] space-y-3">
                        {PHILO_TILES.map((t, idx) => (
                            <SnapSection.Slide key={t.id} id={`philo:${t.id}`} order={idx}>
                                <Float3D intensity={0.45} phase={idx * 0.9} mode="mobile2d">
                                    <TileMobileSlide
                                        icon={t.icon}
                                        title={t.title}
                                        body={t.body}
                                        index={idx + 1}
                                        total={PHILO_TILES.length}
                                    />
                                </Float3D>
                            </SnapSection.Slide>
                        ))}
                    </div>
                </div>
            </div>
        </SnapSection>
    );
}