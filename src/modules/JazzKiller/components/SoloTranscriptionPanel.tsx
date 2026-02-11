/**
 * Solo transcription UI (Phase 15, REQ-SBE-07).
 * Record solo over a standard (mic or MIDI); show written note list when stopped.
 */
import { useState } from 'react';
import { useSoloTranscription } from '../hooks/useSoloTranscription';
import type { ExerciseInputSource } from '../core/ExerciseInputAdapter';
import { Square, Circle, Copy, Check } from 'lucide-react';

export interface SoloTranscriptionPanelProps {
    inputSource: ExerciseInputSource;
    /** When true, adapter is active (same as Exercises panel). */
    active: boolean;
    standardTitle?: string;
    keySignature?: string;
    /** Called when user stops recording with the note list string (for AI analysis). */
    onTranscriptionReady?: (noteList: string) => void;
}

export function SoloTranscriptionPanel({ inputSource, active, standardTitle, keySignature, onTranscriptionReady }: SoloTranscriptionPanelProps) {
    const {
        isRecording,
        startRecording,
        stopRecording,
        getNoteListString,
        getTranscription,
        isReady
    } = useSoloTranscription({ inputSource, active });

    const [noteList, setNoteList] = useState('');
    const [copied, setCopied] = useState(false);

    const handleStop = () => {
        stopRecording();
        const text = getNoteListString();
        setNoteList(text);
        onTranscriptionReady?.(text);
    };

    const handleCopy = async () => {
        const text = noteList || getNoteListString();
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    const events = getTranscription();
    const displayList = noteList || (events.length > 0 ? getNoteListString() : '');

    return (
        <div className="flex flex-col gap-3 p-3 bg-black/30 rounded-xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Record solo</p>
            <p className="text-[10px] text-neutral-500">
                Capture your solo (mic or MIDI) and see a written note list. Same input as exercises.
            </p>
            {standardTitle && (
                <p className="text-[10px] text-neutral-400">
                    {standardTitle}{keySignature ? ` in ${keySignature}` : ''}
                </p>
            )}
            <div className="flex items-center gap-2">
                {!isRecording ? (
                    <button
                        type="button"
                        onClick={startRecording}
                        disabled={!active || !isReady}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-500/50 bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Circle size={14} fill="currentColor" /> Record solo
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleStop}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-all"
                    >
                        <Square size={14} /> Stop
                    </button>
                )}
            </div>
            {!isReady && inputSource === 'mic' && (
                <p className="text-[10px] text-neutral-500">Mic initializing…</p>
            )}
            {displayList && (
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Transcription</p>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 hover:text-white transition-colors"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <pre className="p-2 bg-black/40 rounded-lg text-xs font-mono text-neutral-300 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                        {displayList}
                    </pre>
                </div>
            )}
        </div>
    );
}
