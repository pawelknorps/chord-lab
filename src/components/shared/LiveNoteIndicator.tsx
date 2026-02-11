import React from 'react';
import { Mic } from 'lucide-react';
import { useHighPerformancePitch } from '../../modules/ITM/hooks/useHighPerformancePitch';
import { useMicrophone } from '../../hooks/useMicrophone';
import * as Note from '@tonaljs/note';

/**
 * Small "Live Note" indicator (REQ-MIC-11): shows current detected note when mic is on,
 * "Listening..." when mic on but no clear note, hidden when mic off.
 */
export function LiveNoteIndicator(): React.ReactElement | null {
  const { stream, isActive } = useMicrophone();
  const { isReady, getLatestPitch } = useHighPerformancePitch(stream);
  const [activeNote, setActiveNote] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isReady || !isActive) return;

    let rafId: number;
    const loop = () => {
      const result = getLatestPitch();
      if (result && result.clarity > 0.9) {
        const note = Note.fromFreq(result.frequency);
        setActiveNote(note.replace(/\d/g, ''));
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isReady, isActive, getLatestPitch]);

  if (!isActive) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-slate-800/90 px-3 py-2 text-sm font-mono shadow-lg border border-slate-600"
      aria-live="polite"
      aria-label={activeNote ? `Live note: ${activeNote}` : 'Microphone listening'}
    >
      <Mic className="h-4 w-4 text-red-400" aria-hidden />
      <span className="text-slate-200">
        {activeNote || 'Listening…'}
      </span>
    </div>
  );
}
