import { useState, useEffect } from 'react';
import { Sparkles, Info, X } from 'lucide-react';

const SUPPORTED_BROWSERS = [
  { name: 'Google Chrome', version: '128+', note: 'Recommended' },
  { name: 'Microsoft Edge', version: '130+', note: '' },
  { name: 'Opera One', version: '2026', note: '' },
  { name: 'Brave', version: 'Experimental', note: 'May need #prompt-api-for-gemini-nano flag' },
] as const;

const UNSUPPORTED_BROWSERS = [
  'Safari',
  'Firefox',
] as const;

type AiStatus = 'checking' | 'supported' | 'unsupported';

export function AiAssistantBanner() {
  const [aiStatus, setAiStatus] = useState<AiStatus>('checking');
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkAi = async () => {
      const w = window as Window & { LanguageModel?: { availability?(opts?: object): Promise<string> }; ai?: { languageModel?: { capabilities(): Promise<{ available?: string }> } } };
      // Chrome Prompt API (global LanguageModel)
      if (w.LanguageModel?.availability) {
        try {
          const avail = await w.LanguageModel.availability({
            expectedInputs: [{ type: 'text', languages: ['en'] }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }],
          } as object);
          setAiStatus(avail === 'unavailable' ? 'unsupported' : 'supported');
          return;
        } catch (e) {
          console.warn('LanguageModel.availability check failed', e);
        }
      }
      // Legacy window.ai.languageModel
      if (w.ai?.languageModel) {
        try {
          const capabilities = await w.ai.languageModel.capabilities();
          setAiStatus(capabilities.available === 'no' ? 'unsupported' : 'supported');
          return;
        } catch (e) {
          console.warn('AI capabilities check failed', e);
        }
      }
      setAiStatus('unsupported');
    };

    checkAi();
  }, []);

  if (aiStatus === 'checking' || dismissed) return null;

  return (
    <>
      <div
        className={`flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium border-b shrink-0 ${
          aiStatus === 'supported'
            ? 'bg-emerald-950/80 border-emerald-800/50 text-emerald-100'
            : 'bg-blue-950/80 border-blue-800/50 text-blue-100'
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-1 justify-between items-center gap-4 min-w-0">
          {aiStatus === 'supported' ? (
            <p className="flex items-center gap-2 truncate">
              <Sparkles className="shrink-0 text-emerald-400" size={18} />
              <span>
                <strong>Augmented Jazz Assistant active:</strong> Local AI is ready for theory and licks.
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-2 truncate">
              <Sparkles className="shrink-0 text-blue-300" size={18} />
              <span>
                <strong>Upgrade for AI-powered lessons:</strong> Use{' '}
                <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> to enable the free local Jazz Tutor (Gemini Nano).
              </span>
            </p>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowLearnMore(true)}
              className="underline text-xs opacity-80 hover:opacity-100 whitespace-nowrap"
            >
              Learn more
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {showLearnMore && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowLearnMore(false)}>
          <div
            className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Info size={20} className="text-[var(--accent)]" />
                Browser support for Augmented Jazz Assistant
              </h3>
              <button
                type="button"
                onClick={() => setShowLearnMore(false)}
                className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              The assistant uses the built-in Prompt API (Gemini Nano). Only Chromium-based browsers support it.
            </p>
            <div className="space-y-3 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Supported</p>
              <ul className="space-y-1.5">
                {SUPPORTED_BROWSERS.map((b, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span><strong>{b.name}</strong> {b.version}</span>
                    {b.note && <span className="text-[var(--text-muted)]">{b.note}</span>}
                  </li>
                ))}
              </ul>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-3">Not supported</p>
              <p className="text-sm">{UNSUPPORTED_BROWSERS.join(', ')} — use Chrome or Edge for AI features.</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm">
              <p className="font-bold mb-2">Chrome: enable Gemini Nano</p>
              <ol className="list-decimal list-inside space-y-1 text-[var(--text-secondary)]">
                <li>Open <code className="bg-black/30 px-1 rounded">chrome://flags</code></li>
                <li>Search for &quot;Prompt API for Gemini Nano&quot; → set to <strong>Enabled</strong></li>
                <li>Search for &quot;Enables optimization guide on device&quot; → set to <strong>Enabled BypassPrefRequirement</strong></li>
                <li>Relaunch Chrome</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
