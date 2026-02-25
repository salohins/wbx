// sections/About/StatsDashboardSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { SnapSection } from "../../components/SnapSection2";

/* -------------------- UI primitives -------------------- */

function Panel({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={[
                "relative overflow-hidden rounded-[28px] border w-full",
                "border-black/10 dark:border-white/12",
                "bg-white/85 dark:bg-neutral-950/60",
                "backdrop-blur-xl",
                "shadow-[0_18px_60px_rgba(0,0,0,0.10)] dark:shadow-[0_26px_90px_rgba(0,0,0,0.40)]",
                className,
            ].join(" ")}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-0 right-0 h-48 bg-gradient-to-b from-white/60 via-white/10 to-transparent dark:from-white/12 dark:via-transparent dark:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/14 via-transparent to-black/5 dark:from-white/10 dark:to-black/25" />
            </div>
            <div className="relative">{children}</div>
        </div>
    );
}

function Chip({
    label,
    variant = "neutral",
}: {
    label: string;
    variant?: "neutral" | "good" | "info" | "warn";
}) {
    const styles: Record<typeof variant, string> = {
        neutral:
            "bg-black/5 text-neutral-900/80 dark:bg-white/10 dark:text-white/80 border-black/10 dark:border-white/12",
        good:
            "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border-emerald-500/20 dark:border-emerald-400/20",
        info:
            "bg-blue-500/10 text-blue-900 dark:text-blue-200 border-blue-500/20 dark:border-blue-400/20",
        warn:
            "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/20 dark:border-amber-400/20",
    };

    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-3 py-1",
                "text-[10px] font-medium tracking-[0.22em] uppercase",
                styles[variant],
            ].join(" ")}
        >
            {label}
        </span>
    );
}

function Divider() {
    return <div className="h-px w-full bg-black/10 dark:bg-white/10" />;
}

function StatLine({
    label,
    sub,
    value,
}: {
    label: string;
    sub: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
                <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                    {label}
                </div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-white/65">
                    {sub}
                </div>
            </div>
            <div className="shrink-0 text-[18px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {value}
            </div>
        </div>
    );
}

function MiniBar({
    label,
    value,
    pct,
    variant = "info",
}: {
    label: string;
    value: string;
    pct: number;
    variant?: "good" | "info" | "warn" | "neutral";
}) {
    const fill: Record<typeof variant, string> = {
        neutral: "bg-black/20 dark:bg-white/18",
        good: "bg-emerald-500/35 dark:bg-emerald-400/30",
        info: "bg-blue-500/35 dark:bg-blue-400/30",
        warn: "bg-amber-500/35 dark:bg-amber-400/30",
    };

    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/12 bg-white/60 dark:bg-white/6 backdrop-blur-md px-4 py-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-medium text-neutral-700 dark:text-white/70">
                    {label}
                </div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {value}
                </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className={["h-full rounded-full", fill[variant]].join(" ")}
                />
            </div>
        </div>
    );
}

/* -------------------- Section -------------------- */

