import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { JazzTheoryService, JazzVoicingType } from '../utils/JazzTheoryService';
import {
    CompingEngine, RhythmEngine, DrumEngine, GrooveManager,
    WalkingBassEngine, ReactiveCompingEngine, type RhythmPattern, type DrumHit,
    type BassEvent
} from './../../../core/theory';
import {
    currentMeasureIndexSignal,
    currentBeatSignal,
    currentChordSymbolSignal,
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
    activityLevelSignal,
    pianoMutedSignal,
    bassMutedSignal,
    drumsMutedSignal,
    pianoSoloSignal,
    bassSoloSignal,
    drumsSoloSignal,
    bassModeSignal
} from '../state/jazzSignals';
import { Signal } from "@preact/signals-react";
import { playGuideChord, isAudioReady, initAudio as initGlobalAudio } from '../../../core/audio/globalAudio';
import { getDirectorInstrument } from '../../../core/audio/directorInstrumentSignal';

interface ChordHistoryEntry {
    time: number;
    chord: string;
}

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
    /** Chord that was active at transport time t (for latency-adjusted scoring). */
    getChordAtTransportTime: (t: number) => string;
}

export const useJazzBand = (song: any, isActive: boolean = true): JazzPlaybackState => {
    const pianoRef = useRef<Tone.Sampler | null>(null);
    const bassRef = useRef<Tone.Sampler | null>(null);
    const bassMutedRef = useRef<Tone.Sampler | null>(null);
    const drumsRef = useRef<{
        ride: Tone.Sampler; hihat: Tone.Sampler; snare: Tone.Sampler; kick: Tone.Sampler;
    } | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const pianoReverbRef = useRef<Tone.Reverb | null>(null);

    // AI Performance State
    const lastBassNoteRef = useRef<number>(36);
    const lastVoicingRef = useRef<number[]>([]);
    const lastChordRef = useRef<string>("");
    const voicingTypeRef = useRef<JazzVoicingType>('rootless');
    const tensionCycleRef = useRef<number>(0);
    const onNoteRef = useRef<(note: any) => void | undefined>(undefined);
    const compingEngineRef = useRef<CompingEngine>(new CompingEngine());
    const rhythmEngineRef = useRef<RhythmEngine>(new RhythmEngine());
    const drumEngineRef = useRef<DrumEngine>(new DrumEngine());
    const grooveRef = useRef<GrooveManager>(new GrooveManager());
    const currentPatternRef = useRef<RhythmPattern | null>(null);
    const currentDrumHitsRef = useRef<DrumHit[]>([]);
    const walkingBassEngineRef = useRef<WalkingBassEngine>(new WalkingBassEngine());
    const walkingLineRef = useRef<BassEvent[]>([]);
    const reactiveCompingEngineRef = useRef<ReactiveCompingEngine>(new ReactiveCompingEngine());
    const chordHistoryRef = useRef<ChordHistoryEntry[]>([]);
    const CHORD_HISTORY_MAX_AGE = 2;

    useEffect(() => {
        const checkLoaded = () => { if (pianoRef.current?.loaded && bassRef.current?.loaded && drumsRef.current?.ride.loaded) isLoadedSignal.value = true; };

        reverbRef.current = new Tone.Reverb({ decay: 2.2, wet: reverbVolumeSignal.value }).toDestination();
        pianoReverbRef.current = new Tone.Reverb({ decay: 2.8, wet: pianoReverbSignal.value }).toDestination();

        pianoRef.current = new Tone.Sampler({
            urls: { "C2": "C2.m4a", "F#2": "Fs2.m4a", "C3": "C3.m4a", "F#3": "Fs3.m4a", "C4": "C4.m4a", "F#4": "Fs4.m4a", "C5": "C5.m4a" },
            baseUrl: "/audio/piano/",
            release: 1.2,
            onload: checkLoaded,
            volume: pianoVolumeSignal.value
        }).connect(pianoReverbRef.current);

        bassRef.current = new Tone.Sampler({
            urls: { "E1": "E1.m4a", "A#1": "As1.m4a", "E2": "E2.m4a", "A#2": "As2.m4a", "E3": "E3.m4a", "A#3": "As3.m4a" },
            baseUrl: "/audio/bass/",
            release: 0.8,
            onload: checkLoaded,
            volume: bassVolumeSignal.value
        }).connect(reverbRef.current);

        // Muted Bass (Phase 12.1) - Shares buffers, different release
        bassMutedRef.current = new Tone.Sampler({
            urls: { "E1": "E1.m4a", "A#1": "As1.m4a", "E2": "E2.m4a", "A#2": "As2.m4a", "E3": "E3.m4a", "A#3": "As3.m4a" },
            baseUrl: "/audio/bass/",
            release: 0.05,
            volume: bassVolumeSignal.value
        }).connect(reverbRef.current);

        const drumBaseUrl = "/drum_samples/";
        drumsRef.current = {
            ride: new Tone.Sampler({ urls: { "C1": "Ride1_NateSmith.wav", "D1": "Ride2_NateSmith.wav", "E1": "RideBell_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value, onload: checkLoaded }).connect(reverbRef.current),
            hihat: new Tone.Sampler({ urls: { "C1": "HiHatClosed1_NateSmith.wav", "F1": "HiHatOpen1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 4, onload: checkLoaded }).connect(reverbRef.current),
            snare: new Tone.Sampler({ urls: { "C1": "SnareTight1_NateSmith.wav", "D1": "SnareDeep1_NateSmith.wav", "E1": "CrossStick1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 8, onload: checkLoaded }).connect(reverbRef.current),
            kick: new Tone.Sampler({ urls: { "C1": "KickTight1_NateSmith.wav", "E1": "KickOpen1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 6, onload: checkLoaded }).connect(reverbRef.current)
        };

        return () => {
            pianoRef.current?.dispose(); bassRef.current?.dispose(); bassMutedRef.current?.dispose();
            drumsRef.current?.ride.dispose(); drumsRef.current?.hihat.dispose();
            drumsRef.current?.snare.dispose(); drumsRef.current?.kick.dispose();
            reverbRef.current?.dispose(); pianoReverbRef.current?.dispose();
        };
    }, []);

    // Helper to determine if a track should be audible
    const getOutputVolume = (id: 'piano' | 'bass' | 'drums', baseVol: number) => {
        const isMuted =
            (id === 'piano' && pianoMutedSignal.value) ||
            (id === 'bass' && bassMutedSignal.value) ||
            (id === 'drums' && drumsMutedSignal.value);

        const anySolo = pianoSoloSignal.value || bassSoloSignal.value || drumsSoloSignal.value;
        const isSolo =
            (id === 'piano' && pianoSoloSignal.value) ||
            (id === 'bass' && bassSoloSignal.value) ||
            (id === 'drums' && drumsSoloSignal.value);

        if (isMuted) return -Infinity;
        if (anySolo && !isSolo) return -Infinity;
        return baseVol;
    };

    useEffect(() => { if (pianoRef.current) pianoRef.current.volume.rampTo(getOutputVolume('piano', pianoVolumeSignal.value), 0.1); }, [pianoVolumeSignal.value, pianoMutedSignal.value, pianoSoloSignal.value, bassSoloSignal.value, drumsSoloSignal.value]);
    useEffect(() => { if (bassRef.current) { const vol = getOutputVolume('bass', bassVolumeSignal.value); bassRef.current.volume.rampTo(vol, 0.1); bassMutedRef.current?.volume.rampTo(vol, 0.1); } }, [bassVolumeSignal.value, bassMutedSignal.value, bassSoloSignal.value, pianoSoloSignal.value, drumsSoloSignal.value]);
    useEffect(() => { if (drumsRef.current) { const vol = getOutputVolume('drums', drumsVolumeSignal.value); drumsRef.current.ride.volume.rampTo(vol, 0.1); drumsRef.current.hihat.volume.rampTo(vol - 4, 0.1); drumsRef.current.snare.volume.rampTo(vol - 8, 0.1); drumsRef.current.kick.volume.rampTo(vol - 6, 0.1); } }, [drumsVolumeSignal.value, drumsMutedSignal.value, drumsSoloSignal.value, pianoSoloSignal.value, bassSoloSignal.value]);
    useEffect(() => { if (reverbRef.current) reverbRef.current.wet.value = reverbVolumeSignal.value; }, [reverbVolumeSignal.value]);
    useEffect(() => { if (pianoReverbRef.current) pianoReverbRef.current.wet.value = pianoReverbSignal.value; }, [pianoReverbSignal.value]);

    useEffect(() => {
        const bpm = bpmSignal.value;
        Tone.Transport.bpm.value = bpm;
        if (bpm < 100) Tone.Transport.swing = 0.75; else if (bpm < 200) Tone.Transport.swing = 0.66; else Tone.Transport.swing = 0.5;
    }, [bpmSignal.value]);

    useEffect(() => {
        if (!isActive || !song || !song.music || !song.music.measures) return;
        Tone.Transport.cancel();

        // Playback plan: order of measure indices (handles repeats & endings). Fallback = straight indices.
        const plan: number[] =
            song.music.playbackPlan?.length > 0
                ? song.music.playbackPlan
                : song.music.measures.map((_: { chords?: string[] }, i: number) => i);
        if (plan.length === 0) return;

        const loop = new Tone.Loop((time) => {
            const pos = Tone.Transport.position.toString().split(':');
            const bar = parseInt(pos[0], 10) || 0;
            const beat = Math.min(3, Math.max(0, parseInt(pos[1], 10) || 0));

            const logicalBar = bar % plan.length;
            const measureIndex = plan[logicalBar];
            const currentLoop = Math.floor(bar / plan.length);

            if (currentLoop >= totalLoopsSignal.value) {
                Tone.Transport.stop();
                isPlayingSignal.value = false;
                currentMeasureIndexSignal.value = -1;
                currentChordSymbolSignal.value = "";
                loopCountSignal.value = 0;
                return;
            }

            const measure = song.music.measures[measureIndex];
            if (!measure) return;

            const nextLogicalBar = (logicalBar * 4 + beat + 1) / 4;
            const nextMeasureIndex = plan[Math.floor(nextLogicalBar) % plan.length];
            const nextMeasure = song.music.measures[nextMeasureIndex];
            const chords = measure.chords || [];
            const nextChords = nextMeasure?.chords || [];
            const rawCurrent = (chords.length === 1 ? chords[0] : chords.length === 2 ? (beat < 2 ? chords[0] : chords[1]) : chords[Math.min(beat, chords.length - 1)] ?? chords[0] ?? "")?.trim() ?? "";
            const rawNext = (nextChords.length === 1 ? nextChords[0] : nextChords.length === 2 ? (beat < 2 ? nextChords[0] : nextChords[1]) : nextChords[Math.min(beat + 1, nextChords.length - 1)] ?? nextChords[0] ?? "")?.trim() ?? "";
            // iReal optional chords in () are not played — use main chord only for playback/scoring
            let currentChord = JazzTheoryService.getMainChord(rawCurrent);
            let nextChord = JazzTheoryService.getMainChord(rawNext);
            // If this beat is optional-only (e.g. "(C7b9)"), carry over the measure's main chord so the chord lasts the full bar
            if (!currentChord && chords.length > 0) {
                const firstMainInMeasure = chords.map((c: string) => JazzTheoryService.getMainChord(c ?? "")).find(Boolean);
                currentChord = firstMainInMeasure ?? "";
            }
            if (!nextChord && nextChords.length > 0) {
                const firstMainInNext = nextChords.map((c: string) => JazzTheoryService.getMainChord(c ?? "")).find(Boolean);
                nextChord = firstMainInNext ?? nextChord;
            }

            Tone.Draw.schedule(() => {
                currentMeasureIndexSignal.value = measureIndex;
                currentBeatSignal.value = beat;
                currentChordSymbolSignal.value = currentChord;
                loopCountSignal.value = currentLoop;
                const history = chordHistoryRef.current;
                history.push({ time, chord: currentChord });
                const cutoff = time - CHORD_HISTORY_MAX_AGE;
                while (history.length > 0 && history[0].time < cutoff) history.shift();
            }, time);

            tensionCycleRef.current = (bar * 4 + beat) / 16;
            const currentTension = 0.5 + Math.sin(tensionCycleRef.current) * 0.3 + (activityLevelSignal.value * 0.2);
            const activity = activityLevelSignal.value;
            const bpm = bpmSignal.value;

            // Voicing type follows tension + activity (increasing intensity/reactivity of the band)
            voicingTypeRef.current = JazzTheoryService.getNextLogicalVoicingType(voicingTypeRef.current, activity, currentTension, currentTension > 0.6);

            // BASS: Target & Approach (Phase 12) + Variations (Phase 12.1)
            if (currentChord && (bassRef.current?.loaded || bassMutedRef.current?.loaded)) {
                if (beat === 0) {
                    walkingBassEngineRef.current.setLastNoteMidi(lastBassNoteRef.current);
                    walkingLineRef.current = walkingBassEngineRef.current.generateVariedWalkingLine(
                        currentChord,
                        nextChord?.trim() || currentChord,
                        bar,
                        activityLevelSignal.value
                    );
                }
                const line = walkingLineRef.current;
                const hitsForBeat = line.filter(e => {
                    const parts = e.time.split(':');
                    return parseInt(parts[1], 10) === beat;
                });

                hitsForBeat.forEach(event => {
                    const sixteenthOffset = parseInt(event.time.split(':')[2], 10);
                    const offsetTime = Tone.Time(`0:0:${sixteenthOffset}`).toSeconds();
                    const bassTiming = grooveRef.current.getMicroTiming(bpm, "Bass");
                    const sampleLatencyCompensation = -0.010;
                    const bassTime = time + offsetTime + bassTiming + sampleLatencyCompensation;

                    const vel = event.velocity * (0.8 + currentTension * 0.4);
                    const sampler = event.isGhost ? bassMutedRef.current : bassRef.current;
                    const duration = event.duration;

                    sampler?.triggerAttackRelease(Tone.Frequency(event.note, "midi").toNote(), duration, bassTime, vel);

                    // Track only main notes for UI/history if they are on the beat, or just the first note
                    if (sixteenthOffset === 0) {
                        lastBassNoteRef.current = event.note;
                        onNoteRef.current?.({ midi: event.note, velocity: vel, instrument: 'bass', type: 'root', duration: 1 });
                    }
                });
            }

            // PIANO: Combined reactive + RhythmEngine — room drives density; pocket + shell/full + velocity on every hit
            // 1. At bar start: reactive target density drives RhythmEngine; drums listen to piano density
            if (beat === 0) {
                const chordsPerBar = (measure.chords || []).length;
                const targetDensity = reactiveCompingEngineRef.current.getTargetDensity(activityLevelSignal.value, bassModeSignal.value);
                const pianoPattern = rhythmEngineRef.current.getRhythmPattern(bpm, targetDensity, { chordsPerBar });
                currentPatternRef.current = pianoPattern;
                const pianoDensity = pianoPattern.steps.length / 4;
                currentDrumHitsRef.current = drumEngineRef.current.generateBar(activityLevelSignal.value, pianoDensity);
            }

            const pattern = currentPatternRef.current;
            const isNewChord = currentChord && currentChord !== lastChordRef.current;
            if (isNewChord) lastChordRef.current = currentChord;

            // 2. Single path: RhythmEngine steps + pocket (BPM-relative) + shell/full + velocity humanization
            if (currentChord && pianoRef.current?.loaded && !pianoMutedSignal.value) {
                const currentStep = pattern?.steps.find(s => {
                    const parts = s.time.split(':');
                    const patternBeat = parseInt(parts[1], 10);
                    return patternBeat === beat;
                });
                const shouldPlay = currentStep || isNewChord;

                if (shouldPlay) {
                    const targetChord = (currentStep && currentStep.isAnticipation && nextChord) ? nextChord : currentChord;
                    const voicing = compingEngineRef.current.getNextVoicing(targetChord, { addRoot: bassMutedSignal.value });

                    if (voicing.length > 0) {
                        lastVoicingRef.current = voicing;
                        const duration = currentStep?.duration || '4n';
                        const isStab = duration === '8n' || duration === '16n';
                        const notes = isStab ? voicing.slice(0, 2) : voicing;
                        const humanOffset = reactiveCompingEngineRef.current.getMicroTimingForStep(
                            { time: currentStep?.time ?? '0:0:0', duration, isAnticipation: currentStep?.isAnticipation },
                            bpm
                        );
                        const scheduleTime = time + humanOffset;
                        const baseVel = 0.55 + (activityLevelSignal.value * 0.2) + (Math.random() * 0.1);
                        const vel = baseVel * (0.8 + Math.random() * 0.4);

                        pianoRef.current?.triggerAttackRelease(
                            notes.map((n) => Tone.Frequency(n, 'midi').toNote()),
                            duration,
                            scheduleTime,
                            vel
                        );
                        onNoteRef.current?.({
                            midi: notes[0],
                            velocity: vel,
                            instrument: 'piano',
                            type: JazzTheoryService.getNoteFunction(notes[0], targetChord),
                            duration: 1
                        });
                    }
                }
            }

            // DRUMS PRO: DeJohnette-Style Generative Engine (Phase 11)
            // limbs move independently; hi-hat anchors 2 & 4.
            if (drumsRef.current && !drumsMutedSignal.value) {
                const hitsForBeat = currentDrumHitsRef.current.filter(h => {
                    const parts = h.time.split(':');
                    return parseInt(parts[1], 10) === beat;
                });

                hitsForBeat.forEach(hit => {
                    const microTiming = drumEngineRef.current.getMicroTiming(bpm, hit.instrument);
                    const sixteenthOffset = hit.time.split(':')[2];
                    const offsetTime = Tone.Time(`0:0:${sixteenthOffset}`).toSeconds();
                    const scheduleTime = time + offsetTime + microTiming;

                    // Trigger appropriate sampler limb
                    if (hit.instrument === "Ride") {
                        drumsRef.current?.ride.triggerAttack("C1", scheduleTime, hit.velocity);
                    } else if (hit.instrument === "Snare") {
                        drumsRef.current?.snare.triggerAttack("C1", scheduleTime, hit.velocity);
                    } else if (hit.instrument === "Kick") {
                        drumsRef.current?.kick.triggerAttack("C1", scheduleTime, hit.velocity);
                    } else if (hit.instrument === "HatPedal") {
                        // Ground the pulse on 2 & 4
                        drumsRef.current?.hihat.triggerAttack("C1", scheduleTime, hit.velocity);
                    } else if (hit.instrument === "HatOpen") {
                        drumsRef.current?.hihat.triggerAttack("F1", scheduleTime, hit.velocity);
                    }
                });
            }
        }, "4n");

        loop.start(0);
        return () => { loop.dispose(); };
    }, [isActive, song]);

    const togglePlayback = async () => {
        if (isPlayingSignal.value) {
            Tone.Transport.stop();
            isPlayingSignal.value = false;
            currentMeasureIndexSignal.value = -1;
            currentBeatSignal.value = -1;
            currentChordSymbolSignal.value = "";
        } else {
            // Call Tone.start() synchronously so resume runs in same user-gesture tick (await would yield and break gesture).
            Tone.start().then(async () => {
                if (!isAudioReady()) await initGlobalAudio();
                Tone.Transport.start();
                isPlayingSignal.value = true;
            }).catch(() => { });
        }
    };

    const playChord = (symbol: string) => {
        const notes = JazzTheoryService.getPianoVoicing(symbol, 'rootless', 3, [], 0.5);
        const noteNames = notes.map(n => Tone.Frequency(n, "midi").toNote());
        const useDirectorGuide = getDirectorInstrument() !== 'piano' && isAudioReady();
        if (useDirectorGuide) {
            playGuideChord(notes, "2n", undefined, 0.45);
        } else {
            pianoRef.current?.triggerAttackRelease(noteNames, "2n", undefined, 0.45);
        }
    };

    const getChordAtTransportTime = (t: number): string => {
        const history = chordHistoryRef.current;
        if (history.length === 0) return currentChordSymbolSignal.value ?? "";
        let best = history[0];
        for (let i = 0; i < history.length; i++) {
            if (history[i].time > t) break;
            best = history[i];
        }
        return best.chord ?? "";
    };

    return {
        isPlayingSignal, isLoadedSignal, currentMeasureIndexSignal, currentBeatSignal,
        bpmSignal, loopCountSignal, totalLoopsSignal, togglePlayback, playChord,
        setBpm: (val: number) => {
            bpmSignal.value = val;
            activityLevelSignal.value = Math.max(0, Math.min(1, (val - 50) / 190));
        },
        onNote: (cb) => onNoteRef.current = cb,
        getChordAtTransportTime
    };
};
