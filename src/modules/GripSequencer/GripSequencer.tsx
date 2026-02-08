import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, RefreshCw } from 'lucide-react';
import { GRIPS, constructGrip, generateMelody } from './gripTheory';
import { midiToNoteName } from '../../core/theory';
import { useAudio } from '../../context/AudioContext';
import GripRadar from './GripRadar';
import { InteractivePiano } from '../../components/InteractivePiano';

const SEQUENCE_LENGTH = 8;

const GripSequencer: React.FC = () => {
    const { isReady, startAudio } = useAudio();
    const [melody, setMelody] = useState<number[]>([]);
    const [selectedGrips, setSelectedGrips] = useState<string[]>(Array(SEQUENCE_LENGTH).fill('Q1'));
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Synth for playback
    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        // Init Audio
        if (isReady && !synthRef.current) {
            // Lush Pad sound
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                envelope: { attack: 0.2, decay: 0.3, sustain: 0.8, release: 1.5 },
                oscillator: { type: 'triangle' },
                volume: -8
            }).toDestination();

            // Add some Chorus/Reverb
            const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
            const reverb = new Tone.Reverb(3).toDestination();
            synthRef.current.connect(chorus);
            synthRef.current.connect(reverb);
        }

        // Gen initial melody
        setMelody(generateMelody(SEQUENCE_LENGTH));

        return () => {
            synthRef.current?.dispose();
        };
    }, [isReady]);

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
        Tone.Transport.cancel();
        Tone.Transport.bpm.value = 100;

        // Schedule Events
        const now = Tone.now();

        selectedGrips.forEach((gripName, i) => {
            const time = i * 0.6; // 0.6s per step

            Tone.Transport.schedule((t) => {
                Tone.Draw.schedule(() => setActiveIndex(i), t);

                if (synthRef.current) {
                    const topNote = melody[i];
                    const notesMidi = constructGrip(topNote, gripName);
                    const notes = notesMidi.map(n => midiToNoteName(n));

                    synthRef.current.triggerAttackRelease(notes, '2n', t);
                }
            }, now + time);
        });

        // Schedule stop
        Tone.Transport.schedule(() => {
            setIsPlaying(false);
            setActiveIndex(null);
        }, now + selectedGrips.length * 0.6 + 0.5);

        Tone.Transport.start();
    };

    const setGripAtStep = (stepIndex: number, gripName: string) => {
        const newGrips = [...selectedGrips];
        newGrips[stepIndex] = gripName;
        setSelectedGrips(newGrips);

        // Preview
        if (synthRef.current && isReady) {
            const topNote = melody[stepIndex];
            const notesMidi = constructGrip(topNote, gripName);
            const notes = notesMidi.map(n => midiToNoteName(n));
            synthRef.current.triggerAttackRelease(notes, '4n');
        }
    };

    const currentGripName = activeIndex !== null ? selectedGrips[activeIndex] : selectedGrips[0];
    const currentGripColor = GRIPS.find(g => g.name === currentGripName)?.color || '#3b82f6';

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

                {/* Radar Visualization Panel */}
                <div className="w-80 glass-panel rounded-xl p-6 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold mb-4 neon-text">Grip Radar</h3>
                    <div className="flex-1 w-full relative">
                        <GripRadar
                            gripName={currentGripName}
                            color={currentGripColor}
                            isActive={isPlaying}
                        />
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-400">
                        <p>Visualizing harmonic tension and interval structure.</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <InteractivePiano startOctave={3} endOctave={6} enableSound={true} />
            </div>
        </div>
    );
};

export default GripSequencer;
