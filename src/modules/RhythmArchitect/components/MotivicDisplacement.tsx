import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, ArrowRight, ArrowLeft } from 'lucide-react';

export default function MotivicDisplacement() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [pattern, setPattern] = useState<boolean[]>(new Array(16).fill(false));
    const [shift, setShift] = useState(0);

    // Audio
    const synthRef = useRef<Tone.MembraneSynth | null>(null);
    const loopRef = useRef<Tone.Sequence | null>(null);

    useEffect(() => {
        synthRef.current = new Tone.MembraneSynth().toDestination();
        return () => {
            synthRef.current?.dispose();
            loopRef.current?.dispose();
            Tone.Transport.stop();
        };
    }, []);

    useEffect(() => {
        if (loopRef.current) {
            loopRef.current.events = getShiftedPattern();
        }
    }, [pattern, shift]);

    const getShiftedPattern = () => {
        // Rotate the pattern array by 'shift' amount
        const len = pattern.length;
        // Normalize shift
        const s = ((shift % len) + len) % len;

        // Rotate: take last s elements and move to front
        const rightPart = pattern.slice(len - s);
        const leftPart = pattern.slice(0, len - s);
        const result = [...rightPart, ...leftPart];

        // Tone.Sequence expects array of notes or nulls.
        // We'll use "C2" for hit, null for rest.
        return result.map(hit => hit ? "C2" : null);
    };

    const togglePlay = async () => {
        if (isPlaying) {
            Tone.Transport.stop();
            loopRef.current?.stop();
            setIsPlaying(false);
        } else {
            await Tone.start();
            Tone.Transport.bpm.value = 100;

            if (loopRef.current) loopRef.current.dispose();

            const seq = getShiftedPattern();

            loopRef.current = new Tone.Sequence((time, note) => {
                if (note && synthRef.current) {
                    synthRef.current.triggerAttackRelease(note, "16n", time);
                }
            }, seq, "16n").start(0);

            Tone.Transport.start();
            setIsPlaying(true);
        }
    };

    const handleStepClick = (index: number) => {
        const newP = [...pattern];
        newP[index] = !newP[index];
        setPattern(newP);
    };

    const handleShift = (dir: number) => {
        setShift(s => s + dir);
    };

    // Visualization of shifted pattern
    const shiftedPattern = (() => {
        const len = pattern.length;
        const s = ((shift % len) + len) % len;
        const rightPart = pattern.slice(len - s);
        const leftPart = pattern.slice(0, len - s);
        return [...rightPart, ...leftPart];
    })();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Motivic Displacement</h2>
                <p className="text-white/50">Shift a rhythmic motive across the bar line.</p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-6 items-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <button
                    onClick={togglePlay}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isPlaying
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-pink-500/20 text-pink-500 hover:bg-pink-500/30'
                        }`}
                >
                    {isPlaying ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={32} className="ml-1" />}
                </button>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl">
                    <button
                        onClick={() => handleShift(-1)}
                        className="p-3 hover:bg-white/10 rounded-lg text-white transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center w-24">
                        <div className="text-xs text-white/50 uppercase font-bold">Shift</div>
                        <div className="text-xl font-bold text-pink-400">{shift > 0 ? `+${shift}` : shift}</div>
                    </div>
                    <button
                        onClick={() => handleShift(1)}
                        className="p-3 hover:bg-white/10 rounded-lg text-white transition"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="space-y-4">
                {/* Main Input Grid (Static Reference) */}
                <div className="bg-white/5 p-4 rounded-xl opacity-50">
                    <div className="text-xs text-white/50 mb-2 uppercase tracking-wider">Original Motive</div>
                    <div className="flex gap-1">
                        {pattern.map((active, i) => (
                            <button
                                key={i}
                                onClick={() => handleStepClick(i)}
                                className={`flex-1 h-12 rounded-sm ${active ? 'bg-white' : 'bg-black/40 border border-white/10'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Shifted Output Grid (Active) */}
                <div className="bg-white/10 p-4 rounded-xl border border-pink-500/30">
                    <div className="text-xs text-pink-300 mb-2 uppercase tracking-wider flex justify-between">
                        <span>Displaced Output</span>
                        {isPlaying && <span className="animate-pulse">PLAYING</span>}
                    </div>
                    <div className="flex gap-1 relative overflow-hidden">
                        {shiftedPattern.map((active, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-16 rounded-sm transition-colors duration-200 ${active ? 'bg-pink-500 shadow-[0_0_10px_#ec4899]' : 'bg-black/40 border border-white/5'}`}
                            />
                        ))}
                        {/* Playhead overlay could go here but Tone.Sequence handles timing well */}
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-white/30">
                Tap the top row to create a rhythm. Use arrows to displace it by 16th notes.
            </p>
        </div>
    );
}
