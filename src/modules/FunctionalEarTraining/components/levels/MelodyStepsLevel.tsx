import React, { useState, useEffect } from 'react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { useMidiLibrary } from '../../../../hooks/useMidiLibrary';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { Play, Check, X, ArrowRight } from 'lucide-react';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';

const ALL_INTERVALS = [
    { label: '9', value: 14, semitones: 2, difficulty: ['Novice', 'Advanced', 'Pro'] },
    { label: '11', value: 17, semitones: 5, difficulty: ['Novice', 'Advanced', 'Pro'] },
    { label: '13', value: 21, semitones: 9, difficulty: ['Novice', 'Advanced', 'Pro'] },
    { label: 'b9', value: 13, semitones: 1, difficulty: ['Advanced', 'Pro'] },
    { label: '#9', value: 15, semitones: 3, difficulty: ['Advanced', 'Pro'] },
    { label: '#11', value: 18, semitones: 6, difficulty: ['Advanced', 'Pro'] },
    { label: 'b13', value: 20, semitones: 8, difficulty: ['Advanced', 'Pro'] },
];

export const MelodyStepsLevel: React.FC = () => {
    const { addScore, setPlaying, difficulty, streak } = useFunctionalEarTrainingStore();
    const { addExperience, updateStreak } = useMasteryStore();
    const { files } = useMidiLibrary();
    const [currentChord, setCurrentChord] = useState<any>(null);
    const [targetInterval, setTargetInterval] = useState<any>(null);
    const [options, setOptions] = useState<any[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [loading, setLoading] = useState(false);

    const validFiles = files.filter((f: any) => f.progression && f.progression.length > 0);

    const loadNewChallenge = async () => {
        if (validFiles.length === 0) return;
        setLoading(true);
        setResult(null);
        setSelectedOption(null);

        const currentPool = ALL_INTERVALS.filter(i => i.difficulty.includes(difficulty));

        // Pick random file
        const randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];

        try {
            const url = await randomFile.loadUrl();
            const midi = await Midi.fromUrl(url);

            const track = midi.tracks[0];
            const notes = track.notes;

            if (notes.length < 3) {
                loadNewChallenge();
                return;
            }

            const timeSlots: { [time: string]: any[] } = {};
            notes.forEach(note => {
                const time = note.time.toFixed(2);
                if (!timeSlots[time]) timeSlots[time] = [];
                timeSlots[time].push(note);
            });

            const times = Object.keys(timeSlots);
            const randomTime = times[Math.floor(Math.random() * times.length)];
            const chordNotes = timeSlots[randomTime];

            chordNotes.sort((a, b) => a.midi - b.midi);
            const root = chordNotes[0];

            const randomInterval = currentPool[Math.floor(Math.random() * currentPool.length)];

            setCurrentChord({
                notes: chordNotes,
                root: root,
                file: randomFile
            });
            setTargetInterval(randomInterval);

            const distractors = currentPool.filter(i => i.label !== randomInterval.label)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const allOptions = [randomInterval, ...distractors].sort(() => 0.5 - Math.random());
            setOptions(allOptions);

            setLoading(false);

        } catch (e) {
            console.error("Error loading MIDI for melody steps", e);
            setLoading(false);
            setTimeout(loadNewChallenge, 100);
        }
    };

    useEffect(() => {
        if (files.length > 0) loadNewChallenge();
    }, [files, difficulty]);

    const playAudio = async () => {
        if (!currentChord || !targetInterval) return;
        setPlaying(true);
        await Tone.start();

        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { release: 1 }
        }).toDestination();

        const melodySynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { release: 0.5 }
        }).toDestination();

        const now = Tone.now();

        currentChord.notes.forEach((note: any) => {
            synth.triggerAttackRelease(note.name, "2n", now);
        });

        const rootMidi = currentChord.root.midi;
        const targetMidi = rootMidi + targetInterval.semitones + 12;
        const targetFreq = Tone.Frequency(targetMidi, "midi").toFrequency();

        melodySynth.triggerAttackRelease(targetFreq, "4n", now + 0.6);

        setTimeout(() => {
            setPlaying(false);
            synth.dispose();
            melodySynth.dispose();
        }, 2000);
    };

    const handleOptionSelect = (optionLabel: string) => {
        if (result) return;
        setSelectedOption(optionLabel);

        const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 1.5 : 3;

        if (optionLabel === targetInterval.label) {
            setResult('correct');
            const points = Math.floor(100 * multiplier) + streak * 10;
            addScore(points);
            addExperience('FET', Math.floor(points / 2));
            updateStreak('FET', streak + 1);
            setTimeout(loadNewChallenge, 1500);
        } else {
            setResult('incorrect');
            addScore(0);
            updateStreak('FET', 0);
        }
    };

    if (!currentChord) return (
        <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin mb-4" />
            <div className="text-white/40 font-bold uppercase tracking-widest text-xs">Curating Challenges...</div>
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-10 w-full max-w-2xl fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tight">Melody Extensions</h2>
                <p className="text-white/40 font-medium">
                    Analyze the vertical relationship between the chord and its upper melodic step.
                </p>
            </div>

            <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <button
                        className="relative w-36 h-36 rounded-full bg-black flex items-center justify-center transition-all border border-white/10 group-active:scale-95 shadow-2xl"
                        onClick={playAudio}
                        disabled={loading}
                    >
                        <Play size={48} className="ml-2 text-white fill-current group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
                    </button>
                </div>
                <div className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] uppercase font-black tracking-tighter text-white/30">
                    Difficulty: {difficulty} • Source: {currentChord.file.name}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(option.label)}
                        disabled={!!result}
                        className={`
                            group relative p-8 rounded-3xl border transition-all duration-500 overflow-hidden
                            ${selectedOption === option.label
                                ? result === 'correct'
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'bg-red-500/20 border-red-500 text-red-500'
                                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white'
                            }
                        `}
                    >
                        {selectedOption === option.label && result === 'correct' && (
                            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
                        )}
                        <div className="relative z-10">
                            <div className="text-3xl font-black mb-1">{option.label}</div>
                            <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Extension</div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="h-12 flex items-center justify-center">
                {result && (
                    <div className={`text-xl font-black flex items-center gap-3 animate-reveal ${result === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result === 'correct' ? (
                            <><Check className="w-7 h-7" /> EXCELLENT HEARING</>
                        ) : (
                            <><X className="w-7 h-7" /> ANALYZING NEXT QUALITY</>
                        )}
                    </div>
                )}
            </div>

            <button
                className="group flex items-center gap-3 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest mt-4"
                onClick={loadNewChallenge}
            >
                SKIP CHALLENGE
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                    <ArrowRight size={14} />
                </div>
            </button>
        </div>
    );
};
