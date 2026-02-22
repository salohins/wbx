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

    // ✅ videos (preferred)
    desktopVideoSrc?: string;
    desktopVideoPoster?: string;
    desktopVideoType?: string;

    mobileVideoSrc?: string;
    mobileVideoPoster?: string;
    mobileVideoType?: string;

    // ✅ optional fallback images
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

    /** optional: accent glow behind devices */
    accent?: string; // e.g. "rgba(255,30,30,0.18)"
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
        <SnapSection
            sectionId={sectionId}
            title={title}
            subtitle={subtitle}
            maxWidth={maxWidth}
            desktopAlign={desktopAlign}
        >
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
                        <div className="relative [perspective:1200px] overflow-visible">
                            <div className="relative will-change-transform transform-gpu motion-safe:animate-[floatY_7.5s_ease-in-out_infinite] motion-reduce:animate-none">
                                {/* soft highlight behind device */}
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 rounded-[24px] md:rounded-[44px] opacity-40 blur-[18px]
                  bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.10),transparent_55%)]"
                                />

                                <DesktopMonitorFrame
                                    videoSrc={project.desktopVideoSrc}
                                    videoPoster={project.desktopVideoPoster}
                                    videoType={project.desktopVideoType}
                                    fallbackImgSrc={project.desktopImageSrc}
                                    alt={project.desktopImageAlt ?? `${project.name} desktop preview`}
                                    accent={accent}
                                    href={primaryHref}
                                    project={project} // ✅ monitor details live inside the frame
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right (Phone) — visible on mobile + desktop */}
                <div className="lg:col-span-4 lg:mt-10 overflow-visible">
                    <SnapSection.Slide id={`${project.id}:mobile`} order={0}>
                        <div className="w-full min-w-0 overflow-visible flex justify-center lg:block">
                            <div className="w-[min(340px,100%)] min-w-0 overflow-visible">
                                <div className="relative [perspective:1200px] overflow-visible">
                                    <div className="relative will-change-transform transform-gpu motion-safe:animate-[floatY2_6.6s_ease-in-out_infinite] motion-reduce:animate-none">
                                        {/* soft highlight behind device */}
                                        <div
                                            aria-hidden
                                            className="pointer-events-none absolute -inset-2 rounded-[56px] opacity-35 blur-[18px]
                      bg-[radial-gradient(circle_at_40%_10%,rgba(255,255,255,0.12),transparent_60%)]"
                                        />

                                        <MobilePhoneFrame
                                            videoSrc={project.mobileVideoSrc}
                                            videoPoster={project.mobileVideoPoster}
                                            videoType={project.mobileVideoType}
                                            fallbackImgSrc={project.mobileImageSrc}
                                            alt={project.mobileImageAlt ?? `${project.name} mobile preview`}
                                            accent={accent}
                                            href={primaryHref}
                                            // ✅ status bar + time hook are inside MobilePhoneFrame
                                            // For bright previews (white base), keep light.
                                            statusVariant="light"
                                            overlay={<MobileOverlay project={project} />}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SnapSection.Slide>
                </div>
            </div>

            <div className="pointer-events-none mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* animations used by the frames */}
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
        @keyframes floatY {
          0%   { transform: translate3d(0, 0px, 0) rotateX(2deg) rotateY(-2deg); }
          25%  { transform: translate3d(0, -10px, 0) rotateX(3deg) rotateY(2deg); }
          50%  { transform: translate3d(0, 0px, 0) rotateX(2deg) rotateY(-1deg); }
          75%  { transform: translate3d(0, 10px, 0) rotateX(1deg) rotateY(-3deg); }
          100% { transform: translate3d(0, 0px, 0) rotateX(2deg) rotateY(-2deg); }
        }
        @keyframes floatY2 {
          0%   { transform: translate3d(0, 0px, 0) rotateX(3deg) rotateY(3deg); }
          25%  { transform: translate3d(0, 12px, 0) rotateX(2deg) rotateY(-2deg); }
          50%  { transform: translate3d(0, 0px, 0) rotateX(3deg) rotateY(2deg); }
          75%  { transform: translate3d(0, -12px, 0) rotateX(4deg) rotateY(-3deg); }
          100% { transform: translate3d(0, 0px, 0) rotateX(3deg) rotateY(3deg); }
        }
      `}</style>
        </article>
    );
}

/** Mobile overlay card (only on mobile; on desktop the monitor shows details) */
function MobileOverlay({ project }: { project: Project }) {
    const primary = project.links?.[0];

    return (
        <div className="lg:hidden rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-3">
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
    return (
        <span className={["inline-flex items-center rounded-full border backdrop-blur-md", cls, scheme].join(" ")}>
            {label}
        </span>
    );
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
