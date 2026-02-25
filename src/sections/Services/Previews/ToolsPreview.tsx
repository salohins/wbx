import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Inbox,
    Calendar,
    Send,
    Sparkles,
    Globe,
    MapPin,
    Phone,
    Mail,
    FileText,
    LayoutTemplate,
    Layers,
    Zap,
    ChevronRight,
    Search,
    SlidersHorizontal,
    Download,
    ExternalLink,
    MessageSquare,
    Clock,
    BadgeCheck,
} from "lucide-react";

type RequestStatus = "Inquiry" | "Call booked" | "Proposal sent" | "Active";

type Request = {
    id: string;
    name: string;
    company: string;
    status: RequestStatus;
    budget: "Low" | "Medium" | "High";
    last: string;
    email: string;
    phone: string;
    message: string;
    scope: string[];
    timeline: string;
    website?: string;
};

export function ToolsPreview() {
    const requests: Request[] = useMemo(
        () => [
            {
                id: "r1",
                name: "Nina L.",
                company: "Alpine Advisory",
                status: "Inquiry",
                budget: "High",
                last: "1h ago",
                email: "nina@alpine-advisory.ch",
                phone: "+41 79 123 45 67",
                message: "We need a clean, premium site that builds trust and explains our services clearly.",
                scope: ["Website", "References", "Contact flow"],
                timeline: "2–3 weeks",
                website: "alpine-advisory.ch",
            },
            {
                id: "r2",
                name: "Tobias B.",
                company: "Northstone Build",
                status: "Call booked",
                budget: "Medium",
                last: "Today",
                email: "tobias@northstone.ch",
                phone: "+41 78 222 10 90",
                message: "We want a modern site with strong structure and clear sections for services and projects.",
                scope: ["Website", "Projects", "SEO basics"],
                timeline: "2 weeks",
                website: "northstone.ch",
            },
            {
                id: "r3",
                name: "Domenico R.",
                company: "Wio Staffing",
                status: "Proposal sent",
                budget: "Medium",
                last: "2d ago",
                email: "domenico@wio-group.com",
                phone: "+971 50 555 12 34",
                message: "We want a brand refresh and a website that looks trustworthy and modern.",
                scope: ["Branding", "Website"],
                timeline: "3–4 weeks",
                website: "wio-group.com",
            },
            {
                id: "r4",
                name: "Daniel Z.",
                company: "Zimmermann Studio",
                status: "Active",
                budget: "Low",
                last: "6d ago",
                email: "daniel@zimmermann-studio.ch",
                phone: "+41 76 333 66 11",
                message: "A focused landing page with a clear offer and a contact form.",
                scope: ["Landing page", "Contact form"],
                timeline: "1 week",
                website: "zimmermann-studio.ch",
            },
            {
                id: "r5",
                name: "Sara P.",
                company: "City Events",
                status: "Inquiry",
                budget: "Low",
                last: "4h ago",
                email: "sara@city-events.ch",
                phone: "+41 79 888 11 55",
                message: "We need a fast page for an upcoming event with a clean layout and signup.",
                scope: ["Landing page", "Signup"],
                timeline: "3–5 days",
                website: "city-events.ch",
            },
        ],
        []
    );

    const [selectedId, setSelectedId] = useState<string | null>("r2");
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [toast, setToast] = useState<null | { title: string; desc?: string }>(null);

    const selected = useMemo(() => requests.find((r) => r.id === selectedId) ?? null, [requests, selectedId]);

    const kpis = useMemo(() => {
        const total = requests.length;
        const calls = requests.filter((r) => r.status === "Call booked").length;
        const active = requests.filter((r) => r.status === "Active").length;
        return [
            { label: "Requests", value: String(total), icon: Inbox },
            { label: "Calls", value: String(calls), icon: Calendar },
            { label: "Active", value: String(active), icon: Sparkles },
        ];
    }, [requests]);

    const statusChip = (s: RequestStatus) => {
        if (s === "Inquiry") return { bg: "rgba(56,189,248,0.22)", text: "rgba(15,23,42,0.90)", ring: "rgba(15,23,42,0.10)", icon: MessageSquare };
        if (s === "Call booked") return { bg: "rgba(34,197,94,0.22)", text: "rgba(15,23,42,0.90)", ring: "rgba(15,23,42,0.10)", icon: Calendar };
        if (s === "Proposal sent") return { bg: "rgba(168,85,247,0.20)", text: "rgba(15,23,42,0.90)", ring: "rgba(15,23,42,0.10)", icon: Send };
        return { bg: "rgba(251,113,133,0.22)", text: "rgba(15,23,42,0.90)", ring: "rgba(15,23,42,0.10)", icon: BadgeCheck };
    };

    const budgetChip = (b: Request["budget"]) => {
        if (b === "Low") return { bg: "rgba(0,0,0,0.06)", text: "rgba(8,10,20,0.72)", ring: "rgba(0,0,0,0.10)" };
        if (b === "Medium") return { bg: "rgba(0,0,0,0.08)", text: "rgba(8,10,20,0.78)", ring: "rgba(0,0,0,0.10)" };
        return { bg: "rgba(0,0,0,0.10)", text: "rgba(8,10,20,0.86)", ring: "rgba(0,0,0,0.10)" };
    };

    const fireToast = (title: string, desc?: string) => {
        setToast({ title, desc });
        window.setTimeout(() => setToast(null), 1400);
    };

    const openRequest = (id: string) => {
        setSelectedId(id);
        setDrawerOpen(true);
        const r = requests.find((x) => x.id === id);
        fireToast("Opened", r?.company);
    };

    const visible = requests.slice(0, 4);
    const moreCount = Math.max(0, requests.length - 4);

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(240,253,250,1) 0%, rgba(224,231,255,1) 38%, rgba(255,241,242,1) 100%)",
                }}
            />
            <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full blur-[85px]" style={{ background: "rgba(34,211,238,0.26)" }} />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-[380px] w-[380px] rounded-full blur-[95px]" style={{ background: "rgba(168,85,247,0.18)" }} />
            <div aria-hidden className="pointer-events-none absolute left-[24%] top-[56%] h-[320px] w-[320px] rounded-full blur-[95px]" style={{ background: "rgba(34,197,94,0.16)" }} />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.16]"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 22% 28%, rgba(0,0,0,0.16) 0 1px, transparent 2px),
            radial-gradient(circle at 68% 18%, rgba(0,0,0,0.12) 0 1px, transparent 2px),
            radial-gradient(circle at 44% 72%, rgba(0,0,0,0.12) 0 1px, transparent 2px)
          `,
                }}
            />

            <div className="relative z-[1] h-full w-full p-5 flex flex-col min-h-0">
                {/* header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconPill icon={Search} label="Search" onClick={() => fireToast("Search", "Opened")} />
                        <IconPill icon={SlidersHorizontal} label="Filter" onClick={() => fireToast("Filter", "Applied")} />
                    </div>

                    <div className="flex items-center gap-2">
                        <IconBtn icon={Zap} label="Update" onClick={() => fireToast("Updated", "Inbox refreshed")} />
                        <IconBtn icon={ChevronRight} label="New" onClick={() => fireToast("New", "Request created")} strong />
                    </div>
                </div>

                {/* KPIs */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                    {kpis.map((k) => (
                        <motion.div
                            key={k.label}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="rounded-2xl border border-black/10 bg-white/65 backdrop-blur-sm px-4 py-3"
                            style={{ boxShadow: "0 14px 44px rgba(0,0,0,0.10)" }}
                        >
                            <div className="flex items-center gap-2" style={{ color: "rgba(8,10,20,0.55)" }}>
                                <k.icon size={14} style={{ opacity: 0.8 }} />
                                <div className="text-[10px] font-semibold" style={{ letterSpacing: "0.22em", textTransform: "uppercase" }}>
                                    {k.label}
                                </div>
                            </div>
                            <div className="mt-2 text-[18px] font-semibold" style={{ color: "rgba(8,10,20,0.92)" }}>
                                {k.value}
                            </div>

                            <div className="mt-2 h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ width: "55%", background: "rgba(0,0,0,0.18)" }}
                                    animate={{ x: ["-30%", "20%", "-30%"] }}
                                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* list */}
                <div
                    className="mt-4 flex-1 min-h-0 rounded-2xl border border-black/10 bg-white/55 backdrop-blur-sm overflow-hidden"
                    style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.10)" }}
                >
                    <div className="flex items-center gap-3 border-b border-black/10 bg-white/55 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Inbox size={14} style={{ opacity: 0.75, color: "rgba(8,10,20,0.68)" }} />
                            <div className="text-[10px] font-semibold" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.62)" }}>
                                Requests
                            </div>
                            <div className="ml-1 h-7 px-3 rounded-full border border-black/10 bg-white/65 text-[10px] font-semibold flex items-center" style={{ color: "rgba(8,10,20,0.62)" }}>
                                {requests.length}
                            </div>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <TinyBtn icon={Search} onClick={() => fireToast("Search", "Opened")} />
                            <TinyBtn icon={SlidersHorizontal} onClick={() => fireToast("Filter", "Opened")} />
                        </div>
                    </div>

                    <div className="p-4 space-y-2">
                        {visible.map((r) => {
                            const active = r.id === selectedId;
                            const st = statusChip(r.status);
                            const b = budgetChip(r.budget);

                            return (
                                <motion.div
                                    key={r.id}
                                    whileHover={{ y: -1 }}
                                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                                    className="group flex items-center gap-3 rounded-2xl px-4 py-3 border cursor-pointer select-none"
                                    style={{
                                        borderColor: active ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.10)",
                                        background: active ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.62)",
                                    }}
                                    onClick={() => openRequest(r.id)}
                                >
                                    <InitialBadge name={r.company} />

                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-semibold truncate" style={{ color: "rgba(8,10,20,0.90)" }}>
                                            {r.company}
                                        </div>
                                        <div className="mt-1 text-[12px] flex items-center gap-2" style={{ color: "rgba(8,10,20,0.62)" }}>
                                            <span className="truncate">{r.name}</span>
                                            <span style={{ opacity: 0.5 }}>•</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock size={12} style={{ opacity: 0.75 }} />
                                                {r.last}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="h-7 px-3 rounded-full border flex items-center gap-2 text-[10px] font-semibold"
                                        style={{
                                            background: st.bg,
                                            borderColor: st.ring,
                                            color: st.text,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <st.icon size={13} style={{ opacity: 0.85 }} />
                                        {r.status}
                                    </div>

                                    <div
                                        className="h-7 px-3 rounded-full border flex items-center gap-2 text-[10px] font-semibold"
                                        style={{
                                            background: b.bg,
                                            borderColor: b.ring,
                                            color: b.text,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <LayoutTemplate size={13} style={{ opacity: 0.8 }} />
                                        {r.budget}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {moreCount > 0 && (
                            <div className="pt-1">
                                <div className="h-10 rounded-2xl border border-black/10 bg-white/55 flex items-center justify-between px-4" style={{ color: "rgba(8,10,20,0.62)" }}>
                                    <div className="text-[12px] font-semibold" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>
                                        + {moreCount} more
                                    </div>
                                    <div className="h-2 w-24 rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* bottom actions */}
                <div className="mt-3 flex items-center justify-between">
                    <IconBtn icon={SlidersHorizontal} label="Filter" onClick={() => fireToast("Filter", "Applied")} subtle />
                    <IconBtn icon={Download} label="Export" onClick={() => fireToast("Export", "Prepared")} subtle />
                </div>
            </div>

            {/* drawer */}
            <AnimatePresence>
                {drawerOpen && selected && (
                    <>
                        <motion.div
                            key="drawerBackdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[8]"
                            style={{ background: "rgba(0,0,0,0.18)" }}
                            onClick={() => setDrawerOpen(false)}
                        />

                        <motion.div
                            key="drawer"
                            initial={{ x: 380, opacity: 0.6 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 380, opacity: 0.7 }}
                            transition={{ type: "spring", stiffness: 520, damping: 44, mass: 0.9 }}
                            className="absolute top-0 right-0 bottom-0 z-[9] w-[min(340px,86%)]"
                            style={{ padding: 12 }}
                        >
                            <div
                                className="h-full rounded-[26px] border border-black/10 bg-white/75 backdrop-blur-xl overflow-hidden flex flex-col min-h-0"
                                style={{ boxShadow: "0 26px 110px rgba(0,0,0,0.22)" }}
                            >
                                <div className="p-4 border-b border-black/10 bg-white/70">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-semibold" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.55)" }}>
                                                Request
                                            </div>
                                            <div className="mt-2 text-[16px] font-semibold truncate" style={{ color: "rgba(8,10,20,0.92)" }}>
                                                {selected.company}
                                            </div>
                                            <div className="mt-1 text-[13px] flex items-center gap-2" style={{ color: "rgba(8,10,20,0.62)" }}>
                                                <span className="truncate">{selected.name}</span>
                                                <span style={{ opacity: 0.5 }}>•</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock size={12} style={{ opacity: 0.75 }} />
                                                    {selected.last}
                                                </span>
                                            </div>
                                        </div>

                                        <TinyBtn icon={ChevronRight} onClick={() => setDrawerOpen(false)} />
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                        <Chip icon={Calendar} label={selected.timeline} />
                                        <Chip icon={Layers} label={`Budget ${selected.budget}`} />
                                        <Chip icon={statusChip(selected.status).icon} label={selected.status} tint={statusChip(selected.status).bg} />
                                    </div>
                                </div>

                                <div className="p-4 space-y-3 flex-1 min-h-0">
                                    <Field icon={Mail} label="Email" value={selected.email} />
                                    <Field icon={Phone} label="Phone" value={selected.phone} />

                                    <div className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <LayoutTemplate size={14} style={{ opacity: 0.7 }} />
                                            <div className="text-[10px] font-semibold" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.55)" }}>
                                                Scope
                                            </div>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selected.scope.slice(0, 4).map((s) => (
                                                <span
                                                    key={s}
                                                    className="h-7 px-3 rounded-full border border-black/10 bg-black/5 text-[10px] font-semibold inline-flex items-center gap-2"
                                                    style={{ letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(8,10,20,0.72)" }}
                                                >
                                                    <Sparkles size={12} style={{ opacity: 0.75 }} />
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} style={{ opacity: 0.7 }} />
                                            <div className="text-[10px] font-semibold" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.55)" }}>
                                                Message
                                            </div>
                                        </div>
                                        <div className="mt-2 text-[13px] font-semibold" style={{ color: "rgba(8,10,20,0.86)", lineHeight: 1.35 }}>
                                            {selected.message}
                                        </div>
                                    </div>

                                    <div className="pt-1 grid grid-cols-2 gap-2">
                                        <ActionBtn icon={Calendar} onClick={() => fireToast("Scheduled", "Call booked")}>
                                            Schedule
                                        </ActionBtn>
                                        <ActionBtn icon={Send} onClick={() => fireToast("Sent", "Reply prepared")}>
                                            Reply
                                        </ActionBtn>
                                        <ActionBtn icon={FileText} onClick={() => fireToast("Prepared", "Proposal draft")}>
                                            Proposal
                                        </ActionBtn>
                                        <ActionBtn icon={ExternalLink} onClick={() => fireToast("Opened", selected.website ?? "Website")}>
                                            Website
                                        </ActionBtn>
                                    </div>

                                    <div className="mt-2 rounded-2xl border border-black/10 bg-white/55 px-4 py-3">
                                        <div className="flex items-center gap-2" style={{ color: "rgba(8,10,20,0.62)" }}>
                                            <Globe size={14} style={{ opacity: 0.75 }} />
                                            <div className="text-[12px] font-semibold">{selected.website ?? "—"}</div>
                                            <div className="ml-auto flex items-center gap-1">
                                                <MapPin size={14} style={{ opacity: 0.65 }} />
                                                <div className="text-[12px] font-semibold">Switzerland</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-5 z-[10] rounded-full border border-black/10 bg-white/70 backdrop-blur-xl px-5 py-3"
                        style={{ boxShadow: "0 18px 70px rgba(0,0,0,0.18)" }}
                    >
                        <div className="text-[12px] font-semibold" style={{ color: "rgba(8,10,20,0.90)" }}>
                            {toast.title}
                        </div>
                        {toast.desc && (
                            <div className="text-[12px] mt-0.5" style={{ color: "rgba(8,10,20,0.60)" }}>
                                {toast.desc}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* -------------------- bits -------------------- */

function InitialBadge({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");

    return (
        <div
            className="h-9 w-9 rounded-full border border-black/10 bg-white/70 flex items-center justify-center"
            style={{ boxShadow: "0 10px 26px rgba(0,0,0,0.08)" }}
        >
            <span style={{ fontSize: 12, fontWeight: 900, color: "rgba(8,10,20,0.82)", letterSpacing: "0.08em" }}>
                {initials || "—"}
            </span>
        </div>
    );
}

function TinyBtn({
    icon: Icon,
    onClick,
}: {
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    onClick: () => void;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="h-8 w-8 rounded-xl border border-black/10 bg-white/65 backdrop-blur-sm inline-flex items-center justify-center cursor-pointer"
            onClick={onClick}
            title="Action"
        >
            <Icon size={14} style={{ opacity: 0.8, color: "rgba(8,10,20,0.78)" }} />
        </motion.button>
    );
}

function IconBtn({
    icon: Icon,
    label,
    onClick,
    strong,
    subtle,
}: {
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    label: string;
    onClick: () => void;
    strong?: boolean;
    subtle?: boolean;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-9 px-3 rounded-xl border border-black/10 font-semibold cursor-pointer inline-flex items-center gap-2"
            style={{
                background: strong ? "rgba(8,10,20,0.92)" : subtle ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.75)",
                color: strong ? "white" : "rgba(8,10,20,0.86)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontSize: 11,
            }}
            onClick={onClick}
        >
            <Icon size={14} style={{ opacity: strong ? 0.95 : 0.85 }} />
            {label}
        </motion.button>
    );
}

function IconPill({
    icon: Icon,
    label,
    onClick,
}: {
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    label: string;
    onClick: () => void;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-9 px-3 rounded-xl border border-black/10 bg-white/65 backdrop-blur-sm font-semibold cursor-pointer inline-flex items-center gap-2"
            style={{ color: "rgba(8,10,20,0.80)", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 11 }}
            onClick={onClick}
        >
            <Icon size={14} style={{ opacity: 0.85 }} />
            {label}
        </motion.button>
    );
}

function Field({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
            <div className="flex items-center gap-2">
                <Icon size={14} style={{ opacity: 0.7, color: "rgba(8,10,20,0.78)" }} />
                <div className="text-[10px] font-semibold" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.55)" }}>
                    {label}
                </div>
            </div>
            <div className="mt-2 text-[13px] font-semibold" style={{ color: "rgba(8,10,20,0.86)" }}>
                {value}
            </div>
        </div>
    );
}

function ActionBtn({
    children,
    onClick,
    icon: Icon,
}: {
    children: React.ReactNode;
    onClick: () => void;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-10 rounded-xl font-semibold cursor-pointer border inline-flex items-center justify-center gap-2"
            style={{
                background: "rgba(0,0,0,0.05)",
                borderColor: "rgba(0,0,0,0.10)",
                color: "rgba(8,10,20,0.84)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: 11,
            }}
            onClick={onClick}
        >
            <Icon size={14} style={{ opacity: 0.85 }} />
            {children}
        </motion.button>
    );
}

function Chip({
    icon: Icon,
    label,
    tint,
}: {
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    label: string;
    tint?: string;
}) {
    return (
        <div
            className="h-7 px-3 rounded-full border border-black/10 text-[10px] font-semibold inline-flex items-center gap-2"
            style={{
                background: tint ?? "rgba(0,0,0,0.05)",
                color: "rgba(8,10,20,0.78)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
            }}
        >
            <Icon size={14} style={{ opacity: 0.85 }} />
            {label}
        </div>
    );
}