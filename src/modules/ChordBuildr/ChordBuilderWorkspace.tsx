import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMidi } from '../../context/MidiContext';
import { midiToNoteName } from '../../core/theory';
import { Play, RotateCcw, ArrowRight } from 'lucide-react';
import { playChord, initAudio } from '../../core/audio/globalAudio';

interface Note {
    midi: number;
    name: string;
}

const INTERVAL_NAMES: Record<number, string> = {
    0: 'R', 1: 'm2', 2: 'M2', 3: 'm3', 4: 'M3', 5: 'P4', 6: 'TT',
    7: 'P5', 8: 'm6', 9: 'M6', 10: 'm7', 11: 'M7', 12: 'P8'
};

const CHORD_TONE_COLORS: Record<string, string> = {
    'R': 'bg-red-500', 'M3': 'bg-blue-500', 'm3': 'bg-blue-400',
    'P5': 'bg-green-500', 'm7': 'bg-purple-500', 'M7': 'bg-purple-600',
    'M2': 'bg-yellow-400', 'P4': 'bg-yellow-500'
};

function detectChord(notes: Note[]): { name: string; formula: string; intervals: number[] } {
    if (notes.length < 3) return { name: 'Select 3+ notes', formula: '', intervals: [] };

    const sorted = [...notes].sort((a, b) => a.midi - b.midi);
    const root = sorted[0];
    const intervals = sorted.map(n => (n.midi - root.midi) % 12);

    const has = (int: number) => intervals.includes(int);
    const rootName = root.name.replace(/[0-9-]/g, ''); // Remove octave numbers
    let quality = '';

    // Improved chord detection
    if (has(4) && has(7)) {
        // Major triad base
        if (has(11)) quality = 'maj7';
        else if (has(10)) quality = '7';
        else if (has(2) && has(10)) quality = '9';
        else quality = '';
    } else if (has(3) && has(7)) {
        // Minor triad base
        if (has(10)) quality = 'm7';
        else if (has(11)) quality = 'm(maj7)';
        else quality = 'm';
    } else if (has(3) && has(6)) {
        // Diminished
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
        quality = '?';
    }

    const formula = intervals.map(i => INTERVAL_NAMES[i] || '?').join('-');
    return { name: rootName + quality, formula, intervals };
}

