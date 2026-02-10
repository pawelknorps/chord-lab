import { useState, useEffect, useRef } from 'react';
import { PolyrhythmEngine } from '../../../utils/polyrhythmEngine';
import { Play, Square, Trophy, Activity } from 'lucide-react';
import * as Tone from 'tone';
import { useRhythmStore } from '../state/useRhythmStore';

const engine = new PolyrhythmEngine();

const POLY_CHALLENGES: Record<string, any[]> = {
    Novice: [
        { a: 3, b: 2, name: '3:2 Polyrhythm' },
        { a: 2, b: 3, name: '2:3 Polyrhythm' },
    ],
    Intermediate: [
        { a: 3, b: 4, name: '3:4 Polyrhythm' },
        { a: 4, b: 3, name: '4:3 Polyrhythm' },
        { a: 5, b: 4, name: '5:4 Polyrhythm' },
    ],
    Advanced: [
        { a: 4, b: 5, name: '4:5 Polyrhythm' },
        { a: 5, b: 3, name: '5:3 Polyrhythm' },
        { a: 7, b: 4, name: '7:4 Polyrhythm' },
    ],
    Pro: [
        { a: 7, b: 5, name: '7:5 Polyrhythm' },
        { a: 11, b: 8, name: '11:8 Polyrhythm' },
        { a: 13, b: 4, name: '13:4 Polyrhythm' },
    ],
    Virtuoso: [
        { a: 13, b: 7, name: '13:7 Polyrhythm' },
        { a: 17, b: 4, name: '17:4 Polyrhythm' },
        { a: 19, b: 12, name: '19:12 Polyrhythm' },
    ]
};

