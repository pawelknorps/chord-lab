import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeChord } from '../../core/routing/deepLinks';
import { useMidi } from '../../context/MidiContext';
import { midiToNoteName, getIntervalName } from '../../core/theory';
import { Play, RotateCcw } from 'lucide-react';
import { audioManager } from '../../core/services';
import { SendToMenu } from '../../components/shared/SendToMenu';
import { useMusicalClipboard } from '../../core/state/musicalClipboard';
import { useAudioCleanup } from '../../hooks/useAudioManager';
import { UnifiedPiano } from '../../components/shared/UnifiedPiano';
import { UnifiedFretboard } from '../../components/shared/UnifiedFretboard';

interface Note {
    midi: number;
    name: string;
}

const CHORD_TONE_COLORS: Record<string, string> = {
    'R': 'bg-red-500', 'M3': 'bg-blue-500', 'm3': 'bg-blue-400',
    'P5': 'bg-green-500', 'm7': 'bg-purple-500', 'M7': 'bg-purple-600',
    'M2': 'bg-yellow-400', 'P4': 'bg-yellow-500'
};

function detectChord(notes: Note[]): { name: string; quality: string; formula: string; intervals: number[] } {
    if (notes.length < 3) return { name: 'Select 3+ notes', quality: '', formula: '', intervals: [] };

    const sorted = [...notes].sort((a, b) => a.midi - b.midi);
    const root = sorted[0];
    const intervals = sorted.map(n => (n.midi - root.midi) % 12);

    const has = (int: number) => intervals.includes(int);
    const rootName = root.name.replace(/[0-9-]/g, '');
    let quality = '';

    if (has(4) && has(7)) {
        if (has(11)) quality = 'maj7';
        else if (has(10)) quality = '7';
        else if (has(2) && has(10)) quality = '9';
        else quality = 'maj';
    } else if (has(3) && has(7)) {
        if (has(10)) quality = 'm7';
        else if (has(11)) quality = 'm(maj7)';
        else quality = 'm';
    } else if (has(3) && has(6)) {
        if (has(9)) quality = 'dim7';
        else if (has(10)) quality = 'm7♭5';
        else quality = 'dim';
    } else if (has(4) && has(8)) {
        quality = 'aug';
    } else if (has(5) && has(7)) {
        quality = 'sus4';
    } else if (has(2) && has(7)) {
        quality = 'sus2';
    } else {
        quality = 'Custom';
    }

    const formula = intervals.map(i => getIntervalName(0, i)).join('-');
    return { name: rootName + (quality === 'maj' ? '' : quality), quality, formula, intervals };
}

export default function ChordBuilderWorkspace() {
    useAudioCleanup('chord-builder');
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchParams] = useSearchParams();
    const { activeNotes } = useMidi();
    const { pasteChord, clear: clearClipboard } = useMusicalClipboard();

    useEffect(() => {
        // 1. Check SearchParams (Deep Linking)
        const deepChord = decodeChord(searchParams);
        if (deepChord && deepChord.notes) {
            setNotes(deepChord.notes.map(m => ({ midi: m, name: midiToNoteName(m) })));
            return;
        }

        // 2. Check Musical Clipboard (Local session)
        const inboundChord = pasteChord();
        if (inboundChord && inboundChord.source === 'navigation') {
            if (inboundChord.notes) {
                setNotes(inboundChord.notes.map(m => ({ midi: m, name: midiToNoteName(m) })));
            }
            clearClipboard();
        }
    }, [searchParams, pasteChord, clearClipboard]);

    const chord = useMemo(() => detectChord(notes), [notes]);

    const handleNoteClick = useCallback((midiNote: number) => {
        setNotes(prev => {
            const exists = prev.find(n => n.midi === midiNote);
            if (exists) {
                return prev.filter(n => n.midi !== midiNote);
            }
            return [...prev, { midi: midiNote, name: midiToNoteName(midiNote) }].sort((a, b) => a.midi - b.midi);
        });
        audioManager.playNote(midiNote, '4n', 0.8);
    }, []);

    const handleClear = useCallback(() => {
        setNotes([]);
    }, []);

    const handlePlay = useCallback(() => {
        if (notes.length > 0) {
            audioManager.playChord(notes.map(n => n.midi), '2n', 0.8);
        }
    }, [notes]);

    const getIntervalColor = (interval: number) => {
        const name = getIntervalName(0, interval);
        return CHORD_TONE_COLORS[name] || 'bg-gray-500';
    };

    return (
        <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Chord Builder</h1>
                    <p className="text-[var(--text-muted)] text-sm">
                        Construct and analyze chords using Piano and Fretboard.
                    </p>
                </header>

                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-6 md:p-8 mb-6 shadow-sm">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs uppercase font-black text-[var(--text-muted)] tracking-[0.2em]">
                                Selection ({notes.length})
                            </h2>
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-[var(--text-muted)] hover:text-white transition-colors"
                            >
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                            {notes.length === 0 ? (
                                <span className="text-[var(--text-muted)] text-sm italic opacity-50">No notes selected</span>
                            ) : (
                                notes.map(note => (
                                    <div
                                        key={note.midi}
                                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm font-bold"
                                    >
                                        {note.name}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-12 py-4">
                        <div className="overflow-x-auto no-scrollbar">
                            <div className="min-w-max mx-auto">
                                <UnifiedPiano
                                    mode="highlight"
                                    highlightedNotes={notes.map(n => n.midi)}
                                    activeNotes={Array.from(activeNotes)}
                                    onNoteClick={handleNoteClick}
                                    showLabels="note-name"
                                    octaveRange={[3, 5]}
                                />
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-12">
                            <UnifiedFretboard
                                mode="notes"
                                highlightedNotes={notes.map(n => n.midi)}
                                activeNotes={Array.from(activeNotes)}
                                rootNote={notes[0]?.midi}
                                onNoteClick={handleNoteClick}
                                fretRange={[0, 15]}
                                showFretNumbers={true}
                                showStringNames={true}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center mt-12">
                        <button
                            onClick={handlePlay}
                            disabled={notes.length === 0}
                            className="flex items-center gap-3 px-8 py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-105 transition-all disabled:opacity-20">
                            <Play size={16} fill="currentColor" />
                            Listen
                        </button>
                        {notes.length >= 3 && (
                            <SendToMenu
                                chord={{
                                    root: notes[0].name.replace(/[0-9-8-]/g, ''),
                                    quality: chord.quality,
                                    notes: notes.map(n => n.midi)
                                }}
                                sourceModule="chord-builder"
                            />
                        )}
                    </div>
                </div>

                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm">
                    <h2 className="text-xs uppercase font-black text-[var(--text-muted)] tracking-[0.2em] mb-6">
                        Anatomy
                    </h2>

                    {notes.length < 3 ? (
                        <div className="text-center text-[var(--text-muted)] py-12 border-2 border-dashed border-white/5 rounded-xl">
                            <p className="text-sm opacity-50">Select 3+ notes for detailed analysis</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Descriptor</div>
                                <div className="text-4xl font-black text-white italic">{chord.name}</div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Intervallic Signature</div>
                                <div className="flex flex-wrap gap-2">
                                    {chord.intervals.map((interval, idx) => (
                                        <div
                                            key={idx}
                                            className={`px-3 py-1 rounded-full text-white text-[10px] font-black ${getIntervalColor(interval)}`}
                                        >
                                            {getIntervalName(0, interval)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">Formula</div>
                                <div className="text-sm font-mono text-white/40">{chord.formula}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
