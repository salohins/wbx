import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type TabId = "overview" | "features" | "cases";

export function WebsitePreview() {
    const [tab, setTab] = useState<TabId>("overview");

    const copy = useMemo(() => {
        if (tab === "overview") {
            return {
                eyebrow: "Service",
                title: "Websites & Webapps",
                desc: "Individuelle Plattformen & Anwendungen — klar, schnell, skalierbar.",
                meta: ["UI/UX", "Performance", "SEO"],
                primaryCta: "View cases →",
                secondaryCta: "Learn more",
            };
        }
        if (tab === "features") {
            return {
                eyebrow: "Capabilities",
                title: "Motion + Structure",
                desc: "Smooth micro-interactions, responsive layouts, and a clean system that feels expensive.",
                meta: ["Animations", "Responsive", "Components"],
                primaryCta: "See features →",
                secondaryCta: "How we build",
            };
        }
        return {
            eyebrow: "Selected work",
            title: "Cases & Results",
            desc: "A few examples of the vibe — Swiss clean, modern, and conversion-first.",
            meta: ["Showcase", "Outcomes", "Timeline"],
            primaryCta: "Open cases →",
            secondaryCta: "Get a quote",
        };
    }, [tab]);

    const theme = useMemo(() => {
        if (tab === "overview") {
            return {
                bg: "linear-gradient(135deg, rgba(236,254,255,1) 0%, rgba(224,231,255,1) 35%, rgba(255,241,242,1) 100%)",
                glowA: "rgba(34, 211, 238, 0.28)",
                glowB: "rgba(37, 99, 235, 0.22)",
                ink: "rgba(8, 10, 20, 0.92)",
                sub: "rgba(8, 10, 20, 0.68)",
                card: "rgba(255,255,255,0.78)",
                stroke: "rgba(0,0,0,0.08)",
                pill: "rgba(0,0,0,0.06)",
            };
        }
        if (tab === "features") {
            return {
                bg: "linear-gradient(135deg, rgba(240,253,244,1) 0%, rgba(224,231,255,1) 45%, rgba(250,245,255,1) 100%)",
                glowA: "rgba(34, 197, 94, 0.24)",
                glowB: "rgba(168, 85, 247, 0.20)",
                ink: "rgba(8, 10, 20, 0.92)",
                sub: "rgba(8, 10, 20, 0.68)",
                card: "rgba(255,255,255,0.78)",
                stroke: "rgba(0,0,0,0.08)",
                pill: "rgba(0,0,0,0.06)",
            };
        }
        return {
            bg: "linear-gradient(135deg, rgba(255,241,242,1) 0%, rgba(254,249,195,1) 45%, rgba(224,231,255,1) 100%)",
            glowA: "rgba(255, 42, 42, 0.18)",
            glowB: "rgba(251, 113, 133, 0.20)",
            ink: "rgba(8, 10, 20, 0.92)",
            sub: "rgba(8, 10, 20, 0.68)",
            card: "rgba(255,255,255,0.78)",
            stroke: "rgba(0,0,0,0.08)",
            pill: "rgba(0,0,0,0.06)",
        };
    }, [tab]);

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* background */}
            <div className="absolute inset-0" style={{ background: theme.bg }} />

            {/* glows */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full blur-[70px]"
                style={{ background: theme.glowA }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-28 -right-24 h-[360px] w-[360px] rounded-full blur-[80px]"
                style={{ background: theme.glowB }}
            />

            {/* grain */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 22% 28%, rgba(0,0,0,0.12) 0 1px, transparent 2px),
            radial-gradient(circle at 68% 18%, rgba(0,0,0,0.10) 0 1px, transparent 2px),
            radial-gradient(circle at 44% 72%, rgba(0,0,0,0.10) 0 1px, transparent 2px)
          `,
                }}
            />

            {/* ✅ Fit-to-height layout */}
            <div className="relative h-full w-full p-5 flex flex-col min-h-0">
                {/* top bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Dot />
                        <Dot soft />
                        <Dot softer />
                        <div className="ml-2 h-3 w-24 rounded" style={{ background: theme.pill }} />
                    </div>

                    <div
                        className="h-8 px-3 rounded-full flex items-center font-semibold"
                        style={{
                            background: "rgba(255,255,255,0.70)",
                            border: `1px solid ${theme.stroke}`,
                            color: theme.ink,
                            letterSpacing: "0.18em",
                            fontSize: 11,
                            textTransform: "uppercase",
                        }}
                    >
                        Live preview
                    </div>
                </div>

                {/* tabs */}
                <div className="mt-4 flex items-center justify-end gap-2">
                    <BrightTab active={tab === "overview"} onClick={() => setTab("overview")} theme={theme}>
                        Overview
                    </BrightTab>
                    <BrightTab active={tab === "features"} onClick={() => setTab("features")} theme={theme}>
                        Features
                    </BrightTab>
                    <BrightTab active={tab === "cases"} onClick={() => setTab("cases")} theme={theme}>
                        Cases
                    </BrightTab>
                </div>

                {/* hero */}
                <div className="mt-4">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`hero-${tab}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div
                                className="text-[12px] font-semibold uppercase"
                                style={{ color: theme.sub, letterSpacing: "0.22em" }}
                            >
                                {copy.eyebrow}
                            </div>

                            <div
                                className="mt-2 font-semibold leading-[1.06]"
                                style={{
                                    color: theme.ink,
                                    fontSize: "clamp(24px, 3.2vw, 34px)", // ✅ scales down on small preview
                                }}
                            >
                                {copy.title}
                            </div>

                            <div className="mt-2 text-[14px] leading-relaxed" style={{ color: theme.sub }}>
                                {copy.desc}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {copy.meta.map((m) => (
                                    <span
                                        key={m}
                                        className="h-8 px-3 rounded-full inline-flex items-center font-semibold select-none"
                                        style={{
                                            background: "rgba(255,255,255,0.62)",
                                            border: `1px solid ${theme.stroke}`,
                                            color: theme.ink,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            fontSize: 11,
                                        }}
                                    >
                                        {m}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <PrimaryBtn theme={theme}>{copy.primaryCta}</PrimaryBtn>
                                <GhostBtn theme={theme}>{copy.secondaryCta}</GhostBtn>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* divider */}
                <div className="mt-4 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />

                {/* ✅ pages: fill remaining height, never overflow */}
                <div className="mt-4 flex-1 min-h-0">
                    <AnimatePresence mode="wait" initial={false}>
                        {tab === "overview" && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full min-h-0 grid grid-cols-2 gap-3"
                            >
                                <BrightCard theme={theme} title="What you get" subtitle="Clean structure, strong conversion" compact>
                                    <ListItem>Hero + CTA + trust proof</ListItem>
                                    <ListItem>Mobile-first sections</ListItem>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Swatch theme={theme} />
                                        <Swatch theme={theme} />
                                        <Swatch theme={theme} />
                                    </div>
                                </BrightCard>

                                <BrightCard theme={theme} title="Result" subtitle="A site that feels expensive" compact>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <Stat theme={theme} label="Speed" value="A+" />
                                        <Stat theme={theme} label="UX" value="A+" />
                                        <Stat theme={theme} label="SEO" value="A" />
                                        <Stat theme={theme} label="Polish" value="A+" />
                                    </div>
                                </BrightCard>
                            </motion.div>
                        )}

                        {tab === "features" && (
                            <motion.div
                                key="features"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full min-h-0 grid grid-cols-2 gap-3"
                            >
                                <MiniFeature theme={theme} title="Animations" desc="Smooth micro-interactions." compact />
                                <MiniFeature theme={theme} title="Responsive" desc="Premium on every device." compact />

                                <BrightWide theme={theme} title="Page flow" subtitle="Clean structure that converts" compact>
                                    <div className="mt-3 grid grid-cols-4 gap-2">
                                        <Pill theme={theme}>Hero</Pill>
                                        <Pill theme={theme}>Proof</Pill>
                                        <Pill theme={theme}>Offer</Pill>
                                        <Pill theme={theme}>CTA</Pill>
                                    </div>

                                    <div className="mt-3 h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: "rgba(0,0,0,0.18)", width: "58%" }}
                                            animate={{ x: ["-20%", "10%", "-20%"] }}
                                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    </div>
                                </BrightWide>
                            </motion.div>
                        )}

                        {tab === "cases" && (
                            <motion.div
                                key="cases"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full min-h-0 grid grid-cols-2 gap-3"
                            >
                                <BrightCard theme={theme} title="Selected cases" subtitle="A few examples" compact>
                                    <div className="mt-3 space-y-2">
                                        <Case theme={theme} name="Lüscher & Partners AG" tag="Website" />
                                        <Case theme={theme} name="TB Bau & Management" tag="Website" />
                                    </div>
                                </BrightCard>

                                <BrightCard theme={theme} title="Timeline" subtitle="Fast, but clean" compact>
                                    <div className="mt-3 space-y-2">
                                        <Timeline theme={theme} step="01" label="Concept + structure" />
                                        <Timeline theme={theme} step="02" label="Design + build" />
                                        <Timeline theme={theme} step="03" label="Polish + launch" />
                                    </div>
                                </BrightCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

/* -------------------- Small UI bits -------------------- */

function Dot({ soft, softer }: { soft?: boolean; softer?: boolean }) {
    const opacity = softer ? 0.25 : soft ? 0.35 : 0.45;
    return <div className="h-3 w-3 rounded-full" style={{ background: `rgba(0,0,0,${opacity})` }} />;
}

function BrightTab({
    active,
    onClick,
    children,
    theme,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    theme: any;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative h-9 px-4 rounded-full font-semibold transition cursor-pointer"
            style={{
                background: active ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.55)",
                border: `1px solid ${theme.stroke}`,
                color: theme.ink,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
            }}
        >
            {active && (
                <motion.div
                    layoutId="brightWebsiteTab"
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 10px 34px rgba(0,0,0,0.10)" }}
                    transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.9 }}
                />
            )}
            <span className="relative z-[1]">{children}</span>
        </button>
    );
}

function PrimaryBtn({ children }: { children: React.ReactNode; theme: any }) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-10 px-5 rounded-full font-semibold cursor-pointer"
            style={{
                background: "rgba(8,10,20,0.92)",
                color: "white",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 11,
                boxShadow: "0 16px 44px rgba(0,0,0,0.16)",
            }}
        >
            {children}
        </motion.button>
    );
}

