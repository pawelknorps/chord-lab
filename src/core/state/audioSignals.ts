import { signal } from '@preact/signals-react';

// High-frequency playback state (use Signals)
export const playbackTimeSignal = signal(0);
export const activeNotesSignal = signal<number[]>([]);
export const isPlayingSignal = signal(false);

// Audio visualization state
export const visualizationDataSignal = signal<{ notes: number[]; timestamp: number } | null>(null);
