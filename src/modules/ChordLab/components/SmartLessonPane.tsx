import { useState, useEffect } from 'react';
import { X, BookOpen, AlertTriangle, Zap, MessageCircle, Mic, Play, Send } from 'lucide-react';
import { localAgent } from '../../../core/services/LocalAgentService';
import { buildProgressionBundle, buildChordLabPrompt, stripCommandTokens } from '../../../core/services/progressionContext';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface LessonData {
    meta: {
        title: string;
        source: string;
        promptUsed?: number;
    };
    harmonicAnalysis: Array<{ barRange: string; analysis: string; function: string }>;
    commonTraps?: string[];
    proTips?: string[];
    goldenLick?: {
        notation: string;
        description: string;
    };
}


interface SmartLessonPaneProps {
    songTitle: string;
    onClose: () => void;
    onSpotlightDrill?: () => void;
    onBlindfoldChallenge?: () => void;
    onSetBpm?: (bpm: number) => void;
    onSetKey?: (key: string) => void;
    /** Optional: progression chord symbols (e.g. ["Cmaj7", "Dm7", "G7"]) and key for AI teacher context */
    progressionChords?: string[];
    key?: string;
    /** Scale name for progression context (e.g. "Major", "Dorian") */
    scale?: string;
}

export function SmartLessonPane({
    songTitle,
    onClose,
    onSpotlightDrill,
    onBlindfoldChallenge,
    onSetBpm,
    onSetKey,
    progressionChords,
    key: songKey,
    scale = 'Major'
}: SmartLessonPaneProps) {

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agentResponse, setAgentResponse] = useState<string | null>(null);
    const [isAgentThinking, setIsAgentThinking] = useState(false);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatThinking, setIsChatThinking] = useState(false);

    useEffect(() => {
        if (!songTitle) return;

        const fetchLesson = async () => {
            setLoading(true);
            setError(null);
            setLesson(null); // Reset
            try {
                const safeTitle = songTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                const res = await fetch(`/lessons/${safeTitle}.json`);
                if (!res.ok) {
                    throw new Error("Lesson not found in the AOT Vault.");
                }
                const data = await res.json();
                setLesson(data);
            } catch (err: any) {
                console.warn(`[SmartLessonPane] ${err.message}`);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [songTitle]);

    // Local Agent Logic — use shared Teacher Logic (jazz pedagogy) when available
    const handleAskAgent = async () => {
        setIsAgentThinking(true);
        setAgentResponse(null);
        try {
            const { generateJazzLesson } = await import('../../JazzKiller/ai/jazzTeacherLogic');
            const key = songKey ?? 'C';
            const chords = progressionChords?.filter(Boolean) ?? [];
            const song = {
                title: songTitle,
                key,
                music: {
                    measures: chords.length > 0 ? [{ chords }] : [],
                },
            };
            let result = await generateJazzLesson(song, 'improvisation');

            // Parse for UI Commands: [[COMMAND:PARAM]]
            const commandRegex = /\[\[(DRILL|SET):([^\]]+):?([^\]]*)\]\]/g;
            let match;
            while ((match = commandRegex.exec(result)) !== null) {
                const [fullMatch, type, action, param] = match;

                if (type === 'DRILL') {
                    if (action === 'SPOTLIGHT') onSpotlightDrill?.();
                    if (action === 'BLINDFOLD') onBlindfoldChallenge?.();
                } else if (type === 'SET') {
                    if (action === 'BPM' && param) onSetBpm?.(parseInt(param, 10));
                    if (action === 'KEY' && param) onSetKey?.(param);
                }

                // Remove the command from the displayed text
                result = result.replace(fullMatch, '').trim();
            }

            setAgentResponse(result);
        } catch (e: any) {
            setAgentResponse(e?.message ? `Agent Error: ${e.message}` : 'Could not get lesson. Try again.');
        } finally {
            setIsAgentThinking(false);
        }
    };

    const handleSendChat = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = chatInput.trim();
        if (!text || isChatThinking) return;
        setChatInput('');
        setChatMessages((prev) => [...prev, { role: 'user', content: text }]);
        setIsChatThinking(true);
        try {
            const chords = progressionChords?.filter(Boolean) ?? [];
            const key = songKey ?? 'C';
            const bundle = buildProgressionBundle(chords, key, scale);
            const prompt = buildChordLabPrompt(bundle, text, chatMessages);
            const raw = await localAgent.ask(prompt);
            const cleaned = stripCommandTokens(raw);
            setChatMessages((prev) => [...prev, { role: 'assistant', content: cleaned }]);
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : 'Agent unavailable. Try again or add chords for context.';
            setChatMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errMsg}` }]);
        } finally {
            setIsChatThinking(false);
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-full lg:max-w-md bg-[#0f0f1a]/95 backdrop-blur-xl border-l border-white/10 z-[100] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white leading-none">Smart Lesson</h3>
                        <p className="text-xs text-cyan-400/80 mt-1 font-medium">{songTitle}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8">

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/30 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        <p className="text-sm">Fetching Lesson from Vault...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-200">
                        <AlertTriangle className="shrink-0" size={20} />
                        <div className="text-sm">
                            <p className="font-bold mb-1">Analysis Not Available</p>
                            <p className="opacity-80">We haven't pre-generated a lesson for this track yet. (Try '9.20 Special' or '26-2')</p>
                        </div>
                    </div>
                )}

                {!loading && !error && lesson && (
                    <>
                        {/* Harmonic Roadmap */}
                        <section>
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={12} /> Harmonic Roadmap
                            </h4>
                            <div className="space-y-3">
                                {lesson.harmonicAnalysis?.map((item, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-cyan-500/30 py-1">
                                        <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                        <div className="text-xs font-mono text-cyan-400 mb-0.5">{item.barRange || `Part ${i + 1}`}</div>
                                        <p className="text-sm text-white/80 leading-relaxed font-light">{item.analysis}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Common Traps */}
                        {lesson.commonTraps && (
                            <section>
                                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <AlertTriangle size={12} className="text-amber-500" /> Common Traps
                                </h4>
                                <ul className="grid gap-2">
                                    {lesson.commonTraps.map((trap, i) => (
                                        <li key={i} className="bg-amber-500/10 border border-amber-500/10 rounded-lg p-3 text-sm text-amber-100/80 flex gap-3 items-start">
                                            <span className="text-amber-500 font-bold text-xs mt-0.5">{i + 1}.</span>
                                            {trap}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Golden Lick */}
                        {lesson.goldenLick && (
                            <section className="bg-gradient-to-br from-purple-500/20 to-blue-500/10 p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 bg-purple-500/20 blur-2xl w-24 h-24 rounded-full"></div>
                                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                                    <div className="p-1 bg-purple-500 rounded text-white"><Zap size={10} fill="currentColor" /></div>
                                    The Golden Lick
                                </h4>
                                <p className="text-sm text-white/70 mb-4 relative z-10 font-light italic">
                                    "{lesson.goldenLick.description}"
                                </p>
                                <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-purple-200 border border-white/5 relative z-10">
                                    {lesson.goldenLick.notation}
                                </div>
                                <button className="mt-4 w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Play size={12} /> Hear Example (Coming Soon)
                                </button>
                            </section>
                        )}
                        {/* Interactive Drills */}
                        <section className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={12} /> Interactive Drills
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={onSpotlightDrill}
                                    className="p-3 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/20 rounded-lg text-cyan-200 text-xs font-bold transition-colors text-center"
                                >
                                    Spotlight Drill
                                    <span className="block text-[10px] opacity-60 font-normal mt-1">Loop Turnaround</span>
                                </button>
                                <button
                                    onClick={onBlindfoldChallenge}
                                    className="p-3 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/20 rounded-lg text-purple-200 text-xs font-bold transition-colors text-center"
                                >
                                    Blindfold Mode
                                    <span className="block text-[10px] opacity-60 font-normal mt-1">Hide Visuals</span>
                                </button>
                            </div>
                        </section>
                    </>
                )}

                {/* Progression Chat */}
                <section className="bg-white/5 rounded-xl p-4 border border-white/10 mt-6">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MessageCircle size={12} /> Progression Assistant
                    </h4>
                    <p className="text-[10px] text-white/30 mb-3">
                        Ask about this progression, request continuations or substitutes, or get explanations.
                    </p>
                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                        {chatMessages.length === 0 && (
                            <p className="text-xs text-white/40 italic">No messages yet. Type a question below.</p>
                        )}
                        {chatMessages.map((m, i) => (
                            <div
                                key={i}
                                className={`rounded-lg p-3 text-xs ${
                                    m.role === 'user'
                                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100 ml-4'
                                        : 'bg-white/5 border border-white/10 text-white/80 mr-4'
                                }`}
                            >
                                {m.content}
                            </div>
                        ))}
                        {isChatThinking && (
                            <div className="flex items-center gap-2 text-white/50 text-xs">
                                <div className="animate-spin h-3 w-3 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full" />
                                Thinking...
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="e.g. What could follow? Scale over G7?"
                            className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                            disabled={isChatThinking}
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim() || isChatThinking}
                            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Send"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </section>

            </div>

            {/* AI Agent Footer */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                {agentResponse ? (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                                <MessageCircle size={12} /> AI AGENT
                            </div>
                            <button onClick={() => setAgentResponse(null)} className="text-white/30 hover:text-white"><X size={12} /></button>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed dark-markdown">
                            {agentResponse}
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleAskAgent}
                        disabled={isAgentThinking}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isAgentThinking ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                Agent Thinking...
                            </>
                        ) : (
                            <>
                                <Mic size={16} className="group-hover:scale-110 transition-transform" />
                                Ask Local Agent (Bridge Strategy)
                            </>
                        )}
                    </button>
                )}
                <div className="text-center mt-3 text-[10px] text-white/20">
                    Powered by {typeof window !== 'undefined' && (window as Window & { ai?: unknown }).ai ? 'Gemini Nano (Local)' : 'Incredible Teaching Machine'}
                </div>
            </div>
        </div>
    );
}