function GhostBtn({ children, theme }: { children: React.ReactNode; theme: any }) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-10 px-5 rounded-full font-semibold cursor-pointer"
            style={{
                background: "rgba(255,255,255,0.58)",
                border: `1px solid ${theme.stroke}`,
                color: theme.ink,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 11,
            }}
        >
            {children}
        </motion.button>
    );
}

function BrightCard({
    theme,
    title,
    subtitle,
    children,
    compact,
}: {
    theme: any;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    compact?: boolean;
}) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl"
            style={{
                padding: compact ? 14 : 20,
                background: theme.card,
                border: `1px solid ${theme.stroke}`,
                boxShadow: "0 16px 52px rgba(0,0,0,0.10)",
            }}
        >
            <div
                style={{
                    color: theme.ink,
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                }}
            >
                {title}
            </div>
            <div className="mt-1" style={{ color: theme.sub, fontSize: 13 }}>
                {subtitle}
            </div>
            <div className="mt-3 space-y-2">{children}</div>
        </motion.div>
    );
}

function BrightWide({
    theme,
    title,
    subtitle,
    children,
    compact,
}: {
    theme: any;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    compact?: boolean;
}) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-2 rounded-2xl"
            style={{
                padding: compact ? 14 : 20,
                background: theme.card,
                border: `1px solid ${theme.stroke}`,
                boxShadow: "0 16px 52px rgba(0,0,0,0.10)",
            }}
        >
            <div
                style={{
                    color: theme.ink,
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                }}
            >
                {title}
            </div>
            <div className="mt-1" style={{ color: theme.sub, fontSize: 13 }}>
                {subtitle}
            </div>
            {children}
        </motion.div>
    );
}

