import { ReactNode, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'

export function MainViewport({ children }: { children: ReactNode }) {
    const location = useLocation()
    const navigate = useNavigate()
    const scrollRef = useRef<HTMLDivElement>(null)

    const setScrollPosition = useUIStore((s) => s.setScrollPosition)
    const getScrollPosition = useUIStore((s) => s.getScrollPosition)



    return (
        <main className="relative flex-1 overflow-hidden">
            <div
                ref={scrollRef}
                className="
                absolute inset-0
                overflow-y-auto
                snap-y snap-mandatory
            "
            >
                {children}
            </div>
        </main>
    )
}
