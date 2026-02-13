/**
 * Phase 30 / Innovative Exercises Revamp (REQ-IER-03, REQ-IER-04).
 * AI-driven recommendations for Innovative Exercises from progress summary.
 * Uses Gemini Nano (jazzTeacherLogic pattern); fallback when no/sparse progress.
 */

import { createGeminiSession, isGeminiNanoAvailable } from '../../JazzKiller/ai/jazzTeacherLogic';
import type { InnovativeExerciseProgressSummary } from '../services/InnovativeExerciseProgressService';

export type InnovativeExerciseId =
  | 'ghost-note'
  | 'intonation-heatmap'
  | 'voice-leading'
  | 'swing-pocket'
  | 'call-response'
  | 'ghost-rhythm';

export type InnovativeExerciseLayer = 'ear' | 'rhythm';
export type InnovativeExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface InnovativeExerciseParams {
  key?: string;
  chords?: string[];
  progressionId?: string;
  lickId?: string;
  tempo?: number;
  level?: number;
  referenceBreakId?: string;
}

export interface InnovativeExerciseRecommendation {
  exerciseId: InnovativeExerciseId;
  params: InnovativeExerciseParams;
  layer: InnovativeExerciseLayer;
  difficulty?: InnovativeExerciseDifficulty;
  reason: string;
}

const VALID_EXERCISE_IDS: InnovativeExerciseId[] = [
  'ghost-note',
  'intonation-heatmap',
  'voice-leading',
  'swing-pocket',
  'call-response',
  'ghost-rhythm',
];

const SYSTEM_PROMPT = `You are a jazz practice coach. Given a student's progress summary (session history, mastery, song progress, heatmaps), you recommend 1–3 Innovative Exercises that target their weak spots or reinforce strengths.

You MUST respond with a valid JSON array only, no other text. Each item:
- exerciseId: one of ghost-note, intonation-heatmap, voice-leading, swing-pocket, call-response, ghost-rhythm
- params: object with optional key, chords (array of chord symbols), progressionId, lickId, tempo (BPM), level (1–3)
- layer: "ear" or "rhythm"
- difficulty: optional "beginner" | "intermediate" | "advanced"
- reason: one short sentence for the UI (e.g. "Focus on guide tones in your weak ii–V bars")

Ear exercises: ghost-note, intonation-heatmap, voice-leading. Rhythm: swing-pocket, call-response, ghost-rhythm.
Level 1 = easier (e.g. 2 chords, slow BPM), 2 = medium, 3 = harder.`;

function isSummarySparse(summary: InnovativeExerciseProgressSummary): boolean {
  const hasSessions = summary.recentSessions.length > 0;
  const hasSongProgress = summary.songProgress.length > 0;
  const hasMastery = summary.mastery.globalExperience > 0 || Object.values(summary.mastery.modules).some(m => m.points > 0);
  const hasHeatmap = Object.keys(summary.standardsHeatmap.statsByMeasure).length > 0;
  return !hasSessions && !hasSongProgress && !hasMastery && !hasHeatmap;
}

/** Default recommendations when progress is empty or AI unavailable (REQ-IER-04). */
function getDefaultRecommendations(): InnovativeExerciseRecommendation[] {
  return [
    {
      exerciseId: 'voice-leading',
      params: { key: 'C', chords: ['Dm7', 'G7', 'Cmaj7'], progressionId: 'ii-V-I', level: 1 },
      layer: 'ear',
      difficulty: 'beginner',
      reason: 'Start with guide tones on a simple ii–V–I in C.',
    },
    {
      exerciseId: 'swing-pocket',
      params: { tempo: 100, level: 1 },
      layer: 'rhythm',
      difficulty: 'beginner',
      reason: 'Build your swing feel at a comfortable tempo.',
    },
  ];
}

function parseAndValidateRecommendations(raw: string): InnovativeExerciseRecommendation[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return getDefaultRecommendations();
    const out: InnovativeExerciseRecommendation[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const exerciseId = (item as { exerciseId?: string }).exerciseId;
      if (!exerciseId || !VALID_EXERCISE_IDS.includes(exerciseId as InnovativeExerciseId)) continue;
      const params = (item as { params?: InnovativeExerciseParams }).params;
      const layer = (item as { layer?: string }).layer;
      const reason = (item as { reason?: string }).reason;
      out.push({
        exerciseId: exerciseId as InnovativeExerciseId,
        params: params && typeof params === 'object' ? params : {},
        layer: layer === 'rhythm' ? 'rhythm' : 'ear',
        difficulty: (item as { difficulty?: InnovativeExerciseDifficulty }).difficulty,
        reason: typeof reason === 'string' && reason.length > 0 ? reason.slice(0, 200) : 'Recommended for you.',
      });
      if (out.length >= 3) break;
    }
    return out.length > 0 ? out : getDefaultRecommendations();
  } catch {
    return getDefaultRecommendations();
  }
}

/**
 * Generate AI recommendations for Innovative Exercises from progress summary (REQ-IER-03).
 * When summary is empty or sparse, or when AI is unavailable, returns default recommendations (REQ-IER-04).
 */
export async function generateInnovativeExerciseRecommendations(
  progressSummary: InnovativeExerciseProgressSummary
): Promise<InnovativeExerciseRecommendation[]> {
  if (isSummarySparse(progressSummary)) {
    return getDefaultRecommendations();
  }

  if (!isGeminiNanoAvailable()) {
    return getDefaultRecommendations();
  }

  try {
    const session = await createGeminiSession(SYSTEM_PROMPT, { temperature: 0.3, topK: 5 });
    if (!session) return getDefaultRecommendations();

    const summaryJson = JSON.stringify(
      {
        recentSessions: progressSummary.recentSessions.slice(0, 5),
        currentScore: progressSummary.currentScore,
        currentGrade: progressSummary.currentGrade,
        mastery: progressSummary.mastery,
        songProgress: progressSummary.songProgress.slice(0, 10),
        standardsHeatmap: progressSummary.standardsHeatmap.statsByMeasure
          ? Object.keys(progressSummary.standardsHeatmap.statsByMeasure).length
          : 0,
        masteryTreeNodes: progressSummary.masteryTree.nodes
          .filter((n) => n.unlockStatus !== 'locked')
          .map((n) => n.label),
      },
      null,
      0
    );

    const prompt = `Progress summary:\n${summaryJson}\n\nRespond with a JSON array of 1–3 recommendations (exerciseId, params, layer, reason). Only valid JSON, no markdown.`;

    const response = await session.prompt(prompt);
    session.destroy();

    const start = response.indexOf('[');
    const end = response.lastIndexOf(']');
    const trimmed = start >= 0 && end > start ? response.slice(start, end + 1) : response;
    return parseAndValidateRecommendations(trimmed);
  } catch (err) {
    console.error('Innovative Exercise recommendations failed:', err);
    return getDefaultRecommendations();
  }
}
