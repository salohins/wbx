import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutTemplate,
    Layers,
    Database,
    Globe,
    MapPin,
    Sparkles,
    Smartphone,
    Zap,
    FileText,
    Image as ImageIcon,
    Quote,
    BadgeCheck,
    TrendingUp,
    Gauge,
    Search,
    Palette,
    Wrench,
    ChevronRight,
} from "lucide-react";

type TabId = "homepage" | "pages" | "cms";

type DemoTheme = {
    bg: string;
    glowA: string;
    glowB: string;
    ink: string;
    sub: string;
    card: string;
    stroke: string;
    pill: string;
};

export function WebsitePreview() {
    const [tab, setTab] = useState<TabId>("homepage");

    const demo = useMemo(() => {
        const brand = {
            name: "Alpine Studio",
            domain: "alpine-studio.ch",
            tagline: "Premium websites for modern businesses",
            industry: "Service Business",
            location: "Zug, Switzerland",
        };

        if (tab === "homepage") {
            return {
                brand,
                eyebrow: "Website Preview",
                title: "A premium website for your business",
                desc: "Clean structure, strong hierarchy, and a conversion-first layout that feels modern and high-end.",
                meta: [
                    { label: "Mobile-first", icon: Smartphone },
                    { label: "SEO-ready", icon: Search },
                    { label: "Fast launch", icon: Zap },
                ],
                primaryCta: "Request demo →",
                secondaryCta: "See outline",
            };
        }

        if (tab === "pages") {
            return {
                brand,
                eyebrow: "Structure",
                title: "Pages & navigation",
                desc: "A clear page system built for modern service businesses — flexible, scalable, and easy to extend.",
                meta: [
                    { label: "Page sections", icon: LayoutTemplate },
                    { label: "Conversion flow", icon: TrendingUp },
                    { label: "Reusable blocks", icon: Layers },
                ],
                primaryCta: "See page map →",
                secondaryCta: "Ask about add-ons",
            };
        }

        return {
            brand,
            eyebrow: "CMS",
            title: "Editable content blocks",
            desc: "Manage text, media, references, and updates in a clean system designed for speed and control.",
            meta: [
                { label: "Simple edits", icon: Wrench },
                { label: "Structured data", icon: Database },
                { label: "Scales later", icon: Sparkles },
            ],
            primaryCta: "View CMS →",
            secondaryCta: "Get a quote",
        };
    }, [tab]);

    const theme: DemoTheme = useMemo(() => {
        if (tab === "homepage") {
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
        if (tab === "pages") {
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

            {/* layout */}
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
                        className="h-8 px-3 rounded-full flex items-center gap-2 font-semibold"
                        style={{
                            background: "rgba(255,255,255,0.70)",
                            border: `1px solid ${theme.stroke}`,
                            color: theme.ink,
                            letterSpacing: "0.18em",
                            fontSize: 11,
                            textTransform: "uppercase",
                        }}
                    >
                        <Sparkles size={14} style={{ opacity: 0.9 }} />
                        Preview
                    </div>
                </div>

                {/* brand bar */}
                <div
                    className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ background: theme.card, border: `1px solid ${theme.stroke}` }}
                >
                    <div
                        className="h-10 w-10 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.06)" }}
                    >
                        <Globe size={18} style={{ color: "rgba(8,10,20,0.72)" }} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="truncate flex items-center gap-2" style={{ color: theme.ink, fontSize: 14, fontWeight: 900 }}>
                            {demo.brand.name}
                            <span
                                className="h-6 px-2 rounded-full inline-flex items-center gap-1"
                                style={{
                                    background: "rgba(0,0,0,0.05)",
                                    border: `1px solid ${theme.stroke}`,
                                    color: "rgba(8,10,20,0.72)",
                                    fontWeight: 900,
                                    fontSize: 10,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                }}
                            >
                                <BadgeCheck size={14} style={{ opacity: 0.85 }} />
                                {demo.brand.industry}
                            </span>
                        </div>

                        <div className="truncate flex items-center gap-3" style={{ color: theme.sub, fontSize: 12, fontWeight: 700 }}>
                            <span className="inline-flex items-center gap-1">
                                <Globe size={14} />
                                {demo.brand.domain}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <MapPin size={14} />
                                {demo.brand.location}
                            </span>
                        </div>
                    </div>
                </div>

                {/* tabs */}
                <div className="mt-4 flex items-center justify-end gap-2">
                    <BrightTab active={tab === "homepage"} onClick={() => setTab("homepage")} theme={theme} icon={LayoutTemplate}>
                        Homepage
                    </BrightTab>
                    <BrightTab active={tab === "pages"} onClick={() => setTab("pages")} theme={theme} icon={Layers}>
                        Pages
                    </BrightTab>
                    <BrightTab active={tab === "cms"} onClick={() => setTab("cms")} theme={theme} icon={Database}>
                        CMS
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
                            <div className="text-[12px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                                {demo.eyebrow}
                            </div>

                            <div
                                className="mt-2 font-semibold leading-[1.06]"
                                style={{
                                    color: theme.ink,
                                    fontSize: "clamp(24px, 3.2vw, 34px)",
                                }}
                            >
                                {demo.title}
                            </div>

                            <div className="mt-2 text-[14px] leading-relaxed" style={{ color: theme.sub }}>
                                {demo.desc}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {demo.meta.map((m) => (
                                    <span
                                        key={m.label}
                                        className="h-8 px-3 rounded-full inline-flex items-center gap-2 font-semibold select-none"
                                        style={{
                                            background: "rgba(255,255,255,0.62)",
                                            border: `1px solid ${theme.stroke}`,
                                            color: theme.ink,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            fontSize: 11,
                                        }}
                                    >
                                        <m.icon size={14} style={{ opacity: 0.85 }} />
                                        {m.label}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <PrimaryBtn theme={theme} icon={ChevronRight}>
                                    {demo.primaryCta}
                                </PrimaryBtn>
                                <GhostBtn theme={theme} icon={FileText}>
                                    {demo.secondaryCta}
                                </GhostBtn>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* divider */}
                <div className="mt-4 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />

                {/* pages */}
                <div className="mt-4 flex-1 min-h-0">
                    <AnimatePresence mode="wait" initial={false}>
                        {tab === "homepage" && (
                            <motion.div
                                key="homepage"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full min-h-0 grid grid-cols-2 gap-3"
                            >
                                <BrightCard theme={theme} title="Sections" subtitle="Overview of the homepage" icon={Layers} compact>
                                    <ListItem icon={Sparkles}>Hero + CTA + proof</ListItem>
                                    <ListItem icon={LayoutTemplate}>Services grid</ListItem>
                                    <ListItem icon={Quote}>Testimonials</ListItem>
                                    <ListItem icon={TrendingUp}>Pricing / process</ListItem>
                                </BrightCard>

                                <BrightCard theme={theme} title="Performance" subtitle="High-level benchmarks" icon={Gauge} compact>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <Stat theme={theme} label="Load" value="0.8s" icon={Zap} />
                                        <Stat theme={theme} label="SEO" value="92" icon={Search} />
                                        <Stat theme={theme} label="UX" value="A+" icon={Sparkles} />
                                        <Stat theme={theme} label="Leads" value="+23%" icon={TrendingUp} />
                                    </div>
                                </BrightCard>
                            </motion.div>
                        )}

                        {tab === "pages" && (
                            <motion.div
                                key="pages"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full min-h-0 grid grid-cols-2 gap-3"
                            >
                                <BrightCard theme={theme} title="Navigation" subtitle="Typical structure" icon={LayoutTemplate} compact>
                                    <div className="mt-3 space-y-2">
                                        <NavRow theme={theme} label="Home" note="Hero / proof / services" icon={LayoutTemplate} />
                                        <NavRow theme={theme} label="Services" note="Offerings with CTAs" icon={Wrench} />
                                        <NavRow theme={theme} label="About" note="Story + team + values" icon={BadgeCheck} />
                                        <NavRow theme={theme} label="Contact" note="Form + details + map" icon={MapPin} />
                                    </div>
                                </BrightCard>

                                <BrightCard theme={theme} title="Visual system" subtitle="Typography, spacing, media" icon={FileText} compact>
                                    <div className="mt-3 space-y-2">
                                        <PlaceholderLine theme={theme} w="88%" />
                                        <PlaceholderLine theme={theme} w="74%" />
                                        <PlaceholderLine theme={theme} w="92%" />
                                        <div className="mt-3 flex items-center gap-2">
                                            <Swatch theme={theme} icon={Palette} />
                                            <Swatch theme={theme} icon={ImageIcon} />
                                            <Swatch theme={theme} icon={Sparkles} />
                                        </div>
                                    </div>
                                </BrightCard>
                            </motion.div>
                        )}

                        {tab === "cms" && (
                            <motion.div
                                key="cms"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full min-h-0 grid grid-cols-2 gap-3"
                            >
                                <MiniFeature theme={theme} title="Text" desc="Headlines, sections, CTAs" icon={FileText} compact />
                                <MiniFeature theme={theme} title="Media" desc="Images, logos, references" icon={ImageIcon} compact />

                                <BrightWide theme={theme} title="Content model" subtitle="Organized & scalable" icon={Database} compact>
                                    <div className="mt-3 grid grid-cols-4 gap-2">
                                        <Pill theme={theme} icon={Sparkles}>
                                            Hero
                                        </Pill>
                                        <Pill theme={theme} icon={Wrench}>
                                            Services
                                        </Pill>
                                        <Pill theme={theme} icon={Quote}>
                                            Reviews
                                        </Pill>
                                        <Pill theme={theme} icon={MapPin}>
                                            Contact
                                        </Pill>
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
    icon: Icon,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    theme: any;
    icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative h-9 px-4 rounded-full font-semibold transition cursor-pointer flex items-center gap-2"
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
            <span className="relative z-[1] inline-flex items-center gap-2">
                <Icon size={14} style={{ opacity: 0.85 }} />
                {children}
            </span>
        </button>
    );
}

function PrimaryBtn({
    children,
    theme,
    icon: Icon,
}: {
    children: React.ReactNode;
    theme: any;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-10 px-5 rounded-full font-semibold cursor-pointer inline-flex items-center gap-2"
            style={{
                background: "rgba(8,10,20,0.92)",
                color: "white",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 11,
                boxShadow: "0 16px 44px rgba(0,0,0,0.16)",
            }}
        >
            <span className="inline-flex items-center gap-2">
                {Icon ? <Icon size={16} style={{ opacity: 0.95 }} /> : null}
                {children}
            </span>
        </motion.button>
    );
}

function GhostBtn({
    children,
    theme,
    icon: Icon,
}: {
    children: React.ReactNode;
    theme: any;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-10 px-5 rounded-full font-semibold cursor-pointer inline-flex items-center gap-2"
            style={{
                background: "rgba(255,255,255,0.58)",
                border: `1px solid ${theme.stroke}`,
                color: theme.ink,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 11,
            }}
        >
            {Icon ? <Icon size={16} style={{ opacity: 0.85 }} /> : null}
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
    icon: Icon,
}: {
    theme: any;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    compact?: boolean;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
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
            <div className="flex items-center gap-2">
                {Icon ? <Icon size={16} style={{ opacity: 0.8, color: theme.ink }} /> : null}
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
    icon: Icon,
}: {
    theme: any;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    compact?: boolean;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
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
            <div className="flex items-center gap-2">
                {Icon ? <Icon size={16} style={{ opacity: 0.8, color: theme.ink }} /> : null}
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
            </div>
            <div className="mt-1" style={{ color: theme.sub, fontSize: 13 }}>
                {subtitle}
            </div>
            {children}
        </motion.div>
    );
}

function ListItem({
    children,
    icon: Icon,
}: {
    children: React.ReactNode;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <div className="flex items-start gap-3" style={{ fontSize: 13 }}>
            <div
                className="mt-[6px] h-7 w-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
                {Icon ? <Icon size={14} style={{ opacity: 0.75, color: "rgba(8,10,20,0.8)" }} /> : null}
            </div>
            <div style={{ color: "rgba(8,10,20,0.80)", fontWeight: 700 }}>{children}</div>
        </div>
    );
}

function Stat({
    theme,
    label,
    value,
    icon: Icon,
}: {
    theme: any;
    label: string;
    value: string;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.62)", border: `1px solid ${theme.stroke}` }}>
            <div className="flex items-center gap-2" style={{ color: theme.sub }}>
                {Icon ? <Icon size={14} style={{ opacity: 0.85 }} /> : null}
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div>
            </div>
            <div className="mt-1" style={{ color: theme.ink, fontSize: 16, fontWeight: 900 }}>
                {value}
            </div>
        </div>
    );
}

function Swatch({
    theme,
    icon: Icon,
}: {
    theme: any;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <div
            className="h-9 w-9 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.06)", border: `1px solid ${theme.stroke}` }}
        >
            {Icon ? <Icon size={16} style={{ opacity: 0.75, color: "rgba(8,10,20,0.78)" }} /> : null}
        </div>
    );
}

