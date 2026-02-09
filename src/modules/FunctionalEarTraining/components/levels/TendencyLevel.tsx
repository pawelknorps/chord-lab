import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMidi } from '../../../../context/MidiContext';
import { Zap, ArrowRight, Keyboard, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Data: Functional Relationships (Key of C)
const TENDENCY_Pairs = [
    { target: 'F#4', resolution: 'G4', function: '#4 Lydian -> 5 Dominant', label: '#4 -> 5', semitones: 6 },
    { target: 'Db4', resolution: 'C4', function: 'b2 Phrygian -> 1 Tonic', label: 'b2 -> 1', semitones: 1 },
    { target: 'B3', resolution: 'C4', function: '7 Leading -> 1 Tonic', label: '7 -> 1', semitones: 11 },
    { target: 'Bb3', resolution: 'A3', function: 'b7 Mixolydian -> 6 submediant', label: 'b7 -> 6', semitones: 10 },
    { target: 'Ab3', resolution: 'G3', function: 'b6 Aeolian -> 5 Dominant', label: 'b6 -> 5', semitones: 8 },
    { target: 'Eb4', resolution: 'D4', function: 'b3 Minor -> 2 Supertonic', label: 'b3 -> 2', semitones: 3 },
    { target: 'A3', resolution: 'G3', function: '6 Major -> 5 Dominant', label: '6 -> 5', semitones: 9 },
    { target: 'F4', resolution: 'E4', function: '4 Subdominant -> 3 Mediant', label: '4 -> 3', semitones: 5 },
] as const;

export function TendencyLevel() {
    const { addScore, streak, difficulty } = useFunctionalEarTrainingStore();
    const { lastNote } = useMidi();
    const [currentPair, setCurrentPair] = useState<any>(null);
    const [gameState, setGameState] = useState<'IDLE' | 'LISTENING' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [midiFeedback, setMidiFeedback] = useState<string | null>(null);

    useEffect(() => {
        fetAudio.init();
    }, []);

    const playRound = useCallback(() => {
        setGameState('LISTENING');
        setFeedback('Listen to the Context...');
        setMidiFeedback(null);

        // 1. Establish Key (Cadence I-IV-V-I in C)
        fetAudio.playCadence(['C3', 'E3', 'G3', 'C4'], '2n');

        setTimeout(() => {
            // Pick a pair that hasn't been used recently
            let pair = TENDENCY_Pairs[Math.floor(Math.random() * TENDENCY_Pairs.length)];
            let attempts = 0;
            while (history.includes(pair.function) && attempts < 5 && TENDENCY_Pairs.length > 3) {
                pair = TENDENCY_Pairs[Math.floor(Math.random() * TENDENCY_Pairs.length)];
                attempts++;
            }

            setCurrentPair(pair);
            setHistory(prev => [pair.function, ...prev].slice(0, 5));

            setFeedback('Identify the Functional Tendency...');
            fetAudio.playTarget(pair.target, '2n');
            setGameState('GUESSING');
        }, 2200);
    }, [history]);

    const handleCorrect = useCallback((pair: any) => {
        setFeedback('PERFECT RESOLUTION');
        const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
        addScore(Math.floor(120 * multiplier) + streak * 10);
        setGameState('RESOLVED');
        fetAudio.playResolution(pair.target, pair.resolution);
        setTimeout(playRound, 3000);
    }, [difficulty, streak, addScore, playRound]);

    const handleIncorrect = useCallback((pair: any) => {
        setFeedback('HARMONIC COLLISION');
        addScore(0);
        fetAudio.playTarget(pair.target, '4n');
    }, [addScore]);

    const handleGuess = (guessFunction: string) => {
        if (gameState !== 'GUESSING') return;
        if (guessFunction === currentPair.function) {
            handleCorrect(currentPair);
        } else {
            handleIncorrect(currentPair);
        }
    };

    // MIDI Input Support
    useEffect(() => {
        if (lastNote && lastNote.type === 'noteon' && gameState === 'GUESSING' && currentPair) {
            const playedMidi = lastNote.note;
            const rootMidi = 60; // Middle C

            let diff = (playedMidi - rootMidi) % 12;
            if (diff < 0) diff += 12;

            if (diff === currentPair.semitones) {
                setMidiFeedback(`MATCH: ${currentPair.label}`);
                handleCorrect(currentPair);
            } else {
                const playedPair = TENDENCY_Pairs.find(p => p.semitones === diff);
                if (playedPair) {
                    setMidiFeedback(`PLAYED: ${playedPair.label}`);
                } else {
                    setMidiFeedback(`PLAYED: semitone ${diff}`);
                }
                handleIncorrect(currentPair);
            }
        }
    }, [lastNote, gameState, currentPair, handleCorrect, handleIncorrect]);

    const options = useMemo(() => {
        if (!currentPair) return [];
        // Get correct option + 3 random distractors
        const distractors = TENDENCY_Pairs.filter(p => p.function !== currentPair.function);
        const shuffled = distractors.sort(() => 0.5 - Math.random());
        const selected = [currentPair, ...shuffled.slice(0, 3)];
        return selected.sort(() => 0.5 - Math.random());
    }, [currentPair]);

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Functional Tendency
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Detect the inherent kinetic energy and gravitational pull of scale degrees.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-8 w-full">
                <div className="glass-panel p-10 rounded-[40px] border border-white/5 bg-white/[0.02] w-full shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 text-white/5">
                        <Zap size={120} />
                    </div>

                    <div className="h-32 flex flex-col items-center justify-center relative z-10">
                        {gameState === 'IDLE' ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={playRound}
                                className="px-14 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-black rounded-full text-xl shadow-[0_20px_40px_rgba(217,119,6,0.2)] transition-all border border-amber-400/20 uppercase tracking-widest italic"
                            >
                                START KINETIC DRILL
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
                                        className="text-xs font-black uppercase tracking-[0.3em] text-amber-400"
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
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8"
                            >
                                {options.map((p, idx) => (
                                    <motion.button
                                        key={p.function}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleGuess(p.function)}
                                        className="group relative p-8 bg-white/[0.03] hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/50 rounded-[32px] transition-all duration-300 shadow-lg text-left overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            <div className="text-2xl font-black text-white group-hover:text-amber-400 mb-1 italic tracking-tight">{p.function.split('->')[0]}</div>
                                            <div className="text-[10px] uppercase font-black text-white/20 tracking-[0.2em] group-hover:text-white/40 transition-colors">Resolves to {p.function.split('->')[1]}</div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Tactical Briefing</h4>
                    <div className="h-[1px] w-8 bg-white/10" />
                </div>
                <p className="text-sm text-white/40 leading-relaxed font-medium italic">
                    Identify how chromatic and diatonic notes exert pressure towards stable chord tones.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/20 tracking-widest">
                    <Info size={12} />
                    Context: C Major Cadence
                    <div className="w-1 h-1 rounded-full bg-white/10 mx-2" />
                    MIDI Capture: Active
                </div>
            </motion.div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                onClick={() => setGameState('IDLE')}
            >
                RE-SEQUENCE FIELD
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all border border-white/5">
                    <ArrowRight size={18} />
                </div>
            </button>
        </div>
    );
}
