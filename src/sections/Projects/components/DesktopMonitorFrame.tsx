// sections/Projects/DesktopMonitorFrame.tsx
import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionTemplate, useMotionValue } from "framer-motion";
import { LoopVideo } from "./LoopVideo";
import { DEVICE_SHADOW, DeviceGlow, HoverGridOverlay, TagPill, InlineMeta } from "./ui";

// If you want strict typing, import your Project type.
// import type { Project } from "./ProjectSnapSection";
type Project = any;

export function DesktopMonitorFrame({
  videoSrc,
  videoPoster,
  videoType,
  fallbackImgSrc,
  alt,
  accent,
  href,
  project,
  details, // optional override
}: {
  videoSrc?: string;
  videoPoster?: string;
  videoType?: string;
  fallbackImgSrc?: string;
  alt: string;
  accent: string;
  href?: string;

  project: Project;
  details?: React.ReactNode;
}) {
  const clickable = Boolean(href);
  const [videoFailed, setVideoFailed] = useState(false);

  // ✅ pause float loop when offscreen
  const hostRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(hostRef, { amount: 0.2 });

  // Motion values (Framer owns transform)
  const y = useMotionValue(0);
  const rx = useMotionValue(2.2);
  const ry = useMotionValue(-2.8);

  const transform = useMotionTemplate`translate3d(0, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;

  // keep refs to running loop animations so we can stop/resume cleanly
  const loopRefs = useRef<{
    y?: ReturnType<typeof animate>;
    rx?: ReturnType<typeof animate>;
    ry?: ReturnType<typeof animate>;
  }>({});

  // ✅ stable base pose (prevents drift / weird restart angles)
  const BASE_Y = 0;
  const BASE_RX = 2.2;
  const BASE_RY = -2.8;

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

    const D = 7.5;

    const Y_AMP = 9;
    const RX_AMP = 1.05;
    const RY_AMP = 3.4;

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

  // ✅ start/stop based on visibility
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
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-[24px] md:rounded-[44px]"
      >
        {children}
      </a>
    ) : (
      <div>{children}</div>
    );

  return (
    <div ref={hostRef} className="relative w-full">
      {/* hover scale + perspective wrapper */}
      <div
        className={[
          "group relative h-full overflow-visible",
          "[perspective:1200px]",
          "transition-transform duration-[1050ms]",
          "ease-[cubic-bezier(0.12,0.9,0.2,1)]",
          "delay-[30ms]",
          "md:hover:scale-[1.03]",
          "origin-center",
        ].join(" ")}
      >
        {/* TILT LAYER */}
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
          <div className="relative w-full">
            <Wrapper>
              <div
                className={[
                  "relative top-0",
                  "transition-[top,box-shadow] duration-[1050ms]",
                  "ease-[cubic-bezier(0.12,0.9,0.2,1)]",
                  "delay-[30ms]",
                  "md:group-hover:-top-1",

                  "w-full rounded-[24px] md:rounded-[44px] bg-[#0a0a0a] border border-white/10",
                  "shadow-[0_30px_120px_rgba(0,0,0,0.70)]",
                  "md:group-hover:shadow-[0_18px_60px_rgba(0,0,0,0.38)]",

                  "overflow-hidden",
                  "h-[clamp(560px,65vh,646px)]",
                  clickable ? "cursor-pointer" : "",
                ].join(" ")}
              >
                {/* inner bezel ring */}
                <div
                  aria-hidden
                  className="absolute inset-[10px] md:inset-[14px] rounded-[18px] md:rounded-[36px] border border-white/10"
                />

                {/* top camera-ish details */}
                <div
                  aria-hidden
                  className="absolute left-1/2 top-[10px] -translate-x-1/2 flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-white/10 border border-white/15" />
                  <div className="h-1.5 w-7 rounded-full bg-white/8 border border-white/10" />
                  <div className="h-2 w-2 rounded-full bg-white/10 border border-white/15" />
                </div>

                {/* screen container */}
                <div className="absolute inset-[14px] md:inset-[18px] rounded-[14px] md:rounded-[30px] overflow-hidden bg-[#050505] border border-white/10">
                  <div className="absolute inset-0 bg-black" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/14 to-black/6" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,30,30,0.08),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(255,255,255,0.05),transparent_60%)]" />

                  <div className="relative h-full w-full flex flex-col">
                    {/* TOP: preview */}
                    <div className="relative w-full overflow-hidden rounded-t-[14px] md:rounded-t-[30px] group/screen">
                      <div className="w-full aspect-[16/9] overflow-hidden">
                        {videoSrc && !videoFailed ? (
                          <LoopVideo
                            src={videoSrc}
                            poster={videoPoster}
                            type={videoType ?? "video/mp4"}
                            objectClassName="object-cover object-center"
                            onError={() => setVideoFailed(true)}
                            paused={!inView}
                          />
                        ) : fallbackImgSrc ? (
                          <img
                            src={fallbackImgSrc}
                            alt={alt}
                            className="h-full w-full object-cover object-center"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-black" aria-label={alt} />
                        )}
                      </div>
                    </div>

                    {/* BOTTOM: details */}
                    <div className="relative flex-1 min-h-0 overflow-hidden rounded-b-[14px] md:rounded-b-[30px]">
                      {/* ✅ REMOVED backdrop-blur-xl (major perf win)
                          Keep the frosted look with a flat translucent layer */}
                      <div className="absolute inset-0 rounded-b-[14px] md:rounded-b-[30px] bg-white/90 dark:bg-black/70" />

                      <div className="relative h-full w-full p-6 md:p-7 overflow-hidden">
                        <div className="h-full overflow-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                          {details ?? <MonitorDetails project={project} />}
                        </div>
                      </div>

                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-neutral-900/10 dark:bg-white/10"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent dark:via-white/12"
                      />
                    </div>
                  </div>

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 44%, rgba(255,255,255,0.05) 100%)",
                    }}
                  />
                </div>

                {/* bottom dots */}
                <div
                  aria-hidden
                  className="absolute bottom-[4px] left-1/2 -translate-x-1/2 flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-white/12 border border-white/15" />
                  <div className="h-2 w-2 rounded-full bg-white/12 border border-white/15" />
                  <div className="h-2 w-2 rounded-full bg-white/12 border border-white/15" />
                </div>
              </div>
            </Wrapper>

            {/* stand */}
            <div
              aria-hidden
              className="mx-auto mt-3 h-3 w-[40%] rounded-full bg-white/5 border border-white/10"
            />
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-60%); }
          50% { transform: translateX(60%); }
          100% { transform: translateX(-60%); }
        }
      `}</style>
    </div>
  );
}

/** details */
function MonitorDetails({ project }: { project: Project }) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-base md:text-lg font-semibold tracking-tight text-neutral-950 dark:text-white truncate">
            {project?.name}
          </h3>

          {project?.year ? (
            <span className="shrink-0 rounded-full border border-neutral-900/10 bg-neutral-950/5 px-3 py-1 text-[12px] text-neutral-900/70 dark:border-white/10 dark:bg-black/30 dark:text-white/70">
              {project.year}
            </span>
          ) : null}
        </div>

        {project?.tags?.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {project.tags.slice(0, 6).map((t: string) => (
              <TagPill key={t} label={t} small />
            ))}
          </div>
        ) : null}
      </div>

      {project?.description ? (
        <p className="mt-3 text-[13.5px] md:text-[14.5px] leading-relaxed text-neutral-900/80 dark:text-white/75">
          {project.description}
        </p>
      ) : null}

      {(project?.client || project?.role) && (
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-neutral-900/70 dark:text-white/70">
            {project?.client ? <InlineMeta k="Client" v={project.client} /> : null}
            {project?.role ? <InlineMeta k="Role" v={project.role} /> : null}
          </div>
        </div>
      )}
    </div>
  );
}