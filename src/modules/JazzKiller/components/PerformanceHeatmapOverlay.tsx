import { useScoringStore } from '../../../core/store/useScoringStore';

interface PerformanceHeatmapOverlayProps {
    measureIndex: number;
}

/**
 * Overlay for a single measure on the Lead Sheet that visualizes performance accuracy (REQ-FB-02).
 */
export function PerformanceHeatmapOverlay({ measureIndex }: PerformanceHeatmapOverlayProps) {
    const heatmap = useScoringStore(state => state.heatmap);
    const measureTicks = useScoringStore(state => state.measureTicks);

    const points = heatmap[measureIndex] || 0;
    const ticks = measureTicks[measureIndex] || 0;

    if (ticks === 0) return null;

    // Calculate accuracy percentage for this measure (0 to 1)
    // Max points per tick is 1.5 (if every note is a target note)
    const average = points / ticks;
    const accuracy = Math.min(1, average / 1.2); // Cap at 1.2 to be generous

    let colorClass = "bg-transparent";
    if (accuracy > 0.8) {
        colorClass = "bg-emerald-500/20";
    } else if (accuracy > 0.5) {
        colorClass = "bg-amber-500/20";
    } else {
        colorClass = "bg-red-500/20";
    }

    return (
        <div
            className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-500 ${colorClass}`}
            title={`Accuracy: ${Math.round(accuracy * 100)}%`}
        />
    );
}
