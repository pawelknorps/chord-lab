import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Music, Info, Settings2, Play, Zap } from 'lucide-react';
import * as Tone from 'tone';
import { useAudio } from '../../context/AudioContext';
import { useMidi } from '../../context/MidiContext';
import { midiToNoteName, ALL_KEYS, NOTE_NAMES, noteNameToMidi, getChordNotes, parseChord } from '../../core/theory';
import { getNegativeNote, getNegativeChord } from '../../core/theory/negativeHarmony';

// Helper to get notes for the conversion table
const getMappingForRoot = (rootMidi: number) => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(offset => {
        const original = rootMidi + offset;
        const negative = getNegativeNote(original, rootMidi);
        return {
            original,
            negative,
            interval: offset
        };
    });
};

const NegativeMirror: React.FC = () => {
    const { isReady, startAudio } = useAudio();
    const { lastNote, activeNotes: midiActiveNotes } = useMidi();

    const [rootNote, setRootNote] = useState('C');
    const [viewMode, setViewMode] = useState<'circle' | 'table' | 'example'>('circle');
    const [originalChordInput, setOriginalChordInput] = useState('G7');

    const rootMidi = useMemo(() => noteNameToMidi(`${rootNote}4`), [rootNote]);

    // Synths
    const synthRef = useRef<Tone.PolySynth | null>(null);
    const mirrorSynthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        if (isReady && !synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                volume: -12,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
            }).toDestination();

            mirrorSynthRef.current = new Tone.PolySynth(Tone.Synth, {
                volume: -12,
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
            }).toDestination();
        }
    }, [isReady]);

    // Handle interactive MIDI notes
    const [reflectedNotes, setReflectedNotes] = useState<Set<number>>(new Set());

    useEffect(() => {
        const newReflected = new Set<number>();
        midiActiveNotes.forEach(note => {
            newReflected.add(getNegativeNote(note, rootMidi));
        });
        setReflectedNotes(newReflected);

        // Play reflected notes
        if (isReady && mirrorSynthRef.current) {
            // This is complex because we need to track what's playing
            // For now let's just use the lastNote trigger logic if it's simpler
        }
    }, [midiActiveNotes, rootMidi, isReady]);

    // Trigger audio based on lastNote for better performance than full state sync
    useEffect(() => {
        if (!lastNote || !isReady || !synthRef.current || !mirrorSynthRef.current) return;

        const note = lastNote.note;
        const negNote = getNegativeNote(note, rootMidi);

        if (lastNote.type === 'noteon') {
            synthRef.current.triggerAttack(midiToNoteName(note, rootNote));
            mirrorSynthRef.current.triggerAttack(midiToNoteName(negNote, rootNote));
        } else {
            synthRef.current.triggerRelease(midiToNoteName(note, rootNote));
            mirrorSynthRef.current.triggerRelease(midiToNoteName(negNote, rootNote));
        }
    }, [lastNote, rootMidi, isReady]);

    const mapping = useMemo(() => getMappingForRoot(rootMidi), [rootMidi]);

    const chordResult = useMemo(() => {
        try {
            const { root, quality } = parseChord(originalChordInput);
            const notes = getChordNotes(root, quality, 4);
            const negativeNotes = getNegativeChord(notes, rootMidi);
            return {
                original: notes,
                negative: negativeNotes
            };
        } catch (e) {
            return null;
        }
    }, [originalChordInput, rootMidi]);

    const playChord = (notes: number[], isMirror = false) => {
        if (!isReady || (isMirror ? !mirrorSynthRef.current : !synthRef.current)) return;
        const synth = isMirror ? mirrorSynthRef.current! : synthRef.current!;
        const names = notes.map(n => midiToNoteName(n, rootNote));
        synth.triggerAttackRelease(names, '2n');
    };

    const playSequence = async (type: 'original' | 'negative') => {
        if (!isReady || !synthRef.current || !mirrorSynthRef.current) return;

        const chords = type === 'original'
            ? [['C4', 'Eb4', 'G4', 'Bb4'], ['F4', 'A4', 'C5', 'Eb5'], ['Bb3', 'D4', 'F4', 'A4']]
            : [['F4', 'Ab4', 'C5', 'Eb5'], ['Eb4', 'Gb4', 'Bb4', 'C5'], ['Bb3', 'D4', 'F4', 'A4']];

        const synth = type === 'original' ? synthRef.current! : mirrorSynthRef.current!;

        const now = Tone.now();
        chords.forEach((chord, i) => {
            synth.triggerAttackRelease(chord, '2n', now + i * 1.5);
        });
    };

    const playComparison = async () => {
        if (!isReady) {
            await startAudio();
        }
        playSequence('original');
        setTimeout(() => playSequence('negative'), 5000);
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0c] text-slate-200 overflow-hidden font-sans relative">
            {/* Header */}
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
                        <ArrowLeftRight className="text-blue-400" /> Negative Harmony Mirror
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Musical Gravity Inversion Engine</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        {(['circle', 'table', 'example'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setViewMode(m)}
                                className={`px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Control Panel */}
                <aside className="w-80 border-r border-white/5 bg-black/20 p-6 flex flex-col gap-8 overflow-y-auto">
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings2 size={14} /> Global Axis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-2 block">Key Root (Tonic)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ALL_KEYS.map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setRootNote(n)}
                                            className={`py-2 text-xs rounded border transition-all ${rootNote === n ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                                <p className="text-[10px] text-blue-400 font-mono leading-relaxed">
                                    The axis is the midpoint between {rootNote} (I) and {(NOTE_NAMES[(NOTE_NAMES.indexOf(rootNote as any) + 7) % 12])} (V).
                                    Exact midpoint: <span className="text-white">between {midiToNoteName(rootMidi + 3, rootNote).slice(0, -1)} and {midiToNoteName(rootMidi + 4, rootNote).slice(0, -1)}</span>.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap size={14} /> Chord Transformer
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={originalChordInput}
                                    onChange={(e) => setOriginalChordInput(e.target.value)}
                                    placeholder="Enter chord (e.g. G7)"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                />
                                <div className="absolute right-3 top-3 text-xs text-slate-500">MIDI</div>
                            </div>

                            {chordResult && (
                                <div className="space-y-3">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between group">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase">Original Chard</div>
                                            <div className="text-sm font-bold text-white tracking-wide">{originalChordInput}</div>
                                        </div>
                                        <button onClick={() => playChord(chordResult.original)} className="p-2 bg-blue-500/20 rounded-full hover:bg-blue-500/40 text-blue-400 transition-all">
                                            <Play size={14} fill="currentColor" />
                                        </button>
                                    </div>
                                    <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20 flex items-center justify-between group">
                                        <div>
                                            <div className="text-[10px] text-emerald-500/70 uppercase">Negative Substitution</div>
                                            <div className="text-sm font-bold text-emerald-400 tracking-wide">
                                                {/* Simple heuristic for naming the negative chord */}
                                                {(originalChordInput.includes('7') && !originalChordInput.includes('maj7')) ? 'Sub: minor iv6' : 'Sub: Mirror Chord'}
                                            </div>
                                        </div>
                                        <button onClick={() => playChord(chordResult.negative, true)} className="p-2 bg-emerald-500/20 rounded-full hover:bg-emerald-500/40 text-emerald-400 transition-all">
                                            <Play size={14} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {!isReady && (
                        <button
                            onClick={startAudio}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl font-bold text-white shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Enable Audio Engine
                        </button>
                    )}
                </aside>

                {/* Main View Area */}
                <div className="flex-1 relative overflow-hidden flex flex-col p-8">
                    <AnimatePresence mode="wait">
                        {viewMode === 'circle' && (
                            <motion.div
                                key="circle"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="w-full h-full flex items-center justify-center"
                            >
                                <div className="relative w-[500px] h-[500px]">
                                    {/* SVG Chromatic Circle */}
                                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                        <defs>
                                            <radialGradient id="ringGradient" cx="50%" cy="50%" r="50%">
                                                <stop offset="70%" stopColor="transparent" />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                                            </radialGradient>
                                        </defs>

                                        {/* Outer Ring */}
                                        <circle cx="50" cy="50" r="48" fill="url(#ringGradient)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                                        {/* Axis Line */}
                                        {/* The axis is rootMidi + 3.5. 
                                            Angle = (rootPC + 3.5) * 30.
                                        */}
                                        <motion.line
                                            x1="50" y1="2" x2="50" y2="98"
                                            stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 1"
                                            className="opacity-40"
                                            style={{ rotate: (rootMidi % 12 + 3.5) * 30 }}
                                            transform-origin="50 50"
                                        />

                                        {/* Notes */}
                                        {Array.from({ length: 12 }).map((_, i) => {
                                            const angle = i * 30;
                                            const rad = angle * (Math.PI / 180);
                                            const x = 50 + 42 * Math.cos(rad);
                                            const y = 50 + 42 * Math.sin(rad);
                                            const pc = i;

                                            const isActive = midiActiveNotes.has(pc + 60) || midiActiveNotes.has(pc + 48) || midiActiveNotes.has(pc + 72);
                                            const isReflected = Array.from(reflectedNotes).some(n => n % 12 === pc);

                                            return (
                                                <g key={i}>
                                                    <circle
                                                        cx={x} cy={y}
                                                        r={isActive || isReflected ? "3.5" : "1.5"}
                                                        fill={isActive ? "#3b82f6" : isReflected ? "#10b981" : "rgba(255,255,255,0.1)"}
                                                        className="transition-all duration-300"
                                                    />
                                                    <text
                                                        x={x} y={y}
                                                        dy="-5"
                                                        textAnchor="middle"
                                                        fontSize="3"
                                                        fill={isActive ? "#3b82f6" : isReflected ? "#10b981" : "#64748b"}
                                                        fontWeight={isActive || isReflected ? "bold" : "normal"}
                                                        className="pointer-events-none transform rotate-90"
                                                    >
                                                        {midiToNoteName(pc + 60, rootNote).replace(/\d/, '')}
                                                    </text>

                                                    {/* Connection from original to reflected */}
                                                    {isActive && (
                                                        <motion.line
                                                            initial={{ pathLength: 0 }}
                                                            animate={{ pathLength: 1 }}
                                                            x1={x} y1={y}
                                                            // Calculate reflected point
                                                            x2={50 + 42 * Math.cos((2 * (rootMidi % 12 + 3.5) * 30 - angle) * Math.PI / 180)}
                                                            y2={50 + 42 * Math.sin((2 * (rootMidi % 12 + 3.5) * 30 - angle) * Math.PI / 180)}
                                                            stroke="url(#lineGradient)"
                                                            strokeWidth="0.5"
                                                            className="opacity-30"
                                                        />
                                                    )}
                                                </g>
                                            );
                                        })}

                                        <linearGradient id="lineGradient" gradientTransform="rotate(90)">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </svg>

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-white/10">{rootNote}</div>
                                            <div className="text-[10px] text-slate-600 uppercase tracking-widest">Axis Center</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {viewMode === 'table' && (
                            <motion.div
                                key="table"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-4xl mx-auto overflow-y-auto"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Chromatic Conversion (Key of {rootNote})</h4>
                                        <div className="space-y-1">
                                            <div className="grid grid-cols-3 text-[10px] text-slate-500 uppercase font-bold px-4 mb-2">
                                                <span>Original Note</span>
                                                <span className="text-center">Direction</span>
                                                <span className="text-right text-emerald-500">Negative Mapping</span>
                                            </div>
                                            {mapping.map((m, idx) => (
                                                <div key={idx} className="grid grid-cols-3 items-center px-4 py-2 hover:bg-white/5 rounded-lg transition-colors group">
                                                    <span className="text-slate-200 font-bold">{midiToNoteName(m.original, rootNote).slice(0, -1)}</span>
                                                    <div className="flex justify-center text-slate-600 group-hover:text-blue-500 transition-colors">
                                                        <ArrowLeftRight size={14} />
                                                    </div>
                                                    <span className="text-right text-emerald-400 font-bold">{midiToNoteName(m.negative, rootNote).slice(0, -1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8 text-sm text-slate-400 leading-relaxed">
                                        <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
                                            <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-4 uppercase text-xs tracking-wider">
                                                <Info size={16} /> How it works
                                            </h4>
                                            <p>
                                                Negative harmony isn't just "inverted" music. It's a mirror reflection across a specific axis: the midpoint between the <strong>Tonic</strong> (Root) and the <strong>Dominant</strong> (Perfect 5th).
                                            </p>
                                            <ul className="mt-4 space-y-2 list-disc list-inside marker:text-blue-500">
                                                <li>Major Chords become Minor</li>
                                                <li>Perfect Intervals stay Perfect</li>
                                                <li>Leading Tones pull "down" instead of "up"</li>
                                                <li>Voice leading becomes contrary motion</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {viewMode === 'example' && (
                            <motion.div
                                key="example"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-5xl mx-auto space-y-8"
                            >
                                <div className="p-8 bg-gradient-to-br from-blue-900/20 to-emerald-900/10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Music size={120} />
                                    </div>

                                    <div className="relative">
                                        <h2 className="text-3xl font-bold text-white mb-2">Autumn Leaves Reimagined</h2>
                                        <p className="text-slate-400 max-w-2xl mb-8">
                                            By reflecting the standard ii-V-I progressions of Autumn Leaves, we generate a "darker," more mysterious version that maintains the same structural stability but with inverted emotional valence.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                                                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter mb-4">Original Progression (Bb Major)</div>
                                                <div className="flex items-center gap-4 text-xl font-mono text-white mb-6">
                                                    <span className="p-3 bg-white/5 rounded-lg border border-white/10">Cm7</span>
                                                    <ArrowLeftRight className="text-slate-600" size={16} />
                                                    <span className="p-3 bg-white/5 rounded-lg border border-white/10">F7</span>
                                                    <ArrowLeftRight className="text-slate-600" size={16} />
                                                    <span className="p-3 bg-white/5 rounded-lg border border-white/10">Bbmaj7</span>
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Standard Bright ii-V-I
                                                </div>
                                            </div>

                                            <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
                                                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter mb-4">Negative Substitution</div>
                                                <div className="flex items-center gap-4 text-xl font-mono text-emerald-100 mb-6">
                                                    <span className="p-3 bg-white/10 rounded-lg border border-white/10">Fm7</span>
                                                    <ArrowLeftRight className="text-slate-600" size={16} />
                                                    <span className="p-3 bg-white/10 rounded-lg border border-white/10">Ebm6</span>
                                                    <ArrowLeftRight className="text-slate-600" size={16} />
                                                    <span className="p-3 bg-white/10 rounded-lg border border-white/10">Bbmaj7</span>
                                                </div>
                                                <div className="text-xs text-emerald-500/70 italic">
                                                    The "Minor Plagal" resolution. The V7 (F7) becomes the minor iv (Ebm6).
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-center">
                                            <button
                                                onClick={playComparison}
                                                className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Play size={20} fill="white" stroke="none" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-white">Compare Audio</div>
                                                    <div className="text-[10px] text-slate-500">Sequential playback of original vs mirror</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer Status */}
            <footer className="px-6 py-3 border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-medium z-20">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse" /> MIDI Input Connected</span>
                    <span>Tonal Center: {rootNote}</span>
                </div>
                <div>
                    Negative Harmony Module v2.0
                </div>
            </footer>
        </div>
    );
};

export default NegativeMirror;
