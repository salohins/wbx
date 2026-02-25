// sections/Faq/Faq.tsx
import React from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { SnapSection } from "../../components/SnapSection2"; // same as Services

type FaqItem = {
    id: string;
    q: string;
    a: React.ReactNode;
    tag?: string;
};

const FAQ: FaqItem[] = [
    {
        id: "timeline",
        tag: "Timing",
        q: "Wie schnell kann ein Projekt umgesetzt werden?",
        a: (
            <>
                In vielen Fällen liefern wir innerhalb weniger Tage – nicht erst nach Wochen – dank eines klaren
                Workflows (UX → Design → Build → QA). Der genaue Zeitrahmen hängt vom Umfang sowie davon ab,
                wie schnell Inhalte und Feedback verfügbar sind.
            </>
        ),
    },
    {
        id: "start",
        tag: "Kick-off",
        q: "Was benötigen Sie für den Projektstart?",
        a: (
            <>
                Ein kurzes Briefing, Ihr Logo bzw. Basis-Branding (falls vorhanden) sowie 2–3 Websites als Referenz,
                die Ihnen gefallen. Wenn Inhalte noch fehlen, unterstützen wir Sie bei Struktur und Textaufbau.
            </>
        ),
    },
    {
        id: "edit",
        tag: "CMS",
        q: "Können wir die Website später selbst bearbeiten?",
        a: (
            <>
                Ja. Sie erhalten eine übersichtliche Admin-Oberfläche, mit der Sie Services, Seiten, Referenzen und
                weitere Inhalte pflegen können – ganz ohne Programmierkenntnisse.
            </>
        ),
    },
    {
        id: "perf",
        tag: "Performance",
        q: "Ist die Website mobile-first und schnell?",
        a: (
            <>
                Ja. Wir entwickeln konsequent mobile-first und optimieren die Performance durch moderne Assets,
                Lazy-Loading, sauberes Layout und ein sinnvolles Animations-Budget.
            </>
        ),
    },
    {
        id: "hosting",
        tag: "Setup",
        q: "Übernehmen Sie Hosting und Domain?",
        a: (
            <>
                Gerne – entweder mit Ihrem bestehenden Anbieter oder auf Basis unserer Empfehlung. Auf Wunsch
                richten wir Domain, SSL, Analytics sowie E-Mail-Routing ein.
            </>
        ),
    },
    {
        id: "seo",
        tag: "SEO",
        q: "Unterstützen Sie SEO?",
        a: (
            <>
                Technische SEO-Grundlagen sind enthalten (Meta-Daten, Sitemap/Robots, Struktur). Erweiterte SEO-
                Massnahmen und Content-Strategie können optional ergänzt werden.
            </>
        ),
    },
];

