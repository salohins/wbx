// sections/Projects/ui.tsx
import React from "react";

/** keep in one place so frames look consistent */
export const DEVICE_SHADOW = "shadow-[0_18px_60px_rgba(0,0,0,0.35)]";

/** Glow stays the same; we CLIP it in the frames so it can't cause horizontal scroll */
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

/** fixes nested anchors + keeps cards clickable without invalid <a><button> nesting */
export function SmartLink({
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

export function InlineMeta({ k, v }: { k: string; v: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-neutral-900/45 dark:text-white/45">{k}:</span>
            <span className="text-neutral-900/80 dark:text-white/80">{v}</span>
        </div>
    );
}

export function TagPill({ label, small }: { label: string; small?: boolean }) {
    const scheme = getTagScheme(label);
    const cls = small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
    return (
        <span
            className={[
                "inline-flex items-center rounded-full border backdrop-blur-md",
                cls,
                scheme,
            ].join(" ")}
        >
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
                <div className="rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md">
                    Click to view
                </div>
            </div>
        </div>
    );
}
