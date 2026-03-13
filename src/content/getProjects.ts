import { projects } from "./projects";
import type { Project } from "../sections/Projects/ProjectSnapSection";

export function getProjects(language: "en" | "de"): Project[] {
    return projects.map((p) => ({
        id: p.id,
        name: p.translations[language].name,
        description: p.translations[language].description,
        year: p.year,
        client: p.client,
        role: p.role,
        tags: p.tags,

        desktopImageSrc: p.desktopImageSrc,
        mobileImageSrc: p.mobileImageSrc,
        desktopVideoSrc: p.desktopVideoSrc,
        mobileVideoSrc: p.mobileVideoSrc,

        desktopVideoPoster: p.desktopVideoPoster,
        mobileVideoPoster: p.mobileVideoPoster,
        desktopVideoType: p.desktopVideoType,
        mobileVideoType: p.mobileVideoType,

        desktopImageAlt: p.translations[language].name,
        mobileImageAlt: p.translations[language].name,

        links: p.links?.map((link) => ({
            label: language === "de" ? "Ansehen" : "View",
            href: link.href,
        })),
    }));
}