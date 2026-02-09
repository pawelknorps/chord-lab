import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { parseChord, CHORD_INTERVALS } from '../../../core/theory/index';

// Extended mapping for iReal Pro specific symbols to our Theory engine
const IREAL_QUALITY_MAP: Record<string, string> = {
    '-': 'min',
    'm': 'min',
    '-7': 'min7',
    'm7': 'min7',
    '^': 'maj7',
    'maj7': 'maj7',
    '7': 'dom7',
    'h': 'm7b5', // half diminished
    'o': 'dim7', // dim7
    'o7': 'dim7',
    'alt': '7alt',
    'sus': 'sus4',
    // Add more mappings as discovered
};

import {
    currentMeasureIndexSignal,
    currentBeatSignal,
    loopCountSignal,
    isPlayingSignal,
    bpmSignal,
    totalLoopsSignal,
    isLoadedSignal,
    pianoVolumeSignal,
    bassVolumeSignal,
    drumsVolumeSignal,
    reverbVolumeSignal,
    pianoReverbSignal
} from '../state/jazzSignals';

import { Signal } from "@preact/signals-react";

interface JazzPlaybackState {
    isPlayingSignal: Signal<boolean>;
    isLoadedSignal: Signal<boolean>;
    currentMeasureIndexSignal: Signal<number>;
    currentBeatSignal: Signal<number>;
    bpmSignal: Signal<number>;
    loopCountSignal: Signal<number>;
    totalLoopsSignal: Signal<number>;
    setTotalLoops: (count: number) => void;
    togglePlayback: () => void;
    setBpm: (bpm: number) => void;
}

