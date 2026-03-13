// ScreenWrapper.tsx
import React, { ReactNode, useMemo, useRef } from "react";
import { ScreenScrollRefContext } from "./ScreenScrollContext";

type ScreenWrapperProps = {
    children: ReactNode;
    fixedLayers?: ReactNode | ReactNode[];
    className?: string;
    contentClassName?: string;
};

export function ScreenWrapper({
    children,
    fixedLayers,
    className = "",
    contentClassName = "",
}: ScreenWrapperProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const fixedLayerList = useMemo(() => {
        if (!fixedLayers) return [];
        return Array.isArray(fixedLayers) ? fixedLayers : [fixedLayers];
    }, [fixedLayers]);

    const hasFixed = fixedLayerList.length > 0;

    return (
        <ScreenScrollRefContext.Provider value={scrollRef}>
            <div className={`relative w-full h-full overflow-hidden ${className}`}>
                {hasFixed && (
                    <div className="pointer-events-none fixed inset-0 z-0">
                        {fixedLayerList.map((node, i) => (
                            <React.Fragment key={i}>{node}</React.Fragment>
                        ))}
                    </div>
                )}

                <div
                    ref={scrollRef}
                    className={`
            relative z-10 w-full h-full overflow-y-auto overflow-x-hidden
            ${contentClassName}
          `}
                    style={{
                        scrollbarGutter: "stable",
                        WebkitOverflowScrolling: "touch",
                        overscrollBehaviorY: "contain",
                    }}
                >
                    {children}
                </div>
            </div>
        </ScreenScrollRefContext.Provider>
    );
}