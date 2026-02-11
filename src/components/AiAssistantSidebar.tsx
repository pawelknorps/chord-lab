import { useState, useEffect } from 'react';
import { Sparkles, Info, X, ExternalLink } from 'lucide-react';
import { checkAiAvailability } from '../core/services/aiDetection';

const SUPPORTED_BROWSERS = [
    { name: 'Google Chrome', version: '128+', note: 'Recommended' },
    { name: 'Microsoft Edge', version: '130+', note: '' },
    { name: 'Opera One', version: '2026', note: '' },
    { name: 'Brave', version: 'Experimental', note: 'May need flag' },
] as const;

const UNSUPPORTED_BROWSERS = [
    'Safari',
    'Firefox',
] as const;

type AiStatus = 'checking' | 'supported' | 'unsupported';

export function AiAssistantSidebar() {
    const [aiStatus, setAiStatus] = useState<AiStatus>('checking');
    const [showLearnMore, setShowLearnMore] = useState(false);
    const [dismissed, setDismissed] = useState(() => {
        return localStorage.getItem('ai-assistant-dismissed') === 'true';
    });

    useEffect(() => {
        checkAiAvailability().then((status) => setAiStatus(status));
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem('ai-assistant-dismissed', 'true');
    };

    if (aiStatus === 'checking' || dismissed) return null;

    return (
        <div className="mb-4">
            <div
                className={`relative p-3 rounded-xl border transition-all duration-300 group overflow-hidden ${aiStatus === 'supported'
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-100 hover:bg-emerald-950/40'
                        : 'bg-indigo-950/30 border-indigo-800/50 text-indigo-100 hover:bg-indigo-950/40'
                    }`}
            >
                {/* Animated Background Glow */}
                <div className={`absolute -right-4 -top-4 w-16 h-16 blur-2xl rounded-full opacity-20 ${aiStatus === 'supported' ? 'bg-emerald-400' : 'bg-indigo-400'
                    }`} />

                <button
                    type="button"
                    onClick={handleDismiss}
                    className="absolute top-1.5 right-1.5 z-20 p-1 rounded-md opacity-0 group-hover:opacity-40 hover:opacity-100 hover:bg-white/10 transition-all"
                    aria-label="Dismiss AI assistant notice"
                >
                    <X size={12} />
                </button>

                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${aiStatus === 'supported' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
                            }`}>
                            <Sparkles className={aiStatus === 'supported' ? 'text-emerald-400' : 'text-indigo-400'} size={14} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-70">
                            {aiStatus === 'supported' ? 'AI Active' : 'AI Available'}
                        </span>
                    </div>

                    <p className="text-[11px] leading-relaxed font-medium">
                        {aiStatus === 'supported' ? (
                            <><strong>Augmented Jazz Assistant:</strong> Local AI is ready for theory and licks.</>
                        ) : (
                            <><strong>Upgrade for AI:</strong> Use Chrome/Edge to enable the local Jazz Tutor.</>
                        )}
                    </p>

                    <button
                        onClick={() => setShowLearnMore(true)}
                        className={`mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight w-fit transition-colors ${aiStatus === 'supported' ? 'text-emerald-400 hover:text-emerald-300' : 'text-indigo-400 hover:text-indigo-300'
                            }`}
                    >
                        {aiStatus === 'supported' ? <Info size={12} /> : <ExternalLink size={12} />}
                        {aiStatus === 'supported' ? 'How it works' : 'Enable AI'}
                    </button>
                </div>
            </div>

            {showLearnMore && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowLearnMore(false)}>
                    <div
                        className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-[var(--text-primary)]">
                                <Info size={20} className="text-[var(--accent)]" />
                                Augmented Jazz Assistant
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowLearnMore(false)}
                                className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                            This application uses <strong>Gemini Nano</strong>, a local AI model built into your browser.
                            No data leaves your machine—all music theory analysis and lick generation happens 100% locally and privately.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Supported Browsers</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {SUPPORTED_BROWSERS.map((b, i) => (
                                        <div key={i} className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-[var(--text-primary)]">{b.name}</span>
                                            <span className="text-[10px] text-[var(--text-muted)]">{b.version} {b.note && `(${b.note})`}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
                                <p className="font-bold mb-1 flex items-center gap-1.5"><Sparkles size={12} /> Optimization Required</p>
                                Most browsers require manual activation of the Prompt API to use Gemini Nano.
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/40 border border-[var(--border-subtle)] text-sm">
                            <p className="font-bold mb-3 text-[var(--text-primary)]">How to enable on Chrome:</p>
                            <ol className="space-y-3 text-[var(--text-secondary)]">
                                <li className="flex gap-3">
                                    <span className="flex-none w-5 h-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold">1</span>
                                    <span>Open <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs">chrome://flags</code></span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-none w-5 h-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold">2</span>
                                    <span>Enable <strong>"Prompt API for Gemini Nano"</strong></span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-none w-5 h-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold">3</span>
                                    <span>Enable <strong>"Enables optimization guide on device"</strong> and set to <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs">Enabled BypassPrefRequirement</code></span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-none w-5 h-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold">4</span>
                                    <span>Relaunch Chrome and wait a few minutes for the model to download.</span>
                                </li>
                            </ol>
                        </div>

                        <button
                            onClick={() => setShowLearnMore(false)}
                            className="w-full mt-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl transition-all"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
