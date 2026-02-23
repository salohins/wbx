// sections/Hero/Hero.tsx
import { useEffect, useState } from "react";
import { SnapSection } from "../../components/SnapSection2";

// ⬇️ TYPING COMPONENT (bigger, cleaner, premium)
function TypingTitle({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
    const words = ["INNOVATION", "DIGITALITÄT", "AUTOMATION", "KREATIVITÄT", "PRÄZISION"];
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [blink, setBlink] = useState(true);

    useEffect(() => {
        const delay = deleting ? 40 : 85;

        const timeout = window.setTimeout(() => {
            setSubIndex((prev) => (deleting ? prev - 1 : prev + 1));

            if (!deleting && subIndex === words[index].length) {
                window.setTimeout(() => setDeleting(true), 800);
            }

            if (deleting && subIndex === 0) {
                setDeleting(false);
                setIndex((prev) => (prev + 1) % words.length);
            }
        }, delay);

        return () => window.clearTimeout(timeout);
    }, [subIndex, deleting, index, words]);

    useEffect(() => {
        const cursor = window.setInterval(() => setBlink((prev) => !prev), 520);
        return () => window.clearInterval(cursor);
    }, []);

    const isMobile = variant === "mobile";

    return (
        <div className="select-none">
            <span
                dir="ltr"
                className={`
          inline-flex items-baseline
          font-light
          text-neutral-900
          dark:text-white/95
          tracking-[0.08em]
          leading-[0.95]
          ${isMobile
                        ? "text-[30px] sm:text-[38px]"
                        : "text-[42px] sm:text-[54px] md:text-[55px] xl:text-[40px]"
                    }
        `}
            >
                {words[index].substring(0, subIndex)}
                <span
                    className={`ml-2 inline-block ${blink ? "opacity-100" : "opacity-0"} transition-opacity duration-150`}
                    style={{
                        width: isMobile ? "8px" : "10px",
                        height: "0.95em",
                        background: "rgba(255, 26, 26, 0.95)",
                        boxShadow: "0 0 18px rgba(255,26,26,0.55)",
                        transform: "translateY(2px)",
                    }}
                />
            </span>
        </div>
    );
}

/** ✅ Reusable "right" content block (rendered under H1 on mobile, right column on md+) */
function HeroRightBlock({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
    const isMobile = variant === "mobile";

    return (
        <div className="w-full">
            <div className={`md:ml-auto w-full max-w-[360px] ${isMobile ? "text-base sm:text-lg" : "text-xl"}`}>
                <TypingTitle variant={variant} />

                <div
                    className={`
                      mt-7
                      grid grid-cols-2
                      ${isMobile
                            ? "gap-x-8 gap-y-2 text-[12px] sm:text-[13px] tracking-[0.20em]"
                            : "gap-x-10 gap-y-3 text-[15px] tracking-[0.22em]"
                        }
                      text-neutral-700
                      dark:text-white/45
                    `}
                >
                    {[
                        "WEBSITES",
                        "WEBAPPS",
                        "CRM SYSTEME",
                        "ADMIN TOOLS",
                        "BRANDING",
                        "UX/UI DESIGN",
                        "AUTOMATION",
                        "CONSULTING",
                    ].map((t) => (
                        <div key={t} className="leading-none uppercase">
                            {t}
                        </div>
                    ))}
                </div>


            </div>
        </div>
    );
}

// ⬇️ MAIN HERO SECTION (flex layout)
export function Hero() {
    return (
        <SnapSection
            sectionId="hero"
            className="
        relative overflow-hidden hero
        text-neutral-900
        dark:text-white
      "
        >
            <SnapSection.Slide id="hero:main" order={0}>
                {/* Pinned viewport */}
                <div className="sticky top-0 h-[100svh] overflow-hidden">
                    {/* WebGL canvas */}
                    {/* <HeroCanvas /> */}

                    {/* content wrapper */}
                    <div className="relative z-[2] mx-auto h-[100svh] max-w-[1600px]  sm:px-10 lg:px-16">
                        {/* ✅ FLEX instead of grid */}
                        <div
                            className="
                                h-full
                                flex flex-col
                                justify-center
                                gap-y-14
                                pb-20
                                sm:pb-0
                                md:flex-row
                                md:items-center
                                md:justify-between
                                md:gap-y-0
                                md:gap-x-14
                                "
                        >
                            {/* LEFT */}
                            <div className="w-full md:w-[50%] max-w-[640px]">
                                <div className="space-y-5">
                                    <h1
                                        className="
                      text-[50px] sm:text-[64px] lg:text-[70px]
                      leading-[0.92]
                      text-neutral-900
                      dark:text-white
                    "
                                    >
                                        Digital Experiences for Ambitious Brands.
                                    </h1>

                                    {/* ✅ MOBILE: render typing + services right after H1 */}
                                    <div className="block md:hidden pt-0">
                                        <HeroRightBlock variant="mobile" />
                                    </div>

                                    <div className="flex items-center gap-3 pt-3">
                                        {/* Primary CTA */}
                                        <button
                                            className="
                        rounded-full
                        px-7 py-3
                        text-[11px]
                        tracking-[0.24em]
                        uppercase
                        transition
                        active:scale-[0.99]

                        bg-neutral-900 text-white
                        hover:bg-neutral-800
                        border border-neutral-900/10

                        dark:bg-white dark:text-neutral-900
                        dark:hover:bg-neutral-100
                        dark:border-white/10
                      "
                                        >
                                            GET A QUOTE
                                        </button>

                                        {/* Secondary CTA */}
                                        <button
                                            className="
                        rounded-full
                        px-6 py-3
                        text-[11px]
                        tracking-[0.24em]
                        uppercase
                        transition
                        active:scale-[0.99]

                        border border-neutral-900/15
                        text-neutral-900/70
                        hover:text-neutral-900
                        hover:border-neutral-900/25
                        hover:bg-neutral-900/[0.03]

                        dark:border-white/15
                        dark:text-white/70
                        dark:hover:text-white/90
                        dark:hover:border-white/25
                        dark:hover:bg-white/[0.06]
                      "
                                        >
                                            CASES
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* CENTER spacer (keeps 3D focus area) */}
                            <div className="hidden md:block md:flex-[0.5]" />

                            {/* RIGHT (desktop only now) */}
                            <div className="hidden md:block md:w-[28%]">
                                <HeroRightBlock variant="desktop" />
                            </div>
                        </div>

                        {/* bottom center hint */}
                        <div
                            className="
                pointer-events-none
                absolute left-1/2 bottom-10 -translate-x-1/2
                flex flex-col items-center gap-4
                text-[11px] tracking-[0.28em] uppercase
                text-neutral-600
                dark:text-white/60
              "
                        >
                            <div>Mehr erfahren</div>

                            <div
                                className="
                  flex h-11 w-11 items-center justify-center rounded-full
                  border border-neutral-900/10
                  bg-neutral-900/[0.02]
                  dark:border-white/15
                  dark:bg-white/[0.02]
                "
                            >
                                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80 shadow-[0_0_18px_rgba(255,30,30,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </SnapSection.Slide>
        </SnapSection>
    );
}