import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, X, ArrowRight, Guitar, Piano, Target, Crosshair } from 'lucide-react';
import * as Tone from 'tone';
import { UnifiedFretboard } from '../../../../components/shared/UnifiedFretboard';
import { UnifiedPiano } from '../../../../components/shared/UnifiedPiano';
import { audioManager } from '../../../../core/services';

type Instrument = 'Guitar' | 'Piano';
type ChallengeType = 'Note' | 'Interval' | 'Position';

export const InstrumentMappingLevel: React.FC = () => {
    const { addScore, setPlaying, difficulty, streak } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();

    const [instrument, setInstrument] = useState<Instrument>('Guitar');
    const [challengeType, setChallengeType] = useState<ChallengeType>('Note');
    const [targetNote, setTargetNote] = useState<{ noteName: string; midi: number } | null>(null);
    const [markedNotes, setMarkedNotes] = useState<number[]>([]);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const loadNewChallenge = useCallback(() => {
        setResult(null);
        setMarkedNotes([]);

        const noteIndex = Math.floor(Math.random() * NOTES.length);
        const octave = instrument === 'Guitar' ? (Math.floor(Math.random() * 3) + 2) : 4;
        const noteName = NOTES[noteIndex];
        const midi = Tone.Frequency(`${noteName}${octave}`).toMidi();

        setTargetNote({ noteName, midi });
    }, [instrument]);

    useEffect(() => {
        if (!targetNote) loadNewChallenge();
    }, [targetNote, loadNewChallenge]);

    const playAudio = async () => {
        if (!targetNote) return;
        setPlaying(true);
        audioManager.playNote(targetNote.midi, "2n", 0.7);
        setTimeout(() => setPlaying(false), 1000);
    };

    const handleInput = (midi: number) => {
        if (result === 'correct' || !targetNote) return;

        const isCorrect = (midi % 12) === (targetNote.midi % 12);
        if (isCorrect) {
            setResult('correct');
            setMarkedNotes([midi]);
            const mult = difficulty === 'Novice' ? 1 : difficulty === 'Pro' ? 3 : 1.5;
            addScore(Math.floor(100 * mult) + streak * 10);
            setTimeout(loadNewChallenge, 1500);
        } else {
            setResult('incorrect');
            setMarkedNotes([midi]);
            setTimeout(() => { setResult(null); setMarkedNotes([]); }, 1000);
        }
    };

    return (
        <div className="flex flex-col items-center gap-10 w-full max-w-5xl fade-in relative z-10 px-4">
            <header className="text-center space-y-4">
                <motion.h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">
                    Instrument Mapping
                </motion.h2>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => { setInstrument('Guitar'); setTargetNote(null); }}
                        className={`p-3 rounded-2xl transition-all ${instrument === 'Guitar' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-white/5 text-white/40 hover:text-white'}`}
                    >
                        <Guitar size={24} />
                    </button>
                    <button
                        onClick={() => { setInstrument('Piano'); setTargetNote(null); }}
                        className={`p-3 rounded-2xl transition-all ${instrument === 'Piano' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-white/40 hover:text-white'}`}
                    >
                        <Piano size={24} />
                    </button>
                </div>
            </header>

            <div className="flex flex-col items-center gap-8 py-4">
                <div className="relative group">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className={`absolute -inset-10 rounded-full blur-3xl ${instrument === 'Guitar' ? 'bg-cyan-500' : 'bg-purple-500'}`}
                    />
                    <button
                        className={`relative w-36 h-36 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                            ${result === 'correct' ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' :
                                result === 'incorrect' ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]' :
                                    'border-white/10'}`}
                        onClick={playAudio}
                    >
                        <Play size={48} className={`ml-1 transition-all ${result === 'correct' ? 'text-emerald-400' : 'text-white'} fill-current`} />
                    </button>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-6 py-2 bg-black/40 border border-white/5 rounded-full text-[10px] italic uppercase font-black tracking-tighter text-white/30 backdrop-blur-md">
                        Locate <span className={`text-lg mx-2 ${instrument === 'Guitar' ? 'text-cyan-400' : 'text-purple-400'}`}>{targetNote?.noteName}</span> • {difficulty}
                    </div>
                </div>
            </div>

            <div className="w-full glass-panel p-10 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={instrument}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {instrument === 'Guitar' ? (
                            <div className="overflow-x-auto no-scrollbar">
                                <UnifiedFretboard
                                    mode="notes"
                                    highlightedNotes={markedNotes}
                                    onNoteClick={handleInput}
                                    fretRange={[0, 15]}
                                    playSound={false}
                                />
                            </div>
                        ) : (
                            <UnifiedPiano
                                mode="highlight"
                                highlightedNotes={markedNotes}
                                octaveRange={[3, 5]}
                                onNoteOn={(midi) => handleInput(midi)}
                                showLabels="none"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="h-16 flex items-center justify-center">
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-2xl font-black italic flex items-center gap-4 ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {result === 'correct' ? <Target className="animate-bounce" /> : <Crosshair />}
                            {result === 'correct' ? 'SPATIAL TARGET ACQUIRED' : 'MAPPING ERROR - RECALIBRATING'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button onClick={loadNewChallenge} className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em] py-4">
                SKIP CHALLENGE <div className="p-3 bg-white/5 rounded-full group-hover:bg-cyan-500/20 group-hover:text-cyan-400 border border-white/5 transition-all"><ArrowRight size={18} /></div>
            </button>
        </div>
    );
};
