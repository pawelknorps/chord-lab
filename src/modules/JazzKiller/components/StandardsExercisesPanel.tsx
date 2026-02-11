/**
 * Standards-Based Exercises panel (Phase 13). Inside JazzKiller: play scales,
 * guide tones, or arpeggios in time with the chart; real-time feedback; Mic or MIDI.
 */
import { useState } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { isPlayingSignal } from '../state/jazzSignals';
import { useStandardsExercise } from '../hooks/useStandardsExercise';
import type { ExerciseType } from '../core/StandardsExerciseEngine';
import type { ExerciseInputSource } from '../core/ExerciseInputAdapter';
import { Target, Mic, Keyboard, Check, X, RotateCcw } from 'lucide-react';

const EXERCISE_TYPES: { id: ExerciseType; label: string }[] = [
    { id: 'scale', label: 'Scales' },
    { id: 'guideTones', label: 'Guide Tones' },
    { id: 'arpeggio', label: 'Arpeggios' }
];

export function StandardsExercisesPanel() {
    useSignals();
    const [exerciseType, setExerciseType] = useState<ExerciseType>('scale');
    const [inputSource, setInputSource] = useState<ExerciseInputSource>('mic');
    const isPlaying = isPlayingSignal.value;

    const {
        currentChord,
        targetSet,
        lastResult,
        accuracy,
        hits,
        misses,
        isReady,
        resetSession
    } = useStandardsExercise({
        exerciseType,
        inputSource,
        active: true
    });

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

            {/* Playback hint */}
            {!isPlaying && (
                <p className="text-xs text-amber-500/90 font-medium">
                    Start playback from the main transport to run exercises in time with the chart.
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
            </div>

            {!isReady && inputSource === 'mic' && (
                <p className="text-[10px] text-neutral-500">Mic initializing… Allow microphone access when prompted.</p>
            )}
        </div>
    );
}
