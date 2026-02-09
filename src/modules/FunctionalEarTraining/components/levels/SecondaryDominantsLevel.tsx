import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMidi } from '../../../../context/MidiContext';
import { getSecondaryDominants, getFunctionalNoteName } from '../../../../utils/theoryEngine';
import { getScaleChords, getChordNotes } from '../../../../core/theory';
import { Network, Keyboard, Info, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SecondaryDominantsLevel() {
    const { addScore, streak, difficulty, currentKey } = useFunctionalEarTrainingStore();
    const { activeNotes } = useMidi();

    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [gameState, setGameState] = useState<'IDLE' | 'LISTENING' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [midiFeedback, setMidiFeedback] = useState<string | null>(null);

    useEffect(() => {
        fetAudio.init();
    }, []);

    const secondaryDominantOptions = useMemo(() => getSecondaryDominants(currentKey), [currentKey]);

    const playRound = useCallback(() => {
        setGameState('LISTENING');
        setFeedback('Listen to the Tonic Context...');
        setMidiFeedback(null);

        // 1. Establish Key (Cadence I-IV-V-I)
        const scaleChords = getScaleChords(currentKey, 'Major', 3);
        const cadence = [
            scaleChords[0].midiNotes, // I
            scaleChords[3].midiNotes, // IV
            scaleChords[4].midiNotes, // V
            scaleChords[0].midiNotes  // I
        ];

        // Play cadence notes as strings for FETAudioEngine
        const cadenceStrings = cadence.map(notes => notes.map(m => getFunctionalNoteName(m, currentKey)));

        let timeOffset = 0;
        cadenceStrings.forEach((chordNotes) => {
            setTimeout(() => {
                fetAudio.playChord(chordNotes, '2n');
            }, timeOffset);
            timeOffset += 600;
        });

        setTimeout(() => {
            // Pick a secondary dominant
            let option = secondaryDominantOptions[Math.floor(Math.random() * secondaryDominantOptions.length)];
            let attempts = 0;
            while (history.includes(option.label) && attempts < 5 && secondaryDominantOptions.length > 2) {
                option = secondaryDominantOptions[Math.floor(Math.random() * secondaryDominantOptions.length)];
                attempts++;
            }

            // Get MIDI notes for the secondary dominant
            const midiNotes = getChordNotes(option.root, option.quality, 4, 'Root Position');
            const noteStrings = midiNotes.map(m => getFunctionalNoteName(m, currentKey, option.label));

            setCurrentQuestion({ ...option, midiNotes, noteStrings });
            setHistory(prev => [option.label, ...prev].slice(0, 5));

            setFeedback(`Identify the Secondary Dominant...`);
            fetAudio.playChord(noteStrings, '1n');
            setGameState('GUESSING');
        }, timeOffset + 1000);
    }, [currentKey, secondaryDominantOptions, history]);

    const handleCorrect = useCallback((question: any) => {
        setFeedback(`CORRECT: ${question.label}`);
        const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 2 : 4;
        addScore(Math.floor(200 * multiplier) + streak * 20);
        setGameState('RESOLVED');

        // Play resolution for pedagogical reinforcement
        const targetDegree = question.label.split('/')[1];
        const degrees: Record<string, number> = { 'ii': 1, 'iii': 2, 'IV': 3, 'V': 4, 'vi': 5 };
        const resolutionDegree = degrees[targetDegree];

        const scaleChords = getScaleChords(currentKey, 'Major', 3);
        const resolutionChord = scaleChords[resolutionDegree];
        const resNoteStrings = resolutionChord.midiNotes.map(m => getFunctionalNoteName(m, currentKey));

        setTimeout(() => {
            fetAudio.playChord(resNoteStrings, '2n');
        }, 500);

        setTimeout(playRound, 3500);
    }, [difficulty, streak, addScore, playRound, currentKey]);

    const handleIncorrect = useCallback((question: any) => {
        setFeedback('DISSONANT RECOGNITION');
        addScore(0);
        fetAudio.playChord(question.noteStrings, '4n');
    }, [addScore]);

    const handleGuess = (label: string) => {
        if (gameState !== 'GUESSING') return;
        if (label === currentQuestion.label) {
            handleCorrect(currentQuestion);
        } else {
            handleIncorrect(currentQuestion);
        }
    };

    // MIDI Input Support
    useEffect(() => {
        if (activeNotes.size >= 3 && gameState === 'GUESSING' && currentQuestion) {
            const playedMidi = Array.from(activeNotes).sort((a, b) => a - b);
            // Check if playing the right notes (normailzed to one octave for easier matching)
            const expectedPcs = new Set(currentQuestion.midiNotes.map((m: number) => m % 12));
            const playedPcs = new Set(playedMidi.map(m => m % 12));

            let matchCount = 0;
            playedPcs.forEach(pc => {
                if (expectedPcs.has(pc)) matchCount++;
            });

            if (matchCount >= 3 && playedPcs.size >= 3) {
                setMidiFeedback(`MIDI MATCH: ${currentQuestion.label}`);
                handleCorrect(currentQuestion);
            }
        }
    }, [activeNotes, gameState, currentQuestion, handleCorrect]);

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Secondary Dominants
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Recognize the temporary shift in tonal gravity towards non-tonic degrees.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-8 w-full">
                <div className="glass-panel p-10 rounded-[40px] border border-white/5 bg-white/[0.02] w-full shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 text-white/5">
                        <Network size={120} />
                    </div>

                    <div className="h-32 flex flex-col items-center justify-center relative z-10">
                        {gameState === 'IDLE' ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={playRound}
                                className="px-14 py-5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black rounded-full text-xl shadow-[0_20px_40px_rgba(220,38,38,0.2)] transition-all border border-red-400/20 uppercase tracking-widest italic"
                            >
                                START DOMINANT DRILL
                            </motion.button>
                        ) : (
                            <div className="text-center space-y-2">
                                <motion.div
                                    key={feedback}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`text-3xl font-black tracking-tight uppercase italic ${gameState === 'RESOLVED' ? 'text-emerald-400' : 'text-white'}`}
                                >
                                    {feedback}
                                </motion.div>
                                {midiFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400"
                                    >
                                        <Keyboard size={12} className="inline mr-2" />
                                        {midiFeedback}
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {gameState === 'GUESSING' && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8"
                            >
                                {secondaryDominantOptions.map((opt, idx) => (
                                    <motion.button
                                        key={opt.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleGuess(opt.label)}
                                        className="group relative p-6 bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/50 rounded-2xl transition-all duration-300 shadow-lg text-center"
                                    >
                                        <div className="text-2xl font-black text-white group-hover:text-red-400 italic tracking-tight">{opt.label}</div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-black/30 p-6 rounded-3xl border border-white/5 text-center max-w-2xl backdrop-blur-sm"
            >
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-[1px] w-8 bg-white/10" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Harmonic Briefing</h4>
                    <div className="h-[1px] w-8 bg-white/10" />
                </div>
                <p className="text-sm text-white/40 leading-relaxed font-medium italic">
                    Identify the dominant chord resolving to a non-tonic degree. Listen for the chromatic leading tone.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/20 tracking-widest">
                    <Info size={12} />
                    Key: {currentKey} Major
                    <div className="w-1 h-1 rounded-full bg-white/10 mx-2" />
                    Input: UI Buttons / MIDI
                </div>
            </motion.div>

            {gameState !== 'IDLE' && (
                <button
                    className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                    onClick={playRound}
                >
                    REPLAY SEQUENCE
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all border border-white/5">
                        <Play size={18} />
                    </div>
                </button>
            )}
        </div>
    );
}
