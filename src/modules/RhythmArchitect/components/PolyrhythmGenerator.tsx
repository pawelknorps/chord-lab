import { useState, useEffect, useRef } from 'react';
import { PolyrhythmEngine } from '../../../utils/polyrhythmEngine';
import { Play, Square } from 'lucide-react';
import * as Tone from 'tone';

const engine = new PolyrhythmEngine();

export default function PolyrhythmGenerator() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(60);
    const [divA, setDivA] = useState(4);
    const [divB, setDivB] = useState(5);

    // Animation refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        return () => {
            engine.stop();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        } else {
            engine.setBpm(bpm);
            engine.setDivisions(divA, divB);
            engine.start();
            setIsPlaying(true);
            draw();
        }
    };

    const handleUpdate = (newA: number, newB: number) => {
        setDivA(newA);
        setDivB(newB);
        engine.setDivisions(newA, newB);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Visuals based on time
        // We synchronize precisely with Tone.Transport

        // Duration of 1 measure at BPM: (60/BPM) * 4
        // Be consistent with engine logic (1m = 4 beats)
        const beatDur = 60 / bpm;
        const duration = beatDur * 4;

        // Tone.Transport.seconds gives current audio time
        // We use modulo to wrap around the measure
        const time = Tone.Transport.seconds;

        // Ensure phase is 0-1
        // Floating point modulo can be tricky, but JS % operator works
        const phase = (time % duration) / duration;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radiusA = 100;
        const radiusB = 160;

        // Draw track A
        ctx.beginPath();
        ctx.strokeStyle = '#34d399'; // Emerald
        ctx.lineWidth = 2;
        ctx.arc(centerX, centerY, radiusA, 0, Math.PI * 2);
        ctx.stroke();

        // Draw hits A
        for (let i = 0; i < divA; i++) {
            const angle = (i / divA) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radiusA;
            const y = centerY + Math.sin(angle) * radiusA;
            ctx.beginPath();
            ctx.fillStyle = '#34d399';
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cursor A
        const angleA = phase * Math.PI * 2 - Math.PI / 2;
        const cursorAX = centerX + Math.cos(angleA) * radiusA;
        const cursorAY = centerY + Math.sin(angleA) * radiusA;
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(cursorAX, cursorAY, 8, 0, Math.PI * 2);
        ctx.fill();


        // Draw track B
        ctx.beginPath();
        ctx.strokeStyle = '#a78bfa'; // Purple
        ctx.lineWidth = 2;
        ctx.arc(centerX, centerY, radiusB, 0, Math.PI * 2);
        ctx.stroke();

        // Draw hits B
        for (let i = 0; i < divB; i++) {
            const angle = (i / divB) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radiusB;
            const y = centerY + Math.sin(angle) * radiusB;
            ctx.beginPath();
            ctx.fillStyle = '#a78bfa';
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cursor B
        // Same phase because they loop over same measure duration
        const cursorBX = centerX + Math.cos(angleA) * radiusB; // Same angle!
        const cursorBY = centerY + Math.sin(angleA) * radiusB;
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(cursorBX, cursorBY, 8, 0, Math.PI * 2);
        ctx.fill();


        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(draw);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 flex flex-col items-center">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Polyrhythm Generator</h2>
                <p className="text-white/50">Listen to two conflicting rhythms resolve over one measure.</p>
            </div>

            {/* Controls */}
            <div className="flex gap-8 items-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <button
                    onClick={togglePlay}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isPlaying
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30'
                        }`}
                >
                    {isPlaying ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={32} className="ml-1" />}
                </button>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-emerald-400 font-bold w-4">A</span>
                        <input
                            type="range" min="1" max="12"
                            value={divA} onChange={e => handleUpdate(Number(e.target.value), divB)}
                            className="accent-emerald-400"
                        />
                        <span className="text-xl font-mono text-white w-8">{divA}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-purple-400 font-bold w-4">B</span>
                        <input
                            type="range" min="1" max="12"
                            value={divB} onChange={e => handleUpdate(divA, Number(e.target.value))}
                            className="accent-purple-400"
                        />
                        <span className="text-xl font-mono text-white w-8">{divB}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 border-l border-white/10 pl-6">
                    <span className="text-xs text-white/50 uppercase font-bold">BPM</span>
                    <input
                        type="number"
                        value={bpm}
                        onChange={e => { setBpm(Number(e.target.value)); engine.setBpm(Number(e.target.value)); }}
                        className="w-16 bg-white/10 border border-white/20 rounded text-center text-white"
                    />
                </div>
            </div>

            {/* Visuals */}
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-[400px] h-[400px] bg-black/20 rounded-full border border-white/5"
            />
        </div>
    );
}
