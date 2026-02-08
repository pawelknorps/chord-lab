import { useState, useEffect, useCallback } from 'react';
import { fetAudio } from '../../audio/AudioEngine';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';

// Data: Functional Relationships (Key of C)
const TENDENCY_Pairs = [
    { target: 'F#4', resolution: 'G4', function: '#4 Lydian -> 5 Dominant', interval: 'Aug 4th' },
    { target: 'Db4', resolution: 'C4', function: 'b2 Phrygian -> 1 Tonic', interval: 'Min 2nd' },
    { target: 'B3', resolution: 'C4', function: '7 Leading -> 1 Tonic', interval: 'Maj 7th' },
    { target: 'Bb3', resolution: 'A3', function: 'b7 Mixolydian -> 6 (Rel Min)', interval: 'Min 7th' },
    // Simplified for MVP. Ideally calculated relative to Key Center.
];

export function TendencyLevel() {
    const { addScore, streak } = useFunctionalEarTrainingStore();
    const [currentPair, setCurrentPair] = useState(TENDENCY_Pairs[0]);
    const [gameState, setGameState] = useState<'IDLE' | 'LISTENING' | 'GUESSING' | 'RESOLVED'>('IDLE');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetAudio.init();
    }, []);

    const playRound = useCallback(() => {
        setGameState('LISTENING');
        setFeedback('Listen to the Context...');

        // 1. Establish Key (Cadence I-IV-V-I in C)
        fetAudio.playCadence(['C3', 'E3', 'G3', 'C4'], '2n');

        setTimeout(() => {
            // 2. Play Target Note (Strip context)
            // Pick random pair
            const pair = TENDENCY_Pairs[Math.floor(Math.random() * TENDENCY_Pairs.length)];
            setCurrentPair(pair);

            setFeedback('Identify the Functional Tendency...');
            fetAudio.playTarget(pair.target, '2n');
            setGameState('GUESSING');
        }, 2000);
    }, []);

    const handleGuess = (guessFunction: string) => {
        if (gameState !== 'GUESSING') return;

        if (guessFunction === currentPair.function) {
            setFeedback('Correct! Listen to the Resolution.');
            addScore(10 + streak * 5);
            setGameState('RESOLVED');
            fetAudio.playResolution(currentPair.target, currentPair.resolution);
            setTimeout(() => {
                playRound();
            }, 3000);
        } else {
            setFeedback('Incorrect. Try again.');
            addScore(0); // Reset streak/combo logic might handle this
            // Replay target
            fetAudio.playTarget(currentPair.target, '4n');
        }
    };

    return (
        <div className="w-full max-w-2xl text-center space-y-8">
            <div className="h-32 flex items-center justify-center">
                {gameState === 'IDLE' && (
                    <button
                        onClick={playRound}
                        className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-2xl text-xl shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all transform hover:scale-105"
                    >
                        Start Training
                    </button>
                )}

                {gameState !== 'IDLE' && (
                    <div className="space-y-2">
                        <div className={`text-2xl font-bold ${gameState === 'RESOLVED' ? 'text-green-400' : 'text-white'}`}>
                            {feedback}
                        </div>
                        <div className="flex justify-center gap-2">
                            {/* Visualizer Placeholder */}
                            <div className={`w-4 h-4 rounded-full ${gameState === 'LISTENING' ? 'bg-cyan-400 animate-ping' : 'bg-white/20'}`} />
                            <div className={`w-4 h-4 rounded-full ${gameState === 'GUESSING' ? 'bg-purple-400 animate-bounce' : 'bg-white/20'}`} />
                            <div className={`w-4 h-4 rounded-full ${gameState === 'RESOLVED' ? 'bg-green-400' : 'bg-white/20'}`} />
                        </div>
                    </div>
                )}
            </div>

            {gameState !== 'IDLE' && (
                <div className="grid grid-cols-2 gap-4">
                    {TENDENCY_Pairs.map(p => (
                        <button
                            key={p.function}
                            onClick={() => handleGuess(p.function)}
                            disabled={gameState !== 'GUESSING'}
                            className={`
                                p-6 rounded-xl border border-white/10 transition-all
                                ${gameState === 'GUESSING'
                                    ? 'bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 cursor-pointer'
                                    : 'opacity-50 cursor-not-allowed'}
                            `}
                        >
                            <div className="text-lg font-bold text-white mb-1">{p.function.split('->')[0]}</div>
                            <div className="text-xs text-white/40">Resolves to {p.function.split('->')[1]}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
