// ScreenWrapper.tsx
import { ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useUIStore } from "../store/uiStore";
import { ScreenScrollRefContext } from "./ScreenScrollContext";

function isProbablyTrackpad(e: WheelEvent) {
    return Math.abs(e.deltaY) < 40;
}

function clamp01(n: number) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function ScreenWrapper({ children }: { children: ReactNode }) {
    const location = useLocation();
    const ref = useRef<HTMLDivElement>(null);

    const setLastSection = useUIStore((s) => s.setLastSection);
    const activeSectionRef = useRef<string | null>(null);

    // ✅ smooth animation state (interruptible)
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

    // ✅ coalesce wheel events (prevents lag when scrolling nonstop)
    const wheelRafRef = useRef<number>(0);
    const wheelDirRef = useRef<number>(0); // -1 or +1
    const wheelBoostRef = useRef<number>(0); // accumulate stronger wheels

    // ✅ progress dispatch throttling
    const progressRafRef = useRef<number>(0);
    const lastProgressRef = useRef<number>(-1);

    const cancelScrollAnim = () => {
        if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
        animRef.current.running = false;
        animRef.current.raf = 0;
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const emitProgress = (container: HTMLElement) => {
        const max = Math.max(0, container.scrollHeight - container.clientHeight);
        const p = max === 0 ? 0 : clamp01(container.scrollTop / max);

        // don’t spam
        if (Math.abs(p - lastProgressRef.current) < 0.002) return;
        lastProgressRef.current = p;

        window.dispatchEvent(new CustomEvent("snap:progress", { detail: { progress: p } }));
    };

    const emitProgressRaf = (container: HTMLElement) => {
        if (progressRafRef.current) return;
        progressRafRef.current = requestAnimationFrame(() => {
            progressRafRef.current = 0;
            emitProgress(container);
        });
    };

    const startOrUpdateSmoothScrollTo = (container: HTMLElement, top: number) => {
        const now = performance.now();

        // If already animating, just retarget from current position (no spam)
        const from = container.scrollTop;
        const to = top;

        const dist = Math.abs(to - from);

        // ✅ slightly slower, but not sluggish
        const duration = Math.min(800, Math.max(360, dist * 0.75)); // 360–800ms

        // Disable snap while animating so it doesn't fight
        if (!animRef.current.running) {
            animRef.current.prevSnapType = (container.style as any).scrollSnapType || "";
            (container.style as any).scrollSnapType = "none";
        }

        animRef.current.running = true;
        animRef.current.from = from;
        animRef.current.to = to;
        animRef.current.start = now;
        animRef.current.duration = duration;

        // cancel existing RAF but keep "running" true
        if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);

        const tick = (ts: number) => {
            if (!animRef.current.running) return;

            const t = Math.min(1, (ts - animRef.current.start) / animRef.current.duration);
            const eased = easeOutCubic(t);

            // Read latest from/to (supports live retargeting)
            const curFrom = animRef.current.from;
            const curTo = animRef.current.to;

            container.scrollTop = curFrom + (curTo - curFrom) * eased;

            // ✅ broadcast progress DURING animation
            emitProgressRaf(container);

            if (t < 1) {
                animRef.current.raf = requestAnimationFrame(tick);
            } else {
                animRef.current.running = false;
                animRef.current.raf = 0;
                (container.style as any).scrollSnapType = animRef.current.prevSnapType;

                // ✅ final progress sync
                emitProgressRaf(container);
            }
        };

        animRef.current.raf = requestAnimationFrame(tick);
    };

    const getSectionsAndActiveIndex = () => {
        const container = ref.current;
        if (!container) return { sections: [] as HTMLElement[], activeIndex: 0 };

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

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        // ✅ initial emit
        emitProgressRaf(container);

        const processWheel = () => {
            wheelRafRef.current = 0;
            const dir = wheelDirRef.current;
            if (!dir) return;

            const { sections, activeIndex } = getSectionsAndActiveIndex();
            if (!sections.length) return;

            // ✅ if user scrolls harder / longer, allow skipping further
            const boost = Math.min(2, Math.floor(wheelBoostRef.current / 2)); // 0..2
            wheelBoostRef.current = 0;

            const nextIndex = Math.max(
                0,
                Math.min(sections.length - 1, activeIndex + dir * (1 + boost))
            );

            const target = sections[nextIndex];
            if (!target) return;

            startOrUpdateSmoothScrollTo(container, target.offsetTop);
        };

        const onWheel = (e: WheelEvent) => {
            const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
            if (!isDesktop) return;

            // let trackpads scroll naturally
            if (isProbablyTrackpad(e)) return;
            if (e.ctrlKey || e.metaKey) return;

            e.preventDefault();

            const dir = e.deltaY > 0 ? 1 : -1;
            wheelDirRef.current = dir;

            // accumulate "strength" so continuous scroll can move faster
            wheelBoostRef.current += Math.min(3, Math.max(1, Math.abs(e.deltaY) / 80));

            // ✅ only act once per animation frame (prevents lag)
            if (!wheelRafRef.current) {
                wheelRafRef.current = requestAnimationFrame(processWheel);
            }
        };

        // ✅ trackpad + mobile + manual scroll progress
        const onScroll = () => {
            emitProgressRaf(container);
        };

        container.addEventListener("wheel", onWheel, { passive: false });
        container.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            cancelScrollAnim();
            if (wheelRafRef.current) cancelAnimationFrame(wheelRafRef.current);
            if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current);
            container.removeEventListener("wheel", onWheel as any);
            container.removeEventListener("scroll", onScroll as any);
        };
    }, []);

    // ✅ IntersectionObserver for URL hash + state
    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const sections = container.querySelectorAll<HTMLElement>("[data-section]");
        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (!visible) return;

                const id = visible.target.getAttribute("data-section");
                if (!id) return;
                if (activeSectionRef.current === id) return;

                activeSectionRef.current = id;
                setLastSection(location.pathname, id);
                window.history.replaceState(null, "", `${location.pathname}#${id}`);
            },
            { root: container, threshold: 0.6 }
        );

        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, [location.pathname, setLastSection]);

    function GlobalBackground() {
        return (
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0 overflow-hidden transform-gpu will-change-transform"
            >
                {/* base + blooms */}

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(16,185,129,0.18),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_58%,rgba(255,255,255,0.08),transparent_62%)]" />
                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

                {/* Swiss grid (lighter on mobile to avoid scroll jank / flashing) */}
                <div className="absolute inset-0 opacity-[0.14]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.18)_1px,transparent_1px)] bg-[size:80px_80px]" />

                    {/* hide the dense 20px grid on mobile */}
                    <div className="absolute inset-0 hidden md:block bg-[linear-gradient(to_right,rgba(255,255,255,.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.10)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    {/* mask only on md+ (mask-image can cause mobile compositing glitches) */}
                    <div className="absolute inset-0 bg-black md:[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
                </div>


                {/* film grain (disable blend mode on mobile; blend modes often flash during scroll) */}
                <div
                    className="
          absolute inset-0 opacity-[0.05]
          mix-blend-normal md:mix-blend-overlay
          [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]
        "
                />
            </div>
        );
    }

    return (
        <ScreenScrollRefContext.Provider value={ref}>
            <div
                ref={ref}
                className="
    relative w-full h-full overflow-y-auto flex flex-col
    snap-y snap-mandatory md:snap-none md:snap-normal
    bg-gradient-to-b
    from-neutral-200 via-neutral-200 to-neutral-300
    dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900
  "
                style={{ scrollbarGutter: 'stable' }}
            >
                <GlobalBackground />
                {children}
            </div>
        </ScreenScrollRefContext.Provider>
    );
}