export function FaqSection() {
    const [expanded, setExpanded] = React.useState<string>(FAQ[0]?.id ?? "");

    return (
        <SnapSection
            sectionId="faq"
            className="relative w-full"
            title="FAQ"
            subtitle="Kurze Antworten. Klar und auf den Punkt."
            desktopAlign="center"
            mobileSliderMode="peek"
        >
            {/* ✅ DESKTOP: two columns */}
            <div className="hidden lg:block w-full">
                <div className="relative flex w-full items-center py-16 md:py-0">
                    <div className="w-full">
                        <div className="mx-auto w-full">
                            <LayoutGroup id="faq-desktop">
                                <motion.div
                                    layout
                                    transition={{
                                        layout: { type: "spring", stiffness: 520, damping: 44, mass: 0.9 },
                                    }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    {(() => {
                                        const left = FAQ.filter((_, i) => i % 2 === 0);
                                        const right = FAQ.filter((_, i) => i % 2 === 1);

                                        return (
                                            <>
                                                {/* Left column */}
                                                <div className="space-y-4">
                                                    {left.map((item) => {
                                                        const idx = FAQ.findIndex((x) => x.id === item.id);
                                                        return (
                                                            <div key={item.id}>
                                                                <FaqAccordionRow
                                                                    item={item}
                                                                    index={String(idx + 1).padStart(2, "0")}
                                                                    expanded={expanded === item.id}
                                                                    onToggle={() =>
                                                                        setExpanded((cur) => (cur === item.id ? "" : item.id))
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Right column */}
                                                <div className="space-y-4">
                                                    {right.map((item) => {
                                                        const idx = FAQ.findIndex((x) => x.id === item.id);
                                                        return (
                                                            <div key={item.id}>
                                                                <FaqAccordionRow
                                                                    item={item}
                                                                    index={String(idx + 1).padStart(2, "0")}
                                                                    expanded={expanded === item.id}
                                                                    onToggle={() =>
                                                                        setExpanded((cur) => (cur === item.id ? "" : item.id))
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </motion.div>
                            </LayoutGroup>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ MOBILE: swipe slides */}
            <div className="lg:hidden h-full w-full">
                <div className="h-full w-full px-6 py-10">
                    <div className="mb-8">
                        <div className="text-[11px] tracking-[0.34em] text-white/55 uppercase">004 — FAQ</div>
                    </div>

                    <div className="mx-auto w-full max-w-[560px] space-y-3">
                        {FAQ.map((item, idx) => (
                            <SnapSection.Slide key={item.id} id={`faq:${item.id}`} order={idx}>
                                <FaqMobileSlide item={item} index={idx + 1} total={FAQ.length} />
                            </SnapSection.Slide>
                        ))}
                    </div>
                </div>
            </div>
        </SnapSection>
    );
}

/* -------------------- Desktop Accordion Row -------------------- */

function FaqAccordionRow({
    item,
    index,
    expanded,
    onToggle,
}: {
    item: FaqItem;
    index: string;
    expanded: boolean;
    onToggle: () => void;
}) {
    const baseShadow = expanded ? "0 26px 90px rgba(0,0,0,0.20)" : "0 18px 52px rgba(0,0,0,0.14)";

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
        }
    };

    return (
        <motion.div
            layout="size"
            transition={{
                layout: { type: "spring", stiffness: 520, damping: 46, mass: 0.95 },
            }}
            className={[
                "relative w-full overflow-hidden rounded-2xl",
                "bg-white/85 dark:bg-neutral-900/70",
                "border border-black/5 dark:border-white/10",
                "backdrop-blur-md",
                "transform-gpu will-change-transform",
            ].join(" ")}
            style={{ boxShadow: baseShadow }}
        >
            <div
                data-no-drag
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                onClick={onToggle}
                onKeyDown={onKeyDown}
                className="w-full text-left px-7 py-6 flex items-start gap-5 focus:outline-none cursor-pointer select-none"
            >
                <div className="shrink-0 pt-1">
                    <div className="text-[12px] tracking-[0.24em] text-neutral-600 dark:text-white/70">{index}</div>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                            <div className="text-[22px] leading-tight font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                                {item.q}
                            </div>
                            {item.tag && (
                                <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-[10px] tracking-[0.22em] uppercase bg-black/5 text-neutral-900/80 dark:bg-white/10 dark:text-white/80">
                                    {item.tag}
                                </div>
                            )}
                        </div>

                        <motion.div
                            animate={{ rotate: expanded ? 180 : 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="shrink-0 mt-1"
                            aria-hidden
                        >
                            <div className="h-9 w-9 rounded-full border border-black/10 dark:border-white/15 flex items-center justify-center">
                                <div className="h-2 w-2 border-r-2 border-b-2 border-neutral-900/70 dark:border-white/70 rotate-45 translate-y-[-1px]" />
                            </div>
                        </motion.div>
                    </div>

                    <AnimatePresence initial={false}>
                        {expanded && (
                            <motion.div
                                key="content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    height: { type: "spring", stiffness: 420, damping: 40, mass: 0.9 },
                                    opacity: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                                }}
                                className="overflow-hidden"
                            >
                                <div className="pt-5 text-[16px] leading-relaxed text-neutral-700 dark:text-white/80 max-w-[760px]">
                                    {item.a}
                                </div>


                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

/* -------------------- Mobile Slide Card -------------------- */

function FaqMobileSlide({
    item,
    index,
    total,
}: {
    item: { q: string; a: React.ReactNode; tag?: string };
    index: number;
    total: number;
}) {
    return (
        <div className="w-full max-w-[560px]">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-600 dark:text-white/60">
                    Frage {index} / {total}
                </span>

                {item.tag && (
                    <span
                        className={[
                            "px-2.5 py-1 rounded-full text-[11px] font-medium",
                            "bg-neutral-900 text-white",
                            "dark:bg-white/12 dark:text-white/90",
                        ].join(" ")}
                    >
                        {item.tag}
                    </span>
                )}
            </div>

            <div
                className={[
                    "rounded-3xl border backdrop-blur-md p-6",
                    "bg-white/85 border-black/10",
                    "dark:bg-white/10 dark:border-white/12",
                ].join(" ")}
            >
                <h4 className={["text-[22px] font-semibold tracking-[-0.02em] leading-tight", "text-neutral-900 dark:text-white"].join(" ")}>
                    {item.q}
                </h4>

                <div className={["mt-3 text-[16px] leading-relaxed", "text-neutral-600 dark:text-white/75"].join(" ")}>
                    {item.a}
                </div>


            </div>

            <p className="mt-4 text-xs text-neutral-500 dark:text-white/45 text-center">
                Wischen Sie nach links/rechts für weitere Fragen
            </p>
        </div>
    );
}