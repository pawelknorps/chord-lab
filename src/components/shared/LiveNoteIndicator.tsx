import React from 'react';
import { Mic } from 'lucide-react';
import { useAuralMirror } from '../../hooks/useAuralMirror';

/**
 * Small "Live Note" indicator (REQ-MIC-11): shows current detected note when mic is on,
 * "Listening..." when mic on but no clear note, hidden when mic off.
 */
export function LiveNoteIndicator(): React.ReactElement | null {
  const { isActive, liveNote } = useAuralMirror();

  if (!isActive) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-slate-800/90 px-3 py-2 text-sm font-mono shadow-lg border border-slate-600"
      aria-live="polite"
      aria-label={liveNote ? `Live note: ${liveNote}` : 'Microphone listening'}
    >
      <Mic className="h-4 w-4 text-red-400" aria-hidden />
      <span className="text-slate-200">
        {liveNote ? liveNote.replace(/\d/g, '') : 'Listening…'}
      </span>
    </div>
  );
}
