/**
 * Rhythm Scat Generator: ask Nano for a 3-word vocalization/scat phrase
 * for a given subdivision. REQ-RHY-01, REQ-RHY-03; Phase 7 Step 23.
 */

import { askNano, isNanoAvailableSync } from './nanoHelpers';

const RHYTHM_SCAT_SYSTEM_PROMPT =
  'You are a rhythm coach. Reply only with a short scat phrase (e.g. Doo-dah, doo-dah). No explanation.';

/** Fallback when Nano is unavailable: index into a small set of phrases. */
const FALLBACK_PHRASES = [
  'Ta-Ka',
  'Ta-Ki-Ta',
  'Doo-dah, doo-dah',
  'Ta-Ka-Di-Mi',
  'One-and-two-and',
];

/**
 * Get a scat phrase for the given rhythm subdivision. Uses Nano when available;
 * otherwise returns a fallback phrase.
 */
export async function getScatForSubdivision(subdivisionName: string): Promise<string> {
  if (!isNanoAvailableSync()) {
    const idx = Math.abs(subdivisionName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACK_PHRASES.length;
    return FALLBACK_PHRASES[idx];
  }
  const context = { subdivision: subdivisionName };
  const question =
    'Given this rhythm subdivision, give a 3-word vocalization or scat phrase that a student can say to internalize the groove (e.g. Doo-dah, doo-dah for swing). Reply with only the phrase, no explanation.';
  const phrase = await askNano(context, question, RHYTHM_SCAT_SYSTEM_PROMPT);
  if (!phrase || phrase.length < 2) {
    const idx = Math.abs(subdivisionName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACK_PHRASES.length;
    return FALLBACK_PHRASES[idx];
  }
  return phrase.trim();
}
