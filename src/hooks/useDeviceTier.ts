import { useEffect, useMemo, useState } from "react";

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const m = window.matchMedia(query);
        const onChange = () => setMatches(m.matches);
        onChange();
        m.addEventListener?.("change", onChange);
        return () => m.removeEventListener?.("change", onChange);
    }, [query]);

    return matches;
}

function useDpr(minDpr: number) {
    const [ok, setOk] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const check = () => setOk((window.devicePixelRatio || 1) >= minDpr);
        check();

        // DPR can change on zoom / moving between displays
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, [minDpr]);

    return ok;
}

/**
 * Tiers you can reuse everywhere.
 * - phone: touch-first device (coarse pointer) under lg breakpoint
 * - smallMobile: phone && < 390
 * - bigMobile:   phone && >= 390
 * - tabletUp:    >= 768
 * - lgUp:        >= 1024
 */
export function useDeviceTier() {
    const lgUp = useMediaQuery("(min-width: 1024px)");
    const tabletUp = useMediaQuery("(min-width: 768px)");
    const widthBigMobile = useMediaQuery("(min-width: 390px)");

    // ✅ touch device heuristic
    const coarsePointer = useMediaQuery("(pointer: coarse)");
    const hasHover = useMediaQuery("(hover: hover)");

    // ✅ DPI heuristic (retina phones usually >= 2)
    const dpr2Up = useDpr(2);

    // ✅ "phone": touch + high-ish DPR + not desktop
    // (hasHover guards against touch laptops / hybrid devices)
    const phone = !lgUp && coarsePointer && dpr2Up && !hasHover;

    const bigMobile = phone && widthBigMobile;
    const smallMobile = phone && !widthBigMobile;

    // keep your previous meaning if you still want it:
    const mobile = !lgUp;

    return useMemo(
        () => ({
            mobile,
            phone,
            lgUp,
            tabletUp,
            bigMobile,
            smallMobile,
        }),
        [mobile, phone, lgUp, tabletUp, bigMobile, smallMobile]
    );
}