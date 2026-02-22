import React, { ReactNode } from 'react'

type Show = 'both' | 'mobile' | 'desktop'

export function SectionBlock({
    children,
    show = 'both',
    className = '',
}: {
    children: ReactNode
    show?: Show
    className?: string
}) {
    return (
        <div data-section-block data-show={show} className={className}>
            {children}
        </div>
    )
}
