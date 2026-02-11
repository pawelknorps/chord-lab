/**
 * Ear performance store: tracks success/failure per level and item (interval/quality)
 * for adaptive curriculum and AI focus-area suggestions.
 * Phase 9 Steps 33-34; REQ-ADAPT-EAR-02.
 */

import { create } from 'zustand';
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
  resetSession: () => void;
}

export const useEarPerformanceStore = create<EarPerformanceState>((set, get) => ({
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
}));