export function StatsDashboardSection() {
    return (
        <SnapSection
            sectionId="stats"
            title="Auf einen Blick"
            subtitle="Eine klare Übersicht darüber, wie wir arbeiten."
            className="text-neutral-900 dark:text-white"
            maxWidth="max-w-7xl"
            desktopAlign="center"
            mobileSliderMode="peek"
            mobilePeekGutterPx={26}
            clipBleed={false}
        >
            {/* DESKTOP (unchanged strict layout) */}
            <div className="hidden lg:block w-full">
                <div className="mx-auto w-full max-w-[1200px]">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-5 row-span-2">
                            <SnapSection.Slide id="stats:overview" order={0}>
                                <Panel className="h-full">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                                                Übersicht
                                            </div>
                                            <Chip label="Zug, CH" variant="info" />
                                        </div>

                                        <div className="mt-6 space-y-6">
                                            <StatLine label="Erfahrung" sub="Kombinierte Team-Erfahrung" value="10+ Jahre" />
                                            <Divider />
                                            <StatLine
                                                label="Umsetzung"
                                                sub="Strategie → Design → Entwicklung"
                                                value="End-to-End"
                                            />
                                            <Divider />
                                            <StatLine
                                                label="Leistungsumfang"
                                                sub="Websites, Dashboards, Automationen"
                                                value="Web → Systeme"
                                            />
                                        </div>

                                        <div className="mt-8 flex flex-wrap gap-2">
                                            <Chip label="Schnelle Umsetzung" variant="good" />
                                            <Chip label="Zuverlässige Lieferung" variant="neutral" />
                                            <Chip label="Skalierbare Builds" variant="warn" />
                                        </div>
                                    </div>
                                </Panel>
                            </SnapSection.Slide>
                        </div>

                        <div className="col-span-7">
                            <SnapSection.Slide id="stats:stack" order={1}>
                                <Panel className="h-full">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                                                Moderner Stack
                                            </div>
                                            <Chip label="Aktuell" variant="good" />
                                        </div>

                                        <div className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                                            React / Next.js / Node / Supabase / SQL
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-4">
                                            <MiniBar label="Frontend" value="React + Next" pct={88} variant="info" />
                                            <MiniBar label="Backend" value="Node + APIs" pct={82} variant="good" />
                                            <MiniBar label="Daten" value="Supabase + SQL" pct={84} variant="warn" />
                                            <MiniBar label="Qualität" value="Saubere Architektur" pct={86} variant="neutral" />
                                        </div>
                                    </div>
                                </Panel>
                            </SnapSection.Slide>
                        </div>

                        <div className="col-span-7">
                            <SnapSection.Slide id="stats:workflow" order={2}>
                                <Panel className="h-full">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                                                Workflow
                                            </div>
                                            <Chip label="Pipeline" variant="info" />
                                        </div>

                                        <div className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                                            Strukturiert. Schnell. Wiederholbar.
                                        </div>

                                        <div className="mt-6 grid grid-cols-3 gap-4">
                                            <MiniBar label="Strategie" value="Klarer Umfang" pct={92} variant="info" />
                                            <MiniBar label="Build" value="Schnelle Umsetzung" pct={88} variant="good" />
                                            <MiniBar label="Go-Live" value="Zuverlässige Lieferung" pct={90} variant="neutral" />
                                        </div>
                                    </div>
                                </Panel>
                            </SnapSection.Slide>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE: fit-to-slide, no max-width wrappers */}
            <div className="lg:hidden w-full h-full">
                <div className="h-full w-full px-4 py-10">
                    <div className="mb-7">
                        <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                            005 — ÜBERSICHT
                        </div>
                    </div>

                    {/* ✅ Important: this wrapper MUST be w-full without max-w */}
                    <div className="w-full space-y-3">
                        <SnapSection.Slide id="stats:overview" order={0}>
                            <Panel>
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                                            Übersicht
                                        </div>
                                        <Chip label="Zug, CH" variant="info" />
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        <StatLine label="Erfahrung" sub="Kombinierte Team-Erfahrung" value="10+ Jahre" />
                                        <Divider />
                                        <StatLine
                                            label="Umsetzung"
                                            sub="Strategie → Design → Entwicklung"
                                            value="End-to-End"
                                        />
                                        <Divider />
                                        <StatLine
                                            label="Leistungsumfang"
                                            sub="Websites, Dashboards, Automationen"
                                            value="Web → Systeme"
                                        />
                                    </div>
                                </div>
                            </Panel>
                        </SnapSection.Slide>

                        <SnapSection.Slide id="stats:stack" order={1}>
                            <Panel>
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                                            Moderner Stack
                                        </div>
                                        <Chip label="Aktuell" variant="good" />
                                    </div>

                                    <div className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                                        React / Next.js / Node / Supabase / SQL
                                    </div>

                                    <div className="mt-5 grid grid-cols-1 gap-3">
                                        <MiniBar label="Frontend" value="React + Next" pct={88} variant="info" />
                                        <MiniBar label="Backend" value="Node + APIs" pct={82} variant="good" />
                                        <MiniBar label="Daten" value="Supabase + SQL" pct={84} variant="warn" />
                                    </div>
                                </div>
                            </Panel>
                        </SnapSection.Slide>

                        <SnapSection.Slide id="stats:workflow" order={2}>
                            <Panel>
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                                            Workflow
                                        </div>
                                        <Chip label="Pipeline" variant="info" />
                                    </div>

                                    <div className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                                        Strukturiert. Schnell. Wiederholbar.
                                    </div>

                                    <div className="mt-5 grid grid-cols-1 gap-3">
                                        <MiniBar label="Strategie" value="Klarer Umfang" pct={92} variant="info" />
                                        <MiniBar label="Build" value="Schnelle Umsetzung" pct={88} variant="good" />
                                        <MiniBar label="Go-Live" value="Zuverlässige Lieferung" pct={90} variant="neutral" />
                                    </div>
                                </div>
                            </Panel>
                        </SnapSection.Slide>

                        <SnapSection.Slide id="stats:range" order={3}>
                            <Panel>
                                <div className="p-5">
                                    <div className="text-[11px] tracking-[0.34em] uppercase text-neutral-600 dark:text-white/55">
                                        Leistungsbereich
                                    </div>
                                    <div className="mt-2 text-[16px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                                        Websites → Dashboards → Automationen
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Chip label="Websites" />
                                        <Chip label="Dashboards" variant="info" />
                                        <Chip label="Automationen" variant="warn" />
                                        <Chip label="Interne Tools" variant="good" />
                                    </div>
                                </div>
                            </Panel>
                        </SnapSection.Slide>
                    </div>
                </div>
            </div>
        </SnapSection>
    );
}