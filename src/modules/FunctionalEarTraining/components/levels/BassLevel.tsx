import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';
import { useMidi } from '../../../../context/MidiContext';
import { Anchor, ArrowRight, Keyboard, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASS_Exams = {
    Novice: [
        { label: 'Degree 1 (Root)', bassDegree: '1', function: 'Tonic', notes: ['C3', 'E3', 'G3'], semitones: 0 },
        { label: 'Degree 4', bassDegree: '4', function: 'Subdominant', notes: ['F2', 'F3', 'A3', 'C4'], semitones: 5 },
        { label: 'Degree 5', bassDegree: '5', function: 'Dominant', notes: ['G2', 'G3', 'B3', 'D4'], semitones: 7 },
    ],
    Advanced: [
        { label: 'Degree 3 (1st Inv)', bassDegree: '3', function: 'Tonic Inv', notes: ['E3', 'C4', 'G4'], semitones: 4 },
        { label: 'Degree 7 (Leading)', bassDegree: '7', function: 'Dom Inv', notes: ['B2', 'G3', 'D4'], semitones: 11 },
        { label: 'Degree 6', bassDegree: '6', function: 'Submediant', notes: ['A2', 'C4', 'E4'], semitones: 9 },
        { label: 'Degree 2', bassDegree: '2', function: 'Supertonic', notes: ['D3', 'F3', 'A3'], semitones: 2 },
    ],
    Pro: [
        { label: 'b2 (Neapolitan)', bassDegree: 'b2', function: 'N6', notes: ['Db3', 'F4', 'Ab4'], semitones: 1 },
        { label: 'b6 (Submediant)', bassDegree: 'b6', function: 'Modal Interchange', notes: ['Ab2', 'C4', 'Eb4'], semitones: 8 },
        { label: '#4 (Lydian/Dim)', bassDegree: '#4', function: 'Passing/Applied', notes: ['F#2', 'A3', 'C4', 'Eb4'], semitones: 6 },
        { label: 'b7', bassDegree: 'b7', function: 'Subtonic/Mixolydian', notes: ['Bb2', 'D4', 'F4'], semitones: 10 },
    ]
} as const;

export function BassLevel() {
    const { addScore, streak, difficulty } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();
    const { lastNote } = useMidi();
    const [currentExam, setCurrentExam] = useState<any>(null);
    const [gameState, setGameState] = useState<'IDLE' | 'LISTENING' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [midiFeedback, setMidiFeedback] = useState<string | null>(null);

    useEffect(() => {
        fetAudio.init();
    }, []);

    const playRound = useCallback(() => {
        setGameState('LISTENING');
        setFeedback('Listen to the Key...');
        setMidiFeedback(null);

        // 1. Establish Key (C Major)
        fetAudio.playCadence(['C3', 'G3', 'C4', 'E4'], '2n');

        setTimeout(() => {
            const pool = BASS_Exams[difficulty];

            // Avoid repetition
            let exam = pool[Math.floor(Math.random() * pool.length)];
            let attempts = 0;
            while (history.includes(exam.bassDegree) && attempts < 5 && pool.length > 2) {
                exam = pool[Math.floor(Math.random() * pool.length)];
                attempts++;
            }

            setCurrentExam(exam);
            setHistory(prev => [exam.bassDegree, ...prev].slice(0, 5));

            setFeedback('Identify the Bass Degree');
            fetAudio.playCadence(exam.notes as unknown as string[], '1n');
            setGameState('GUESSING');
        }, 2200);
    }, [difficulty, history]);

    const handleCorrect = useCallback((exam: any) => {
        setFeedback(`Excellent! It's the ${exam.label}`);
        const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;
        const points = Math.floor(100 * multiplier) + streak * 10;
        addScore(points);
        addExperience('FET', points / 2);
        updateStreak('FET', streak + 1);
        setGameState('RESOLVED');
        setTimeout(playRound, 2000);
    }, [difficulty, streak, addScore, addExperience, updateStreak, playRound]);

    const handleIncorrect = useCallback((bassDegree: string) => {
        setFeedback(`Incorrect - That was the ${bassDegree}.`);
        addScore(0);
        updateStreak('FET', 0);
        setGameState('RESOLVED');
        setTimeout(playRound, 3000);
    }, [addScore, updateStreak, playRound]);

    const handleGuess = (bassDegree: string) => {
        if (gameState !== 'GUESSING') return;
        const isCorrect = bassDegree === currentExam.bassDegree;
        if (isCorrect) {
            handleCorrect(currentExam);
        } else {
            handleIncorrect(currentExam.bassDegree);
        }
    };

    // MIDI Input Support
    useEffect(() => {
        if (lastNote && lastNote.type === 'noteon' && gameState === 'GUESSING' && currentExam) {
            const playedMidi = lastNote.note;
            const rootMidi = 48; // Middle C is 60, C3 is 48. Establish key is fixed at C for now.

            // Normalize to within one octave relative to C
            let diff = (playedMidi - rootMidi) % 12;
            if (diff < 0) diff += 12;

            if (diff === currentExam.semitones) {
                setMidiFeedback(`MATCH: Degree ${currentExam.bassDegree}`);
                handleCorrect(currentExam);
            } else {
                // Find what degree they played
                const playedExam = [...BASS_Exams.Novice, ...BASS_Exams.Advanced, ...BASS_Exams.Pro]
                    .find(e => e.semitones === diff);

                if (playedExam) {
                    setMidiFeedback(`PLAYED: Degree ${playedExam.bassDegree}`);
                } else {
                    setMidiFeedback(`PLAYED: semitone ${diff}`);
                }
                handleIncorrect(currentExam.bassDegree);
            }
        }
    }, [lastNote, gameState, currentExam, handleCorrect, handleIncorrect]);

    const levelInfo = useMemo(() => (
        difficulty === 'Novice' ? 'Root, Subdominant, and Dominant foundations.' :
            difficulty === 'Advanced' ? 'Inversions, submediant and supertonic colors.' :
                'Modal interchange, non-diatonic relationships and Neapolitan gravity.'
    ), [difficulty]);

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl fade-in relative z-10">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Bass Function
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Internalize the gravitational anchor of the harmonic field.
                </motion.p>
            </div>

            <div className="flex flex-col items-center gap-8 w-full">
                <div className="glass-panel p-10 rounded-[40px] border border-white/5 bg-white/[0.02] w-full shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 text-white/5">
                        <Anchor size={120} />
                    </div>

                    <div className="h-32 flex flex-col items-center justify-center relative z-10">
                        {gameState === 'IDLE' ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={playRound}
                                className="px-14 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-full text-xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all border border-blue-400/20 uppercase tracking-widest italic"
                            >
                                START {difficulty} DRILL
                            </motion.button>
                        ) : (
                            <div className="text-center space-y-2">
                                <motion.div
                                    key={feedback}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-3xl font-black text-white tracking-tight uppercase italic"
                                >
                                    {feedback}
                                </motion.div>
                                {midiFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400"
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
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
                            >
                                {BASS_Exams[difficulty].map((e, idx) => (
                                    <motion.button
                                        key={e.bassDegree}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleGuess(e.bassDegree)}
                                        className="group relative p-8 bg-white/[0.03] hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/50 rounded-[32px] transition-all duration-300 shadow-lg"
                                    >
                                        <div className="text-4xl font-black text-white group-hover:text-indigo-400 mb-2 italic tracking-tighter">{e.bassDegree}</div>
                                        <div className="text-[10px] uppercase font-black text-white/20 tracking-[0.2em] group-hover:text-white/40 transition-colors">{e.function}</div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Tactical Briefing</h4>
                    <div className="h-[1px] w-8 bg-white/10" />
                </div>
                <p className="text-sm text-white/40 leading-relaxed font-medium italic">
                    "{levelInfo}"
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/20 tracking-widest">
                    <Info size={12} />
                    Current Scale: C Major
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
