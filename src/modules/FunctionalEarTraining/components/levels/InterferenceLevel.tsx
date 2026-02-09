import { useState, useEffect, useCallback } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMidi } from '../../../../context/MidiContext';
import { ShieldAlert, ArrowRight, Keyboard, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TARGETS = [
    { note: 'F#4', degree: '#4', semitones: 6, label: 'Augmented 4th' },
    { note: 'Bb3', degree: 'b7', semitones: 10, label: 'Minor 7th' },
    { note: 'Ab3', degree: 'b6', semitones: 8, label: 'Minor 6th' },
    { note: 'Db4', degree: 'b2', semitones: 1, label: 'Minor 2nd' },
    { note: 'Eb4', degree: 'b3', semitones: 3, label: 'Minor 3rd' },
] as const;

export function InterferenceLevel() {
    const { addScore, streak, difficulty } = useFunctionalEarTrainingStore();
    const { lastNote } = useMidi();
    const [gameState, setGameState] = useState<'IDLE' | 'LISTENING' | 'DISTRACTED' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');
    const [currentTarget, setCurrentTarget] = useState<any>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [midiFeedback, setMidiFeedback] = useState<string | null>(null);

    useEffect(() => {
        fetAudio.init();
    }, []);

    const playRound = useCallback(() => {
        setGameState('LISTENING');
        setFeedback('Internalize the Tonal Center...');
        setMidiFeedback(null);

        // 1. Establish Key (C Major)
        fetAudio.playCadence(['C3', 'E3', 'G3', 'C4'], '2n');

        setTimeout(() => {
            setGameState('DISTRACTED');
            setFeedback('FOCUS MAINTAINED?');

            // 2. Play Interference (Noise/Atonal)
            fetAudio.playInterference('4n');

            setTimeout(() => {
                // Pick target
                let t = TARGETS[Math.floor(Math.random() * TARGETS.length)];
                let attempts = 0;
                while (history.includes(t.degree) && attempts < 5 && TARGETS.length > 2) {
                    t = TARGETS[Math.floor(Math.random() * TARGETS.length)];
                    attempts++;
                }
                setCurrentTarget(t);
                setHistory(prev => [t.degree, ...prev].slice(0, 5));

                setGameState('GUESSING');
                setFeedback('Identify Note vs Original Key');
                fetAudio.playTarget(t.note, '2n');

            }, 2500); // Increased distraction time
        }, 2000);
    }, [history]);

    const handleCorrect = useCallback(() => {
        setFeedback('TONAL DEFIANCE ACHIEVED');
        const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
        addScore(Math.floor(200 * multiplier) + streak * 20);
        setGameState('RESOLVED');
        setTimeout(playRound, 2000);
    }, [difficulty, streak, addScore, playRound]);

    const handleIncorrect = useCallback(() => {
        setFeedback('CENTER LOST');
        addScore(0);
    }, [addScore]);

    const handleGuess = (degree: string) => {
        if (gameState !== 'GUESSING') return;
        if (degree === currentTarget.degree) {
            handleCorrect();
        } else {
            handleIncorrect();
        }
    };

    // MIDI Input Support
    useEffect(() => {
        if (lastNote && lastNote.type === 'noteon' && gameState === 'GUESSING' && currentTarget) {
            const playedMidi = lastNote.note;
            const rootMidi = 60; // Middle C

            let diff = (playedMidi - rootMidi) % 12;
            if (diff < 0) diff += 12;

            if (diff === currentTarget.semitones) {
                setMidiFeedback(`MATCH: ${currentTarget.degree}`);
                handleCorrect();
            } else {
                const playedT = TARGETS.find(t => t.semitones === diff);
                if (playedT) {
                    setMidiFeedback(`PLAYED: ${playedT.degree}`);
                } else {
                    setMidiFeedback(`PLAYED: semitone ${diff}`);
                }
                handleIncorrect();
            }
        }
    }, [lastNote, gameState, currentTarget, handleCorrect, handleIncorrect]);

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Interference Resistance
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Maintain structural integrity against harmonic dissonance.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-8 w-full">
                <div className="glass-panel p-10 rounded-[40px] border border-white/5 bg-white/[0.02] w-full shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 text-white/5">
                        <ShieldAlert size={120} />
                    </div>

                    <div className="h-32 flex flex-col items-center justify-center relative z-10">
                        {gameState === 'IDLE' ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={playRound}
                                className="px-14 py-5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-full text-xl shadow-[0_20px_40px_rgba(225,29,72,0.2)] transition-all border border-rose-400/20 uppercase tracking-widest italic"
                            >
                                START STRESS TEST
                            </motion.button>
                        ) : (
                            <div className="text-center space-y-2">
                                <motion.div
                                    key={feedback}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`text-3xl font-black tracking-tight uppercase italic ${gameState === 'DISTRACTED' ? 'text-rose-500 animate-pulse' : 'text-white'}`}
                                >
                                    {feedback}
                                </motion.div>
                                {midiFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs font-black uppercase tracking-[0.3em] text-rose-400"
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
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                            >
                                {TARGETS.map((t, idx) => (
                                    <motion.button
                                        key={t.degree}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleGuess(t.degree)}
                                        className="group relative p-8 bg-white/[0.03] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/50 rounded-[32px] transition-all duration-300 shadow-lg"
                                    >
                                        <div className="text-4xl font-black text-white group-hover:text-rose-400 mb-2 italic tracking-tighter">{t.degree}</div>
                                        <div className="text-[10px] uppercase font-black text-white/20 tracking-[0.2em] group-hover:text-white/40 transition-colors">{t.label}</div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400">Tactical Briefing</h4>
                    <div className="h-[1px] w-8 bg-white/10" />
                </div>
                <p className="text-sm text-white/40 leading-relaxed font-medium italic">
                    The cognitive load increases as the system attempts to displace your tonal center. Resist the modulation.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/20 tracking-widest">
                    <Info size={12} />
                    Context: Constant C Center
                    <div className="w-1 h-1 rounded-full bg-white/10 mx-2" />
                    MIDI Capture: Active
                </div>
            </motion.div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                onClick={() => setGameState('IDLE')}
            >
                RE-INITIALIZE CORES
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all border border-white/5">
                    <ArrowRight size={18} />
                </div>
            </button>
        </div>
    );
}
