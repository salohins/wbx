import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'
export type Language = 'en' | 'de'

interface UIState {
    lastSectionByPath: Record<string, string>
    setLastSection: (path: string, sectionId: string) => void
    getLastSection: (path: string) => string | undefined

    theme: ThemeMode
    language: Language

    scrollPositions: Record<string, number>

    toggleTheme: () => void
    setLanguage: (lang: Language) => void

    setScrollPosition: (path: string, y: number) => void
    getScrollPosition: (path: string) => number
}

export const useUIStore = create<UIState>((set, get) => ({
    lastSectionByPath: {},

    setLastSection: (path, sectionId) =>
        set((state) => ({
            lastSectionByPath: {
                ...state.lastSectionByPath,
                [path]: sectionId,
            },
        })),

    getLastSection: (path) =>
        get().lastSectionByPath[path],
    theme: 'light',
    language: 'de',

    scrollPositions: {},

    toggleTheme: () =>
        set((state) => ({
            theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

    setLanguage: (language) => set({ language }),

    setScrollPosition: (path, y) =>
        set((state) => ({
            scrollPositions: {
                ...state.scrollPositions,
                [path]: y,
            },
        })),

    getScrollPosition: (path) =>
        get().scrollPositions[path] ?? 0,
}))
