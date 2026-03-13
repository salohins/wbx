// sections/Hero/Hero.tsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SnapSection } from "../../components/SnapSection2";
import { useTranslation } from "../../hooks/useTranslation";
import { useNavigate } from "react-router-dom";

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.04,
        },
    },
};

const leftReveal = {
    hidden: {
        opacity: 0,
        x: -40,
    },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

const rightReveal = {
    hidden: {
        opacity: 0,
        x: 40,
    },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.58,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

function TypingTitle({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
    const t = useTranslation();

    const words = useMemo(
        () => [
            t.hero.words.websites,
            t.hero.words.platforms,
            t.hero.words.systems,
            t.hero.words.automation,
        ],
        [t]
    );

    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setIndex(0);
        setSubIndex(0);
        setDeleting(false);
    }, [words]);

    useEffect(() => {
        const currentWord = words[index] ?? "";
        const delay = deleting ? 55 : 105;

        const timeout = window.setTimeout(() => {
            if (!deleting) {
                if (subIndex < currentWord.length) {
                    setSubIndex((prev) => prev + 1);
                    return;
                }

                const hold = window.setTimeout(() => setDeleting(true), 900);
                return () => window.clearTimeout(hold);
            }

            if (subIndex > 0) {
                setSubIndex((prev) => prev - 1);
                return;
            }

            setDeleting(false);
            setIndex((prev) => (prev + 1) % words.length);
        }, delay);

        return () => window.clearTimeout(timeout);
    }, [subIndex, deleting, index, words]);

    const isMobile = variant === "mobile";

    return (
        <div className="w-full select-none">
            <span
                dir="ltr"
                className={`
          inline-flex items-baseline
          w-full
          font-light
          text-neutral-900
          dark:text-white/95
          tracking-[0.06em]
          leading-[0.95]
          whitespace-nowrap
          ${isMobile
                        ? "text-[24px] xs:text-[28px] sm:text-[34px]"
                        : "text-[42px] sm:text-[54px] md:text-[56px] xl:text-[62px]"
                    }
        `}
            >
                {words[index].substring(0, subIndex)}
                <span
                    className="ml-2 inline-block shrink-0 animate-[heroCursor_1s_steps(1,end)_infinite]"
                    style={{
                        width: isMobile ? "7px" : "10px",
                        height: "0.9em",
                        background: "rgba(255, 26, 26, 0.95)",
                        boxShadow: "0 0 18px rgba(255,26,26,0.55)",
                        transform: "translateY(2px)",
                    }}
                />
            </span>
        </div>
    );
}

function HeroRightBlock({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
    const t = useTranslation();
    const isMobile = variant === "mobile";

    return (
        <div className="w-full">
            <div
                className={`
          w-full
          ${isMobile ? "max-w-full" : "md:ml-auto md:w-[360px] md:max-w-[360px] md:shrink-0"}
        `}
            >
                <TypingTitle variant={variant} />

                {isMobile ? (
                    <div className="mt-5">
                        <div className="text-[10px] tracking-[0.24em] uppercase text-neutral-500 dark:text-white/30">
                            {t.hero.labels.whatWeBuild}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {[
                                t.hero.items.websites,
                                t.hero.items.webapps,
                                t.hero.items.crmSystems,
                                t.hero.items.adminTools,
                                t.hero.items.automation,
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="
                    rounded-full border border-neutral-900/10
                    px-3 py-1.5
                    text-[11px] uppercase tracking-[0.12em]
                    text-neutral-700
                    dark:border-white/10 dark:text-white/55
                  "
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div
                        className="
              mt-6 grid grid-cols-2 gap-x-10 gap-y-3
              text-[15px] tracking-[0.22em]
              text-neutral-700 dark:text-white/45
            "
                    >
                        <div className="col-span-2 text-[10px] tracking-[0.24em] text-neutral-500 dark:text-white/30">
                            {t.hero.labels.digitalProducts}
                        </div>

                        <div>{t.hero.items.websites}</div>
                        <div>{t.hero.items.webapps}</div>

                        <div className="col-span-2 mt-3 text-[10px] tracking-[0.24em] text-neutral-500 dark:text-white/30">
                            {t.hero.labels.systems}
                        </div>

                        <div>{t.hero.items.crmSystems}</div>
                        <div>{t.hero.items.adminTools}</div>
                        <div>{t.hero.items.automation}</div>

                        <div className="col-span-2 mt-3 text-[10px] tracking-[0.24em] text-neutral-500 dark:text-white/30">
                            {t.hero.labels.strategy}
                        </div>

                        <div>{t.hero.items.branding}</div>
                        <div>{t.hero.items.uxui}</div>
                        <div>{t.hero.items.consulting}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function Hero() {
    const t = useTranslation();
    const navigate = useNavigate();

    return (
        <SnapSection
            sectionId="hero"
            unscaled
            maxWidth="max-w-[1200px] 3xl:max-w-[1400px]"
            className="relative overflow-hidden hero text-neutral-900 dark:text-white"
        >
            <SnapSection.Slide id="hero:main" order={0}>
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={container}
                    className="overflow-hidden"
                >
                    <div className="relative z-[2] pt-10 sm:px-8 sm:pt-16 sm:pb-16 lg:px-16 lg:pt-24 lg:pb-20">
                        <div
                            className="
                flex min-h-[100svh] flex-col justify-start
                md:min-h-screen md:justify-center
              "
                        >
                            <div
                                className="
                  flex flex-col gap-7
                  md:flex-row md:items-center md:justify-between md:gap-14
                "
                            >
                                <motion.div
                                    className="w-full max-w-[620px]"
                                    variants={leftReveal}
                                >
                                    <div className="space-y-4 sm:space-y-6">
                                        <h1
                                            className="
                        max-w-[12ch]
                        text-[34px] leading-[0.95] tracking-[-0.03em] font-[500]
                        xs:text-[38px]
                        sm:text-[56px]
                        lg:text-[70px]
                        text-neutral-900 dark:text-white
                      "
                                        >
                                            {t.hero.title}
                                        </h1>

                                        <p className="max-w-[34ch] text-[14px] leading-6 text-neutral-600 dark:text-white/55 sm:text-[15px]">
                                            {t.hero.description}
                                        </p>

                                        <div className="block pt-1 md:hidden">
                                            <HeroRightBlock variant="mobile" />
                                        </div>

                                        <div className="flex items-center gap-2.5 pt-2 sm:gap-3">
                                            <button
                                                onClick={() => navigate("/contact")}
                                                className="
                          flex-1 rounded-full px-4 py-3 text-[10px] tracking-[0.18em] uppercase
                          bg-neutral-900 text-white hover:bg-neutral-800
                          dark:bg-white dark:text-neutral-900
                          sm:flex-none sm:px-7 sm:text-[11px] sm:tracking-[0.24em]
                        "
                                            >
                                                {t.hero.ctaPrimary}
                                            </button>
                                        </div>

                                        <div className="pt-1 text-[12px] text-neutral-500 dark:text-white/40">
                                            {t.hero.trustedBy}
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="hidden md:block md:flex-1" />

                                <motion.div
                                    className="hidden md:block md:w-[360px] md:shrink-0"
                                    variants={rightReveal}
                                >
                                    <HeroRightBlock variant="desktop" />
                                </motion.div>
                            </div>

                            <motion.div
                                className="mt-12 hidden sm:flex flex-col items-center gap-4 text-[11px] tracking-[0.28em] uppercase text-neutral-600 dark:text-white/60"
                                variants={rightReveal}
                            >
                                <div>{t.hero.explore}</div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-900/10 dark:border-white/15">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80 shadow-[0_0_18px_rgba(255,30,30,0.5)]" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </SnapSection.Slide>

            <style>{`
        @keyframes heroCursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
        </SnapSection>
    );
}