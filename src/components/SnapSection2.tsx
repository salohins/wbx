import React, { ReactNode } from "react";

type SlideItem = { id: string; order: number };
type BleedItem = { id: string; order: number; layer: "behind" | "front" };

function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const m = window.matchMedia(query);
        const onChange = () => setMatches(m.matches);

        setMatches(m.matches);

        if (m.addEventListener) m.addEventListener("change", onChange);
        else m.addListener(onChange);

        return () => {
            if (m.removeEventListener) m.removeEventListener("change", onChange);
            else m.removeListener(onChange);
        };
    }, [query]);

    return matches;
}

type DesktopAlign = "top" | "center" | "bottom";

type SnapCtxType = {
    isMobile: boolean;

    // slides
    register: (id: string, order: number) => void;
    unregister: (id: string) => void;
    setNode: (id: string, node: ReactNode) => void;

    // bleed
    registerBleed: (id: string, order: number, layer: "behind" | "front") => void;
    unregisterBleed: (id: string) => void;
    setBleedNode: (id: string, node: ReactNode) => void;
};

const SnapCtx = React.createContext<SnapCtxType | null>(null);

type SnapSectionProps = {
    sectionId?: string;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;

    /**
     * Desktop only:
     * - "top": content starts at the top
     * - "center": content vertically centered
     * - "bottom": content at the bottom
     *
     * Mobile is ALWAYS centered.
     */
    desktopAlign?: DesktopAlign;

    // container width class (Tailwind), e.g. "max-w-7xl"
    maxWidth?: string;

    /**
     * If your bleed is purely decorative, leave this false so it doesn't block clicks.
     * If you want interactive bleed content (buttons etc.), set true.
     */
    bleedPointerEvents?: boolean;

    /**
     * Prevent full-bleed glows/blur from creating horizontal page scroll.
     * Default true, because bleed is usually decorative.
     */
    clipBleed?: boolean;
};

const desktopAlignClass: Record<DesktopAlign, string> = {
    top: "justify-start",
    center: "justify-center",
    bottom: "justify-end",
};

