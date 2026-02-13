import { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { localAgent } from '../core/services/LocalAgentService';
import { buildProgressionBundle, buildChordLabPrompt, stripCommandTokens } from '../core/services/progressionContext';
import { validateSuggestedNotes } from '../core/services/noteValidator';
import * as Scale from 'tonal-scale';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface WorkbenchAiPanelProps {
  open: boolean;
  onClose: () => void;
  /** Chord symbols from current progression (e.g. ["C", "Dm", "G7", "C"]) */
  progressionChords: string[];
  /** Musical key (e.g. "C", "F") — named keySignature to avoid React's reserved `key` prop */
  keySignature: string;
  scale?: string;
}

export function WorkbenchAiPanel({
  open,
  onClose,
  progressionChords,
  keySignature: keySig,
  scale = 'Major',
}: WorkbenchAiPanelProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text || isChatThinking) return;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsChatThinking(true);
    try {
      const chords = progressionChords?.filter(Boolean) ?? [];
      const key = keySig ?? 'C';
      const bundle = buildProgressionBundle(chords, key, scale);
      const prompt = buildChordLabPrompt(bundle, text, chatMessages);
      const raw = await localAgent.ask(prompt);
      const cleaned = stripCommandTokens(raw);
      const scaleNotes = Scale.notes(key, 'major');
      const validated = validateSuggestedNotes(cleaned, { key, scaleNotes });
      setChatMessages((prev) => [...prev, { role: 'assistant', content: validated }]);
    } catch (e: unknown) {
      const errMsg =
        e instanceof Error ? e.message : 'Agent unavailable. Try again or add chords for context.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setIsChatThinking(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-[var(--bg-panel)]/98 backdrop-blur-xl border-l border-[var(--border-subtle)] z-[100] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[var(--text-primary)]">AI Assistant</h3>
            <p className="text-xs text-[var(--text-muted)]">Ask about your progression</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Ask about this progression, request continuations or substitutes, or get explanations.
        </p>
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 custom-scrollbar mb-4">
          {chatMessages.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic">No messages yet. Type a question below.</p>
          )}
          {chatMessages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 text-sm ${
                m.role === 'user'
                  ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--text-primary)] ml-6'
                  : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] mr-2'
              }`}
            >
              {m.content}
            </div>
          ))}
          {isChatThinking && (
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
              <div className="animate-spin h-4 w-4 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full" />
              Thinking...
            </div>
          )}
        </div>
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="e.g. What could follow? Scale over G7?"
            className="flex-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            disabled={isChatThinking}
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isChatThinking}
            className="p-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
