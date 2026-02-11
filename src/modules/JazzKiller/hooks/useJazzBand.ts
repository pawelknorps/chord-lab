import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { JazzTheoryService, JazzVoicingType } from '../utils/JazzTheoryService';
import { getChordDna, CompingEngine, RhythmEngine, type RhythmPattern } from '../../../core/theory';
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
    activityLevelSignal,
    pianoMutedSignal,
    bassMutedSignal,
    drumsMutedSignal,
    pianoSoloSignal,
    bassSoloSignal,
    drumsSoloSignal
} from '../state/jazzSignals';
import { Signal } from "@preact/signals-react";
import { playGuideChord, isAudioReady, initAudio as initGlobalAudio } from '../../../core/audio/globalAudio';
import { getDirectorInstrument } from '../../../core/audio/directorInstrumentSignal';

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

export const useJazzBand = (song: any, isActive: boolean = true): JazzPlaybackState => {
    const pianoRef = useRef<Tone.Sampler | null>(null);
    const bassRef = useRef<Tone.Sampler | null>(null);
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
    const currentPatternRef = useRef<RhythmPattern | null>(null);

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

        const drumBaseUrl = "/drum_samples/";
        drumsRef.current = {
            ride: new Tone.Sampler({ urls: { "C1": "Ride1_NateSmith.wav", "D1": "Ride2_NateSmith.wav", "E1": "RideBell_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value, onload: checkLoaded }).connect(reverbRef.current),
            hihat: new Tone.Sampler({ urls: { "C1": "HiHatClosed1_NateSmith.wav", "F1": "HiHatOpen1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 4, onload: checkLoaded }).connect(reverbRef.current),
            snare: new Tone.Sampler({ urls: { "C1": "SnareTight1_NateSmith.wav", "D1": "SnareDeep1_NateSmith.wav", "E1": "CrossStick1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 8, onload: checkLoaded }).connect(reverbRef.current),
            kick: new Tone.Sampler({ urls: { "C1": "KickTight1_NateSmith.wav", "E1": "KickOpen1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 6, onload: checkLoaded }).connect(reverbRef.current)
        };

        return () => {
            pianoRef.current?.dispose(); bassRef.current?.dispose();
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
    useEffect(() => { if (bassRef.current) bassRef.current.volume.rampTo(getOutputVolume('bass', bassVolumeSignal.value), 0.1); }, [bassVolumeSignal.value, bassMutedSignal.value, bassSoloSignal.value, pianoSoloSignal.value, drumsSoloSignal.value]);
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

        const quarterTime = Tone.Time("4n").toSeconds();

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
                loopCountSignal.value = 0;
                return;
            }

            Tone.Draw.schedule(() => {
                currentMeasureIndexSignal.value = measureIndex;
                currentBeatSignal.value = beat;
                loopCountSignal.value = currentLoop;
            }, time);

            const measure = song.music.measures[measureIndex];
            if (!measure) return;

            const nextLogicalBar = (logicalBar * 4 + beat + 1) / 4;
            const nextMeasureIndex = plan[Math.floor(nextLogicalBar) % plan.length];
            const nextMeasure = song.music.measures[nextMeasureIndex];
            const chords = measure.chords || [];
            const nextChords = nextMeasure?.chords || [];
            const currentChord = (chords.length === 1 ? chords[0] : chords.length === 2 ? (beat < 2 ? chords[0] : chords[1]) : chords[Math.min(beat, chords.length - 1)] ?? chords[0] ?? "")?.trim() ?? "";
            const nextChord = (nextChords.length === 1 ? nextChords[0] : nextChords.length === 2 ? (beat < 2 ? nextChords[0] : nextChords[1]) : nextChords[Math.min(beat + 1, nextChords.length - 1)] ?? nextChords[0] ?? "")?.trim() ?? "";

            tensionCycleRef.current = (bar * 4 + beat) / 16;
            const currentTension = 0.5 + Math.sin(tensionCycleRef.current) * 0.3 + (activityLevelSignal.value * 0.2);
            const activity = activityLevelSignal.value;

            // Voicing type follows tension + activity (increasing intensity/reactivity of the band)
            voicingTypeRef.current = JazzTheoryService.getNextLogicalVoicingType(voicingTypeRef.current, activity, currentTension, currentTension > 0.6);

            // BASS: one note per quarter (loop runs every 4n = walking bass)
            if (currentChord && bassRef.current?.loaded) {
                const bassNote = JazzTheoryService.getNextWalkingBassNote(beat, currentChord, nextChord || null, lastBassNoteRef.current, currentTension);
                const safeBass = Number.isFinite(bassNote) ? bassNote : lastBassNoteRef.current;
                lastBassNoteRef.current = safeBass;
                const vel = 0.7 + currentTension * 0.2;
                bassRef.current.triggerAttackRelease(Tone.Frequency(safeBass, "midi").toNote(), "4n", time, vel);
                onNoteRef.current?.({ midi: safeBass, velocity: vel, instrument: 'bass', type: 'root', duration: 1 });
            }

            // PIANO PRO: Phrase-Based Template Engine (Phase 11)
            const bpm = bpmSignal.value;

            // 1. Select a 1-bar Phrase Template at the start of each bar
            if (beat === 0) {
                currentPatternRef.current = rhythmEngineRef.current.getRhythmPattern(bpm, activityLevelSignal.value);
            }

            const pattern = currentPatternRef.current;
            const isNewChord = currentChord && currentChord !== lastChordRef.current;
            if (isNewChord) lastChordRef.current = currentChord;

            if (currentChord && pianoRef.current?.loaded && !pianoMutedSignal.value) {
                // 2. Check if the current beat matches a step in the phrase template
                const currentStep = pattern?.steps.find(s => {
                    const parts = s.time.split(':');
                    const patternBeat = parseInt(parts[1], 10);
                    // For now, simple beat match. In 2026 update, move loop to 16n for syncopated steps.
                    return patternBeat === beat;
                });

                // RULE: Always play at least once on a chord change to act as a reliable backing track
                const shouldPlay = currentStep || isNewChord;

                if (shouldPlay) {
                    // 3. Anticipation Logic (Push): If step is anticipation, "steal" the next chord
                    const targetChord = (currentStep && currentStep.isAnticipation && nextChord) ? nextChord : currentChord;

                    // 4. Harmony Solution: Pro Grip Dictionary + Pivot Rule
                    // BASS-ASSIST: Add root note if the bass instrument is muted
                    const voicing = compingEngineRef.current.getNextVoicing(targetChord, {
                        addRoot: bassMutedSignal.value
                    });

                    if (voicing.length > 0) {
                        lastVoicingRef.current = voicing;

                        // 5. Articulation & Dynamics
                        const baseVel = 0.55 + (activityLevelSignal.value * 0.2) + (Math.random() * 0.1);
                        const duration = currentStep?.duration || "4n";

                        voicing.forEach((n, i) => {
                            const t = time + i * 0.008;
                            const vel = baseVel * (0.95 + Math.random() * 0.1);
                            pianoRef.current?.triggerAttackRelease(Tone.Frequency(n, "midi").toNote(), duration, t, vel);
                            onNoteRef.current?.({
                                midi: n,
                                velocity: vel,
                                instrument: 'piano',
                                type: JazzTheoryService.getNoteFunction(n, targetChord),
                                duration: 1
                            });
                        });
                    }
                }
            }

            // DRUMS: energy match — if Extension layer has >2 alterations (e.g. alt), increase ride bell probability
            if (drumsRef.current) {
                const isStrongBeat = beat === 0 || beat === 2;
                const dna = currentChord ? getChordDna(JazzTheoryService.normalizeChordSymbolForTheory(currentChord)) : null;
                const altHeavy = (dna?.extension.alterationCount ?? 0) > 2;
                const rideNote = (activity > 0.5 && Math.random() > 0.7) || (altHeavy && Math.random() > 0.5) ? "E1" : (activity > 0.3 && Math.random() > 0.5 ? "D1" : "C1");
                const rideVel = (isStrongBeat ? 0.6 : 0.4) + (Math.random() * 0.1) + (activity * 0.1);
                drumsRef.current.ride.triggerAttack(rideNote, time, Math.min(1, rideVel));

                if (activity > 0.4 && (beat === 1 || beat === 3 || Math.random() > 0.6)) {
                    const skipTime = time + quarterTime * 0.66;
                    drumsRef.current.ride.triggerAttack(rideNote, skipTime, 0.2 + Math.random() * 0.15 + activity * 0.1);
                }

                if (beat === 1 || beat === 3) drumsRef.current.hihat.triggerAttack("C1", time, 0.5 + activity * 0.15);
                if (beat === 0) drumsRef.current.kick.triggerAttack("C1", time, 0.2 + activity * 0.15);
                const snareChance = 0.3 + activity * 0.5;
                if ((beat === 2 || (beat === 1 && activity > 0.6)) && Math.random() < snareChance) {
                    const snareOffset = activity > 0.5 ? (Math.random() > 0.5 ? Tone.Time("8t").toSeconds() : Tone.Time("8t").toSeconds() * 2) : 0;
                    drumsRef.current.snare.triggerAttack("C1", time + snareOffset, 0.1 + Math.random() * 0.2 + activity * 0.1);
                }
            }
        }, "4n");

        loop.start(0);
        return () => { loop.dispose(); };
    }, [isActive, song, activityLevelSignal.value]);

    const togglePlayback = async () => {
        if (isPlayingSignal.value) {
            Tone.Transport.stop();
            isPlayingSignal.value = false;
        } else {
            if (!isAudioReady()) await initGlobalAudio();
            await Tone.start();
            Tone.Transport.start();
            isPlayingSignal.value = true;
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

    return {
        isPlayingSignal, isLoadedSignal, currentMeasureIndexSignal, currentBeatSignal,
        bpmSignal, loopCountSignal, totalLoopsSignal, togglePlayback, playChord,
        setBpm: (val: number) => bpmSignal.value = val,
        onNote: (cb) => onNoteRef.current = cb
    };
};