export function SnapSection({
    sectionId,
    title,
    subtitle,
    children,
    className = "",
    desktopAlign = "center",
    maxWidth = "max-w-7xl",
    bleedPointerEvents = false,
    clipBleed = true,
}: SnapSectionProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const isMobile = !isDesktop;

    // stores the actual slide ReactNodes without causing re-renders
    const nodesRef = React.useRef<Map<string, ReactNode>>(new Map());
    // stores the actual bleed ReactNodes without causing re-renders
    const bleedNodesRef = React.useRef<Map<string, ReactNode>>(new Map());

    // stores only id/order list (this is what renders the slider)
    const [slideList, setSlideList] = React.useState<SlideItem[]>([]);
    // stores bleed id/order/layer list (rendered outside maxWidth box)
    const [bleedList, setBleedList] = React.useState<BleedItem[]>([]);

    // ✅ mobile slider tracking
    const scrollerRef = React.useRef<HTMLDivElement | null>(null);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const setNode = React.useCallback((id: string, node: ReactNode) => {
        nodesRef.current.set(id, node);
    }, []);

    const register = React.useCallback((id: string, order: number) => {
        setSlideList((prev) => {
            const existing = prev.find((s) => s.id === id);

            const next = existing
                ? prev.map((s) => (s.id === id ? { id, order } : s))
                : [...prev, { id, order }];

            next.sort((a, b) => a.order - b.order);

            // bail out if nothing changed (prevents pointless re-renders)
            if (
                prev.length === next.length &&
                prev.every((p, i) => p.id === next[i].id && p.order === next[i].order)
            ) {
                return prev;
            }

            return next;
        });
    }, []);

    const unregister = React.useCallback((id: string) => {
        nodesRef.current.delete(id);
        setSlideList((prev) => prev.filter((s) => s.id !== id));
    }, []);

    // ----- BLEED REGISTRY -----
    const setBleedNode = React.useCallback((id: string, node: ReactNode) => {
        bleedNodesRef.current.set(id, node);
    }, []);

    const registerBleed = React.useCallback(
        (id: string, order: number, layer: "behind" | "front") => {
            setBleedList((prev) => {
                const existing = prev.find((b) => b.id === id);

                const next = existing
                    ? prev.map((b) => (b.id === id ? { id, order, layer } : b))
                    : [...prev, { id, order, layer }];

                // stable ordering by: layer first (behind -> front), then order
                next.sort((a, b) => {
                    if (a.layer !== b.layer) return a.layer === "behind" ? -1 : 1;
                    return a.order - b.order;
                });

                // bail out if nothing changed
                if (
                    prev.length === next.length &&
                    prev.every(
                        (p, i) =>
                            p.id === next[i].id &&
                            p.order === next[i].order &&
                            p.layer === next[i].layer
                    )
                ) {
                    return prev;
                }

                return next;
            });
        },
        []
    );

    const unregisterBleed = React.useCallback((id: string) => {
        bleedNodesRef.current.delete(id);
        setBleedList((prev) => prev.filter((b) => b.id !== id));
    }, []);

    // ✅ make context value stable
    const ctxValue = React.useMemo(
        () => ({
            isMobile,
            register,
            unregister,
            setNode,
            registerBleed,
            unregisterBleed,
            setBleedNode,
        }),
        [isMobile, register, unregister, setNode, registerBleed, unregisterBleed, setBleedNode]
    );

    // Outer content alignment:
    // - Mobile: always centered
    // - Desktop: configurable
    const align = isMobile ? "justify-center" : desktopAlignClass[desktopAlign];
    const slideCount = slideList.length;

    const clampIndex = React.useCallback(
        (i: number) => Math.max(0, Math.min(slideCount - 1, i)),
        [slideCount]
    );

    // keep activeIndex valid when slides appear/disappear
    React.useEffect(() => {
        if (!isMobile) return;
        setActiveIndex((i) => clampIndex(i));
    }, [isMobile, clampIndex]);

    // track active slide by scroll position (mobile only)
    React.useEffect(() => {
        if (!isMobile) return;
        const el = scrollerRef.current;
        if (!el) return;

        let raf = 0;

        const update = () => {
            const w = el.clientWidth || 1;
            const next = clampIndex(Math.round(el.scrollLeft / w));
            setActiveIndex(next);
        };

        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        // initialize
        update();
        requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener("scroll", onScroll as any);
        };
    }, [isMobile, clampIndex, slideCount]);

    const scrollToIndex = (i: number) => {
        const el = scrollerRef.current;
        if (!el) return;

        const next = clampIndex(i);
        const w = el.clientWidth || 1;
        el.scrollTo({ left: next * w, behavior: "smooth" });
        setActiveIndex(next);
    };

    const showDots = isMobile && slideCount > 1;

    // resolve bleed nodes in the sorted order
    const bleedBehind = bleedList
        .filter((b) => b.layer === "behind")
        .map((b) => bleedNodesRef.current.get(b.id) ?? null);

    const bleedFront = bleedList
        .filter((b) => b.layer === "front")
        .map((b) => bleedNodesRef.current.get(b.id) ?? null);

    const bleedWrapperBase = [
        "absolute inset-0",
        clipBleed ? "overflow-hidden" : "",
        bleedPointerEvents ? "pointer-events-auto" : "pointer-events-none",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <section
            id={sectionId}
            data-section={sectionId}
            className={[
                "relative h-full w-full flex justify-center snap-start",
                // extra safe: also clip the whole section (kills 1px overflow from filters/transforms)
                clipBleed ? "overflow-hidden" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <SnapCtx.Provider value={ctxValue}>
                {/* ✅ FULL-BLEED LAYER (BEHIND) */}
                {bleedBehind.length > 0 && (
                    <div className={`${bleedWrapperBase} z-0`}>{bleedBehind}</div>
                )}

                {/* ✅ BOXED CONTENT */}
                <div className={`relative z-10 h-full w-full flex flex-col ${maxWidth} ${align}`}>
                    {/* Header (stays above content within the aligned column) */}
                    {(title || subtitle) && (
                        <div className="pt-4 pb-3 px-5 absolute top-0 left-0 md:relative z-20">
                            {title && (
                                <h2 className="text-neutral-900 dark:text-white text-lg font-medium md:text-4xl md:font-bold">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="mt-1 text-sm md:text-lg text-neutral-600 dark:text-white/70 font-normal">
                                    {subtitle}
                                </p>
                            )}

                            {/* ✅ Mobile progress dots under subtitle */}
                            {showDots && (
                                <div className="mt-3 flex items-center gap-2">
                                    {Array.from({ length: slideCount }).map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => scrollToIndex(i)}
                                            aria-label={`Go to slide ${i + 1}`}
                                            className={[
                                                "h-2.5 w-2.5 rounded-full transition-transform bg-white",
                                                i === activeIndex ? "scale-110 opacity-100" : "opacity-40",
                                            ].join(" ")}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Body area takes the remaining height */}
                    <div className="relative z-0 h-full md:h-auto w-full min-h-0">
                        {/* Desktop: normal render */}
                        {isDesktop && <div className="h-full w-full px-6">{children}</div>}

                        {/* Mobile: mount children invisibly so Slides can register */}
                        {isMobile && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 opacity-0 pointer-events-none"
                            >
                                {children}
                            </div>
                        )}

                        {/* Mobile slider */}
                        {isMobile && (
                            <div
                                ref={scrollerRef}
                                className="h-full w-full overflow-x-auto snap-x snap-mandatory flex scrollbar-hide"
                            >
                                {slideList.map((s) => (
                                    <div
                                        key={s.id}
                                        className="w-full flex flex-col px-5 justify-center items-center shrink-0 snap-start h-full"
                                    >
                                        {nodesRef.current.get(s.id) ?? null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ FULL-BLEED LAYER (FRONT) */}
                {bleedFront.length > 0 && (
                    <div className={`${bleedWrapperBase} z-20`}>{bleedFront}</div>
                )}
            </SnapCtx.Provider>
        </section>
    );
}

SnapSection.Slide = function Slide({
    id,
    order = 0,
    children,
}: {
    id: string;
    order?: number;
    children: React.ReactNode;
}) {
    const ctx = React.useContext(SnapCtx);

    // mount/unmount: register the slide id/order exactly once (unless id/order changes)
    React.useEffect(() => {
        if (!ctx) return;
        ctx.register(id, order);
        return () => ctx.unregister(id);
    }, [ctx, id, order]);

    // update node whenever children changes (NO setState, safe)
    React.useEffect(() => {
        if (!ctx) return;
        ctx.setNode(id, children);
    }, [ctx, id, children]);

    if (!ctx) return <>{children}</>;
    return ctx.isMobile ? null : <>{children}</>;
};

/**
 * ✅ NEW: full-bleed content that renders inside the section but outside maxWidth.
 *
 * layer:
 * - "behind": under the boxed content (background glows, gradients, patterns)
 * - "front": over the boxed content (vignettes, overlays, decorative frames)
 */
SnapSection.Bleed = function Bleed({
    id,
    order = 0,
    layer = "behind",
    children,
}: {
    id: string;
    order?: number;
    layer?: "behind" | "front";
    children: React.ReactNode;
}) {
    const ctx = React.useContext(SnapCtx);

    React.useEffect(() => {
        if (!ctx) return;
        ctx.registerBleed(id, order, layer);
        return () => ctx.unregisterBleed(id);
    }, [ctx, id, order, layer]);

    React.useEffect(() => {
        if (!ctx) return;
        ctx.setBleedNode(id, children);
    }, [ctx, id, children]);

    // never render in-flow; it's rendered by the section itself
    if (!ctx) return <>{children}</>;
    return null;
};