
export function GhostRhythmPanel() {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Ghost Rhythm Poly-Meter</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        4/4 backing; play 3-over-4 on one note (e.g. G). Win = pitch within 5¢ + correct 3-against-4 rhythm.
      </p>
      <p className="text-sm text-[var(--text-muted)]">Coming in Wave 2.</p>
    </div>
  );
}
