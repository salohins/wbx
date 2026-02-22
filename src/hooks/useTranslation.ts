import { useUIStore } from '../store/uiStore'
import { translations } from '../i18n'

export function useTranslation() {
    const language = useUIStore((s) => s.language)
    return translations[language]
}
