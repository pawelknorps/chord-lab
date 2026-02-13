import React, { useRef, useEffect } from 'react';
import { midiToPianoKeyLayout, DEFAULT_WATERFALL_OCTAVE_RANGE, type OctaveRange } from '../utils/pianoKeyLayout';
import { UnifiedPiano } from '../../../components/shared/UnifiedPiano';
import styles from './NoteWaterfall.module.css';

/** Wall-clock time in seconds for 60fps scroll independent of Transport (REQ-STUDIO-06). */
function wallClockSeconds(): number {
    return typeof performance !== 'undefined' ? performance.now() / 1000 : 0;
}

interface NoteEvent {
    midi: number;
    velocity: number;
    startTime: number;
    duration?: number;
    type: 'root' | 'third' | 'fifth' | 'seventh' | 'extension';
}

interface NoteWaterfallProps {
    onNoteEvent?: (callback: (note: NoteEvent) => void) => void;
    /** Octave range — must match the piano so falling notes align with keys */
    octaveRange?: OctaveRange;
}

const NOTE_COLORS: Record<NoteEvent['type'], string> = {
    root: '#3b82f6',
    third: '#10b981',
    fifth: '#eab308',
    seventh: '#ef4444',
    extension: '#a855f7',
};

export const NoteWaterfall: React.FC<NoteWaterfallProps> = ({ onNoteEvent, octaveRange = DEFAULT_WATERFALL_OCTAVE_RANGE }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeNotesRef = useRef<NoteEvent[]>([]);
    const requestRef = useRef<number>();
    const octaveRangeRef = useRef(octaveRange);
    octaveRangeRef.current = octaveRange;

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
                    startTime: wallClockSeconds()
                });
            });
        }
    }, [onNoteEvent]);

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const now = wallClockSeconds();
        const scrollSpeed = 180;
        const viewH = canvas.height;
        const maxAge = viewH / scrollSpeed + 0.5;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        activeNotesRef.current = activeNotesRef.current.filter(n => now - n.startTime < maxAge);

        const w = canvas.width;

        activeNotesRef.current.forEach(note => {
            const layout = midiToPianoKeyLayout(note.midi, octaveRangeRef.current);
            if (!layout) return;

            const x = layout.xCenter * w - (layout.width * w) / 2;
            const keyWidthPx = layout.width * w;
            const age = now - note.startTime;
            const y = age * scrollSpeed;
            const height = (note.duration || 0.4) * scrollSpeed;

            const color = NOTE_COLORS[note.type] ?? '#ffffff';
            ctx.fillStyle = color;
            ctx.globalAlpha = Math.max(0, 1 - age / maxAge);

            const pad = layout.isBlack ? 1 : 2;
            const drawW = Math.max(2, keyWidthPx - pad * 2);
            const drawX = x + (keyWidthPx - drawW) / 2;

            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(drawX, y, drawW, height, 3);
            } else {
                ctx.rect(drawX, y, drawW, height);
            }
            ctx.fill();
            ctx.shadowBlur = 8;
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
        <div ref={containerRef} className={styles.combined}>
            <div className={styles.pianoWrap}>
                <UnifiedPiano
                    mode="playback"
                    octaveRange={octaveRange}
                    showLabels="none"
                />
            </div>
            <canvas
                ref={canvasRef}
                className={styles.overlay}
                aria-hidden
            />
        </div>
    );
};
