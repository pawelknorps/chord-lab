import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { Play, Square, RefreshCw } from 'lucide-react';
import { GRIPS, constructGrip, generateMelody } from './gripTheory';
import { midiToNoteName } from '../../core/theory';
import { useAudio } from '../../context/AudioContext';
import { piano } from '../../core/audio/globalAudio';
import GripRadar from './GripRadar';
import { InteractivePiano } from '../../components/InteractivePiano';

const SEQUENCE_LENGTH = 8;

const GripSequencer: React.FC = () => {
    const { isReady, startAudio } = useAudio();
    const [melody, setMelody] = useState<number[]>([]);
    const [selectedGrips, setSelectedGrips] = useState<string[]>(Array(SEQUENCE_LENGTH).fill('Q1'));
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
    const [userNotes, setUserNotes] = useState<Set<number>>(new Set());

    useEffect(() => {
        // Gen initial melody
        setMelody(generateMelody(SEQUENCE_LENGTH));
    }, []);

    const handlePlay = async () => {
        if (!isReady) await startAudio();

        if (isPlaying) {
            setIsPlaying(false);
            setActiveIndex(null);
            Tone.Transport.stop();
            Tone.Transport.cancel();
            return;
        }

        setIsPlaying(true);
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.bpm.value = 100;

        // Schedule Events
        selectedGrips.forEach((gripName, i) => {
            const time = i * 0.6; // 0.6s per step

            Tone.Transport.schedule((t) => {
                // Use Tone.Draw for UI updates synchronized with audio
                Tone.Draw.schedule(() => {
                    setActiveIndex(i);
                    const topNote = melody[i];
                    const notesMidi = constructGrip(topNote, gripName);
                    setHighlightedNotes(notesMidi);
                }, t);

                if (piano) {
                    const topNote = melody[i];
                    const notesMidi = constructGrip(topNote, gripName);
                    const notes = notesMidi.map(n => midiToNoteName(n));

                    // Use the global piano for high-quality sound
                    piano.triggerAttackRelease(notes, '2n', t);
                }
            }, time);
        });

        // Schedule stop accurately
        const endTime = selectedGrips.length * 0.6 + 0.5;
        Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => {
                setIsPlaying(false);
                setActiveIndex(null);
                setHighlightedNotes([]);
            }, t);
            Tone.Transport.stop(t);
        }, endTime);

        Tone.Transport.start();
    };

    const setGripAtStep = (stepIndex: number, gripName: string) => {
        const newGrips = [...selectedGrips];
        newGrips[stepIndex] = gripName;
        setSelectedGrips(newGrips);

        // Preview
        if (piano && isReady) {
            const topNote = melody[stepIndex];
            const notesMidi = constructGrip(topNote, gripName);
            setHighlightedNotes(notesMidi);
            const notes = notesMidi.map(n => midiToNoteName(n));
            piano.triggerAttackRelease(notes, '4n');
        }
    };

    const currentGripName = activeIndex !== null ? selectedGrips[activeIndex] : selectedGrips[0];
    const currentGripColor = GRIPS.find(g => g.name === currentGripName)?.color || '#3b82f6';

    const isMatch = highlightedNotes.length > 0 &&
        highlightedNotes.every(n => userNotes.has(n)) &&
        userNotes.size === highlightedNotes.length;

    const handleUserNoteOn = (midi: number) => {
        setUserNotes(prev => new Set(prev).add(midi));
        if (piano && isReady) {
            piano.triggerAttack(midiToNoteName(midi), Tone.now());
        }
    };

    const handleUserNoteOff = (midi: number) => {
        setUserNotes(prev => {
            const next = new Set(prev);
            next.delete(midi);
            return next;
        });
        if (piano && isReady) {
            piano.triggerRelease(midiToNoteName(midi), Tone.now());
        }
    };

    return (
        <div className="h-full flex flex-col p-8 bg-[var(--bg-app)] text-[var(--text-primary)]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Grip Sequencer</h2>
                    <p className="text-[var(--text-secondary)] text-sm">Planar harmony: Coloring the melody with constant structures.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setMelody(generateMelody(SEQUENCE_LENGTH))}
                        className="p-3 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-all"
                        title="New Melody"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={handlePlay}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all text-sm border ${isPlaying ? 'bg-red-500/10 text-red-500 border-red-500/50' : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
                    >
                        {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        {isPlaying ? 'Stop' : 'Play Sheet'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-8 overflow-hidden">
                {/* Sequencer Grid Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Melody Row */}
                    <div className="flex mb-4 ml-32">
                        {melody.map((noteMidi, i) => (
                            <div key={i} className="flex-1 text-center">
                                <div className={`
                                 w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm mb-2 border
                                 ${activeIndex === i ? 'bg-[var(--text-primary)] text-[var(--bg-app)] border-[var(--text-primary)] scale-110' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]'}
                                 transition-all duration-300
                             `}>
                                    {midiToNoteName(noteMidi).slice(0, -1)}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Note</div>
                            </div>
                        ))}
                    </div>

                    {/* Grips Rows */}
                    <div className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md overflow-y-auto">
                        {GRIPS.map((grip) => (
                            <div key={grip.name} className="flex items-center h-16 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors">
                                {/* Row Label */}
                                <div className="w-32 flex flex-col justify-center px-4 border-r border-[var(--border-subtle)] h-full">
                                    <span className="font-bold text-sm" style={{ color: grip.color }}>{grip.name}</span>
                                    <span className="text-[10px] text-[var(--text-muted)]">{grip.description}</span>
                                </div>

                                {/* Grid Cells */}
                                <div className="flex-1 flex px-2 gap-1 items-center h-full">
                                    {Array.from({ length: SEQUENCE_LENGTH }).map((_, stepIndex) => {
                                        const isSelected = selectedGrips[stepIndex] === grip.name;
                                        const isActive = activeIndex === stepIndex;

                                        return (
                                            <div key={stepIndex} className="flex-1 h-10">
                                                <button
                                                    onClick={() => setGripAtStep(stepIndex, grip.name)}
                                                    className={`
                                                     w-full h-full rounded-sm transition-all duration-100 border
                                                     ${isSelected
                                                            ? 'opacity-100 border-transparent shadow-sm'
                                                            : 'opacity-0 hover:opacity-100 bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'}
                                                     ${isActive && isSelected ? 'brightness-125 scale-105' : ''}
                                                 `}
                                                    style={{ backgroundColor: isSelected ? grip.color : undefined }}
                                                >
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Radar and Theory Panel */}
                <div className="w-80 flex flex-col gap-6">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md p-6 flex flex-col items-center justify-center flex-1">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-[var(--text-muted)]">Grip Radar</h3>
                        <div className="flex-1 w-full relative min-h-[200px]">
                            <GripRadar
                                gripName={currentGripName}
                                color={currentGripColor}
                                isActive={isPlaying}
                            />
                        </div>
                    </div>

                    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md p-6 border-l-4" style={{ borderLeftColor: currentGripColor }}>
                        <h3 className="text-sm font-bold mb-4">Theory Corner</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest block mb-1">Structure</span>
                                <div className="flex flex-wrap gap-2">
                                    {GRIPS.find(g => g.name === currentGripName)?.intervalsDownNames.map((name, i) => (
                                        <span key={i} className="text-[10px] px-2 py-1 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)] font-mono">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest block mb-1">Concept</span>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    {GRIPS.find(g => g.name === currentGripName)?.theory}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Match Feedback */}
                        {highlightedNotes.length > 0 && (
                            <div className={`mt-6 p-3 rounded-md border transition-all duration-300 flex items-center justify-center gap-3 ${isMatch ? 'bg-green-500/10 border-green-500/50' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'}`}>
                                <div className={`w-2 h-2 rounded-full ${isMatch ? 'bg-green-500' : 'bg-[var(--text-muted)]'}`} />
                                <span className={`text-xs font-bold ${isMatch ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                                    {isMatch ? 'MATCH FOUND' : 'PLAY THIS GRIP'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-xs text-[var(--text-muted)] font-mono">
                    {isMatch ? "CORRECT INTERVAL STRUCTURE" : "WATCH THE PIANO TO SEE CONSTANT STRUCTURE MOVEMENT"}
                </p>
                <InteractivePiano
                    startOctave={3}
                    endOctave={6}
                    enableSound={false}
                    highlightedNotes={highlightedNotes}
                    onNoteOn={handleUserNoteOn}
                    onNoteOff={handleUserNoteOff}
                />
            </div>
        </div >
    );
};

export default GripSequencer;
