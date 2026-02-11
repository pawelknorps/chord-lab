/**
 * AI focus-area suggestion for ear training. Phase 9 Step 37; REQ-AI-FOCUS-01.
 * Pass aggregate profile to Nano; returns 1–2 sentence suggestion.
 */

import { askNano, isNanoAvailableSync } from './nanoHelpers';
import type { EarPerformanceProfile } from '../../modules/FunctionalEarTraining/state/useEarPerformanceStore';

const FOCUS_SYSTEM_PROMPT =
  'You are a jazz ear coach. Give one sentence only. Do not list interval names that would give answers.';

export async function getFocusAreaSuggestion(profile: EarPerformanceProfile): Promise<string> {
  if (!isNanoAvailableSync()) {
    return 'Keep practicing the intervals you missed.';
  }
  const question =
    "Based on this student's ear training profile, suggest 1-2 focus areas in one sentence. " +
    "Describe the area of focus (e.g. 'tension vs release', 'clarity of fourths') without naming specific intervals.";
  const response = await askNano(profile, question, FOCUS_SYSTEM_PROMPT);
  return response?.trim() || 'Keep practicing the intervals you missed.';
}
