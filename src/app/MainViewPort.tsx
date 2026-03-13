// MainViewport.tsx
import { ReactNode, useRef } from 'react'
import { ScreenScrollRefContext } from './ScreenScrollContext'

export function MainViewport({ children }: { children: ReactNode }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    return (
        <ScreenScrollRefContext.Provider value={scrollRef}>
            <main className="relative flex-1 overflow-hidden">
                <div
                    ref={scrollRef}
                    className="
                        absolute inset-0
                        overflow-y-auto
                    "
                >
                    {children}
                </div>
            </main>
        </ScreenScrollRefContext.Provider>
    )
}