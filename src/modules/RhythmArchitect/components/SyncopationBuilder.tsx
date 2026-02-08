import { useState, useEffect } from 'react';
import { MetronomeEngine } from '../../../utils/rhythmEngine';
import { Play, Square, Ghost, Zap, VolumeX, Shuffle } from 'lucide-react';

const engine = new MetronomeEngine();

// 0 = Rest, 1 = Ghost, 2 = Accent
const DEFAULT_PATTERN = [2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1];

export default function SyncopationBuilder() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(100);
    const [swing, setSwing] = useState(0);
    const [pattern, setPattern] = useState<number[]>(DEFAULT_PATTERN);

    useEffect(() => {
        engine.setPattern(pattern);
        // Clean up
        return () => engine.stop();
    }, []); // Init

    useEffect(() => {
        if (isPlaying) {
            engine.setPattern(pattern);
        }
    }, [pattern]);

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
        } else {
            engine.setBpm(bpm);
            engine.setSwing(swing);
            engine.setPattern(pattern);
            engine.start();
            setIsPlaying(true);
        }
    };

    const handleStepClick = (index: number) => {
        const newPattern = [...pattern];
        // Cycle: 2 (Accent) -> 1 (Ghost) -> 0 (Rest) -> 2
        let nextVal = 0;
        if (newPattern[index] === 2) nextVal = 1;
        else if (newPattern[index] === 1) nextVal = 0;
        else nextVal = 2;

        newPattern[index] = nextVal;
        setPattern(newPattern);
    };

    const handleBpmChange = (val: number) => {
        setBpm(val);
        engine.setBpm(val);
    };

    const handleSwingChange = (val: number) => {
        setSwing(val);
        engine.setSwing(val);
    };

    const randomizeGroove = () => {
        const newPattern = pattern.map(() => {
            const r = Math.random();
            if (r > 0.8) return 2; // Accent
            if (r > 0.4) return 1; // Ghost
            return 0; // Rest
        });
        setPattern(newPattern);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Syncopation Builder</h2>
                <p className="text-white/50">Construct grooves using Accents, Ghost Notes, and Rests.</p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-6 items-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <button
                    onClick={togglePlay}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isPlaying
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
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
                            className="w-48 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-2xl font-mono text-amber-400 w-16 text-right">{bpm}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider font-bold">Swing</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={swing}
                        onChange={(e) => handleSwingChange(Number(e.target.value))}
                        className="w-32 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>

                <button
                    onClick={randomizeGroove}
                    className="flex flex-col items-center gap-1 group"
                >
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-all">
                        <Shuffle size={20} className="text-amber-400" />
                    </div>
                    <span className="text-[10px] uppercase text-white/40 font-bold group-hover:text-white transition-colors">Random</span>
                </button>
            </div>

            {/* Step Grid */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div className={`h-full bg-amber-500 transition-all duration-[2.4s] linear ${isPlaying ? 'w-full' : 'w-0'}`} />
                </div>
                {/* 16 steps, grouped by 4 beats */}
                {[0, 1, 2, 3].map(beat => (
                    <div key={beat} className="flex gap-2 p-2 bg-black/20 rounded-lg">
                        {[0, 1, 2, 3].map(sub => {
                            const index = beat * 4 + sub;
                            const val = pattern[index];
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleStepClick(index)}
                                    className={`
                                        w-full aspect-square rounded-md flex items-center justify-center transition-all
                                        ${val === 2 ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                                            val === 1 ? 'bg-white/20 text-white/70' :
                                                'bg-black/40 text-white/10'}
                                    `}
                                >
                                    {val === 2 && <Zap size={20} fill="currentColor" />}
                                    {val === 1 && <Ghost size={18} />}
                                    {val === 0 && <VolumeX size={16} />}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            <p className="text-center text-xs text-white/30">Click blocks to cycle: Accent (Yellow) &rarr; Ghost (Grey) &rarr; Rest (Black)</p>
        </div>
    );
}
