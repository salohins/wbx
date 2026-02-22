import { ReactNode, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useTranslation } from '../hooks/useTranslation'

type TopBarProps = {
    children?: ReactNode
}

export function TopBar({ children }: TopBarProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const { theme, toggleTheme, language, setLanguage } = useUIStore()
    const t = useTranslation()

    const isDark = theme === 'dark'

    // Small UX improvement: ESC closes the menu (both desktop + mobile)
    useEffect(() => {
        if (!menuOpen) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [menuOpen])

    return (
        <>
            {/* TOP BAR */}
            <header
                className="
          relative top-0 left-0 right-0 z-60 h-15 px-4 flex items-center justify-between
          backdrop-blur-md bg-white/90 text-neutral-900 border-b border-neutral-200/60
          dark:bg-neutral-900/95 dark:text-white dark:border-neutral-700/60

          md:absolute md:top-2 md:left-1/2 md:-translate-x-1/2 md:right-auto
          md:h-20 md:px-5 md:rounded-2xl
          md:border md:border-neutral-200/50 md:dark:border-none
          
        md:bg-white/90 md:dark:bg-neutral-900/50
          md:shadow-[0_14px_40px_rgba(0,0,0,0.10)]
          md:w-full max-w-4xl
        "
            >
                {/* LEFT – LOGO + SLOGAN */}
                <div className="flex items-center min-w-[64px]">
                    <div className="flex flex-col leading-none">
                        <img
                            src="/logo.svg"
                            alt="WebX Logo"
                            className="h-9 md:h-12 w-auto select-none invert dark:invert-0"
                        />

                        <span
                            className="
        mt-0.5
        text-[10px] md:text-xs
        font-medium
        tracking-wide
        text-neutral-600
        dark:text-neutral-300/80
        select-none
        whitespace-nowrap
      "
                        >
                            {t.ui.slogan}
                        </span>
                    </div>
                </div>


                {/* TRUE CENTER – CHILDREN (viewport centered) */}
                <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 flex items-center pointer-events-none">
                    <div className="pointer-events-auto">{children}</div>
                </div>

                {/* RIGHT – ACTIONS */}
                <div className="flex items-center justify-end gap-3 min-w-[160px]">
                    {/* CTA */}
                    <button
                        className="
    text-sm font-semibold
    px-4 py-2
    rounded-full
    bg-neutral-800 text-white
    shadow-sm
    hover:shadow-md
    hover:scale-[1.02]
    active:scale-[0.98]
    transition
    dark:bg-white dark:text-neutral-900
    cursor-pointer
    inline-flex items-center gap-2
  "
                    >
                        <span>{t.ui.cta}</span>
                        <ArrowRight className="h-4 w-4 opacity-90" />
                    </button>


                    {/* MENU BUTTONS */}
                    <>
                        {/* MOBILE: button disappears when menu opens (unchanged behavior) */}
                        <motion.button
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open menu"
                            animate={{
                                opacity: menuOpen ? 0 : 1,
                                scale: menuOpen ? 0.96 : 1,
                            }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            style={{ pointerEvents: menuOpen ? 'none' : 'auto' }}
                            className="
      md:hidden
      h-10 w-10
      flex items-center justify-center
      rounded-full
      border border-neutral-300/60
      dark:border-neutral-700/60
      bg-white/60 dark:bg-neutral-900/60
      backdrop-blur
      hover:bg-neutral-100 dark:hover:bg-neutral-800
      transition
      cursor-pointer
    "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.8}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </motion.button>

                        {/* DESKTOP: toggle button (never disappears) */}
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            className="
      hidden md:flex
      h-10 w-10
      items-center justify-center
      rounded-full
      border border-neutral-300/60
      dark:border-neutral-700/60
      bg-white/60 dark:bg-neutral-900/60
      backdrop-blur
      hover:bg-neutral-100 dark:hover:bg-neutral-800
      transition
      cursor-pointer
    "
                        >
                            {menuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </>
                </div>
            </header>

            {/* OVERLAY + MENUS */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        {/* BACKDROP (smooth fade) */}
                        <motion.div
                            key="backdrop"
                            onClick={() => setMenuOpen(false)}
                            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        />

                        {/* MOBILE: RIGHT SIDEBAR MENU (unchanged) */}
                        <motion.div
                            key="sidebar-mobile"
                            className="
                fixed top-0 right-0 z-100
                h-screen w-59 sm:w-72
                backdrop-blur-xl
                bg-white/90 text-neutral-900
                dark:bg-neutral-900/90 dark:text-white
                border-l border-neutral-200/60
                dark:border-neutral-700/60
                md:hidden
              "
                            initial={{ x: 320, opacity: 0.9 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0.9 }}
                            transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* MENU HEADER */}
                            <div className="h-15 px-4 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-700/60">
                                <span className="text-sm font-medium">Menu</span>

                                {/* CLOSE BUTTON (mobile only stays) */}
                                <motion.button
                                    key="close-btn"
                                    onClick={() => setMenuOpen(false)}
                                    aria-label="Close menu"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.18, ease: 'easeOut', delay: 0.06 }}
                                    className="
                    h-9 w-9
                    flex items-center justify-center
                    rounded-full
                    border border-neutral-200/60
                    dark:border-neutral-700/60
                    bg-white/50 dark:bg-neutral-900/50
                    hover:bg-neutral-100 dark:hover:bg-neutral-800
                    transition
                  "
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            {/* MENU CONTENT */}
                            <div className="px-4 py-6 space-y-8">
                                {/* SECTION: Appearance */}
                                <div>
                                    <span className="block text-xs font-medium opacity-60 mb-2">{t.menu.appearance}</span>

                                    {/* Theme Toggle Row */}
                                    <div
                                        className="
                      w-full
                      flex items-center justify-between
                      px-3 py-2
                      rounded-xl
                      border border-neutral-200/60
                      dark:border-neutral-700/60
                      bg-white/60 dark:bg-neutral-900/60
                      backdrop-blur
                    "
                                    >
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-sm">{t.menu.theme}</span>
                                            <span className="text-xs opacity-60">{isDark ? 'Dark' : 'Light'}</span>
                                        </div>

                                        {/* Premium Framer Toggle */}
                                        <button
                                            type="button"
                                            onClick={toggleTheme}
                                            aria-label="Toggle theme"
                                            className={`
                        relative
                        w-12 h-7
                        rounded-full
                        border
                        transition
                        ${isDark ? 'bg-neutral-800/70 border-neutral-700/70' : 'bg-neutral-200/80 border-neutral-300/70'}
                      `}
                                        >
                                            <motion.span
                                                layout
                                                transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                                                className={`
                          absolute top-[3px]
                          h-5 w-5
                          rounded-full
                          shadow-sm
                          ${isDark ? 'left-6 bg-white' : 'left-1 bg-white'}
                        `}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* SECTION: Language */}
                                <div>
                                    <span className="block text-xs font-medium opacity-60 mb-2">{t.menu.language}</span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`
                        px-3 py-1.5 rounded-md text-sm
                        ${language === 'en'
                                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                    : 'opacity-70 hover:opacity-100'
                                                }
                      `}
                                        >
                                            EN
                                        </button>

                                        <button
                                            onClick={() => setLanguage('de')}
                                            className={`
                        px-3 py-1.5 rounded-md text-sm
                        ${language === 'de'
                                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                    : 'opacity-70 hover:opacity-100'
                                                }
                      `}
                                        >
                                            DE
                                        </button>
                                    </div>
                                </div>

                                {/* SECTION: Legal */}
                                <div>
                                    <span className="block text-xs font-medium opacity-60 mb-2">{t.menu.legal}</span>

                                    <button
                                        className="
                      w-full text-left
                      text-sm
                      px-3 py-2
                      rounded-md
                      hover:bg-neutral-100
                      dark:hover:bg-neutral-800
                    "
                                    >
                                        {t.menu.imprint}
                                    </button>

                                    <button
                                        className="
                      w-full text-left
                      text-sm
                      px-3 py-2
                      rounded-md
                      hover:bg-neutral-100
                      dark:hover:bg-neutral-800
                    "
                                    >
                                        {t.menu.privacy}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* DESKTOP: MEGA MENU (slide down + fade) */}
                        <motion.div
                            key="mega-desktop"
                            className="
  hidden md:block
  fixed left-1/2 -translate-x-1/2
  z-100
  w-full max-w-4xl
  px-0
