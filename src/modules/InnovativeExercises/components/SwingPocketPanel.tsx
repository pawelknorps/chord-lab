
export function SwingPocketPanel() {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Swing Pocket Validator</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Metronome on 2 and 4; play 8th-note pattern. See swing ratio (2:1 vs 3:1) and Pocket Gauge; Push/Lay Back reports ms offset.
      </p>
      <p className="text-sm text-[var(--text-muted)]">Coming in Wave 2.</p>
    </div>
  );
}
