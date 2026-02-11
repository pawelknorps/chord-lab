/**
 * Focus area suggestion from AI. Phase 9 Step 37; REQ-AI-FOCUS-02.
 * Button "What should I focus on?" → getFocusAreaSuggestion → display.
 */

import { useState } from 'react';
import { Target } from 'lucide-react';
import { useEarPerformanceStore } from '../state/useEarPerformanceStore';
import { getFocusAreaSuggestion } from '../../../core/services/earFocusService';

export function FocusAreaPanel() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const getProfile = useEarPerformanceStore((s) => s.getProfile);

  const handleGetSuggestion = async () => {
    const profile = getProfile();
    if (profile.totalAttempts < 5) {
      setSuggestion('Complete at least 5 attempts to get a focus suggestion.');
      return;
    }
    setLoading(true);
    setSuggestion(null);
    try {
      const result = await getFocusAreaSuggestion(profile);
      setSuggestion(result || 'Keep practicing the intervals you missed.');
    } catch {
      setSuggestion('Keep practicing the intervals you missed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleGetSuggestion}
        disabled={loading}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold transition-colors text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] disabled:opacity-50"
        title="Get AI focus suggestion"
      >
        <Target size={12} />
        Focus
      </button>
      {loading && (
        <span className="text-[10px] text-[var(--text-muted)] animate-pulse">...</span>
      )}
      {suggestion && !loading && (
        <span className="text-[10px] text-[var(--text-secondary)] max-w-[240px] truncate italic" title={suggestion}>
          {suggestion}
        </span>
      )}
    </div>
  );
}
