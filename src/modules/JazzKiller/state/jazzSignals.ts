import { signal } from '@preact/signals-react';

export * from '../../../core/audio/audioSignals';

// Jazz Killer specific state signals
export const isPremiumEngineSignal = signal(true);
export const activityLevelSignal = signal(0.37); // 0.0 to 1.0 (Low to High activity)
export const isLoadedSignal = signal(false);
export const loopCountSignal = signal(0);
export const totalLoopsSignal = signal(4);
export const transposeSignal = signal(0);

// AI Teacher Signals
export const proactiveAdviceSignal = signal<string | null>(null);
export const isAiThinkingSignal = signal(false);
export const aiTeacherModeSignal = signal<'proactive' | 'reactive'>('reactive');
export const lastPivotIndexSignal = signal(-1);
export const selectedMeasureRangeSignal = signal<[number, number] | null>(null);