function MiniFeature({
    theme,
    title,
    desc,
    compact,
    icon: Icon,
}: {
    theme: any;
    title: string;
    desc: string;
    compact?: boolean;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <BrightCard theme={theme} title={title} subtitle={desc} compact={compact} icon={Icon}>
            <div className="h-3 w-[86%] rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
            <div className="h-3 w-[72%] rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
        </BrightCard>
    );
}

function Pill({
    theme,
    children,
    icon: Icon,
}: {
    theme: any;
    children: React.ReactNode;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <div
            className="h-9 rounded-full flex items-center justify-center gap-2 font-semibold"
            style={{
                background: "rgba(255,255,255,0.62)",
                border: `1px solid ${theme.stroke}`,
                color: "rgba(8,10,20,0.80)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontSize: 11,
            }}
        >
            {Icon ? <Icon size={14} style={{ opacity: 0.85 }} /> : null}
            {children}
        </div>
    );
}

function NavRow({
    theme,
    label,
    note,
    icon: Icon,
}: {
    theme: any;
    label: string;
    note: string;
    icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2" style={{ background: "rgba(255,255,255,0.62)", border: `1px solid ${theme.stroke}` }}>
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)" }}>
                {Icon ? <Icon size={16} style={{ opacity: 0.8, color: "rgba(8,10,20,0.78)" }} /> : null}
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate" style={{ color: "rgba(8,10,20,0.88)", fontSize: 13, fontWeight: 900 }}>
                    {label}
                </div>
                <div className="truncate" style={{ color: "rgba(8,10,20,0.62)", fontSize: 12, fontWeight: 700 }}>
                    {note}
                </div>
            </div>
            <div className="h-3 w-16 rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
        </div>
    );
}

function PlaceholderLine({ theme, w }: { theme: any; w: string }) {
    return <div className="h-3 rounded" style={{ width: w, background: "rgba(0,0,0,0.06)", border: `1px solid ${theme.stroke}` }} />;
}