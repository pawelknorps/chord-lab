/**
 * Ear Trainer diagnostic: compute "Aural Distance" when the student
 * misidentifies an interval. Used to build context for AI hint (getEarHint).
 * REQ-EAR-01; Phase 7 Step 20.
 */

/** Interval names used in IntervalsLevel → semitones (same as INTERVALS there). */
const NAME_TO_SEMITONES: Record<string, number> = {
  m2: 1,
  M2: 2,
  m3: 3,
  M3: 4,
  P4: 5,
  '#4/b5': 6,
  P5: 7,
  m6: 8,
  M6: 9,
  m7: 10,
  M7: 11,
  P8: 12,
};

const TRITONE_SEMITONES = 6;
const P4_SEMITONES = 5;
const P5_SEMITONES = 7;

export interface EarDiagnosis {
  correct: string;
  guess: string;
  errorType: 'overshot' | 'undershot';
  distance: number;
  isCommonConfusion: boolean;
}

function semitonesFor(name: string): number {
  const s = NAME_TO_SEMITONES[name];
  if (s !== undefined) return s;
  return NAME_TO_SEMITONES[name.replace(/\s/g, '')] ?? 0;
}

/**
 * Diagnoses why a student might have missed an interval.
 * Returns a "Ground Truth" object for the AI Teacher (getEarHint).
 */
export function diagnoseEarError(correctInterval: string, userGuess: string): EarDiagnosis {
  const correctSemitones = semitonesFor(correctInterval);
  const guessSemitones = semitonesFor(userGuess);
  const distance = Math.abs(correctSemitones - guessSemitones);
  const errorType: 'overshot' | 'undershot' =
    guessSemitones > correctSemitones ? 'overshot' : 'undershot';

  const isCommonConfusion =
    (correctSemitones === P4_SEMITONES && guessSemitones === TRITONE_SEMITONES) ||
    (correctSemitones === P5_SEMITONES && guessSemitones === TRITONE_SEMITONES) ||
    (correctSemitones === TRITONE_SEMITONES && guessSemitones === P4_SEMITONES) ||
    (correctSemitones === TRITONE_SEMITONES && guessSemitones === P5_SEMITONES);

  return {
    correct: correctInterval,
    guess: userGuess,
    errorType,
    distance,
    isCommonConfusion,
  };
}