export default function PolyrhythmLab() {
    const { bpm, setCurrentBpm, difficulty, metronomeEnabled, setMetronomeEnabled } = useRhythmStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [divA, setDivA] = useState(3);
    const [divB, setDivB] = useState(2);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isPlayingRef = useRef(false);
    const stateRef = useRef({ divA, divB, bpm });

    useEffect(() => {
        stateRef.current = { divA, divB, bpm };
        if (isPlaying) {
            engine.setDivisions(divA, divB);
            engine.setBpm(bpm);
        }
    }, [divA, divB, bpm, isPlaying]);

    useEffect(() => {
        return () => {
            isPlayingRef.current = false;
            engine.stop();
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            isPlayingRef.current = false;
            engine.stop();
            setIsPlaying(false);
        } else {
            engine.metronomeEnabled = metronomeEnabled;
            engine.setBpm(bpm);
            engine.setDivisions(divA, divB);
            engine.start();
            isPlayingRef.current = true;
            setIsPlaying(true);
            requestAnimationFrame(draw);
        }
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0] && canvasRef.current) {
                const { width } = entries[0].contentRect;
                canvasRef.current.width = width * window.devicePixelRatio;
                canvasRef.current.height = width * window.devicePixelRatio;
                if (isPlayingRef.current) requestAnimationFrame(draw);
            }
        });

        const container = canvasRef.current?.parentElement;
        if (container) resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    const draw = () => {
        if (!isPlayingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { divA, divB, bpm } = stateRef.current;
        const duration = (60 / bpm) * 4;
        const phase = (Tone.Transport.seconds % duration) / duration;

        // Clear with slight fade for trails if desired, or just clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const size = canvas.width;
        const cx = size / 2;
        const cy = size / 2;

        // Scale factor to keep everything relative to canvas size
        const scale = size / 500;

        // Draw Rings
        [
            { r: 120 * scale, div: divA, color: '#6366f1' },
            { r: 180 * scale, div: divB, color: '#a855f7' }
        ].forEach(target => {
            ctx.beginPath();
            ctx.strokeStyle = `${target.color}30`;
            ctx.lineWidth = 3 * scale;
            ctx.arc(cx, cy, target.r, 0, Math.PI * 2);
            ctx.stroke();

            for (let i = 0; i < target.div; i++) {
                const angle = (i / target.div) * Math.PI * 2 - Math.PI / 2;
                const x = cx + Math.cos(angle) * target.r;
                const y = cy + Math.sin(angle) * target.r;

                const hitPhase = i / target.div;
                const dist = Math.abs(phase - hitPhase);
                const isHit = dist < 0.02 || dist > 0.98;

                // Marker dot
                ctx.beginPath();
                ctx.fillStyle = isHit ? target.color : `${target.color}60`;
                ctx.arc(x, y, isHit ? 14 * scale : 6 * scale, 0, Math.PI * 2);
                if (isHit) {
                    ctx.shadowBlur = 50 * scale;
                    ctx.shadowColor = target.color;

                    // Ripple effect
                    ctx.beginPath();
                    ctx.strokeStyle = target.color;
                    ctx.lineWidth = 2 * scale;
                    ctx.arc(x, y, 25 * scale, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                // Numeric label
                ctx.font = `black ${12 * scale}px Inter, sans-serif`;
                ctx.fillStyle = isHit ? '#fff' : `${target.color}90`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const labelX = cx + Math.cos(angle) * (target.r + 30 * scale);
                const labelY = cy + Math.sin(angle) * (target.r + 30 * scale);
                ctx.fillText((i + 1).toString(), labelX, labelY);
            }

            // Draw Head
            const headAngle = phase * Math.PI * 2 - Math.PI / 2;
            const hx = cx + Math.cos(headAngle) * target.r;
            const hy = cy + Math.sin(headAngle) * target.r;

            // Glow for head
            ctx.shadowBlur = 20 * scale;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.arc(hx, hy, 8 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(draw);
    };

    return (
        <div className="flex flex-col gap-10 w-full max-w-7xl py-4 fade-in">
            <div className="flex flex-col xl:flex-row gap-12 items-start">
                {/* Visualization */}
                <div className="flex-1 w-full bg-black/60 rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl flex items-center justify-center aspect-square md:aspect-video xl:aspect-square relative overflow-hidden min-h-[500px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
                    <canvas ref={canvasRef} className="w-full h-full relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />

                    <div className="absolute top-10 left-10 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
                            <span className="text-[12px] font-black uppercase tracking-widest text-white/50">Division A: {divA}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
                            <span className="text-[12px] font-black uppercase tracking-widest text-white/50">Division B: {divB}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 shadow-xl space-y-10">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={togglePlay}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
                                    ${isPlaying ? 'bg-red-500 shadow-red-500/20 scale-95' : 'bg-indigo-500 shadow-indigo-500/20 hover:scale-105'}`}
                            >
                                {isPlaying ? <Square fill="currentColor" size={32} className="text-white" /> :
                                    <Play fill="currentColor" size={40} className="text-white ml-2" />}
                            </button>

                            <div className="flex flex-col gap-4">
                                {/* Metronome Toggle */}
                                <button
                                    onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest
                                        ${metronomeEnabled ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20'}`}
                                >
                                    <Activity size={14} />
                                    Metronome: {metronomeEnabled ? 'ON' : 'OFF'}
                                </button>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                        <span>TEMPO</span>
                                        <span className="text-white font-mono text-lg">{bpm}</span>
                                    </div>
                                    <input type="range" min="30" max="240" value={bpm} onChange={(e) => setCurrentBpm(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 border-t border-white/5 pt-10">
                            {[
                                { label: 'DIVISION A', val: divA, setter: setDivA, color: 'indigo' },
                                { label: 'DIVISION B', val: divB, setter: setDivB, color: 'purple' }
                            ].map(row => (
                                <div key={row.label} className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                                        <span>{row.label}</span>
                                        <span className={`text-${row.color}-400 font-mono text-xl`}>{row.val}</span>
                                    </div>
                                    <input type="range" min="2" max="24" value={row.val} onChange={(e) => row.setter(Number(e.target.value))} className={`w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-${row.color}-500`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 shadow-xl space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Trophy size={14} className="text-amber-500" /> {difficulty} Challenges
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {(POLY_CHALLENGES[difficulty] || POLY_CHALLENGES.Novice).map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => { setDivA(c.a); setDivB(c.b); }}
                                    className="group flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 hover:bg-white/10 rounded-2xl transition-all"
                                >
                                    <div className="text-left">
                                        <div className="text-white font-bold text-sm group-hover:text-indigo-400 transition-colors">{c.name}</div>
                                        <div className="text-[9px] text-white/20 uppercase tracking-widest mt-1">Difficulty Weight: {c.a + c.b}</div>
                                    </div>
                                    <div className="text-2xl font-black italic tracking-tighter text-white/10 group-hover:text-white/40 transition-all">{c.a}:{c.b}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
