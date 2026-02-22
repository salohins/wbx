// sections/Contact/ContactHeroSnapSection.tsx
import React from "react";
import { SnapSection } from "../../components/SnapSection2";
import { ContactDeviceFrame } from "./ContactDeviceFrame";
import { MessageCircle, Phone, Mail, ArrowRight } from "lucide-react";

function ContactChannelCard({
    icon,
    title,
    subtitle,
    href,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className={[
                "group relative w-full rounded-2xl border border-white/10 bg-white/5",
                "px-5 py-4",
                "transition-transform duration-500",
                "hover:-translate-y-0.5 hover:bg-white/7",
            ].join(" ")}
        >
            <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/7 border border-white/10">
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-white text-base font-semibold tracking-tight">{title}</div>
                    <div className="text-white/70 text-sm leading-snug">{subtitle}</div>
                </div>
                <div className="ml-auto text-white/40 group-hover:text-white/70 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                </div>
            </div>

            {/* subtle glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background:
                        "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.10), transparent 55%)",
                }}
            />
        </a>
    );
}

function MiniFaqCard({
    q,
    a,
}: {
    q: string;
    a: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <div className="text-white font-semibold text-sm">{q}</div>
            <div className="mt-1 text-white/70 text-sm leading-snug">{a}</div>
        </div>
    );
}

export function ContactHeroSnapSection() {
    return (
        <SnapSection
            sectionId="contact-hero"
            title="Kontakt"
            subtitle="Sag kurz, was du brauchst — wir antworten schnell."
            maxWidth="max-w-7xl"
            desktopAlign="center"
        >
            {/* ✅ DESKTOP LAYOUT */}
            <div className="hidden lg:grid w-full gap-8 items-center grid-cols-[320px_minmax(0,1fr)_360px]">
                {/* Left column */}
                <div className="flex flex-col gap-4">
                    <ContactChannelCard
                        icon={<MessageCircle className="h-5 w-5 text-white/80" />}
                        title="WhatsApp"
                        subtitle="Schnellste Antwort — schreib uns direkt."
                        href="#"
                    />
                    <ContactChannelCard
                        icon={<Phone className="h-5 w-5 text-white/80" />}
                        title="Telefon"
                        subtitle="Kurz anrufen — wir klären’s sofort."
                        href="tel:+41000000000"
                    />
                    <ContactChannelCard
                        icon={<Mail className="h-5 w-5 text-white/80" />}
                        title="E-Mail"
                        subtitle="Für längere Anfragen & Unterlagen."
                        href="mailto:hello@webx.ch"
                    />
                </div>

                {/* Center */}
                <div className="flex justify-center">
                    <ContactDeviceFrame accent="rgba(255, 30, 30, 0.22)" />
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">
                    <MiniFaqCard q="Wie schnell antwortet ihr?" a="Meist innerhalb von 1–3 Stunden (Mo–Fr)." />
                    <MiniFaqCard q="Was kostet eine Website?" a="Kommt drauf an — wir schicken dir ein Fixpreis-Angebot." />
                    <MiniFaqCard q="Kann ich nur Design/Branding buchen?" a="Ja — auch einzelne Module sind möglich." />

                    <a
                        href="/faq"
                        className="mt-2 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-white font-semibold hover:bg-white/12 transition"
                    >
                        Alle FAQs ansehen <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                </div>
            </div>

            {/* ✅ MOBILE SLIDES */}
            <div className="lg:hidden w-full">
                <SnapSection.Slide id="contact-channels" order={0}>
                    <div className="w-full max-w-md flex flex-col gap-4">
                        <ContactChannelCard
                            icon={<MessageCircle className="h-5 w-5 text-white/80" />}
                            title="WhatsApp"
                            subtitle="Schnellste Antwort — schreib uns direkt."
                            href="#"
                        />
                        <ContactChannelCard
                            icon={<Phone className="h-5 w-5 text-white/80" />}
                            title="Telefon"
                            subtitle="Kurz anrufen — wir klären’s sofort."
                            href="tel:+41000000000"
                        />
                        <ContactChannelCard
                            icon={<Mail className="h-5 w-5 text-white/80" />}
                            title="E-Mail"
                            subtitle="Für längere Anfragen & Unterlagen."
                            href="mailto:hello@webx.ch"
                        />
                    </div>
                </SnapSection.Slide>

                <SnapSection.Slide id="contact-form" order={1}>
                    <div className="w-full flex items-center justify-center">
                        <ContactDeviceFrame accent="rgba(255, 30, 30, 0.22)" />
                    </div>
                </SnapSection.Slide>

                <SnapSection.Slide id="contact-faq" order={2}>
                    <div className="w-full max-w-md flex flex-col gap-4">
                        <MiniFaqCard q="Wie schnell antwortet ihr?" a="Meist innerhalb von 1–3 Stunden (Mo–Fr)." />
                        <MiniFaqCard q="Was kostet eine Website?" a="Kommt drauf an — wir schicken dir ein Fixpreis-Angebot." />
                        <MiniFaqCard q="Kann ich nur Design/Branding buchen?" a="Ja — auch einzelne Module sind möglich." />

                        <a
                            href="/faq"
                            className="mt-1 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-white font-semibold hover:bg-white/12 transition"
                        >
                            Alle FAQs ansehen <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                    </div>
                </SnapSection.Slide>
            </div>
        </SnapSection>
    );
}