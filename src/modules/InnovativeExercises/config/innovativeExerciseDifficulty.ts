export interface DifficultyParams {
  tempo?: number;
  key?: string;
  progressionId?: string;
  // Add other parameters as needed
}

export interface DifficultyRamp {
  // Define how parameters change with difficulty
  tempo?: [number, number]; // min, max
}

export const EXERCISE_DIFFICULTY_CONFIG: Record<string, DifficultyRamp> = {
  'voice-leading-maze': {
    tempo: [60, 120],
  },
  'swing-pocket': {
    tempo: [80, 160],
  },
  // Define other exercises
};

export const getParamsForDifficulty = (
  exerciseId: string,
  difficulty: number // 1-100
): DifficultyParams => {
  const config = EXERCISE_DIFFICULTY_CONFIG[exerciseId];
  if (!config) {
    return {};
  }

  const params: DifficultyParams = {};
  const difficultyRatio = (difficulty - 1) / 99;

  if (config.tempo) {
    params.tempo = Math.round(
      config.tempo[0] + (config.tempo[1] - config.tempo[0]) * difficultyRatio
    );
  }

  return params;
};
