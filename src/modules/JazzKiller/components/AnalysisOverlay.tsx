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

    // Grid layout: 4 columns
    const COLS = 4;
    const getGridPosition = (measureIndex: number) => {
        const row = Math.floor(measureIndex / COLS);
        const col = measureIndex % COLS;
        return { row, col };
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-30">
            {concepts.map((concept, index) => {
                const colorScheme = CONCEPT_COLORS[concept.type] || CONCEPT_COLORS['MajorII-V-I'];
                const isActive = activeFocusIndex === index;

                const startPos = getGridPosition(concept.startIndex);
                const endPos = getGridPosition(concept.endIndex);

                // Calculate if pattern spans multiple rows
                const spanRows = endPos.row - startPos.row + 1;
                const isSingleRow = spanRows === 1;

                // For single row, calculate width
                const startCol = startPos.col;
                const endCol = endPos.col;
                const colSpan = endCol - startCol + 1;

                return (
                    <button
                        key={`${concept.type}-${index}`}
                        onClick={() => onConceptClick?.(concept, index)}
                        className={`
              absolute pointer-events-auto
              border-2 rounded-xl
              transition-all duration-300
              ${colorScheme.bg} ${colorScheme.border}
              ${isActive ? 'ring-4 ring-amber-500/50 scale-[1.02] z-40' : 'hover:scale-[1.01] z-30'}
              cursor-pointer group
            `}
                        style={{
                            // Position based on grid
                            top: `${startPos.row * 25}%`,
                            left: isSingleRow ? `${(startCol / COLS) * 100}%` : '0%',
                            width: isSingleRow ? `${(colSpan / COLS) * 100}%` : '100%',
                            height: `${spanRows * 25}%`,
                            minHeight: '80px',
                        }}
                    >
                        {/* Label */}
                        <div
                            className={`
                absolute -top-7 left-2
                px-2 py-1 rounded-md
                text-[11px] font-black uppercase tracking-wider
                ${colorScheme.bg} ${colorScheme.text}
                border-2 ${colorScheme.border}
                shadow-lg backdrop-blur-sm
                ${isActive ? 'animate-pulse' : ''}
              `}
                        >
                            {colorScheme.label}
                        </div>

                        {/* Corner brackets */}
                        <div className={`absolute inset-0 ${colorScheme.text}`}>
                            {/* Top-left */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current" />
                            {/* Top-right */}
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current" />
                            {/* Bottom-left */}
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current" />
                            {/* Bottom-right */}
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current" />
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
        </div>
    );
}
