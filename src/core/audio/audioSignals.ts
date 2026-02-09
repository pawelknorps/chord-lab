import { signal } from "@preact/signals-react";

// Performance-optimized Signals for high-frequency updates (Playhead/Beat)
export const currentMeasureIndexSignal = signal(-1);
export const currentBeatSignal = signal(-1);
export const loopCountSignal = signal(0);
export const isPlayingSignal = signal(false);
export const bpmSignal = signal(120);
export const totalLoopsSignal = signal(4);
export const isLoadedSignal = signal(false);
export const transposeSignal = signal(0);

// Volume signals (in decibels)
export const pianoVolumeSignal = signal(-11);
export const bassVolumeSignal = signal(-15);
export const drumsVolumeSignal = signal(-2);
export const pianoReverbSignal = signal(0.33); // 33%
export const reverbVolumeSignal = signal(0.1); // 10%
