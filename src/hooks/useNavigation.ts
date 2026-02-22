import { useState } from 'react'
import type { Tab } from '../app/navigation'

export function useNavigation() {
    const [activeTab, setActiveTab] = useState<Tab>('home')

    return {
        activeTab,
        setActiveTab,
    }
}
