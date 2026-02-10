import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Activity, Gauge, Cpu } from 'lucide-react';

export function PerformanceMonitor() {
    const [renderCount, setRenderCount] = useState(0);
    const [fps, setFps] = useState(0);
    const [audioState, setAudioState] = useState('suspended');
    const [isVisible, setIsVisible] = useState(false);

    const frames = useRef(0);
    const lastTime = useRef(performance.now());
    const renderTracker = useRef(0);

    // Track re-renders
    renderTracker.current++;

    useEffect(() => {
        // Only show in development
        if (process.env.NODE_ENV === 'production') return;

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'p') {
                setIsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);

        const interval = setInterval(() => {
            // Update FPS
            const now = performance.now();
            const delta = now - lastTime.current;
            if (delta >= 1000) {
                setFps(Math.round((frames.current * 1000) / delta));
                frames.current = 0;
                lastTime.current = now;
            }

            // Update Audio state
            setAudioState(Tone.context.state);
            setRenderCount(renderTracker.current);
        }, 1000);

        const frame = () => {
            frames.current++;
            requestAnimationFrame(frame);
        };
        const rafId = requestAnimationFrame(frame);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            clearInterval(interval);
            cancelAnimationFrame(rafId);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl min-w-[200px] animate-fade-in font-mono text-[10px]">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase tracking-widest font-black">Performance</span>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                        <Activity size={12} className="text-blue-400" />
                        <span>Re-renders</span>
                    </div>
                    <span className="text-white font-bold">{renderCount}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                        <Gauge size={12} className="text-purple-400" />
                        <span>FPS</span>
                    </div>
                    <span className={`font-bold ${fps < 50 ? 'text-amber-500' : 'text-emerald-400'}`}>{fps}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                        <Cpu size={12} className="text-cyan-400" />
                        <span>Audio Engine</span>
                    </div>
                    <span className={`font-bold uppercase ${audioState === 'running' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {audioState}
                    </span>
                </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/5 text-[8px] text-white/20 text-center uppercase tracking-tighter">
                Press Ctrl+P to hide
            </div>
        </div>
    );
}
