import React, { useState, useEffect } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMidiLibrary } from '../../../../hooks/useMidiLibrary';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { Play, Check, X } from 'lucide-react';
import { Button } from '../../../../modules/ChordBuildr/components/ui/button';

export const ProgressionsLevel: React.FC = () => {
    const { addScore, setPlaying } = useFunctionalEarTrainingStore();
    const { files } = useMidiLibrary();
    const [currentProgression, setCurrentProgression] = useState<any>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

    const [loading, setLoading] = useState(false);

    // Filter valid progressions
    const validFiles = files.filter(f => f.progression && f.progression.length > 0);

    const loadNewProgression = () => {
        if (validFiles.length === 0) return;

        setLoading(true);
        const randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
        setCurrentProgression(randomFile);

        // Generate options (1 correct, 3 distractors)
        const correct = randomFile.progression!;
        const distractors = new Set<string>();
        while (distractors.size < 3) {
            const randomDistractor = validFiles[Math.floor(Math.random() * validFiles.length)].progression!;
            if (randomDistractor !== correct) {
                distractors.add(randomDistractor);
            }
        }

        const allOptions = [correct, ...Array.from(distractors)];
        // Shuffle options
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        setOptions(allOptions);
        setSelectedOption(null);
        setResult(null);
        setLoading(false);
    };

    useEffect(() => {
        loadNewProgression();
    }, [files]); // Re-load when files are ready

    const playAudio = async () => {
        if (!currentProgression) return;
        setPlaying(true);

        try {
            await Tone.start();
            const url = await currentProgression.loadUrl();
            const midi = await Midi.fromUrl(url);

            const synths: Tone.PolySynth[] = [];
            const now = Tone.now() + 0.5;

            midi.tracks.forEach(track => {
                const synth = new Tone.PolySynth(Tone.Synth, {
                    envelope: {
                        attack: 0.02,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1
                    }
                }).toDestination();
                synths.push(synth);

                track.notes.forEach(note => {
                    synth.triggerAttackRelease(
                        note.name,
                        note.duration,
                        now + note.time,
                        note.velocity
                    );
                });
            });

            // Auto-stop after duration
            setTimeout(() => {
                synths.forEach(s => s.dispose());
                setPlaying(false);
            }, midi.duration * 1000 + 1000);

        } catch (e) {
            console.error("Failed to play MIDI", e);
            setPlaying(false);
        }
    };

    const handleOptionSelect = (option: string) => {
        if (result) return; // Prevent multiple guesses
        setSelectedOption(option);

        if (option === currentProgression.progression) {
            setResult('correct');
            addScore(100);
            setTimeout(loadNewProgression, 1500);
        } else {
            setResult('incorrect');
            addScore(-50);
        }
    };

    if (validFiles.length === 0) {
        return <div className="text-white">No progressions found in MIDI library.</div>;
    }

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Identify the Progression</h2>

            <div className="flex flex-col items-center gap-4">
                <Button
                    variant="default"
                    size="lg"
                    className="w-32 h-32 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 border-2 border-cyan-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    onClick={playAudio}
                    disabled={loading}
                >
                    <Play size={48} className="ml-2 text-cyan-50 fill-current" />
                </Button>
                <div className="text-white/50 text-sm">Key: {currentProgression?.key}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                {options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        disabled={!!result}
                        className={`
                            p-6 rounded-xl border transition-all duration-300 transform hover:scale-[1.02]
                            ${selectedOption === option
                                ? result === 'correct'
                                    ? 'bg-green-500/20 border-green-500 text-green-100'
                                    : 'bg-red-500/20 border-red-500 text-red-100'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }
                            ${result && option === currentProgression.progression ? 'bg-green-500/20 border-green-500 text-green-100 ring-2 ring-green-400 ring-offset-2 ring-offset-black' : ''}
                        `}
                    >
                        <div className="text-xl font-mono font-bold">{option}</div>
                    </button>
                ))}
            </div>

            {result && (
                <div className={`text-xl font-bold flex items-center gap-2 ${result === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                    {result === 'correct' ? (
                        <><Check className="w-6 h-6" /> Talk about perfect pitch!</>
                    ) : (
                        <><X className="w-6 h-6" /> Not quite right...</>
                    )}
                </div>
            )}

            <Button variant="ghost" className="text-white/30 hover:text-white" onClick={loadNewProgression}>
                Skip
            </Button>
        </div>
    );
};