"
                            style={{ top: 104 }}
                            initial={{ opacity: 0, y: -24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -18, scale: 0.985 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="
                  origin-top
                  rounded-2xl
                  border border-neutral-200/60 dark:border-neutral-700/60
                  bg-white/90 dark:bg-neutral-900/85
                  text-neutral-900 dark:text-white
                  backdrop-blur-xl
                  shadow-[0_18px_70px_rgba(0,0,0,0.18)]
                  overflow-hidden
                "
                            >
                                {/* MEGA GRID CONTENT */}
                                <div className="p-6 grid grid-cols-3 gap-6">
                                    {/* Column 1: Appearance */}
                                    <div className="space-y-3">
                                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            {t.menu.appearance}
                                        </div>

                                        <div
                                            className="
                        w-full
                        flex items-center justify-between
                        px-4 py-3
                        rounded-xl
                        border border-neutral-200/60
                        dark:border-neutral-700/60
                        bg-white/60 dark:bg-neutral-900/60
                        backdrop-blur
                      "
                                        >
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-sm">{t.menu.theme}</span>
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {isDark ? 'Dark' : 'Light'}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={toggleTheme}
                                                aria-label="Toggle theme"
                                                className={`
                          relative
                          w-12 h-7
                          rounded-full
                          border
                          transition
                          ${isDark ? 'bg-neutral-800/70 border-neutral-700/70' : 'bg-neutral-200/80 border-neutral-300/70'}
                        `}
                                            >
                                                <motion.span
                                                    layout
                                                    transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                                                    className={`
                            absolute top-[3px]
                            h-5 w-5
                            rounded-full
                            shadow-sm
                            ${isDark ? 'left-6 bg-white' : 'left-1 bg-white'}
                          `}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Column 2: Language */}
                                    <div className="space-y-3">
                                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            {t.menu.language}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setLanguage('en')}
                                                className={`
                          px-3 py-1.5 rounded-md text-sm
                          ${language === 'en'
                                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                        : 'opacity-70 hover:opacity-100'
                                                    }
                        `}
                                            >
                                                EN
                                            </button>

                                            <button
                                                onClick={() => setLanguage('de')}
                                                className={`
                          px-3 py-1.5 rounded-md text-sm
                          ${language === 'de'
                                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                        : 'opacity-70 hover:opacity-100'
                                                    }
                        `}
                                            >
                                                DE
                                            </button>
                                        </div>
                                    </div>

                                    {/* Column 3: Legal */}
                                    <div className="space-y-3">
                                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            {t.menu.legal}
                                        </div>

                                        <div className="space-y-1">
                                            <button
                                                className="
                          w-full text-left
                          text-sm
                          px-3 py-2
                          rounded-md
                          hover:bg-neutral-100 dark:hover:bg-neutral-800
                          transition
                        "
                                            >
                                                {t.menu.imprint}
                                            </button>

                                            <button
                                                className="
                          w-full text-left
                          text-sm
                          px-3 py-2
                          rounded-md
                          hover:bg-neutral-100 dark:hover:bg-neutral-800
                          transition
                        "
                                            >
                                                {t.menu.privacy}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
