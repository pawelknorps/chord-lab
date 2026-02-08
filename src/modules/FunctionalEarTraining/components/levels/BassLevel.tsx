import { useState, useEffect, useCallback } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';

const BASS_Exams = {
    Novice: [
        { label: 'Degree 1 (Root)', bassDegree: '1', function: 'Tonic', notes: ['C3', 'E3', 'G3'] },
        { label: 'Degree 4', bassDegree: '4', function: 'Subdominant', notes: ['F2', 'F3', 'A3', 'C4'] },
        { label: 'Degree 5', bassDegree: '5', function: 'Dominant', notes: ['G2', 'G3', 'B3', 'D4'] },
    ],
    Advanced: [
        { label: 'Degree 3 (1st Inv)', bassDegree: '3', function: 'Tonic Inv', notes: ['E3', 'C4', 'G4'] },
        { label: 'Degree 7 (Leading)', bassDegree: '7', function: 'Dom Inv', notes: ['B2', 'G3', 'D4'] },
        { label: 'Degree 6', bassDegree: '6', function: 'Submediant', notes: ['A2', 'C4', 'E4'] },
        { label: 'Degree 2', bassDegree: '2', function: 'Supertonic', notes: ['D3', 'F3', 'A3'] },
    ],
    Pro: [
        { label: 'b2 (Neapolitan)', bassDegree: 'b2', function: 'N6', notes: ['Db3', 'F4', 'Ab4'] },
        { label: 'b6 (Submediant)', bassDegree: 'b6', function: 'Modal Interchange', notes: ['Ab2', 'C4', 'Eb4'] },
        { label: '#4 (Lydian/Dim)', bassDegree: '#4', function: 'Passing/Applied', notes: ['F#2', 'A3', 'C4', 'Eb4'] },
        { label: 'b7', bassDegree: 'b7', function: 'Subtonic/Mixolydian', notes: ['Bb2', 'D4', 'F4'] },
    ]
};

export function BassLevel() {
    const { addScore, streak, difficulty } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();
    const [currentExam, setCurrentExam] = useState<any>(null);
    const [gameState, setGameState] = useState<'IDLE' | 'LISTENING' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetAudio.init();
    }, []);

    const playRound = useCallback(() => {
        setGameState('LISTENING');
        setFeedback('Listen to the Key...');

        // 1. Establish Key (C Major)
        fetAudio.playCadence(['C3', 'G3', 'C4', 'E4'], '2n');

        setTimeout(() => {
            const pool = BASS_Exams[difficulty];
            const exam = pool[Math.floor(Math.random() * pool.length)];
            setCurrentExam(exam);

            setFeedback('Identify the Bass Degree');
            fetAudio.playCadence(exam.notes, '1n');
            setGameState('GUESSING');
        }, 2200);
    }, [difficulty]);

    const handleGuess = (bassDegree: string) => {
        if (gameState !== 'GUESSING') return;

        const isCorrect = bassDegree === currentExam.bassDegree;
        const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;

        if (isCorrect) {
            setFeedback(`Correct! It's the ${currentExam.label}`);
            const points = Math.floor(10 * multiplier) + streak * 2;
            addScore(points);
            addExperience('FET', points * 5);
            updateStreak('FET', streak + 1);
            setGameState('RESOLVED');
            setTimeout(playRound, 2000);
        } else {
            setFeedback(`Incorrect. It was ${currentExam.bassDegree}.`);
            addScore(0);
            updateStreak('FET', 0);
            setGameState('RESOLVED');
            setTimeout(playRound, 3000);
        }
    };

    return (
        <div className="w-full max-w-2xl text-center space-y-12">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5">
                <div className="h-24 flex flex-col items-center justify-center">
                    {gameState === 'IDLE' ? (
                        <button
                            onClick={playRound}
                            className="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full text-xl shadow-[0_0_30px_rgba(8,145,178,0.3)] transition-all active:scale-95"
                        >
                            Start {difficulty} Bass Drill
                        </button>
                    ) : (
                        <div className="animate-reveal text-2xl font-bold text-white tracking-tight">
                            {feedback}
                        </div>
                    )}
                </div>

                {gameState === 'GUESSING' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        {BASS_Exams[difficulty].map(e => (
                            <button
                                key={e.bassDegree}
                                onClick={() => handleGuess(e.bassDegree)}
                                className="group relative p-6 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all"
                            >
                                <div className="text-3xl font-black text-white group-hover:text-cyan-400 mb-1">{e.bassDegree}</div>
                                <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{e.function}</div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-left space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400">Level: {difficulty}</h4>
                <p className="text-sm text-white/40 leading-relaxed">
                    {difficulty === 'Novice' ? 'Identify fundamental functional degrees (1, 4, 5) to master harmonic foundations.' :
                        difficulty === 'Advanced' ? 'Introduce inversions and diatonic functions (2, 3, 6) to refine melodic bass hearing.' :
                            'Experience advanced harmonic movement with modal interchange and non-diatonic relationships.'}
                </p>
            </div>
        </div>
    );
}
