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
    if (concepts.length === 0) {
        return null;
    }

    // Calculate bracket positions (assuming equal-width measures)
    const measureWidth = 100 / measureCount;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {concepts.map((concept, index) => {
                const colorScheme = CONCEPT_COLORS[concept.type] || CONCEPT_COLORS['MajorII-V-I'];
                const startPos = concept.startIndex * measureWidth;
                const width = (concept.endIndex - concept.startIndex + 1) * measureWidth;
                const isActive = activeFocusIndex === index;

                return (
                    <button
                        key={`${concept.type}-${index}`}
                        onClick={() => onConceptClick?.(concept, index)}
                        className={`
              absolute pointer-events-auto
              border-2 rounded-xl
              transition-all duration-300
              ${colorScheme.bg} ${colorScheme.border}
              ${isActive ? 'ring-4 ring-white/30 scale-105' : 'hover:scale-102'}
              cursor-pointer group
            `}
                        style={{
                            left: `${startPos}%`,
                            width: `${width}%`,
                            top: `${10 + (index % 3) * 25}px`,
                            height: '60px',
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
                shadow-lg
                ${isActive ? 'animate-pulse' : ''}
              `}
                        >
                            {colorScheme.label}
                        </div>

                        {/* Bracket visualization */}
                        <svg
                            className="absolute inset-0 w-full h-full"
                            style={{ overflow: 'visible' }}
                        >
                            {/* Top bracket */}
                            <path
                                d={`M 5 0 L 0 0 L 0 10`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={colorScheme.text}
                            />
                            <path
                                d={`M calc(100% - 5px) 0 L 100% 0 L 100% 10`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={colorScheme.text}
                            />

                            {/* Bottom bracket */}
                            <path
                                d={`M 5 100% L 0 100% L 0 calc(100% - 10px)`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={colorScheme.text}
                            />
                            <path
                                d={`M calc(100% - 5px) 100% L 100% 100% L 100% calc(100% - 10px)`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={colorScheme.text}
                            />
                        </svg>

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
                            <div className="font-bold mb-1">{concept.type}</div>
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
        </div>
    );
}
