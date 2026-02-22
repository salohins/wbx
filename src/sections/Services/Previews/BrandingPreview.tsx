import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Palette, Type, LayoutGrid, Sparkles, Bookmark, Copy, Check } from "lucide-react";

type ChapterId = "overview" | "colors" | "type" | "components";

type Theme = {
    bg: string;
    glowA: string;
    glowB: string;
    ink: string;
    sub: string;
    stroke: string;
    card: string;
    paper: string;

    ribbonA: string;
    ribbonB: string;

    cyan: string;
    blue: string;
    violet: string;
    rose: string;
};

export function BrandingPreview() {
    const [chapter, setChapter] = useState<ChapterId>("overview");
    const [copied, setCopied] = useState<string | null>(null);

    const theme: Theme = useMemo(
        () => ({
            bg: "linear-gradient(135deg, rgba(236,254,255,1) 0%, rgba(224,231,255,1) 35%, rgba(255,241,242,1) 100%)",
            glowA: "rgba(34, 211, 238, 0.26)",
            glowB: "rgba(168, 85, 247, 0.18)",
            ink: "rgba(8, 10, 20, 0.92)",
            sub: "rgba(8, 10, 20, 0.62)",
            stroke: "rgba(0,0,0,0.08)",
            card: "rgba(255,255,255,0.78)",
            paper: "rgba(255,255,255,0.64)",

            ribbonA: "linear-gradient(135deg, rgba(34,211,238,0.60), rgba(37,99,235,0.34), rgba(251,113,133,0.22))",
            ribbonB: "linear-gradient(135deg, rgba(168,85,247,0.52), rgba(34,211,238,0.26), rgba(254,249,195,0.28))",

            cyan: "rgba(34,211,238,0.22)",
            blue: "rgba(37,99,235,0.20)",
            violet: "rgba(168,85,247,0.18)",
            rose: "rgba(251,113,133,0.18)",
        }),
        []
    );

    const chapterMeta = useMemo(() => {
        if (chapter === "overview") return { label: "Overview", page: "01", hint: "Logo + principles + surfaces" };
        if (chapter === "colors") return { label: "Colors", page: "02", hint: "Palette + gradients + states" };
        if (chapter === "type") return { label: "Type", page: "03", hint: "Scale + rhythm + labels" };
        return { label: "UI", page: "04", hint: "Buttons + cards + motion" };
    }, [chapter]);

    const copyToClipboard = async (value: string, key: string) => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // ignore for preview envs
        }
        setCopied(key);
        window.setTimeout(() => setCopied(null), 900);
    };

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* background */}
            <div className="absolute inset-0" style={{ background: theme.bg }} />
            <div
                aria-hidden
                className="pointer-events-none absolute -top-28 -left-28 h-[360px] w-[360px] rounded-full blur-[85px]"
                style={{ background: theme.glowA }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full blur-[95px]"
                style={{ background: theme.glowB }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 22% 28%, rgba(0,0,0,0.14) 0 1px, transparent 2px),
            radial-gradient(circle at 68% 18%, rgba(0,0,0,0.10) 0 1px, transparent 2px),
            radial-gradient(circle at 44% 72%, rgba(0,0,0,0.10) 0 1px, transparent 2px)
          `,
                }}
            />

            {/* layout */}
            <div className="relative h-full w-full p-4 flex flex-col min-h-0">
                {/* top bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="h-10 w-10 rounded-2xl border grid place-items-center"
                            style={{
                                background: "rgba(255,255,255,0.70)",
                                borderColor: theme.stroke,
                                boxShadow: "0 14px 44px rgba(0,0,0,0.10)",
                            }}
                        >
                            <Sparkles size={16} style={{ color: "rgba(8,10,20,0.78)" }} />
                        </div>

                        <div className="min-w-0">
                            <div className="text-[10px] font-semibold uppercase truncate" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                                Branding guidebook
                            </div>
                            <div className="mt-1 font-semibold truncate" style={{ color: theme.ink, fontSize: 15 }}>
                                WebX Design System
                            </div>
                        </div>
                    </div>

                    <motion.button
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        className="h-9 px-4 rounded-xl border font-semibold cursor-pointer"
                        style={{
                            background: "rgba(255,255,255,0.66)",
                            borderColor: theme.stroke,
                            color: theme.ink,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            fontSize: 10,
                        }}
                        onClick={() => copyToClipboard("tokens.json (demo)", "tokens")}
                    >
                        <span className="inline-flex items-center gap-2">
                            {copied === "tokens" ? <Check size={14} /> : <Copy size={14} />}
                            Tokens
                        </span>
                    </motion.button>
                </div>

                {/* compact chapter header (bigger, but not tall) */}
                <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                            Chapter {chapterMeta.page} — {chapterMeta.label}
                        </div>
                        <div className="mt-1 text-[13px] font-semibold truncate" style={{ color: "rgba(8,10,20,0.78)" }}>
                            {chapterMeta.hint}
                        </div>
                    </div>

                    {/* tabs (icons only, stays compact) */}
                    <div
                        className="h-10 rounded-full border p-1 flex items-center gap-1 shrink-0"
                        style={{ background: "rgba(255,255,255,0.62)", borderColor: theme.stroke }}
                    >
                        <IconTab active={chapter === "overview"} onClick={() => setChapter("overview")} icon={<BookOpen size={16} />} theme={theme} />
                        <IconTab active={chapter === "colors"} onClick={() => setChapter("colors")} icon={<Palette size={16} />} theme={theme} />
                        <IconTab active={chapter === "type"} onClick={() => setChapter("type")} icon={<Type size={16} />} theme={theme} />
                        <IconTab active={chapter === "components"} onClick={() => setChapter("components")} icon={<LayoutGrid size={16} />} theme={theme} />
                    </div>
                </div>

                {/* book card */}
                <div className="mt-3 flex-1 min-h-0">
                    <div
                        className="h-full rounded-[26px] border overflow-hidden relative"
                        style={{
                            background: theme.card,
                            borderColor: theme.stroke,
                            boxShadow: "0 22px 80px rgba(0,0,0,0.12)",
                        }}
                    >
                        {/* ribbon */}
                        <div className="absolute left-0 right-0 top-0 h-[10px]" style={{ background: chapter === "colors" ? theme.ribbonA : theme.ribbonB }} />

                        <div className="h-full flex flex-col min-h-0 pt-[10px]">
                            {/* inner strip */}
                            <div className="px-4 py-3 border-b flex items-center justify-between gap-3" style={{ borderColor: theme.stroke, background: "rgba(255,255,255,0.54)" }}>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                                        WebX Guidebook
                                    </div>
                                    <div className="mt-1 text-[12px] truncate" style={{ color: "rgba(8,10,20,0.68)" }}>
                                        Page {chapterMeta.page} • {chapterMeta.label}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Sticker bg={theme.cyan}>GLASS</Sticker>
                                    <Sticker bg={theme.violet}>SWISS</Sticker>
                                    <Sticker bg={theme.rose}>COLOR</Sticker>
                                </div>
                            </div>

                            {/* ✅ BIG content only: one hero + one strip */}
                            <div className="p-4 flex-1 min-h-0 flex flex-col gap-3">
                                <AnimatePresence mode="wait" initial={false}>
                                    {/* ---------------- OVERVIEW ---------------- */}
                                    {chapter === "overview" && (
                                        <motion.div
                                            key="overview"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex-1 min-h-0 flex flex-col gap-3"
                                        >
                                            <HeroPanel
                                                theme={theme}
                                                title="Logo samples"
                                                subtitle="Marks + wordmark options"
                                                accent="linear-gradient(135deg, rgba(34,211,238,0.32), rgba(168,85,247,0.24), rgba(251,113,133,0.18))"
                                            >
                                                <div className="grid grid-cols-4 gap-3">
                                                    <LogoTile theme={theme} variant="X" />
                                                    <LogoTile theme={theme} variant="WX" />
                                                    <LogoTile theme={theme} variant="Orbit" />
                                                    <LogoTile theme={theme} variant="Stack" />
                                                </div>

                                                <div className="mt-3 rounded-2xl border p-4" style={{ background: theme.paper, borderColor: theme.stroke }}>
                                                    <div className="text-[11px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                                                        Wordmark
                                                    </div>
                                                    <div className="mt-2 flex items-end justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="font-semibold truncate" style={{ color: theme.ink, fontSize: 20, letterSpacing: "-0.02em" }}>
                                                                WebX
                                                            </div>
                                                            <div className="mt-1 text-[12px]" style={{ color: "rgba(8,10,20,0.66)" }}>
                                                                Clean. Sharp. Premium.
                                                            </div>
                                                        </div>
                                                        <div className="h-10 w-24 rounded-2xl" style={{ background: "rgba(0,0,0,0.06)" }} />
                                                    </div>
                                                </div>
                                            </HeroPanel>

                                            <BigStrip theme={theme} label="Principles">
                                                <BigPill theme={theme} bg={theme.cyan}>
                                                    Clean <br />hierarchy
                                                </BigPill>
                                                <BigPill theme={theme} bg={theme.violet}>
                                                    Soft glass <br />surfaces
                                                </BigPill>
                                                <BigPill theme={theme} bg={theme.rose}>
                                                    One accent <br />per moment
                                                </BigPill>
                                            </BigStrip>
                                        </motion.div>
                                    )}

                                    {/* ---------------- COLORS ---------------- */}
                                    {chapter === "colors" && (
                                        <motion.div
                                            key="colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex-1 min-h-0 flex flex-col gap-3"
                                        >
                                            <HeroPanel
                                                theme={theme}
                                                title="Palette"
                                                subtitle="Big chips (tap to copy)"
                                                accent="linear-gradient(135deg, rgba(34,211,238,0.32), rgba(37,99,235,0.26), rgba(254,249,195,0.22))"
                                            >
                                                <div className="grid grid-cols-2 gap-3">
                                                    <BigColor
                                                        theme={theme}
                                                        name="Ink"
                                                        hex="#080A14"
                                                        copied={copied === "Ink"}
                                                        onCopy={() => copyToClipboard("#080A14", "Ink")}
                                                    />
                                                    <BigColor
                                                        theme={theme}
                                                        name="Cloud"
                                                        hex="#F8FAFC"
                                                        copied={copied === "Cloud"}
                                                        onCopy={() => copyToClipboard("#F8FAFC", "Cloud")}
                                                    />
                                                    <BigColor
                                                        theme={theme}
                                                        name="Cyan"
                                                        hex="#22D3EE"
                                                        copied={copied === "Cyan"}
                                                        onCopy={() => copyToClipboard("#22D3EE", "Cyan")}
                                                    />
                                                    <BigColor
                                                        theme={theme}
                                                        name="Blue"
                                                        hex="#2563EB"
                                                        copied={copied === "Blue"}
                                                        onCopy={() => copyToClipboard("#2563EB", "Blue")}
                                                    />
                                                </div>

                                                <div className="mt-3 h-11 rounded-2xl border" style={{ background: theme.bg, borderColor: theme.stroke }} />
                                            </HeroPanel>

                                            <BigStrip theme={theme} label="States">
                                                <StatePillBig theme={theme} label="Info" bg="rgba(56,189,248,0.20)" />
                                                <StatePillBig theme={theme} label="Success" bg="rgba(34,197,94,0.18)" />
                                                <StatePillBig theme={theme} label="Focus" bg="rgba(168,85,247,0.18)" />
                                            </BigStrip>
                                        </motion.div>
                                    )}

                                    {/* ---------------- TYPE ---------------- */}
                                    {chapter === "type" && (
                                        <motion.div
                                            key="type"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex-1 min-h-0 flex flex-col gap-3"
                                        >
                                            <HeroPanel
                                                theme={theme}
                                                title="Typography"
                                                subtitle="Big preview (readable)"
                                                accent="linear-gradient(135deg, rgba(168,85,247,0.26), rgba(34,211,238,0.22), rgba(251,113,133,0.18))"
                                            >
                                                <div className="rounded-2xl border p-5" style={{ background: theme.paper, borderColor: theme.stroke }}>
                                                    <div className="text-[11px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                                                        Example
                                                    </div>

                                                    <div className="mt-3 font-semibold" style={{ color: theme.ink, fontSize: 26, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                                                        Clean wins.
                                                    </div>

                                                    <div className="mt-2 text-[14px] leading-relaxed" style={{ color: "rgba(8,10,20,0.70)" }}>
                                                        Short lines, calm spacing, and crisp labels make it feel expensive.
                                                    </div>

                                                    <div className="mt-4 flex items-center gap-2">
                                                        <span
                                                            className="h-8 px-3 rounded-full inline-flex items-center font-semibold"
                                                            style={{
                                                                background: theme.cyan,
                                                                border: `1px solid ${theme.stroke}`,
                                                                color: theme.ink,
                                                                letterSpacing: "0.18em",
                                                                textTransform: "uppercase",
                                                                fontSize: 11,
                                                            }}
                                                        >
                                                            LABELS
                                                        </span>
                                                        <span
                                                            className="h-8 px-3 rounded-full inline-flex items-center font-semibold"
                                                            style={{
                                                                background: theme.violet,
                                                                border: `1px solid ${theme.stroke}`,
                                                                color: theme.ink,
                                                                letterSpacing: "0.18em",
                                                                textTransform: "uppercase",
                                                                fontSize: 11,
                                                            }}
                                                        >
                                                            TRACKING
                                                        </span>
                                                    </div>
                                                </div>
                                            </HeroPanel>

                                            <BigStrip theme={theme} label="Scale">
                                                <ScalePill theme={theme} name="Display" px="26px" />
                                                <ScalePill theme={theme} name="Heading" px="18px" />
                                                <ScalePill theme={theme} name="Body" px="14px" />
                                            </BigStrip>
                                        </motion.div>
                                    )}

                                    {/* ---------------- UI ---------------- */}
                                    {chapter === "components" && (
                                        <motion.div
                                            key="components"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex-1 min-h-0 flex flex-col gap-3"
                                        >
                                            <HeroPanel
                                                theme={theme}
                                                title="UI kit"
                                                subtitle="Big components (not tiny)"
                                                accent="linear-gradient(135deg, rgba(34,211,238,0.26), rgba(254,249,195,0.22), rgba(168,85,247,0.18))"
                                            >
                                                <div className="rounded-2xl border p-5" style={{ background: theme.paper, borderColor: theme.stroke }}>
                                                    <div className="flex items-center gap-2">
                                                        <PrimaryBtnBig>Primary</PrimaryBtnBig>
                                                        <GhostBtnBig theme={theme}>Ghost</GhostBtnBig>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                                        <BigTile theme={theme} title="Card" />
                                                        <BigTile theme={theme} title="Pill" />
                                                    </div>
                                                </div>
                                            </HeroPanel>

                                            <BigStrip theme={theme} label="Motion">
                                                <div className="flex-1 rounded-2xl border px-4 py-3" style={{ background: "rgba(255,255,255,0.62)", borderColor: theme.stroke }}>
                                                    <div className="text-[11px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                                                        Subtle sweep
                                                    </div>
                                                    <div className="mt-3 h-3 w-full rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                                                        <motion.div
                                                            className="h-full rounded-full"
                                                            style={{ width: "62%", background: "rgba(0,0,0,0.18)" }}
                                                            animate={{ x: ["-22%", "10%", "-22%"] }}
                                                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                                        />
                                                    </div>
                                                </div>
                                            </BigStrip>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* inner footer */}
                            <div className="px-4 pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-12 rounded-full" style={{ background: theme.cyan }} />
                                        <div className="h-2 w-8 rounded-full" style={{ background: theme.violet }} />
                                        <div className="h-2 w-16 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }} />
                                    </div>
                                    <div className="text-[10px] font-semibold" style={{ color: "rgba(8,10,20,0.56)", letterSpacing: "0.18em" }}>
                                        {chapterMeta.page} / 04
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* outer footer */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-28 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }} />
                        <div className="h-9 w-16 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }} />
                    </div>
                    <div className="h-9 w-24 rounded-full" style={{ background: "rgba(255,255,255,0.60)", border: `1px solid ${theme.stroke}` }} />
                </div>
            </div>
        </div>
    );
}

/* -------------------- small UI bits -------------------- */

function IconTab({
    active,
    onClick,
    icon,
    theme,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    theme: Theme;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative h-8 w-9 rounded-full grid place-items-center cursor-pointer select-none"
            style={{
                background: active ? "rgba(255,255,255,0.80)" : "transparent",
                border: active ? `1px solid ${theme.stroke}` : "1px solid transparent",
                color: theme.ink,
            }}
        >
            {active && (
                <motion.div
                    layoutId="brandingIconTab"
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 12px 38px rgba(0,0,0,0.10)" }}
                    transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.9 }}
                />
            )}
            <span className="relative z-[1]">{icon}</span>
        </button>
    );
}

function Sticker({ children, bg }: { children: React.ReactNode; bg: string }) {
    return (
        <div
            className="h-8 px-3 rounded-full border flex items-center font-semibold"
            style={{
                background: bg,
                borderColor: "rgba(0,0,0,0.08)",
                color: "rgba(8,10,20,0.84)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: 10,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </div>
    );
}

function HeroPanel({
    theme,
    title,
    subtitle,
    accent,
    children,
}: {
    theme: Theme;
    title: string;
    subtitle: string;
    accent: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 min-h-0 rounded-[24px] border overflow-hidden" style={{ borderColor: theme.stroke, background: theme.card }}>
            <div className="h-[12px]" style={{ background: accent }} />
            <div className="p-4 h-full min-h-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                            {title}
                        </div>
                        <div className="mt-1 text-[15px] font-semibold truncate" style={{ color: theme.ink }}>
                            {subtitle}
                        </div>
                    </div>
                    <div className="h-10 w-12 rounded-2xl border" style={{ background: "rgba(0,0,0,0.05)", borderColor: theme.stroke }} />
                </div>

                <div className="mt-3">{children}</div>
            </div>
        </div>
    );
}

function BigStrip({ theme, label, children }: { theme: Theme; label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-[22px] border px-4 py-3" style={{ background: "rgba(255,255,255,0.60)", borderColor: theme.stroke }}>
            <div className="text-[11px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                {label}
            </div>
            <div className="mt-3 flex items-center gap-2">{children}</div>
        </div>
    );
}

function BigPill({ theme, bg, children }: { theme: Theme; bg: string; children: React.ReactNode }) {
    return (
        <div
            className="h-10 px-4 rounded-full border flex items-center font-semibold"
            style={{
                background: bg,
                borderColor: theme.stroke,
                color: "rgba(8,10,20,0.84)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontSize: 11,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </div>
    );
}

/* -------------------- Logos -------------------- */

function LogoTile({ theme, variant }: { theme: Theme; variant: "X" | "WX" | "Orbit" | "Stack" }) {
    return (
        <div
            className="rounded-2xl border p-3 grid place-items-center"
            style={{
                background: "rgba(255,255,255,0.62)",
                borderColor: theme.stroke,
                boxShadow: "0 12px 34px rgba(0,0,0,0.10)",
            }}
        >
            {variant === "X" && <LogoMarkX theme={theme} />}
            {variant === "WX" && <LogoMarkWX theme={theme} />}
            {variant === "Orbit" && <LogoMarkOrbit theme={theme} />}
            {variant === "Stack" && <LogoMarkStack theme={theme} />}
        </div>
    );
}

function LogoMarkX({ theme }: { theme: Theme }) {
    return (
        <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-2xl" style={{ background: theme.cyan }} />
            <div className="absolute inset-0 rounded-2xl rotate-45" style={{ background: theme.violet }} />
            <div className="absolute inset-0 grid place-items-center">
                <div className="text-[18px] font-black" style={{ color: theme.ink, letterSpacing: "-0.02em" }}>
                    X
                </div>
            </div>
        </div>
    );
}

function LogoMarkWX({ theme }: { theme: Theme }) {
    return (
        <div className="relative h-14 w-14 rounded-2xl border overflow-hidden" style={{ borderColor: theme.stroke }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.45), rgba(37,99,235,0.28), rgba(251,113,133,0.22))" }} />
            <div className="absolute inset-0 grid place-items-center">
                <div className="text-[16px] font-black" style={{ color: theme.ink, letterSpacing: "-0.02em" }}>
                    WX
                </div>
            </div>
        </div>
    );
}

function LogoMarkOrbit({ theme }: { theme: Theme }) {
    return (
        <div className="relative h-14 w-14 rounded-2xl border grid place-items-center" style={{ borderColor: theme.stroke }}>
            <div className="absolute inset-0 rounded-2xl" style={{ background: "rgba(0,0,0,0.04)" }} />
            <div className="absolute h-12 w-12 rounded-full border" style={{ borderColor: "rgba(0,0,0,0.12)" }} />
            <div className="absolute h-9 w-9 rounded-full border" style={{ borderColor: "rgba(0,0,0,0.12)" }} />
            <div className="h-3 w-3 rounded-full" style={{ background: theme.cyan }} />
        </div>
    );
}

function LogoMarkStack({ theme }: { theme: Theme }) {
    return (
        <div className="relative h-14 w-14 grid place-items-center">
            <div className="absolute h-10 w-10 rounded-2xl" style={{ background: theme.blue }} />
            <div className="absolute h-10 w-10 rounded-2xl translate-x-2 -translate-y-2" style={{ background: theme.cyan }} />
            <div className="absolute h-10 w-10 rounded-2xl -translate-x-2 translate-y-2" style={{ background: theme.violet }} />
        </div>
    );
}

/* -------------------- Colors -------------------- */

function BigColor({
    theme,
    name,
    hex,
    onCopy,
    copied,
}: {
    theme: Theme;
    name: string;
    hex: string;
    onCopy: () => void;
    copied: boolean;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={onCopy}
            className="rounded-2xl border p-4 text-left cursor-pointer"
            style={{ background: "rgba(255,255,255,0.62)", borderColor: theme.stroke }}
            title="Copy hex"
        >
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl border" style={{ background: hex, borderColor: "rgba(0,0,0,0.12)" }} />
                <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold truncate" style={{ color: theme.ink }}>
                        {name}
                    </div>
                    <div className="mt-1 text-[12px]" style={{ color: "rgba(8,10,20,0.66)" }}>
                        {hex}
                    </div>
                </div>
                <div className="h-9 w-9 rounded-xl border grid place-items-center" style={{ background: "rgba(255,255,255,0.62)", borderColor: theme.stroke }}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </div>
            </div>
        </motion.button>
    );
}

function StatePillBig({ theme, label, bg }: { theme: Theme; label: string; bg: string }) {
    return (
        <div
            className="h-10 px-4 rounded-full border flex items-center justify-center font-semibold"
            style={{
                background: bg,
                borderColor: theme.stroke,
                color: "rgba(8,10,20,0.82)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 10,
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </div>
    );
}

/* -------------------- Type -------------------- */

function ScalePill({ theme, name, px }: { theme: Theme; name: string; px: string }) {
    return (
        <div
            className="h-10 px-4 rounded-full border flex items-center font-semibold"
            style={{
                background: "rgba(255,255,255,0.62)",
                borderColor: theme.stroke,
                color: "rgba(8,10,20,0.82)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 10,
                whiteSpace: "nowrap",
            }}
        >
            {name} • {px}
        </div>
    );
}

/* -------------------- UI -------------------- */

function PrimaryBtnBig({ children }: { children: React.ReactNode }) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-11 px-6 rounded-full font-semibold cursor-pointer"
            style={{
                background: "rgba(8,10,20,0.92)",
                color: "white",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 11,
                boxShadow: "0 16px 44px rgba(0,0,0,0.16)",
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </motion.button>
    );
}

function GhostBtnBig({ theme, children }: { theme: Theme; children: React.ReactNode }) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-11 px-6 rounded-full font-semibold cursor-pointer border"
            style={{
                background: "rgba(255,255,255,0.60)",
                borderColor: theme.stroke,
                color: theme.ink,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: 11,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </motion.button>
    );
}

function BigTile({ theme, title }: { theme: Theme; title: string }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl border p-4"
            style={{
                background: "rgba(255,255,255,0.62)",
                borderColor: theme.stroke,
                boxShadow: "0 14px 44px rgba(0,0,0,0.10)",
            }}
        >
            <div className="text-[11px] font-semibold uppercase" style={{ color: theme.sub, letterSpacing: "0.22em" }}>
                {title}
            </div>
            <div className="mt-3 h-3 w-[80%] rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
            <div className="mt-2 h-3 w-[64%] rounded" style={{ background: "rgba(0,0,0,0.06)" }} />

        </motion.div>
    );
}
