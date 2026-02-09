import React, { useState, useEffect, useCallback } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, X, ArrowRight, Layers, Music } from 'lucide-react';
import * as Tone from 'tone';
import { CHORD_DEFINITIONS, getChordTones, PROGRESSION_LIBRARY } from '../../utils/progressionUtils';

export const ChordTonesLevel: React.FC = () => {
    const { addScore, setPlaying, difficulty, streak } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();

    const [currentProgression, setCurrentProgression] = useState<any>(null);
    const [challenge, setChallenge] = useState<any>(null);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const loadNewChallenge = useCallback(() => {
        setResult(null);
        setSelectedNote(null);

        const prog = PROGRESSION_LIBRARY[Math.floor(Math.random() * PROGRESSION_LIBRARY.length)];
        const chordIndex = Math.floor(Math.random() * prog.chords.length);
        const chordName = prog.chords[chordIndex];
        const tones = getChordTones(chordName);
        const targetTone = tones[Math.floor(Math.random() * tones.length)];

        setCurrentProgression(prog);
        setChallenge({
            chordIndex,
            chordName,
            targetTone,
            tones
        });
    }, []);

    useEffect(() => {
        if (!challenge) loadNewChallenge();
    }, [challenge, loadNewChallenge]);

    const playAudio = async () => {
        if (!challenge || !currentProgression) return;
        setPlaying(true);
        setIsPlaying(true);
        await Tone.start();

        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { release: 1 }
        }).toDestination();

        const leadSynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { release: 0.5 }
        }).toDestination();

        const now = Tone.now();
        const chordDuration = 1.5;

        // Play the progression up to the target chord
        currentProgression.chords.forEach((chord: string, idx: number) => {
            const time = now + idx * chordDuration;
            const notes = CHORD_DEFINITIONS[chord as keyof typeof CHORD_DEFINITIONS];

            // Play chord
            synth.triggerAttackRelease(notes, chordDuration * 0.8, time);

            // If this is the target chord, play the target tone as a melody
            if (idx === challenge.chordIndex) {
                const targetNote = challenge.targetTone + "5"; // Play in higher octave
                leadSynth.triggerAttackRelease(targetNote, "4n", time + 0.5);
            }
        });

        setTimeout(() => {
            setPlaying(false);
            setIsPlaying(false);
            synth.dispose();
            leadSynth.dispose();
        }, currentProgression.chords.length * chordDuration * 1000);
    };

    const handleAnswer = (tone: string) => {
        if (result === 'correct') return;
        setSelectedNote(tone);

        if (tone === challenge.targetTone) {
            setResult('correct');
            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
            const points = Math.floor(120 * multiplier) + streak * 10;
            addScore(points);
            addExperience('FET', Math.floor(points / 2));
            updateStreak('FET', streak + 1);
            setTimeout(loadNewChallenge, 1500);
        } else {
            setResult('incorrect');
            updateStreak('FET', 0);
            setTimeout(() => {
                setResult(null);
                setSelectedNote(null);
            }, 1000);
        }
    };

    if (!challenge) return null;

    return (
        <div className="flex flex-col items-center gap-10 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Chord Tones
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Identify the melody note over the <span className="text-amber-400 font-black">{challenge.chordName}</span> chord.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-6">
                <div className="flex gap-4 mb-4">
                    {currentProgression.chords.map((c: string, i: number) => (
                        <div key={i} className={`px-4 py-2 rounded-lg border-2 font-mono font-black ${i === challenge.chordIndex ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-white/10 text-white/20'}`}>
                            {c}
                        </div>
                    ))}
                </div>

                <div className="relative group">
                    <motion.div
                        animate={isPlaying ? {
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.5, 0.2]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -inset-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-3xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all"
                    ></motion.div>
                    <button
                        className={`
                            relative w-32 h-32 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                            ${result === 'correct' ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
                                result === 'incorrect' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
                                    'border-white/10 shadow-xl'}
                            group-active:scale-95 backdrop-blur-xl
                        `}
                        onClick={playAudio}
                        disabled={isPlaying}
                    >
                        <Play size={48} className={`ml-1 transition-all ${result === 'correct' ? 'text-emerald-400' : 'text-white'} fill-current group-hover:scale-110`} />
                    </button>
                </div>
            </div>

            <div className="w-full space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {challenge.tones.map((tone: string) => (
                        <motion.button
                            key={tone}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer(tone)}
                            disabled={!!result || isPlaying}
                            className={`
                                group relative p-8 rounded-3xl border-2 transition-all duration-300
                                ${selectedNote === tone
                                    ? result === 'correct'
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'bg-red-500/20 border-red-500/50 text-red-100'
                                    : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                                }
                            `}
                        >
                            <div className="text-3xl font-black italic tracking-tighter">{tone}</div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="h-12 flex items-center justify-center">
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className={`text-xl font-black italic flex items-center gap-3 ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {result === 'correct' ? 'CRYSTAL CLEAR HEARING' : 'RETUNING SENSES...'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                onClick={loadNewChallenge}
            >
                SKIP PROGRESSION
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all group-hover:translate-x-1 group-hover:text-amber-400 border border-white/5">
                    <ArrowRight size={18} />
                </div>
            </button>
        </div>
    );
};
