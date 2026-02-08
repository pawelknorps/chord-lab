import { useState, useEffect, useCallback } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';

export function InterferenceLevel() {
    const { addScore, streak } = useFunctionalEarTrainingStore();
    const [gameState, setGameState] = useState<'IDLE' | 'LISTENING' | 'DISTRACTED' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');
    const [targetNote, setTargetNote] = useState('C4');

    useEffect(() => {
        fetAudio.init();
    }, []);

    const playRound = useCallback(() => {
        setGameState('LISTENING');
        setFeedback('Memorize the Key Center...');

        // 1. Establish Key (C Major)
        fetAudio.playCadence(['C3', 'E3', 'G3', 'C4'], '2n');

        setTimeout(() => {
            setGameState('DISTRACTED');
            setFeedback('Wait for it...');

            // 2. Play Interference (Noise/Atonal)
            fetAudio.playInterference('8n');

            setTimeout(() => {
                setGameState('GUESSING');
                setFeedback('Identify the note relative to ORIGINAL key');

                // Play Target (e.g., F#)
                const targets = [
                    { note: 'F#4', degree: '#4' },
                    { note: 'Bb3', degree: 'b7' },
                    { note: 'Ab3', degree: 'b6' }
                ];
                const t = targets[Math.floor(Math.random() * targets.length)];
                setTargetNote(t.degree);
                fetAudio.playTarget(t.note, '2n');

            }, 2000); // 2 second delay/distraction
        }, 2000);
    }, []);

    const handleGuess = (guess: string) => {
        if (gameState !== 'GUESSING') return;

        if (guess === targetNote) {
            setFeedback('Correct! You held the tonal center.');
            addScore(25 + streak * 10);
            setGameState('RESOLVED');
            setTimeout(playRound, 2000);
        } else {
            setFeedback('Incorrect.');
            addScore(0);
        }
    };

    return (
        <div className="w-full max-w-2xl text-center space-y-8">
            <div className="h-32 flex items-center justify-center">
                {gameState === 'IDLE' && (
                    <button
                        onClick={playRound}
                        className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-2xl text-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
                    >
                        Start Interference Drill
                    </button>
                )}
                {gameState === 'DISTRACTED' && (
                    <div className="text-4xl animate-ping text-red-500">⚡ DISTRACTION ⚡</div>
                )}
                {gameState !== 'IDLE' && gameState !== 'DISTRACTED' && (
                    <div className="text-2xl font-bold text-white">
                        {feedback}
                    </div>
                )}
            </div>

            {gameState === 'GUESSING' && (
                <div className="grid grid-cols-3 gap-4">
                    {['#4', 'b7', 'b6'].map(d => (
                        <button
                            key={d}
                            onClick={() => handleGuess(d)}
                            className="p-6 bg-white/5 hover:bg-red-500/20 border border-white/10 rounded-xl transition-all"
                        >
                            <div className="text-xl font-bold text-white mb-1">{d}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
