import React, { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { SnapSection } from "../../components/SnapSection2";
import { useDeviceTier } from "../../hooks/useDeviceTier";

import { PreviewFrame } from "./PreviewFrame";

export type ServiceId = "websites" | "tools" | "branding";

const SERVICES = [
    {
        id: "websites" as const,
        label: "WEBSITES & WEBAPPS",
        desc: "Individuelle Plattformen & Anwendungen — klar, schnell, skalierbar.",
        meta: ["UI/UX", "Performance", "SEO"],
        bgClass: "bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900",
        icon: "web" as const,
        accentFrom: "from-[#2563eb]/45",
        accentTo: "to-[#22d3ee]/25",
    },
    {
        id: "tools" as const,
        label: "DIGITAL TOOLS",
        desc: "Admin Panels, CRM, Automationen — gebaut für Prozesse, Daten & Wachstum.",
        meta: ["Dashboards", "CRM", "Automation"],
        bgClass: "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-800",
        icon: "tools" as const,
        accentFrom: "from-[#22c55e]/35",
        accentTo: "to-[#a3e635]/18",
    },
    {
        id: "branding" as const,
        label: "BRANDING",
        desc: "Markenauftritt & UI-Systeme mit Charakter, Klarheit und Wiedererkennung.",
        meta: ["Identity", "Design System", "Guidelines"],
        bgClass: "bg-gradient-to-b from-neutral-950 via-neutral-950 to-[#220a0a]",
        icon: "brand" as const,
        accentFrom: "from-[#a855f7]/35",
        accentTo: "to-[#fb7185]/22",
    },
] as const;

type ServicesProps = {
    initialActive?: ServiceId;
};

export function Services({ initialActive = "websites" }: ServicesProps) {
    const [active, setActive] = useState<ServiceId>(initialActive);

    // ✅ DESKTOP: one expanded at a time
    const [expanded, setExpanded] = useState<ServiceId>(initialActive);

    return (
        <SnapSection
            sectionId="services"
            className="relative w-full "
            title={"SERVICES"}
            subtitle={"services subtitle"}
            desktopAlign="center"
        >
            {/* ✅ DESKTOP */}
            <div className="hidden lg:block w-full">
                <div className="relative flex w-full items-center py-16 md:py-0">
                    <div className="grid w-full grid-cols-12 items-start gap-y-14 md:gap-x-16">
                        <div className="col-span-12 md:col-span-6">
                            <div className="flex w-full justify-center md:justify-start">
                                <PreviewFrame active={active} />
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <LayoutGroup id="services-desktop">
                                <motion.div
                                    layout
                                    transition={{
                                        layout: { type: "spring", stiffness: 520, damping: 44, mass: 0.9 },
                                    }}
                                    className="space-y-3 md:space-y-4"
                                >
                                    {SERVICES.map((s, idx) => (
                                        <SnapSection.Slide key={s.id} id={`services:${s.id}`} order={idx}>
                                            <ServiceRow
                                                serviceId={s.id}
                                                index={String(idx + 1).padStart(2, "0")}
                                                label={s.label}
                                                desc={s.desc}
                                                meta={[...s.meta]}
                                                active={active === s.id}
                                                expanded={expanded === s.id}
                                                mode="desktop"
                                                onClick={() => {
                                                    setActive(s.id);
                                                    setExpanded(s.id);
                                                }}
                                            />
                                        </SnapSection.Slide>
                                    ))}
                                </motion.div>
                            </LayoutGroup>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ MOBILE (all open) */}
            <div className="lg:hidden h-full w-full">
                <div className="h-full w-full px-6 py-10">
                    <div className="mb-8">
                        <div className="text-[11px] tracking-[0.34em] text-white/55 uppercase">
                            001 — Services
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-[560px] space-y-3">
                        {SERVICES.map((s, idx) => (
                            <SnapSection.Slide key={s.id} id={`services:${s.id}`} order={idx}>
                                <ServiceRow
                                    serviceId={s.id}
                                    index={String(idx + 1).padStart(2, "0")}
                                    label={s.label}
                                    desc={s.desc}
                                    meta={[...s.meta]}
                                    active={active === s.id}
                                    expanded={true}
                                    mode="mobile"
                                    onEnter={() => setActive(s.id)}
                                    onClick={() => setActive(s.id)}
                                />
                            </SnapSection.Slide>
                        ))}
                    </div>
                </div>
            </div>
        </SnapSection>
    );
}

/* -------------------- Animated Service Icon -------------------- */

