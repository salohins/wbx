// ScreenScrollContext.ts
import { createContext, useContext } from "react"

export const ScreenScrollRefContext =
    createContext<React.RefObject<HTMLDivElement | null> | null>(null)

export function useScreenScrollRef() {
    const ctx = useContext(ScreenScrollRefContext)
    if (!ctx) throw new Error("useScreenScrollRef must be used inside ScreenWrapper")
    return ctx
}
