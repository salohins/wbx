import React, { useEffect, useState } from "react";
import { Wifi, Signal } from "lucide-react";
import { LoopVideo } from "./LoopVideo";

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
  accent: _accent,
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
  href?: string;
  statusVariant?: "light" | "dark";
  statusSafeTop?: string;
}) {
  const clickable = Boolean(href);
  const [videoFailed, setVideoFailed] = useState(false);
  const timeStr = useNowTimeString();

  const previewPoster = videoPoster || fallbackImgSrc;
  const shouldShowVideo = Boolean(videoSrc && !videoFailed);

  const content = (
    <div className="relative overflow-visible">
      <div
        className={[
          "relative w-full aspect-[10/19]",
          "rounded-[56px]",
          "border border-white/10 bg-[#0a0a0a]",
          "shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
          clickable ? "cursor-pointer" : "",
        ].join(" ")}
      >
        <div
          aria-hidden
          className="absolute -left-[3px] top-[140px] z-30 h-10 w-[3px] rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))]"
        />
        <div
          aria-hidden
          className="absolute -left-[3px] top-[195px] z-30 h-16 w-[3px] rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))]"
        />
        <div
          aria-hidden
          className="absolute -right-[3px] top-[175px] z-30 h-20 w-[3px] rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))]"
        />

        <div className="absolute inset-0 overflow-hidden rounded-[56px]">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[56px] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_40%,rgba(255,255,255,0.06))] opacity-45"
          />

          <div className="absolute inset-[7px] overflow-hidden rounded-[46px] border border-white/10 bg-[#050505] group/screen">
            <div className="absolute inset-0 bg-white" />

            <PhoneStatusBar time={timeStr} variant={statusVariant} />

            <div className="relative z-10 h-full w-full overflow-hidden">
              <div className={["relative h-full w-full overflow-hidden", statusSafeTop].join(" ")}>
                <div className="relative h-full w-full overflow-hidden">
                  {shouldShowVideo ? (
                    <LoopVideo
                      src={videoSrc!}
                      poster={previewPoster}
                      type={videoType ?? "video/mp4"}
                      className="absolute inset-0 h-full w-full"
                      objectClassName="object-cover object-top"
                      fadeMs={350}
                      onError={() => setVideoFailed(true)}
                    />
                  ) : previewPoster ? (
                    <img
                      src={previewPoster}
                      alt={alt}
                      className="absolute inset-0 h-full w-full object-cover object-top"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                    />
                  ) : (
                    <div className="absolute inset-0 h-full w-full bg-black" aria-label={alt} />
                  )}
                </div>
              </div>
            </div>

            <div
              aria-hidden
              className="absolute left-1/2 top-[10px] z-20 flex h-[26px] w-[112px] -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-black/85"
            >
              <div className="h-[4px] w-[36px] rounded-full border border-white/10 bg-white/10" />
              <div className="ml-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full border border-white/15 bg-white/10" />
                <div className="h-2 w-2 rounded-full border border-white/10 bg-white/8" />
              </div>
              <div className="relative ml-2 h-2.5 w-2.5 rounded-full border border-white/20 bg-white/10">
                <div className="absolute inset-[2px] rounded-full bg-black/70" />
                <div className="absolute left-[3px] top-[3px] h-[3px] w-[3px] rounded-full bg-white/25" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-[340px] overflow-visible">
      {clickable ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="block rounded-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}