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
        <div className="h-full flex flex-col p-8 bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold neon-text">Grip Sequencer</h2>
                    <p className="text-gray-400">Planar harmony: Coloring the melody with constant structures.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setMelody(generateMelody(SEQUENCE_LENGTH))}
                        className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"
                        title="New Melody"
                    >
                        <RefreshCw />
                    </button>
                    <button
                        onClick={handlePlay}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isPlaying ? 'bg-red-500' : 'bg-green-500 hover:bg-green-400'}`}
                    >
                        {isPlaying ? <Square fill="currentColor" /> : <Play fill="currentColor" />}
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
                                 w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-2
                                 ${activeIndex === i ? 'bg-white text-black scale-110' : 'bg-gray-700'}
                                 transition-all duration-300
                             `}>
                                    {midiToNoteName(noteMidi).slice(0, -1)}
                                </div>
                                <div className="text-xs text-gray-500">Note</div>
                            </div>
                        ))}
                    </div>

                    {/* Grips Rows */}
                    <div className="flex-1 glass-panel rounded-xl p-4 overflow-y-auto">
                        {GRIPS.map((grip) => (
                            <div key={grip.name} className="flex items-center h-20 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                {/* Row Label */}
                                <div className="w-32 flex flex-col justify-center pr-4">
                                    <span className="font-bold text-lg" style={{ color: grip.color }}>{grip.name}</span>
                                    <span className="text-xs text-gray-400">{grip.description}</span>
                                </div>

                                {/* Grid Cells */}
                                <div className="flex-1 flex gap-2">
                                    {Array.from({ length: SEQUENCE_LENGTH }).map((_, stepIndex) => {
                                        const isSelected = selectedGrips[stepIndex] === grip.name;
                                        const isActive = activeIndex === stepIndex;

                                        return (
                                            <div key={stepIndex} className="flex-1 h-full py-1">
                                                <button
                                                    onClick={() => setGripAtStep(stepIndex, grip.name)}
                                                    className={`
                                                     w-full h-full rounded-lg transition-all duration-200
                                                     ${isSelected
                                                            ? 'opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                                            : 'opacity-10 hover:opacity-30 bg-gray-600'}
                                                     ${isActive && isSelected ? 'brightness-150 scale-105' : ''}
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
                <div className="w-96 flex flex-col gap-6">
                    <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center flex-1">
                        <h3 className="text-xl font-bold mb-4 neon-text">Grip Radar</h3>
                        <div className="flex-1 w-full relative min-h-[200px]">
                            <GripRadar
                                gripName={currentGripName}
                                color={currentGripColor}
                                isActive={isPlaying}
                            />
                        </div>
                    </div>

                    <div className="glass-panel rounded-xl p-6 border-l-4" style={{ borderColor: currentGripColor }}>
                        <h3 className="text-lg font-bold mb-2">Theory Corner</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Structure</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {GRIPS.find(g => g.name === currentGripName)?.intervalsDownNames.map((name, i) => (
                                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/10 rounded border border-white/10">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Concept</span>
                                <p className="text-sm text-gray-300 leading-relaxed mt-1">
                                    {GRIPS.find(g => g.name === currentGripName)?.theory}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Match Feedback */}
                        {highlightedNotes.length > 0 && (
                            <div className={`mt-6 p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-center gap-3 ${isMatch ? 'bg-green-500/20 border-green-500 scale-105' : 'bg-white/5 border-white/10'}`}>
                                <div className={`w-3 h-3 rounded-full ${isMatch ? 'bg-green-500 animate-ping' : 'bg-gray-600'}`} />
                                <span className={`font-bold transition-colors ${isMatch ? 'text-green-400' : 'text-gray-500'}`}>
                                    {isMatch ? 'GRIP MATCH FOUND!' : 'Try playing this grip...'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-sm text-gray-400 font-medium italic">
                    {isMatch ? "Perfect! That's the correct interval structure." : "Watch the piano to see how these constant structures move..."}
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
        </div>
    );
};

export default GripSequencer;
