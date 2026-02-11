/**
 * Overlay for a single measure on the Lead Sheet showing Standards Exercise accuracy (Phase 15, REQ-SBE-06).
 * Uses hits/(hits+misses) per measure; green >80%, amber 50–80%, red <50%.
 */
interface StandardsExerciseHeatmapOverlayProps {
    measureIndex: number;
    statsByMeasure: Record<number, { hits: number; misses: number }>;
}

export function StandardsExerciseHeatmapOverlay({ measureIndex, statsByMeasure }: StandardsExerciseHeatmapOverlayProps) {
    const stats = statsByMeasure[measureIndex];
    if (!stats || (stats.hits === 0 && stats.misses === 0)) return null;

    const total = stats.hits + stats.misses;
    const accuracy = total > 0 ? stats.hits / total : 0;

    let colorClass = 'bg-transparent';
    if (accuracy > 0.8) {
        colorClass = 'bg-emerald-500/20';
    } else if (accuracy > 0.5) {
        colorClass = 'bg-amber-500/20';
    } else {
        colorClass = 'bg-red-500/20';
    }

    return (
        <div
            className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-500 ${colorClass}`}
            title={`Accuracy: ${Math.round(accuracy * 100)}%`}
        />
    );
}
