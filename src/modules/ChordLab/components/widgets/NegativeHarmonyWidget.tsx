import { useState } from 'react';
import { noteNameToMidi } from '../../../../core/theory';
import { playChord } from '../../../../core/audio/globalAudio';

export function NegativeHarmonyWidget() {
    const [inputChord, setInputChord] = useState<string>('G7');
    const [outputChord, setOutputChord] = useState<string | null>(null);

    // Simple hardcoded map for demo purposes
    // A real implementation would need a full negative harmony calculator
    const NEGATIVE_MAP: Record<string, string> = {
        'C': 'C (Negative Tonic)',
        'G7': 'Fm6 (Negative Dominant)',
        'Dm7': 'BbMaj7 (Negative Supertonic)',
        'Em7': 'AbMaj7 (Negative Mediant)',
        'Am7': 'EbMaj7 (Negative Submediant)',
        'F': 'Gm (Negative Subdominant)'
    };

    const reflect = () => {
        const negative = NEGATIVE_MAP[inputChord] || 'Unknown Mirror';
        setOutputChord(negative);

        // Play logic (mocked for now)
        if (negative.includes('Fm6')) {
            // Speak/Play Fm6: F Ab C D
            const notes = [
                noteNameToMidi('F3'),
                noteNameToMidi('Ab3'),
                noteNameToMidi('C4'),
                noteNameToMidi('D4')
            ];
            playChord(notes, '1n');
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/10 rounded-xl p-6 my-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                🪞 The Negative Harmony Mirror
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Input Side */}
                <div className="flex-1 text-center space-y-4">
                    <div className="text-sm text-white/50 uppercase tracking-widest">Positive World</div>
                    <select
                        value={inputChord}
                        onChange={(e) => setInputChord(e.target.value)}
                        className="bg-white/10 text-white rounded-lg p-3 w-full text-center font-bold text-xl appearance-none"
                    >
                        {Object.keys(NEGATIVE_MAP).map(k => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                </div>

                {/* The Axis */}
                <div className="flex flex-col items-center justify-center">
                    <div className="h-20 w-1 bg-white/20 rounded-full"></div>
                    <button
                        onClick={reflect}
                        className="my-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 transition transform hover:scale-105"
                    >
                        REFLECT
                    </button>
                    <div className="h-20 w-1 bg-white/20 rounded-full"></div>
                </div>

                {/* Output Side */}
                <div className="flex-1 text-center space-y-4">
                    <div className="text-sm text-white/50 uppercase tracking-widest">Negative World</div>
                    <div className={`p-4 rounded-xl border-2 ${outputChord ? 'border-cyan-400 bg-cyan-900/20' : 'border-white/10 bg-white/5'} transition-all min-h-[80px] flex items-center justify-center`}>
                        {outputChord ? (
                            <div className="animate-fade-in text-cyan-300 font-bold text-xl">
                                {outputChord}
                            </div>
                        ) : (
                            <div className="text-white/20 italic">
                                Waiting for reflection...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className="mt-6 text-center text-xs text-white/40">
                Axis: E - Eb (Key of C) • Inverts gravitational tendencies.
            </p>
        </div>
    );
}
