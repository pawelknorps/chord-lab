import { useState, useEffect } from 'react';
import { Mic, Keyboard, RotateCcw } from 'lucide-react';
import { useSwingPocket } from '../hooks/useSwingPocket';
import { gamificationService } from '../services/gamificationService';
import { AchievementsList } from './AchievementsList';
import type { ExerciseInputSource } from '../../JazzKiller/core/ExerciseInputAdapter';
import type { InnovativeExerciseInitialParams } from '../types';
import { innovativePanelContainerClass, innovativeSectionLabelClass } from '../InnovativeExercisesModule';

export interface SwingPocketPanelProps {
  initialParams?: InnovativeExerciseInitialParams;
}

export function SwingPocketPanel({ initialParams }: SwingPocketPanelProps) {
  const [inputSource, setInputSource] = useState<ExerciseInputSource>('mic');
  const [score, setScore] = useState<number | null>(null);
  const {
    bpm,
    setBpm,
    swingRatio,
    setSwingRatio,
    isMetronomeRunning,
    isRecording,
    onsets,
    result,
    startMetronome,
    stopMetronome,
    startRecording,
    stopRecording,
    reset,
    feedbackText,
  } = useSwingPocket(inputSource);

  useEffect(() => {
    if (initialParams?.tempo != null && initialParams.tempo >= 40 && initialParams.tempo <= 240) {
      setBpm(initialParams.tempo);
    }
  }, [initialParams?.tempo, setBpm]);

  useEffect(() => {
    if (result) {
      const newScore = gamificationService.calculateSwingPocketScore(result);
      setScore(newScore);
    }
  }, [result]);

  return (
    <div className={`${innovativePanelContainerClass} flex flex-col gap-6`}>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Swing Pocket Validator</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          Metronome on 2 and 4; play 8th-note pattern. See swing ratio and Pocket Gauge; Push/Lay Back in ms.
        </p>
      </div>

      <div>
        <p className={innovativeSectionLabelClass}>Input</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputSource('mic')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${inputSource === 'mic' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'border-white/10 text-neutral-400 hover:border-emerald-500/30'}`}
          >
            <Mic size={14} /> Mic
          </button>
          <button
            type="button"
            onClick={() => setInputSource('midi')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${inputSource === 'midi' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'border-white/10 text-neutral-400 hover:border-blue-500/30'}`}
          >
            <Keyboard size={14} /> MIDI
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-bold text-neutral-400">
          BPM
          <input
            type="number"
            min={60}
            max={240}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value) || 120)}
            className="w-16 rounded-xl border border-white/10 bg-black/30 px-2 py-1.5 text-sm font-mono text-white"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-neutral-400">
          Swing
          <input
            type="range"
            min={0.5}
            max={0.75}
            step={0.01}
            value={swingRatio}
            onChange={(e) => setSwingRatio(Number(e.target.value))}
            className="w-24"
          />
          <span className="font-mono text-white">{swingRatio.toFixed(2)}</span>
        </label>
        {!isMetronomeRunning ? (
          <button type="button" onClick={startMetronome} className="px-4 py-2 rounded-xl border border-amber-500 bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-all">
            Start metronome
          </button>
        ) : (
          <button type="button" onClick={stopMetronome} className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-all">
            Stop metronome
          </button>
        )}
        {!isRecording ? (
          <button type="button" onClick={startRecording} disabled={!isMetronomeRunning} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            Record 4 bars
          </button>
        ) : (
          <button type="button" onClick={stopRecording} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 transition-all">
            Stop recording
          </button>
        )}
        <button type="button" onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {isRecording && (
        <p className="text-[10px] text-neutral-500">Recording… Play 8th notes. Auto-stops after 4 bars. Onsets: {onsets.length}</p>
      )}

      {result && (
        <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-2">
          <p className={innovativeSectionLabelClass}>Pocket Gauge</p>
          <p className="text-sm font-bold text-white">Swing ratio: <span className="text-amber-400 font-mono">{result.ratio.toFixed(2)}:1</span></p>
          <p className="text-sm font-bold text-white">Offset: <span className="font-mono">{result.offsetMs > 0 ? '+' : ''}{result.offsetMs.toFixed(0)} ms</span> {result.offsetMs > 0 ? '(lay back)' : result.offsetMs < 0 ? '(push)' : '(on grid)'}</p>
          {score !== null && <p className="text-sm font-bold text-white">Score: <span className="text-amber-400 font-mono">{score.toFixed(0)}</span></p>}
          {feedbackText && <p className="text-xs text-amber-400 font-medium">{feedbackText}</p>}
        </div>
      )}

      <AchievementsList />

      <p className="text-[10px] text-neutral-500">Play 8th notes in time with the metronome. Recording captures onset times and computes swing ratio and timing offset.</p>
    </div>
  );
}
