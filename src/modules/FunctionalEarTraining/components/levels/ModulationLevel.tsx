import { useState, useEffect, useCallback } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { Shrink, ArrowRight, Info, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export function ModulationLevel() {
    const { addScore, difficulty, streak } = useFunctionalEarTrainingStore();
    const [startKey, setStartKey] = useState('C');
    const [targetKey, setTargetKey] = useState('G');
    const [targetDegree, setTargetDegree] = useState({ name: '1', interval: 0 });

    const [gameState, setGameState] = useState<'IDLE' | 'MODULATING' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        fetAudio.init();
    }, []);

    const playRound = useCallback(() => {
        setGameState('MODULATING');
        setFeedback('Establishing Original Key...');

        const key1 = KEYS[Math.floor(Math.random() * KEYS.length)];
        let key2 = KEYS[Math.floor(Math.random() * KEYS.length)];
        while (key1 === key2 || history.includes(`${key1}->${key2}`)) {
            key2 = KEYS[Math.floor(Math.random() * KEYS.length)];
        }

        setStartKey(key1);
        setTargetKey(key2);
        setHistory(prev => [`${key1}->${key2}`, ...prev].slice(0, 5));

        // 1. Play Cadence in Key 1
        fetAudio.playCadence([`${key1}3`, `${key1}4`], '2n');

        setTimeout(() => {
            setFeedback('Modulating... (Listen for new Center)');
            // 2. Play Cadence in Key 2
            fetAudio.playCadence([`${key2}3`, `${key2}4`], '2n');

            setTimeout(() => {
                // 3. Play Target Note in Key 2 context
                const degrees = [
                    { name: '1', interval: 0 },
                    { name: '3', interval: 4 },
                    { name: '5', interval: 7 }
                ];
                const target = degrees[Math.floor(Math.random() * degrees.length)];
                setTargetDegree(target);

                // Note: Modulation logic usually works best with degrees relative to new key
                setFeedback('Identify scale degree in NEW Key');
                setGameState('GUESSING');

                // Simple simulation playing the root of Key 2 for now
                fetAudio.playTarget(`${key2}4`, '2n');

            }, 2000);
        }, 2000);
    }, [history]);

    const handleGuess = (degree: string) => {
        if (gameState !== 'GUESSING') return;

        if (degree === targetDegree.name) {
            setFeedback(`PERCEPTUAL SHIFT COMPLETE: ${targetDegree.name}`);
            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
            addScore(Math.floor(150 * multiplier) + streak * 15);
            setGameState('RESOLVED');
            setTimeout(playRound, 2000);
        } else {
            setFeedback('TONAL DISORIENTATION');
            addScore(0);
        }
    };

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Modulation Matrix
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Recalibrate your internal reference point across shifting centers.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-8 w-full">
                <div className="glass-panel p-10 rounded-[40px] border border-white/5 bg-white/[0.02] w-full shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 text-white/5">
                        <Shrink size={120} />
                    </div>

                    <div className="h-32 flex flex-col items-center justify-center relative z-10">
                        {gameState === 'IDLE' ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={playRound}
                                className="px-14 py-5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black rounded-full text-xl shadow-[0_20px_40px_rgba(147,51,234,0.2)] transition-all border border-purple-400/20 uppercase tracking-widest italic"
                            >
                                START SHIFT DRILL
                            </motion.button>
                        ) : (
                            <div className="text-center space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-center gap-6"
                                >
                                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 font-black text-3xl italic text-white/40">
                                        {startKey}
                                    </div>
                                    <ArrowRight className="text-purple-400" />
                                    <div className="px-6 py-3 bg-purple-500/20 rounded-2xl border border-purple-500/50 font-black text-3xl italic text-white">
                                        {gameState === 'MODULATING' ? '??' : targetKey}
                                    </div>
                                </motion.div>
                                <motion.div
                                    key={feedback}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`text-2xl font-black tracking-tight uppercase italic ${gameState === 'RESOLVED' ? 'text-emerald-400' : 'text-white'}`}
                                >
                                    {feedback}
                                </motion.div>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {gameState === 'GUESSING' && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
                            >
                                {['1', '3', '5'].map((d, idx) => (
                                    <motion.button
                                        key={d}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleGuess(d)}
                                        className="group relative p-8 bg-white/[0.03] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/50 rounded-[32px] transition-all duration-300 shadow-lg text-center overflow-hidden"
                                    >
                                        <div className="relative z-10 text-4xl font-black text-white group-hover:text-purple-400 italic">
                                            {d}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Tactical Briefing</h4>
                    <div className="h-[1px] w-8 bg-white/10" />
                </div>
                <p className="text-sm text-white/40 leading-relaxed font-medium italic">
                    Train your harmonic spatial awareness by identifying common degrees in a newly established tonal environment.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/20 tracking-widest">
                    <Info size={12} />
                    Dynamic Key Modulation
                    <div className="w-1 h-1 rounded-full bg-white/10 mx-2" />
                    <Music size={12} /> 1-3-5 Recognition
                </div>
            </motion.div>

            <button
                className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                onClick={() => setGameState('IDLE')}
            >
                RESET VORTEX
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all border border-white/5">
                    <ArrowRight size={18} />
                </div>
            </button>
        </div>
    );
}
