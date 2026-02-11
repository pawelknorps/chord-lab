import { signal } from '@preact/signals-react';

// High-frequency playback state
export const isPlayingSignal = signal(false);
export const currentMeasureIndexSignal = signal(-1);
export const currentBeatSignal = signal(-1);
export const bpmSignal = signal(120);

// Volume controls
export const pianoVolumeSignal = signal(-16);
export const bassVolumeSignal = signal(-8);
export const drumsVolumeSignal = signal(-3);
export const reverbVolumeSignal = signal(0.30);
export const pianoReverbSignal = signal(0.39);

// Contextual state
export const currentChordSymbolSignal = signal<string>("");

