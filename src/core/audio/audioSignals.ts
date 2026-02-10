import { signal } from '@preact/signals-react';

// High-frequency playback state
export const isPlayingSignal = signal(false);
export const currentMeasureIndexSignal = signal(-1);
export const currentBeatSignal = signal(-1);

// Volume controls
export const pianoVolumeSignal = signal(-10);
export const bassVolumeSignal = signal(-12);
export const drumsVolumeSignal = signal(-18);
export const reverbVolumeSignal = signal(0.3);
export const pianoReverbSignal = signal(0.25);
