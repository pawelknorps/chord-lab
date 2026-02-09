import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useJazzLibrary, JazzStandard } from '../../../JazzKiller/hooks/useJazzLibrary';
import { useJazzPlayback } from '../../../JazzKiller/hooks/useJazzPlayback';
import * as Progression from "@tonaljs/progression";
import { Play, Check, X, ArrowRight, Music, AudioWaveform, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isPlayingSignal, bpmSignal, totalLoopsSignal, isLoadedSignal } from '../../../JazzKiller/state/jazzSignals';
import { useSignals } from "@preact/signals-react/runtime";

export const JazzStandardsLevel: React.FC = () => {
    useSignals();
    const { addScore, difficulty, streak } = useFunctionalEarTrainingStore();
    const { standards, getSongAsIRealFormat } = useJazzLibrary();

    type ExerciseMode = 'Analysis' | 'Prediction' | 'Bass';

    const [mode, setMode] = useState<ExerciseMode>('Analysis');
    const [currentStandard, setCurrentStandard] = useState<JazzStandard | null>(null);
    const [fragment, setFragment] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<string>("");

    // Filter standards that are playable and have enough measures
    const validStandards = useMemo(() => {
        return standards.filter(s => {
            // Difficulty filtering
            if (difficulty === 'Novice') {
                if (s.Key && s.Key.includes('m')) return false; // Major keys only for Novice
                if (s.Rhythm && s.Rhythm.includes('Up')) return false; // No fast tempos
            }

            let measureCount = 0;
            s.Sections.forEach(section => {
                if (section.MainSegment.Chords) {
                    measureCount += section.MainSegment.Chords.split('|').length;
                }
            });
            return measureCount >= 4;
        });
    }, [standards, difficulty]);

    const playback = useJazzPlayback(fragment);

    const loadNewQuestion = useCallback(() => {
        if (validStandards.length === 0) return;
        setLoading(true);

        // Pick a random standard
        let standard = validStandards[Math.floor(Math.random() * validStandards.length)];
        let attempts = 0;
        while (history.includes(standard.Title) && attempts < 5 && validStandards.length > 5) {
            standard = validStandards[Math.floor(Math.random() * validStandards.length)];
            attempts++;
        }

        const songData = getSongAsIRealFormat(standard, 0);
        const allMeasures = songData.music.measures;

        // --- MODE LOGIC ---

        const fragmentSize = 4;
        const startIndex = Math.floor(Math.random() * (allMeasures.length - fragmentSize + 1));
        const fragmentMeasures = allMeasures.slice(startIndex, startIndex + fragmentSize);

        let playMeasures = fragmentMeasures;

        if (mode === 'Prediction') {
            // We play 3, but the answer is based on the 4th
            playMeasures = fragmentMeasures.slice(0, 3);
        }

        const fragmentSong = {
            ...songData,
            music: {
                measures: playMeasures
            }
        };

        // Extract progression
        const chordNames = fragmentMeasures.flatMap((m: { chords: string[] }) => m.chords).filter((c: string) => c && c !== "");
        const key = songData.key;

        // Clean chord names for tonal
        const cleanedChords = chordNames.map(c =>
            c.replace(/\(.*?\)/g, '').replace(/[[\]]/g, '').trim()
                .replace(/^C#/, 'C#').replace(/^Db/, 'Db')
        );

        const romanNumerals = Progression.toRomanNumerals(key, cleanedChords);

        let correct = "";

        if (mode === 'Analysis') {
            correct = romanNumerals.join(' - ');
        } else if (mode === 'Prediction') {
            correct = romanNumerals[romanNumerals.length - 1] || "I";
            if (romanNumerals.length < 4) correct = romanNumerals[romanNumerals.length - 1];
        } else if (mode === 'Bass') {
            correct = romanNumerals.map(rn => rn.replace(/[^IViv1-7]/g, '')).join(' - ');
            correct = correct.toUpperCase();
        }

        setCorrectAnswer(correct);
        setFragment(fragmentSong);
        setCurrentStandard(standard);
        setHistory(prev => [standard.Title, ...prev].slice(0, 10));

        // Generate distractors
        const distractors = new Set<string>();
        const numDistractors = difficulty === 'Novice' ? 2 : 3;

        let dAttempts = 0;

        if (mode === 'Analysis' || mode === 'Bass') {
            while (distractors.size < numDistractors && dAttempts < 30) {
                const randomStd = validStandards[Math.floor(Math.random() * validStandards.length)];
                const randomSongData = getSongAsIRealFormat(randomStd, 0);
                const rMeasures = randomSongData.music.measures;
                if (rMeasures.length >= 4) {
                    const rStart = Math.floor(Math.random() * (rMeasures.length - 3));
                    const rChords = rMeasures.slice(rStart, rStart + 4).flatMap((m: { chords: string[] }) => m.chords).filter((c: string) => c && c !== "");
                    const rKey = randomSongData.key;
                    const rRomanCols = Progression.toRomanNumerals(rKey, rChords.map(c => c.replace(/\(.*?\)/g, '').replace(/[[\]]/g, '').trim()));

                    let distractor = "";
                    if (mode === 'Analysis') {
                        distractor = rRomanCols.join(' - ');
                    } else {
                        distractor = rRomanCols.map(rn => rn.replace(/[^IViv1-7]/g, '').toUpperCase()).join(' - ');
                    }

                    if (distractor !== correct && distractor.length > 0) {
                        distractors.add(distractor);
                    }
                }
                dAttempts++;
            }
        } else if (mode === 'Prediction') {
            // const commonFunctionals = ['I', 'IV', 'V', 'vi', 'ii', 'iii', 'bVII', 'bII'];
            while (distractors.size < numDistractors) {
                const pool = ['Imaj7', 'iim7', 'V7', 'vim7', 'iiim7', 'IVmaj7', 'bVII7', 'bIImaj7', 'i7', 'iv7', 'I7', 'V7alt', 'iiø7'];
                const pick = pool[Math.floor(Math.random() * pool.length)];
                // const rn = pick; // Simplify logic for now
                if (pick !== correct) distractors.add(pick);
            }
        }

        // Fill if empty (fallback)
        while (distractors.size < numDistractors) {
            distractors.add(mode === 'Analysis' ? "ii - V - I" : "V7");
        }

        const allOptions = [correct, ...Array.from(distractors)];
        // Shuffle
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        setOptions(allOptions);
        setSelectedOption(null);
        setResult(null);
        setLoading(false);

        // Reset playback signals
        totalLoopsSignal.value = difficulty === 'Pro' ? 1 : 2;
        bpmSignal.value = difficulty === 'Novice' ? 100 : difficulty === 'Pro' ? 180 : 130;
    }, [validStandards, history, getSongAsIRealFormat, difficulty, mode]);

    useEffect(() => {
        if (validStandards.length > 0 && !currentStandard) {
            const timer = setTimeout(() => loadNewQuestion(), 0);
            return () => clearTimeout(timer);
        }
    }, [validStandards, currentStandard, loadNewQuestion]);

    const handleOptionSelect = (option: string) => {
        if (result || !fragment) return;
        setSelectedOption(option);

        if (option === correctAnswer) {
            setResult('correct');
            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 2 : 4;
            addScore(Math.floor(250 * multiplier) + streak * 25);
            if (isPlayingSignal.value) playback.togglePlayback();
            setTimeout(loadNewQuestion, 2500);
        } else {
            setResult('incorrect');
            addScore(0);
        }
    };

    const togglePlay = () => {
        playback.togglePlayback();
    };

    if (validStandards.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 text-white/40 font-black uppercase tracking-widest text-sm">
                <Music className="w-12 h-12 opacity-20 mb-2" />
                No standards found.
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl fade-in relative z-10 px-4">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Standard Analysis
                </motion.h2>
                <div className="flex justify-center gap-2">
                    {(['Analysis', 'Prediction', 'Bass'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setResult(null); setCurrentStandard(null); }}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
                <motion.p
                    key={mode}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-amber-500/80 font-mono text-[10px] uppercase tracking-widest"
                >
                    {mode === 'Analysis' && "// IDENTIFY THE FULL PROGRESSION"}
                    {mode === 'Prediction' && "// PREDICT THE FINAL CHORD RESOLUTION"}
                    {mode === 'Bass' && "// IDENTIFY ROOT MOVEMENT DEGREES"}
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-8 py-4">
                <div className="relative group">
                    <motion.div
                        animate={{
                            scale: isPlayingSignal.value ? [1, 1.2, 1] : [1, 1.1, 1],
                            opacity: isPlayingSignal.value ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: isPlayingSignal.value ? 1 : 5, repeat: Infinity }}
                        className="absolute -inset-10 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-full blur-3xl"
                    ></motion.div>
                    <button
                        className={`
                            relative w-40 h-40 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                            ${result === 'correct' ? 'border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.3)]' :
                                result === 'incorrect' ? 'border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.3)]' :
                                    isPlayingSignal.value ? 'border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.2)]' :
                                        'border-white/10 shadow-2xl'}
                            active:scale-95 backdrop-blur-xl
                        `}
                        onClick={togglePlay}
                        disabled={loading || !isLoadedSignal.value}
                    >
                        {!isLoadedSignal.value ? (
                            <div className="w-10 h-10 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin"></div>
                        ) : isPlayingSignal.value ? (
                            <StopCircle size={60} className="transition-all text-amber-400 fill-current" />
                        ) : (
                            <Play size={60} className={`ml-2 transition-all ${result === 'correct' ? 'text-emerald-400' : 'text-white'} fill-current group-hover:scale-110`} />
                        )}
                    </button>

                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-6 py-2 bg-black/40 border border-white/5 rounded-full text-[10px] italic uppercase font-black tracking-tighter text-white/30 backdrop-blur-md">
                        <AudioWaveform size={12} className="inline mr-2 text-amber-500" />
                        Source: {currentStandard?.Title || 'Selecting...'} • Key: {difficulty === 'Novice' ? fragment?.key : '???'}
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${mode === 'Prediction' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4 w-full max-w-2xl`}>
                {options.map((option, idx) => (
                    <motion.button
                        key={idx}
                        initial={{ x: idx % 2 === 0 ? -20 : 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => handleOptionSelect(option)}
                        disabled={!!result}
                        className={`
                            group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden text-left
                            ${selectedOption === option
                                ? result === 'correct'
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                    : 'bg-red-500/20 border-red-500/50 text-red-100'
                                : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                            }
                        `}
                    >
                        <div className="text-lg md:text-xl font-mono font-black italic tracking-tight text-center">{option}</div>
                        {selectedOption === option && (
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 animate-reveal">
                                {result === 'correct' ? <Check className="text-emerald-400 w-5 h-5" /> : <X className="text-red-400 w-5 h-5" />}
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            <div className="h-12 flex items-center justify-center">
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`text-xl font-black italic flex items-center gap-2 ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {result === 'correct' ? 'HARMONIC TRUTH RECOGNIZED' : 'TONAL DISSONANCE DETECTED'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                onClick={() => loadNewQuestion()}
            >
                SKIP
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-all group-hover:translate-x-1 group-hover:text-amber-400 border border-white/5">
                    <ArrowRight size={14} />
                </div>
            </button>
        </div>
    );
};
