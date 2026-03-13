import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

type UseLenisOptions = {
    enabled?: boolean;
    wrapper?: HTMLElement | null;  // scroll container (if you use one)
    content?: HTMLElement | null;  // inner content (optional)
};

export function useLenis({ enabled = true, wrapper, content }: UseLenisOptions) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const lenis = new Lenis({
            // If you want it to feel “snappy”:
            duration: 1.0,
            lerp: 0.12, // smaller = more responsive
            smoothWheel: true,
            smoothTouch: false, // IMPORTANT: keep native touch (your mobile swiper already handles touch)
            wheelMultiplier: 1,
            touchMultiplier: 1,
            // If you are scrolling a custom container, pass wrapper/content:
            wrapper: wrapper ?? undefined,
            content: content ?? undefined,
        });

        lenisRef.current = lenis;

        let raf = 0;
        const loop = (time: number) => {
            lenis.raf(time);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [enabled, wrapper, content]);

    return lenisRef;
}