import React, { useState, useEffect, useCallback } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMidiLibrary } from '../../../../hooks/useMidiLibrary';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { Play, Check, X, ArrowRight, Music, AudioWaveform } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProgressionsLevel: React.FC = () => {
    const { addScore, setPlaying, difficulty, streak } = useFunctionalEarTrainingStore();
    const { files } = useMidiLibrary();
    const [currentProgression, setCurrentProgression] = useState<any>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    // Filter valid progressions
    const validFiles = files.filter(f => f.progression && f.progression.length > 0);

    const loadNewProgression = useCallback(() => {
        if (validFiles.length === 0) return;

        setLoading(true);

        // Try to pick a file that hasn't been used recently
        let randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
        let attempts = 0;
        while (history.includes(randomFile.name) && attempts < 5 && validFiles.length > 5) {
            randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
            attempts++;
        }

        setCurrentProgression(randomFile);
        setHistory(prev => [randomFile.name, ...prev].slice(0, 10));

        // Generate options (1 correct, 3 distractors)
        const correct = randomFile.progression!;
        const distractors = new Set<string>();

        // Try to find distractors that are different
        let distractorAttempts = 0;
        while (distractors.size < 3 && distractorAttempts < 20) {
            const randomDistractor = validFiles[Math.floor(Math.random() * validFiles.length)].progression!;
            if (randomDistractor !== correct) {
                distractors.add(randomDistractor);
            }
            distractorAttempts++;
        }

        const allOptions = [correct, ...Array.from(distractors)];
        // Shuffle options
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        setOptions(allOptions);
        setSelectedOption(null);
        setResult(null);
        setLoading(false);
    }, [validFiles, history]);

    useEffect(() => {
        if (files.length > 0 && !currentProgression) loadNewProgression();
    }, [files, currentProgression, loadNewProgression]);

    const playAudio = async () => {
        if (!currentProgression) return;
        setPlaying(true);

        try {
            await Tone.start();
            const url = await currentProgression.loadUrl();
            const midi = await Midi.fromUrl(url);

            const synths: Tone.PolySynth[] = [];
            const now = Tone.now() + 0.5;

            midi.tracks.forEach(track => {
                const synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: 'triangle' },
                    envelope: {
                        attack: 0.05,
                        decay: 0.2,
                        sustain: 0.4,
                        release: 1
                    }
                }).toDestination();
                synths.push(synth);

                track.notes.forEach(note => {
                    synth.triggerAttackRelease(
                        note.name,
                        note.duration,
                        now + note.time,
                        note.velocity
                    );
                });
            });

            // Auto-stop after duration
            setTimeout(() => {
                synths.forEach(s => s.dispose());
                setPlaying(false);
            }, midi.duration * 1000 + 1000);

        } catch (e) {
            console.error("Failed to play MIDI", e);
            setPlaying(false);
        }
    };

    const handleOptionSelect = (option: string) => {
        if (result) return;
        setSelectedOption(option);

        if (option === currentProgression.progression) {
            setResult('correct');
            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
            addScore(Math.floor(150 * multiplier) + streak * 15);
            setTimeout(loadNewProgression, 2000);
        } else {
            setResult('incorrect');
            addScore(0);
        }
    };

    if (validFiles.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 text-white/40 font-black uppercase tracking-widest text-sm">
                <Music className="w-12 h-12 opacity-20 mb-2" />
                No progressions found in MIDI library.
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Progression Analysis
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Contextualize the functional movement across the temporal field.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-8">
                <div className="relative group">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute -inset-10 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full blur-3xl"
                    ></motion.div>
                    <button
                        className={`
                            relative w-48 h-48 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                            ${result === 'correct' ? 'border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.3)]' :
                                result === 'incorrect' ? 'border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.3)]' :
                                    'border-white/10 shadow-2xl'}
                            group-active:scale-95 backdrop-blur-xl
                        `}
                        onClick={playAudio}
                        disabled={loading}
                    >
                        <Play size={72} className={`ml-3 transition-all ${result === 'correct' ? 'text-emerald-400' : 'text-white'} fill-current group-hover:scale-110`} />
                    </button>

                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-6 py-2 bg-black/40 border border-white/5 rounded-full text-[10px] italic uppercase font-black tracking-tighter text-white/30 backdrop-blur-md">
                        <AudioWaveform size={12} className="inline mr-2 text-emerald-400" />
                        Key: {currentProgression?.key || 'Unknown'} • Source: {currentProgression?.name}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
                {options.map((option, idx) => (
                    <motion.button
                        key={idx}
                        initial={{ x: idx % 2 === 0 ? -20 : 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        onClick={() => handleOptionSelect(option)}
                        disabled={!!result}
                        className={`
                            group relative p-10 rounded-[32px] border-2 transition-all duration-500 overflow-hidden
                            ${selectedOption === option
                                ? result === 'correct'
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                    : 'bg-red-500/20 border-red-500/50 text-red-100'
                                : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                            }
                            ${result && option === currentProgression.progression && selectedOption !== option ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
                        `}
                    >
                        <div className="text-2xl font-mono font-black italic tracking-tight">{option}</div>
                        {selectedOption === option && (
                            <div className="absolute top-4 right-4 animate-reveal">
                                {result === 'correct' ? <Check className="text-emerald-400 w-6 h-6" /> : <X className="text-red-400 w-6 h-6" />}
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            <div className="h-16 flex items-center justify-center">
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`text-2xl font-black italic flex items-center gap-4 ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {result === 'correct' ? 'PERCEPTUAL ACCURACY ACHIEVED' : 'HARMONIC DISREPUTE - REBALANCING'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em] mt-4"
                onClick={loadNewProgression}
            >
                SKIP SEQUENCE
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all group-hover:translate-x-1 group-hover:text-emerald-400 border border-white/5">
                    <ArrowRight size={18} />
                </div>
            </button>
        </div>
    );
};
