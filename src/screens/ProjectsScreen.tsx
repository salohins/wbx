import { SnapSection } from '../components/SnapSection'
import { useTranslation } from '../hooks/useTranslation'

export function ProjectsScreen() {
    const t = useTranslation()

    return (
        <div
            className="
                absolute inset-0
                h-full
            "
        >

            {/* PROJECT 1 */}
            <SnapSection
                sectionId="tb-bau"
                title="TB Bau & Management"
                headerVariant="glass"
                headerTone="light"
                slides={[
                    <SnapSection.Slide key="tb-overview">
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white px-8 text-center">
                            <h2 className="text-3xl font-semibold mb-3">
                                Corporate Website
                            </h2>
                            <p className="opacity-70 max-w-md">
                                A clean, professional web presence for a construction
                                and management company based in Zurich.
                            </p>
                        </div>
                    </SnapSection.Slide>,

                    <SnapSection.Slide key="tb-tech">
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-700 text-white px-8 text-center">
                            <h3 className="text-2xl font-medium mb-3">
                                Tech Stack
                            </h3>
                            <p className="opacity-80">
                                React · Tailwind · Headless CMS
                            </p>
                        </div>
                    </SnapSection.Slide>,

                    <SnapSection.Slide key="tb-result">
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-8 text-center">
                            <h3 className="text-2xl font-medium mb-3">
                                Result
                            </h3>
                            <p className="opacity-80 max-w-md">
                                A modern, scalable website ready to grow with the company.
                            </p>
                        </div>
                    </SnapSection.Slide>,
                ]}
            />

            {/* PROJECT 2 */}
            <SnapSection
                sectionId="zimmermann"
                title="Zimmermann AG"
                headerVariant="neutral"
                headerTone="dark"
                slides={[
                    <SnapSection.Slide key="zim-overview">
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-900 px-8 text-center">
                            <h2 className="text-3xl font-semibold mb-3">
                                Company Website
                            </h2>
                            <p className="opacity-70 max-w-md">
                                A minimal, content-focused site built to clearly present
                                services and references.
                            </p>
                        </div>
                    </SnapSection.Slide>,

                    <SnapSection.Slide key="zim-design">
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white px-8 text-center">
                            <h3 className="text-2xl font-medium mb-3">
                                Design Direction
                            </h3>
                            <p className="opacity-80">
                                Swiss style · strong typography · clarity
                            </p>
                        </div>
                    </SnapSection.Slide>,
                ]}
            />

            {/* PROJECT 3 — FUTURE / PLACEHOLDER */}
            <SnapSection
                sectionId="future-project"
                title="Next Project"
                headerVariant="glass"
                headerTone="auto"
                slides={[
                    <SnapSection.Slide key="future">
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white px-8 text-center">
                            <h2 className="text-3xl font-semibold mb-3">
                                Your Project?
                            </h2>
                            <p className="opacity-80 max-w-md">
                                This space is reserved for what comes next.
                            </p>
                        </div>
                    </SnapSection.Slide>,
                ]}
            />

        </div>
    )
}
