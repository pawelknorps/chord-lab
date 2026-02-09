import { useMemo } from 'react';
import { parseChord, midiToNoteName, noteNameToMidi } from '../../../core/theory/index';
import { Lightbulb, Target, Compass, Zap, X } from 'lucide-react';

interface PracticeTipsProps {
    song: any;
    onClose?: () => void;
}

export const PracticeTips = ({ song, onClose }: PracticeTipsProps) => {
    const tips = useMemo(() => {
        if (!song || !song.music || !song.music.measures) return [];

        const allChords = song.music.measures.flatMap((m: any) => m.chords || []);
        const uniqueChords = Array.from(new Set(allChords)).filter(c => c !== "") as string[];
        const keyContext = song.key || "C";

        return uniqueChords.map(chordSymbol => {
            const { root, quality } = parseChord(chordSymbol);
            const suggestions = generateSuggestions(root, quality, keyContext);
            return {
                chord: chordSymbol,
                ...suggestions
            };
        }).slice(0, 8); // Limit to top 8 unique chords to avoid clutter
    }, [song]);

    if (!song) return null;

    return (
        <div className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-4 animate-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between px-2 py-4 border-b border-white/5 sticky top-0 bg-[#0a0a0a] z-10">
                <div className="flex items-center gap-2">
                    <Target className="text-amber-500" size={20} />
                    <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400">Guided Practice</h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded text-neutral-600 hover:text-white transition-colors"
                        title="Hide Practice Tips"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6 py-2">
                {tips.map((tip, i) => (
                    <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xl font-black text-amber-400">{tip.chord}</span>
                            <Zap size={14} className="text-neutral-700 group-hover:text-amber-500/50 transition-colors" />
                        </div>

                        <div className="space-y-4">
                            {/* Guide Tones */}
                            <div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                                    <Compass size={10} /> Guide Tones
                                </div>
                                <p className="text-sm text-neutral-300 font-medium">{tip.guideTones}</p>
                            </div>

                            {/* Arpeggio Strategy */}
                            <div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                                    <Lightbulb size={10} /> Substitution
                                </div>
                                <p className="text-sm text-neutral-300 font-medium">{tip.substitution}</p>
                            </div>

                            {/* Triad Pair */}
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

            <div className="px-4 py-8 mt-auto border-t border-white/5">
                <p className="text-[10px] text-neutral-500 leading-relaxed text-center italic">
                    All suggestions are spelled correctly for the key of {song.key}.
                </p>
            </div>
        </div>
    );
};

function generateSuggestions(root: string, quality: string, context: string) {
    if (quality.includes('maj') || quality === 'maj7' || quality === '^') {
        return {
            guideTones: `3rd (${getNote(root, 4, context)}) and 7th (${getNote(root, 11, context)})`,
            substitution: `Play ${getNote(root, 4, context)}min7 (V of chord) for a ${root}maj9 sound.`,
            triadPair: `${root} Major & ${getNote(root, 2, context)} Major (Lydian sound)`
        };
    }
    if (quality.includes('m') || quality === 'min' || quality === 'min7' || quality === '-') {
        return {
            guideTones: `3rd (${getNote(root, 3, context)}) and 7th (${getNote(root, 10, context)})`,
            substitution: `Play ${getNote(root, 3, context)}maj7 arpeggio (bIII) for a ${root}min9 sound.`,
            triadPair: `${getNote(root, 3, context)} Major & ${getNote(root, 5, context)} Major (Dorian)`
        };
    }
    if (quality.includes('7') || quality === 'dom7') {
        return {
            guideTones: `3rd (${getNote(root, 4, context)}) and 7th (${getNote(root, 10, context)})`,
            substitution: `Play ${getNote(root, 6, context)}dim7 (vii°) for a flat-9 rootless sound.`,
            triadPair: `${root} Major & ${getNote(root, 2, context)} Major (Mixolydian #11)`
        };
    }
    if (quality.includes('h') || quality.includes('m7b5') || quality === 'ø') {
        return {
            guideTones: `3rd (${getNote(root, 3, context)}) and 7th (${getNote(root, 10, context)})`,
            substitution: `Play ${getNote(root, 3, context)}min7 (bIIIm) for a ${root}m11b5 sound.`,
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
    const rootMidi = noteNameToMidi(root + "4");
    const targetMidi = rootMidi + interval;
    const spelled = midiToNoteName(targetMidi, context);
    return spelled.replace(/[0-9-]/g, ''); // Return only the note name part
}