function ListItem({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3" style={{ fontSize: 13 }}>
            <div className="mt-[7px] h-2 w-2 rounded-full" style={{ background: "rgba(0,0,0,0.28)" }} />
            <div style={{ color: "rgba(8,10,20,0.80)" }}>{children}</div>
        </div>
    );
}

function Stat({ theme, label, value }: { theme: any; label: string; value: string }) {
    return (
        <div
            className="rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.62)", border: `1px solid ${theme.stroke}` }}
        >
            <div
                style={{
                    color: theme.sub,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                }}
            >
                {label}
            </div>
            <div className="mt-1" style={{ color: theme.ink, fontSize: 16, fontWeight: 900 }}>
                {value}
            </div>
        </div>
    );
}

function Swatch({ theme }: { theme: any }) {
    return (
        <div
            className="h-9 w-9 rounded-2xl"
            style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${theme.stroke}` }}
        />
    );
}

function MiniFeature({ theme, title, desc, compact }: { theme: any; title: string; desc: string; compact?: boolean }) {
    return (
        <BrightCard theme={theme} title={title} subtitle={desc} compact={compact}>
            <div className="h-3 w-[86%] rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
            <div className="h-3 w-[72%] rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
        </BrightCard>
    );
}

function Pill({ theme, children }: { theme: any; children: React.ReactNode }) {
    return (
        <div
            className="h-9 rounded-full flex items-center justify-center font-semibold"
            style={{
                background: "rgba(255,255,255,0.62)",
                border: `1px solid ${theme.stroke}`,
                color: "rgba(8,10,20,0.80)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontSize: 11,
            }}
        >
            {children}
        </div>
    );
}

function Case({ theme, name, tag }: { theme: any; name: string; tag: string }) {
    return (
        <div
            className="flex items-center gap-3 rounded-2xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.62)", border: `1px solid ${theme.stroke}` }}
        >
            <div className="h-9 w-9 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }} />
            <div className="min-w-0 flex-1">
                <div className="truncate" style={{ color: "rgba(8,10,20,0.88)", fontSize: 13, fontWeight: 800 }}>
                    {name}
                </div>
                <div className="mt-2 h-2 w-[55%] rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
            </div>
            <div
                className="h-8 px-3 rounded-full flex items-center font-semibold"
                style={{
                    background: "rgba(0,0,0,0.06)",
                    border: `1px solid ${theme.stroke}`,
                    color: "rgba(8,10,20,0.78)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontSize: 11,
                }}
            >
                {tag}
            </div>
        </div>
    );
}

function Timeline({ theme, step, label }: { theme: any; step: string; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div
                className="h-9 w-11 rounded-full flex items-center justify-center font-semibold"
                style={{
                    background: "rgba(0,0,0,0.06)",
                    border: `1px solid ${theme.stroke}`,
                    color: "rgba(8,10,20,0.78)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontSize: 11,
                }}
            >
                {step}
            </div>
            <div style={{ color: "rgba(8,10,20,0.80)", fontSize: 13, fontWeight: 700 }}>{label}</div>
            <div className="ml-auto h-3 w-16 rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
        </div>
    );
}
