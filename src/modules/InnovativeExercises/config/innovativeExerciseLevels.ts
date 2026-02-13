/**
 * Phase 30: Level config per exercise for parameterized launch and AI recommendations.
 * getParamsForLevel(exerciseId, level) returns concrete params (key, tempo, chords, etc.).
 */

import type { InnovativeExerciseId } from '../ai/generateInnovativeExerciseRecommendations';
import type { InnovativeExerciseParams } from '../ai/generateInnovativeExerciseRecommendations';

export interface LevelConfig {
  level: number;
  key?: string;
  tempo?: number;
  chords?: string[];
  progressionId?: string;
  lickId?: string;
  degrees?: number[]; // scale degrees for intonation (e.g. [1,2,3,4,5] or [1,2,3,4,5,6,7])
  referenceBreakId?: string;
}

const LEVELS: Record<InnovativeExerciseId, LevelConfig[]> = {
  'voice-leading': [
    { level: 1, key: 'C', progressionId: 'ii-V-I', chords: ['Dm7', 'G7'], tempo: 90 },
    { level: 2, key: 'C', progressionId: 'ii-V-I', chords: ['Dm7', 'G7', 'Cmaj7'], tempo: 100 },
    { level: 3, key: 'F', progressionId: 'ii-V-I', chords: ['Gm7', 'C7', 'Fmaj7'], tempo: 120 },
  ],
  'ghost-note': [
    { level: 1, lickId: 'sample-ii-v-lick', tempo: 100 },
    { level: 2, lickId: 'sample-ii-v-lick', tempo: 120 },
    { level: 3, lickId: 'sample-ii-v-lick', tempo: 140 },
  ],
  'intonation-heatmap': [
    { level: 1, key: 'C', degrees: [1, 2, 3, 4, 5], tempo: 60 },
    { level: 2, key: 'C', degrees: [1, 2, 3, 4, 5, 6, 7], tempo: 72 },
    { level: 3, key: 'F', degrees: [1, 2, 3, 4, 5, 6, 7], tempo: 80 },
  ],
  'swing-pocket': [
    { level: 1, tempo: 80 },
    { level: 2, tempo: 120 },
    { level: 3, tempo: 160 },
  ],
  'call-response': [
    { level: 1, tempo: 90, referenceBreakId: 'default' },
    { level: 2, tempo: 110, referenceBreakId: 'default' },
    { level: 3, tempo: 130, referenceBreakId: 'default' },
  ],
  'ghost-rhythm': [
    { level: 1, tempo: 80 },
    { level: 2, tempo: 120 },
    { level: 3, tempo: 140 },
  ],
};

/**
 * Returns launch params for the given exercise and level (1–3).
 * If level is out of range, returns level 1 config.
 */
export function getParamsForLevel(
  exerciseId: InnovativeExerciseId,
  level: number
): InnovativeExerciseParams {
  const configs = LEVELS[exerciseId];
  if (!configs?.length) return {};
  const oneBased = Math.max(1, Math.min(3, Math.round(level)));
  const config = configs.find((c) => c.level === oneBased) ?? configs[0];
  const params: InnovativeExerciseParams = { level: config.level };
  if (config.key) params.key = config.key;
  if (config.tempo != null) params.tempo = config.tempo;
  if (config.chords?.length) params.chords = [...config.chords];
  if (config.progressionId) params.progressionId = config.progressionId;
  if (config.lickId) params.lickId = config.lickId;
  if (config.referenceBreakId) params.referenceBreakId = config.referenceBreakId;
  return params;
}

/** All level configs for a given exercise (for UI or validation). */
export function getLevelConfigs(exerciseId: InnovativeExerciseId): LevelConfig[] {
  return LEVELS[exerciseId] ?? [];
}