export const useJazzPlayback = (song: any): JazzPlaybackState => {
    // We still keep local state for simple UI triggers if needed,
    // but the high-frequency updates will bypass React via Signals.
    // Actually, for maximum performance, we should use Signals everywhere possible.

    // Sync React state to Signals for backwards compatibility with existing UI if needed,
    // or just export the signals. For now let's keep the return object structure but use signals internally.

    const pianoRef = useRef<Tone.Sampler | null>(null);

    const bassRef = useRef<Tone.Sampler | null>(null);
    const drumsRef = useRef<{
        ride: Tone.Sampler;
        hihat: Tone.Sampler;
        snare: Tone.Sampler;
        kick: Tone.Sampler;
    } | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const pianoReverbRef = useRef<Tone.Reverb | null>(null);
    const lastChordRef = useRef<string>("");

    // Initialize Instruments & FX
    useEffect(() => {
        reverbRef.current = new Tone.Reverb({
            decay: 2.0,
            preDelay: 0.05,
            wet: reverbVolumeSignal.value
        }).toDestination();

        pianoReverbRef.current = new Tone.Reverb({
            decay: 2.5,
            preDelay: 0.1,
            wet: pianoReverbSignal.value
        }).toDestination();

        pianoRef.current = new Tone.Sampler({
            urls: {
                "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
                "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
                "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
                "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
                "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
                "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
                "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
                "A7": "A7.mp3", "C8": "C8.mp3"
            },
            release: 1,
            baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/piano/",
            volume: -12,
            onload: () => {
                if (bassRef.current?.loaded) isLoadedSignal.value = true;
            }
        }).connect(pianoReverbRef.current);

        // ELECTRIC BASS SAMPLER
        bassRef.current = new Tone.Sampler({
            urls: {
                "A#1": "As1.mp3", "C#1": "Cs1.mp3", "E1": "E1.mp3", "G1": "G1.mp3",
                "A#2": "As2.mp3", "C#2": "Cs2.mp3", "E2": "E2.mp3", "G2": "G2.mp3",
                "A#3": "As3.mp3", "C#3": "Cs3.mp3", "E3": "E3.mp3", "G3": "G3.mp3",
                "A#4": "As4.mp3", "C#4": "Cs4.mp3", "E4": "E4.mp3", "G4": "G4.mp3",
                "C#5": "Cs5.mp3"
            },
            baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/bass-electric/",
            volume: -8,
            release: 0.8,
            onload: () => {
                if (pianoRef.current?.loaded) isLoadedSignal.value = true;
            }
        }).connect(reverbRef.current);

        // NATE SMITH DRUM SAMPLES (Multi-Sampled)
        const drumBaseUrl = "/drum_samples/";
        drumsRef.current = {
            ride: new Tone.Sampler({
                urls: {
                    "C1": "Ride1_NateSmith.wav",
                    "D1": "Ride2_NateSmith.wav",
                    "E1": "RideBell_NateSmith.wav",
                    "F1": "CrashRide1_NateSmith.wav"
                },
                baseUrl: drumBaseUrl,
                volume: -10,
                onload: () => console.log('JazzKiller Ride loaded (multi)')
            }).connect(reverbRef.current),
            hihat: new Tone.Sampler({
                urls: {
                    "C1": "HiHatClosed1_NateSmith.wav",
                    "D1": "HiHatClosed2_NateSmith.wav",
                    "E1": "HiHatClosed3_NateSmith.wav",
                    "F1": "HiHatOpen1_NateSmith.wav"
                },
                baseUrl: drumBaseUrl,
                volume: -15,
                onload: () => console.log('JazzKiller HiHat loaded (multi)')
            }).connect(reverbRef.current),
            snare: new Tone.Sampler({
                urls: {
                    "C1": "SnareTight1_NateSmith.wav",
                    "D1": "SnareDeep1_NateSmith.wav",
                    "E1": "CrossStick1_NateSmith.wav"
                },
                baseUrl: drumBaseUrl,
                volume: -12,
                onload: () => console.log('JazzKiller Snare loaded (multi)')
            }).connect(reverbRef.current),
            kick: new Tone.Sampler({
                urls: {
                    "C1": "KickTight1_NateSmith.wav",
                    "D1": "KickTight2_NateSmith.wav",
                    "E1": "KickOpen1_NateSmith.wav"
                },
                baseUrl: drumBaseUrl,
                volume: -10,
                onload: () => console.log('JazzKiller Kick loaded (multi)')
            }).connect(reverbRef.current)
        };

        return () => {
            pianoRef.current?.dispose();
            bassRef.current?.dispose();
            drumsRef.current?.ride.dispose();
            drumsRef.current?.hihat.dispose();
            drumsRef.current?.snare.dispose();
            drumsRef.current?.kick.dispose();
            reverbRef.current?.dispose();
            pianoReverbRef.current?.dispose();
        };
    }, []);

    // Sync BPM & Swing
    useEffect(() => {
        Tone.Transport.bpm.value = bpmSignal.value;
        Tone.Transport.swing = 0.58;
        Tone.Transport.swingSubdivision = '8n';
    }, [bpmSignal.value]);

    // Sync Volumes
    useEffect(() => {
        if (pianoRef.current) pianoRef.current.volume.value = pianoVolumeSignal.value;
    }, [pianoVolumeSignal.value]);

    useEffect(() => {
        if (bassRef.current) bassRef.current.volume.value = bassVolumeSignal.value;
    }, [bassVolumeSignal.value]);

    useEffect(() => {
        if (drumsRef.current) {
            drumsRef.current.ride.volume.value = drumsVolumeSignal.value;
            drumsRef.current.hihat.volume.value = drumsVolumeSignal.value - 3; // Keep relative balance
            drumsRef.current.snare.volume.value = drumsVolumeSignal.value - 8;
            drumsRef.current.kick.volume.value = drumsVolumeSignal.value - 6;
        }
    }, [drumsVolumeSignal.value]);

    useEffect(() => {
        if (reverbRef.current) {
            reverbRef.current.wet.value = reverbVolumeSignal.value;
        }
    }, [reverbVolumeSignal.value]);

    useEffect(() => {
        if (pianoReverbRef.current) {
            pianoReverbRef.current.wet.value = pianoReverbSignal.value;
        }
    }, [pianoReverbSignal.value]);

    // Playback Logic
    useEffect(() => {
        if (!song || !song.music || !song.music.measures) return;

        Tone.Transport.cancel();
        currentMeasureIndexSignal.value = -1;

        const measures = song.music.measures;

        const loop = new Tone.Loop((time) => {
            const position = Tone.Transport.position.toString().split(':');
            const bar = parseInt(position[0]);
            const beat = parseInt(position[1]);

            const measureIndex = bar % measures.length;
            const currentLoop = Math.floor(bar / measures.length);

            // STOP if max loops reached
            if (currentLoop >= totalLoopsSignal.value) {
                Tone.Transport.stop();
                isPlayingSignal.value = false;
                currentMeasureIndexSignal.value = -1;
                loopCountSignal.value = 0;
                return;
            }

            Tone.Draw.schedule(() => {
                currentMeasureIndexSignal.value = measureIndex;
                currentBeatSignal.value = beat;
                loopCountSignal.value = currentLoop;
            }, time);

            const measure = measures[measureIndex];
            const nextMeasure = measures[(measureIndex + 1) % measures.length];
            const chords = measure.chords || [];

            // Determine current chord
            let currentChordSymbol = "";
            let nextChordSymbol = "";

            if (chords.length === 1) {
                currentChordSymbol = chords[0];
                nextChordSymbol = nextMeasure.chords?.[0] || chords[0];
            } else if (chords.length === 2) {
                currentChordSymbol = beat < 2 ? chords[0] : chords[1];
                nextChordSymbol = beat < 2 ? chords[1] : (nextMeasure.chords?.[0] || chords[0]);
            } else {
                currentChordSymbol = chords[Math.min(beat, chords.length - 1)];
                nextChordSymbol = chords[Math.min(beat + 1, chords.length - 1)] || nextMeasure.chords?.[0];
            }

            // --- WALKING BASS (Every Beat) ---
            if (currentChordSymbol) {
                const { root, quality } = parseChord(currentChordSymbol);
                const rootMidi = Tone.Frequency(root + "2").toMidi();
                let targetNote: string;

                if (beat === 0) {
                    targetNote = root + "2";
                } else if (beat === 3 && nextChordSymbol) {
                    // Chromatic approach to next chord
                    const { root: nextRoot } = parseChord(nextChordSymbol);
                    const nextMidi = Tone.Frequency(nextRoot + "2").toMidi();
                    const approachMidi = Math.random() > 0.5 ? nextMidi + 1 : nextMidi - 1;
                    targetNote = Tone.Frequency(approachMidi, "midi").toNote();
                } else {
                    // Scale/Arpeggio tones
                    const intervals = CHORD_INTERVALS[IREAL_QUALITY_MAP[quality] || quality] || CHORD_INTERVALS['maj'];
                    const candidates = intervals.map(i => rootMidi + i);
                    const chosenMidi = candidates[Math.floor(Math.random() * candidates.length)];
                    targetNote = Tone.Frequency(chosenMidi, "midi").toNote();
                }

                const vel = beat === 0 ? 0.9 : 0.7 + Math.random() * 0.2;
                if (bassRef.current?.loaded) {
                    bassRef.current?.triggerAttackRelease(targetNote, "4n", time, vel);
                }
            }

            // --- PIANO COMPING (Predictable & Reliable) ---
            let shouldPlayComp = false;
            let compOffset = 0;
            let compDuration = "2n";

            // 1. ALWAYS play if the chord just changed (to ensure no chord is skipped)
            const isNewChord = currentChordSymbol !== lastChordRef.current;
            if (isNewChord && currentChordSymbol !== "") {
                shouldPlayComp = true;
                compOffset = 0;
                compDuration = "2n";
                lastChordRef.current = currentChordSymbol;
            }
            // 2. Otherwise, play on predictable beats if we didn't just play a new chord
            else {
                // Determine a stable pattern for this measure based on bar index
                const measurePattern = (bar % 3);

                if (measurePattern === 0) { // The Charleston
                    if (beat === 0) { shouldPlayComp = true; compOffset = 0; compDuration = "4n."; }
                    if (beat === 1) { shouldPlayComp = true; compOffset = 0.5; compDuration = "8n"; }
                } else if (measurePattern === 1) { // Red Garland Style (On the "and" of 2 and 4)
                    if (beat === 1 || beat === 3) { shouldPlayComp = true; compOffset = 0.5; compDuration = "8n"; }
                } else { // Relaxed half notes
                    if (beat === 0 || beat === 2) { shouldPlayComp = true; compOffset = 0; compDuration = "2n"; }
                }
            }

            if (shouldPlayComp && currentChordSymbol) {
                const cleanSymbol = currentChordSymbol.replace(/\(.*?\)/g, '').replace(/[\[\]]/g, '').trim();
                if (cleanSymbol) {
                    let { root, quality } = parseChord(cleanSymbol);
                    if (IREAL_QUALITY_MAP[quality]) quality = IREAL_QUALITY_MAP[quality];
                    if (quality.includes('^')) quality = 'maj7';

                    const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'];
                    const midiRoot = Tone.Frequency(root + "4").toMidi();

                    if (midiRoot) {
                        // Humanization logic
                        const jitter = () => (Math.random() - 0.5) * 0.015;
                        const baseVel = 0.4 + Math.random() * 0.2;

                        const notes = intervals.map(i => Tone.Frequency(midiRoot + i, "midi").toNote());

                        if (pianoRef.current?.loaded) {
                            notes.forEach((note, idx) => {
                                // Micro-stagger (Strum)
                                const stagger = idx * (0.01 + Math.random() * 0.02);
                                const noteVel = baseVel * (0.9 + Math.random() * 0.2);
                                pianoRef.current?.triggerAttackRelease(
                                    note,
                                    compDuration,
                                    time + (compOffset * Tone.Time("4n").toSeconds()) + jitter() + stagger,
                                    noteVel
                                );
                            });
                        }
                    }
                }
            }

            // --- SWING DRUMS (Advanced Jazz Pattern) ---
            if (drumsRef.current) {
                // Humanization
                const jitter = () => (Math.random() - 0.5) * 0.012;
                const isStrongBeat = beat === 0 || beat === 2;

                // 1. Ride Cymbal (Varied notes & dynamics)
                const rideNote = Math.random() > 0.9 ? "E1" : (Math.random() > 0.4 ? "D1" : "C1");
                const rideVel = (isStrongBeat ? 0.6 : 0.4) + (Math.random() * 0.1);
                drumsRef.current.ride.triggerAttack(rideNote, time + jitter(), rideVel);

                // The "skip" beat
                // Support 3/4: assuming 4 beats for now, but if beat > 2 we might be in 4/4.
                // Dynamic skip logic
                const shouldSkip = (beat === 1 || beat === 3 || Math.random() > 0.75);
                if (shouldSkip) {
                    const skipTime = time + Tone.Time("4n").toSeconds() * 0.66;
                    const skipVel = 0.2 + (Math.random() * 0.15);
                    drumsRef.current.ride.triggerAttack(rideNote, skipTime + jitter(), skipVel);
                }

                // 2. Hi-hat foot (Standard 2 & 4)
                if (beat === 1 || beat === 3) {
                    const hhNote = Math.random() > 0.7 ? "D1" : "C1";
                    drumsRef.current.hihat.triggerAttack(hhNote, time + jitter(), 0.5 + Math.random() * 0.1);
                }

                // 3. Kick Feathering (Steady 4/4)
                const kickNote = Math.random() > 0.85 ? "D1" : "C1";
                drumsRef.current.kick.triggerAttack(kickNote, time + jitter(), 0.15);

                // 4. Snare Comping (Random syncopation)
                if (Math.random() > 0.65) {
                    const snareNote = Math.random() > 0.7 ? "D1" : (Math.random() > 0.9 ? "E1" : "C1");
                    const snareVel = 0.1 + Math.random() * 0.2;
                    const snareOffset = (Math.random() > 0.5 ? Tone.Time("8t").toSeconds() : Tone.Time("8t").toSeconds() * 2);
                    drumsRef.current.snare.triggerAttack(snareNote, time + snareOffset + jitter(), snareVel);
                }

                // 5. Accent / Crash
                if (beat === 0 && Math.random() > 0.9) {
                    drumsRef.current.ride.triggerAttack("F1", time, 0.4);
                }
            }

        }, "4n").start(0);

        return () => {
            loop.dispose();
        };
    }, [song, bpmSignal.value, totalLoopsSignal.value]);


    const togglePlayback = async () => {
        if (isPlayingSignal.value) {
            Tone.Transport.stop();
            isPlayingSignal.value = false;
            currentMeasureIndexSignal.value = -1;
            currentBeatSignal.value = -1;
            loopCountSignal.value = 0;
        } else {
            await Tone.start();
            Tone.Transport.start();
            isPlayingSignal.value = true;
        }
    };

    return {
        isPlayingSignal,
        isLoadedSignal,
        currentMeasureIndexSignal,
        currentBeatSignal,
        bpmSignal,
        loopCountSignal,
        totalLoopsSignal,
        setTotalLoops: (val: number) => totalLoopsSignal.value = val,
        togglePlayback,
        setBpm: (val: number) => bpmSignal.value = val
    };
};
