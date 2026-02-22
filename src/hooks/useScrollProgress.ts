import { useEffect, useMemo, useRef, useState } from "react";

type ScrollProgressOptions = {
  /** if provided, tracks this element instead of window */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** "y" (default) or "x" */
  axis?: "y" | "x";
  /** set true if you want to update on every animation frame while scrolling */
  raf?: boolean;
};

type ScrollProgressState = {
  progress: number; // 0..1
  scroll: number;   // scrollTop / scrollLeft
  maxScroll: number;
};

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function useScrollProgress(options: ScrollProgressOptions = {}): ScrollProgressState {
  const { containerRef, axis = "y", raf = true } = options;

  const [state, setState] = useState<ScrollProgressState>({
    progress: 0,
    scroll: 0,
    maxScroll: 0,
  });

  const ticking = useRef(false);

  const read = () => {
    const el = containerRef?.current;

    if (!el) {
      // window
      const scroll = axis === "y" ? window.scrollY : window.scrollX;
      const maxScroll =
        axis === "y"
          ? Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
          : Math.max(0, document.documentElement.scrollWidth - window.innerWidth);

      const progress = maxScroll === 0 ? 0 : clamp01(scroll / maxScroll);

      setState({ progress, scroll, maxScroll });
      return;
    }

    // element
    const scroll = axis === "y" ? el.scrollTop : el.scrollLeft;
    const maxScroll =
      axis === "y"
        ? Math.max(0, el.scrollHeight - el.clientHeight)
        : Math.max(0, el.scrollWidth - el.clientWidth);

    const progress = maxScroll === 0 ? 0 : clamp01(scroll / maxScroll);

    setState({ progress, scroll, maxScroll });
  };

  useEffect(() => {
    // initial
    read();

    const target: EventTarget = containerRef?.current ?? window;

    const onScroll = () => {
      if (!raf) return read();

      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        ticking.current = false;
        read();
      });
    };

    const onResize = () => onScroll();

    target.addEventListener("scroll", onScroll, { passive: true } as any);
    window.addEventListener("resize", onResize, { passive: true });

    // if containerRef changes (rare), re-read
    return () => {
      target.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef?.current, axis, raf]);

  return state;
}
