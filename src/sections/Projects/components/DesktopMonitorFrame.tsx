import React, { useState } from "react";
import { TagPill, InlineMeta } from "./ui";
import { LoopVideo } from "./LoopVideo";

type Project = any;

export function DesktopMonitorFrame({
  videoSrc,
  videoPoster,
  videoType,
  fallbackImgSrc,
  alt,
  accent: _accent,
  href,
  project,
  details,
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

  const previewPoster = videoPoster || fallbackImgSrc;
  const shouldShowVideo = Boolean(videoSrc && !videoFailed);

  const content = (
    <div className="relative w-full">
      <div className="relative w-full overflow-visible">
        <div
          className={[
            "relative w-full overflow-hidden",
            "rounded-[24px] md:rounded-[44px]",
            "border border-white/10 bg-[#0a0a0a]",
            "shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
            "h-[clamp(560px,65vh,646px)]",
            clickable ? "cursor-pointer" : "",
          ].join(" ")}
        >
          <div
            aria-hidden
            className="absolute inset-[10px] md:inset-[14px] rounded-[18px] md:rounded-[36px] border border-white/10"
          />

          <div
            aria-hidden
            className="absolute left-1/2 top-[10px] -translate-x-1/2 flex items-center gap-2"
          >
            <div className="h-2 w-2 rounded-full border border-white/15 bg-white/10" />
            <div className="h-1.5 w-7 rounded-full border border-white/10 bg-white/8" />
            <div className="h-2 w-2 rounded-full border border-white/15 bg-white/10" />
          </div>

          <div className="absolute inset-[14px] md:inset-[18px] overflow-hidden rounded-[14px] md:rounded-[30px] border border-white/10 bg-[#050505]">
            <div className="absolute inset-0 bg-black" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/14 to-black/6" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,30,30,0.06),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(255,255,255,0.04),transparent_60%)]" />

            <div className="relative flex h-full w-full flex-col">
              <div className="relative w-full overflow-hidden rounded-t-[14px] md:rounded-t-[30px]">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  {shouldShowVideo ? (
                    <LoopVideo
                      src={videoSrc!}
                      poster={previewPoster}
                      type={videoType ?? "video/mp4"}
                      className="absolute inset-0 h-full w-full"
                      objectClassName="object-cover object-center"
                      fadeMs={350}
                      onError={() => setVideoFailed(true)}
                    />
                  ) : previewPoster ? (
                    <img
                      src={previewPoster}
                      alt={alt}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-black" aria-label={alt} />
                  )}
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-[14px] md:rounded-b-[30px]">
                <div className="absolute inset-0 rounded-b-[14px] md:rounded-b-[30px] bg-white/90 dark:bg-black/70" />

                <div className="relative h-full w-full overflow-hidden p-6 md:p-7">
                  <div className="h-full overflow-hidden pr-1">
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

          <div
            aria-hidden
            className="absolute bottom-[4px] left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            <div className="h-2 w-2 rounded-full border border-white/15 bg-white/12" />
            <div className="h-2 w-2 rounded-full border border-white/15 bg-white/12" />
            <div className="h-2 w-2 rounded-full border border-white/15 bg-white/12" />
          </div>
        </div>

        <div
          aria-hidden
          className="mx-auto mt-3 h-3 w-[40%] rounded-full border border-white/10 bg-white/5"
        />
      </div>
    </div>
  );

  return clickable ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[24px] md:rounded-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
    >
      {content}
    </a>
  ) : (
    content
  );
}

/** details */
function MonitorDetails({ project }: { project: Project }) {
  return (
    <div className="w-full">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h3 className="truncate text-base font-semibold tracking-tight text-neutral-950 dark:text-white md:text-lg">
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
        <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-900/80 dark:text-white/75 md:text-[14.5px]">
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