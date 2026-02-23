// sections/Projects/ProjectSnapSection.tsx
import React, { useMemo } from "react";
import { SnapSection } from "../../components/SnapSection2";

import { DesktopMonitorFrame } from "./components/DesktopMonitorFrame";
import { MobilePhoneFrame } from "./components/MobilePhoneFrame";

export type ProjectLink = { label: string; href: string };

export type Project = {
  id: string;

  name: string;
  description: string;

  desktopVideoSrc?: string;
  desktopVideoPoster?: string;
  desktopVideoType?: string;

  mobileVideoSrc?: string;
  mobileVideoPoster?: string;
  mobileVideoType?: string;

  desktopImageSrc?: string;
  desktopImageAlt?: string;

  mobileImageSrc?: string;
  mobileImageAlt?: string;

  tags?: string[];
  links?: ProjectLink[];

  year?: string;
  client?: string;
  role?: string;
};

type ProjectSnapSectionProps = {
  sectionId: string;
  title: string;
  subtitle?: string;
  project: Project;

  maxWidth?: string;
  desktopAlign?: "top" | "center" | "bottom";
  accent?: string;
};

export function ProjectSnapSection({
  sectionId,
  title,
  subtitle,
  project,
  maxWidth = "max-w-7xl",
  desktopAlign = "top",
  accent = "rgba(255, 30, 30, 0.16)",
}: ProjectSnapSectionProps) {
  return (
    <SnapSection sectionId={sectionId} title={title} subtitle={subtitle} maxWidth={maxWidth} desktopAlign={desktopAlign}>
      <div className="w-full h-full">
        <ProjectCard project={project} accent={accent} />
      </div>
    </SnapSection>
  );
}

function ProjectCard({ project, accent }: { project: Project; accent: string }) {
  const primaryHref = useMemo(() => project.links?.[0]?.href, [project.links]);

  return (
    <article className="w-full md:pt-10">
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12 lg:gap-6 px-4 md:px-0">
        {/* Left (Desktop / Monitor) — hidden on mobile */}
        <div className="hidden lg:block lg:col-span-8 lg:-mt-2">
          <div className="w-full h-auto overflow-visible">
            <div className="relative overflow-visible">
              <DesktopMonitorFrame
                videoSrc={project.desktopVideoSrc}
                videoPoster={project.desktopVideoPoster}
                videoType={project.desktopVideoType}
                fallbackImgSrc={project.desktopImageSrc}
                alt={project.desktopImageAlt ?? `${project.name} desktop preview`}
                accent={accent}
                href={primaryHref}
                project={project}
              />
            </div>
          </div>
        </div>

        {/* Right (Phone) — visible on mobile + desktop */}
        <div className="lg:col-span-4 lg:mt-10 overflow-visible">
          {/* ✅ Slide 1: phone preview */}
          <SnapSection.Slide id={`${project.id}:mobile`} order={0}>
            <div className="w-full min-w-0 overflow-visible flex justify-center lg:block">
              <div className="w-[min(340px,100%)] min-w-0 overflow-visible">
                <div className="relative overflow-visible">
                  <MobilePhoneFrame
                    videoSrc={project.mobileVideoSrc}
                    videoPoster={project.mobileVideoPoster}
                    videoType={project.mobileVideoType}
                    fallbackImgSrc={project.mobileImageSrc}
                    alt={project.mobileImageAlt ?? `${project.name} mobile preview`}
                    accent={accent}
                    href={primaryHref}
                    statusVariant="light"
                  // ✅ overlay removed — overlay is now its own slide
                  />
                </div>
              </div>
            </div>
          </SnapSection.Slide>

          {/* ✅ Slide 2 (MOBILE ONLY): full-screen overlay */}
          <SnapSection.Slide id={`${project.id}:overlay`} order={1}>
            {/* SnapSection mobile wrapper applies px-5; cancel it so the slide can be full-width */}
            <div className="lg:hidden h-full w-[calc(100%+40px)] -mx-5 flex items-center justify-center">
              <div className="w-full max-w-[520px] px-5">
                <MobileOverlay project={project} />
              </div>
            </div>

            {/* Desktop: don't show this slide content (desktop doesn't render slides anyway, but keep it safe) */}
            <div className="hidden lg:block" />
          </SnapSection.Slide>
        </div>
      </div>

      <div className="pointer-events-none mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-60%); }
          50% { transform: translateX(60%); }
          100% { transform: translateX(-60%); }
        }
        @keyframes shineReverse {
          0% { transform: translateX(60%); }
          50% { transform: translateX(-60%); }
          100% { transform: translateX(60%); }
        }
      `}</style>
    </article>
  );
}

/** Mobile overlay card (only on mobile) */
function MobileOverlay({ project }: { project: Project }) {
  const primary = project.links?.[0];

  return (
    <div className="lg:hidden rounded-2xl border border-white/10 bg-black/45 p-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-white/95 truncate">{project.name}</p>

          {project.year ? (
            <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] text-white/70">
              {project.year}
            </span>
          ) : null}
        </div>

        {project.tags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((t) => (
              <TagPill key={t} label={t} small />
            ))}
          </div>
        ) : null}

        <p className="text-[12px] leading-relaxed text-white/72">{project.description}</p>

        {primary ? (
          <div className="mt-1 flex flex-wrap gap-2">
            <SmartLink
              href={primary.href}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] text-white/90"
            >
              {primary.label}
            </SmartLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TagPill({ label, small }: { label: string; small?: boolean }) {
  const scheme = getTagScheme(label);
  const cls = small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return <span className={["inline-flex items-center rounded-full border", cls, scheme].join(" ")}>{label}</span>;
}

function getTagScheme(label: string) {
  const v = hashLabel(label) % 6;
  switch (v) {
    case 0:
      return "border-cyan-400/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-100";
    case 1:
      return "border-violet-400/25 bg-violet-500/10 text-violet-700 dark:text-violet-100";
    case 2:
      return "border-emerald-400/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100";
    case 3:
      return "border-amber-400/25 bg-amber-500/10 text-amber-800 dark:text-amber-100";
    case 4:
      return "border-pink-400/25 bg-pink-500/10 text-pink-700 dark:text-pink-100";
    default:
      return "border-sky-400/25 bg-sky-500/10 text-sky-700 dark:text-sky-100";
  }
}

function hashLabel(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** fixes nested anchors */
function SmartLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
      className={className}
    >
      {children}
    </button>
  );
}