import { Concept } from '../../../core/theory/AnalysisTypes';

interface AnalysisOverlayProps {
    concepts: Concept[];
    measureCount: number;
    onConceptClick?: (concept: Concept, index: number) => void;
    activeFocusIndex?: number | null;
}

const CONCEPT_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
    'MajorII-V-I': {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500',
        text: 'text-emerald-400',
        label: '2-5-1',
    },
    'MinorII-V-i': {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500',
        text: 'text-purple-400',
        label: '2-5-1 (minor)',
    },
    'SecondaryDominant': {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500',
        text: 'text-amber-400',
        label: 'V/x',
    },
    'TritoneSubstitution': {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500',
        text: 'text-rose-400',
        label: '♭II⁷ (tritone sub)',
    },
    'ColtraneChanges': {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500',
        text: 'text-cyan-400',
        label: 'Giant Steps',
    },
};

export function AnalysisOverlay({
    concepts,
    measureCount,
    onConceptClick,
    activeFocusIndex,
}: AnalysisOverlayProps) {
    if (concepts.length === 0) return null;

    // We assume 4 measures per row based on grid-cols-4
    const COLS = 4;

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {concepts.map((concept, index) => {
                const colorScheme = CONCEPT_COLORS[concept.type] || CONCEPT_COLORS['MajorII-V-I'];
                const isActive = activeFocusIndex === index;

                // Calculate grid position
                const startRow = Math.floor(concept.startIndex / COLS);
                const startCol = concept.startIndex % COLS;
                const endRow = Math.floor(concept.endIndex / COLS);
                const endCol = concept.endIndex % COLS;

                // If pattern spans multiple rows, we only show it on the first row it appears for simplicity in this view
                // OR ideally we render multiple segments. For now, let's just handle single-row patterns correctly
                const isSingleRow = startRow === endRow;

                // Calculate CSS grid-based positioning percentages
                // Each row is roughly height: 8rem (h-32) or 6rem (h-24) + padding
                // But since we are inside a relative container that wraps the grid, 
                // we can just place absolute divs calculated by percentages if the parent has known aspect ratio...
                // Actually, the previous implementation using absolute % was better for scrolling, 
                // but needed to handle row wrapping.

                // Let's use the row index to calculate top position relative to the grid container
                // Assuming uniform row heights is risky.

                // BETTER APPROACH: Render these INSIDE the grid cells? No, they span across.

                // Let's go back to absolute positioning BUT relative to the container, not fixed to viewport.
                // We use percentage-based positioning assuming 4 columns.

                const top = `${startRow * 25}%`; // Only works if container has fixed height/row ratio? No.

                // Revert to the original percentage-based logic but refined for the grid structure.
                // The issue with scrolling was `fixed` positioning in the previous attempt.
                // We will use absolute positioning.

                // NOTE: This relies on the parent having relative positioning (which it does).
                // But variable row heights make top% unreliable.

                // Alternative: Render segments for each affected measure?
                // Let's try rendering a div that spans the columns.

                const left = `${(startCol / COLS) * 100}%`;
                const width = isSingleRow
                    ? `${((endCol - startCol + 1) / COLS) * 100}%`
                    : `${((COLS - startCol) / COLS) * 100}%`; // Just show first part if wrapping

                // We need to approximate row height. If row height varies, this breaks.
                // However, the grid uses fixed height classes (h-24 md:h-32).
                // Let's inject these overlays into the grid via a different method or accept percentage limitation.

                // Actually, we can just map over the measures in the parent and attach brackets there? 
                // No, brackets span multiple measures.

                // Let's stick to the coordinate system but use `absolute` instead of `fixed`.
                // But we need the coordinates relative to the container.
                // We can use the same getBoundingClientRect logic but subtract the container's rect.

                // Refactored logic below uses a ref to the container in the parent component to calculate relative offsets.
                // But since we are inside the component, let's just use the `measurePositions` logic 
                // but convert to relative coordinates.

                return (
                    <AnalysisBracket
                        key={`${concept.type}-${index}`}
                        concept={concept}
                        index={index}
                        isActive={isActive}
                        colorScheme={colorScheme}
                        onConceptClick={onConceptClick}
                    />
                );
            })}
        </div>
    );
}

function AnalysisBracket({ concept, index, isActive, colorScheme, onConceptClick }: any) {
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [hidden, setHidden] = useState(true);

    useEffect(() => {
        const updatePosition = () => {
            const leadSheetContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
            if (!leadSheetContainer) return;

            const containerRect = leadSheetContainer.getBoundingClientRect();
            const measureElements = leadSheetContainer.querySelectorAll(':scope > div');

            const startEl = measureElements[concept.startIndex];
            const endEl = measureElements[concept.endIndex];

            if (startEl && endEl) {
                const startRect = startEl.getBoundingClientRect();
                const endRect = endEl.getBoundingClientRect();

                // Calculate positions relative to the container
                const top = Math.min(startRect.top, endRect.top) - containerRect.top;
                const left = startRect.left - containerRect.left;
                const right = endRect.right - containerRect.left;
                const height = Math.max(startRect.bottom, endRect.bottom) - Math.min(startRect.top, endRect.top);

                setStyle({
                    top: `${top}px`,
                    left: `${left}px`,
                    width: `${right - left}px`,
                    height: `${height}px`,
                });
                setHidden(false);
            }
        };

        // Initial update and listeners
        updatePosition();
        // We actully don't need scroll listener if we are absolute relative to container!
        // Just resize listener.
        window.addEventListener('resize', updatePosition);

        // However, if the grid reflows (responsive), we need to update.
        // A MutationObserver would be ideal but resize is likely enough.

        return () => window.removeEventListener('resize', updatePosition);
    }, [concept.startIndex, concept.endIndex]);

    if (hidden) return null;

    return (
        <button
            onClick={() => onConceptClick?.(concept, index)}
            className={`
                absolute pointer-events-auto
                border-2 rounded-xl
                transition-all duration-300
                ${colorScheme.bg} ${colorScheme.border}
                ${isActive ? 'ring-4 ring-amber-500/50 scale-[1.01] z-30' : 'hover:scale-[1.005] z-20'}
                cursor-pointer group
            `}
            style={style}
        >
            {/* Label */}
            <div
                className={`
    absolute -top-6 left-2
    px-2 py-0.5 rounded-md
    text-[10px] font-black uppercase tracking-wider
    ${colorScheme.bg} ${colorScheme.text}
    border ${colorScheme.border}
    shadow-lg backdrop-blur-sm
    ${isActive ? 'animate-pulse' : ''}
    `}
            >
                {colorScheme.label}
            </div>

            {/* Corner brackets */}
            <div className={`absolute inset-0 ${colorScheme.text}`}>
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current" />
            </div>

            {/* Info on hover - kept minimal */}
            <div className="hidden group-hover:block absolute top-full left-0 mt-1 p-2 bg-neutral-900 text-white text-xs rounded shadow-xl z-50 whitespace-nowrap">
                {concept.type}
            </div>
        </button>
    );
}

import { useState, useEffect } from 'react';
