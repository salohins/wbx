// ScreenWrapper.tsx
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUIStore } from "../store/uiStore";
import { ScreenScrollRefContext } from "./ScreenScrollContext";
import { animate, motion, useMotionValue } from "framer-motion";

function isProbablyTrackpad(e: WheelEvent) {
    return Math.abs(e.deltaY) < 40;
}

function clamp01(n: number) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
}

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

function isScrollableYChild(t: EventTarget | null) {
    if (typeof window === "undefined") return false;
    if (!(t instanceof HTMLElement)) return false;

    const el = t.closest<HTMLElement>("[data-scroll-y], .overflow-y-auto, .overflow-y-scroll, .overflow-auto");
    if (!el) return false;

    const style = window.getComputedStyle(el);
    const ok =
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        style.overflowY === "overlay" ||
        style.overflow === "auto";
    return ok && el.scrollHeight > el.clientHeight + 1;
}

type ScreenWrapperProps = {
    children: ReactNode;

    /**
     * Fixed (viewport) layers that must stay fixed on mobile too.
     * Rendered OUTSIDE the transformed slider track on mobile.
     *
     * IMPORTANT: pass ONLY the layer nodes (no fixed wrappers),
     * because ScreenWrapper will place them correctly.
     */
    fixedLayers?: ReactNode | ReactNode[];
};