function ServiceIcon({ type, active }: { type: ServiceId; active: boolean }) {
    const baseColor = type === "websites" ? "#ff2a2a" : type === "tools" ? "#22c55e" : "#a855f7";

    // ✅ float + glow pulse (sinusoidal-like loop)
    const floatAnim = {
        y: [0, -8, 0, 6, 0],
        rotate: [0, -1.2, 0, 1.2, 0],
    };
    const glowAnim = {
        opacity: active ? [0.35, 0.6, 0.35] : [0.22, 0.35, 0.22],
        scale: active ? [1.05, 1.18, 1.05] : [1.0, 1.1, 1.0],
    };

    return (
        <motion.div
            className="relative h-20 w-20"
            animate={floatAnim}
            transition={{
                duration: 4.8,
                ease: "easeInOut",
                repeat: Infinity,
            }}
        >
            <motion.div
                animate={glowAnim}
                transition={{
                    duration: 3.4,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: baseColor }}
            />

            {type === "websites" && (
                <motion.div
                    animate={{ y: active ? -6 : 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 18 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="relative h-10 w-14 rounded-md border border-white/55 bg-white/10">
                        <div className="absolute left-0 right-0 top-0 h-2 bg-white/25" />
                        <div className="absolute left-2 top-3 h-1.5 w-7 rounded bg-white/35" />
                        <div className="absolute left-2 top-6 h-1.5 w-10 rounded bg-white/25" />
                    </div>
                </motion.div>
            )}

            {type === "tools" && (
                <motion.div
                    animate={{ rotate: active ? 180 : 0 }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="relative h-11 w-11 rounded-full border-2 border-white/65">
                        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35" />
                        <div className="absolute left-1/2 top-1 h-2 w-2 -translate-x-1/2 rounded bg-white/30" />
                        <div className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded bg-white/30" />
                        <div className="absolute left-1/2 bottom-1 h-2 w-2 -translate-x-1/2 rounded bg-white/30" />
                        <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded bg-white/30" />
                    </div>
                </motion.div>
            )}

            {type === "branding" && (
                <motion.div
                    animate={{ scale: active ? 1.12 : 1, rotate: active ? 6 : 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="h-12 w-12 rotate-45 rounded-sm bg-white/55 shadow-[0_10px_30px_rgba(0,0,0,0.22)]" />
                    <div className="absolute h-4 w-4 rounded-sm bg-white/35" />
                </motion.div>
            )}
        </motion.div>
    );
}

/* -------------------- ServiceRow (expanded controls styling) -------------------- */

function ServiceRow({
    serviceId,
    index,
    label,
    desc,
    meta,
    active,
    expanded,
    mode,
    onEnter,
    onClick,
}: {
    serviceId: ServiceId;
    index: string;
    label: string;
    desc: string;
    meta: string[];
    active: boolean;
    expanded: boolean;
    mode: "desktop" | "mobile";
    onEnter?: () => void;
    onClick: () => void;
}) {
    const isMobile = mode === "mobile";
    const showMore = isMobile || expanded;

    // ✅ reuse global tier logic
    const { bigMobile } = useDeviceTier();

    // ✅ scale a few things up on larger phones (>= 390px)
    const titleSizeMobile = bigMobile ? "text-[36px]" : "text-[32px]";
    const descSizeMobile = bigMobile ? "text-[20px]" : "text-[16px]";
    const pillTextMobile = bigMobile ? "text-[12px]" : "text-[9px]";
    const btnTextMobile = bigMobile ? "text-[11px]" : "text-[10px]";
    const iconScaleMobile = bigMobile ? "scale-[0.88]" : "scale-[0.80]";

    // ✅ spacing scale on larger phones (>= 390px)
    const padMobile = bigMobile ? "px-7 py-7" : "px-6 py-6";
    const gridGapMobile = bigMobile ? "gap-5" : "gap-4";
    const headerGapMobile = bigMobile ? "gap-5" : "gap-4";
    const titleMtMobile = bigMobile ? "mt-4" : "mt-3";
    const descMtMobile = bigMobile ? "mt-3" : "mt-2";
    const morePtMobile = bigMobile ? "pt-5" : "pt-4";
    const pillsGapMobile = bigMobile ? "gap-3" : "gap-2";
    const btnRowMtMobile = bigMobile ? "mt-6" : "mt-5";
    const btnGapMobile = bigMobile ? "gap-4" : "gap-3";

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
        }
    };

    const isHighlighted = showMore;

    const DESKTOP_MIN = 150;
    const DESKTOP_EXPANDED_MIN = 220;

    const tone = active ? "selected" : "unselected";

    const surfaceClass =
        tone === "selected" ? "bg-[#ff2a2a]" : "bg-neutral-900/70 dark:bg-neutral-900/70 bg-white/85";

    const textPrimaryClass = tone === "selected" ? "text-white" : "text-neutral-900 dark:text-white";
    const textSecondaryClass = tone === "selected" ? "text-white/90" : "text-neutral-700 dark:text-white/90";

    const gridOpacity = tone === "selected" ? 0.9 : 1;

    const baseShadow = isHighlighted
        ? "0 26px 90px rgba(255, 30, 30, 0.28)"
        : "0 22px 60px rgba(0, 0, 0, 0.16)";

    const hoverShadow =
        tone === "selected" ? "0 18px 70px rgba(255, 30, 30, 0.30)" : "0 18px 58px rgba(0, 0, 0, 0.22)";

    const inactiveInnerHighlight =
        "radial-gradient(circle at 22% 10%, rgba(255,255,255,0.22), transparent 52%)," +
        "linear-gradient(180deg, rgba(255,255,255,0.10), transparent 34%)," +
        "radial-gradient(circle at 88% 78%, rgba(0,0,0,0.14), transparent 60%)";

    const hoverGlow =
        tone === "selected"
            ? "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.18), transparent 55%)"
            : "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.14), transparent 58%)";

    const majorGridLightUnselected = `
        linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
    `;
    const minorGridLightUnselected = `
        linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
    `;
    const majorGridWhite = `
        linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)
    `;
    const minorGridWhite = `
        linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
    `;

    return (
        <motion.div
            role="button"
            tabIndex={0}
            aria-expanded={showMore}
            onMouseEnter={onEnter}
            onFocus={onEnter}
            onClick={onClick}
            onKeyDown={onKeyDown}
            layout={isMobile ? false : "size"}
            animate={isMobile ? undefined : { minHeight: expanded ? DESKTOP_EXPANDED_MIN : DESKTOP_MIN }}
            transition={{
                layout: { type: "spring", stiffness: 520, damping: 46, mass: 0.95 },
                minHeight: { type: "spring", stiffness: 520, damping: 46, mass: 0.95 },
                boxShadow: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                transform: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
            }}
            whileHover={
                isMobile
                    ? undefined
                    : {
                        y: -6,
                        scale: 1.012,
                        boxShadow: hoverShadow,
                    }
            }
            whileTap={isMobile ? undefined : { scale: 0.995, y: -1 }}
            className={[
                "group relative w-full cursor-pointer select-none overflow-hidden",
                "rounded-2xl",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 dark:focus-visible:ring-white/25 focus-visible:ring-black/20",
                isMobile ? "h-auto" : "h-[calc(100svh-10rem)] md:h-auto",
                isMobile ? padMobile : "px-7 py-7",
                "transform-gpu will-change-transform",
            ].join(" ")}
            style={{ boxShadow: baseShadow }}
        >
            {/* BASE SURFACE */}
            <div aria-hidden className={["absolute inset-0 transition-colors duration-300", surfaceClass].join(" ")} />

            {/* Inactive depth */}
            {tone !== "selected" && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.85] transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: inactiveInnerHighlight,
                        mixBlendMode: "soft-light",
                    }}
                />
            )}

            {/* Micro edge/bezel */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-70 group-hover:opacity-100"
                style={{
                    boxShadow:
                        tone === "selected"
                            ? "inset 0 0 0 1px rgba(255,255,255,0.16)"
                            : "inset 0 0 0 1px rgba(255,255,255,0.12)",
                }}
            />

            {/* GRID (major) */}
            <motion.div
                aria-hidden
                className="absolute inset-0"
                style={{
                    backgroundImage: tone === "selected" ? majorGridWhite : undefined,
                    backgroundSize: "28px 28px",
                    opacity: gridOpacity,
                    mixBlendMode: tone === "selected" ? "normal" : "multiply",
                }}
                whileHover={isMobile ? undefined : { opacity: tone === "selected" ? 0.56 : 0.28 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Major grid for UNSELECTED only: light vs dark */}
            {tone !== "selected" && (
                <>
                    <motion.div
                        aria-hidden
                        className="absolute inset-0 dark:hidden"
                        style={{
                            backgroundImage: majorGridLightUnselected,
                            backgroundSize: "28px 28px",
                            opacity: gridOpacity,
                            mixBlendMode: "multiply",
                        }}
                        whileHover={isMobile ? undefined : { opacity: 0.28 }}
                        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.div
                        aria-hidden
                        className="absolute inset-0 hidden dark:block"
                        style={{
                            backgroundImage: majorGridWhite,
                            backgroundSize: "28px 28px",
                            opacity: gridOpacity,
                            mixBlendMode: "multiply",
                        }}
                        whileHover={isMobile ? undefined : { opacity: 0.28 }}
                        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    />
                </>
            )}

            {/* GRID (minor) */}
            {tone === "selected" ? (
                <motion.div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        backgroundImage: minorGridWhite,
                        backgroundSize: "7px 7px",
                        opacity: 0.22,
                        mixBlendMode: "normal",
                    }}
                    whileHover={isMobile ? undefined : { opacity: 0.28 }}
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                />
            ) : (
                <>
                    <motion.div
                        aria-hidden
                        className="absolute inset-0 dark:hidden"
                        style={{
                            backgroundImage: minorGridLightUnselected,
                            backgroundSize: "7px 7px",
                            opacity: 0.1,
                            mixBlendMode: "multiply",
                        }}
                        whileHover={isMobile ? undefined : { opacity: 0.14 }}
                        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.div
                        aria-hidden
                        className="absolute inset-0 hidden dark:block"
                        style={{
                            backgroundImage: minorGridWhite,
                            backgroundSize: "7px 7px",
                            opacity: 0.1,
                            mixBlendMode: "multiply",
                        }}
                        whileHover={isMobile ? undefined : { opacity: 0.14 }}
                        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    />
                </>
            )}

            {/* RADIAL LIGHT */}
            <motion.div
                aria-hidden
                className="absolute inset-0"
                style={{
                    background: isHighlighted
                        ? "radial-gradient(circle at 10% 0%, rgba(255,255,255,0.12), transparent 55%)"
                        : "radial-gradient(circle at 10% 0%, rgba(0,0,0,0.10), transparent 55%)",
                }}
                whileHover={isMobile ? undefined : { opacity: 1 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            />

            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(circle at 80% 50%, rgba(0,0,0,0.20), transparent 58%)",
                }}
            />

            {/* Hover glow wash (desktop only) */}
            {!isMobile && (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0"
                    style={{
                        background: hoverGlow,
                        mixBlendMode: tone === "selected" ? "normal" : "soft-light",
                    }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                />
            )}

            {/* Highlight sweep / shimmer (desktop only) */}
            {!isMobile && (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0"
                    style={{
                        background:
                            "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 75%)",
                        mixBlendMode: tone === "selected" ? "normal" : "overlay",
                    }}
                    initial={{ x: -24 }}
                    whileHover={{ opacity: 0.18, x: 24 }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                />
            )}

            {/* CONTENT */}
            <div className={["relative z-[1]", isMobile ? "flex h-full flex-col" : ""].join(" ")}>
                {isMobile ? (
                    // ✅ MOBILE: explicit grid items (no contents)
                    <div className={`grid grid-cols-[1fr_auto] ${gridGapMobile} items-start`}>
                        {/* left (index + title) */}
                        <div className="min-w-49">
                            <div className={`flex items-center ${headerGapMobile}`}>
                                <div
                                    className={[
                                        "text-[13px] tracking-[0.24em] shrink-0",
                                        tone === "selected" ? "text-white/90" : "text-neutral-600 dark:text-white/90",
                                    ].join(" ")}
                                >
                                    {index}
                                </div>
                                <div
                                    className={[
                                        "h-px flex-1 max-w-[64px]",
                                        tone === "selected" ? "bg-white/30" : "bg-neutral-900/15 dark:bg-white/30",
                                    ].join(" ")}
                                />
                            </div>

                            <div
                                className={[
                                    `${titleMtMobile} ${titleSizeMobile} sm:text-[38px] font-semibold tracking-[-0.02em] leading-10`,
                                    textPrimaryClass,
                                    "break-words",
                                ].join(" ")}
                            >
                                {label}
                            </div>
                        </div>

                        {/* icon (top right) */}
                        <motion.div
                            className="flex-shrink-0"
                            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
                        >
                            <div className={`${iconScaleMobile} origin-top-right`}>
                                <ServiceIcon type={serviceId} active={isHighlighted} />
                            </div>
                        </motion.div>

                        {/* desc full width */}
                        <div
                            className={[
                                `col-span-2 ${descMtMobile} ${descSizeMobile} sm:text-[18px] leading-relaxed`,
                                textSecondaryClass,
                            ].join(" ")}
                        >
                            {desc}
                        </div>
                    </div>
                ) : (
                    // ✅ DESKTOP: keep your original structure
                    <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-4">
                                <div
                                    className={[
                                        "text-[13px] tracking-[0.24em] shrink-0",
                                        tone === "selected" ? "text-white/90" : "text-neutral-600 dark:text-white/90",
                                    ].join(" ")}
                                >
                                    {index}
                                </div>
                                <div
                                    className={[
                                        "h-px flex-1 max-w-[64px]",
                                        tone === "selected" ? "bg-white/30" : "bg-neutral-900/15 dark:bg-white/30",
                                    ].join(" ")}
                                />
                            </div>

                            <div
                                className={[
                                    "mt-3 text-[36px] sm:text-[42px] md:text-[40px] font-semibold tracking-[-0.02em]",
                                    textPrimaryClass,
                                    "break-words",
                                ].join(" ")}
                            >
                                {label}
                            </div>

                            <div
                                className={[
                                    "mt-2 max-w-[560px] text-[16px] leading-relaxed",
                                    textSecondaryClass,
                                ].join(" ")}
                            >
                                {desc}
                            </div>
                        </div>

                        <motion.div
                            className="flex-shrink-0"
                            whileHover={{ y: -1, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
                        >
                            <ServiceIcon type={serviceId} active={isHighlighted} />
                        </motion.div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {showMore && (
                        <motion.div
                            key="more"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                height: { type: "spring", stiffness: 420, damping: 40, mass: 0.9 },
                                opacity: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                            }}
                            className="overflow-hidden"
                        >
                            <div className={isMobile ? morePtMobile : "pt-6"}>
                                <div
                                    className={[
                                        "flex items-center",
                                        isMobile
                                            ? `${pillsGapMobile} flex-wrap `
                                            : "flex-wrap gap-2",
                                    ].join(" ")}
                                >
                                    {meta.map((m) => (
                                        <span
                                            key={m}
                                            className={[
                                                "inline-flex items-center whitespace-nowrap",
                                                isMobile ? "h-7 px-3 rounded-full" : "h-9 px-4 rounded-full",
                                                isMobile
                                                    ? `${pillTextMobile} tracking-[0.22em]`
                                                    : "text-[11px] tracking-[0.24em]",
                                                "uppercase",
                                                tone === "selected"
                                                    ? "bg-white/12 text-white/95"
                                                    : "bg-black/5 text-neutral-900/90 dark:bg-white/12 dark:text-white/95",
                                                "backdrop-blur-sm",
                                            ].join(" ")}
                                        >
                                            {m}
                                        </span>
                                    ))}
                                </div>

                                <div
                                    className={[
                                        `${btnRowMtMobile} flex items-center`,
                                        isMobile ? `flex-nowrap ${btnGapMobile}` : "flex-wrap gap-3",
                                    ].join(" ")}
                                >
                                    <button
                                        type="button"
                                        onClick={(e) => e.stopPropagation()}
                                        className={[
                                            isMobile ? "h-10 px-4" : "h-11 px-5",
                                            isMobile
                                                ? `${btnTextMobile} tracking-[0.24em]`
                                                : "text-[11px] tracking-[0.26em]",
                                            "rounded-full uppercase",
                                            tone === "selected"
                                                ? "bg-white/14 text-white hover:bg-white/18"
                                                : "bg-black/5 text-neutral-900 hover:bg-black/10 dark:bg-white/14 dark:text-white dark:hover:bg-white/18",
                                            "active:scale-[0.98] transition whitespace-nowrap",
                                        ].join(" ")}
                                    >
                                        Learn more
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => e.stopPropagation()}
                                        className={[
                                            isMobile ? "h-10 px-4" : "h-11 px-5",
                                            isMobile
                                                ? `${btnTextMobile} tracking-[0.24em]`
                                                : "text-[11px] tracking-[0.26em]",
                                            "rounded-full uppercase",
                                            tone === "selected"
                                                ? "bg-white text-neutral-900 hover:bg-white/90 shadow-sm"
                                                : "bg-neutral-900 text-white hover:bg-neutral-900/90 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90 shadow-sm",
                                            "active:scale-[0.98] transition whitespace-nowrap",
                                        ].join(" ")}
                                    >
                                        View cases →
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}