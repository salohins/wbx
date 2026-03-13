// sections/About/AboutUsSection.tsx
import React from "react";
import { SnapSection } from "../../components/SnapSection2";

/**
 * Minimal / premium:
 * - Keep the best desktop layout
 * - Mobile slides = FAQ-style card
 * - SAME content model for both
 * - No CTAs (Contact / See work removed everywhere)
 */

const ABOUT = [
    {
        id: "who",

        title: "Wir schaffen digitale Grundlagen – nicht nur einzelne Websites.",
        body: (
            <>
                Wir sind ein Team aus der Schweiz und verbinden Strategie, Design und Entwicklung.
                So entsteht ein sauberes, wartbares System: schnell im Alltag und bereit zu wachsen –
                von neuen Landingpages über Integrationen bis hin zu Admin-Panels und internen Tools.
            </>
        ),
        tags: ["Strategie", "Design", "Engineering", "Systeme"],
    },
    {
        id: "collab",
        kicker: "Zusammenarbeit",
        title: "Direkter Austausch.",
        body: (
            <>
                Sie arbeiten direkt mit den Menschen, die umsetzen. Weniger Abstimmungsschlaufen,
                schnellere Iterationen, klarere Entscheidungen – und dauerhaft hohe Qualität,
                weil Kommunikation präzise bleibt.
            </>
        ),
        tag: "Workflow",
    },
    {
        id: "scale",
        kicker: "Ergebnis",
        title: "Für Wachstum gebaut.",
        body: (
            <>
                Strukturierte Komponenten und eine saubere Architektur: leicht zu pflegen und jederzeit erweiterbar,
                wenn neue Seiten, Funktionen oder interne Tools dazukommen.
            </>
        ),
        tag: "Skalierung",
    },
] as const;

function Hairline() {
    return <div className="h-px w-full bg-neutral-900/10 dark:bg-white/10" />;
}

function DesktopHeroCard({ item }: { item: (typeof ABOUT)[number] }) {
    return (
        <div className="rounded-[32px] border border-neutral-900/10 dark:border-white/10 bg-white/55 dark:bg-neutral-950/30 backdrop-blur-xl overflow-hidden">
            <div className="p-10">
                <div className="text-xs tracking-[0.22em] uppercase text-neutral-600 dark:text-white/60">
                    {item.kicker}
                </div>

                <h3 className="mt-3 text-[42px] leading-[1.05] font-semibold tracking-tight text-neutral-900 dark:text-white">
                    {item.title}
                </h3>

                <div className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-700 dark:text-white/70">
                    {item.body}
                </div>

                {"tags" in item && item.tags?.length ? (
                    <div className="mt-8">
                        <Hairline />
                        <div className="mt-5 flex flex-wrap gap-1">
                            {item.tags.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full border border-neutral-900/10 dark:border-white/10 bg-white/55 dark:bg-white/5 px-3 py-1 text-xs text-neutral-700 dark:text-white/70"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function MicroPoint({
    kicker,
    title,
    body,
}: {
    kicker: string;
    title: string;
    body: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-neutral-900/10 dark:border-white/10 bg-white/50 dark:bg-neutral-950/25 backdrop-blur-xl p-5">
            <div className="text-[11px] tracking-[0.26em] uppercase text-neutral-600 dark:text-white/55">
                {kicker}
            </div>
            <div className="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">
                {title}
            </div>
            <div className="mt-2 text-lg leading-relaxed text-neutral-600 dark:text-white/65">
                {body}
            </div>
        </div>
    );
}

/* ✅ MOBILE: FAQ-style slide card (clean, minimal, no buttons) */
function AboutMobileSlide({
    item,
    index,
    total,
}: {
    item: (typeof ABOUT)[number];
    index: number;
    total: number;
}) {
    return (
        <div className="w-full max-w-[560px]">
            <div className="mb-3 flex items-center justify-between">
                {"tag" in item && item.tag ? (
                    <span
                        className={[
                            "px-2.5 py-1 rounded-full text-[11px] font-medium",
                            "bg-neutral-900 text-white",
                            "dark:bg-white/12 dark:text-white/90",
                        ].join(" ")}
                    >
                        {item.tag}
                    </span>
                ) : (
                    <span className="text-xs font-medium text-neutral-500 dark:text-white/45">
                        {index}/{total}
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
                <h4 className="text-[22px] font-semibold tracking-[-0.02em] leading-tight text-neutral-900 dark:text-white">
                    {item.title}
                </h4>

                <div className="mt-3 text-[16px] leading-relaxed text-neutral-600 dark:text-white/75">
                    {item.body}
                </div>

                {"tags" in item && item.tags?.length ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {item.tags.map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-black/10 dark:border-white/12 bg-black/5 dark:bg-white/10 px-3 py-1 text-[11px] font-medium text-neutral-900/80 dark:text-white/80"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>

            <p className="mt-4 text-xs text-neutral-500 dark:text-white/45 text-center">
                Wischen Sie nach links/rechts für weitere Inhalte
            </p>
        </div>
    );
}

export function AboutUsSection() {
    return (
        <SnapSection
            sectionId="about"
            title="Über uns"
            subtitle="Wer wir sind"
            className="text-neutral-900 dark:text-white"
            maxWidth="max-w-7xl"
            desktopAlign="center"
            mobileSliderMode="peek"
            mobilePeekGutterPx={26}
            clipBleed={false}
        >
            {/* ✅ DESKTOP: best layout, minimal overlays */}
            <div className="hidden lg:grid grid-cols-12 gap-6 items-stretch">
                <div className="col-span-7">
                    <SnapSection.Slide id="about:who" order={0}>
                        <DesktopHeroCard item={ABOUT[0]} />
                    </SnapSection.Slide>
                </div>

                <div className="col-span-5 grid grid-rows-2 gap-6">
                    <SnapSection.Slide id="about:collab" order={1}>
                        <MicroPoint kicker={ABOUT[1].kicker} title={ABOUT[1].title} body={ABOUT[1].body} />
                    </SnapSection.Slide>

                    <SnapSection.Slide id="about:scale" order={2}>
                        <MicroPoint kicker={ABOUT[2].kicker} title={ABOUT[2].title} body={ABOUT[2].body} />
                    </SnapSection.Slide>
                </div>
            </div>

            {/* ✅ MOBILE: same content model, FAQ-style slides */}
            <div className="lg:hidden h-full w-full">
                <div className="h-full w-full px-6 py-10">
                    <div className="mb-8">
                        <div className="text-[11px] tracking-[0.34em] text-neutral-600 dark:text-white/55 uppercase">
                            003 — ÜBER UNS
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-[560px] space-y-3">
                        {ABOUT.map((item, idx) => (
                            <SnapSection.Slide key={item.id} id={`about:${item.id}`} order={idx}>
                                <AboutMobileSlide item={item} index={idx + 1} total={ABOUT.length} />
                            </SnapSection.Slide>
                        ))}
                    </div>
                </div>
            </div>
        </SnapSection>
    );
}