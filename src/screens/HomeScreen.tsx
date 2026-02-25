// screens/HomeScreen.tsx  (replace the old "projects" SnapSection with 2 separate sections)
import { SnapSection } from '../components/SnapSection'
import { useTranslation } from '../hooks/useTranslation'
import { Hero } from '../sections/Hero/Hero'
import { HeroCanvas } from '../sections/Hero/HeroCanvas'
import { Services } from '../sections/Services/Services'

import { ProjectSnapSection } from '../sections/Projects/ProjectSnapSection'
import type { Project } from '../sections/Projects/ProjectSnapSection'

export function HomeScreen() {
    const t = useTranslation()

    const sections = t?.sections ?? {}
    const projectsT = t?.projects ?? {}
    const cta = (t as any)?.cta ?? {}

    const TB_BAU: Project = {
        id: 'tb-bau',
        name: (projectsT as any).tbBau ?? 'TB Bau & Management',
        description:
            (projectsT as any).tbBauDesc ??
            'Construction management website with clean structure, fast load, and strong trust signals.',



        mobileVideoSrc: '/video/tb-bau_mobile.mp4',
        desktopVideoSrc: '/video/tb-bau_desktop.mp4',
        tags: ['Website', 'UX', 'SEO'],
        year: '2025',
        client: 'TB Bau & Management',
        role: 'Design + Frontend',
        links: [{ label: 'View', href: '#' }],
    }

    const ZIMMERMANN: Project = {
        id: 'zimmermann',
        name: (projectsT as any).zimmermann ?? 'Zimmermann AG',
        description:
            (projectsT as any).zimmermannDesc ??
            'Business website with a polished look, clear service pages, and optimized mobile layout.',
        desktopImageSrc: '/projects/zimmermann-desktop.jpg',
        mobileImageSrc: '/projects/zimmermann-mobile.jpg',
        tags: ['Brand', 'Design', 'Performance'],
        year: '2024',
        client: 'Zimmermann AG',
        role: 'Design + Frontend',
        links: [{ label: 'View', href: '#' }],
    }

    return (
        <div className="absolute inset-0 h-full">


            <Hero />
            <Services />


            <ProjectSnapSection
                sectionId="project-tb-bau"
                title={(sections as any).projects ?? 'Projects'}
                subtitle={(sections as any).projectsSubtitle ?? 'Selected builds — premium, fast, scalable.'}
                project={TB_BAU}
                accent="rgba(255, 120, 30, 1)"
                desktopAlign="center"
            />


            <ProjectSnapSection
                sectionId="project-zimmermann"
                title={(sections as any).projects ?? 'Projects'}
                subtitle={(sections as any).projectsSubtitle ?? 'Selected builds — premium, fast, scalable.'}
                project={ZIMMERMANN}
                desktopAlign="center"
            />


            <SnapSection
                sectionId="cta"
                backgroundScope="boxed"
                boxedBackgroundClassName="bg-neutral-950 text-white rounded-3xl border border-white/10"
                desktopHeight="60"
            >
                <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
                    <div className="text-sm uppercase tracking-widest opacity-60 mb-3">{cta.kicker ?? 'Ready?'}</div>
                    <div className="text-4xl md:text-5xl font-semibold mb-4">
                        {cta.title ?? 'Let’s build something that feels premium.'}
                    </div>
                    <div className="text-lg opacity-70 max-w-2xl">
                        {cta.subtitle ?? 'Tell us what you need. We’ll turn it into a clean spec and ship fast.'}
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <button className="px-6 py-3 rounded-xl bg-white text-neutral-900 font-medium">
                            {cta.primary ?? 'Book a call'}
                        </button>
                        <button className="px-6 py-3 rounded-xl border border-white/15 text-white font-medium">
                            {cta.secondary ?? 'See pricing'}
                        </button>
                    </div>
                </div>
            </SnapSection>

        </div>
    )
}
