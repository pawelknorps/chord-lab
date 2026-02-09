import { useState, useCallback } from 'react';
import { useMidi } from '../../../context/MidiContext';
import { midiToNoteName } from '../../../core/theory';
import { Play, RotateCcw, Download } from 'lucide-react';

interface Note {
    midi: number;
    name: string;
}

export default function ChordBuilderWorkspace() {
    const [notes, setNotes] = useState<Note[]>([]);
    const { activeNotes } = useMidi();

    // Add note from piano click
    const handleNoteClick = useCallback((midiNote: number) => {
        setNotes(prev => {
            const exists = prev.find(n => n.midi === midiNote);
            if (exists) {
                return prev.filter(n => n.midi !== midiNote);
            }
            return [...prev, { midi: midiNote, name: midiToNoteName(midiNote) }].sort((a, b) => a.midi - b.midi);
        });
    }, []);

    // Clear all notes
    const handleClear = useCallback(() => {
        setNotes([]);
    }, []);

    // Render piano keyboard
    const renderPiano = () => {
        const octaves = [3, 4, 5]; // C3 to B5
        const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const blackKeyPositions = [1, 2, 4, 5, 6]; // After C, D, F, G, A

        return (
            <div className="relative flex justify-center py-8">
                <div className="relative inline-flex">
                    {octaves.map(octave => (
                        <div key={octave} className="relative flex">
                            {whiteKeys.map((note, idx) => {
                                const midiNote = 12 * (octave + 1) + [0, 2, 4, 5, 7, 9, 11][idx];
                                const isActive = notes.some(n => n.midi === midiNote) || Array.from(activeNotes).includes(midiNote);

                                return (
                                    <div key={`${note}${octave}`} className="relative">
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
                                                {note}{octave}
                                            </span>
                                        </button>

                                        {/* Black key */}
                                        {blackKeyPositions.includes(idx) && (
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
                    ))}
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
                        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-app)] rounded-md hover:bg-white transition-colors">
                            <Play size={16} fill="currentColor" />
                            Play Chord
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-md hover:border-[var(--text-muted)] transition-colors">
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Chord Analysis Panel (Placeholder) */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-6">
                    <h2 className="text-sm uppercase font-bold text-[var(--text-muted)] tracking-wider mb-4">
                        Chord Analysis
                    </h2>
                    <div className="text-center text-[var(--text-muted)] py-8">
                        <p className="text-sm">Select 3 or more notes to see chord analysis</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
