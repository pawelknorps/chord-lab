import { signal } from '@preact/signals-react';

// High-frequency playback state
export const isPlayingSignal = signal(false);
export const currentMeasureIndexSignal = signal(-1);
export const currentBeatSignal = signal(-1);
export const bpmSignal = signal(120);

// Volume controls (JazzKiller Mixer defaults)
export const pianoVolumeSignal = signal(-17);
export const bassVolumeSignal = signal(-7);
export const drumsVolumeSignal = signal(0);
export const reverbVolumeSignal = signal(0.09);  // Global Wet/Dry 9%
export const pianoReverbSignal = signal(0.14);  // Piano Decay (Space) 14%

// Contextual state
export const currentChordSymbolSignal = signal<string>("");

