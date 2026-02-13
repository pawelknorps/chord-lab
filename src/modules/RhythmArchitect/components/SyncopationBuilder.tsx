import { useState, useEffect } from 'react';
import { MetronomeEngine } from '../../../utils/rhythmEngine';
import { Play, Square, Ghost, Zap, Shuffle, Trash2, Activity } from 'lucide-react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { useRhythmStore } from '../state/useRhythmStore';
import { useAudio } from '../../../context/AudioContext';

const engine = new MetronomeEngine();
const DEFAULT_PATTERN = [2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0];

export default function SyncopationLab() {
    const { bpm, setCurrentBpm, metronomeEnabled, setMetronomeEnabled } = useRhythmStore();
    const { startAudio } = useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const [pattern, setPattern] = useState<number[]>(DEFAULT_PATTERN);
    const [swing, setSwing] = useState(0);
    const [activeStep, setActiveStep] = useState(-1);

    useEffect(() => {
        return () => { engine.stop(); };
    }, []);

    useEffect(() => {
        if (isPlaying) engine.setPattern(pattern);
    }, [pattern, isPlaying]);

    const togglePlay = async () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
            setActiveStep(-1);
        } else {
            await startAudio();
            engine.metronomeEnabled = metronomeEnabled;
            engine.setBpm(bpm);
            engine.setSwing(swing);
            engine.setPattern(pattern);
            await engine.start();
            setIsPlaying(true);
            const scheduler = () => {
                if (Tone.Transport.state !== 'started') return;
                const dur = (60 / bpm) * 4;
                const stepIdx = Math.floor(((Tone.Transport.seconds % dur) / dur) * 16);
                setActiveStep(stepIdx);
                requestAnimationFrame(scheduler);
            };
            requestAnimationFrame(scheduler);
        }
    };

    return (
        <div className="flex flex-col gap-10 w-full max-w-6xl py-4 fade-in">
            <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-12">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
                                ${isPlaying ? 'bg-red-500 shadow-red-500/20 scale-95' : 'bg-indigo-500 shadow-indigo-500/20 hover:scale-105'}`}
                        >
                            {isPlaying ? <Square fill="currentColor" size={32} className="text-white" /> :
                                <Play fill="currentColor" size={40} className="text-white ml-2" />}
                        </button>

                        <button
                            onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest
                                ${metronomeEnabled ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20'}`}
                        >
                            <Activity size={14} />
                            Metronome: {metronomeEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                <span>Tempo</span>
                                <span className="text-white font-mono text-lg">{bpm}</span>
                            </div>
                            <input type="range" min="40" max="220" value={bpm} onChange={(e) => setCurrentBpm(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-amber-500">
                                <span>Swing Intensity</span>
                                <span className="text-white font-mono text-lg">{Math.round(swing * 100)}%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.01" value={swing} onChange={(e) => { setSwing(Number(e.target.value)); engine.setSwing(Number(e.target.value)); }} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-3">
                    {pattern.map((val, idx) => (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                const next = [...pattern];
                                next[idx] = (next[idx] + 2) % 3; // 2 -> 1 -> 0
                                setPattern(next);
                            }}
                            className={`aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2
                                ${activeStep === idx ? 'border-white scale-110 z-10 shadow-lg' : 'border-transparent'}
                                ${val === 2 ? 'bg-indigo-500 text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)]' :
                                    val === 1 ? 'bg-white/20 text-white/40' : 'bg-white/5 opacity-30 shadow-inner'}`}
                        >
                            <span className="text-[10px] font-black opacity-20">{idx + 1}</span>
                            {val === 2 ? <Zap size={14} fill="currentColor" /> : val === 1 ? <Ghost size={14} /> : <div className="w-1 h-1 rounded-full bg-white/20" />}
                        </motion.button>
                    ))}
                </div>

                <div className="flex justify-center gap-6 border-t border-white/5 pt-10">
                    <button onClick={() => setPattern(pattern.map(() => Math.random() > 0.7 ? 2 : Math.random() > 0.5 ? 1 : 0))} className="flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 transition-all">
                        <Shuffle size={14} className="text-indigo-400" /> Randomize Grain
                    </button>
                    <button onClick={() => setPattern(new Array(16).fill(0))} className="flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 transition-all">
                        <Trash2 size={14} className="text-red-400" /> Clear Grid
                    </button>
                </div>
            </div>

            <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" /> Accent</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-white/20" /> Ghost</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-white/5" /> Rest</div>
            </div>
        </div>
    );
}
