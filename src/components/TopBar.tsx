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
            <header
                className="
          relative top-0 left-0 right-0 z-60
          h-15 px-4
          flex items-center justify-between
          backdrop-blur-xl
          bg-white/88 text-neutral-900
          border-b border-neutral-200/70
          shadow-[0_1px_0_rgba(255,255,255,0.55)_inset]
          dark:bg-neutral-900/88 dark:text-white dark:border-neutral-700/60

          md:absolute md:top-2 md:left-1/2 md:right-auto md:-translate-x-1/2
          md:h-20 md:px-5
          md:w-full md:max-w-4xl
          md:rounded-2xl
          md:border md:border-neutral-200/50
          md:bg-white/78
          md:shadow-[0_14px_40px_rgba(0,0,0,0.10),0_1px_0_rgba(255,255,255,0.55)_inset]
          dark:md:border-white/10
          dark:md:bg-neutral-900/50
          dark:md:shadow-[0_18px_42px_rgba(0,0,0,0.22),0_1px_0_rgba(255,255,255,0.05)_inset]
        "
            >
                {/* LEFT – LOGO + SLOGAN */}
                <div className="flex min-w-[64px] items-center">
                    <div className="flex flex-col leading-none">
                        <img
                            src="/logo.svg"
                            alt="WebX Logo"
                            className="h-9 md:h-12 w-auto select-none invert dark:invert-0"
                        />

                        <span
                            className="
                mt-0.5
                text-[10px] md:text-[11px]
                font-medium
                tracking-[0.16em]
                uppercase
                text-neutral-500
                dark:text-neutral-300/70
                select-none
                whitespace-nowrap
              "
                        >
                            {t.ui.slogan}
                        </span>
                    </div>
                </div>

                {/* TRUE CENTER – CHILDREN */}
                <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 flex items-center pointer-events-none">
                    <div className="pointer-events-auto">{children}</div>
                </div>

                {/* RIGHT – ACTIONS */}
                <div className="flex items-center justify-end gap-3 min-w-[160px]">
                    <button
                        className="
              inline-flex items-center gap-2
              rounded-full
              px-4 py-2 md:px-4.5 md:py-2.5
              text-[11px] md:text-[12px]
              font-medium
              tracking-[0.16em]
              uppercase
              transition
              active:scale-[0.98]
              bg-neutral-900 text-white
              border border-neutral-900/80
              shadow-[0_8px_20px_rgba(0,0,0,0.12)]
              hover:shadow-[0_12px_26px_rgba(0,0,0,0.16)]
              hover:translate-y-[-1px]
              dark:bg-white dark:text-neutral-900 dark:border-white
              dark:shadow-[0_8px_20px_rgba(255,255,255,0.06)]
            "
                    >
                        <span>{t.ui.cta}</span>
                        <ArrowRight className="h-4 w-4 opacity-90" />
                    </button>

                    <>
                        {/* MOBILE */}
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
                border border-neutral-200/70
                bg-white/72
                backdrop-blur-xl
                shadow-[0_4px_14px_rgba(0,0,0,0.06)]
                hover:bg-white
                dark:border-white/10
                dark:bg-neutral-900/72
                dark:hover:bg-neutral-800
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

                        {/* DESKTOP */}
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            className="
                hidden md:flex
                h-10 w-10
                items-center justify-center
                rounded-full
                border border-neutral-200/70
                bg-white/62
                backdrop-blur-xl
                shadow-[0_4px_14px_rgba(0,0,0,0.06)]
                hover:bg-white/88
                dark:border-white/10
                dark:bg-neutral-900/62
                dark:hover:bg-neutral-800/92
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

            <AnimatePresence>
                {menuOpen && (
                    <>
                        {/* BACKDROP */}
                        <motion.div
                            key="backdrop"
                            onClick={() => setMenuOpen(false)}
                            className="fixed inset-0 z-50 bg-black/26 backdrop-blur-[6px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        />

                        {/* MOBILE MENU */}
                        <motion.div
                            key="sidebar-mobile"
                            className="
                fixed top-0 right-0 z-100
                h-screen w-64 sm:w-72
                backdrop-blur-2xl
                bg-white/88 text-neutral-900
                dark:bg-neutral-900/88 dark:text-white
                border-l border-neutral-200/70
                dark:border-white/10
                shadow-[-12px_0_40px_rgba(0,0,0,0.12)]
                md:hidden
              "
                            initial={{ x: 320, opacity: 0.92 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0.92 }}
                            transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex h-15 items-center justify-between border-b border-neutral-200/70 px-4 dark:border-white/10">
                                <span className="text-sm font-medium tracking-[0.14em] uppercase text-neutral-500 dark:text-white/45">
                                    Menu
                                </span>

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
                    border border-neutral-200/70
                    bg-white/65
                    dark:border-white/10
                    dark:bg-neutral-900/65
                    hover:bg-white
                    dark:hover:bg-neutral-800
                    transition
                  "
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            <div className="space-y-8 px-4 py-6">
                                <div>
                                    <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] opacity-45">
                                        {t.menu.appearance}
                                    </span>

                                    <div
                                        className="
                      w-full
                      flex items-center justify-between
                      px-3.5 py-3
                      rounded-2xl
                      border border-neutral-200/70
                      dark:border-white/10
                      bg-white/58 dark:bg-neutral-900/58
                      backdrop-blur-xl
                    "
                                    >
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-sm">{t.menu.theme}</span>
                                            <span className="text-xs opacity-50">{isDark ? 'Dark' : 'Light'}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={toggleTheme}
                                            aria-label="Toggle theme"
                                            className={`
                        relative h-7 w-12 rounded-full border transition
                        ${isDark ? 'bg-neutral-800/80 border-white/10' : 'bg-neutral-200/90 border-neutral-300/80'}
                      `}
                                        >
                                            <motion.span
                                                layout
                                                transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                                                className={`
                          absolute top-[3px] h-5 w-5 rounded-full shadow-sm
                          ${isDark ? 'left-6 bg-white' : 'left-1 bg-white'}
                        `}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] opacity-45">
                                        {t.menu.language}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`
                        rounded-full px-3.5 py-2 text-sm transition
                        ${language === 'en'
                                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                    : 'border border-neutral-200/70 bg-white/55 opacity-75 hover:opacity-100 dark:border-white/10 dark:bg-neutral-900/55'}
                      `}
                                        >
                                            EN
                                        </button>

                                        <button
                                            onClick={() => setLanguage('de')}
                                            className={`
                        rounded-full px-3.5 py-2 text-sm transition
                        ${language === 'de'
                                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                    : 'border border-neutral-200/70 bg-white/55 opacity-75 hover:opacity-100 dark:border-white/10 dark:bg-neutral-900/55'}
                      `}
                                        >
                                            DE
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] opacity-45">
                                        {t.menu.legal}
                                    </span>

                                    <div className="space-y-2">
                                        <button
                                            className="
                      w-full text-left
                      text-sm
                      px-3.5 py-3
                      rounded-2xl
                      border border-transparent
                      hover:border-neutral-200/70 hover:bg-white/58
                      dark:hover:border-white/10 dark:hover:bg-neutral-800/70
                      transition
                    "
                                        >
                                            {t.menu.imprint}
                                        </button>

                                        <button
                                            className="
                      w-full text-left
                      text-sm
                      px-3.5 py-3
                      rounded-2xl
                      border border-transparent
                      hover:border-neutral-200/70 hover:bg-white/58
                      dark:hover:border-white/10 dark:hover:bg-neutral-800/70
                      transition
                    "
                                        >
                                            {t.menu.privacy}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* DESKTOP MEGA MENU */}
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
                            initial={{ opacity: 0, y: -20, scale: 0.985 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -14, scale: 0.99 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="
                  overflow-hidden
                  rounded-2xl
                  border border-neutral-200/60 dark:border-white/10
                  bg-white/88 dark:bg-neutral-900/82
                  text-neutral-900 dark:text-white
                  backdrop-blur-xl
                  shadow-[0_18px_70px_rgba(0,0,0,0.18),0_1px_0_rgba(255,255,255,0.55)_inset]
                  dark:shadow-[0_24px_80px_rgba(0,0,0,0.28),0_1px_0_rgba(255,255,255,0.05)_inset]
                "
                            >
                                <div className="p-6 grid grid-cols-3 gap-6">
                                    {/* Column 1 */}
                                    <div className="space-y-3">
                                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-white/40">
                                            {t.menu.appearance}
                                        </div>

                                        <div
                                            className="
                        flex w-full items-center justify-between
                        rounded-2xl
                        border border-neutral-200/70
                        bg-white/58
                        px-4 py-3.5
                        backdrop-blur-xl
                        dark:border-white/10
                        dark:bg-neutral-900/58
                      "
                                        >
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-sm">{t.menu.theme}</span>
                                                <span className="text-xs text-neutral-500 dark:text-white/40">
                                                    {isDark ? 'Dark' : 'Light'}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={toggleTheme}
                                                aria-label="Toggle theme"
                                                className={`
                          relative h-7 w-12 rounded-full border transition
                          ${isDark ? 'bg-neutral-800/80 border-white/10' : 'bg-neutral-200/90 border-neutral-300/80'}
                        `}
                                            >
                                                <motion.span
                                                    layout
                                                    transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                                                    className={`
                            absolute top-[3px] h-5 w-5 rounded-full shadow-sm
                            ${isDark ? 'left-6 bg-white' : 'left-1 bg-white'}
                          `}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-3">
                                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-white/40">
                                            {t.menu.language}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setLanguage('en')}
                                                className={`
                          rounded-full px-3.5 py-2 text-sm transition
                          ${language === 'en'
                                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                        : 'border border-neutral-200/70 bg-white/55 opacity-75 hover:opacity-100 dark:border-white/10 dark:bg-neutral-900/55'}
                        `}
                                            >
                                                EN
                                            </button>

                                            <button
                                                onClick={() => setLanguage('de')}
                                                className={`
                          rounded-full px-3.5 py-2 text-sm transition
                          ${language === 'de'
                                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                                        : 'border border-neutral-200/70 bg-white/55 opacity-75 hover:opacity-100 dark:border-white/10 dark:bg-neutral-900/55'}
                        `}
                                            >
                                                DE
                                            </button>
                                        </div>
                                    </div>

                                    {/* Column 3 */}
                                    <div className="space-y-3">
                                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-white/40">
                                            {t.menu.legal}
                                        </div>

                                        <div className="space-y-2">
                                            <button
                                                className="
                          w-full text-left
                          text-sm
                          px-3.5 py-3
                          rounded-2xl
                          border border-transparent
                          hover:border-neutral-200/70 hover:bg-white/58
                          dark:hover:border-white/10 dark:hover:bg-neutral-800/70
                          transition
                        "
                                            >
                                                {t.menu.imprint}
                                            </button>

                                            <button
                                                className="
                          w-full text-left
                          text-sm
                          px-3.5 py-3
                          rounded-2xl
                          border border-transparent
                          hover:border-neutral-200/70 hover:bg-white/58
                          dark:hover:border-white/10 dark:hover:bg-neutral-800/70
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