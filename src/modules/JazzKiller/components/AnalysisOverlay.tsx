import { Concept } from '../../../core/theory/AnalysisTypes';
import { useEffect, useState } from 'react';

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
    const [measurePositions, setMeasurePositions] = useState<DOMRect[]>([]);

    useEffect(() => {
        const updatePositions = () => {
            const leadSheetGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
            if (leadSheetGrid) {
                const measureElements = leadSheetGrid.querySelectorAll(':scope > div');
                const positions = Array.from(measureElements).map(el => el.getBoundingClientRect());
                setMeasurePositions(positions);
            }
        };

        updatePositions();
        window.addEventListener('resize', updatePositions);
        window.addEventListener('scroll', updatePositions);

        return () => {
            window.removeEventListener('resize', updatePositions);
            window.removeEventListener('scroll', updatePositions);
        };
    }, [measureCount]);

    if (concepts.length === 0 || measurePositions.length === 0) {
        return null;
    }

    return (
        <>
            {concepts.map((concept, index) => {
                const colorScheme = CONCEPT_COLORS[concept.type] || CONCEPT_COLORS['MajorII-V-I'];
                const isActive = activeFocusIndex === index;

                // Get positions for start and end measures
                const startRect = measurePositions[concept.startIndex];
                const endRect = measurePositions[concept.endIndex];

                if (!startRect || !endRect) return null;

                // Calculate bounding box
                const top = Math.min(startRect.top, endRect.top);
                const left = startRect.left;
                const right = endRect.right;
                const bottom = Math.max(startRect.bottom, endRect.bottom);

                return (
                    <button
                        key={`${concept.type}-${index}`}
                        onClick={() => onConceptClick?.(concept, index)}
                        className={`
              fixed pointer-events-auto
              border-2 rounded-xl
              transition-all duration-300
              ${colorScheme.bg} ${colorScheme.border}
              ${isActive ? 'ring-4 ring-amber-500/50 scale-[1.01] z-30' : 'hover:scale-[1.005] z-20'}
              cursor-pointer group
            `}
                        style={{
                            top: `${top}px`,
                            left: `${left}px`,
                            width: `${right - left}px`,
                            height: `${bottom - top}px`,
                        }}
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
                            {/* Top-left */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current" />
                            {/* Top-right */}
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current" />
                            {/* Bottom-left */}
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current" />
                            {/* Bottom-right */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current" />
                        </div>

                        {/* Info on hover */}
                        <div
                            className={`
                absolute top-full left-0 mt-2 w-max max-w-xs
                px-3 py-2 rounded-lg
                text-xs text-left
                bg-neutral-900 border border-white/10
                shadow-2xl z-50
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              `}
                        >
                            <div className="font-bold mb-1 text-white">{concept.type}</div>
                            {concept.metadata.key && (
                                <div className="text-neutral-400">Key: {concept.metadata.key}</div>
                            )}
                            {concept.metadata.romanNumerals && (
                                <div className="text-neutral-400">
                                    {concept.metadata.romanNumerals.join(' → ')}
                                </div>
                            )}
                            {concept.metadata.target && (
                                <div className="text-neutral-400">Target: {concept.metadata.target}</div>
                            )}
                            {concept.metadata.substitutes && (
                                <div className="text-neutral-400">Substitutes: {concept.metadata.substitutes}</div>
                            )}
                            <div className="text-neutral-600 text-[10px] mt-2">
                                Click to practice this pattern
                            </div>
                        </div>
                    </button>
                );
            })}
        </>
    );
}