export function ScreenWrapper({ children, fixedLayers }: ScreenWrapperProps) {
    const location = useLocation();
    const ref = useRef<HTMLDivElement>(null);

    const setLastSection = useUIStore((s) => s.setLastSection);
    const activeSectionRef = useRef<string | null>(null);

    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window === "undefined" ? true : window.matchMedia("(min-width: 1024px)").matches
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 1024px)");
        const onChange = () => setIsDesktop(mq.matches);
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else (mq as any).addListener(onChange);
        onChange();
        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", onChange);
            else (mq as any).removeListener(onChange);
        };
    }, []);

    const fixedLayerList = useMemo(() => {
        if (!fixedLayers) return [];
        return Array.isArray(fixedLayers) ? fixedLayers : [fixedLayers];
    }, [fixedLayers]);

    const hasFixed = fixedLayerList.length > 0;

    /* =========================================================
       DESKTOP: scrollTop animation approach
       ========================================================= */

    const animRef = useRef<{
        raf: number;
        running: boolean;
        from: number;
        to: number;
        start: number;
        duration: number;
        prevSnapType: string;
    }>({
        raf: 0,
        running: false,
        from: 0,
        to: 0,
        start: 0,
        duration: 0,
        prevSnapType: "",
    });

    // ✅ NOTE: wheelRafRef / wheelDirRef / wheelBoostRef are no longer used
    // for desktop navigation after adding trackpad-gesture stepping.
    // Keeping them does not hurt, but they are unused now.

    // progress dispatch throttling (both modes)
    const progressRafRef = useRef<number>(0);
    const lastProgressRef = useRef<number>(-1);

    const emitProgress = (progress: number) => {
        if (Math.abs(progress - lastProgressRef.current) < 0.002) return;
        lastProgressRef.current = progress;
        window.dispatchEvent(new CustomEvent("snap:progress", { detail: { progress } }));
    };

    const emitProgressRaf = (progress: number) => {
        if (progressRafRef.current) return;
        progressRafRef.current = requestAnimationFrame(() => {
            progressRafRef.current = 0;
            emitProgress(progress);
        });
    };

    const cancelScrollAnim = () => {
        if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
        animRef.current.running = false;
        animRef.current.raf = 0;
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const startOrUpdateSmoothScrollTo = (container: HTMLElement, top: number) => {
        const now = performance.now();

        const from = container.scrollTop;
        const to = top;

        const dist = Math.abs(to - from);
        const duration = Math.min(800, Math.max(360, dist * 0.75));

        if (!animRef.current.running) {
            animRef.current.prevSnapType = (container.style as any).scrollSnapType || "";
            (container.style as any).scrollSnapType = "none";
        }

        animRef.current.running = true;
        animRef.current.from = from;
        animRef.current.to = to;
        animRef.current.start = now;
        animRef.current.duration = duration;

        if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);

        const tick = (ts: number) => {
            if (!animRef.current.running) return;

            const t = Math.min(1, (ts - animRef.current.start) / animRef.current.duration);
            const eased = easeOutCubic(t);

            const curFrom = animRef.current.from;
            const curTo = animRef.current.to;

            container.scrollTop = curFrom + (curTo - curFrom) * eased;

            const max = Math.max(0, container.scrollHeight - container.clientHeight);
            const p = max === 0 ? 0 : clamp01(container.scrollTop / max);
            emitProgressRaf(p);

            if (t < 1) {
                animRef.current.raf = requestAnimationFrame(tick);
            } else {
                animRef.current.running = false;
                animRef.current.raf = 0;

                container.scrollTop = curTo;
                (container.style as any).scrollSnapType = animRef.current.prevSnapType;

                const max2 = Math.max(0, container.scrollHeight - container.clientHeight);
                const p2 = max2 === 0 ? 0 : clamp01(container.scrollTop / max2);
                emitProgressRaf(p2);
            }
        };

        animRef.current.raf = requestAnimationFrame(tick);
    };

    const getSectionsAndActiveIndex = (container: HTMLElement) => {
        const sections = Array.from(container.querySelectorAll<HTMLElement>("[data-section]"));
        if (!sections.length) return { sections, activeIndex: 0 };

        const top = container.getBoundingClientRect().top;
        let activeIndex = 0;
        let bestDist = Infinity;

        for (let i = 0; i < sections.length; i++) {
            const r = sections[i].getBoundingClientRect();
            const dist = Math.abs(r.top - top);
            if (dist < bestDist) {
                bestDist = dist;
                activeIndex = i;
            }
        }

        return { sections, activeIndex };
    };

    /* =========================================================
       MOBILE: transform slider
       ========================================================= */

    const sliderRef = useRef<HTMLDivElement | null>(null);
    const trackY = useMotionValue(0);
    const trackAnimRef = useRef<ReturnType<typeof animate> | null>(null);

    const [sectionCount, setSectionCount] = useState(0);
    const vhRef = useRef(1);
    const indexRef = useRef(0);

    const stopTrackAnim = () => {
        trackAnimRef.current?.stop();
        trackAnimRef.current = null;
    };

    const measure = () => {
        const root = sliderRef.current;
        if (!root) return;

        vhRef.current = root.clientHeight || window.innerHeight;

        const list = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"));
        setSectionCount(list.length);

        const maxIdx = Math.max(0, list.length - 1);
        indexRef.current = clamp(indexRef.current, 0, maxIdx);
        trackY.set(-indexRef.current * vhRef.current);
    };

    useEffect(() => {
        if (!sliderRef.current) return;

        measure();

        const ro = new ResizeObserver(() => measure());
        ro.observe(sliderRef.current);

        const mo = new MutationObserver(() => measure());
        mo.observe(sliderRef.current, { childList: true, subtree: true });

        return () => {
            ro.disconnect();
            mo.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDesktop]);

    const snapToIndex = (idx: number) => {
        const maxIdx = Math.max(0, sectionCount - 1);
        const next = clamp(idx, 0, maxIdx);
        indexRef.current = next;

        stopTrackAnim();
        const targetY = -next * vhRef.current;

        trackAnimRef.current = animate(trackY, targetY, {
            type: "tween",
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
        });

        const denom = Math.max(1, maxIdx);
        emitProgressRaf(maxIdx === 0 ? 0 : next / denom);
    };

    // continuous progress while dragging/animating on mobile
    useEffect(() => {
        if (isDesktop) return;

        const maxIdx = Math.max(0, sectionCount - 1);

        const unsub = trackY.on("change", (yVal) => {
            const maxScroll = maxIdx * vhRef.current;
            const scrollTop = Math.max(0, Math.min(maxScroll, -yVal));
            const progress = maxScroll === 0 ? 0 : scrollTop / maxScroll;
            emitProgressRaf(progress);
        });

        return () => unsub();
    }, [isDesktop, sectionCount, trackY]);

    // axis lock (prevents vertical moving when swiping horizontal sliders)
    const dragRef = useRef<{
        active: boolean;
        axis: "unknown" | "vertical" | "horizontal";
        startX: number;
        startY: number;
        startTrackY: number;
        lastY: number;
        lastTs: number;
        vy: number;
    }>({
        active: false,
        axis: "unknown",
        startX: 0,
        startY: 0,
        startTrackY: 0,
        lastY: 0,
        lastTs: 0,
        vy: 0,
    });

    const AXIS_LOCK_PX = 8;

    const onMobilePointerDown = (e: PointerEvent) => {
        if (isDesktop) return;
        if (e.pointerType === "mouse") return;
        if (isScrollableYChild(e.target)) return;

        stopTrackAnim();

        dragRef.current.active = true;
        dragRef.current.axis = "unknown";

        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        dragRef.current.startTrackY = trackY.get();

        dragRef.current.lastY = e.clientY;
        dragRef.current.lastTs = performance.now();
        dragRef.current.vy = 0;

        (sliderRef.current as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
    };

    const onMobilePointerMove = (e: PointerEvent) => {
        if (isDesktop) return;
        if (!dragRef.current.active) return;

        const now = performance.now();
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (dragRef.current.axis === "unknown") {
            if (absX < AXIS_LOCK_PX && absY < AXIS_LOCK_PX) return;
            dragRef.current.axis = absX > absY ? "horizontal" : "vertical";
        }

        if (dragRef.current.axis === "horizontal") return;

        const dt = Math.max(1, now - dragRef.current.lastTs);
        dragRef.current.vy = (e.clientY - dragRef.current.lastY) / dt;
        dragRef.current.lastY = e.clientY;
        dragRef.current.lastTs = now;

        const maxIdx = Math.max(0, sectionCount - 1);
        const minY = -maxIdx * vhRef.current;
        const maxY = 0;

        let nextY = dragRef.current.startTrackY + dy;

        if (nextY > maxY) nextY = maxY + (nextY - maxY) * 0.35;
        if (nextY < minY) nextY = minY + (nextY - minY) * 0.35;

        trackY.set(nextY);
        e.preventDefault();
    };

    const onMobilePointerUp = () => {
        if (isDesktop) return;
        if (!dragRef.current.active) return;

        const axis = dragRef.current.axis;

        dragRef.current.active = false;
        dragRef.current.axis = "unknown";

        if (axis === "horizontal") return;

        const h = Math.max(1, vhRef.current);
        const baseIndex = indexRef.current;
        const baseY = -baseIndex * h;

        const delta = trackY.get() - baseY;
        const frac = Math.abs(delta) / h;

        const COMMIT_FRAC = 0.22;
        const FLICK_V = 0.9;

        let next = baseIndex;

        if (frac >= COMMIT_FRAC || Math.abs(dragRef.current.vy) >= FLICK_V) {
            if (delta < 0 || dragRef.current.vy < 0) next = baseIndex + 1;
            else if (delta > 0 || dragRef.current.vy > 0) next = baseIndex - 1;
        }

        snapToIndex(next);
    };

    useEffect(() => {
        const el = sliderRef.current;
        if (!el) return;

        el.addEventListener("pointerdown", onMobilePointerDown as any, { passive: true });
        el.addEventListener("pointermove", onMobilePointerMove as any, { passive: false });
        el.addEventListener("pointerup", onMobilePointerUp as any, { passive: true });
        el.addEventListener("pointercancel", onMobilePointerUp as any, { passive: true });

        return () => {
            el.removeEventListener("pointerdown", onMobilePointerDown as any);
            el.removeEventListener("pointermove", onMobilePointerMove as any);
            el.removeEventListener("pointerup", onMobilePointerUp as any);
            el.removeEventListener("pointercancel", onMobilePointerUp as any);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDesktop, sectionCount]);

    /* =========================================================
       Desktop wheel listener (mouse + trackpad gesture stepping)
       ========================================================= */

    // ✅ trackpad/mouse gesture stepping state
    const wheelAccumAbsRef = useRef(0);
    const wheelLastTsRef = useRef(0);
    const wheelLastDirRef = useRef(0);
    const wheelLastStepTsRef = useRef(0);

    // tuning
    const TRACKPAD_STEP = 90; // higher = more effort per section
    const MOUSE_STEP = 50; // mouse wheels are bigger deltas
    const IDLE_RESET_MS = 160; // pause resets accum
    const MIN_STEP_GAP_MS = 120; // avoids double-step from one flick

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const processWheelStep = (dir: number) => {
            const { sections, activeIndex } = getSectionsAndActiveIndex(container);
            if (!sections.length) return;

            const base = activeIndex;
            const nextIndex = Math.max(0, Math.min(sections.length - 1, base + dir));
            const target = sections[nextIndex];
            if (!target) return;

            startOrUpdateSmoothScrollTo(container, target.offsetTop);
        };

        const onWheel = (e: WheelEvent) => {
            if (!isDesktop) return;
            if (e.ctrlKey || e.metaKey) return;

            // ignore horizontal trackpad scroll
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

            e.preventDefault();

            const now = performance.now();

            const trackpad = isProbablyTrackpad(e);

            // idle reset
            if (now - wheelLastTsRef.current > IDLE_RESET_MS) {
                wheelAccumAbsRef.current = 0;
                wheelLastDirRef.current = 0;
            }
            wheelLastTsRef.current = now;

            const dir = e.deltaY > 0 ? 1 : -1;

            // reset on direction change
            if (wheelLastDirRef.current && dir !== wheelLastDirRef.current) {
                wheelAccumAbsRef.current = 0;
            }
            wheelLastDirRef.current = dir;

            wheelAccumAbsRef.current += Math.abs(e.deltaY);

            const step = trackpad ? TRACKPAD_STEP : MOUSE_STEP;

            if (wheelAccumAbsRef.current < step) return;

            // consume EXACTLY one step (no multi-skip)
            wheelAccumAbsRef.current -= step;

            // gap between steps
            const sinceLastStep = now - wheelLastStepTsRef.current;
            if (sinceLastStep < MIN_STEP_GAP_MS) return;
            wheelLastStepTsRef.current = now;

            processWheelStep(dir);
        };

        container.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            cancelScrollAnim();
            if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current);
            container.removeEventListener("wheel", onWheel as any);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDesktop]);

    /* =========================================================
       Render
       ========================================================= */

    // Single background source lives here, for both mobile + desktop.
    // Background gradient is on the OUTER wrapper so it doesn't cover fixed layers.
    const outerBgClass =
        "bg-gradient-to-b from-neutral-200 via-neutral-200 to-neutral-300 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900";

    if (!isDesktop) {
        return (
            <ScreenScrollRefContext.Provider value={ref}>
                <div
                    ref={sliderRef}
                    className={`relative w-full h-full overflow-hidden ${outerBgClass}`}
                    style={{ overscrollBehaviorY: "contain", touchAction: "none" }}
                >
                    {hasFixed && (
                        <div className="pointer-events-none fixed inset-0 z-[0]">
                            {fixedLayerList.map((node, i) => (
                                <React.Fragment key={i}>{node}</React.Fragment>
                            ))}
                        </div>
                    )}

                    <motion.div
                        className="absolute inset-0 will-change-transform z-[10]"
                        style={{ y: trackY, transform: "translateZ(0)", backfaceVisibility: "hidden" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </ScreenScrollRefContext.Provider>
        );
    }

    return (
        <ScreenScrollRefContext.Provider value={ref}>
            <div className={`relative w-full h-full ${outerBgClass}`}>
                {hasFixed && (
                    <div className="pointer-events-none fixed inset-0 z-[0]">
                        {fixedLayerList.map((node, i) => (
                            <React.Fragment key={i}>{node}</React.Fragment>
                        ))}
                    </div>
                )}

                <div
                    ref={ref}
                    className="
                        relative z-[10] w-full h-full overflow-y-auto flex flex-col
                        snap-y snap-mandatory md:snap-none md:snap-normal
                        bg-transparent
                    "
                    style={{
                        scrollbarGutter: "stable",
                        WebkitOverflowScrolling: "touch",
                        overscrollBehaviorY: "contain",
                        scrollSnapStop: "always",
                    }}
                >
                    {children}
                </div>
            </div>
        </ScreenScrollRefContext.Provider>
    );
}