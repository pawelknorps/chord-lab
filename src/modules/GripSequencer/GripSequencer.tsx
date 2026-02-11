import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
import { GRIPS, constructGrip, generateMelody } from './gripTheory';
import { midiToNoteName } from '../../core/theory';
import { audioManager } from '../../core/services';
import GripRadar from './GripRadar';
import { UnifiedPiano } from '../../components/shared/UnifiedPiano';
import { useAudioCleanup } from '../../hooks/useAudioManager';
import { useMidi } from '../../context/MidiContext';

const SEQUENCE_LENGTH = 8;

const GripSequencer: React.FC = () => {
    useAudioCleanup('grip-sequencer');
    const { activeNotes: midiActiveNotes } = useMidi();
    const [melody, setMelody] = useState<number[]>([]);
    const [selectedGrips, setSelectedGrips] = useState<string[]>(Array(SEQUENCE_LENGTH).fill('Q1'));
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);

    useEffect(() => {
        setMelody(generateMelody(SEQUENCE_LENGTH));
    }, []);

    const handlePlay = async () => {
        if (isPlaying) {
            setIsPlaying(false);
            setActiveIndex(null);
            audioManager.stopAll();
            return;
        }

        setIsPlaying(true);
        const playData = selectedGrips.map((gripName, i) => {
            const topNote = melody[i];
            const notesMidi = constructGrip(topNote, gripName);
            return {
                notes: notesMidi,
                duration: '4n',
                time: i * 600
            };
        });

        playData.forEach((item, i) => {
            setTimeout(() => {
                // Since this is inside a timeout, we need to check if the component is still playing
                // However, state is captured. Using a ref would be better for cleanup, but let's stick to this for now.
                setActiveIndex(i);
                setHighlightedNotes(item.notes);
                audioManager.playChord(item.notes, '2n', 0.8);

                if (i === SEQUENCE_LENGTH - 1) {
                    setTimeout(() => {
                        setIsPlaying(false);
                        setActiveIndex(null);
                        setHighlightedNotes([]);
                    }, 600);
                }
            }, item.time);
        });
    };

    const setGripAtStep = (stepIndex: number, gripName: string) => {
        const newGrips = [...selectedGrips];
        newGrips[stepIndex] = gripName;
        setSelectedGrips(newGrips);

        const topNote = melody[stepIndex];
        const notesMidi = constructGrip(topNote, gripName);
        setHighlightedNotes(notesMidi);
        audioManager.playChord(notesMidi, '4n', 0.8);
    };

    const currentGripName = activeIndex !== null ? selectedGrips[activeIndex] : selectedGrips[0];
    const currentGripColor = GRIPS.find(g => g.name === currentGripName)?.color || '#3b82f6';

    const combinedActiveNotes = useMemo(() => {
        return Array.from(midiActiveNotes);
    }, [midiActiveNotes]);

    const isMatch = useMemo(() => {
        if (highlightedNotes.length === 0) return false;
        const normalizedHighlights = highlightedNotes.map(n => (n % 12)).sort();
        const normalizedUser = combinedActiveNotes.map(n => (n % 12)).sort();

        // Check if all highlighted notes are present in user notes (modulo 12)
        return normalizedHighlights.every(n => normalizedUser.includes(n));
    }, [highlightedNotes, combinedActiveNotes]);

    const handlePianoNote = useCallback((note: number) => {
        audioManager.playNote(note, '4n', 0.8);
    }, []);

    return (
        <div className="h-full min-w-0 flex flex-col p-4 md:p-8 bg-[var(--bg-app)] text-[var(--text-primary)] overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Grip Sequencer</h2>
                    <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest opacity-50">Planar harmony via constant structures.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setMelody(generateMelody(SEQUENCE_LENGTH))}
                        className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                        title="New Melody"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={handlePlay}
                        className={`flex items-center gap-3 px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest transition-all border ${isPlaying ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white text-black border-transparent hover:scale-105'}`}
                    >
                        {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        {isPlaying ? 'Stop' : 'Play Sheet'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row gap-10 min-h-0">
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex mb-6 ml-32">
                        {melody.map((noteMidi, i) => (
                            <div key={i} className="flex-1 text-center">
                                <div className={`
                                 w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-black text-sm mb-2 border transition-all duration-500
                                 ${activeIndex === i ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-white/20 border-white/5'}
                             `}>
                                    {midiToNoteName(noteMidi).replace(/[0-9]/g, '')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl overflow-y-auto no-scrollbar glass-panel">
                        {GRIPS.map((grip) => (
                            <div key={grip.name} className="flex items-center h-20 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                                <div className="w-32 flex flex-col justify-center px-6 border-r border-white/5 h-full bg-white/[0.01]">
                                    <span className="font-black text-xs uppercase tracking-tighter" style={{ color: grip.color }}>{grip.name}</span>
                                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{grip.description}</span>
                                </div>

                                <div className="flex-1 flex px-4 gap-2 items-center h-full">
                                    {Array.from({ length: SEQUENCE_LENGTH }).map((_, stepIndex) => {
                                        const isSelected = selectedGrips[stepIndex] === grip.name;
                                        const isActive = activeIndex === stepIndex;

                                        return (
                                            <div key={stepIndex} className="flex-1 h-12">
                                                <button
                                                    onClick={() => setGripAtStep(stepIndex, grip.name)}
                                                    className={`
                                                     w-full h-full rounded-lg transition-all duration-300 border
                                                     ${isSelected
                                                            ? 'opacity-100 border-transparent shadow-lg'
                                                            : 'opacity-0 hover:opacity-100 bg-white/5 border-white/5 hover:border-white/20'}
                                                     ${isActive && isSelected ? 'brightness-125 scale-110 z-10' : ''}
                                                 `}
                                                    style={{
                                                        backgroundColor: isSelected ? grip.color : undefined,
                                                        boxShadow: isSelected && isActive ? `0 0 25px ${grip.color}66` : undefined
                                                    }}
                                                >
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-96 flex flex-col gap-8 shrink-0">
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center aspect-square glass-panel">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-white/30">Grip Radar</h3>
                        <div className="flex-1 w-full relative">
                            <GripRadar
                                gripName={currentGripName}
                                color={currentGripColor}
                                isActive={isPlaying}
                            />
                        </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 border-l-4 glass-panel" style={{ borderLeftColor: currentGripColor }}>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white/40 font-mono">Structure Analysis</h3>
                        <div className="space-y-6">
                            <div>
                                <span className="text-[9px] text-white/20 uppercase font-black tracking-widest block mb-2">Intervals</span>
                                <div className="flex flex-wrap gap-2">
                                    {GRIPS.find(g => g.name === currentGripName)?.intervalsDownNames.map((name, i) => (
                                        <span key={i} className="text-[10px] px-3 py-1 bg-white/5 rounded-full border border-white/5 font-black text-white/60">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] text-white/20 uppercase font-black tracking-widest block mb-2">Harmonic Function</span>
                                <p className="text-xs text-white/40 leading-relaxed font-medium italic">
                                    "{GRIPS.find(g => g.name === currentGripName)?.theory}"
                                </p>
                            </div>
                        </div>

                        {highlightedNotes.length > 0 && (
                            <div className={`mt-10 p-4 rounded-2xl border transition-all duration-500 flex items-center justify-center gap-4 ${isMatch ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isMatch ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-white/20'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isMatch ? 'text-emerald-400' : 'text-white/20'}`}>
                                    {isMatch ? 'PERFECT VOICING' : 'EXECUTE GRIP'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-16 flex flex-col items-center gap-8 pb-12">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full justify-center py-4">
                    <UnifiedPiano
                        mode="highlight"
                        octaveRange={[3, 6]}
                        highlightedNotes={highlightedNotes}
                        activeNotes={combinedActiveNotes}
                        onNoteClick={handlePianoNote}
                        showLabels="note-name"
                    />
                </div>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">
                    Visualizing Constant Structure Movement
                </p>
            </div>
        </div>
    );
};

export default GripSequencer;
