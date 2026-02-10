/**
 * Ear Trainer hint generator: pass diagnosis to Nano; returns 1-sentence hint
 * on the "vibe" or "character" of the correct interval. Never gives the answer.
 * REQ-EAR-02; Phase 7 Step 21.
 */

import { askNano } from './nanoHelpers';
import type { EarDiagnosis } from '../../modules/FunctionalEarTraining/utils/earDiagnosis';

const EAR_HINT_SYSTEM_PROMPT =
  "You are a jazz ear-training coach. Never give the answer. Provide a 1-sentence hint focused on the 'vibe' or 'character' of the correct interval compared to their guess.";

const FALLBACK_HINT = 'Listen for the tension and release.';

/**
 * Get a hint from Nano based on the diagnosis. Never reveals the correct interval name.
 */
export async function getEarHint(diagnosis: EarDiagnosis): Promise<string> {
  const question =
    'Give a hint that describes the flavor of the correct interval compared to their guess. Do not name the interval. One sentence only.';
  const hint = await askNano(diagnosis, question, EAR_HINT_SYSTEM_PROMPT);
  if (!hint || hint.length < 3) return FALLBACK_HINT;
  return hint;
}
