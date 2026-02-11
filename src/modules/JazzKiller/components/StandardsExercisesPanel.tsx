/**
 * Standards-Based Exercises panel (Phase 13). Inside JazzKiller: play scales,
 * guide tones, or arpeggios in time with the chart; real-time feedback; Mic or MIDI.
 * Latency offset (ms) aligns detected pitch with the chord the user was actually playing.
 * Phase 15: syncs statsByMeasure to heatmap store for Lead Sheet error heatmap.
 */
import { useState, useEffect } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { isPlayingSignal } from '../state/jazzSignals';
import { useStandardsExercise } from '../hooks/useStandardsExercise';
import { useStandardsExerciseHeatmapStore } from '../state/useStandardsExerciseHeatmapStore';
import type { ExerciseType } from '../core/StandardsExerciseEngine';
import type { ExerciseInputSource } from '../core/ExerciseInputAdapter';
import * as Tone from 'tone';
import { Target, Mic, Keyboard, Check, X, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { SoloTranscriptionPanel } from './SoloTranscriptionPanel';
import { generateStandardsExerciseAnalysis, isGeminiNanoAvailable } from '../ai/jazzTeacherLogic';

const DEFAULT_LATENCY_MS = 80;
const MIN_LATENCY_MS = 0;
const MAX_LATENCY_MS = 300;

export interface StandardsExercisesPanelProps {
    /** Chord at transport time t (for latency-adjusted scoring). When provided, scoring uses chord at (now - latencyMs). */
    getChordAtTransportTime?: (t: number) => string;
    /** Standard title for AI analysis (Phase 15). */
    standardTitle?: string;
    /** Key for AI analysis (e.g. "C", "Bb"). */
    keySignature?: string;
}

const EXERCISE_TYPES: { id: ExerciseType; label: string }[] = [
    { id: 'scale', label: 'Scales' },
    { id: 'guideTones', label: 'Guide Tones' },
    { id: 'arpeggio', label: 'Arpeggios' }
];

export function StandardsExercisesPanel({ getChordAtTransportTime, standardTitle, keySignature }: StandardsExercisesPanelProps = {}) {
    useSignals();
    const [exerciseType, setExerciseType] = useState<ExerciseType>('scale');
    const [inputSource, setInputSource] = useState<ExerciseInputSource>('mic');
    const [latencyMs, setLatencyMs] = useState(DEFAULT_LATENCY_MS);
    const isPlaying = isPlayingSignal.value;

    const playCalibrationTone = () => {
        try {
            const syn = new Tone.Synth().toDestination();
            syn.triggerAttackRelease('C4', '8n');
        } catch {
            // ignore
        }
    };

    const setHeatmap = useStandardsExerciseHeatmapStore((s) => s.setHeatmap);
    const {
        currentChord,
        targetSet,
        lastResult,
        accuracy,
        hits,
        misses,
        accuracyLast4,
        hitsLast4,
        missesLast4,
        statsByMeasure,
        exerciseType: currentExerciseType,
        isReady,
        resetSession,
        runCalibration
    } = useStandardsExercise({
        exerciseType,
        inputSource,
        active: true,
        getChordAtTransportTime,
        latencyMs,
        onRequestCalibrationTone: playCalibrationTone
    });

    // Phase 15: sync exercise heatmap to store so Lead Sheet can show error heatmap
    useEffect(() => {
        setHeatmap(statsByMeasure, currentExerciseType);
    }, [statsByMeasure, currentExerciseType, setHeatmap]);

    const [lastTranscription, setLastTranscription] = useState('');
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const handleAnalyzePerformance = async () => {
        if (!isGeminiNanoAvailable()) {
            setAnalysisResult('AI analysis requires Gemini Nano (Chrome or Edge with AI enabled).');
            return;
        }
        setAnalysisLoading(true);
        setAnalysisResult(null);
        try {
            const result = await generateStandardsExerciseAnalysis({
                standardTitle: standardTitle ?? 'Standard',
                key: keySignature ?? 'C',
                exerciseType: currentExerciseType,
                accuracy,
                heatmap: statsByMeasure,
                transcription: lastTranscription || undefined
            });
            setAnalysisResult(result || 'No feedback generated.');
        } catch (e) {
            setAnalysisResult('Analysis failed. Try again.');
        } finally {
            setAnalysisLoading(false);
        }
    };

    const [calibrating, setCalibrating] = useState(false);
    const handleCalibrate = async () => {
        setCalibrating(true);
        try {
            const measured = await runCalibration();
            setLatencyMs(Math.min(MAX_LATENCY_MS, Math.max(MIN_LATENCY_MS, measured)));
        } finally {
            setCalibrating(false);
        }
    };

    return (
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
                    <Target size={20} className="text-amber-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Standards Exercises</h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Scales • Guide Tones • Arpeggios</p>
                </div>
            </div>

            {/* Exercise type */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Exercise</p>
                <div className="flex flex-wrap gap-2">
                    {EXERCISE_TYPES.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setExerciseType(id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${exerciseType === id ? 'bg-amber-500 text-black border-amber-500' : 'border-white/10 text-neutral-400 hover:border-amber-500/30 hover:text-amber-400'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input: Mic | MIDI */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Input</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setInputSource('mic')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${inputSource === 'mic' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'border-white/10 text-neutral-400 hover:border-emerald-500/30'}`}
                    >
                        <Mic size={14} /> Mic
                    </button>
                    <button
                        onClick={() => setInputSource('midi')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${inputSource === 'midi' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'border-white/10 text-neutral-400 hover:border-blue-500/30'}`}
                    >
                        <Keyboard size={14} /> MIDI
                    </button>
                </div>
            </div>

            {/* Latency offset: aligns detected pitch with chord user was playing */}
            {getChordAtTransportTime && (
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Latency (ms)</p>
                        <span className="text-xs font-mono text-neutral-400 tabular-nums">{latencyMs} ms</span>
                    </div>
                    <input
                        type="range"
                        min={MIN_LATENCY_MS}
                        max={MAX_LATENCY_MS}
                        value={latencyMs}
                        onChange={(e) => setLatencyMs(Number(e.target.value))}
                        className="w-full h-2 rounded-full bg-white/10 accent-amber-500"
                    />
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                        Increase if correct notes score as miss (feedback lags behind).
                    </p>
                    <button
                        type="button"
                        onClick={handleCalibrate}
                        disabled={calibrating || !isPlaying}
                        className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Zap size={12} />
                        {calibrating ? 'Measuring…' : 'Calibrate (playback on)'}
                    </button>
                </div>
            )}

            {/* Playback hint + count-in note */}
            {!isPlaying && (
                <p className="text-xs text-amber-500/90 font-medium">
                    Start playback from the main transport to run exercises in time with the chart.
                </p>
            )}
            {isPlaying && (
                <p className="text-[10px] text-neutral-500">
                    First 4 beats are count-in (not scored). Use them to prepare.
                </p>
            )}

            {/* Current chord + target */}
            <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Current chord</p>
                    <p className="text-lg font-black text-white font-mono">{currentChord || '—'}</p>
                </div>
                {targetSet && (
                    <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Target</p>
                        <p className="text-sm font-bold text-amber-400">{targetSet.label}</p>
                    </div>
                )}
            </div>

            {/* Real-time feedback */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Feedback</p>
                    <button
                        onClick={resetSession}
                        className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-white transition-colors"
                        title="Reset session stats"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    {lastResult !== null && (
                        <span className={`flex items-center gap-1.5 text-sm font-bold ${lastResult.hit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {lastResult.hit ? <Check size={16} /> : <X size={16} />}
                            {lastResult.hit ? 'Correct' : 'Miss'}
                        </span>
                    )}
                    <span className="text-2xl font-black text-white tabular-nums">{accuracy}%</span>
                    <span className="text-xs text-neutral-500 font-medium">
                        {hits} hit{hits !== 1 ? 's' : ''} / {misses} miss{misses !== 1 ? 'es' : ''}
                    </span>
                </div>
                {/* Overall vs last 4 bars */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                    <div className="p-2 bg-black/20 rounded-lg">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Overall</p>
                        <p className="text-lg font-black text-white tabular-nums">{accuracy}%</p>
                        <p className="text-[10px] text-neutral-500">{hits} hits / {misses} misses</p>
                    </div>
                    <div className="p-2 bg-black/20 rounded-lg">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Last 4 bars</p>
                        <p className="text-lg font-black text-white tabular-nums">
                            {accuracyLast4 !== null ? `${accuracyLast4}%` : '—'}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                            {hitsLast4 + missesLast4 > 0 ? `${hitsLast4} hits / ${missesLast4} misses` : 'No notes yet'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Phase 15: Record solo → written transcription */}
            <SoloTranscriptionPanel
                inputSource={inputSource}
                active={true}
                onTranscriptionReady={setLastTranscription}
            />

            {/* Phase 15: AI analysis of performance */}
            <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">AI analysis</p>
                <button
                    type="button"
                    onClick={handleAnalyzePerformance}
                    disabled={analysisLoading || (hits === 0 && misses === 0)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/50 bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Sparkles size={14} />
                    {analysisLoading ? 'Analyzing…' : 'Analyze performance'}
                </button>
                {analysisResult && (
                    <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-sm text-neutral-200 whitespace-pre-wrap">
                        {analysisResult}
                    </div>
                )}
            </div>

            {!isReady && inputSource === 'mic' && (
                <p className="text-[10px] text-neutral-500">Mic initializing… Allow microphone access when prompted.</p>
            )}
        </div>
    );
}
