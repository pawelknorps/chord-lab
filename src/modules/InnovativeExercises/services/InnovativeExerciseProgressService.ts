/**
 * Phase 30 / Innovative Exercises Revamp (REQ-IER-01, REQ-IER-02).
 * Aggregates student progress from app stores into a JSON-serializable summary for AI.
 * READ-ONLY: This service never writes to session history, profile, mastery, or heatmap stores.
 */

import { useSessionHistoryStore } from '../../../core/store/useSessionHistoryStore';
import { useScoringStore } from '../../../core/store/useScoringStore';
import { useMasteryStore } from '../../../core/store/useMasteryStore';
import { useMasteryTreeStore } from '../../../core/store/useMasteryTreeStore';
import { useProfileStore } from '../../../core/profiles/useProfileStore';
import { useStandardsExerciseHeatmapStore } from '../../JazzKiller/state/useStandardsExerciseHeatmapStore';
import type { PerformanceSegment } from '../../ITM/types/PerformanceSegment';

const LAST_N_SESSIONS = 10;

/** JSON-serializable slice of session history for AI context. */
export interface SessionSummaryItem {
  standardId: string;
  bpm: number;
  key: string;
  overallScore: number;
  weakMeasures: number[];
  timestamp: number;
}

/** Song progress entry (serializable; Maps converted to arrays/objects). */
export interface SongProgressSummaryItem {
  songTitle: string;
  maxBpm: number;
  attempts: number;
  mastered: boolean;
  hotspotScores: Record<number, number>;
}

/** Mastery tree node status for summary. */
export interface MasteryNodeSummaryItem {
  id: string;
  label: string;
  category: string;
  unlockStatus: string;
  xp: number;
  requiredPoints: number;
}

export interface InnovativeExerciseProgressSummary {
  /** Last N performance segments (ITM sessions). */
  recentSessions: SessionSummaryItem[];
  /** Current scoring session heatmap (measureIndex -> score sum); empty if not active. */
  currentHeatmap: Record<number, number>;
  /** Current scoring session measure ticks; empty if not active. */
  currentMeasureTicks: Record<number, number>;
  /** Overall score and grade from current or last scoring run. */
  currentScore: number;
  currentGrade: string;
  /** Mastery store: per-module points/level and global XP. */
  mastery: {
    modules: Record<string, { points: number; level: number; streak: number }>;
    globalLevel: number;
    globalExperience: number;
  };
  /** Mastery tree: nodes and XP per node. */
  masteryTree: {
    nodes: MasteryNodeSummaryItem[];
    xpByNode: Record<string, number>;
  };
  /** Profile song progress (current profile only). */
  songProgress: SongProgressSummaryItem[];
  /** Standards exercise heatmap when available (per-measure hits/misses). */
  standardsHeatmap: {
    statsByMeasure: Record<number, { hits: number; misses: number }>;
    exerciseType: string | null;
  };
}

function weakMeasuresFromSegment(segment: PerformanceSegment): number[] {
  const out: number[] = [];
  segment.measures.forEach((m, i) => {
    if (m.accuracyScore < 70) out.push(i);
  });
  return out;
}

function sessionToSummaryItem(segment: PerformanceSegment): SessionSummaryItem {
  return {
    standardId: segment.standardId,
    bpm: segment.bpm,
    key: segment.key,
    overallScore: segment.overallScore,
    weakMeasures: weakMeasuresFromSegment(segment),
    timestamp: segment.timestamp,
  };
}

/**
 * Builds a progress summary from all app stores. READ-ONLY: does not mutate any store.
 * Use for AI recommendation input (REQ-IER-01). REQ-IER-02: no writes from this path.
 */
export function getSummary(): InnovativeExerciseProgressSummary {
  const sessionState = useSessionHistoryStore.getState();
  const scoringState = useScoringStore.getState();
  const masteryState = useMasteryStore.getState();
  const treeState = useMasteryTreeStore.getState();
  const profileState = useProfileStore.getState();
  const heatmapState = useStandardsExerciseHeatmapStore.getState();

  const recentSessions = sessionState.sessions
    .slice(0, LAST_N_SESSIONS)
    .map(sessionToSummaryItem);

  const songProgress: SongProgressSummaryItem[] = [];
  const profile = profileState.currentProfile;
  if (profile?.songProgress) {
    profile.songProgress.forEach((progress, songTitle) => {
      songProgress.push({
        songTitle,
        maxBpm: progress.maxBpm,
        attempts: progress.attempts,
        mastered: progress.mastered,
        hotspotScores: Object.fromEntries(progress.hotspotScores),
      });
    });
  }

  const nodesList: MasteryNodeSummaryItem[] = Object.values(treeState.nodes).map(
    (n) => ({
      id: n.id,
      label: n.label,
      category: n.category,
      unlockStatus: n.unlockStatus,
      xp: treeState.xpByNode[n.id] ?? 0,
      requiredPoints: n.requiredPoints,
    })
  );

  return {
    recentSessions,
    currentHeatmap: { ...scoringState.heatmap },
    currentMeasureTicks: { ...scoringState.measureTicks },
    currentScore: scoringState.score,
    currentGrade: scoringState.grade,
    mastery: {
      modules: { ...masteryState.modules },
      globalLevel: masteryState.globalLevel,
      globalExperience: masteryState.globalExperience,
    },
    masteryTree: {
      nodes: nodesList,
      xpByNode: { ...treeState.xpByNode },
    },
    songProgress,
    standardsHeatmap: {
      statsByMeasure: { ...heatmapState.statsByMeasure },
      exerciseType: heatmapState.exerciseType,
    },
  };
}

/** Alias for getSummary for API consistency (e.g. InnovativeExerciseProgressService.getSummary). */
export const InnovativeExerciseProgressService = {
  getSummary,
};
