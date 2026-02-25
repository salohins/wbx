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
    <SnapSection
      sectionId={sectionId}
      title={title}
      subtitle={subtitle}
      maxWidth={maxWidth}
      desktopAlign={desktopAlign}
      // ✅ proper peek handled by SnapSection (no per-slide hacks)
      mobileSliderMode="peek"
      mobilePeekGutterPx={18} // tweak 14..22
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
                  />
                </div>
              </div>
            </div>
          </SnapSection.Slide>

          {/* ✅ Slide 2 (MOBILE ONLY): overlay — proper peek comes from SnapSection */}
          <SnapSection.Slide id={`${project.id}:overlay`} order={1}>
            <div className="lg:hidden w-full h-full flex items-center justify-center">
              <div className="w-full h-[60vh] max-w-[520px]">
                {/* ✅ bg is configurable, grid is back */}
                <MobileOverlay project={project} bg={accent} />
              </div>
            </div>

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

/** Mobile overlay card (only on mobile) — GRID ON, bg configurable via prop */
function MobileOverlay({
  project,
  bg, // ✅ keep prop (used only for subtle glow), surface is light/dark like ServiceRow unselected
}: {
  project: Project;
  bg: string;
}) {
  const primary = project.links?.[0];

  // ✅ fixed sizing (no device tier)
  const padMobile = "px-6 py-6";
  const headerGapMobile = "gap-4";
  const titleMtMobile = "mt-3";
  const descMtMobile = "mt-2";
  const morePtMobile = "pt-4";
  const pillsGapMobile = "gap-2";
  const btnRowMtMobile = "mt-5";
  const btnGapMobile = "gap-3";

  const titleSizeMobile = "text-[32px]";
  const descSizeMobile = "text-[16px]";
  const pillTextMobile = "text-[9px]";
  const btnTextMobile = "text-[10px]";

  // ✅ behave like ServiceRow "unselected"
  const surfaceClass = "bg-white dark:bg-neutral-900/70";
  const textPrimaryClass = "text-neutral-900 dark:text-white";
  const textSecondaryClass = "text-neutral-700 dark:text-white/90";

  // ✅ unselected grid logic (light vs dark)
  const majorGridLightUnselected = `
    linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
  `;
  const minorGridLightUnselected = `
    linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
  `;
  const majorGridWhite = `
    linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)
  `;
  const minorGridWhite = `
    linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
  `;

  const inactiveInnerHighlight =
    "radial-gradient(circle at 22% 10%, rgba(255,255,255,0.22), transparent 52%)," +
    "linear-gradient(180deg, rgba(255,255,255,0.10), transparent 34%)," +
    "radial-gradient(circle at 88% 78%, rgba(0,0,0,0.14), transparent 60%)";

  // ✅ bg prop is kept but used only as a subtle top glow wash (optional)
  const glow = pickGlowFromAnyColor(bg) ?? "rgba(255,255,255,0.12)";

  return (
    <div className="lg:hidden h-full w-full">
      <div
        className={[
          "relative w-full h-full overflow-hidden",
          "rounded-[28px]",
          "border border-white/10",
          padMobile,
          "transform-gpu",
        ].join(" ")}
        style={{
          boxShadow: "0 22px 60px rgba(0, 0, 0, 0.16)",
        }}
      >
        {/* BASE SURFACE (light/dark like ServiceRow unselected) */}
        <div aria-hidden className={["absolute inset-0 transition-colors duration-300", surfaceClass].join(" ")} />

        {/* Inactive depth (same as ServiceRow unselected) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.85]"
          style={{
            background: inactiveInnerHighlight,
            mixBlendMode: "soft-light",
          }}
        />

        {/* Micro edge/bezel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] opacity-70"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
          }}
        />

        {/* GRID (major): light mode */}
        <div
          aria-hidden
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage: majorGridLightUnselected,
            backgroundSize: "28px 28px",
            opacity: 1,
            mixBlendMode: "multiply",
          }}
        />
        {/* GRID (major): dark mode */}
        <div
          aria-hidden
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: majorGridWhite,
            backgroundSize: "28px 28px",
            opacity: 1,
            mixBlendMode: "multiply",
          }}
        />

        {/* GRID (minor): light mode */}
        <div
          aria-hidden
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage: minorGridLightUnselected,
            backgroundSize: "7px 7px",
            opacity: 0.1,
            mixBlendMode: "multiply",
          }}
        />
        {/* GRID (minor): dark mode */}
        <div
          aria-hidden
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: minorGridWhite,
            backgroundSize: "7px 7px",
            opacity: 0.1,
            mixBlendMode: "multiply",
          }}
        />

        {/* subtle accent wash (uses bg prop but does NOT define surface) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            background: `radial-gradient(circle at 18% 0%, ${glow}, transparent 58%)`,
            mixBlendMode: "multiply",
          }}
        />

        {/* RADIAL LIGHT */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 10% 0%, rgba(0,0,0,0.10), transparent 55%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 80% 50%, rgba(0,0,0,0.20), transparent 58%)",
          }}
        />

        {/* CONTENT */}
        <div className="relative z-[1] h-full flex flex-col">
          {/* Header */}
          <div className="flex-none">
            <div className={`flex items-center ${headerGapMobile}`}>
              <div className="text-[13px] tracking-[0.24em] shrink-0 text-neutral-600 dark:text-white/90">
                {project.year ? project.year : "00"}
              </div>

              <div className="h-px flex-1 max-w-[64px] bg-neutral-900/15 dark:bg-white/30" />
            </div>

            <div
              className={[
                `${titleMtMobile} ${titleSizeMobile} sm:text-[38px] font-semibold tracking-[-0.02em] leading-10`,
                textPrimaryClass,
                "break-words",
              ].join(" ")}
            >
              {project.name}
            </div>

            <div
              className={[
                `${descMtMobile} ${descSizeMobile} sm:text-[18px] leading-relaxed`,
                textSecondaryClass,
              ].join(" ")}
            >
              {project.description}
            </div>
          </div>

          {/* Scroll area */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className={morePtMobile}>
              {/* TAG PILLS — EXACT unselected style from ServiceRow */}
              {!!project.tags?.length && (
                <div className={["flex items-center flex-wrap", pillsGapMobile].join(" ")}>
                  {project.tags.slice(0, 7).map((m) => (
                    <span
                      key={m}
                      className={[
                        "inline-flex items-center whitespace-nowrap",
                        "h-7 px-3 rounded-full",
                        `${pillTextMobile} tracking-[0.22em]`,
                        "uppercase",
                        "bg-black/5 text-neutral-900/90 dark:bg-white/12 dark:text-white/95",
                        "backdrop-blur-sm",
                      ].join(" ")}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}

              {(project.client || project.role) && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {project.client && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 px-4 py-3">
                      <p className="text-neutral-600 dark:text-white/55 text-[11px]">Client</p>
                      <p className="mt-1 text-neutral-900 dark:text-white/85 truncate text-[13px]">
                        {project.client}
                      </p>
                    </div>
                  )}
                  {project.role && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 px-4 py-3">
                      <p className="text-neutral-600 dark:text-white/55 text-[11px]">Role</p>
                      <p className="mt-1 text-neutral-900 dark:text-white/85 truncate text-[13px]">
                        {project.role}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex-none pt-4">
            <div className={[`${btnRowMtMobile} flex items-center`, `flex-nowrap ${btnGapMobile}`].join(" ")}>
              {primary ? (
                <>
                  {/* PRIMARY — EXACT unselected “View cases” */}
                  <SmartLink
                    href={primary.href}
                    className={[
                      "flex-1",
                      "h-10 px-4",
                      `${btnTextMobile} tracking-[0.24em]`,
                      "rounded-full uppercase",
                      "bg-neutral-900 text-white hover:bg-neutral-900/90 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90 shadow-sm",
                      "active:scale-[0.98] transition whitespace-nowrap",
                      "inline-flex items-center justify-center",
                    ].join(" ")}
                  >
                    {primary.label} →
                  </SmartLink>

                  {/* SECONDARY — EXACT unselected “Learn more” */}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(primary.href)}
                    className={[
                      "h-10 px-4",
                      `${btnTextMobile} tracking-[0.24em]`,
                      "rounded-full uppercase",
                      "bg-black/5 text-neutral-900 hover:bg-black/10 dark:bg-white/14 dark:text-white dark:hover:bg-white/18",
                      "active:scale-[0.98] transition whitespace-nowrap",
                    ].join(" ")}
                  >
                    Copy
                  </button>
                </>
              ) : (
                <div className="text-neutral-600 dark:text-white/50 text-[12px]">No link provided.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Converts any passed background color into a soft “glow” color.
 * - If it's rgba()/rgb(): uses same rgb + reduced alpha
 * - If it's hex: converts to rgba with default alpha
 * - Otherwise returns null (fallback used)
 */
function pickGlowFromAnyColor(color?: string | null) {
  if (!color || typeof color !== "string") return null;

  // rgba / rgb
  const m = color.match(
    /rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)/i
  );
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const rawA = m[4] ? Number(m[4]) : 0.25;
    const a = Math.min(0.55, Math.max(0.18, rawA * 0.6));
    return `rgba(${r},${g},${b},${a})`;
  }

  // hex (#rgb, #rrggbb)
  const hex = color.trim();
  const hexMatch = hex.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const h = hexMatch[1];
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},0.22)`;
  }

  return null;
}

function TagPill({ label, small }: { label: string; small?: boolean }) {
  const scheme = getTagScheme(label);
  const cls = small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <span className={["inline-flex items-center rounded-full border", cls, scheme].join(" ")}>
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