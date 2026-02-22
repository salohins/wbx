// sections/Contact/ContactFormScreen.tsx
import React from "react";
import { Send } from "lucide-react";

export function ContactFormScreen() {
    return (
        <div className="relative h-full w-full bg-white overflow-hidden">
            {/* subtle top tint / depth */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at 50% 0%, rgba(0,0,0,0.06), transparent 45%), linear-gradient(180deg, rgba(0,0,0,0.03), transparent 30%)",
                }}
            />

            {/* ✅ single column that stays within the screen */}
            <div className="relative h-full w-full flex flex-col px-6 pt-[28px] pb-6">
                {/* header */}
                <div>
                    <div className="text-neutral-900 text-2xl font-semibold tracking-tight">
                        Kontaktformular
                    </div>
                    <div className="mt-1 text-neutral-600 text-sm leading-snug">
                        Sag kurz, was du brauchst — wir melden uns schnell.
                    </div>
                </div>

                {/* fields (no labels) */}
                <div className="mt-5 grid gap-4">
                    <TextInput placeholder="Dein Name" />
                    <TextInput placeholder="name@firma.ch" inputMode="email" />
                    <TextArea placeholder="Was brauchst du genau?" rows={4} />
                </div>

                {/* spacer: pushes button down only if there is room */}
                <div className="flex-1" />

                {/* submit */}
                <div className="mt-4">
                    <button
                        type="button"
                        className={[
                            "w-full rounded-2xl px-5 py-4",
                            "bg-neutral-900 text-white font-semibold",
                            "hover:bg-neutral-800 transition",
                            "flex items-center justify-center gap-2",
                        ].join(" ")}
                    >
                        Nachricht senden <Send className="h-4 w-4" />
                    </button>

                    <div className="mt-2 text-center text-[11px] text-neutral-500">
                        Alternativ: WhatsApp / Telefon / E-Mail
                    </div>
                </div>
            </div>
        </div>
    );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={[
                "h-12 w-full rounded-xl px-4",
                "bg-white border border-black/10",
                "text-neutral-900 placeholder:text-neutral-400",
                "outline-none focus:border-black/25 focus:ring-4 focus:ring-black/5",
            ].join(" ")}
        />
    );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={[
                "w-full rounded-xl px-4 py-3",
                "bg-white border border-black/10",
                "text-neutral-900 placeholder:text-neutral-400",
                "outline-none focus:border-black/25 focus:ring-4 focus:ring-black/5",
                "resize-none",
            ].join(" ")}
        />
    );
}