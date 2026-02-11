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
    activityLevelSignal
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

interface BebopPhrase {
    rhythm: number[][];
    texturePath: number[];
    complexity: 'classic' | 'modern' | 'both';
}

interface DrumCompingPhrase {
    snare: number[];
    kick: number[];
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
    const activePhraseRef = useRef<BebopPhrase | null>(null);
    const phraseMeasureIndexRef = useRef<number>(0);
    const pianoLastHitTimeRef = useRef<number>(0);
    const drumCompingPhraseRef = useRef<DrumCompingPhrase | null>(null);
    const tensionCycleRef = useRef<number>(0);
    const bassRhythmPatternRef = useRef<number[]>([0, 1, 2, 3]);
    const lastCallRef = useRef<{ instrument: 'piano' | 'bass' | 'drums', beat: number, offset: number, bar: number } | null>(null);
    const currentRhythmicIntentRef = useRef<{ beat: number, offset: number, velocity: number, instrument: string }[]>([]);

    useEffect(() => {
        reverbRef.current = new Tone.Reverb({ decay: 2.2, wet: reverbVolumeSignal.value }).toDestination();
        pianoReverbRef.current = new Tone.Reverb({ decay: 2.8, wet: pianoReverbSignal.value }).toDestination();
        pianoRef.current = new Tone.Sampler({ urls: { "C2": "C2.m4a", "F#2": "Fs2.m4a", "C3": "C3.m4a", "F#3": "Fs3.m4a", "C4": "C4.m4a", "F#4": "Fs4.m4a", "C5": "C5.m4a" }, baseUrl: "/audio/piano/", onload: () => checkLoaded(), volume: pianoVolumeSignal.value }).connect(pianoReverbRef.current);
        bassRef.current = new Tone.Sampler({ urls: { "E1": "E1.m4a", "A#1": "As1.m4a", "E2": "E2.m4a", "A#2": "As2.m4a", "E3": "E3.m4a", "A#3": "As3.m4a" }, baseUrl: "/audio/bass/", onload: () => checkLoaded(), volume: bassVolumeSignal.value }).connect(reverbRef.current);
        const drumBaseUrl = "/drum_samples/";
        drumsRef.current = {
            ride: new Tone.Sampler({ urls: { "C1": "Ride1_NateSmith.wav", "D1": "Ride2_NateSmith.wav", "E1": "RideBell_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value, onload: () => checkLoaded() }).connect(reverbRef.current),
            hihat: new Tone.Sampler({ urls: { "C1": "HiHatClosed1_NateSmith.wav", "F1": "HiHatOpen1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 4, onload: () => checkLoaded() }).connect(reverbRef.current),
            snare: new Tone.Sampler({ urls: { "C1": "SnareTight1_NateSmith.wav", "D1": "SnareDeep1_NateSmith.wav", "E1": "CrossStick1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 8, onload: () => checkLoaded() }).connect(reverbRef.current),
            kick: new Tone.Sampler({ urls: { "C1": "KickTight1_NateSmith.wav", "E1": "KickOpen1_NateSmith.wav" }, baseUrl: drumBaseUrl, volume: drumsVolumeSignal.value - 6, onload: () => checkLoaded() }).connect(reverbRef.current)
        };
        const checkLoaded = () => { if (pianoRef.current?.loaded && bassRef.current?.loaded && drumsRef.current?.ride.loaded) isLoadedSignal.value = true; };
        return () => { pianoRef.current?.dispose(); bassRef.current?.dispose(); drumsRef.current?.ride.dispose(); drumsRef.current?.hihat.dispose(); drumsRef.current?.snare.dispose(); drumsRef.current?.kick.dispose(); reverbRef.current?.dispose(); pianoReverbRef.current?.dispose(); };
    }, []);

    useEffect(() => { if (pianoRef.current) pianoRef.current.volume.value = pianoVolumeSignal.value; }, [pianoVolumeSignal.value]);
    useEffect(() => { if (bassRef.current) bassRef.current.volume.value = bassVolumeSignal.value; }, [bassVolumeSignal.value]);
    useEffect(() => { if (drumsRef.current) { drumsRef.current.ride.volume.value = drumsVolumeSignal.value; drumsRef.current.hihat.volume.value = drumsVolumeSignal.value - 4; drumsRef.current.snare.volume.value = drumsVolumeSignal.value - 8; drumsRef.current.kick.volume.value = drumsVolumeSignal.value - 6; } }, [drumsVolumeSignal.value]);
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

            const plan = song.music.playbackPlan || [];
            if (plan.length === 0) return;

            const logicalBar = bar % plan.length;
            const measureIndex = plan[logicalBar];
            const currentLoop = Math.floor(bar / plan.length);

            if (currentLoop >= totalLoopsSignal.value) { Tone.Transport.stop(); isPlayingSignal.value = false; return; }

            const currentTension = Math.sin(((bar % 8) / 8) * Math.PI * 0.95);
            tensionCycleRef.current = currentTension;

            Tone.Draw.schedule(() => {
                currentMeasureIndexSignal.value = measureIndex;
                currentBeatSignal.value = beat;
                loopCountSignal.value = currentLoop;
            }, time);

            const measure = song.music.measures[measureIndex];
            const chords = measure.chords || [];
            let currentChord = chords[0];
            if (chords.length === 2 && beat >= 2) currentChord = chords[1];

            // Next Chord Logic
            const nextLogicalBar = (logicalBar * 4 + beat + 1) / 4;
            const nextMeasureIndex = plan[Math.floor(nextLogicalBar) % plan.length];
            const nextMeasure = song.music.measures[nextMeasureIndex];
            const nextChord = chords.length > 1 && beat < chords.length - 1 ? chords[beat + 1] : nextMeasure.chords[0];

            const quarterTime = Tone.Time("4n").toSeconds();

            // 1. Phrased Modern Bass
            if (bassRef.current?.loaded) {
                if (beat === 0) {
                    const activity = activityLevelSignal.value;
                    // Core rule: "Walking bass by default, color when the band burns."
                    // Burns means high tension AND high activity.
                    const isBurning = currentTension > 0.8 && activity > 0.7;

                    if (isBurning && Math.random() > 0.6) {
                        // Intense variations: triplets and syncopations
                        bassRhythmPatternRef.current = Math.random() > 0.5 ? [0, 1, 2, 2.66, 3] : [0, 1, 1.5, 3];
                    } else if (currentTension > 0.5 && activity > 0.5 && Math.random() > 0.85) {
                        // Rare subtle color: ghost note or triplet skip
                        bassRhythmPatternRef.current = Math.random() > 0.5 ? [0, 0.66, 1, 2, 3] : [0, 1, 2, 2.5, 3];
                    } else {
                        // Solid walking bass: strictly quarter notes
                        bassRhythmPatternRef.current = [0, 1, 2, 3];
                    }
                }

                bassRhythmPatternRef.current.forEach(pHit => {
                    const pBase = Math.floor(pHit);
                    const pOffset = pHit % 1;
                    if (beat === pBase) {
                        const hitTime = time + pOffset * quarterTime;
                        const bassNote = JazzTheoryService.getNextWalkingBassNote(beat, currentChord, nextChord, lastBassNoteRef.current, currentTension);
                        const finalVel = pOffset === 0 ? (beat === 0 ? 0.85 : 0.75) : 0.4;
                        bassRef.current?.triggerAttackRelease(Tone.Frequency(bassNote, "midi").toNote(), "4n", hitTime, finalVel + (currentTension * 0.1));
                        lastBassNoteRef.current = bassNote;
                        if (pOffset > 0) lastCallRef.current = { instrument: 'bass', beat, offset: pOffset, bar };
                    }
                });
            }

            // 2. Phrased Piano
            if (pianoRef.current?.loaded) {
                const BEBOP_PHRASES: BebopPhrase[] = [
                    { rhythm: [[0, 1.5], [1, 2.5]], texturePath: [0.3, 0.4], complexity: 'classic' },
                    { rhythm: [[1.5, 3.5]], texturePath: [0.5, 0.7], complexity: 'classic' },
                    { rhythm: [[0], [-1], [0.5, 2], [-1]], texturePath: [0.6, 0.3, 0.8, 0.4], complexity: 'both' },
                    { rhythm: [[0, 3.5], [1.5, 3]], texturePath: [0.4, 0.8], complexity: 'modern' },
                    { rhythm: [[0, 1.5, 3], [-1], [0.5, 2, 3.5], [0]], texturePath: [0.2, 0.1, 0.7, 1.0], complexity: 'modern' }
                ];
                const activity = activityLevelSignal.value;
                const bpm = bpmSignal.value;
                const compStyle = song.compStyle?.toLowerCase() || "";

                // INTELLIGENT STYLE DETECTION
                const isModern = compStyle.includes('up tempo') ||
                    compStyle.includes('fast') ||
                    bpm > 200 ||
                    (activity > 0.8 && !compStyle.includes('ballad'));

                const filterComplexity = isModern || currentTension > 0.65 || activity > 0.6 ? 'modern' : 'classic';
                const availablePhrases = BEBOP_PHRASES.filter(p => p.complexity === filterComplexity || p.complexity === 'both');
                if (!activePhraseRef.current || phraseMeasureIndexRef.current >= activePhraseRef.current.rhythm.length || (beat === 0 && bar % (activePhraseRef.current.rhythm.length || 1) === 0)) {
                    if (beat === 0) { activePhraseRef.current = availablePhrases[Math.floor(Math.random() * availablePhrases.length)]; phraseMeasureIndexRef.current = 0; }
                }
                if (beat === 0 && bar !== 0) phraseMeasureIndexRef.current = bar % (activePhraseRef.current?.rhythm.length || 1);
                const currentPhrase = activePhraseRef.current || BEBOP_PHRASES[0];
                const measureHits = currentPhrase.rhythm[phraseMeasureIndexRef.current] || [-1];
                const targetIntensity = (currentPhrase.texturePath[phraseMeasureIndexRef.current] || 0.5) * (0.6 + activity * 0.4);

                let shouldPlay = false; let offset = 0;
                if (measureHits[0] !== -1) { for (const pHit of measureHits) { if (beat === Math.floor(pHit)) { shouldPlay = true; offset = pHit % 1; break; } } }
                const isChordChangePoint = (beat === 0) || (chords.length === 2 && beat === 2);
                if (isChordChangePoint && !shouldPlay && Math.random() < 0.85) { shouldPlay = true; offset = 0; }

                if (shouldPlay) {
                    pianoLastHitTimeRef.current = bar * 4 + beat;
                    const prefType = JazzTheoryService.getNextLogicalVoicingType(voicingTypeRef.current, Math.min(1, targetIntensity), currentTension, isModern);
                    voicingTypeRef.current = prefType;
                    const voicing = JazzTheoryService.getPianoVoicing(currentChord, prefType, 3, lastVoicingRef.current, currentTension, isModern, lastBassNoteRef.current);
                    lastVoicingRef.current = voicing;
                    const hitTime = time + offset * quarterTime;
                    const baseVel = 0.35 + (activity * 0.2) + (currentTension * 0.1);

                    // DYNAMIC SUSTAIN: Longer durations for slower tunes or low activity
                    let duration = "4n";
                    if (bpm < 100 || !isModern) {
                        const dice = Math.random();
                        if (dice > 0.7) duration = "1n"; // Full notes
                        else if (dice > 0.4) duration = "2n"; // Half notes
                    } else if (bpm < 160 && activity < 0.6) {
                        duration = Math.random() > 0.5 ? "2n" : "4n";
                    }

                    voicing.forEach((n, i) => {
                        const stagger = i * (0.002 + Math.random() * 0.008);
                        pianoRef.current?.triggerAttackRelease(Tone.Frequency(n, "midi").toNote(), duration, hitTime + stagger, baseVel);
                    });
                    currentRhythmicIntentRef.current.push({ beat, offset, velocity: baseVel, instrument: 'piano' });
                    if (offset > 0) lastCallRef.current = { instrument: 'piano', beat, offset, bar };
                }
            }

            // 3. Humanized & Organized Jazz Drums
            if (drumsRef.current) {
                const activity = activityLevelSignal.value;
                const isBurning = currentTension > 0.8 && activity > 0.7;

                // Rhythmic Motifs: More organized and less chaotic
                if (beat === 0 && bar % 2 === 0) {
                    const DRUM_PHRASES: DrumCompingPhrase[] = [
                        { snare: [2.5], kick: [0] },              // Simple push
                        { snare: [1.5, 3.5], kick: [] },          // Traditional snare chatter
                        { snare: [3.66], kick: [3.66] },          // End of phrase push
                        { snare: [], kick: [] },                   // Laying out (very human)
                        { snare: [0.66, 2.66], kick: [] }         // Subtle syncopation
                    ];
                    // At high tension, allow busier patterns
                    if (isBurning) {
                        DRUM_PHRASES.push(
                            { snare: [1.66, 3.66], kick: [0, 2.66] },
                            { snare: [0.5, 2, 3], kick: [0] }
                        );
                    }
                    drumCompingPhraseRef.current = DRUM_PHRASES[Math.floor(Math.random() * DRUM_PHRASES.length)];
                }

                const is24 = beat === 1 || beat === 3;

                // 1. STEADY SWING FOUNDATION (The Ride is everything)
                const rideVel = (is24 ? 0.6 : 0.42) + (activity * 0.15) + (currentTension * 0.1);
                const useBell = (currentTension > 0.9 && activity > 0.85) && Math.random() < 0.1;
                const rideSample = useBell ? "E1" : (Math.random() > 0.5 ? "D1" : "C1");
                drumsRef.current.ride.triggerAttack(rideSample, time, rideVel);

                // Steady "Spang-a-lang" skip (slightly more human timing)
                const skipTime = time + quarterTime * (0.63 + Math.random() * 0.04);
                drumsRef.current.ride.triggerAttack("C1", skipTime, rideVel * 0.35);

                // Hi-Hat strictly on 2 and 4
                if (is24) drumsRef.current.hihat.triggerAttack("C1", time, 0.45 + activity * 0.1);

                // 2. KICK DRUM: Feathering vs Bombs
                // Feathering (4-on-the-floor): Classic pulse, but humans take breaks.
                // We drop feathering during intense sections or high bpm for more "modern" syncopation.
                const shouldFeather = !isBurning && Math.random() < 0.7;
                const featherVel = 0.08 + (activity * 0.08);
                let kickPlayedThisBeat = false;

                // 3. COMPING & INTERACTIVE (Snare/Kick "Bombs")
                const drumPhrase = drumCompingPhraseRef.current;
                if (drumPhrase) {
                    drumPhrase.snare.forEach(pHit => {
                        if (beat === Math.floor(pHit)) {
                            const vel = (0.22 + activity * 0.3) * (isBurning ? 1.25 : 0.85);
                            drumsRef.current?.snare.triggerAttack("C1", time + (pHit % 1) * quarterTime, vel);
                        }
                    });
                    drumPhrase.kick.forEach(pHit => {
                        if (beat === Math.floor(pHit)) {
                            const pOffset = pHit % 1;
                            const vel = 0.45 + activity * 0.35;
                            drumsRef.current?.kick.triggerAttack("C1", time + pOffset * quarterTime, vel);
                            if (pOffset === 0) kickPlayedThisBeat = true;
                        }
                    });
                }

                // REACTIVE KICK: Explicit accents with the piano
                const intentsForBeat = currentRhythmicIntentRef.current.filter(i => i.beat === beat);
                intentsForBeat.forEach(intent => {
                    const reactChance = isBurning ? 0.7 : 0.3;
                    if (Math.random() < reactChance) {
                        const reactTime = time + intent.offset * quarterTime;
                        // Snare reaction
                        drumsRef.current?.snare.triggerAttack("C1", reactTime, 0.25 + activity * 0.2);

                        // KICK BOMB ACCENT: High velocity when the piano hits hard
                        if (intent.velocity > 0.45 || (isBurning && Math.random() > 0.5)) {
                            drumsRef.current?.kick.triggerAttack("C1", reactTime, 0.5 + activity * 0.25);
                            if (intent.offset === 0) kickPlayedThisBeat = true;
                        }
                    }
                });
                currentRhythmicIntentRef.current = currentRhythmicIntentRef.current.filter(i => i.beat !== beat);

                // Apply feathering only if no bomb was played on the downbeat
                if (shouldFeather && !kickPlayedThisBeat) {
                    drumsRef.current.kick.triggerAttack("C1", time, featherVel);
                }

                // GHOST NOTES: On the snare "and" or subdivisions
                if (Math.random() < (0.1 + currentTension * 0.2)) {
                    const ghostOff = Math.random() > 0.5 ? 0.33 : 0.66;
                    drumsRef.current?.snare.triggerAttack("C1", time + ghostOff * quarterTime, 0.03 + Math.random() * 0.02);
                }

                // Structural Anchor: Cross-stick on beat 4 of every second bar
                if (beat === 3 && bar % 2 === 1) drumsRef.current.snare.triggerAttack("E1", time, 0.4 + activity * 0.1);

                // Space Fill: Subtle snare commentary when the pianist is laying out
                const space = (bar * 4 + beat) - pianoLastHitTimeRef.current;
                if (space > 5 && Math.random() < 0.4) {
                    drumsRef.current.snare.triggerAttack("C1", time + (quarterTime / 3) * 2, 0.15 + activity * 0.2);
                }
            }
        }, "4n").start(0);
        return () => { loop.dispose(); };
    }, [song, isActive]);

    const togglePlayback = async () => {
        if (isPlayingSignal.value) {
            Tone.Transport.stop();
            isPlayingSignal.value = false;
            currentMeasureIndexSignal.value = -1;
            currentBeatSignal.value = -1;
        }
        else { await Tone.start(); Tone.Transport.start(); isPlayingSignal.value = true; }
    };

    const playChord = (symbol: string) => {
        if (!pianoRef.current?.loaded) return;
        const notes = JazzTheoryService.getPianoVoicing(symbol, 'rootless', 4).map(n => Tone.Frequency(n, "midi").toNote());
        pianoRef.current.triggerAttackRelease(notes, "2n", undefined, 0.45);
    };

    return { isPlayingSignal, isLoadedSignal, currentMeasureIndexSignal, currentBeatSignal, bpmSignal, loopCountSignal, totalLoopsSignal, togglePlayback, playChord, setBpm: (val: number) => bpmSignal.value = val };
};
