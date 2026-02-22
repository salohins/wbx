// useScrollSections.ts
import { useRef } from 'react'

export function useScrollSections<T extends string>() {
    const sections = useRef<Record<T, HTMLElement | null>>({} as any)

    const register = (key: T) => (el: HTMLElement | null) => {
        sections.current[key] = el
    }

    const scrollTo = (key: T) => {
        sections.current[key]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    return { register, scrollTo }
}
