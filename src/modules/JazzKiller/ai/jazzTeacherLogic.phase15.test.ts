/**
 * Phase 15: Tests for generateStandardsExerciseAnalysis (REQ-SBE-08).
 * When Gemini Nano is unavailable, the function returns ''; otherwise it returns a string.
 */
import { describe, it, expect } from 'vitest';
import { generateStandardsExerciseAnalysis } from './jazzTeacherLogic';

describe('generateStandardsExerciseAnalysis', () => {
  it('accepts session data and returns a string (or empty when Nano unavailable)', async () => {
    const sessionData = {
      standardTitle: 'All The Things You Are',
      key: 'Ab',
      exerciseType: 'guideTones' as const,
      accuracy: 72,
      heatmap: {
        0: { hits: 3, misses: 1 },
        1: { hits: 2, misses: 2 },
        4: { hits: 4, misses: 0 }
      },
      transcription: undefined
    };
    const result = await generateStandardsExerciseAnalysis(sessionData);
    expect(typeof result).toBe('string');
    // When Nano is unavailable (e.g. in CI), result is ''
    if (result.length > 0) {
      expect(result.length).toBeGreaterThan(10);
    }
  });

  it('accepts session data with optional transcription', async () => {
    const sessionData = {
      standardTitle: 'Autumn Leaves',
      key: 'G',
      exerciseType: 'scale' as const,
      accuracy: 85,
      heatmap: { 0: { hits: 5, misses: 0 } },
      transcription: 'E4, F#4, G4, A4, B4'
    };
    const result = await generateStandardsExerciseAnalysis(sessionData);
    expect(typeof result).toBe('string');
  });
});
