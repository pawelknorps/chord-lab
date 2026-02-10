import { useState, useEffect } from 'react';
import { Target, Sparkles, MessageCircle, Send, Hash, RotateCcw, X } from 'lucide-react';
import { sampleLessons, LessonData } from '../data/lessonDatabase';
import { useSignals } from '@preact/signals-react/runtime';
import { selectedMeasureRangeSignal } from '../state/jazzSignals';
import { validateSuggestedNotes } from '../../../core/services/noteValidator';
import * as Scale from 'tonal-scale';

interface SmartLessonPaneProps {
    songId: string;
    onSetBpm?: (bpm: number) => void;
    onSetTranspose?: (transpose: number) => void;
    onToggleAnalysis?: () => void;
    onToggleGuideTones?: () => void;
    songTitle?: string;
    songKey?: string;
    progressionChords?: string[];
    measures?: Array<{ chords: string[] }>;
}

export function SmartLessonPane({
    songId,
    onSetBpm,
    onSetTranspose,
    onToggleAnalysis,
    onToggleGuideTones,
    songTitle,
    songKey,
    progressionChords,
    measures
}: SmartLessonPaneProps) {
    useSignals();
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(false);
    const [agentResponse, setAgentResponse] = useState<string | null>(null);
    const [isAgentThinking, setIsAgentThinking] = useState(false);
    const [userMessage, setUserMessage] = useState('');

    useEffect(() => {
        if (!songId) return;
        setLoading(true);

        if (sampleLessons[songId]) {
            setLesson(sampleLessons[songId]);
            setLoading(false);
            return;
        }

        import(`../../../public/lessons/${songId}.json`)
            .then(m => setLesson(m.default))
            .catch(() => setLesson(null))
            .finally(() => setLoading(false));
    }, [songId]);

    const handleAskAgent = async (customTask?: string) => {
        setIsAgentThinking(true);
        setAgentResponse(null);
        try {
            const { generateJazzLesson } = await import('../ai/jazzTeacherLogic');
            const key = songKey ?? 'C';
            const song = {
                title: songTitle ?? songId,
                key,
                music: {
                    measures: measures || (progressionChords ? progressionChords.map(c => ({ chords: [c] })) : []),
                },
            };

            const range = selectedMeasureRangeSignal.value;
            const rangeText = range ? ` (Focusing on bars ${range[0] + 1} to ${range[1] + 1})` : '';

            let task = customTask || `Analyze the harmonic gravity of this tune${rangeText}.`;
            if (range) {
                task += ` Specifically explain the transitions between measures ${range[0] + 1} and ${range[1] + 1}.`;
            }

            let result = await generateJazzLesson(song, 'improvisation', task);

            // Parse and execute UI Commands: [[COMMAND:ACTION]] or [[COMMAND:ACTION:PARAM]]
            // Use /gi for case-insensitivity and allow optional spaces
            const commandRegex = /\[\[\s*(DRILL|SET|UI)\s*:\s*([^\]\s:]+)\s*(?::\s*([^\]\s]+)\s*)?\]\]/gi;

            const processedResult = result.replace(commandRegex, (fullMatch, typeRaw, actionRaw, paramRaw) => {
                const type = typeRaw.toUpperCase();
                const action = actionRaw.toUpperCase();
                const param = paramRaw ? paramRaw.trim() : undefined;

                if (type === 'UI') {
                    if (action === 'ANALYSIS') onToggleAnalysis?.();
                    if (action === 'GUIDE_TONES') onToggleGuideTones?.();
                } else if (type === 'SET') {
                    if (action === 'BPM' && param) {
                        const val = parseInt(param, 10);
                        if (!isNaN(val)) onSetBpm?.(val);
                    }
                    if (action === 'TRANSPOSE' && param) {
                        const val = parseInt(param, 10);
                        if (!isNaN(val)) onSetTranspose?.(val);
                    }
                } else if (type === 'DRILL') {
                    if (action === 'SPOTLIGHT') {
                        if (!selectedMeasureRangeSignal.value) {
                            selectedMeasureRangeSignal.value = [0, 3];
                        }
                    }
                }
                return ''; // Successfully stripped the command
            }).trim();

            const key = songKey ?? 'C';
            const scaleNotes = Scale.notes(key, 'major');
            const validated = validateSuggestedNotes(processedResult, { key, scaleNotes });
            setAgentResponse(validated);
        } catch (e: any) {
            setAgentResponse(e?.message ? `Agent Error: ${e.message}` : 'Could not get lesson.');
        } finally {
            setIsAgentThinking(false);
        }
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!userMessage.trim()) return;
        handleAskAgent(userMessage);
        setUserMessage('');
    };

    if (loading) return <div className="text-white/40 text-[10px] font-bold p-4 animate-pulse uppercase tracking-widest">Loading harmonic roadmap...</div>;

    const range = selectedMeasureRangeSignal.value;

    return (
        <div className="flex flex-col gap-4">
            {lesson && (
                <div className="bg-white/5 rounded-2xl p-4 md:p-5 space-y-4 border border-white/10 shadow-xl overflow-hidden relative group">
                    <div className="absolute -right-8 -top-8 bg-purple-500/10 blur-3xl w-32 h-32 rounded-full group-hover:bg-purple-500/20 transition-all duration-500"></div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-black text-purple-400 tracking-widest leading-none">
                            <Sparkles size={14} className="animate-pulse" />
                            Pre-computed Roadmap
                        </div>
                    </div>

                    <div className="space-y-4">
                        {lesson.hotspots.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-wider leading-none">
                                    <Target size={12} />
                                    Critical Hotspots
                                </div>
                                <div className="grid gap-2">
                                    {lesson.hotspots.map((h, i) => (
                                        <div key={i} className="text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="font-black text-purple-300">m.{h.measures.join('-')}</div>
                                                <div className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 rounded text-purple-200 uppercase font-bold">{h.type}</div>
                                            </div>
                                            <div className="text-[11px] text-white/60 leading-relaxed">{h.analysis}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Golden Lick & Practice Points Truncated for Space */}
                    </div>
                </div>
            )}

            {/* AI Agent Section - Reactive Chat */}
            <div className="p-4 bg-black/40 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 leading-none">
                        <MessageCircle size={14} />
                        Local Mentor (Gemini Nano)
                    </div>
                    {range && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                            <Hash size={10} className="text-cyan-400" />
                            <span className="text-[9px] font-black text-cyan-200">Bars {range[0] + 1}-{range[1] + 1}</span>
                            <button onClick={() => selectedMeasureRangeSignal.value = null} className="ml-1 hover:text-white text-cyan-400">
                                <X size={10} />
                            </button>
                        </div>
                    )}
                </div>

                {agentResponse && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="text-xs text-white/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10 font-medium relative group">
                            {agentResponse}
                            <button
                                onClick={() => setAgentResponse(null)}
                                className="absolute top-2 right-2 p-1 bg-white/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <RotateCcw size={12} className="text-white/40" />
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="relative mt-1">
                    <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder={range ? "Ask about this section..." : "Ask the mentor anything..."}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-500/50 pr-12 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isAgentThinking || !userMessage.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-20 flex items-center justify-center"
                    >
                        {isAgentThinking ? (
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <Send size={14} />
                        )}
                    </button>
                </form>

                {!agentResponse && !isAgentThinking && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleAskAgent("Identify the hardest bar and why.")}
                            className="text-[9px] font-bold text-white/40 hover:text-cyan-300 transition-colors uppercase tracking-tighter"
                        >
                            # Hardest Part?
                        </button>
                        <button
                            onClick={() => handleAskAgent("Suggest a scale for the ii-V transition.")}
                            className="text-[9px] font-bold text-white/40 hover:text-cyan-300 transition-colors uppercase tracking-tighter"
                        >
                            # Scale Help
                        </button>
                    </div>
                )}
            </div>

            <div className="text-center text-[8px] text-white/10 font-bold uppercase tracking-[0.2em]">
                Theory-Augmented Prompting v1.0
            </div>
        </div>
    );
}
