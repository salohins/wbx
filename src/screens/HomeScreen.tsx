// screens/HomeScreen.tsx
import { useTranslation } from '../hooks/useTranslation'
import { Hero } from '../sections/Hero/Hero'
import { Services } from '../sections/Services/Services'
import { ProjectSnapSection } from '../sections/Projects/ProjectSnapSection'
import { getProjects } from '../content/getProjects'
import { useUIStore } from '../store/uiStore'
import {
    HeroCanvas

} from '../sections/Hero/HeroCanvas'

export function HomeScreen() {
    const t = useTranslation()
    const { language } = useUIStore()

    const sections = t?.sections ?? {}
    const cta = (t as any)?.cta ?? {}

    const projects = getProjects(language)
    const [TB_BAU, ZIMMERMANN, LIBERTYGROUP, MOOSTRADE] = projects

    return (
        <div className=" ">
            <Hero />
            <Services />

            {TB_BAU && (
                <ProjectSnapSection
                    sectionId="project-tb-bau"
                    title={"tb-bau.ch"}

                    project={TB_BAU}
                    accent="rgba(255, 120, 30, 1)"
                    desktopAlign="center"
                />
            )}

            {ZIMMERMANN && (
                <ProjectSnapSection
                    sectionId="project-zimmermann"
                    title={"ze-ag.ch"}

                    project={ZIMMERMANN}
                    desktopAlign="center"
                />
            )}

            {LIBERTYGROUP && (
                <ProjectSnapSection
                    sectionId="project-liberty"
                    title={'libertysgroup.ch'}
                    project={LIBERTYGROUP}
                    desktopAlign="center"
                />
            )}

            {MOOSTRADE && (
                <ProjectSnapSection
                    sectionId="project-moostrade"
                    title={"moostrade.com"}

                    project={MOOSTRADE}
                    desktopAlign="center"
                />
            )}

            { /*<SnapSection
                sectionId="cta"
                backgroundScope="boxed"
                boxedBackgroundClassName="bg-neutral-950 text-white rounded-3xl border border-white/10"
                desktopHeight="60"
            >
                <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
                    <div className="text-sm uppercase tracking-widest opacity-60 mb-3">
                        {cta.kicker ?? 'Ready?'}
                    </div>

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
            </SnapSection> */}
        </div>
    )
}