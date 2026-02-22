import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Lead = {
    id: string;
    name: string;
    company: string;
    status: "New" | "Qualified" | "In progress" | "Won";
    value: string;
    last: string;
    email: string;
    phone: string;
    note: string;
};

export function ToolsPreview() {
    const leads: Lead[] = useMemo(
        () => [
            {
                id: "l1",
                name: "Nina L.",
                company: "Lüscher & Partners AG",
                status: "New",
                value: "CHF 6’900",
                last: "1h ago",
                email: "nina@luescher.ch",
                phone: "+41 79 123 45 67",
                note: "Wants a premium Swiss-style website + references section.",
            },
            {
                id: "l2",
                name: "Tobias B.",
                company: "TB Bau & Management",
                status: "In progress",
                value: "CHF 5’400",
                last: "Today",
                email: "tobias@tbbau.ch",
                phone: "+41 78 222 10 90",
                note: "Needs Figma + offer this week. Focus on structure + credibility.",
            },
            {
                id: "l3",
                name: "Domenico R.",
                company: "Wio Personal AG",
                status: "Qualified",
                value: "CHF 4’800",
                last: "2d ago",
                email: "domenico@wio.ae",
                phone: "+971 50 555 12 34",
                note: "Logo first. Website later if brand direction approved.",
            },
            {
                id: "l4",
                name: "Daniel Z.",
                company: "Zimmermann AG",
                status: "Won",
                value: "CHF 2’200",
                last: "6d ago",
                email: "daniel@zimmermann.ch",
                phone: "+41 76 333 66 11",
                note: "Landing done. Possible upsell: maintenance + SEO refresh.",
            },
            {
                id: "l5",
                name: "Marco K.",
                company: "Baar IT Solutions",
                status: "Qualified",
                value: "CHF 3’600",
                last: "3d ago",
                email: "marco@baarit.ch",
                phone: "+41 79 444 22 88",
                note: "Interested in admin panel + lead capture automations.",
            },
            {
                id: "l6",
                name: "Sara P.",
                company: "Zug Events",
                status: "New",
                value: "CHF 1’900",
                last: "4h ago",
                email: "sara@zugevents.ch",
                phone: "+41 79 888 11 55",
                note: "Wants fast promo landing + IG integration.",
            },
        ],
        []
    );

    const [selectedId, setSelectedId] = useState<string | null>("l2");
    const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
    const [toast, setToast] = useState<null | { title: string; desc?: string }>(null);

    const selected = useMemo(() => leads.find((l) => l.id === selectedId) ?? null, [leads, selectedId]);

    const kpis = useMemo(() => {
        const total = leads.length;
        const qualified = leads.filter((l) => l.status === "Qualified").length;
        const won = leads.filter((l) => l.status === "Won").length;
        return [
            { label: "Leads", value: String(total) },
            { label: "Qualified", value: String(qualified) },
            { label: "Won", value: String(won) },
        ];
    }, [leads]);

    const statusChip = (s: Lead["status"]) => {
        if (s === "New") return { bg: "rgba(56,189,248,0.22)", text: "rgba(15,23,42,0.90)", ring: "rgba(15,23,42,0.10)" };
        if (s === "Qualified") return { bg: "rgba(34,197,94,0.22)", text: "rgba(15,23,42,0.90)", ring: "rgba(15,23,42,0.10)" };
        if (s === "In progress") return { bg: "rgba(168,85,247,0.20)", text: "rgba(15,23,42,0.90)", ring: "rgba(15,23,42,0.10)" };
        return { bg: "rgba(251,113,133,0.22)", text: "rgba(15,23,42,0.90)", ring: "rgba(15,23,42,0.10)" };
    };

    const fireToast = (title: string, desc?: string) => {
        setToast({ title, desc });
        window.setTimeout(() => setToast(null), 1400);
    };

    const openLead = (id: string) => {
        setSelectedId(id);
        setDrawerOpen(true);
        const l = leads.find((x) => x.id === id);
        fireToast("Opened lead", l?.company);
    };

    // ✅ simple density (so it always fits)
    const tableVisible = 4; // show fewer rows so no Y overflow in small previews
    const visibleLeads = leads.slice(0, tableVisible);
    const moreCount = Math.max(0, leads.length - tableVisible);

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
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full blur-[85px]"
                style={{ background: "rgba(34,211,238,0.26)" }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-24 h-[380px] w-[380px] rounded-full blur-[95px]"
                style={{ background: "rgba(168,85,247,0.18)" }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute left-[24%] top-[56%] h-[320px] w-[320px] rounded-full blur-[95px]"
                style={{ background: "rgba(34,197,94,0.16)" }}
            />
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

            {/* ✅ Fit-to-height layout (no Y overflow) */}
            <div className="relative z-[1] h-full w-full p-5 flex flex-col min-h-0">
                {/* header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-32 rounded-xl border border-black/10 bg-white/70 backdrop-blur-sm" />
                        <div className="h-8 w-24 rounded-xl border border-black/10 bg-white/60 backdrop-blur-sm" />
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            className="h-8 px-3 rounded-xl border border-black/10 bg-white/70 text-[11px] font-semibold cursor-pointer"
                            style={{ letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(8,10,20,0.86)" }}
                            onClick={() => fireToast("Synced", "2 updates pushed")}
                        >
                            Sync
                        </motion.button>

                        <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            className="h-8 px-3 rounded-xl border border-black/10 bg-white/80 text-[11px] font-semibold cursor-pointer"
                            style={{ letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(8,10,20,0.90)" }}
                            onClick={() => fireToast("New lead", "Draft created")}
                        >
                            + Lead
                        </motion.button>
                    </div>
                </div>

                {/* KPIs (compact) */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                    {kpis.map((k) => (
                        <motion.div
                            key={k.label}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="rounded-2xl border border-black/10 bg-white/65 backdrop-blur-sm px-4 py-3"
                            style={{ boxShadow: "0 14px 44px rgba(0,0,0,0.10)" }}
                        >
                            <div
                                className="text-[10px] font-semibold"
                                style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.55)" }}
                            >
                                {k.label}
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

                {/* ✅ table: fills remaining height, no overflow */}
                <div
                    className="mt-4 flex-1 min-h-0 rounded-2xl border border-black/10 bg-white/55 backdrop-blur-sm overflow-hidden"
                    style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.10)" }}
                >
                    {/* header row */}
                    <div className="flex items-center gap-3 border-b border-black/10 bg-white/55 px-4 py-3">
                        <div
                            className="text-[10px] font-semibold"
                            style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.62)" }}
                        >
                            Leads
                        </div>
                        <div
                            className="ml-1 h-7 px-3 rounded-full border border-black/10 bg-white/65 text-[10px] font-semibold flex items-center"
                            style={{ color: "rgba(8,10,20,0.62)" }}
                        >
                            {leads.length}
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <div className="h-8 w-28 rounded-xl border border-black/10 bg-white/55" />
                            <div className="h-8 w-20 rounded-xl border border-black/10 bg-white/65" />
                        </div>
                    </div>

                    {/* rows */}
                    <div className="p-4 space-y-2">
                        {visibleLeads.map((l) => {
                            const active = l.id === selectedId;
                            const chip = statusChip(l.status);

                            return (
                                <motion.div
                                    key={l.id}
                                    whileHover={{ y: -1 }}
                                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                                    className="group flex items-center gap-3 rounded-2xl px-4 py-3 border cursor-pointer select-none"
                                    style={{
                                        borderColor: active ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.10)",
                                        background: active ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.62)",
                                    }}
                                    onClick={() => openLead(l.id)}
                                >
                                    <div className="h-9 w-9 rounded-full border border-black/10 bg-black/5 relative overflow-hidden" />

                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-semibold truncate" style={{ color: "rgba(8,10,20,0.90)" }}>
                                            {l.company}
                                        </div>
                                        <div className="mt-1 text-[12px]" style={{ color: "rgba(8,10,20,0.62)" }}>
                                            {l.name} • {l.last}
                                        </div>
                                    </div>

                                    <div
                                        className="h-7 px-3 rounded-full border flex items-center text-[10px] font-semibold"
                                        style={{
                                            background: chip.bg,
                                            borderColor: chip.ring,
                                            color: chip.text,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {l.status}
                                    </div>

                                    <div
                                        className="h-7 px-3 rounded-full border border-black/10 bg-black/5 text-[10px] font-semibold flex items-center"
                                        style={{ color: "rgba(8,10,20,0.70)", whiteSpace: "nowrap" }}
                                    >
                                        {l.value}
                                    </div>

                                    <motion.button
                                        type="button"
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="h-7 w-9 rounded-xl border border-black/10 bg-black/5 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fireToast("Action", "Delete menu (demo)");
                                        }}
                                        title="Delete"
                                    />
                                </motion.div>
                            );
                        })}

                        {moreCount > 0 && (
                            <div className="pt-1">
                                <div
                                    className="h-10 rounded-2xl border border-black/10 bg-white/55 flex items-center justify-between px-4"
                                    style={{ color: "rgba(8,10,20,0.62)" }}
                                >
                                    <div className="text-[12px] font-semibold" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>
                                        + {moreCount} more hidden
                                    </div>
                                    <div className="h-2 w-24 rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ bottom actions are now in-flow (no absolute overlay) */}
                <div className="mt-3 flex items-center justify-between">
                    <motion.div
                        whileHover={{ y: -1 }}
                        className="h-9 w-36 rounded-xl border border-black/10 bg-white/55 backdrop-blur-sm cursor-pointer"
                        onClick={() => fireToast("Filter", "Qualified leads")}
                    />
                    <motion.div
                        whileHover={{ y: -1 }}
                        className="h-9 w-24 rounded-xl border border-black/10 bg-white/65 backdrop-blur-sm cursor-pointer"
                        onClick={() => fireToast("Export", "CSV prepared")}
                    />
                </div>
            </div>

            {/* ✅ drawer stays inside preview, but doesn't force page overflow */}
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
                                            <div
                                                className="text-[10px] font-semibold"
                                                style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.55)" }}
                                            >
                                                Lead details
                                            </div>
                                            <div className="mt-2 text-[16px] font-semibold truncate" style={{ color: "rgba(8,10,20,0.92)" }}>
                                                {selected.company}
                                            </div>
                                            <div className="mt-1 text-[13px]" style={{ color: "rgba(8,10,20,0.62)" }}>
                                                {selected.name} • {selected.last}
                                            </div>
                                        </div>

                                        <motion.button
                                            type="button"
                                            whileHover={{ y: -1 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="h-9 w-9 rounded-xl border border-black/10 bg-black/5 cursor-pointer"
                                            onClick={() => setDrawerOpen(false)}
                                            title="Close"
                                        />
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                        <div
                                            className="h-7 px-3 rounded-full border border-black/10 bg-black/5 text-[10px] font-semibold flex items-center"
                                            style={{ letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(8,10,20,0.70)" }}
                                        >
                                            {selected.value}
                                        </div>

                                        <div
                                            className="h-7 px-3 rounded-full border flex items-center text-[10px] font-semibold"
                                            style={{
                                                background: statusChip(selected.status).bg,
                                                borderColor: statusChip(selected.status).ring,
                                                color: statusChip(selected.status).text,
                                                letterSpacing: "0.14em",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {selected.status}
                                        </div>
                                    </div>
                                </div>

                                {/* ✅ scroll-free: compact fields + fixed action grid */}
                                <div className="p-4 space-y-3 flex-1 min-h-0">
                                    <Field label="Email" value={selected.email} />
                                    <Field label="Phone" value={selected.phone} />
                                    <Field label="Note" value={selected.note} />

                                    <div className="pt-1 grid grid-cols-2 gap-2">
                                        <DrawerBtn onClick={() => fireToast("Action", "Call (demo)")}>Call</DrawerBtn>
                                        <DrawerBtn onClick={() => fireToast("Action", "Email (demo)")}>Email</DrawerBtn>
                                        <DrawerBtn onClick={() => fireToast("Action", "Move stage (demo)")}>Move</DrawerBtn>
                                        <DrawerBtn danger onClick={() => fireToast("Action", "Delete (demo)")}>
                                            Delete
                                        </DrawerBtn>
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

/* -------------------- small bits -------------------- */

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
            <div
                className="text-[10px] font-semibold"
                style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(8,10,20,0.55)" }}
            >
                {label}
            </div>
            <div className="mt-2 text-[13px] font-semibold" style={{ color: "rgba(8,10,20,0.86)" }}>
                {value}
            </div>
        </div>
    );
}

function DrawerBtn({
    children,
    onClick,
    danger,
}: {
    children: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="h-10 rounded-xl font-semibold cursor-pointer border"
            style={{
                background: danger ? "rgba(255,42,42,0.12)" : "rgba(0,0,0,0.05)",
                borderColor: danger ? "rgba(255,42,42,0.22)" : "rgba(0,0,0,0.10)",
                color: danger ? "rgba(255,42,42,0.92)" : "rgba(8,10,20,0.84)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: 11,
            }}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
}
