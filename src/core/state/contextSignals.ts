import { signal } from '@preact/signals-react';

// Global key context for enharmonic naming
export const globalKeySignal = signal<string>('C');
export const globalScaleSignal = signal<'major' | 'minor'>('major');

// Active module tracking
export const activeModuleSignal = signal<string>('chord-lab');
