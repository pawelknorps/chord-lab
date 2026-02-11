import React, { useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface NoteEvent {
    midi: number;
    velocity: number;
    startTime: number;
    duration?: number;
    type: 'root' | 'third' | 'fifth' | 'seventh' | 'extension';
}

interface NoteWaterfallProps {
    onNoteEvent?: (callback: (note: NoteEvent) => void) => void;
}

const NOTE_COLORS = {
    'root': '#3b82f6',   // Blue
    'third': '#10b981',  // Green
    'fifth': '#eab308',  // Yellow
    'seventh': '#ef4444', // Red
    'extension': '#a855f7' // Purple
};

export const NoteWaterfall: React.FC<NoteWaterfallProps> = ({ onNoteEvent }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeNotesRef = useRef<NoteEvent[]>([]);
    const requestRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const resize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(container);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (onNoteEvent) {
            onNoteEvent((note) => {
                activeNotesRef.current.push({
                    ...note,
                    startTime: Tone.Transport.seconds
                });
            });
        }
    }, [onNoteEvent]);

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use Transport.seconds for frame-perfect alignment with audio (stops when transport stops)
        const now = Tone.Transport.seconds;
        const scrollSpeed = 200; // pixels per second

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        activeNotesRef.current = activeNotesRef.current.filter(n => {
            const age = now - n.startTime;
            return age < 5;
        });

        const keyWidth = canvas.width / 48;
        const startMidi = 36;

        activeNotesRef.current.forEach(note => {
            const x = (note.midi - startMidi) * keyWidth;
            const age = now - note.startTime;
            const y = age * scrollSpeed;
            const height = (note.duration || 0.5) * scrollSpeed;

            const color = NOTE_COLORS[note.type] || '#ffffff';
            ctx.fillStyle = color;
            ctx.globalAlpha = Math.max(0, 1 - (age / 5));

            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x + 2, y, keyWidth - 4, height, 4);
            } else {
                ctx.rect(x + 2, y, keyWidth - 4, height);
            }
            ctx.fill();

            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full">
            <canvas
                ref={canvasRef}
                className="w-full h-full pointer-events-none opacity-40 mix-blend-screen block"
                style={{ filter: 'blur(0.5px)' }}
            />
        </div>
    );
};
