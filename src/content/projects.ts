import type { Project } from "../sections/Projects/ProjectSnapSection";

export type ProjectContent = {
    id: string;
    year: string;
    client: string;
    role: string;
    tags: string[];

    desktopImageSrc?: string;
    mobileImageSrc?: string;
    desktopVideoSrc?: string;
    mobileVideoSrc?: string;

    links?: [
        {
            label: string,
            href: string,
        }
    ],

    translations: {
        en: {
            name: string;
            description: string;
        };
        de: {
            name: string;
            description: string;
        };
    };
};

export const projects: ProjectContent[] = [
    {
        id: "tb-bau",
        year: "2025",
        client: "TB Bau & Management",
        role: "Design + Frontend",
        tags: ["Website", "UX", "SEO"],

        desktopVideoSrc: "/video/tb-bau_desktop.mp4",
        mobileVideoSrc: "/video/tb-bau_mobile.mp4",

        links: [
            {
                label: "Visit",
                href: "https://tb-bau.ch"
            }
        ],

        translations: {
            en: {
                name: "TB Bau & Management",
                description:
                    "Construction management website with clean structure, fast load, and strong trust signals.",
            },
            de: {
                name: "TB Bau & Management",
                description:
                    "Website für Baumanagement mit klarer Struktur, schnellen Ladezeiten und starken Vertrauenselementen.",
            },
        },
    },

    {
        id: "zimmermann",
        year: "2024",
        client: "Zimmermann AG",
        role: "Design + Frontend",
        tags: ["Brand", "Design", "Performance"],

        desktopVideoSrc: "/video/zimmermann_desktop.mp4",
        mobileVideoSrc: "/video/zimmermann_mobile.mp4",

        links: [
            {
                label: "Visit",
                href: "https://ze-ag.ch"
            }
        ],


        translations: {
            en: {
                name: "Zimmermann AG",
                description:
                    "Business website with a polished look, clear service pages, and optimized mobile layout.",
            },
            de: {
                name: "Zimmermann AG",
                description:
                    "Business-Website mit hochwertigem Look, klaren Leistungsseiten und optimiertem Mobile Layout.",
            },
        },
    },

    {
        id: "libertygroup",
        year: "2025",
        client: "Liberty Groupe",
        role: "Design + Frontend",
        tags: ["Brand", "Design", "Performance"],

        desktopVideoSrc: "/video/liberty-group_desktop.mp4",
        mobileVideoSrc: "/video/liberty-group_mobile.mp4",

        links: [
            {
                label: "Visit",
                href: "https://libertysgroup.ch/"
            }
        ],


        translations: {
            en: {
                name: "Liberty Groupe",
                description:
                    "Business website with a polished look, clear service pages, and optimized mobile layout.",
            },
            de: {
                name: "Liberty Groupe",
                description:
                    "Business-Website mit hochwertigem Look, klaren Leistungsseiten und optimiertem Mobile Layout.",
            },
        },
    },
    {
        id: "moostrade",
        year: "2026",
        client: "Moostrade",
        role: "Design + Frontend",
        tags: ["Brand", "Design", "Performance"],

        desktopVideoSrc: "/video/moostrade_desktop.mp4",
        mobileVideoSrc: "/video/moostrade_mobile.mp4",

        links: [
            {
                label: "Visit",
                href: "https://moostrade.com/"
            }
        ],

        translations: {
            en: {
                name: "Moostrade",
                description:
                    "Business website with a polished look, clear service pages, and optimized mobile layout.",
            },
            de: {
                name: "Liberty Groupe",
                description:
                    "Business-Website mit hochwertigem Look, klaren Leistungsseiten und optimiertem Mobile Layout.",
            },
        },
    },
];