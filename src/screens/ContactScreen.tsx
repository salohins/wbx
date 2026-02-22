import { Contact } from 'lucide-react'
import { SnapSection } from '../components/SnapSection'
import { ContactHeroSnapSection } from '../sections/Contact/ContactHeroSnapSection'

export function ContactScreen() {
    return (
        <div
            className="
                absolute inset-0
                h-full
            "
        >

            <ContactHeroSnapSection />

            {/* CONTACT OPTIONS */}
            <SnapSection sectionId="methods">
                <div className="h-full w-full max-w-2xl mx-auto px-6 flex flex-col justify-center space-y-8">

                    <div className="flex flex-col items-center text-center">
                        <span className="text-sm uppercase tracking-wide opacity-50 mb-2">
                            Email
                        </span>
                        <a
                            href="mailto:hello@webx.ch"
                            className="text-2xl font-medium hover:underline"
                        >
                            hello@webx.ch
                        </a>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <span className="text-sm uppercase tracking-wide opacity-50 mb-2">
                            Phone
                        </span>
                        <a
                            href="tel:+41790000000"
                            className="text-2xl font-medium hover:underline"
                        >
                            +41 79 000 00 00
                        </a>
                    </div>

                </div>
            </SnapSection>

            {/* LOCATION / CLOSING */}
            <SnapSection sectionId="location">
                <div className="h-full w-full max-w-2xl mx-auto px-6 flex flex-col justify-center text-center">
                    <h2 className="text-3xl font-medium mb-4">
                        Based in Switzerland
                    </h2>
                    <p className="opacity-70 mb-6">
                        Working with clients locally and internationally.
                    </p>

                    <div className="inline-block px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                        Zurich · Remote
                    </div>
                </div>
            </SnapSection>

        </div>
    )
}
