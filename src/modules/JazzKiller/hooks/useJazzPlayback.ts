import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { parseChord, CHORD_INTERVALS } from '../../../core/theory/index';
import { JazzTheoryService } from '../utils/JazzTheoryService';

// Extended mapping for iReal Pro specific symbols to our Theory engine
/** Map parseChord quality (or iReal shorthand) to CHORD_INTERVALS key. Unified theory: parseChord is source of truth; this only aliases shorthands. */
const IREAL_QUALITY_MAP: Record<string, string> = {
    '-': 'min',
    'm': 'min',
    '-7': 'min7',
    'm7': 'min7',
    '^': 'maj7',
    'maj7': 'maj7',
    '7': 'dom7',
    'h': 'm7b5',
    'o': 'dim7',
    'o7': 'dim7',
    'dim7': 'dim7',
    'alt': '7alt',
    'sus': 'sus4',
};

import {
    currentMeasureIndexSignal,
    currentBeatSignal,
    loopCountSignal,
    isPlayingSignal,
    bpmSignal,
    activityLevelSignal,
    totalLoopsSignal,
    isLoadedSignal,
    pianoVolumeSignal,
    bassVolumeSignal,
    drumsVolumeSignal,
    reverbVolumeSignal,
    pianoReverbSignal,
    currentChordSymbolSignal,
    tuneIntensitySignal,
    tuneProgressSignal,
    meterSignal
} from '../state/jazzSignals';
import { getTuneIntensity } from '../utils/tuneArc';
import {
    parseMeter,
    applyMeterToTransport,
    positionToPlaybackState,
    PLAYBACK_LOOP_INTERVAL,
    scheduleMeterChanges,
    clearMeterChangeSchedules,
    getMeterAtBar,
    getParsedMeterAtBar,
    type ParsedMeter,
} from '../utils/meterTranslator';
import { GrooveManager } from '../../../core/theory/GrooveManager';

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
    onNote: (cb: (note: { midi: number, velocity: number, instrument: string, type: 'root' | 'third' | 'fifth' | 'seventh' | 'extension', duration?: number }) => void) => void;
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
    /** When set, first comp for this chord lands here (phrase across bar line / off the one). */
    const pendingFirstCompRef = useRef<{ chord: string; beat: number; offsetInBeat: number } | null>(null);
    const startPendingRef = useRef(false);
    /** Ref so loop callback always reads current (transposed) song without recreating the loop. */
    const songRef = useRef<any>(null);
    /** Current meter (updated in effect when meterSignal changes). Callback reads this, not the signal, so meter is correct in Tone's thread. */
    const meterRef = useRef<ParsedMeter>(parseMeter('4/4'));
    /** IDs of scheduled meter-change events; cleared on unload/stop (DMP-05). */
    const meterScheduleIdsRef = useRef<number[]>([]);

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
        const bpm = bpmSignal.value;
        Tone.Transport.bpm.value = bpm;
        const groove = new GrooveManager();
        Tone.Transport.swing = groove.getSwingRatio(bpm);
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

    // Keep ref in sync so loop callback always sees current (transposed) song
    useEffect(() => {
        songRef.current = song;
    }, [song]);

    // When meter changes: apply to Transport and update ref so the loop callback sees the new meter (ref is read in Tone's thread)
    useEffect(() => {
        const parsed = parseMeter(meterSignal.value);
        meterRef.current = parsed;
        applyMeterToTransport(meterSignal.value);
    }, [meterSignal.value]);

    useEffect(() => {
        if (!isActive || !song || !song.music || !song.music.measures) return;

        const defaultMeter = song.TimeSignature ?? meterSignal.value ?? '4/4';
        if (song.meterChanges?.length) {
            const initialMeter = getMeterAtBar(0, song.meterChanges, defaultMeter);
            meterSignal.value = initialMeter;
            meterRef.current = parseMeter(initialMeter);
            applyMeterToTransport(initialMeter);
        } else {
            // DMP-13: no meterChanges → unchanged single meter (non-destructive)
            applyMeterToTransport(meterSignal.value);
        }

        Tone.Transport.cancel();
        clearMeterChangeSchedules(meterScheduleIdsRef.current);
        meterScheduleIdsRef.current = [];
        currentMeasureIndexSignal.value = -1;

        const plan: number[] =
            song.music.playbackPlan?.length > 0
                ? song.music.playbackPlan
                : song.music.measures?.map((_: unknown, i: number) => i) ?? [];
        if (plan.length === 0) return;

        const cycledLength = (song.music as { playbackPlanCycledLength?: number }).playbackPlanCycledLength ?? plan.length;
        const endingLength = plan.length - cycledLength;

        if (song.meterChanges?.length) {
            const ids = scheduleMeterChanges(
                song.meterChanges,
                defaultMeter,
                (meter) => {
                    meterSignal.value = meter;
                    meterRef.current = parseMeter(meter);
                }
            );
            meterScheduleIdsRef.current = ids;
        }

        const totalBars = totalLoopsSignal.value * cycledLength + endingLength;

        const loop = new Tone.Loop((time) => {
            const s = songRef.current;
            if (!s?.music?.measures) return;

            const positionString = Tone.Transport.position.toString();
            const barFromPosition = parseInt(positionString.split(':')[0], 10) || 0;
            const defaultMeter = s.TimeSignature ?? meterSignal.value ?? '4/4';
            // DMP-13: no meterChanges → use existing meterRef (non-destructive)
            const m = s.meterChanges?.length
                ? getParsedMeterAtBar(barFromPosition, s.meterChanges, defaultMeter)
                : meterRef.current;
            const state = positionToPlaybackState(positionString, m);
            if (!state.shouldRun) return;

            const { bar, beat, divisionsPerBar: beatsPerBar, midBarBeat } = state;

            const planIndices = s.music.playbackPlan?.length > 0 ? s.music.playbackPlan : s.music.measures.map((_: unknown, i: number) => i);
            const cycledLen = (s.music as { playbackPlanCycledLength?: number }).playbackPlanCycledLength ?? planIndices.length;
            const endingLen = planIndices.length - cycledLen;

            const inEnding = endingLen > 0 && bar >= totalLoopsSignal.value * cycledLen;
            const logicalBar = inEnding ? bar - totalLoopsSignal.value * cycledLen : bar % cycledLen;
            const planIndex = inEnding ? cycledLen + logicalBar : (bar % cycledLen);
            const measureIndex = planIndices[planIndex];
            const currentLoop = inEnding ? totalLoopsSignal.value : Math.floor(bar / cycledLen);
            const planLen = inEnding ? endingLen : cycledLen;

            if (bar >= totalBars) {
                clearMeterChangeSchedules(meterScheduleIdsRef.current);
                meterScheduleIdsRef.current = [];
                Tone.Transport.stop();
                isPlayingSignal.value = false;
                currentMeasureIndexSignal.value = -1;
                loopCountSignal.value = 0;
                tuneProgressSignal.value = 0;
                tuneIntensitySignal.value = getTuneIntensity(0);
                return;
            }

            const tuneProgress = totalBars > 0 ? Math.min(1, bar / totalBars) : 0;
            const tuneIntensity = getTuneIntensity(tuneProgress);

            Tone.Draw.schedule(() => {
                currentMeasureIndexSignal.value = measureIndex;
                currentBeatSignal.value = beat;
                loopCountSignal.value = currentLoop;
                tuneProgressSignal.value = tuneProgress;
                tuneIntensitySignal.value = tuneIntensity;
            }, time);

            const measure = s.music.measures[measureIndex];
            const nextLogicalBar = (logicalBar * beatsPerBar + beat + 1) / beatsPerBar;
            const nextPlanIndex = inEnding
                ? cycledLen + (Math.floor(nextLogicalBar) % endingLen)
                : Math.floor(nextLogicalBar) % cycledLen;
            const nextMeasureIndex = planIndices[nextPlanIndex];
            const nextMeasure = s.music.measures[nextMeasureIndex];
            const chords = measure.chords || [];

            let rawCurrent = "";
            let rawNext = "";

            if (chords.length === 1) {
                rawCurrent = chords[0];
                rawNext = nextMeasure.chords?.[0] || chords[0];
            } else if (chords.length === 2) {
                rawCurrent = beat < midBarBeat ? chords[0] : chords[1];
                rawNext = beat < midBarBeat ? chords[1] : (nextMeasure.chords?.[0] || chords[0]);
            } else {
                rawCurrent = chords[Math.min(beat, chords.length - 1)];
                rawNext = chords[Math.min(beat + 1, chords.length - 1)] || nextMeasure.chords?.[0];
            }

            // iReal optional chords in () are not played — use main chord only for playback/scoring
            let currentChordSymbol = JazzTheoryService.getMainChord(rawCurrent ?? "");
            let nextChordSymbol = JazzTheoryService.getMainChord(rawNext ?? "");
            // If this beat is optional-only (e.g. "(C7b9)"), carry over the measure's main chord so the chord lasts the full bar
            if (!currentChordSymbol && chords.length > 0) {
                const firstMainInMeasure = chords.map((c: string) => JazzTheoryService.getMainChord(c ?? "")).find(Boolean);
                currentChordSymbol = firstMainInMeasure ?? "";
            }
            if (!nextChordSymbol && nextMeasure?.chords?.length) {
                const firstMainInNext = nextMeasure.chords.map((c: string) => JazzTheoryService.getMainChord(c ?? "")).find(Boolean);
                nextChordSymbol = firstMainInNext ?? nextChordSymbol;
            }

            // Update global signal for scoring/UI tools
            if (currentChordSymbol !== currentChordSymbolSignal.value) {
                currentChordSymbolSignal.value = currentChordSymbol;
            }

            if (currentChordSymbol) {
                const { root, quality } = parseChord(currentChordSymbol);
                const rootMidi = Tone.Frequency(root + "2").toMidi();
                const lastBeat = state.lastBeat;
                let targetNote: string;

                if (beat === 0) {
                    targetNote = root + "2";
                } else if (beat === lastBeat && nextChordSymbol) {
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
                const isBalladFirstCycle = s?.style === 'Ballad' && currentLoop === 0;
                const playBassThisBeat = !isBalladFirstCycle || beat === 0 || beat === midBarBeat;
                if (bassRef.current?.loaded && playBassThisBeat) {
                    const bpm = bpmSignal.value;
                    const beatDurationSec = 60 / Math.max(20, Math.min(400, bpm));
                    // Half-time walk: use the full space — two beats per note, long duration.
                    const bassDuration = isBalladFirstCycle
                        ? Math.max(0.05, 2 * beatDurationSec - 0.01)
                        : (() => {
                            const isLowTempo = beatDurationSec > 0.75;
                            const fraction = isLowTempo ? 0.5 : 0.75;
                            const maxSec = isLowTempo ? 0.5 : 0.85;
                            return Math.max(0.05, Math.min(beatDurationSec * fraction, maxSec));
                        })();
                    bassRef.current?.triggerAttackRelease(targetNote, bassDuration, time, vel);
                }
            }

            let shouldPlayComp = false;
            let compOffset = 0;
            let compDuration = "2n";
            const isNewChord = currentChordSymbol !== lastChordRef.current;

            if (isNewChord && currentChordSymbol !== "") {
                lastChordRef.current = currentChordSymbol;
                // ~50% land on the one; else phrase across the bar — first hit on & of 1, beat 2, & of 2, or last beat
                const firstHitOptions: { beat: number; offsetInBeat: number }[] = [
                    { beat: 0, offsetInBeat: 0 },
                    { beat: 0, offsetInBeat: 0.5 },
                    { beat: 1, offsetInBeat: 0 },
                    { beat: 1, offsetInBeat: 0.5 },
                    { beat: 2, offsetInBeat: 0 },
                    ...(beatsPerBar > 3 ? [{ beat: beatsPerBar - 1, offsetInBeat: 0 }] : []),
                ].slice(0, Math.min(6, beatsPerBar + 2));
                const first = firstHitOptions[Math.floor(Math.random() * firstHitOptions.length)];
                pendingFirstCompRef.current = { chord: currentChordSymbol, beat: first.beat, offsetInBeat: first.offsetInBeat };
            }

            const pending = pendingFirstCompRef.current;
            if (pending && currentChordSymbol === pending.chord && beat === pending.beat) {
                shouldPlayComp = true;
                compOffset = pending.offsetInBeat;
                compDuration = pending.beat === 0 && pending.offsetInBeat === 0 ? "2n" : pending.offsetInBeat === 0.5 ? "8n" : "4n.";
                pendingFirstCompRef.current = null;
            } else if (!pending) {
                const measurePattern = (bar % 3);
                if (measurePattern === 0) {
                    if (beat === 0) { shouldPlayComp = true; compOffset = 0; compDuration = "4n."; }
                    if (beat === 1) { shouldPlayComp = true; compOffset = 0.5; compDuration = "8n"; }
                } else if (measurePattern === 1) {
                    if (beat === 1 || beat === state.lastBeat) { shouldPlayComp = true; compOffset = 0.5; compDuration = "8n"; }
                } else {
                    if (beat === 0 || beat === midBarBeat) { shouldPlayComp = true; compOffset = 0; compDuration = "2n"; }
                }
            }

            if (shouldPlayComp && currentChordSymbol) {
                playChord(currentChordSymbol, time + (compOffset * Tone.Time(state.parsed.beatNote).toSeconds()), compDuration);
            }

            if (drumsRef.current) {
                const groove = new GrooveManager();
                const bpm = bpmSignal.value;
                const swingOffset = groove.getOffBeatOffsetInBeat(bpm);
                // Elastic Pulse: ride ±3ms jitter, band 4ms
                const rideJitter = () => groove.getHumanizationJitter(3);
                const bandJitter = () => groove.getHumanizationJitter(4);

                // Ride: 4 quarter pulses + skip only on 2 & 4 (rebound V_skip = 0.65 × V_down). Backbeats 2 & 4 accented 1.2×.
                const isBackbeat = beat === midBarBeat || (beatsPerBar === 4 && beat === 3);
                const rideDownbeatScale = (beat === 0 || beat === 2) ? 1.0 : 1.2;
                const baseVel = 0.65;
                const pulseVel = baseVel * rideDownbeatScale + Math.random() * 0.06;
                const skipVel = pulseVel * 0.65;
                const usePing = isBackbeat && Math.random() > 0.55;
                const rideNote = usePing ? "D1" : "C1";

                drumsRef.current.ride.triggerAttack(rideNote, time + rideJitter(), pulseVel);
                if (isBackbeat) {
                    drumsRef.current.ride.triggerAttack("C1", time + swingOffset + rideJitter(), skipVel);
                }

                // Hi-hat on 2 & 4: "lazy" +7ms so ride pulls forward, hi-hat sits back → pocket
                if (isBackbeat) {
                    const lazyHatMs = 0.007;
                    drumsRef.current.hihat.triggerAttack("C1", time + lazyHatMs + bandJitter(), 0.5 + Math.random() * 0.1);
                }

                // Kick: strong on 1 and middle of bar, lighter on other beats
                const isStrongBeat = beat === 0 || beat === midBarBeat;
                const kickVel = isStrongBeat ? 0.4 + Math.random() * 0.08 : 0.22 + Math.random() * 0.06;
                drumsRef.current.kick.triggerAttack("C1", time + bandJitter(), kickVel);

                if (Math.random() > 0.65) {
                    const snareOffset = (Math.random() > 0.5 ? Tone.Time("8t").toSeconds() : Tone.Time("8t").toSeconds() * 2);
                    drumsRef.current.snare.triggerAttack("C1", time + snareOffset + bandJitter(), 0.1 + Math.random() * 0.2);
                }
            }
        }, PLAYBACK_LOOP_INTERVAL).start(0);

        return () => {
            clearMeterChangeSchedules(meterScheduleIdsRef.current);
            meterScheduleIdsRef.current = [];
            loop.dispose();
        };
    }, [isActive, !!song]);

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

    const togglePlayback = () => {
        if (isPlayingSignal.value) {
            clearMeterChangeSchedules(meterScheduleIdsRef.current);
            meterScheduleIdsRef.current = [];
            Tone.Transport.stop();
            isPlayingSignal.value = false;
            currentMeasureIndexSignal.value = -1;
            currentBeatSignal.value = -1;
            return;
        }
        if (startPendingRef.current) return;
        startPendingRef.current = true;
        Tone.start()
            .then(async () => {
                const ctx = Tone.getContext() as { rawContext?: AudioContext };
                const raw = ctx?.rawContext;
                if (raw?.state === 'suspended') await raw.resume();
                Tone.Transport.position = '0:0:0';
                isPlayingSignal.value = true;
                Tone.Transport.start();
            })
            .catch(() => {
                // Context may be blocked by browser; next click will retry
            })
            .finally(() => {
                startPendingRef.current = false;
            });
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
        setBpm: (val: number) => {
            bpmSignal.value = val;
            activityLevelSignal.value = Math.max(0, Math.min(1, (val - 50) / 190));
        },
        onNote: () => { }
    };
};
