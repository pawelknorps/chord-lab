import { useState, useEffect, useRef } from 'react';
import { MetronomeEngine } from '../../../utils/rhythmEngine';
import { Play, Square, Shuffle } from 'lucide-react';

const engine = new MetronomeEngine();

export default function SubdivisionPyramid() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(100);
    const [swing, setSwing] = useState(0);
    const [activeSubdivision, setActiveSubdivision] = useState(4); // Default to 16th notes
    const [isRandomMode, setIsRandomMode] = useState(false);

    // Timer ref for random mode
    const randomTimerRef = useRef<number | null>(null);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            engine.stop();
            if (randomTimerRef.current) clearInterval(randomTimerRef.current);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
            if (randomTimerRef.current) {
                clearInterval(randomTimerRef.current);
                randomTimerRef.current = null;
            }
        } else {
            engine.setBpm(bpm);
            engine.setSwing(swing);
            engine.setSubdivision(activeSubdivision);
            engine.start();
            setIsPlaying(true);

            if (isRandomMode) {
                startRandomizer();
            }
        }
    };

    const startRandomizer = () => {
        if (randomTimerRef.current) clearInterval(randomTimerRef.current);

        // Random switch every 2-4 seconds (approx 1-2 bars at 120bpm)
        randomTimerRef.current = window.setInterval(() => {
            const nextSub = Math.floor(Math.random() * 7) + 1;
            handleSubdivisionChange(nextSub);
        }, 3000);
    };

    const handleBpmChange = (val: number) => {
        setBpm(val);
        engine.setBpm(val);
    };

    const handleSwingChange = (val: number) => {
        setSwing(val);
        engine.setSwing(val);
    };

    const handleSubdivisionChange = (sub: number) => {
        setActiveSubdivision(sub);
        engine.setSubdivision(sub);
    };

    const toggleRandomMode = () => {
        const newState = !isRandomMode;
        setIsRandomMode(newState);

        if (isPlaying) {
            if (newState) {
                startRandomizer();
            } else {
                if (randomTimerRef.current) {
                    clearInterval(randomTimerRef.current);
                    randomTimerRef.current = null;
                }
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Subdivision Pyramid</h2>
                <p className="text-white/50">Master the transition between rhythmic groupings.</p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-6 items-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <button
                    onClick={togglePlay}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isPlaying
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                        : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
                        }`}
                >
                    {isPlaying ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={32} className="ml-1" />}
                </button>

                <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider font-bold">Tempo</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="40"
                            max="200"
                            value={bpm}
                            onChange={(e) => handleBpmChange(Number(e.target.value))}
                            className="w-48 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-2xl font-mono text-emerald-400 w-16 text-right">{bpm}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider font-bold">Swing</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={swing}
                            onChange={(e) => handleSwingChange(Number(e.target.value))}
                            className="w-32 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-sm font-mono text-amber-400 w-12 text-right">{(swing * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Random Mode Toggle */}
            <div className="flex justify-center">
                <button
                    onClick={toggleRandomMode}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${isRandomMode
                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                        }`}
                >
                    <Shuffle size={18} className={isRandomMode ? 'animate-spin-slow' : ''} />
                    <span className="font-medium">Randomizer Mode</span>
                </button>
            </div>

            {/* Pyramid Visualization */}
            <div className="relative flex flex-col items-center gap-2 mt-8">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleSubdivisionChange(num)}
                        className={`
                            relative h-12 rounded-xl border flex items-center justify-center transition-all duration-200
                            ${activeSubdivision === num
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-105 z-10'
                                : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/20'
                            }
                        `}
                        style={{ width: `${100 - (num * 8)}%`, minWidth: '200px' }}
                    >
                        <span className="text-lg font-bold mr-2">{num}</span>
                        <span className="text-xs uppercase tracking-widest opacity-70">
                            {num === 1 ? 'Ta (1)' :
                                num === 2 ? 'Ta-Ka (2)' :
                                    num === 3 ? 'Ta-Ki-Ta (3)' :
                                        num === 4 ? 'Ta-Ka-Di-Mi (4)' :
                                            num === 5 ? 'Ta-Di-Gi-Na-Thom (5)' :
                                                num === 6 ? 'Ta-Ki-Ta-Ta-Ki-Ta (6)' : 'Ta-Ki-Ta-Ta-Ka-Di-Mi (7)'}
                        </span>

                        {/* Visual Beat Indicators */}
                        {activeSubdivision === num && isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-evenly opacity-30">
                                {Array.from({ length: num }).map((_, i) => (
                                    <div key={i} className="w-1 h-6 bg-cyan-400 rounded-full animate-pulse"
                                        style={{ animationDelay: `${i * (60 / bpm / num)}s` }} // Rough visual approx
                                    />
                                ))}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
