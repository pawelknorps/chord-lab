import { useScoringStore } from '../../../core/store/useScoringStore';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { PerformanceSegment } from '../types/PerformanceSegment';

/**
 * SegmentBuilder: Aggregates real-time scoring and practice data into a PerformanceSegment.
 * This is the "Brain" aggregator for the ITM pedagogical loop (REQ-FB-04).
 */
export class SegmentBuilder {
    /**
     * Builds a PerformanceSegment from the current state.
     * @param sessionId Optional session ID override.
     */
    static build(sessionId?: string): PerformanceSegment | null {
        const scoring = useScoringStore.getState();
        const practice = usePracticeStore.getState();

        if (!practice.currentSong) {
            console.warn('[SegmentBuilder] No current song found in practiceStore');
            return null;
        }

        const standardId = practice.currentSong.title;
        const bpm = practice.bpm;
        const key = practice.currentSong.key;

        const measures = practice.currentSong.measures.map((chords, idx) => {
            const playedNotes = scoring.notesByMeasure[idx] || [];

            // Calculate accuracy score for this specific measure
            // heatMap[idx] is sum of points. measureTicks[idx] is total samples.
            // Points are 1 for match, 1.5 for perfect (3/7).
            // Max possible points per sample is 1.5.
            const ticks = scoring.measureTicks[idx] || 0;
            const points = scoring.heatmap[idx] || 0;

            let accuracyScore = 100; // Default for measures with no notes
            if (ticks > 0) {
                // Normalize: 1.0 points per tick is a "great" score. 
                // We use 1.2 as the divisor to make it hard but achievable (REQ-FB-02 calibration).
                accuracyScore = Math.min(100, Math.round((points / (ticks * 1.2)) * 100));
            } else if (practice.isPlaying) {
                // If we were playing but no notes were recorded, accuracy is 0
                accuracyScore = 0;
            }

            return {
                measureIndex: idx,
                chords,
                notes: playedNotes.map(n => ({
                    frequency: n.frequency,
                    clarity: n.clarity,
                    cents: n.cents,
                    timestamp: n.timestamp
                })),
                accuracyScore
            };
        });

        return {
            id: sessionId || scoring.currentSessionId || `session-${Date.now()}`,
            standardId,
            bpm,
            key,
            measures,
            overallScore: scoring.score,
            timestamp: Date.now()
        };
    }
}
