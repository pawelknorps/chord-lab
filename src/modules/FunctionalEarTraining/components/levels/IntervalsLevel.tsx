import React, { useState, useEffect, useCallback } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, X, ArrowRight, Music, Activity, RotateCcw, SkipForward } from 'lucide-react';
import * as Tone from 'tone';
import { diagnoseEarError } from '../../utils/earDiagnosis';
import { getEarHint } from '../../../../core/services/earHintService';

const INTERVALS = [
    { name: 'm2', semitones: 1, label: 'Minor 2nd' },
    { name: 'M2', semitones: 2, label: 'Major 2nd' },
    { name: 'm3', semitones: 3, label: 'Minor 3rd' },
    { name: 'M3', semitones: 4, label: 'Major 3rd' },
    { name: 'P4', semitones: 5, label: 'Perfect 4th' },
    { name: '#4/b5', semitones: 6, label: 'Tritone' },
    { name: 'P5', semitones: 7, label: 'Perfect 5th' },
    { name: 'm6', semitones: 8, label: 'Minor 6th' },
    { name: 'M6', semitones: 9, label: 'Major 6th' },
    { name: 'm7', semitones: 10, label: 'Minor 7th' },
    { name: 'M7', semitones: 11, label: 'Major 7th' },
    { name: 'P8', semitones: 12, label: 'Octave' },
];

export const IntervalsLevel: React.FC = () => {
    const { addScore, setPlaying, difficulty, streak } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();

    const [challenge, setChallenge] = useState<any>(null);
    const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [playMode, setPlayMode] = useState<'melodic' | 'harmonic'>('melodic');
    const [aiHint, setAiHint] = useState<string | null>(null);
    const [hintLoading, setHintLoading] = useState(false);

    const loadNewChallenge = useCallback(() => {
        setResult(null);
        setSelectedInterval(null);
        setAiHint(null);

        const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
        const rootMidi = 60; // Middle C

        setChallenge({
            interval,
            rootMidi,
            targetMidi: rootMidi + interval.semitones
        });
    }, []);

    useEffect(() => {
        if (!challenge) loadNewChallenge();
    }, [challenge, loadNewChallenge]);

    const playAudio = async () => {
        if (!challenge) return;
        setPlaying(true);
        await Tone.start();

        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { release: 1 }
        }).toDestination();

        const now = Tone.now();
        const rootNote = Tone.Frequency(challenge.rootMidi, "midi").toNote();
        const targetNote = Tone.Frequency(challenge.targetMidi, "midi").toNote();

        if (playMode === 'melodic') {
            synth.triggerAttackRelease(rootNote, "2n", now);
            synth.triggerAttackRelease(targetNote, "2n", now + 0.6);
        } else {
            synth.triggerAttackRelease([rootNote, targetNote], "1n", now);
        }

        setTimeout(() => {
            setPlaying(false);
            synth.dispose();
        }, 1500);
    };

    const handleAnswer = useCallback(async (intervalName: string) => {
        if (result === 'correct') return;
        setSelectedInterval(intervalName);

        if (intervalName === challenge.interval.name) {
            setResult('correct');
            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
            const points = Math.floor(100 * multiplier) + streak * 5;
            addScore(points);
            addExperience('FET', Math.floor(points / 2));
            updateStreak('FET', streak + 1);
            setTimeout(loadNewChallenge, 1500);
        } else {
            setResult('incorrect');
            updateStreak('FET', 0);
            setAiHint(null);
            setHintLoading(true);
            const diagnosis = diagnoseEarError(challenge.interval.name, intervalName);
            try {
                const hint = await getEarHint(diagnosis);
                setAiHint(hint);
            } catch {
                setAiHint('Listen for the tension and release.');
            } finally {
                setHintLoading(false);
            }
        }
    }, [challenge, result, difficulty, streak, addScore, addExperience, updateStreak, loadNewChallenge]);

    if (!challenge) return null;

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Pure Intervals
                </motion.h2>
                <div className="flex justify-center gap-4 mt-2">
                    {['melodic', 'harmonic'].map(m => (
                        <button
                            key={m}
                            onClick={() => setPlayMode(m as any)}
                            className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest transition-all ${playMode === m ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative group">
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -inset-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-3xl"
                ></motion.div>
                <button
                    className={`
                        relative w-36 h-36 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                        ${result === 'correct' ? 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]' :
                            result === 'incorrect' ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)]' :
                                'border-white/10 shadow-2xl'}
                        group-active:scale-95 backdrop-blur-xl
                    `}
                    onClick={playAudio}
                >
                    <Play size={56} className={`ml-2 transition-all ${result === 'correct' ? 'text-emerald-400' : 'text-white'} fill-current group-hover:scale-110`} />
                </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full">
                {INTERVALS.map((interval) => (
                    <motion.button
                        key={interval.name}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(interval.name)}
                        disabled={result === 'correct'}
                        className={`
                            group relative p-6 rounded-3xl border-2 transition-all duration-300
                            ${selectedInterval === interval.name
                                ? result === 'correct'
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-black'
                                    : 'bg-red-500/20 border-red-500/50 text-red-100'
                                : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.08] hover:border-white/20 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                            }
                        `}
                    >
                        <div className="text-xl font-bold italic tracking-tighter mb-1 uppercase">{interval.name}</div>
                        <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">{interval.label}</div>
                    </motion.button>
                ))}
            </div>

            <div className="min-h-[5rem] flex flex-col items-center justify-center gap-3">
                <AnimatePresence mode="wait">
                    {result === 'correct' && (
                        <motion.div
                            key="correct"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="text-2xl font-black italic flex items-center gap-4 text-emerald-400"
                        >
                            <Activity className="w-6 h-6 animate-pulse" /> SPATIAL FREQUENCY MATCHED
                        </motion.div>
                    )}
                    {result === 'incorrect' && (
                        <motion.div
                            key="incorrect"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="flex flex-col items-center gap-3 text-center max-w-md"
                        >
                            <div className="flex items-center gap-2 text-red-400 font-black italic">
                                <X className="w-5 h-5" /> Not quite.
                            </div>
                            {hintLoading ? (
                                <span className="text-sm text-white/50">Getting hint...</span>
                            ) : aiHint ? (
                                <p className="text-sm text-white/70 italic px-4">{aiHint}</p>
                            ) : null}
                            <div className="flex items-center gap-3 mt-1">
                                <button
                                    type="button"
                                    onClick={playAudio}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    <RotateCcw size={14} /> Listen again
                                </button>
                                <button
                                    type="button"
                                    onClick={loadNewChallenge}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    <SkipForward size={14} /> Skip
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                onClick={loadNewChallenge}
            >
                RECALIBRATE
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all group-hover:translate-x-1 group-hover:text-indigo-400 border border-white/5">
                    <ArrowRight size={18} />
                </div>
            </button>
        </div>
    );
};
