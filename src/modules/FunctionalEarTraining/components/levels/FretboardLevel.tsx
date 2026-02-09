import React, { useState, useEffect, useCallback } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, X, ArrowRight } from 'lucide-react';
import * as Tone from 'tone';
import { checkNotePosition, GUITAR_STRINGS, FRET_DOTS, DOUBLE_DOTS } from '../../utils/guitarUtils';

export const FretboardLevel: React.FC = () => {
    const { addScore, setPlaying, difficulty, streak } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();

    const [targetNote, setTargetNote] = useState<any>(null);
    const [markedNotes, setMarkedNotes] = useState<any[]>([]);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [loading, setLoading] = useState(false);
    const [highlightedNote, setHighlightedNote] = useState<any>(null);

    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const loadNewChallenge = useCallback(() => {
        setResult(null);
        setMarkedNotes([]);
        setHighlightedNote(null);

        // Pick a random note
        const noteName = NOTES[Math.floor(Math.random() * NOTES.length)];
        // Pick an octave based on guitar range (approx 2 to 4)
        const octave = Math.floor(Math.random() * 3) + 2;

        setTargetNote({
            noteName,
            octave,
            fullNote: `${noteName}${octave}`
        });
    }, []);

    useEffect(() => {
        if (!targetNote) loadNewChallenge();
    }, [targetNote, loadNewChallenge]);

    const playAudio = async () => {
        if (!targetNote) return;
        setPlaying(true);
        await Tone.start();

        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { release: 1 }
        }).toDestination();

        synth.triggerAttackRelease(targetNote.fullNote, "2n", Tone.now());

        setTimeout(() => {
            setPlaying(false);
            synth.dispose();
        }, 1000);
    };

    const handleFretClick = (stringIndex: number, fret: number) => {
        if (result === 'correct') return;

        const isCorrect = checkNotePosition(stringIndex, fret, targetNote);

        if (isCorrect) {
            setResult('correct');
            setMarkedNotes([{ string: stringIndex, fret }]);

            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
            const points = Math.floor(100 * multiplier) + streak * 10;
            addScore(points);
            addExperience('FET', Math.floor(points / 2));
            updateStreak('FET', streak + 1);

            setTimeout(loadNewChallenge, 1500);
        } else {
            setResult('incorrect');
            updateStreak('FET', 0);

            // Re-play audio or show hint if needed
            setTimeout(() => setResult(null), 1000);
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

            {/* Fretboard Interface */}
            <div className="w-full glass-panel p-8 rounded-[32px] border border-white/10 overflow-x-auto no-scrollbar">
                <div className="relative min-w-[800px]">
                    {/* Fret Numbers */}
                    <div className="flex ml-12 mb-2">
                        {Array.from({ length: 13 }).map((_, i) => (
                            <div key={i} className="flex-1 text-center text-[10px] font-black text-white/20 uppercase tracking-tighter">
                                {i}
                            </div>
                        ))}
                    </div>

                    {/* Fretboard Grid */}
                    <div className="flex flex-col gap-0 border-r border-white/10 relative">
                        {/* String lines background */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-12 py-[11px]">
                            {GUITAR_STRINGS.map((_, i) => (
                                <div key={i} className="h-[1px] bg-white/10 w-full" />
                            ))}
                        </div>

                        {GUITAR_STRINGS.map((string, sIdx) => (
                            <div key={string.index} className="flex items-center h-6 relative z-10">
                                {/* String Label */}
                                <div className="w-12 text-xs font-black text-white/40 uppercase pr-4 text-right">
                                    {string.name}
                                </div>

                                {/* Frets */}
                                <div className="flex-1 flex">
                                    {Array.from({ length: 13 }).map((_, fIdx) => {
                                        const isMarked = markedNotes.some(m => m.string === string.index && m.fret === fIdx);
                                        const isFretDot = FRET_DOTS.includes(fIdx);
                                        const isDoubleDot = DOUBLE_DOTS.includes(fIdx);

                                        return (
                                            <button
                                                key={fIdx}
                                                onClick={() => handleFretClick(string.index, fIdx)}
                                                className={`
                                                    flex-1 h-10 border-l border-white/20 relative group transition-all
                                                    ${fIdx === 0 ? 'bg-white/5' : 'hover:bg-white/10'}
                                                `}
                                            >
                                                {/* Fret marker dot */}
                                                {sIdx === 2 && isFretDot && !isDoubleDot && (
                                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-white/20" />
                                                )}

                                                {/* Note marker */}
                                                <AnimatePresence>
                                                    {isMarked && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className={`absolute inset-0 flex items-center justify-center`}
                                                        >
                                                            <div className={`w-3 h-3 rounded-full ${result === 'correct' ? 'bg-emerald-400' : 'bg-red-400'} shadow-[0_0_15px_rgba(52,211,153,0.5)]`} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
