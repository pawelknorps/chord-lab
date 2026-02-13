import React, { useState, useEffect } from 'react';
import { ChordScaleEngine } from '../../../../core/theory/ChordScaleEngine';
import { ChordScaleMapping, ScaleOption } from '../../../../core/theory/ChordScaleTypes';
import { JazzTheoryService } from '../../utils/JazzTheoryService';
import { noteNameToMidi, recognizeChordFromSymbol } from '../../../../core/theory';
import { X, Box, Check, Keyboard, Info } from 'lucide-react';
import { UnifiedPiano } from '../../../../components/shared/UnifiedPiano';

interface ChordScalePanelProps {
    chordSymbol: string;
    onClose: () => void;
}

type VoicingOption = { id: string; name: string; notes: number[]; description: string };

export const ChordScalePanel: React.FC<ChordScalePanelProps> = ({ chordSymbol, onClose }) => {
    const [scales, setScales] = useState<ChordScaleMapping | null>(null);
    const [voicings, setVoicings] = useState<VoicingOption[]>([]);
    const [selectedScale, setSelectedScale] = useState<ScaleOption | null>(null);
    const [selectedVoicingId, setSelectedVoicingId] = useState<string | null>(null);

    useEffect(() => {
        if (chordSymbol) {
            const result = ChordScaleEngine.getScales(chordSymbol);
            setScales(result);
            if (result) {
                setSelectedScale(result.primary);
            }

            const voicingResults = JazzTheoryService.getPianoVoicingOptions(chordSymbol, 3, 6);
            setVoicings(voicingResults);
            if (voicingResults.length > 0) {
                setSelectedVoicingId(voicingResults[0].id);
            }
        }
    }, [chordSymbol]);

    const selectedVoicing = voicings.find(v => v.id === selectedVoicingId);

    const rootNoteMidi = chordSymbol
        ? (() => {
            const cleaned = JazzTheoryService.normalizeChordSymbolForTheory(chordSymbol);
            const { root } = recognizeChordFromSymbol(cleaned);
            return (3 + 1) * 12 + (noteNameToMidi(root + "0") % 12);
        })()
        : undefined;

    if (!scales || !selectedScale) return (
        <div className="p-4 text-center text-neutral-500">
            Select a chord to explore scales...
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-neutral-900/95 backdrop-blur-xl border-l border-white/5 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Box size={20} />
                    </div>
                    <div>
                        <h2 className="font-black text-lg text-white leading-tight">Scale Explorer</h2>
                        <span className={`mt-1 text-[8px] px-1.5 py-0.5 rounded-full border inline-block ${selectedScale.mood === 'stable' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            selectedScale.mood === 'tense' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                selectedScale.mood === 'bright' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}>
                            {selectedScale.mood.toUpperCase()}
                        </span>
                        <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mt-1">Target: {chordSymbol}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Primary Choice */}
                <div className="space-y-2">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Primary Choice</div>
                    <div
                        className={`p-4 rounded-xl border transition-all cursor-pointer group ${selectedScale.id === scales.primary.id ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                        onClick={() => setSelectedScale(scales.primary)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className={`font-bold text-lg ${selectedScale.id === scales.primary.id ? 'text-purple-300' : 'text-neutral-200'}`}>
                                    {scales.primary.name}
                                </h3>
                                <p className="text-sm text-neutral-400 mt-1">{scales.primary.description}</p>
                            </div>
                            {selectedScale.id === scales.primary.id && <Check size={16} className="text-purple-400" />}
                        </div>
                    </div>
                </div>

                {/* Alternatives */}
                {scales.alternatives.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Other Options</div>
                        <div className="grid gap-2">
                            {scales.alternatives.map((alt) => (
                                <div
                                    key={alt.id}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer hover:bg-white/5 ${selectedScale.id === alt.id ? 'bg-purple-500/5 border-purple-500/30' : 'bg-transparent border-white/5'}`}
                                    onClick={() => setSelectedScale(alt)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className={`font-bold text-sm ${selectedScale.id === alt.id ? 'text-purple-300' : 'text-neutral-300'}`}>
                                                {alt.name}
                                            </h4>
                                            <p className="text-xs text-neutral-500 mt-0.5">{alt.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Voicings Section */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <Keyboard size={12} />
                        Piano Voicings
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                        {voicings.map(v => (
                            <button
                                key={v.id}
                                onClick={() => setSelectedVoicingId(v.id)}
                                className={`p-2 rounded-lg border text-left transition-all ${selectedVoicingId === v.id
                                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <span className={`text-[10px] font-bold block ${selectedVoicingId === v.id ? 'text-emerald-300' : 'text-white'}`}>{v.name}</span>
                                <span className="text-[8px] text-neutral-500 truncate block">{v.notes.length} notes</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visualization Section — same voicings as iReal chart player */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 overflow-hidden">
                        <UnifiedPiano
                            mode="display"
                            octaveRange={[2, 5]}
                            highlightedNotes={selectedVoicing ? selectedVoicing.notes : []}
                            rootNote={rootNoteMidi}
                            chordSymbol={chordSymbol}
                            showLabels="chord-tone"
                            className="h-24"
                        />
                        {selectedVoicing && (
                            <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-[10px] text-neutral-400 italic leading-snug">
                                    <Info size={10} className="inline mr-1 opacity-50" />
                                    {selectedVoicing.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
