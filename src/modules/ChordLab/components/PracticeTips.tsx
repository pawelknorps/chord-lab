import { useMemo } from 'react';
import { midiToNoteName, noteNameToMidi } from '../../../core/theory/index';
import type { ChordInfo } from '../../../core/theory/index';
import { Lightbulb, Target, Compass, Zap, X } from 'lucide-react';

interface PracticeTipsProps {
    progression: (ChordInfo | null)[];
    selectedKey: string;
    onClose?: () => void;
}

export const PracticeTips = ({ progression, selectedKey, onClose }: PracticeTipsProps) => {
    const tips = useMemo(() => {
        const validChords = progression.filter((c): c is ChordInfo => c !== null);
        if (validChords.length === 0) return [];

        // Get unique chords by root and quality
        const uniqueMap = new Map<string, ChordInfo>();
        validChords.forEach(c => {
            const key = `${c.root}${c.quality}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, c);
            }
        });

        return Array.from(uniqueMap.values()).map(chord => {
            const suggestions = generateSuggestions(chord.root, chord.quality, selectedKey);
            return {
                chordSymbol: `${chord.root}${chord.quality === 'maj' ? '' : chord.quality === 'min' ? 'm' : chord.quality}${chord.bass ? `/${chord.bass}` : ''}`,
                ...suggestions
            };
        }).slice(0, 8);
    }, [progression, selectedKey]);

    if (tips.length === 0) return null;

    return (
        <div className="w-full max-w-xs md:max-w-sm flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-4 animate-in slide-in-from-left duration-500 bg-black/40 backdrop-blur-md border-r border-white/5 h-full fixed left-0 top-0 z-50 pt-20">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Target className="text-amber-500" size={20} />
                    <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400">Guided Practice</h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded text-neutral-600 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6 p-6">
                {tips.map((tip, i) => (
                    <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xl font-black text-amber-400">{tip.chordSymbol}</span>
                            <Zap size={14} className="text-neutral-700 group-hover:text-amber-500/50 transition-colors" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                                    <Compass size={10} /> Guide Tones
                                </div>
                                <p className="text-sm text-neutral-300 font-medium">{tip.guideTones}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                                    <Lightbulb size={10} /> Substitution
                                </div>
                                <p className="text-sm text-neutral-300 font-medium">{tip.substitution}</p>
                            </div>

                            {tip.triadPair && (
                                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/10">
                                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">
                                        Triad Pair
                                    </div>
                                    <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                                        Play {tip.triadPair}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function generateSuggestions(root: string, quality: string, context: string) {
    const q = quality.toLowerCase();
    if (q.includes('maj') || q === '^') {
        return {
            guideTones: `3rd (${getNote(root, 4, context)}) and 7th (${getNote(root, 11, context)})`,
            substitution: `Play ${getNote(root, 4, context)}min7 arpeggio for a ${root}maj9 sound.`,
            triadPair: `${root} Major & ${getNote(root, 2, context)} Major (Lydian)`
        };
    }
    if (q.includes('min') || q === '-' || q === 'm') {
        return {
            guideTones: `3rd (${getNote(root, 3, context)}) and 7th (${getNote(root, 10, context)})`,
            substitution: `Play ${getNote(root, 3, context)}maj7 arpeggio for a ${root}min9 sound.`,
            triadPair: `${getNote(root, 3, context)} Major & ${getNote(root, 5, context)} Major (Dorian)`
        };
    }
    if (q.includes('7') || q === 'dom7') {
        return {
            guideTones: `3rd (${getNote(root, 4, context)}) and 7th (${getNote(root, 10, context)})`,
            substitution: `Play ${getNote(root, 6, context)}dim7 for a flat-9 rootless sound.`,
            triadPair: `${root} Major & ${getNote(root, 2, context)} Major (Mixolydian #11)`
        };
    }
    if (q.includes('h') || q.includes('m7b5') || q === 'ø') {
        return {
            guideTones: `3rd (${getNote(root, 3, context)}) and 7th (${getNote(root, 10, context)})`,
            substitution: `Play ${getNote(root, 3, context)}min7 for a ${root}m11b5 sound.`,
            triadPair: `${getNote(root, 3, context)} Minor & ${getNote(root, 4, context)} Major`
        };
    }
    return {
        guideTones: `Focus on Root and 5th`,
        substitution: `Standard arpeggio: 1-3-5`,
        triadPair: null
    };
}

function getNote(root: string, interval: number, context: string): string {
    try {
        const rootMidi = noteNameToMidi(root + "4");
        const targetMidi = rootMidi + interval;
        const spelled = midiToNoteName(targetMidi, context);
        return spelled.replace(/[0-9-]/g, '');
    } catch (e) {
        return root;
    }
}
