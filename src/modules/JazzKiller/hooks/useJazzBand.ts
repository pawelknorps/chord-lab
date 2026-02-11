import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { JazzTheoryService, JazzVoicingType } from '../utils/JazzTheoryService';
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
import { playGuideChord, isAudioReady } from '../../../core/audio/globalAudio';
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
    const voicingTypeRef = useRef<JazzVoicingType>('rootless');
    const pianoLastHitTimeRef = useRef<number>(0);
    const tensionCycleRef = useRef<number>(0);
    const onNoteRef = useRef<(note: any) => void>();

    useEffect(() => {
        const checkLoaded = () => { if (pianoRef.current?.loaded && bassRef.current?.loaded && drumsRef.current?.ride.loaded) isLoadedSignal.value = true; };

        reverbRef.current = new Tone.Reverb({ decay: 2.2, wet: reverbVolumeSignal.value }).toDestination();
        pianoReverbRef.current = new Tone.Reverb({ decay: 2.8, wet: pianoReverbSignal.value }).toDestination();

        pianoRef.current = new Tone.Sampler({
            urls: { "C2": "C2.m4a", "F#2": "Fs2.m4a", "C3": "C3.m4a", "F#3": "Fs3.m4a", "C4": "C4.m4a", "F#4": "Fs4.m4a", "C5": "C5.m4a" },
            baseUrl: "/audio/piano/",
            onload: checkLoaded,
            volume: pianoVolumeSignal.value
        }).connect(pianoReverbRef.current);

        bassRef.current = new Tone.Sampler({
            urls: { "E1": "E1.m4a", "A#1": "As1.m4a", "E2": "E2.m4a", "A#2": "As2.m4a", "E3": "E3.m4a", "A#3": "As3.m4a" },
            baseUrl: "/audio/bass/",
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

        const loop = new Tone.Loop((time) => {
            const position = Tone.Transport.position.toString().split(':');
            const bar = parseInt(position[0]);
            const beat = parseInt(position[1]);
            const sixteenths = parseFloat(position[2]);

            const measureIndex = bar % song.music.measures.length;
            const currentChord = song.music.measures[measureIndex].chord;
            const nextChord = song.music.measures[(measureIndex + 1) % song.music.measures.length].chord;

            if (bar === 0 && beat === 0 && sixteenths === 0) loopCountSignal.value = 0;
            if (bar > 0 && bar % song.music.measures.length === 0 && beat === 0 && sixteenths === 0) {
                loopCountSignal.value++;
                if (loopCountSignal.value >= totalLoopsSignal.value) {
                    togglePlayback();
                    return;
                }
            }

            currentMeasureIndexSignal.value = measureIndex;
            currentBeatSignal.value = beat;

            tensionCycleRef.current = (bar * 4 + beat) / 16;
            const currentTension = 0.5 + Math.sin(tensionCycleRef.current) * 0.3 + (activityLevelSignal.value * 0.2);

            // BASS logic
            if (sixteenths === 0) {
                const bassNote = JazzTheoryService.getNextWalkingBassNote(beat, currentChord, nextChord, lastBassNoteRef.current, currentTension);
                const hitTime = time + (Math.random() * 0.02 - 0.01);
                const finalVel = 0.7 + (currentTension * 0.2);

                bassRef.current?.triggerAttackRelease(Tone.Frequency(bassNote, "midi").toNote(), "4n", hitTime, finalVel);
                lastBassNoteRef.current = bassNote;

                onNoteRef.current?.({
                    midi: bassNote,
                    velocity: finalVel,
                    instrument: 'bass',
                    type: 'root',
                    duration: 1
                });
            }

            // PIANO logic
            const shouldPianoHit = (Math.random() < 0.4 + activityLevelSignal.value * 0.4);
            if (shouldPianoHit && (sixteenths === 0 || sixteenths === 2)) {
                const hitTime = time + (Math.random() * 0.03 - 0.015);
                if (hitTime - pianoLastHitTimeRef.current > 0.4) {
                    const duration = Math.random() > 0.5 ? "4n" : "8n";
                    const voicing = JazzTheoryService.getPianoVoicing(currentChord, voicingTypeRef.current, 3, lastVoicingRef.current, currentTension, false, lastBassNoteRef.current);

                    voicing.forEach((n, i) => {
                        const stagger = i * (0.005 + Math.random() * 0.01);
                        const baseVel = 0.5 + Math.random() * 0.2;
                        pianoRef.current?.triggerAttackRelease(Tone.Frequency(n, "midi").toNote(), duration, hitTime + stagger, baseVel);

                        onNoteRef.current?.({
                            midi: n,
                            velocity: baseVel,
                            instrument: 'piano',
                            type: JazzTheoryService.getNoteFunction(n, currentChord),
                            duration: duration === "4n" ? 1 : 0.5
                        });
                    });

                    lastVoicingRef.current = voicing;
                    pianoLastHitTimeRef.current = hitTime;
                }
            }

            // DRUMS logic
            if (drumsRef.current) {
                const jitter = () => (Math.random() - 0.5) * 0.01;
                // Ride
                if (sixteenths === 0 || sixteenths === 2.6) {
                    drumsRef.current.ride.triggerAttack("C1", time + jitter(), 0.7 + Math.random() * 0.2);
                }
                // Hihat on 2 and 4
                if (beat === 1 || beat === 3) {
                    drumsRef.current.hihat.triggerAttack("C1", time + jitter(), 0.6);
                }
                // Snare comping
                if (Math.random() < 0.2 + activityLevelSignal.value * 0.2) {
                    drumsRef.current.snare.triggerAttack("C1", time + jitter(), 0.3 + Math.random() * 0.2);
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
            await Tone.start();
            // Ensure global audio (Director guide instrument) is ready for playGuideChord
            const { initAudio } = await import('../../../core/audio/globalAudio');
            await initAudio();
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
