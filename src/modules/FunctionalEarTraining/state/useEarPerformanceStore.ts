/**
 * Ear performance store: tracks success/failure per level and item (interval/quality)
 * for adaptive curriculum and AI focus-area suggestions.
 * Phase 9 Steps 33-34; REQ-ADAPT-EAR-02.
 * Auto-promotion: after enough attempts + accuracy, suggest moving difficulty up.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EarDiagnosis } from '../utils/earDiagnosis';

export interface ItemStats {
  success: number;
  fail: number;
  lastDiagnoses: EarDiagnosis[];
}

export interface EarPerformanceProfile {
  weakIntervals: string[];
  commonConfusions: Array<[string, string]>;
  overshootCount: number;
  undershootCount: number;
  totalAttempts: number;
}

export interface LevelStats {
  attempts: number;
  success: number;
  fail: number;
  accuracy: number;
}

/** Minimum attempts before considering promotion. */
export const PROMOTION_MIN_ATTEMPTS_NOVICE = 12;
export const PROMOTION_MIN_ATTEMPTS_ADVANCED = 20;
/** Accuracy threshold (0–1) to promote. */
export const PROMOTION_ACCURACY_THRESHOLD = 0.85;

export type DifficultyTier = 'Novice' | 'Advanced' | 'Pro';

interface EarPerformanceState {
  byLevel: Record<string, Record<string, ItemStats>>;
  sessionStart: number;
  consecutiveMistakes: number;
  consecutiveCorrect: number;
  lastChallengeType: string | null;

  recordAttempt: (
    level: string,
    itemKey: string,
    correct: boolean,
    diagnosis?: EarDiagnosis | null
  ) => void;
  getProfile: () => EarPerformanceProfile;
  getStatsForLevel: (level: string) => LevelStats;
  shouldPromoteDifficulty: (level: string, current: DifficultyTier | string) => DifficultyTier | null;
  resetSession: () => void;
}

export const useEarPerformanceStore = create<EarPerformanceState>()(
  persist(
    (set, get) => ({
  byLevel: {},
  sessionStart: Date.now(),
  consecutiveMistakes: 0,
  consecutiveCorrect: 0,
  lastChallengeType: null,

  recordAttempt(level, itemKey, correct, diagnosis) {
    set((state) => {
      const byLevel = { ...state.byLevel };
      if (!byLevel[level]) byLevel[level] = {};
      const item = { ...(byLevel[level][itemKey] || { success: 0, fail: 0, lastDiagnoses: [] }) };

      if (correct) {
        item.success += 1;
      } else {
        item.fail += 1;
        if (diagnosis) {
          item.lastDiagnoses = [...item.lastDiagnoses, diagnosis].slice(-5);
        }
      }

      byLevel[level] = { ...byLevel[level], [itemKey]: item };

      return {
        byLevel,
        consecutiveMistakes: correct ? 0 : state.consecutiveMistakes + 1,
        consecutiveCorrect: correct ? state.consecutiveCorrect + 1 : 0,
        lastChallengeType: itemKey,
      };
    });
  },

  getStatsForLevel(level: string): LevelStats {
    const state = get();
    const byLevel = state.byLevel[level];
    if (!byLevel) return { attempts: 0, success: 0, fail: 0, accuracy: 0 };
    let success = 0;
    let fail = 0;
    for (const item of Object.values(byLevel)) {
      success += item.success;
      fail += item.fail;
    }
    const attempts = success + fail;
    return {
      attempts,
      success,
      fail,
      accuracy: attempts > 0 ? success / attempts : 0,
    };
  },

  shouldPromoteDifficulty(level: string, current: DifficultyTier | string): DifficultyTier | null {
    const stats = get().getStatsForLevel(level);
    const tier: DifficultyTier = (current === 'Intermediate' ? 'Advanced' : current === 'Virtuoso' ? 'Pro' : current) as DifficultyTier;
    if (tier === 'Novice') {
      if (stats.attempts >= PROMOTION_MIN_ATTEMPTS_NOVICE && stats.accuracy >= PROMOTION_ACCURACY_THRESHOLD) {
        return 'Advanced';
      }
    } else if (tier === 'Advanced') {
      if (stats.attempts >= PROMOTION_MIN_ATTEMPTS_ADVANCED && stats.accuracy >= PROMOTION_ACCURACY_THRESHOLD) {
        return 'Pro';
      }
    }
    return null;
  },

  getProfile(): EarPerformanceProfile {
    const state = get();
    const weakIntervals: string[] = [];
    const commonConfusions: Array<[string, string]> = [];
    let overshootCount = 0;
    let undershootCount = 0;
    let totalAttempts = 0;

    for (const level of Object.keys(state.byLevel)) {
      for (const itemKey of Object.keys(state.byLevel[level])) {
        const item = state.byLevel[level][itemKey];
        totalAttempts += item.success + item.fail;
        const failRate = item.fail / (item.success + item.fail || 1);
        if (failRate >= 0.5 && item.fail >= 2) {
          weakIntervals.push(itemKey);
        }
        for (const d of item.lastDiagnoses) {
          if (d.errorType === 'overshot') overshootCount += 1;
          else undershootCount += 1;
          if (d.isCommonConfusion) {
            const pair: [string, string] = [d.correct, d.guess].sort() as [string, string];
            if (!commonConfusions.some(([a, b]) => a === pair[0] && b === pair[1])) {
              commonConfusions.push(pair);
            }
          }
        }
      }
    }

    return {
      weakIntervals: [...new Set(weakIntervals)],
      commonConfusions,
      overshootCount,
      undershootCount,
      totalAttempts,
    };
  },

  resetSession() {
    set({
      byLevel: {},
      sessionStart: Date.now(),
      consecutiveMistakes: 0,
      consecutiveCorrect: 0,
      lastChallengeType: null,
    });
  },
}),
    {
      name: 'ear-performance',
      partialize: (s) => ({ byLevel: s.byLevel }),
    }
  )
);
