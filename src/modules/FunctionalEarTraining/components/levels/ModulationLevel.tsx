import { useState, useEffect, useCallback } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';

const KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export function ModulationLevel() {
    const { addScore } = useFunctionalEarTrainingStore();
    const [startKey, setStartKey] = useState('C');
    const [targetKey, setTargetKey] = useState('G');
    const [targetDegree, setTargetDegree] = useState({ name: '1', interval: 0 });

    const [gameState, setGameState] = useState<'IDLE' | 'MODULATING' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetAudio.init();
    }, []);

    const playRound = useCallback(() => {
        setGameState('MODULATING');
        setFeedback('Establishing Original Key...');

        const key1 = KEYS[Math.floor(Math.random() * KEYS.length)];
        let key2 = KEYS[Math.floor(Math.random() * KEYS.length)];
        while (key1 === key2) key2 = KEYS[Math.floor(Math.random() * KEYS.length)];

        setStartKey(key1);
        setTargetKey(key2);

        // 1. Play Cadence in Key 1
        // Simplified: Just play Root-Fifth-Root for now to establish center
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

                // Calculate MIDI note: Root of Key2 + Interval
                // For MVP, using string concatenation is risky (e.g. C# + 4). 
                // In real app, use Tonal.js. 
                // For this mock, let's just play the root of Key 2 if target is 1
                // This is a placeholder for true transposition logic.

                setFeedback('Identify scale degree in NEW Key');
                setGameState('GUESSING');

                // Actually playing the note requires a proper Pitch class library
                // We'll simulate by playing just the root for testing "1", or 5th for "5"
                // This logic needs Tonal.js hookup later.
                fetAudio.playTarget(`${key2}4`, '2n');

            }, 2000);
        }, 2000);
    }, []);

    const handleGuess = (degree: string) => {
        if (gameState !== 'GUESSING') return;

        // Mock logic: assumes we always ask for Root (1) in this prototype
        // Real implementation checks targetDegree.name
        if (degree === targetDegree.name) {
            setFeedback(`Correct! You found the ${targetDegree.name}.`);
            addScore(20);
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
                        className="px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-2xl text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all"
                    >
                        Start Modulation Drill
                    </button>
                )}

                {gameState !== 'IDLE' && (
                    <div className="space-y-2">
                        <div className="text-xl text-white/60">
                            {gameState === 'MODULATING' ? `${startKey} -> ???` : `${startKey} -> ${targetKey}`}
                        </div>
                        <div className="text-2xl font-bold text-white animate-pulse">
                            {feedback}
                        </div>
                    </div>
                )}
            </div>

            {gameState === 'GUESSING' && (
                <div className="grid grid-cols-3 gap-4">
                    {['1', '3', '5'].map(d => (
                        <button
                            key={d}
                            onClick={() => handleGuess(d)}
                            className="p-6 bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded-xl text-2xl font-bold text-white transition-all"
                        >
                            {d}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
