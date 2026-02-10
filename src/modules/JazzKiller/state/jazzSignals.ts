import { signal } from '@preact/signals-react';

export * from '../../../core/audio/audioSignals';

// Jazz Killer specific state signals
export const isLoadedSignal = signal(false);
export const loopCountSignal = signal(0);
export const totalLoopsSignal = signal(3);
export const transposeSignal = signal(0);
