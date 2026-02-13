/**
 * Phase 30: "For You" / Recommended section (REQ-IER-08, REQ-IER-10).
 * Shows AI-generated recommendations; click launches exercise with recommended params.
 */

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { getSummary } from '../services/InnovativeExerciseProgressService';
import { generateInnovativeExerciseRecommendations } from '../ai/generateInnovativeExerciseRecommendations';
import { getParamsForLevel } from '../config/innovativeExerciseLevels';
import type { InnovativeExerciseRecommendation, InnovativeExerciseId } from '../ai/generateInnovativeExerciseRecommendations';
import type { InnovativeExerciseInitialParams } from '../types';

const EXERCISE_LABELS: Record<InnovativeExerciseId, string> = {
  'ghost-note': 'Ghost Note Match',
  'intonation-heatmap': 'Intonation Heatmap',
  'voice-leading': 'Voice-Leading Maze',
  'swing-pocket': 'Swing Pocket Validator',
  'call-response': 'Call and Response',
  'ghost-rhythm': 'Ghost Rhythm Poly-Meter',
};

export interface ForYouSectionProps {
  onSelect: (exerciseId: InnovativeExerciseId, initialParams: InnovativeExerciseInitialParams) => void;
}

export function ForYouSection({ onSelect }: ForYouSectionProps) {
  const [recommendations, setRecommendations] = useState<InnovativeExerciseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const summary = getSummary();
      const recs = await generateInnovativeExerciseRecommendations(summary);
      setRecommendations(recs);
    } catch (err) {
      console.error('For You recommendations failed:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleCardClick = (rec: InnovativeExerciseRecommendation) => {
    const level = rec.params?.level;
    const params: InnovativeExerciseInitialParams = level != null
      ? getParamsForLevel(rec.exerciseId, level) as InnovativeExerciseInitialParams
      : {
          key: rec.params?.key,
          progressionId: rec.params?.progressionId,
          chords: rec.params?.chords,
          lickId: rec.params?.lickId,
          tempo: rec.params?.tempo,
          level: rec.params?.level,
        };
    onSelect(rec.exerciseId, params);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400/80 text-xs font-bold">
        <Loader2 size={14} className="animate-spin shrink-0" />
        <span>Loading recommendations…</span>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/90">For You</span>
        </div>
        <button
          type="button"
          onClick={() => loadRecommendations(true)}
          disabled={refreshing}
          className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-amber-500/30 transition-all disabled:opacity-50"
          title="Refresh recommendations"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {recommendations.length === 0 ? (
          <p className="text-[10px] text-neutral-500 px-0.5">No recommendations right now. Pick an exercise below.</p>
        ) : (
          recommendations.map((rec) => (
            <button
              key={`${rec.exerciseId}-${rec.reason.slice(0, 20)}`}
              type="button"
              onClick={() => handleCardClick(rec)}
              className="text-left px-3 py-2 rounded-xl border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 text-xs transition-all"
            >
              <span className="font-bold text-white block">
                {EXERCISE_LABELS[rec.exerciseId]}
                {(rec.difficulty || rec.params?.level) && (
                  <span className="text-neutral-500 font-normal ml-1">
                    • {rec.difficulty ?? `Level ${rec.params?.level ?? 1}`}
                  </span>
                )}
              </span>
              <span className="text-neutral-400 block mt-0.5">{rec.reason}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
