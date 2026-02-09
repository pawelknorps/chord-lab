import React, { useState, useEffect, useCallback } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMidiLibrary } from '../../../../hooks/useMidiLibrary';
import { useMidi } from '../../../../context/MidiContext';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { Play, Check, X, ArrowRight, Music2, Keyboard } from 'lucide-react';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_INTERVALS = [
    { label: '9', value: 14, semitones: 2, difficulty: ['Novice', 'Advanced', 'Pro'] },
    { label: '11', value: 17, semitones: 5, difficulty: ['Novice', 'Advanced', 'Pro'] },
    { label: '13', value: 21, semitones: 9, difficulty: ['Novice', 'Advanced', 'Pro'] },
    { label: 'b9', value: 13, semitones: 1, difficulty: ['Advanced', 'Pro'] },
    { label: '#9', value: 15, semitones: 3, difficulty: ['Advanced', 'Pro'] },
    { label: '#11', value: 18, semitones: 6, difficulty: ['Advanced', 'Pro'] },
    { label: 'b13', value: 20, semitones: 8, difficulty: ['Advanced', 'Pro'] },
];

export const MelodyStepsLevel: React.FC = () => {
    const { addScore, setPlaying, difficulty, streak } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();
    const { files } = useMidiLibrary();
    const { lastNote } = useMidi();

    const [currentChord, setCurrentChord] = useState<any>(null);
    const [targetInterval, setTargetInterval] = useState<any>(null);
    const [options, setOptions] = useState<any[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [midiFeedback, setMidiFeedback] = useState<string | null>(null);

    const validFiles = files.filter((f: any) => f.progression && f.progression.length > 0);

    const loadNewChallenge = useCallback(async () => {
        if (validFiles.length === 0) return;
        setLoading(true);
        setResult(null);
        setSelectedOption(null);
        setMidiFeedback(null);

        const currentPool = ALL_INTERVALS.filter(i => i.difficulty.includes(difficulty));

        // Pick a file, trying not to repeat recently used ones
        let randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
        let attempts = 0;
        while (history.includes(randomFile.name) && attempts < 5) {
            randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
            attempts++;
        }

        try {
            const url = await randomFile.loadUrl();
            const midi = await Midi.fromUrl(url);

            const track = midi.tracks[0];
            const notes = track.notes;

            if (notes.length < 3) {
                loadNewChallenge();
                return;
            }

            const timeSlots: { [time: string]: any[] } = {};
            notes.forEach(note => {
                const time = note.time.toFixed(2);
                if (!timeSlots[time]) timeSlots[time] = [];
                timeSlots[time].push(note);
            });

            const times = Object.keys(timeSlots);
            const randomTime = times[Math.floor(Math.random() * times.length)];
            const chordNotes = timeSlots[randomTime];

            chordNotes.sort((a, b) => a.midi - b.midi);
            const root = chordNotes[0];

            const randomInterval = currentPool[Math.floor(Math.random() * currentPool.length)];

            setCurrentChord({
                notes: chordNotes,
                root: root,
                file: randomFile
            });
            setTargetInterval(randomInterval);

            // Update history
            setHistory(prev => [randomFile.name, ...prev].slice(0, 10));

            const distractors = currentPool.filter(i => i.label !== randomInterval.label)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const allOptions = [randomInterval, ...distractors].sort(() => 0.5 - Math.random());
            setOptions(allOptions);

            setLoading(false);

        } catch (e) {
            console.error("Error loading MIDI for melody steps", e);
            setLoading(false);
            setTimeout(loadNewChallenge, 100);
        }
    }, [validFiles, difficulty, history]);

    useEffect(() => {
        if (files.length > 0 && !currentChord) loadNewChallenge();
    }, [files, currentChord, loadNewChallenge]);

    const playAudio = async () => {
        if (!currentChord || !targetInterval) return;
        setPlaying(true);
        await Tone.start();

        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { release: 1 }
        }).toDestination();

        const melodySynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { release: 0.5 }
        }).toDestination();

        const now = Tone.now();

        currentChord.notes.forEach((note: any) => {
            synth.triggerAttackRelease(note.name, "2n", now);
        });

        const rootMidi = currentChord.root.midi;
        const targetMidi = rootMidi + targetInterval.semitones + 12;
        const targetFreq = Tone.Frequency(targetMidi, "midi").toFrequency();

        melodySynth.triggerAttackRelease(targetFreq, "4n", now + 0.6);

        setTimeout(() => {
            setPlaying(false);
            synth.dispose();
            melodySynth.dispose();
        }, 2000);
    };

    const handleCorrectAnswer = useCallback(() => {
        setResult('correct');
        const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
        const points = Math.floor(100 * multiplier) + streak * 10;
        addScore(points);
        addExperience('FET', Math.floor(points / 2));
        updateStreak('FET', streak + 1);
        setTimeout(loadNewChallenge, 1500);
    }, [difficulty, streak, addScore, addExperience, updateStreak, loadNewChallenge]);

    const handleIncorrectAnswer = useCallback(() => {
        setResult('incorrect');
        updateStreak('FET', 0);
    }, [updateStreak]);

    const handleOptionSelect = (optionLabel: string) => {
        if (result) return;
        setSelectedOption(optionLabel);

        if (optionLabel === targetInterval.label) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer();
        }
    };

    // MIDI Input Support
    useEffect(() => {
        if (lastNote && lastNote.type === 'noteon' && !result && currentChord && targetInterval) {
            const playedMidi = lastNote.note;
            const rootMidi = currentChord.root.midi;

            // Calculate interval in semitones (normalize octave)
            let diff = (playedMidi - rootMidi) % 12;
            if (diff < 0) diff += 12;

            const targetSemitones = targetInterval.semitones % 12;

            if (diff === targetSemitones) {
                setMidiFeedback(`MATCH: ${targetInterval.label}`);
                setSelectedOption(targetInterval.label);
                handleCorrectAnswer();
            } else {
                // Find what interval they actually played
                const playedInterval = ALL_INTERVALS.find(i => i.semitones % 12 === diff);
                if (playedInterval) {
                    setMidiFeedback(`PLAYED: ${playedInterval.label}`);
                    setSelectedOption(playedInterval.label);
                } else {
                    setMidiFeedback(`PLAYED: semitone ${diff}`);
                }
                handleIncorrectAnswer();
            }
        }
    }, [lastNote, result, currentChord, targetInterval, handleCorrectAnswer, handleIncorrectAnswer]);

    if (!currentChord) return (
        <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl animate-pulse">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin mb-6" />
            <div className="text-cyan-400 font-black uppercase tracking-[0.2em] text-sm italic">Curating Harmonic Challenges...</div>
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Melody Extensions
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Identify the vertical relationship between the cluster and its melodic peak.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-8">
                <div className="relative group">
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -inset-8 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 rounded-full blur-3xl"
                    ></motion.div>
                    <button
                        className={`
                            relative w-44 h-44 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                            ${result === 'correct' ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]' :
                                result === 'incorrect' ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]' :
                                    'border-white/10 shadow-2xl'}
                            group-active:scale-95 backdrop-blur-xl
                        `}
                        onClick={playAudio}
                        disabled={loading}
                    >
                        <Play size={64} className={`ml-2 transition-all ${result === 'correct' ? 'text-emerald-400' : 'text-white'} fill-current group-hover:scale-110`} />
                    </button>

                    {/* Source label */}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 bg-black/40 border border-white/5 rounded-full text-[10px] uppercase font-black tracking-tighter text-white/30 backdrop-blur-sm">
                        <Music2 size={10} className="inline mr-2 text-cyan-500" />
                        Source: {currentChord.file.name}
                    </div>
                </div>
            </div>

            <div className="w-full space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest">
                        <Keyboard size={14} className="text-white/20" />
                        MIDI Input Active
                    </div>
                    {midiFeedback && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={`text-[10px] font-black uppercase tracking-widest ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {midiFeedback}
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {options.map((option, idx) => (
                        <motion.button
                            key={idx}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                            onClick={() => handleOptionSelect(option.label)}
                            disabled={!!result}
                            className={`
                                group relative p-10 rounded-[32px] border-2 transition-all duration-500 overflow-hidden
                                ${selectedOption === option.label
                                    ? result === 'correct'
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                                        : 'bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                                    : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                                }
                            `}
                        >
                            {selectedOption === option.label && result === 'correct' && (
                                <motion.div
                                    layoutId="shine"
                                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none"
                                />
                            )}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="text-4xl font-black mb-1 italic tracking-tighter">{option.label}</div>
                                <div className="text-[10px] uppercase font-black opacity-30 tracking-[0.2em]">Step</div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="h-16 flex items-center justify-center">
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`text-2xl font-black italic flex items-center gap-4 ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {result === 'correct' ? (
                                <><div className="p-2 bg-emerald-500/20 rounded-full"><Check className="w-8 h-8" /></div> CRYSTAL CLEAR HEARING</>
                            ) : (
                                <><div className="p-2 bg-red-500/20 rounded-full"><X className="w-8 h-8" /></div> HARMONIC RE-CALIBRATION</>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em] mt-4"
                onClick={loadNewChallenge}
            >
                SKIP SEQUENCE
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all group-hover:translate-x-1 group-hover:text-cyan-400 border border-white/5">
                    <ArrowRight size={18} />
                </div>
            </button>
        </div>
    );
};
