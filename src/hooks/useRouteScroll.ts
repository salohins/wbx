// useRouteScroll.ts
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useRouteScroll<T extends string>(
    basePath: string,
    scrollTo: (key: T) => void
) {
    const location = useLocation()

    useEffect(() => {
        if (!location.pathname.startsWith(basePath)) return

        const parts = location.pathname.replace(basePath, '').split('/')
        const section = parts[1] as T | undefined

        if (section) {
            scrollTo(section)
        }
    }, [location.pathname, basePath, scrollTo])
}
