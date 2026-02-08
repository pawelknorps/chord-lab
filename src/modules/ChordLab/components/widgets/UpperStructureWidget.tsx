import { useState, useCallback } from 'react';
import { noteNameToMidi } from '../../../../core/theory';
import { playChordPart } from '../../../../core/audio/globalAudio';

export function UpperStructureWidget() {
    const [activeTriad, setActiveTriad] = useState<string | null>(null);

    // Base: C7 Shell (C, E, Bb)
    // Voiced: C3, E3, Bb3
    const playShell = useCallback(() => {
        const notes = [
            noteNameToMidi('C3'),
            noteNameToMidi('E3'),
            noteNameToMidi('Bb3')
        ];
        playChordPart(notes, '2n', 'shell');
    }, []);

    const UPPER_STRUCTURES = [
        { name: 'US II (D)', triad: ['D', 'F#', 'A'], intervals: '9, #11, 13', sound: 'Lydian Dominant / Bright' },
        { name: 'US bIII (Eb)', triad: ['Eb', 'G', 'Bb'], intervals: '#9, 5, b7', sound: 'Bluesy / Sharp 9' },
        { name: 'US bV (Gb)', triad: ['F#', 'A#', 'C#'], intervals: '#11, b7, b9', sound: 'Diminished / Symmetrical' },
        { name: 'US bVI (Ab)', triad: ['Ab', 'C', 'Eb'], intervals: 'b13, R, #9', sound: 'Altered / Dark' },
        { name: 'US VI (A)', triad: ['A', 'C#', 'E'], intervals: '13, b9, 3', sound: 'Diminished / Classical' },
    ];

    const playUpperStructure = (us: typeof UPPER_STRUCTURES[0]) => {
        setActiveTriad(us.name);

        // Play Shell first to establish context
        playShell();

        // Play Triad after brief delay (or together?)
        // Together is better for "vertical color"
        const triadMidi = us.triad.map(note => noteNameToMidi(note + '4')); // Play in octave 4
        playChordPart(triadMidi, '2n', 'extension');
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 my-6">
            <h3 className="text-lg font-bold text-white mb-4">Interactive: The Dominant Aggregate (C7 Base)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <button
                        onClick={playShell}
                        className="w-full py-3 bg-indigo-900/50 hover:bg-indigo-900/80 border border-indigo-500/30 rounded-lg text-indigo-200 font-semibold transition"
                    >
                        Play Founder (Shell: C-E-Bb)
                    </button>

                    <div className="space-y-2">
                        <p className="text-xs text-white/40 uppercase tracking-wider">Select Upper Structure</p>
                        {UPPER_STRUCTURES.map(us => (
                            <button
                                key={us.name}
                                onClick={() => playUpperStructure(us)}
                                className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center transition ${activeTriad === us.name
                                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200'
                                    : 'bg-white/5 hover:bg-white/10 text-white/60'
                                    }`}
                            >
                                <span className="font-bold">{us.name}</span>
                                <span className="text-xs opacity-60">{us.sound}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center bg-black/40 rounded-xl p-4">
                    {activeTriad ? (
                        <div className="text-center animate-fade-in">
                            <div className="text-4xl font-bold text-cyan-400 mb-2">
                                C7<span className="text-purple-400">{UPPER_STRUCTURES.find(u => u.name === activeTriad)?.intervals}</span>
                            </div>
                            <div className="text-white/50">
                                {UPPER_STRUCTURES.find(u => u.name === activeTriad)?.sound}
                            </div>
                            <div className="mt-4 flex justify-center gap-2">
                                {/* Visual representation of Triad notes */}
                                {UPPER_STRUCTURES.find(u => u.name === activeTriad)?.triad.map(n => (
                                    <div key={n} className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-xs font-mono text-cyan-300">
                                        {n}
                                    </div>
                                ))}
                                <div className="w-8 h-8 flex items-center justify-center text-white/20">/</div>
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-xs font-mono text-indigo-300">C</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-white/20 text-center text-sm">
                            Select an Upper Structure to visualize the aggregate.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
