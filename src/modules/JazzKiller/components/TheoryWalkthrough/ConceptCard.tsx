import React from 'react';
import { Concept } from '../../../../core/theory/AnalysisTypes';
import { Zap, ArrowRight, CornerDownRight, Music } from 'lucide-react';

interface ConceptCardProps {
    concept: Concept;
    onExploreScales?: (chord: string) => void;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept, onExploreScales }) => {
    const getConceptColor = (type: string) => {
        switch (type) {
            case 'MajorII-V-I': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'MinorII-V-i': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            case 'SecondaryDominant': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'TritoneSubstitution': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'ColtraneChanges': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
            default: return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20';
        }
    };

    const getConceptLabel = (type: string) => {
        switch (type) {
            case 'MajorII-V-I': return 'Major ii-V-I';
            case 'MinorII-V-i': return 'Minor ii-V-i';
            case 'SecondaryDominant': return 'Secondary Dominant';
            case 'TritoneSubstitution': return 'Tritone Sub';
            case 'ColtraneChanges': return 'Coltrane Changes';
            default: return type;
        }
    };

    const { key, romanNumerals, target, substitutes } = concept.metadata;
    const colorClass = getConceptColor(concept.type);

    return (
        <div className={`p-4 rounded-xl border ${colorClass} flex flex-col gap-2 transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-black opacity-80">{getConceptLabel(concept.type)}</span>
                <Zap size={14} className="opacity-60" />
            </div>

            <div className="flex items-center gap-3 mt-1">
                {romanNumerals && (
                    <div className="flex items-center gap-1.5 font-mono text-lg font-bold">
                        {romanNumerals.map((rn, i) => (
                            <React.Fragment key={i}>
                                <span>{rn}</span>
                                {i < romanNumerals.length - 1 && <span className="opacity-30 text-xs">→</span>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center gap-2 text-xs opacity-70">
                {key && (
                    <div className="flex items-center gap-1">
                        <Music size={12} />
                        <span>Key of {key}</span>
                    </div>
                )}
                {target && (
                    <div className="flex items-center gap-1">
                        <ArrowRight size={12} />
                        <span>Target: {target}</span>
                    </div>
                )}
                {substitutes && (
                    <div className="flex items-center gap-1">
                        <CornerDownRight size={12} />
                        <span>Sub for: {substitutes}</span>
                    </div>
                )}
            </div>

            {onExploreScales && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // For a ii-V-I, we might want to explore the whole progression's scales
                        // But for now, we'll just pass the key reference or the target
                        if (target) onExploreScales(target);
                        else if (key) onExploreScales(key);
                    }}
                    className="mt-3 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-white/5 active:scale-95"
                >
                    <Music size={12} />
                    Explore Scales
                </button>
            )}
        </div>
    );
};
