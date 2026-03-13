import React, { ReactNode } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

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

function useElementWidth<T extends HTMLElement>() {
    const ref = React.useRef<T | null>(null);
    const [width, setWidth] = React.useState(0);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const ro = new ResizeObserver(() => setWidth(el.clientWidth || 0));
        ro.observe(el);
        setWidth(el.clientWidth || 0);

        return () => ro.disconnect();
    }, []);

    return [ref, width] as const;
}

type DesktopAlign = "top" | "center" | "bottom";
type MobileSliderMode = "snap" | "peek";

type SnapCtxType = {
    isMobile: boolean;

    register: (id: string, order: number) => void;
    unregister: (id: string) => void;
    setNode: (id: string, node: ReactNode) => void;

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

    desktopAlign?: DesktopAlign;
    maxWidth?: string;
    bleedPointerEvents?: boolean;
    clipBleed?: boolean;

    mobileSliderMode?: MobileSliderMode;
    mobilePeekGutterPx?: number;
    mobileShowTitleOnFirstSplit?: boolean;
    unscaled?: boolean;

    mobileSplitIntoSections?: boolean;
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
    mobileSliderMode = "snap",
    mobilePeekGutterPx = 20,
    mobileSplitIntoSections = false,
    mobileShowTitleOnFirstSplit = true,
    unscaled = false,
}: SnapSectionProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const isMobile = !isDesktop;

    const nodesRef = React.useRef<Map<string, ReactNode>>(new Map());
    const bleedNodesRef = React.useRef<Map<string, ReactNode>>(new Map());

    const [, bumpNodeVersion] = React.useState(0);
    const seenNodeIdsRef = React.useRef<Set<string>>(new Set());
    const seenBleedIdsRef = React.useRef<Set<string>>(new Set());

    const [slideList, setSlideList] = React.useState<SlideItem[]>([]);
    const [bleedList, setBleedList] = React.useState<BleedItem[]>([]);

    const [activeIndex, setActiveIndex] = React.useState(0);

    const x = useMotionValue(0);

    const [viewportRef, viewportW] = useElementWidth<HTMLDivElement>();

    const activeIndexRef = React.useRef(0);
    React.useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    const setActiveIndexDeferred = React.useCallback((next: number) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const startTransition = (React as any).startTransition as
                    | undefined
                    | ((cb: () => void) => void);

                const commit = () => setActiveIndex((prev) => (prev === next ? prev : next));

                if (startTransition) startTransition(commit);
                else commit();
            });
        });
    }, []);

    const setNode = React.useCallback((id: string, node: ReactNode) => {
        nodesRef.current.set(id, node);
        if (!seenNodeIdsRef.current.has(id)) {
            seenNodeIdsRef.current.add(id);
            bumpNodeVersion((v) => v + 1);
        }
    }, []);

    const register = React.useCallback((id: string, order: number) => {
        setSlideList((prev) => {
            const existing = prev.find((s) => s.id === id);
            const next = existing
                ? prev.map((s) => (s.id === id ? { id, order } : s))
                : [...prev, { id, order }];
            next.sort((a, b) => a.order - b.order);

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
        seenNodeIdsRef.current.delete(id);
        setSlideList((prev) => prev.filter((s) => s.id !== id));
        bumpNodeVersion((v) => v + 1);
    }, []);

    const setBleedNode = React.useCallback((id: string, node: ReactNode) => {
        bleedNodesRef.current.set(id, node);
        if (!seenBleedIdsRef.current.has(id)) {
            seenBleedIdsRef.current.add(id);
            bumpNodeVersion((v) => v + 1);
        }
    }, []);

    const registerBleed = React.useCallback(
        (id: string, order: number, layer: "behind" | "front") => {
            setBleedList((prev) => {
                const existing = prev.find((b) => b.id === id);
                const next = existing
                    ? prev.map((b) => (b.id === id ? { id, order, layer } : b))
                    : [...prev, { id, order, layer }];

                next.sort((a, b) => {
                    if (a.layer !== b.layer) return a.layer === "behind" ? -1 : 1;
                    return a.order - b.order;
                });

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
        seenBleedIdsRef.current.delete(id);
        setBleedList((prev) => prev.filter((b) => b.id !== id));
        bumpNodeVersion((v) => v + 1);
    }, []);

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

    const align = isMobile ? "justify-center" : desktopAlignClass[desktopAlign];

    const slideCount = slideList.length;
    const clampIndex = React.useCallback(
        (i: number) => Math.max(0, Math.min(slideCount - 1, i)),
        [slideCount]
    );

    const MOBILE_WINDOW = 1;
    const getRenderRange = React.useCallback(
        (idx: number) => {
            const start = Math.max(0, idx - MOBILE_WINDOW);
            const end = Math.min(slideCount - 1, idx + MOBILE_WINDOW);
            return { start, end };
        },
        [slideCount]
    );

    const snapAnimRef = React.useRef<ReturnType<typeof animate> | null>(null);

    React.useEffect(() => {
        if (!isMobile) return;
        setActiveIndex((i) => clampIndex(i));
    }, [isMobile, clampIndex]);

    const baseW = viewportW || 1;
    const peekGutter = mobileSliderMode === "peek" ? mobilePeekGutterPx : 0;
    const slideW = Math.max(1, baseW - peekGutter * 2);
    const step = slideW;
    const centerOffset = (baseW - slideW) / 2;

    const getBounds = React.useCallback(() => {
        const minX = centerOffset - Math.max(0, slideCount - 1) * step;
        const maxX = centerOffset;
        return { minX, maxX };
    }, [centerOffset, slideCount, step]);

    const snapToIndex = React.useCallback(
        (i: number, opts?: { instant?: boolean }) => {
            const next = clampIndex(i);
            activeIndexRef.current = next;

            const target = centerOffset - next * step;

            snapAnimRef.current?.stop();
            snapAnimRef.current = null;

            if (opts?.instant) {
                x.set(target);
                setActiveIndex(next);
                return;
            }

            snapAnimRef.current = animate(x, target, {
                type: "tween",
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
            });

            setActiveIndexDeferred(next);
        },
        [clampIndex, centerOffset, step, x, setActiveIndexDeferred]
    );

    React.useEffect(() => {
        if (!isMobile) return;
        if (mobileSplitIntoSections) return;
        snapToIndex(activeIndexRef.current, { instant: true });
    }, [isMobile, viewportW, mobileSliderMode, mobilePeekGutterPx, mobileSplitIntoSections, snapToIndex]);

    React.useEffect(() => {
        if (!isMobile) return;
        if (mobileSplitIntoSections) return;
        if (viewportW <= 0) return;

        const { minX, maxX } = getBounds();

        const current = x.get();
        if (current < minX) x.set(minX);
        if (current > maxX) x.set(maxX);
    }, [isMobile, viewportW, slideCount, x, getBounds, mobileSplitIntoSections]);

    const showDots = isMobile && !mobileSplitIntoSections && slideCount > 1;

    const bleedBehind = bleedList
        .filter((b) => b.layer === "behind")
        .map((b) => bleedNodesRef.current.get(b.id) ?? null);
    const bleedFront = bleedList
        .filter((b) => b.layer === "front")
        .map((b) => bleedNodesRef.current.get(b.id) ?? null);

    const bleedWrapperBase = [
        "absolute inset-0",
        bleedPointerEvents ? "pointer-events-auto" : "pointer-events-none",
    ]
        .filter(Boolean)
        .join(" ");

    const SHADOW_GUTTER_PX = isMobile ? 14 : 28;

    const isNoDragTarget = React.useCallback((t: EventTarget | null) => {
        if (!(t instanceof HTMLElement)) return false;
        return Boolean(t.closest("[data-no-drag]"));
    }, []);

    const isScrollableY = React.useCallback((t: EventTarget | null) => {
        if (typeof window === "undefined") return false;
        if (!(t instanceof HTMLElement)) return false;

        const el = t.closest<HTMLElement>(
            "[data-scroll-y], .overflow-y-auto, .overflow-y-scroll, .overflow-auto"
        );
        if (!el) return false;

        const style = window.getComputedStyle(el);
        return (
            (style.overflowY === "auto" ||
                style.overflowY === "scroll" ||
                style.overflowY === "overlay") &&
            el.scrollHeight > el.clientHeight + 1
        );
    }, []);

    const isTextInput = React.useCallback((t: EventTarget | null) => {
        if (!(t instanceof HTMLElement)) return false;
        const el = t.closest<HTMLElement>("textarea, input, [contenteditable='true']");
        if (!el) return false;

        if (el instanceof HTMLInputElement) {
            const type = (el.getAttribute("type") || "").toLowerCase();
            if (type === "checkbox" || type === "radio" || type === "range") return false;
        }
        return true;
    }, []);

    const clampX = React.useCallback(
        (val: number) => {
            const { minX, maxX } = getBounds();
            return Math.max(minX, Math.min(maxX, val));
        },
        [getBounds]
    );

    const finishDragSnap = React.useCallback(
        (dx: number) => {
            const SWIPE_DIST = step * 0.18;

            let next = activeIndexRef.current;

            if (dx < -SWIPE_DIST) next += 1;
            else if (dx > SWIPE_DIST) next -= 1;
            else {
                const currentX = x.get();
                next = Math.round((centerOffset - currentX) / step);
            }

            snapToIndex(next);
        },
        [centerOffset, step, x, snapToIndex]
    );

    const sliderElRef = React.useRef<HTMLDivElement | null>(null);
    const DRAG_THRESHOLD_PX = 6;

    const touchStateRef = React.useRef<{
        active: boolean;
        startX: number;
        startY: number;
        lastX: number;
        startMotionX: number;
        dragging: boolean;
        allowVerticalScroll: boolean;
    } | null>(null);

    const rafDragRef = React.useRef<number | null>(null);
    const pendingXRef = React.useRef<number | null>(null);

    const setXThrottled = React.useCallback(
        (val: number) => {
            pendingXRef.current = val;

            if (rafDragRef.current != null) return;

            rafDragRef.current = requestAnimationFrame(() => {
                rafDragRef.current = null;
                const next = pendingXRef.current;
                pendingXRef.current = null;
                if (next != null) x.set(next);
            });
        },
        [x]
    );

    React.useEffect(() => {
        return () => {
            if (rafDragRef.current != null) cancelAnimationFrame(rafDragRef.current);
        };
    }, []);

    React.useEffect(() => {
        const el = sliderElRef.current;
        if (!el || !isMobile) return;
        if (mobileSplitIntoSections) return;

        const onTouchStart = (ev: TouchEvent) => {
            if (slideCount <= 1 || viewportW <= 0) return;
            if (!ev.touches || ev.touches.length !== 1) return;

            if (isNoDragTarget(ev.target)) return;

            snapAnimRef.current?.stop();
            snapAnimRef.current = null;

            const t = ev.touches[0];

            touchStateRef.current = {
                active: true,
                startX: t.clientX,
                startY: t.clientY,
                lastX: t.clientX,
                startMotionX: x.get(),
                dragging: false,
                allowVerticalScroll: isScrollableY(ev.target),
            };
        };

        const onTouchMove = (ev: TouchEvent) => {
            const s = touchStateRef.current;
            if (!s?.active) return;
            if (!ev.touches || ev.touches.length !== 1) return;

            const t = ev.touches[0];
            s.lastX = t.clientX;

            const dx = t.clientX - s.startX;
            const dy = t.clientY - s.startY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (!s.dragging) {
                if (s.allowVerticalScroll && absY > DRAG_THRESHOLD_PX && absY > absX) {
                    touchStateRef.current = null;
                    return;
                }

                if (absX > DRAG_THRESHOLD_PX && absX > absY) {
                    s.dragging = true;

                    if (isTextInput(ev.target)) {
                        const node = (ev.target as HTMLElement | null)?.closest?.(
                            "textarea, input, [contenteditable='true']"
                        ) as HTMLElement | null;
                        node?.blur?.();
                    }
                } else {
                    return;
                }
            }

            if (s.dragging && ev.cancelable) {
                ev.preventDefault();
            }

            setXThrottled(clampX(s.startMotionX + dx));
        };

        const onTouchEnd = () => {
            const s = touchStateRef.current;
            if (!s) return;

            if (s.dragging) {
                const dx = s.lastX - s.startX;
                finishDragSnap(dx);
            }

            touchStateRef.current = null;
        };

        const onTouchCancel = () => {
            touchStateRef.current = null;
        };

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: true });
        el.addEventListener("touchcancel", onTouchCancel, { passive: true });

        return () => {
            el.removeEventListener("touchstart", onTouchStart as any);
            el.removeEventListener("touchmove", onTouchMove as any);
            el.removeEventListener("touchend", onTouchEnd as any);
            el.removeEventListener("touchcancel", onTouchCancel as any);
        };
    }, [
        isMobile,
        slideCount,
        viewportW,
        isNoDragTarget,
        isScrollableY,
        isTextInput,
        clampX,
        finishDragSnap,
        x,
        mobileSplitIntoSections,
        setXThrottled,
    ]);

    const showDesktop = isDesktop;
    const showMobile = isMobile;

    const viewportPad = mobileSliderMode === "peek" ? mobilePeekGutterPx : SHADOW_GUTTER_PX;

    if (showMobile && mobileSplitIntoSections) {
        return (
            <SnapCtx.Provider value={ctxValue}>
                <div aria-hidden className="absolute inset-0 opacity-0 pointer-events-none">
                    {children}
                </div>

                {slideList.map((s, idx) => {
                    const showTitleHere = idx === 0 && mobileShowTitleOnFirstSplit && (title || subtitle);
                    const headerExists = Boolean(showTitleHere && (title || subtitle));

                    const splitSectionKey = `${sectionId ?? "snap"}-${s.id}`;

                    return (
                        <section
                            key={s.id}
                            id={splitSectionKey}
                            data-section={splitSectionKey}
                            className={[
                                "relative min-h-[100dvh] w-full flex justify-center",
                                className,
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            style={{ overflowX: clipBleed ? "clip" : "visible", overscrollBehaviorX: "none" }}
                        >
                            {idx === 0 && bleedBehind.length > 0 && (
                                <div className={`${bleedWrapperBase} z-0`}>{bleedBehind}</div>
                            )}

                            <div className={`relative z-10 min-h-[100dvh] w-full ${maxWidth}`}>
                                {headerExists && (
                                    <div className="absolute top-0 left-0 z-20 w-full self-start overflow-hidden">
                                        <div
                                            className="bg-neutral-100/20 dark:bg-neutral-900/20 backdrop-blur-xl pt-4 pb-3 px-5"
                                            style={{ touchAction: "pan-y" }}
                                        >
                                            {title && (
                                                <h2 className="text-neutral-900 dark:text-white text-lg font-medium">
                                                    {title}
                                                </h2>
                                            )}
                                            {subtitle && (
                                                <p className="mt-1 text-sm text-neutral-600 dark:text-white/70 font-normal">
                                                    {subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div
                                    className={[
                                        "relative z-0 min-h-[100dvh] w-full px-5 flex",
                                        headerExists
                                            ? "items-center justify-center pt-24"
                                            : "items-center justify-center pt-8",
                                    ].join(" ")}
                                >
                                    {nodesRef.current.get(s.id) ?? null}
                                </div>
                            </div>

                            {idx === 0 && bleedFront.length > 0 && (
                                <div className={`${bleedWrapperBase} z-20`}>{bleedFront}</div>
                            )}
                        </section>
                    );
                })}
            </SnapCtx.Provider>
        );
    }

    return (
        <section
            id={sectionId}
            data-section={sectionId}
            className={[
                `relative w-full flex justify-center min-h-[100dvh] ${!unscaled ? "2xl:scale-[0.9]" : ""
                } 3xl:scale-[1] ${title ? "2xl:pt-20" : ""} 3xl:pt-0`,
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            style={{
                overflowX: clipBleed ? "clip" : "visible",
                overscrollBehaviorX: "none",
            }}
        >
            <SnapCtx.Provider value={ctxValue}>
                {bleedBehind.length > 0 && <div className={`${bleedWrapperBase} z-0`}>{bleedBehind}</div>}

                <div className={`relative z-10 w-full min-h-[100dvh] flex flex-col ${maxWidth} ${align}`}>
                    {(title || subtitle) && (
                        <div className="absolute top-0 left-0 md:relative z-20 w-full md:w-auto self-start overflow-hidden">
                            <div
                                className="bg-neutral-100/20 dark:bg-neutral-900/20 md:bg-transparent dark:md:bg-transparent backdrop-blur-xl md:backdrop-blur-none pt-4 pb-3 px-5"
                                style={{ touchAction: "pan-y" }}
                            >
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
                            </div>

                            {showDots && (
                                <div className="mt-3 px-5 flex items-center gap-2">
                                    {Array.from({ length: slideCount }).map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => snapToIndex(i)}
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

                    <div className="relative z-0 w-full min-h-[100dvh] flex-1">
                        {showDesktop && <div className="w-full px-6">{children}</div>}

                        {showMobile && (
                            <div aria-hidden="true" className="absolute inset-0 opacity-0 pointer-events-none">
                                {children}
                            </div>
                        )}

                        {showMobile && (
                            <div
                                ref={viewportRef}
                                className="w-full min-h-[100dvh]"
                                style={{ paddingLeft: viewportPad, paddingRight: viewportPad }}
                            >
                                <motion.div
                                    ref={sliderElRef}
                                    className="min-h-[100dvh] flex"
                                    style={{
                                        x,
                                        marginLeft: -viewportPad,
                                        marginRight: -viewportPad,
                                        willChange: "transform",
                                        transform: "translateZ(0)",
                                        backfaceVisibility: "hidden",
                                        touchAction: "pan-y",
                                        userSelect: "none",
                                    }}
                                >
                                    {(() => {
                                        const { start, end } = getRenderRange(activeIndex);

                                        return slideList.map((s, i) => {
                                            const inRange = i >= start && i <= end;

                                            return (
                                                <div key={s.id} className="shrink-0 min-h-[100dvh]" style={{ width: slideW }}>
                                                    <div
                                                        className={`pb-10 w-full min-h-[100dvh] flex flex-col ${mobileSliderMode === "peek" ? "px-3" : "px-5"
                                                            } justify-center items-center`}
                                                        style={{
                                                            contentVisibility: inRange ? "visible" : "auto",
                                                            containIntrinsicSize: "1000px 1000px",
                                                        }}
                                                    >
                                                        {inRange ? (nodesRef.current.get(s.id) ?? null) : null}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>

                {bleedFront.length > 0 && <div className={`${bleedWrapperBase} z-20`}>{bleedFront}</div>}
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

    React.useEffect(() => {
        if (!ctx) return;
        ctx.register(id, order);
        return () => ctx.unregister(id);
    }, [ctx, id, order]);

    React.useEffect(() => {
        if (!ctx) return;
        ctx.setNode(id, children);
    }, [ctx, id, children]);

    if (!ctx) return <>{children}</>;

    return ctx.isMobile ? null : <>{children}</>;
};

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

    if (!ctx) return <>{children}</>;
    return null;
};