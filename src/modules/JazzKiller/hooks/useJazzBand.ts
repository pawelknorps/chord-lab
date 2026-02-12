import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { JazzTheoryService, JazzVoicingType } from '../utils/JazzTheoryService';
import {
    CompingEngine, RhythmEngine, DrumEngine, GrooveManager,
    WalkingBassEngine, BassRhythmVariator, ReactiveCompingEngine, type RhythmPattern, type DrumHit,
    type BassEvent
} from './../../../core/theory';
import { QuestionAnswerCoordinator, type LastBarSummary, type AnswerDecision } from './../../../core/theory';
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
    tuneIntensitySignal,
    tuneProgressSignal,
    pianoMutedSignal,
    bassMutedSignal,
    drumsMutedSignal,
    pianoSoloSignal,
    bassSoloSignal,
    drumsSoloSignal,
    bassModeSignal,
    meterSignal,
    soloistResponsiveEnabledSignal,
    soloistActivitySignal
} from '../state/jazzSignals';
import { getTuneIntensity } from '../utils/tuneArc';
import { getPlaceInCycle, getSongStyleTag, isSoloistSpace, type PlaceInCycle, type SongStyleTag } from '../utils/trioContext';
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
    /** Last chord we actually stated (so we play every chord in the sequence, including second chord in two-chord bars). */
    const lastStatedChordRef = useRef<string>("");
    const walkingBassEngineRef = useRef<WalkingBassEngine>(new WalkingBassEngine());
    const bassRhythmVariatorRef = useRef<BassRhythmVariator>(new BassRhythmVariator());
    const walkingLineRef = useRef<BassEvent[]>([]);

    /** true = beat-by-beat JazzTheoryService.getNextWalkingBassNote; false = WalkingBassEngine (Friedland/target-vector). */
    const USE_LEGACY_BASS_NOTE_CHOICE = true;
    const reactiveCompingEngineRef = useRef<ReactiveCompingEngine>(new ReactiveCompingEngine());
    const chordHistoryRef = useRef<ChordHistoryEntry[]>([]);
    const CHORD_HISTORY_MAX_AGE = 2;
    const questionAnswerCoordinatorRef = useRef<QuestionAnswerCoordinator>(new QuestionAnswerCoordinator());
    const qaDecisionRef = useRef<AnswerDecision | null>(null);
    const startPendingRef = useRef(false);
    /** Ref so loop callback always reads current (transposed) song without recreating the loop. */
    const songRef = useRef<any>(null);
    /** Current meter (updated in effect when meterSignal changes). Callback reads this so meter is correct in Tone's thread. */
    const meterRef = useRef<ParsedMeter>(parseMeter('4/4'));
    /** IDs of scheduled meter-change events; cleared on unload/stop (DMP-05). */
    const meterScheduleIdsRef = useRef<number[]>([]);
    /** Phase 18 trio context: place-in-cycle and song-style (hybrid—additive to existing balladMode/activity). */
    const placeInCycleRef = useRef<PlaceInCycle>('head');
    const songStyleRef = useRef<SongStyleTag>('Medium Swing');

    useEffect(() => {
        const checkLoaded = () => {
            if (pianoRef.current?.loaded && bassRef.current?.loaded && drumsRef.current?.ride?.loaded)
                isLoadedSignal.value = true;
        };

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
        Tone.Transport.swing = grooveRef.current.getSwingRatio(bpm);
    }, [bpmSignal.value]);

    // Keep ref in sync so loop callback always sees current (transposed) song
    useEffect(() => {
        songRef.current = song;
    }, [song]);

    // When meter changes: apply to Transport and update ref so the loop callback sees the new meter
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
            applyMeterToTransport(meterSignal.value);
        }

        Tone.Transport.cancel();
        clearMeterChangeSchedules(meterScheduleIdsRef.current);
        meterScheduleIdsRef.current = [];

        // Playback plan: order of measure indices (handles repeats & endings). Fallback = straight indices.
        const plan: number[] =
            song.music.playbackPlan?.length > 0
                ? song.music.playbackPlan
                : song.music.measures.map((_: { chords?: string[] }, i: number) => i);
        if (plan.length === 0) return;

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

        const totalBars = totalLoopsSignal.value * plan.length;

        const loop = new Tone.Loop((time) => {
            const s = songRef.current;
            if (!s?.music?.measures) return;

            const positionString = Tone.Transport.position.toString();
            const barFromPosition = parseInt(positionString.split(':')[0], 10) || 0;
            const defaultMeter = s.TimeSignature ?? meterSignal.value ?? '4/4';
            const m = s.meterChanges?.length
                ? getParsedMeterAtBar(barFromPosition, s.meterChanges, defaultMeter)
                : meterRef.current;
            const state = positionToPlaybackState(positionString, m);
            if (!state.shouldRun) return;

            const { bar, beat, divisionsPerBar: beatsPerBar, midBarBeat, lastBeat } = state;

            const planIndices = s.music.playbackPlan?.length > 0 ? s.music.playbackPlan : s.music.measures.map((_: { chords?: string[] }, i: number) => i);
            const planLen = planIndices.length;

            const logicalBar = bar % planLen;
            const measureIndex = planIndices[logicalBar];
            const currentLoop = Math.floor(bar / planLen);

            if (currentLoop >= totalLoopsSignal.value) {
                clearMeterChangeSchedules(meterScheduleIdsRef.current);
                meterScheduleIdsRef.current = [];
                Tone.Transport.stop();
                isPlayingSignal.value = false;
                currentMeasureIndexSignal.value = -1;
                currentChordSymbolSignal.value = "";
                loopCountSignal.value = 0;
                tuneProgressSignal.value = 0;
                tuneIntensitySignal.value = getTuneIntensity(0);
                return;
            }

            const measure = s.music.measures[measureIndex];
            if (!measure) return;

            const tuneProgress = totalBars > 0 ? Math.min(1, bar / totalBars) : 0;
            const tuneIntensity = getTuneIntensity(tuneProgress);

            const nextLogicalBar = (logicalBar * beatsPerBar + beat + 1) / beatsPerBar;
            const nextMeasureIndex = planIndices[Math.floor(nextLogicalBar) % planLen];
            const nextMeasure = s.music.measures[nextMeasureIndex];
            const chords = measure.chords || [];
            const nextChords = nextMeasure?.chords || [];
            const rawCurrent = (chords.length === 1 ? chords[0] : chords.length === 2 ? (beat < midBarBeat ? chords[0] : chords[1]) : chords[Math.min(beat, chords.length - 1)] ?? chords[0] ?? "")?.trim() ?? "";
            const rawNext = (nextChords.length === 1 ? nextChords[0] : nextChords.length === 2 ? (beat < midBarBeat ? nextChords[0] : nextChords[1]) : nextChords[Math.min(beat + 1, nextChords.length - 1)] ?? nextChords[0] ?? "")?.trim() ?? "";
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
                tuneProgressSignal.value = tuneProgress;
                tuneIntensitySignal.value = tuneIntensity;
                const history = chordHistoryRef.current;
                history.push({ time, chord: currentChord });
                const cutoff = time - CHORD_HISTORY_MAX_AGE;
                while (history.length > 0 && history[0].time < cutoff) history.shift();
            }, time);

            // Whole-tune intensity arc: calm at start → rise to middle → wind down. Drives all band parts.
            const effectiveActivity = activityLevelSignal.value * (0.3 + 0.7 * tuneIntensity);
            tensionCycleRef.current = (bar * beatsPerBar + beat) / (beatsPerBar * 4);
            const currentTension = 0.5 + Math.sin(tensionCycleRef.current) * 0.3 + (effectiveActivity * 0.2);
            // Phase 19: Soloist-Responsive — steer band density when toggle on (more space when soloist plays, more backing when silent).
            let activity = effectiveActivity;
            if (soloistResponsiveEnabledSignal.value) {
                const soloist = soloistActivitySignal.value;
                activity = effectiveActivity * (1 - 0.65 * soloist);
            }
            const bpm = bpmSignal.value;

            // Phase 18: Trio context at bar start (hybrid—additive; old balladMode/activity unchanged).
            if (beat === 0) {
                placeInCycleRef.current = getPlaceInCycle(currentLoop, totalLoopsSignal.value, logicalBar, planLen, measure);
                songStyleRef.current = getSongStyleTag(s, bpm);
            }

            // Question–Answer: at bar start, decide if any instrument "answers" the previous bar's rhythm
            if (beat === 0) {
                const lastBarSummary: LastBarSummary = {
                    piano: {
                        patternName: currentPatternRef.current?.name ?? '',
                        stepCount: currentPatternRef.current?.steps.length ?? 0,
                    },
                    drums: {
                        wasFill: currentDrumHitsRef.current.length > 14,
                        hitCount: currentDrumHitsRef.current.length,
                    },
                    bass: {
                        hadPush: walkingLineRef.current.some((e) => e.time === `0:${lastBeat}:2`),
                        hadSkip: walkingLineRef.current.length > 4,
                    },
                };
                qaDecisionRef.current = questionAnswerCoordinatorRef.current.getResponse(bar, lastBarSummary);
            }

            // Voicing type follows tension + activity (increasing intensity/reactivity of the band)
            voicingTypeRef.current = JazzTheoryService.getNextLogicalVoicingType(voicingTypeRef.current, activity, currentTension, currentTension > 0.6);

            // BASS: Note choice = legacy (beat-by-beat) or engine (Friedland/target-vector); timing/ghost via BassRhythmVariator
            if (currentChord && (bassRef.current?.loaded || bassMutedRef.current?.loaded)) {
                if (beat === 0) {
                    const qa = qaDecisionRef.current;
                    const bassAnswerContext =
                        qa?.doAnswer && qa.responder === 'bass'
                            ? { questionFrom: qa.questionFrom, answerType: qa.answerType }
                            : undefined;
                    if (USE_LEGACY_BASS_NOTE_CHOICE) {
                        // Target & Approach: full bar with Beat 4 leading into next chord
                        const next = nextChord?.trim() || currentChord;
                        const line = JazzTheoryService.generateTargetApproachWalkingLine(currentChord, next, lastBassNoteRef.current);
                        const soloistSpace = isSoloistSpace(placeInCycleRef.current, songStyleRef.current);
                        walkingLineRef.current = bassRhythmVariatorRef.current.applyVariations(line, bar, activity, next, bassAnswerContext, soloistSpace);
                    } else {
                        walkingBassEngineRef.current.setLastNoteMidi(lastBassNoteRef.current);
                        walkingLineRef.current = walkingBassEngineRef.current.generateVariedWalkingLine(
                            currentChord,
                            nextChord?.trim() || currentChord,
                            bar,
                            activity
                        );
                    }
                    // Ballad / soloist space: half notes only — two notes per measure (from varied line). Hybrid: old ballad first-cycle + Phase 18 solo/Ballad.
                    const needsHalfTimeBass = (s?.style === 'Ballad' && currentLoop === 0) || songStyleRef.current === 'Ballad' || placeInCycleRef.current === 'solo';
                    if (needsHalfTimeBass) {
                        const full = walkingLineRef.current;
                        const at0 = full.filter((e) => parseInt(e.time.split(':')[1], 10) === 0).sort((a, b) => a.time.localeCompare(b.time))[0];
                        const atMid = full.filter((e) => parseInt(e.time.split(':')[1], 10) === midBarBeat).sort((a, b) => a.time.localeCompare(b.time))[0];
                        if (at0 && atMid) {
                            walkingLineRef.current = [
                                { ...at0, time: '0:0:0', duration: '2n' },
                                { ...atMid, time: `0:${midBarBeat}:0`, duration: '2n' },
                            ];
                        }
                    }
                }
                const line = walkingLineRef.current;
                const hitsForBeat = line.filter(e => {
                    const parts = e.time.split(':');
                    return parseInt(parts[1], 10) === beat;
                });

                const beatDurationSec = 60 / Math.max(20, Math.min(400, bpm));
                const isHalfNoteLine = line.length === 2 && line.every((e) => {
                    const b = parseInt(e.time.split(':')[1], 10);
                    return b === 0 || b === midBarBeat;
                });
                const isLowTempo = beatDurationSec > 0.75; // BPM < ~80
                // Higher tempos: sustain almost to next beat so walking bass connects (was 0.75 → detached).
                const beatFraction = isLowTempo ? 0.5 : 0.98;
                const absoluteMaxSec = isLowTempo ? 0.5 : 0.85;
                const maxBassDuration = Math.max(
                    0.05,
                    Math.min(beatDurationSec - 0.01, beatDurationSec * beatFraction, absoluteMaxSec)
                );

                hitsForBeat.forEach(event => {
                    const sixteenthOffset = parseInt(event.time.split(':')[2], 10);
                    const isOffBeat = sixteenthOffset === 2;
                    const offsetTime = isOffBeat
                        ? grooveRef.current.getOffBeatOffsetInBeat(bpm)
                        : Tone.Time(`0:0:${sixteenthOffset}`).toSeconds();
                    const bassTiming = grooveRef.current.getMicroTiming(bpm, "Bass");
                    const sampleLatencyCompensation = -0.010;
                    const bassTime = time + offsetTime + bassTiming + sampleLatencyCompensation;

                    const vel = event.velocity * (0.8 + currentTension * 0.4);
                    const sampler = event.isGhost ? bassMutedRef.current : bassRef.current;
                    // Half-time walk: use the full space — two beats per note, long duration (no short-note cap).
                const halfNoteGap = 0.01;
                const rawDuration = event.isGhost
                        ? beatDurationSec * 0.3
                        : isHalfNoteLine
                            ? 2 * beatDurationSec - halfNoteGap
                            : beatDurationSec * beatFraction;
                    const duration = isHalfNoteLine && !event.isGhost
                        ? Math.max(0.05, 2 * beatDurationSec - halfNoteGap)
                        : Math.min(rawDuration, maxBassDuration);

                    sampler?.triggerAttackRelease(Tone.Frequency(event.note, "midi").toNote(), duration, bassTime, vel);

                    // Track only main notes for UI/history if they are on the beat, or just the first note
                    if (sixteenthOffset === 0) {
                        lastBassNoteRef.current = event.note;
                        onNoteRef.current?.({ midi: event.note, velocity: vel, instrument: 'bass', type: 'root', duration: 1 });
                    }
                });
            }

            // PIANO: Combined reactive + RhythmEngine — room drives density; pocket + shell/full + velocity on every hit
            // 1. At bar start: reactive target density drives RhythmEngine; drums use hybrid linear phrasing when bar is passed
            if (beat === 0) {
                const chordsPerBar = (measure.chords || []).length;
                const trioContext = { placeInCycle: placeInCycleRef.current, songStyle: songStyleRef.current };
                const targetDensity = reactiveCompingEngineRef.current.getTargetDensity(activity, bassModeSignal.value, trioContext);
                const qa = qaDecisionRef.current;

                const pianoAnswerContext =
                    qa?.doAnswer && qa.responder === 'piano'
                        ? { questionFrom: qa.questionFrom, answerType: qa.answerType }
                        : undefined;
                const isBallad = s?.style === 'Ballad' || String(s?.compStyle ?? '').toLowerCase().includes('ballad');
                const pianoPattern = rhythmEngineRef.current.getRhythmPattern(bpm, targetDensity, {
                    chordsPerBar,
                    answerContext: pianoAnswerContext,
                    balladMode: isBallad,
                    placeInCycle: placeInCycleRef.current,
                    songStyle: songStyleRef.current,
                });
                currentPatternRef.current = pianoPattern;
                const pianoDensity = pianoPattern.steps.length / beatsPerBar;

                const drumsAnswerContext =
                    qa?.doAnswer && qa.responder === 'drums'
                        ? { questionFrom: qa.questionFrom, answerType: qa.answerType }
                        : undefined;
                currentDrumHitsRef.current = drumEngineRef.current.generateBar(
                    activity,
                    pianoDensity,
                    bar,
                    drumsAnswerContext,
                    pianoPattern.steps.map(s => s.time),
                    trioContext
                );
            }

            const pattern = currentPatternRef.current;
            const isNewChord = currentChord && currentChord !== lastChordRef.current;
            if (isNewChord) lastChordRef.current = currentChord;

            // 2. RhythmEngine steps + pocket; every chord in the sequence must be played (anticipation/delay OK, not tied to bar borders)
            if (currentChord && pianoRef.current?.loaded && !pianoMutedSignal.value) {
                const currentStep = pattern?.steps.find(s => {
                    const parts = s.time.split(':');
                    const patternBeat = parseInt(parts[1], 10);
                    return patternBeat === beat;
                });
                const targetChord = (currentStep && currentStep.isAnticipation && nextChord) ? nextChord : currentChord;
                // Fallback when we haven't stated this chord yet — can land on any beat after 1 (anticipation/delay, not tied to the one)
                const needFallback = currentChord !== lastStatedChordRef.current && beat >= 1 && beat < beatsPerBar;
                const shouldPlay = !!currentStep || needFallback;

                if (shouldPlay) {
                    const voicing = compingEngineRef.current.getNextVoicing(targetChord, { addRoot: bassMutedSignal.value });

                    if (voicing.length > 0) {
                        lastVoicingRef.current = voicing;
                        const duration = currentStep?.duration ?? '4n';
                        const isStab = duration === '8n' || duration === '16n';
                        const notes = isStab ? voicing.slice(0, 2) : voicing;
                        const humanOffset = currentStep
                            ? reactiveCompingEngineRef.current.getMicroTimingForStep(
                                { time: currentStep.time, duration, isAnticipation: currentStep.isAnticipation },
                                bpm
                            )
                            : reactiveCompingEngineRef.current.getMicroTimingForStep({ time: `0:${beat}:2`, duration: '4n', isAnticipation: false }, bpm);
                        const scheduleTime = time + humanOffset;
                        const baseVel = 0.55 + (activity * 0.2) + (Math.random() * 0.1);
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
                        lastStatedChordRef.current = targetChord;
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

                const offBeatOffsetSec = grooveRef.current.getOffBeatOffsetInBeat(bpm);
                hitsForBeat.forEach(hit => {
                    const microTiming = drumEngineRef.current.getMicroTiming(bpm, hit.instrument);
                    const sixteenthOffset = hit.time.split(':')[2];
                    const isOffBeat = sixteenthOffset === '2';
                    const offsetTime = isOffBeat ? offBeatOffsetSec : Tone.Time(`0:0:${sixteenthOffset}`).toSeconds();
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
        }, PLAYBACK_LOOP_INTERVAL);

        loop.start(0);
        return () => {
            clearMeterChangeSchedules(meterScheduleIdsRef.current);
            meterScheduleIdsRef.current = [];
            loop.dispose();
        };
    }, [isActive, !!song]);

    const togglePlayback = () => {
        if (isPlayingSignal.value) {
            clearMeterChangeSchedules(meterScheduleIdsRef.current);
            meterScheduleIdsRef.current = [];
            Tone.Transport.stop();
            isPlayingSignal.value = false;
            currentMeasureIndexSignal.value = -1;
            currentBeatSignal.value = -1;
            currentChordSymbolSignal.value = "";
            return;
        }
        if (startPendingRef.current) return;
        startPendingRef.current = true;
        isPlayingSignal.value = true;
        Tone.start()
            .then(() => {
                Tone.Transport.start();
                if (!isAudioReady()) initGlobalAudio().catch(() => {});
            })
            .catch(() => {
                isPlayingSignal.value = false;
            })
            .finally(() => {
                startPendingRef.current = false;
            });
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
