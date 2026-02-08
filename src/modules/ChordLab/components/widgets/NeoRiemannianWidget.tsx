import { useState } from 'react';
import { noteNameToMidi, midiToNoteName } from '../../../../core/theory';
import { playChord } from '../../../../core/audio/globalAudio';

export function NeoRiemannianWidget() {
    const [currentRoot, setCurrentRoot] = useState('C');
    const [currentQuality, setCurrentQuality] = useState<'Major' | 'Minor'>('Major');
    const [history, setHistory] = useState<string[]>(['C Major']);

    const playState = (root: string, quality: 'Major' | 'Minor') => {
        const rootMidi = noteNameToMidi(root + '4');
        let intervals = quality === 'Major' ? [0, 4, 7] : [0, 3, 7];
        let notes = intervals.map(i => rootMidi + i);
        playChord(notes, '1n');
    };

    // Transformation Logic
    // P (Parallel): Major <-> Minor (Maintains 5th, Root)
    // L (Leading): Major -> Minor (Root moves down semitone: C Maj -> E Min) / Minor -> Major (5th moves up semitone: E min -> C Maj)
    // R (Relative): Major -> Minor (5th moves up whole tone: C Maj -> A Min) / Minor -> Major (Root moves down whole tone: A Min -> C maj)

    const transform = (type: 'P' | 'L' | 'R') => {
        let newRoot = currentRoot;
        let newQuality = currentQuality === 'Major' ? 'Minor' : 'Major';
        // Note: newQuality is the TARGET quality. P, L, R always flip quality.

        const rootMidi = noteNameToMidi(currentRoot + '4');

        if (type === 'P') {
            // Parallel: Same root, flip quality.
            // C Major -> C Minor
            newRoot = currentRoot;
        }
        else if (type === 'L') {
            // Leading Tone Exchange
            if (currentQuality === 'Major') {
                // C Major (C E G) -> E Minor (B E G). Root moves down semitone to Become Leading Tone (B).
                // Actually L maps C Major to E Minor. (C->B). 
                // Wait, C Major (C E G). E Minor (E G B). 
                // Common tones E, G. C moves to B. 
                // We need to calculate the new Root.
                // E is the new root coming from the 3rd of C Major.
                // 3rd of C is E.
                // So new root = Major 3rd of old root.
                const thirdMidi = rootMidi + 4;
                newRoot = midiToNoteName(thirdMidi).replace(/\d+/, '');
            } else {
                // Minor -> Major
                // E Minor (E G B) -> C Major (C E G).
                // 5th (B) moves up to C.
                // New root is minor 6th up from E? Or Major 3rd down? 
                // C is Major 3rd down from E.
                const rootMidi = noteNameToMidi(currentRoot + '4');
                const newRootMidi = rootMidi - 4;
                newRoot = midiToNoteName(newRootMidi).replace(/\d+/, '');
            }
        }
        else if (type === 'R') {
            // Relative
            if (currentQuality === 'Major') {
                // C Major (C E G) -> A Minor (A C E).
                // Root moves UP to A? No. C E G. A C E.
                // 5th moves up whole tone? G -> A.
                // New Root is A. (Minor 3rd down from C).
                const rootMidi = noteNameToMidi(currentRoot + '4');
                const newRootMidi = rootMidi - 3;
                newRoot = midiToNoteName(newRootMidi).replace(/\d+/, '');
            } else {
                // Minor -> Major
                // A Minor (A C E) -> C Major (C E G).
                // Root moves down whole tone? A -> G? No.
                // Relative Major of A Minor is C Major. (Minor 3rd up).
                const rootMidi = noteNameToMidi(currentRoot + '4');
                const newRootMidi = rootMidi + 3;
                newRoot = midiToNoteName(newRootMidi).replace(/\d+/, '');
            }
        }

        // Update State
        // Need to handle sharpening/flatting consistently, midiToNoteName handles this but check enhancers
        setCurrentRoot(newRoot);
        setCurrentQuality(newQuality as any);

        const chordName = `${newRoot} ${newQuality}`;
        setHistory(prev => [...prev.slice(-4), chordName]);
        playState(newRoot, newQuality as any);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 my-6">
            <h3 className="text-lg font-bold text-white mb-4">Interactive: The Neo-Riemannian Pad</h3>

            <div className="flex flex-col items-center gap-6">

                {/* Display */}
                <div className="text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        {currentRoot}
                    </div>
                    <div className="text-xl text-white/60 tracking-widest uppercase">
                        {currentQuality}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                    <button
                        onClick={() => transform('P')}
                        className="w-20 h-20 rounded-full bg-pink-500 hover:bg-pink-400 text-black font-bold text-2xl shadow-lg shadow-pink-900/40 transition transform hover:scale-105 active:scale-95"
                    >
                        P
                    </button>
                    <button
                        onClick={() => transform('L')}
                        className="w-20 h-20 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-2xl shadow-lg shadow-cyan-900/40 transition transform hover:scale-105 active:scale-95"
                    >
                        L
                    </button>
                    <button
                        onClick={() => transform('R')}
                        className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-2xl shadow-lg shadow-amber-900/40 transition transform hover:scale-105 active:scale-95"
                    >
                        R
                    </button>
                </div>

                {/* History */}
                <div className="flex gap-2 text-sm text-white/30">
                    {history.map((h, i) => (
                        <span key={i} className={i === history.length - 1 ? 'text-white' : ''}>
                            {h} {i < history.length - 1 && '→'}
                        </span>
                    ))}
                </div>

                <p className="text-center text-xs text-white/40 max-w-sm">
                    <b>P</b>arallel (C ↔ Cm) • <b>L</b>eading Tone (C ↔ Em) • <b>R</b>elative (C ↔ Am)
                    <br />
                    Observe how the voice leading connects these distant chords smoothly.
                </p>
            </div>
        </div>
    );
}
