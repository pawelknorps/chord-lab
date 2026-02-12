import { signal } from '@preact/signals-react';

export * from '../../../core/audio/audioSignals';

// Jazz Killer specific state signals
export const isPremiumEngineSignal = signal(true);
// Driven by BPM (50–240): activity = (bpm - 50) / 190; default BPM 120 → ~37%
export const activityLevelSignal = signal((120 - 50) / 190);
export const isLoadedSignal = signal(false);
export const loopCountSignal = signal(0);
export const totalLoopsSignal = signal(4);
export const transposeSignal = signal(0);

// Mute/Solo Signals
export const pianoMutedSignal = signal(false);
export const bassMutedSignal = signal(false);
export const drumsMutedSignal = signal(false);

export const pianoSoloSignal = signal(false);
export const bassSoloSignal = signal(false);
export const drumsSoloSignal = signal(false);

/** Time signature for the current tune (e.g. '4/4', '3/4', '7/8'). Set from song.TimeSignature on load. */
export const meterSignal = signal<string>('4/4');

/** 'Walking' = busy bass → sparse piano; 'TwoFeel' = open → denser piano (combined with RhythmEngine) */
export const bassModeSignal = signal<'Walking' | 'TwoFeel'>('Walking');

/** Whole-tune arc: 0..1, gentle start → build → peak → wind down. Updated each beat during playback. */
export const tuneIntensitySignal = signal(0.5);
/** Progress through the tune: 0 = start, 1 = end. Updated each beat during playback. */
export const tuneProgressSignal = signal(0);

// Soloist-Responsive Playback (Phase 19): band listens to mic and steers density—more space when user plays, more backing when user rests.
/** When true, band density is steered by soloist activity from SwiftF0; default false. */
export const soloistResponsiveEnabledSignal = signal(false);
/** 0–1: how much the soloist is playing (from pitch/onset); updated by useSoloistActivity. */
export const soloistActivitySignal = signal(0);

// AI Teacher Signals
export const proactiveAdviceSignal = signal<string | null>(null);
export const isAiThinkingSignal = signal(false);
export const aiTeacherModeSignal = signal<'proactive' | 'reactive'>('reactive');
export const lastPivotIndexSignal = signal(-1);
export const selectedMeasureRangeSignal = signal<[number, number] | null>(null);
