import { useState } from 'react';
import type { ChordInfo } from '../../../core/theory';
import { noteNameToMidi, midiToNoteName } from '../../../core/theory';
import { playChord } from '../../../core/audio/globalAudio';

interface ConstantStructureToolProps {
    onAddChord: (chord: ChordInfo) => void;
}

export function ConstantStructureTool({ onAddChord }: ConstantStructureToolProps) {
    const [baseRoot, setBaseRoot] = useState('C');
    const [lockedVoicing, setLockedVoicing] = useState<number[]>([0, 3, 7, 10, 14, 17]); // Relative intervals
    const [isLocked, setIsLocked] = useState(false);

    // Define some "Modern" shapes to start with
    const SHAPES = [
        { name: 'So What', intervals: [0, 5, 10, 15, 19], desc: 'R-4-4-4-3' },
        { name: 'Kenny Barron', intervals: [0, 7, 10, 14, 17], desc: 'm11 Open' },
        { name: 'Herbie', intervals: [0, 4, 10, 14, 19], desc: 'Dom7alt' },
        { name: 'Upper Structure', intervals: [0, 4, 10, 14, 17, 21], desc: 'Maj13#11' },
    ];

    const handleShapeSelect = (shape: typeof SHAPES[0]) => {
        setLockedVoicing(shape.intervals);
        setIsLocked(true);
        // Play it
        playCurrentShape(baseRoot);
    };

    const playCurrentShape = (root: string) => {
        const rootMidi = noteNameToMidi(root + '4');
        const notes = lockedVoicing.map(interval => rootMidi + interval);
        playChord(notes, '1n');
    };

    const shiftRoot = (semitones: number) => {
        const currentMidi = noteNameToMidi(baseRoot + '4');
        const newMidi = currentMidi + semitones;
        const newRoot = midiToNoteName(newMidi).replace(/\d+/, '');
        setBaseRoot(newRoot);
        playCurrentShape(newRoot);
    };

    const addCurrentToProgression = () => {
        const rootMidi = noteNameToMidi(baseRoot + '4');
        const notes = lockedVoicing.map(interval => rootMidi + interval);

        const chord: ChordInfo = {
            root: baseRoot,
            quality: 'constant', // Special type?
            roman: 'N.F.', // Non-functional
            degree: -1,
            notes: notes.map(n => midiToNoteName(n)),
            midiNotes: notes
        };
        onAddChord(chord);
    };

    return (
        <div className="glass-panel rounded-2xl p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-amber-400">🌊</span>
                        Non-Functional Flow
                    </h2>
                    <p className="text-white/60 text-sm">
                        Slide constant structures freely through pitch space.
                    </p>
                </div>
                <div className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-mono">
                    {isLocked ? 'SHAPE LOCKED' : 'SELECT SHAPE'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shape Selector */}
                <div className="space-y-4">
                    <h3 className="text-white font-medium">1. Choose a Color Palette</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {SHAPES.map(shape => (
                            <button
                                key={shape.name}
                                onClick={() => handleShapeSelect(shape)}
                                className={`p-3 rounded-xl text-left transition-colors ${lockedVoicing === shape.intervals
                                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                                    }`}
                            >
                                <div className="font-bold">{shape.name}</div>
                                <div className="text-xs opacity-60">{shape.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plane Shifter */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-white font-medium mb-4 text-center">2. Shift the Plane</h3>

                    <div className="flex justify-center items-center gap-4 mb-6">
                        <button onClick={() => shiftRoot(-1)} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition">⬇️ b2</button>
                        <div className="text-4xl font-bold text-white w-16 text-center">{baseRoot}</div>
                        <button onClick={() => shiftRoot(1)} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition">⬆️ #2</button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button onClick={() => shiftRoot(-2)} className="py-2 bg-white/5 rounded hover:bg-white/10 text-xs">Whole Step Down</button>
                        <button onClick={() => shiftRoot(3)} className="py-2 bg-white/5 rounded hover:bg-white/10 text-xs">Minor 3rd Up</button>
                        <button onClick={() => shiftRoot(4)} className="py-2 bg-white/5 rounded hover:bg-white/10 text-xs">Major 3rd Up</button>
                        <button onClick={() => shiftRoot(-7)} className="py-2 bg-white/5 rounded hover:bg-white/10 text-xs">Cycle 5 Down</button>
                        <button onClick={() => shiftRoot(6)} className="py-2 bg-white/5 rounded hover:bg-white/10 text-xs">Tritone Shift</button>
                        <button onClick={() => shiftRoot(5)} className="py-2 bg-white/5 rounded hover:bg-white/10 text-xs">Cycle 4 Up</button>
                    </div>

                    <button
                        onClick={addCurrentToProgression}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors shadow-lg shadow-amber-900/20"
                    >
                        + Add to Progression
                    </button>
                </div>
            </div>
        </div>
    );
}