export default function ChordBuilderWorkspace() {
    const [notes, setNotes] = useState<Note[]>([]);
    const { activeNotes } = useMidi();
    const [audioReady, setAudioReady] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        initAudio().then(() => setAudioReady(true));
    }, []);

    const chord = useMemo(() => detectChord(notes), [notes]);

    const handleNoteClick = useCallback((midiNote: number) => {
        setNotes(prev => {
            const exists = prev.find(n => n.midi === midiNote);
            if (exists) {
                return prev.filter(n => n.midi !== midiNote);
            }
            return [...prev, { midi: midiNote, name: midiToNoteName(midiNote) }].sort((a, b) => a.midi - b.midi);
        });
    }, []);

    const handleClear = useCallback(() => {
        setNotes([]);
    }, []);

    const handlePlay = useCallback(() => {
        if (notes.length > 0 && audioReady) {
            playChord(notes.map(n => n.midi), '2n', 'None');
        }
    }, [notes, audioReady]);

    const handleExport = useCallback(() => {
        if (notes.length >= 3) {
            navigate('/', {
                state: {
                    importedChord: {
                        notes: notes.map(n => n.midi),
                        name: chord.name
                    }
                }
            });
        }
    }, [notes, chord, navigate]);

    const getIntervalColor = (interval: number) => {
        const name = INTERVAL_NAMES[interval];
        return CHORD_TONE_COLORS[name] || 'bg-gray-500';
    };

    const renderPiano = () => {
        const startOctave = 3;
        const numOctaves = 3;
        const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const blackKeyMap: Record<string, string> = {
            'C': 'C#', 'D': 'D#', 'F': 'F#', 'G': 'G#', 'A': 'A#'
        };

        return (
            <div className="relative flex justify-center py-8">
                <div className="relative inline-flex">
                    {Array.from({ length: numOctaves }, (_, octIdx) => {
                        const octave = startOctave + octIdx;
                        return (
                            <div key={octave} className="relative flex">
                                {whiteKeys.map((noteName, idx) => {
                                    const noteOffset = [0, 2, 4, 5, 7, 9, 11][idx];
                                    const midiNote = (octave + 1) * 12 + noteOffset;
                                    const isActive = notes.some(n => n.midi === midiNote) || Array.from(activeNotes).includes(midiNote);
                                    const hasBlack = blackKeyMap[noteName];

                                    return (
                                        <div key={`${noteName}${octave}`} className="relative">
                                            {/* White key */}
                                            <button
                                                onClick={() => handleNoteClick(midiNote)}
                                                className={`
                                                    w-12 h-40 border-2 border-[var(--border-subtle)] rounded-b-lg transition-all
                                                    ${isActive
                                                        ? 'bg-[var(--accent)] border-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)]'
                                                        : 'bg-white hover:bg-gray-100'
                                                    }
                                                `}
                                            >
                                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-400">
                                                    {noteName}{octave}
                                                </span>
                                            </button>

                                            {/* Black key */}
                                            {hasBlack && (
                                                <button
                                                    onClick={() => handleNoteClick(midiNote + 1)}
                                                    className={`
                                                        absolute top-0 -right-4 w-8 h-24 z-10 rounded-b-lg border-2 border-[var(--border-subtle)] transition-all
                                                        ${notes.some(n => n.midi === midiNote + 1) || Array.from(activeNotes).includes(midiNote + 1)
                                                            ? 'bg-[var(--accent)] border-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)]'
                                                            : 'bg-gray-900 hover:bg-gray-700'
                                                        }
                                                    `}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Chord Builder</h1>
                    <p className="text-[var(--text-muted)] text-sm">
                        Click piano keys or use your MIDI keyboard to build chords
                    </p>
                </header>

                {/* Main Workspace */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-8 mb-6">

                    {/* Selected Notes Display */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm uppercase font-bold text-[var(--text-muted)] tracking-wider">
                                Selected Notes ({notes.length})
                            </h2>
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-2 px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <RotateCcw size={14} />
                                Clear
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                            {notes.length === 0 ? (
                                <span className="text-[var(--text-muted)] text-sm italic">No notes selected</span>
                            ) : (
                                notes.map(note => (
                                    <div
                                        key={note.midi}
                                        className="px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm font-mono"
                                    >
                                        {note.name}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Piano Keyboard */}
                    {renderPiano()}

                    {/* Actions */}
                    <div className="flex gap-3 justify-center mt-6">
                        <button
                            onClick={handlePlay}
                            disabled={notes.length === 0 || !audioReady}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-app)] rounded-md hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            <Play size={16} fill="currentColor" />
                            Play Chord
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={notes.length < 3}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-md hover:border-[var(--text-muted)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            <ArrowRight size={16} />
                            Send to ChordLab
                        </button>
                    </div>
                </div>

                {/* Chord Analysis Panel */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-6">
                    <h2 className="text-sm uppercase font-bold text-[var(--text-muted)] tracking-wider mb-4">
                        Chord Analysis
                    </h2>

                    {notes.length < 3 ? (
                        <div className="text-center text-[var(--text-muted)] py-8">
                            <p className="text-sm">Select 3 or more notes to see chord analysis</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-[var(--text-muted)] mb-1">Detected Chord</div>
                                <div className="text-3xl font-bold text-[var(--accent)]">{chord.name}</div>
                            </div>

                            <div>
                                <div className="text-xs text-[var(--text-muted)] mb-2">Interval Formula</div>
                                <div className="flex flex-wrap gap-2">
                                    {chord.intervals.map((interval, idx) => (
                                        <div
                                            key={idx}
                                            className={`px-3 py-1 rounded text-white text-xs font-bold ${getIntervalColor(interval)}`}
                                        >
                                            {INTERVAL_NAMES[interval]}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-[var(--text-muted)] mb-1">Formula String</div>
                                <div className="text-sm font-mono text-[var(--text-secondary)]">{chord.formula}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
