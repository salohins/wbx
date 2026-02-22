// sections/Projects/MobilePhoneFrame.tsx
import React, { useEffect, useRef, useState } from "react";
import { Wifi, Signal } from "lucide-react";
import { animate, motion, useMotionTemplate, useMotionValue, useInView } from "framer-motion";
import { LoopVideo } from "./LoopVideo";

/** shared shadow token */
const DEVICE_SHADOW = "shadow-[0_18px_60px_rgba(0,0,0,0.35)]";

/** optional glow helper */
export function DeviceGlow({ accent }: { accent: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute -inset-10 blur-[48px]"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 62%)` }}
      />
      <div className="pointer-events-none absolute -inset-16" />
    </>
  );
}

/** hover overlay for SCREEN ONLY (not the bezel) */
export function HoverGridOverlay({ enabled }: { enabled: boolean }) {
  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200",
        enabled ? "lg:group-hover/screen:opacity-100" : "",
      ].join(" ")}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        {/* ✅ removed backdrop-blur-md (cheaper) */}
        <div className="rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs font-medium tracking-wide text-white/90">
          Click to view
        </div>
      </div>
    </div>
  );
}

/** realtime-ish clock */
export function useNowTimeString() {
  const [t, setT] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setT(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return t;
}

export function PhoneStatusBar({
  time,
  variant = "light",
}: {
  time: string;
  variant?: "light" | "dark";
}) {
  const ink = variant === "dark" ? "text-white/90" : "text-black/85";
  const icon = variant === "dark" ? "text-white/80" : "text-black/70";
  const stroke = variant === "dark" ? "border-white/35" : "border-black/40";
  const cap = variant === "dark" ? "bg-white/40" : "bg-black/35";
  const battBg = variant === "dark" ? "bg-white/10" : "bg-white/60";

  return (
    <div className="absolute inset-x-0 top-0 z-40 px-5 pt-3.5">
      <div className="flex items-center justify-between">
        <div className={["pl-1 text-[12.5px] font-semibold tracking-tight", ink].join(" ")}>
          {time}
        </div>

        <div className="flex items-center gap-1.5 pr-1">
          <Signal className={["h-[14px] w-[14px]", icon].join(" ")} strokeWidth={2.2} />
          <Wifi className={["h-[14px] w-[14px]", icon].join(" ")} strokeWidth={2.2} />

          <div className="flex items-center">
            <div className={["relative h-[11px] w-[16px] rounded-[3px] border", stroke, battBg].join(" ")}>
              <div className="absolute left-[1px] top-[1px] bottom-[1px] w-[70%] rounded-[2px] bg-emerald-500/80" />
            </div>
            <div className={["ml-[1px] h-[6px] w-[2px] rounded-full", cap].join(" ")} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobilePhoneFrame({
  videoSrc,
  videoPoster,
  videoType,
  fallbackImgSrc,
  alt,
  accent,
  overlay,
  href,
  statusVariant = "light",
  statusSafeTop = "pt-10",
}: {
  videoSrc?: string;
  videoPoster?: string;
  videoType?: string;
  fallbackImgSrc?: string;
  alt: string;
  accent: string;
  overlay?: React.ReactNode;
  href?: string;
  statusVariant?: "light" | "dark";
  statusSafeTop?: string;
}) {
  const clickable = Boolean(href);
  const [videoFailed, setVideoFailed] = useState(false);
  const timeStr = useNowTimeString();

  // ✅ pause float loop when offscreen
  const hostRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(hostRef, { amount: 0.2 });

  // Motion values
  const y = useMotionValue(0);
  const rx = useMotionValue(3);
  const ry = useMotionValue(3);

  const transform = useMotionTemplate`translate3d(0, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;

  const loopRefs = useRef<{
    y?: ReturnType<typeof animate>;
    rx?: ReturnType<typeof animate>;
    ry?: ReturnType<typeof animate>;
  }>({});

  // ✅ stable base pose (prevents drift / weird restart angles)
  const BASE_Y = 0;
  const BASE_RX = 3;
  const BASE_RY = 3;

  const stopLoop = () => {
    loopRefs.current.y?.stop();
    loopRefs.current.rx?.stop();
    loopRefs.current.ry?.stop();
    loopRefs.current = {};
  };

  const startLoop = () => {
    // ✅ always loop around a fixed base (like the old version “felt”)
    y.set(BASE_Y);
    rx.set(BASE_RX);
    ry.set(BASE_RY);

    const D = 6.9;
    const Y_AMP = 10;
    const RX_AMP = 1.15;
    const RY_AMP = 3.25;

    const Dy = D * 1.0;
    const Drx = D * 1.06;
    const Dry = D * 0.94;

    loopRefs.current.y = animate(y, [BASE_Y, BASE_Y - Y_AMP, BASE_Y, BASE_Y + Y_AMP, BASE_Y], {
      duration: Dy,
      times: [0, 0.25, 0.5, 0.75, 1],
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    });

    loopRefs.current.rx = animate(rx, [BASE_RX, BASE_RX + RX_AMP, BASE_RX, BASE_RX - RX_AMP, BASE_RX], {
      duration: Drx,
      times: [0, 0.25, 0.5, 0.75, 1],
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    });

    loopRefs.current.ry = animate(ry, [BASE_RY, BASE_RY + RY_AMP, BASE_RY, BASE_RY - RY_AMP, BASE_RY], {
      duration: Dry,
      times: [0, 0.25, 0.5, 0.75, 1],
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    });
  };

  // ✅ start/stop float based on visibility
  useEffect(() => {
    if (!inView) {
      stopLoop();
      return;
    }
    startLoop();
    return () => stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    clickable ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-[56px]"
      >
        {children}
      </a>
    ) : (
      <div>{children}</div>
    );

  return (
    <div ref={hostRef} className="relative w-full max-w-[340px] overflow-visible">
      <div
        className={[
          "group relative overflow-visible",
          "[perspective:1200px]",
          "transition-transform duration-[1050ms]",
          "ease-[cubic-bezier(0.12,0.9,0.2,1)]",
          "delay-[30ms]",
          "md:hover:scale-[1.035]",
          "origin-center",
        ].join(" ")}
      >
        <motion.div
          className="relative will-change-transform transform-gpu [transform-style:preserve-3d] [transform-origin:center]"
          style={{ transform }}
          onHoverStart={() => {
            stopLoop();
            // ✅ straighten on hover
            animate(y, BASE_Y, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
            animate(rx, 0, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
            animate(ry, 0, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
          }}
          onHoverEnd={() => {
            stopLoop();
            // ✅ return to stable base, then resume loop (prevents weird restart angles)
            animate(y, BASE_Y, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
            animate(rx, BASE_RX, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
            animate(ry, BASE_RY, { type: "spring", stiffness: 120, damping: 26, mass: 1.0 });
            if (inView) startLoop();
          }}
        >
          <Wrapper>
            <div
              className={[
                "relative top-0",
                "transition-[top,box-shadow] duration-[1050ms]",
                "ease-[cubic-bezier(0.12,0.9,0.2,1)]",
                "delay-[30ms]",
                "md:group-hover:-top-1",

                "w-full aspect-[10/19] rounded-[56px] bg-[#0a0a0a] border border-white/10",
                "shadow-[0_30px_120px_rgba(0,0,0,0.70)]",
                "md:group-hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
                clickable ? "cursor-pointer" : "",
              ].join(" ")}
            >
              {/* side buttons */}
              <div
                aria-hidden
                className="absolute -left-[3px] top-[140px] z-30 h-10 w-[3px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] border border-white/10"
              />
              <div
                aria-hidden
                className="absolute -left-[3px] top-[195px] z-30 h-16 w-[3px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] border border-white/10"
              />
              <div
                aria-hidden
                className="absolute -right-[3px] top-[175px] z-30 h-20 w-[3px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] border border-white/10"
              />

              <div className="absolute inset-0 rounded-[56px] overflow-hidden">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[56px] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_40%,rgba(255,255,255,0.06))] opacity-45 transition-opacity duration-500 group-hover:opacity-70"
                />

                <div className="absolute inset-[7px] rounded-[46px] overflow-hidden bg-[#050505] border border-white/10 group/screen">
                  <div className="absolute inset-0 bg-white" />

                  <PhoneStatusBar time={timeStr} variant={statusVariant} />

                  <div className={["relative z-10 h-full w-full", statusSafeTop].join(" ")}>
                    {videoSrc && !videoFailed ? (
                      <LoopVideo
                        src={videoSrc}
                        poster={videoPoster}
                        type={videoType ?? "video/mp4"}
                        objectClassName="object-fill"
                        className="h-full w-full"
                        paused={!inView}
                        onError={() => setVideoFailed(true)}
                      />
                    ) : fallbackImgSrc ? (
                      <img
                        src={fallbackImgSrc}
                        alt={alt}
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-black" aria-label={alt} />
                    )}
                  </div>

                  {/* notch */}
                  <div
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 top-[10px] h-[26px] w-[112px] rounded-full bg-black/85 border border-white/10 flex items-center justify-center z-20"
                  >
                    <div className="h-[4px] w-[36px] rounded-full bg-white/10 border border-white/10" />
                    <div className="ml-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-white/10 border border-white/15" />
                      <div className="h-2 w-2 rounded-full bg-white/8 border border-white/10" />
                    </div>
                    <div className="ml-2 h-2.5 w-2.5 rounded-full bg-white/10 border border-white/20 relative">
                      <div className="absolute inset-[2px] rounded-full bg-black/70" />
                      <div className="absolute left-[3px] top-[3px] h-[3px] w-[3px] rounded-full bg-white/25" />
                    </div>
                  </div>

                  <div className="absolute inset-0 z-30">
                    <HoverGridOverlay enabled={clickable} />
                  </div>

                  {overlay ? <div className="absolute inset-x-0 bottom-0 p-7 z-30">{overlay}</div> : null}
                </div>
              </div>
            </div>
          </Wrapper>
        </motion.div>
      </div>

      <style>{`
        @keyframes shineReverse {
          0% { transform: translateX(60%); }
          50% { transform: translateX(-60%); }
          100% { transform: translateX(60%); }
        }
      `}</style>
    </div>
  );
}