import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, X, ArrowRight } from 'lucide-react';
import * as Tone from 'tone';
import { UnifiedFretboard } from '../../../../components/shared/UnifiedFretboard';
import { audioManager } from '../../../../core/services';

export const FretboardLevel: React.FC = () => {
    const { addScore, setPlaying, difficulty, streak } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();

    const [targetNote, setTargetNote] = useState<{ noteName: string; octave: number; fullNote: string; midi: number } | null>(null);
    const [markedNotes, setMarkedNotes] = useState<number[]>([]);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const loadNewChallenge = useCallback(() => {
        setResult(null);
        setMarkedNotes([]);

        const noteName = NOTES[Math.floor(Math.random() * NOTES.length)];
        const octave = Math.floor(Math.random() * 3) + 2;
        const fullNote = `${noteName}${octave}`;
        const midi = Tone.Frequency(fullNote).toMidi();

        setTargetNote({ noteName, octave, fullNote, midi });
    }, []);

    useEffect(() => {
        if (!targetNote) loadNewChallenge();
    }, [targetNote, loadNewChallenge]);

    const playAudio = async () => {
        if (!targetNote) return;
        setPlaying(true);
        audioManager.playNote(targetNote.midi, "2n", 0.7);
        setTimeout(() => setPlaying(false), 1000);
    };

    const handleFretClick = (note: number) => {
        if (result === 'correct' || !targetNote) return;

        const isCorrect = (note % 12) === (targetNote.midi % 12);

        if (isCorrect) {
            setResult('correct');
            setMarkedNotes([note]);

            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
            const points = Math.floor(100 * multiplier) + streak * 10;
            addScore(points);
            addExperience('FET', Math.floor(points / 2));
            updateStreak('FET', streak + 1);

            setTimeout(loadNewChallenge, 1500);
        } else {
            setResult('incorrect');
            setMarkedNotes([note]);
            updateStreak('FET', 0);
            setTimeout(() => {
                setResult(null);
                setMarkedNotes([]);
            }, 1000);
        }
    };

    if (!targetNote) return null;

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-5xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Fretboard Mapping
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Locate the note <span className="text-cyan-400 text-lg font-black mx-1">{targetNote.noteName}</span> on the fretboard.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-6">
                <button
                    className={`
                        w-24 h-24 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                        ${result === 'correct' ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
                            result === 'incorrect' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
                                'border-white/10 shadow-xl'}
                        hover:scale-105 active:scale-95 backdrop-blur-xl
                    `}
                    onClick={playAudio}
                >
                    <Play size={32} className={`ml-1 transition-all ${result === 'correct' ? 'text-emerald-400' : 'text-white'} fill-current`} />
                </button>
            </div>

            <div className="w-full glass-panel p-8 rounded-[32px] border border-white/10 overflow-x-auto no-scrollbar">
                <UnifiedFretboard
                    mode="notes"
                    highlightedNotes={markedNotes}
                    onNoteClick={(note) => handleFretClick(note)}
                    fretRange={[0, 12]}
                    playSound={false} // We handle it in the level logic
                />
            </div>

            <div className="h-12 flex items-center justify-center">
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`text-xl font-black italic flex items-center gap-3 ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {result === 'correct' ? (
                                <><div className="p-1.5 bg-emerald-500/20 rounded-full"><Check className="w-5 h-5" /></div> MAPPED SUCCESSFULLY</>
                            ) : (
                                <><div className="p-1.5 bg-red-500/20 rounded-full"><X className="w-5 h-5" /></div> MISALIGNMENT DETECTED</>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                onClick={loadNewChallenge}
            >
                SKIP NOTE
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all group-hover:translate-x-1 group-hover:text-cyan-400 border border-white/5">
                    <ArrowRight size={18} />
                </div>
            </button>
        </div>
    );
};
