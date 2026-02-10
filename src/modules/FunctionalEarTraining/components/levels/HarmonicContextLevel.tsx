import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useJazzLibrary, JazzStandard } from '../../../JazzKiller/hooks/useJazzLibrary';
import { useJazzPlayback } from '../../../JazzKiller/hooks/useJazzPlayback';
import { useMidiLibrary } from '../../../../hooks/useMidiLibrary';
import { analyzeProgression } from '../../utils/theoryEngine';
import { Play, Check, X, ArrowRight, Music, AudioWaveform, StopCircle, Layers, Brain, Database, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isPlayingSignal, bpmSignal, totalLoopsSignal, isLoadedSignal } from '../../../JazzKiller/state/jazzSignals';
import { useSignals } from "@preact/signals-react/runtime";

type ExerciseMode = 'Analysis' | 'Prediction' | 'Bass';
type DataSource = 'Standards' | 'Patterns';

export const HarmonicContextLevel: React.FC = () => {
    useSignals();
    const { addScore, difficulty, streak, externalData, setExternalData } = useFunctionalEarTrainingStore();
    const { standards, getSongAsIRealFormat } = useJazzLibrary();
    const { files: midiFiles } = useMidiLibrary();

    const [mode, setMode] = useState<ExerciseMode>('Analysis');
    const [source, setSource] = useState<DataSource>('Standards');
    const [currentStandard, setCurrentStandard] = useState<any>(null);
    const [fragment, setFragment] = useState<any>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<string>("");

    // Filter standards/patterns based on difficulty
    const filteredContent = useMemo(() => {
        if (source === 'Standards') {
            return standards.filter(s => {
                if (difficulty === 'Novice' && s.Key?.includes('m')) return false;
                return true;
            });
        } else {
            return midiFiles.filter(f => f.progression);
        }
    }, [standards, midiFiles, source, difficulty]);

    const playback = useJazzPlayback(fragment);

    const loadNewQuestion = useCallback(() => {
        if (filteredContent.length === 0) return;
        setLoading(true);
        setSelectedOption(null);
        setResult(null);

        let correct = "";
        let fragmentData: any = null;
        let title = "";

        if (source === 'Standards') {
            let standard: JazzStandard;
            if (externalData?.source === 'jazz-killer') {
                standard = standards.find(s => s.Title === externalData.name) || (filteredContent[0] as JazzStandard);
                setExternalData(null);
            } else {
                standard = filteredContent[Math.floor(Math.random() * filteredContent.length)] as JazzStandard;
            }

            const songData = getSongAsIRealFormat(standard, 0);
            const allMeasures = songData.music.measures;
            const fragmentSize = difficulty === 'Virtuoso' ? 8 : 4;
            const startIndex = Math.floor(Math.random() * (allMeasures.length - fragmentSize + 1));
            const fragmentMeasures = allMeasures.slice(startIndex, startIndex + fragmentSize);
            const chords = fragmentMeasures.flatMap((m: any) => m.chords).filter((c: string) => c && c !== "");

            const analysis = analyzeProgression(songData.key, chords);
            title = standard.Title;
            fragmentData = { ...songData, music: { measures: fragmentMeasures } };

            if (mode === 'Analysis') correct = analysis.map(a => a.roman).join(' - ');
            else if (mode === 'Prediction') correct = analysis[analysis.length - 1].roman;
            else if (mode === 'Bass') correct = analysis.map(a => a.roman.replace(/[^IViv1-7]/g, '').toUpperCase()).join(' - ');

        } else {
            const pattern = filteredContent[Math.floor(Math.random() * filteredContent.length)] as any;
            title = pattern.name;
            correct = pattern.progression;
            // Simplified fragment for patterns
            fragmentData = { key: pattern.key || 'C', music: { measures: [{ chords: pattern.progression.split(' - ') }] } };
        }

        setCorrectAnswer(correct);
        setCurrentStandard({ Title: title });
        setFragment(fragmentData);

        // Generate distractors based on the current mode and difficulty
        const distractors = new Set<string>();
        const pool = mode === 'Prediction' ? ['Imaj7', 'iim7', 'V7', 'vim7', 'IVmaj7', 'bVII7', 'V7alt', 'iiø7', 'bII7'] :
            mode === 'Bass' ? ['I - IV - V - I', 'II - V - I', 'I - VI - II - V'] :
                ['ii - V - I', 'I - vi - ii - V', 'IV - V - I'];

        while (distractors.size < (difficulty === 'Novice' ? 2 : 3)) {
            const d = pool[Math.floor(Math.random() * pool.length)];
            if (d !== correct) distractors.add(d);
        }

        setOptions([correct, ...Array.from(distractors)].sort(() => Math.random() - 0.5));
        setLoading(false);
        bpmSignal.value = difficulty === 'Novice' ? 100 : difficulty === 'Pro' ? 170 : 130;
    }, [filteredContent, source, mode, difficulty, externalData, getSongAsIRealFormat, standards, setExternalData]);

    useEffect(() => {
        if (filteredContent.length > 0 && !currentStandard) loadNewQuestion();
    }, [filteredContent, currentStandard, loadNewQuestion]);

    const handleOptionSelect = (option: string) => {
        if (result || !fragment) return;
        setSelectedOption(option);
        if (option === correctAnswer) {
            setResult('correct');
            const mult = difficulty === 'Novice' ? 1 : difficulty === 'Intermediate' ? 1.5 : difficulty === 'Advanced' ? 2 : 4;
            addScore(Math.floor(250 * mult) + streak * 25);
            setTimeout(loadNewQuestion, 2000);
        } else {
            setResult('incorrect');
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-5xl fade-in relative z-10 px-4 py-8">
            <header className="text-center space-y-6 w-full">
                <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500"><Brain size={32} /></div>
                    <motion.h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
                        Harmonic Context Lab
                    </motion.h2>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                        {(['Analysis', 'Prediction', 'Bass'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setCurrentStandard(null); }}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => { setSource('Standards'); setCurrentStandard(null); }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${source === 'Standards' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white'}`}
                        >
                            <Music size={14} /> Standards
                        </button>
                        <button
                            onClick={() => { setSource('Patterns'); setCurrentStandard(null); }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${source === 'Patterns' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/40 hover:text-white'}`}
                        >
                            <Database size={14} /> Patterns
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col items-center gap-12 py-12">
                <div className="relative group">
                    <motion.div
                        animate={{
                            scale: isPlayingSignal.value ? [1, 1.25, 1] : [1, 1.1, 1],
                            opacity: isPlayingSignal.value ? [0.2, 0.5, 0.2] : [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -inset-16 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-full blur-[80px]"
                    />
                    <button
                        className={`relative w-48 h-48 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                            ${result === 'correct' ? 'border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.4)]' :
                                result === 'incorrect' ? 'border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.4)]' :
                                    isPlayingSignal.value ? 'border-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.3)]' :
                                        'border-white/10 hover:border-white/30'}`}
                        onClick={() => playback.togglePlayback()}
                        disabled={loading || !isLoadedSignal.value}
                    >
                        {!isLoadedSignal.value ? <div className="w-12 h-12 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin" /> :
                            isPlayingSignal.value ? <StopCircle size={80} className="text-amber-400 fill-current" /> :
                                <Play size={80} className="ml-3 text-white fill-current group-hover:scale-110 transition-transform" />}
                    </button>

                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 whitespace-nowrap px-8 py-3 bg-black/60 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center gap-2 text-xs font-black tracking-widest text-white/80">
                            <AudioWaveform size={14} className="text-amber-500" />
                            {currentStandard?.Title || 'SELECTING CORE...'}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                            <span className="text-amber-500/60">{difficulty}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span>{source} SOURCE</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-12 mb-8">
                {options.map((option, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOptionSelect(option)}
                        disabled={!!result}
                        className={`group relative p-10 rounded-[32px] border-2 transition-all duration-500 text-center shadow-xl
                            ${selectedOption === option ?
                                (result === 'correct' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-emerald-500/10' :
                                    'bg-red-500/20 border-red-500 text-red-100 shadow-red-500/10') :
                                'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'}`}
                    >
                        <div className="text-2xl font-mono font-black italic tracking-tighter">{option}</div>
                        <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles size={16} className="text-amber-400" />
                        </div>
                        {selectedOption === option && (
                            <div className="absolute top-1/2 -translate-y-1/2 right-8 scale-150">
                                {result === 'correct' ? <Check className="text-emerald-400" /> : <X className="text-red-400" />}
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            <div className="h-20 flex items-center justify-center">
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className={`text-2xl font-black italic flex flex-col items-center gap-2 ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            <span className="flex items-center gap-3">
                                {result === 'correct' ? <Check className="w-8 h-8 animate-bounce" /> : <X className="w-8 h-8 animate-wiggle" />}
                                {result === 'correct' ? 'PERCEPTUAL ACCURACY ACHIEVED' : 'HARMONIC DISSONANCE DETECTED'}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">
                                {result === 'correct' ? 'Mastery Points Inbound' : 'Neural Pathways Adjusting...'}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button onClick={() => loadNewQuestion()} className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.4em] mt-8 py-4 px-8 rounded-full border border-white/5 hover:bg-white/5">
                SKIP SEQUENCE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform text-amber-500" />
            </button>
        </div>
    );
};
