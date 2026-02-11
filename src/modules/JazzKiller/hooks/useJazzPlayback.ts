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
    pianoReverbSignal,
    currentChordSymbolSignal
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
    togglePlayback: () => void;
    setBpm: (bpm: number) => void;
    playChord: (symbol: string) => void;
}

export const useJazzPlayback = (song: any, isActive: boolean = true): JazzPlaybackState => {
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

        // Piano: High-quality AAC (New HD Engine Samples)
        pianoRef.current = new Tone.Sampler({
            urls: {
                "C2": "C2.m4a", "F#2": "Fs2.m4a",
                "C3": "C3.m4a", "F#3": "Fs3.m4a",
                "C4": "C4.m4a", "F#4": "Fs4.m4a",
                "C5": "C5.m4a"
            },
            release: 1.2,
            baseUrl: "/audio/piano/",
            volume: pianoVolumeSignal.value,
            onload: () => {
                if (bassRef.current?.loaded) isLoadedSignal.value = true;
            }
        }).connect(pianoReverbRef.current);

        // Bass: High-quality AAC (New HD Engine Samples)
        bassRef.current = new Tone.Sampler({
            urls: {
                "E1": "E1.m4a", "A#1": "As1.m4a",
                "E2": "E2.m4a", "A#2": "As2.m4a",
                "E3": "E3.m4a", "A#3": "As3.m4a"
            },
            baseUrl: "/audio/bass/",
            volume: bassVolumeSignal.value,
            release: 0.8,
            onload: () => {
                if (pianoRef.current?.loaded) isLoadedSignal.value = true;
            }
        }).connect(reverbRef.current);

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
                volume: drumsVolumeSignal.value,
                onload: () => console.log('JazzKiller Ride loaded')
            }).connect(reverbRef.current),
            hihat: new Tone.Sampler({
                urls: {
                    "C1": "HiHatClosed1_NateSmith.wav",
                    "D1": "HiHatClosed2_NateSmith.wav",
                    "E1": "HiHatClosed3_NateSmith.wav",
                    "F1": "HiHatOpen1_NateSmith.wav"
                },
                baseUrl: drumBaseUrl,
                volume: drumsVolumeSignal.value - 3,
                onload: () => console.log('JazzKiller HiHat loaded')
            }).connect(reverbRef.current),
            snare: new Tone.Sampler({
                urls: {
                    "C1": "SnareTight1_NateSmith.wav",
                    "D1": "SnareDeep1_NateSmith.wav",
                    "E1": "CrossStick1_NateSmith.wav"
                },
                baseUrl: drumBaseUrl,
                volume: drumsVolumeSignal.value - 8,
                onload: () => console.log('JazzKiller Snare loaded')
            }).connect(reverbRef.current),
            kick: new Tone.Sampler({
                urls: {
                    "C1": "KickTight1_NateSmith.wav",
                    "D1": "KickTight2_NateSmith.wav",
                    "E1": "KickOpen1_NateSmith.wav"
                },
                baseUrl: drumBaseUrl,
                volume: drumsVolumeSignal.value - 6,
                onload: () => console.log('JazzKiller Kick loaded')
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

    useEffect(() => {
        Tone.Transport.bpm.value = bpmSignal.value;
        Tone.Transport.swing = 0.58;
        Tone.Transport.swingSubdivision = '8n';
    }, [bpmSignal.value]);

    useEffect(() => {
        if (pianoRef.current) pianoRef.current.volume.value = pianoVolumeSignal.value;
    }, [pianoVolumeSignal.value]);

    useEffect(() => {
        if (bassRef.current) bassRef.current.volume.value = bassVolumeSignal.value;
    }, [bassVolumeSignal.value]);

    useEffect(() => {
        if (drumsRef.current) {
            drumsRef.current.ride.volume.value = drumsVolumeSignal.value;
            drumsRef.current.hihat.volume.value = drumsVolumeSignal.value - 3;
            drumsRef.current.snare.volume.value = drumsVolumeSignal.value - 8;
            drumsRef.current.kick.volume.value = drumsVolumeSignal.value - 6;
        }
    }, [drumsVolumeSignal.value]);

    useEffect(() => {
        if (reverbRef.current) reverbRef.current.wet.value = reverbVolumeSignal.value;
    }, [reverbVolumeSignal.value]);

    useEffect(() => {
        if (pianoReverbRef.current) pianoReverbRef.current.wet.value = pianoReverbSignal.value;
    }, [pianoReverbSignal.value]);

    useEffect(() => {
        if (!isActive || !song || !song.music || !song.music.measures) return;

        Tone.Transport.cancel();
        currentMeasureIndexSignal.value = -1;

        const loop = new Tone.Loop((time) => {
            const position = Tone.Transport.position.toString().split(':');
            const bar = parseInt(position[0]);
            const beat = parseInt(position[1]);

            const plan = song.music.playbackPlan || [];
            if (plan.length === 0) return;

            const logicalBar = bar % plan.length;
            const measureIndex = plan[logicalBar];
            const currentLoop = Math.floor(bar / plan.length);

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

            const measure = song.music.measures[measureIndex];
            const nextLogicalBar = (logicalBar * 4 + beat + 1) / 4;
            const nextMeasureIndex = plan[Math.floor(nextLogicalBar) % plan.length];
            const nextMeasure = song.music.measures[nextMeasureIndex];
            const chords = measure.chords || [];

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

            // Update global signal for scoring/UI tools
            if (currentChordSymbol !== currentChordSymbolSignal.value) {
                currentChordSymbolSignal.value = currentChordSymbol;
            }

            if (currentChordSymbol) {
                const { root, quality } = parseChord(currentChordSymbol);
                const rootMidi = Tone.Frequency(root + "2").toMidi();
                let targetNote: string;

                if (beat === 0) {
                    targetNote = root + "2";
                } else if (beat === 3 && nextChordSymbol) {
                    const { root: nextRoot } = parseChord(nextChordSymbol);
                    const nextMidi = Tone.Frequency(nextRoot + "2").toMidi();
                    const approachMidi = Math.random() > 0.5 ? nextMidi + 1 : nextMidi - 1;
                    targetNote = Tone.Frequency(approachMidi, "midi").toNote();
                } else {
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

            let shouldPlayComp = false;
            let compOffset = 0;
            let compDuration = "2n";
            const isNewChord = currentChordSymbol !== lastChordRef.current;

            if (isNewChord && currentChordSymbol !== "") {
                shouldPlayComp = true;
                compOffset = 0;
                compDuration = "2n";
                lastChordRef.current = currentChordSymbol;
            } else {
                const measurePattern = (bar % 3);
                if (measurePattern === 0) {
                    if (beat === 0) { shouldPlayComp = true; compOffset = 0; compDuration = "4n."; }
                    if (beat === 1) { shouldPlayComp = true; compOffset = 0.5; compDuration = "8n"; }
                } else if (measurePattern === 1) {
                    if (beat === 1 || beat === 3) { shouldPlayComp = true; compOffset = 0.5; compDuration = "8n"; }
                } else {
                    if (beat === 0 || beat === 2) { shouldPlayComp = true; compOffset = 0; compDuration = "2n"; }
                }
            }

            if (shouldPlayComp && currentChordSymbol) {
                playChord(currentChordSymbol, time + (compOffset * Tone.Time("4n").toSeconds()), compDuration);
            }

            if (drumsRef.current) {
                const isStrongBeat = beat === 0 || beat === 2;
                const rideNote = Math.random() > 0.9 ? "E1" : (Math.random() > 0.4 ? "D1" : "C1");
                const rideVel = (isStrongBeat ? 0.6 : 0.4) + (Math.random() * 0.1);
                drumsRef.current.ride.triggerAttack(rideNote, time, rideVel);

                if (beat === 1 || beat === 3 || Math.random() > 0.75) {
                    const skipTime = time + Tone.Time("4n").toSeconds() * 0.66;
                    drumsRef.current.ride.triggerAttack(rideNote, skipTime, 0.2 + (Math.random() * 0.15));
                }

                if (beat === 1 || beat === 3) {
                    drumsRef.current.hihat.triggerAttack("C1", time, 0.5 + Math.random() * 0.1);
                }

                drumsRef.current.kick.triggerAttack("C1", time, 0.15);

                if (Math.random() > 0.65) {
                    const snareOffset = (Math.random() > 0.5 ? Tone.Time("8t").toSeconds() : Tone.Time("8t").toSeconds() * 2);
                    drumsRef.current.snare.triggerAttack("C1", time + snareOffset, 0.1 + Math.random() * 0.2);
                }
            }
        }, "4n").start(0);

        return () => {
            loop.dispose();
        };
    }, [song, isActive]);

    const playChord = (symbol: string, time: number = Tone.now(), duration: string = "2n") => {
        if (!pianoRef.current?.loaded) return;

        const cleanSymbol = symbol.replace(/\(.*?\)/g, '').replace(/[\[\]]/g, '').trim();
        if (!cleanSymbol) return;

        let { root, quality } = parseChord(cleanSymbol);
        if (IREAL_QUALITY_MAP[quality]) quality = IREAL_QUALITY_MAP[quality];
        const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'];
        const midiRoot = Tone.Frequency(root + "4").toMidi();

        if (midiRoot) {
            const baseVel = 0.45 + Math.random() * 0.1;
            const notes = intervals.map(i => Tone.Frequency(midiRoot + i, "midi").toNote());

            notes.forEach((note, idx) => {
                const stagger = idx * (0.01 + Math.random() * 0.02);
                const noteVel = baseVel * (0.9 + Math.random() * 0.2);
                pianoRef.current?.triggerAttackRelease(
                    note,
                    duration,
                    time + stagger,
                    noteVel
                );
            });
        }
    };

    const togglePlayback = async () => {
        if (isPlayingSignal.value) {
            Tone.Transport.stop();
            isPlayingSignal.value = false;
            currentMeasureIndexSignal.value = -1;
            currentBeatSignal.value = -1;
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
        togglePlayback,
        playChord,
        setBpm: (val: number) => bpmSignal.value = val
    };
};
