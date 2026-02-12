import { useGhostNoteMatch } from '../hooks/useGhostNoteMatch';
import { SAMPLE_GHOST_LICK } from '../data/ghostNoteLicks';
import type { GhostNoteMatchStatus } from '../hooks/useGhostNoteMatch';

const statusMessages: Record<GhostNoteMatchStatus, string> = {
  idle: 'Play the lick, then fill in the missing note.',
  playing: 'Lick playing…',
  ghost_listening: 'Play the missing note now!',
  matched: 'Perfect!',
  done: 'Done. Try again?',
};

export function GhostNoteMatchPanel() {
  const { status, startLick, reset, targetNoteName, matched } = useGhostNoteMatch(SAMPLE_GHOST_LICK);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Ghost Note Match</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        One note in the lick is a &quot;ghost.&quot; Play the missing note on your instrument (within 10¢). When you hit it, the ghost becomes a pro sample.
      </p>
      {targetNoteName && (
        <p className="text-sm text-[var(--text-muted)]">
          Target note: <strong>{targetNoteName}</strong>
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={status === 'idle' || status === 'done' ? startLick : undefined}
          disabled={status !== 'idle' && status !== 'done'}
          className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--text-on-accent)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Play Lick
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)]"
        >
          Reset
        </button>
      </div>
      <p className={`text-sm font-medium ${matched ? 'text-green-600 dark:text-green-400' : 'text-[var(--text-secondary)]'}`}>
        {statusMessages[status]}
      </p>
    </div>
  );
}
