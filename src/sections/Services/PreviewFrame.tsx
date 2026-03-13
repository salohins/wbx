import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

    return (
        <div
            className={[
                "relative w-full",
                "md:w-[min(46vw,820px)]",
                "aspect-[3/4]",
                "max-h-[min(82svh,900px)]",
            ].join(" ")}
        >
            <div className="relative h-full overflow-visible">
                <div
                    className={[
                        "relative h-full rounded-[56px] bg-[#0a0a0a] border border-white/10",
                        "shadow-[0_22px_70px_rgba(0,0,0,0.38)]",
                    ].join(" ")}
                >
                    <div
                        aria-hidden
                        className="absolute -left-[3px] top-[140px] z-30 h-10 w-[3px] rounded-full bg-white/15"
                    />
                    <div
                        aria-hidden
                        className="absolute -left-[3px] top-[195px] z-30 h-16 w-[3px] rounded-full bg-white/15"
                    />
                    <div
                        aria-hidden
                        className="absolute -right-[3px] top-[175px] z-30 h-20 w-[3px] rounded-full bg-white/15"
                    />

                    <div className="absolute inset-0 overflow-hidden rounded-[56px]">
                        <div
                            aria-hidden
                            className="absolute inset-0 rounded-[56px] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(255,255,255,0.04))] opacity-50"
                        />

                        <div
                            className="absolute inset-[10px] overflow-hidden rounded-[46px] border border-white/10"
                            style={{
                                background:
                                    `linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), ${accent}`,
                            }}
                        >
                            <div
                                aria-hidden
                                className="absolute left-1/2 top-[10px] z-50 h-[28px] w-[180px] -translate-x-1/2 rounded-full border border-white/10 bg-black/90"
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
                                        <div className="h-2.5 w-2.5 rounded-full border border-white/10 bg-white/10" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-white/18" />
                                        <div className="h-2 w-6 rounded-full border border-white/10 bg-white/10" />
                                    </div>

                                    <div className="h-1.5 w-12 rounded-full bg-white/10" />

                                    <div className="relative h-4 w-4 rounded-full border border-white/12 bg-white/8">
                                        <div className="absolute inset-[2px] rounded-full bg-black/80" />
                                        <div className="absolute left-[4px] top-[3px] h-1.5 w-1.5 rounded-full bg-white/20" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-full">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={active}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="absolute inset-0 z-10"
                                    >
                                        {active === "websites" && <WebsitePreview />}
                                        {active === "tools" && <ToolsPreview />}
                                        {active === "branding" && <BrandingPreview />}
                                    </motion.div>
                                </AnimatePresence>

                                <div
                                    aria-hidden
                                    className="absolute bottom-6 left-1/2 z-40 h-1.5 w-28 -translate-x-1/2 rounded-full bg-white/18"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}