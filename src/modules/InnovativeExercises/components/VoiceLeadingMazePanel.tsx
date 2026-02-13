import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import * as Tone from 'tone';
import { Mic, Keyboard, RotateCcw } from 'lucide-react';
import { useVoiceLeadingMaze } from '../hooks/useVoiceLeadingMaze';
import { getVoiceLeadingProgressionsFromStandards } from '../core/voiceLeadingProgressions';
import { useJazzLibrary } from '../../JazzKiller/hooks/useJazzLibrary';
import { useJazzBand } from '../../JazzKiller/hooks/useJazzBand';
import { initAudio, isAudioReady } from '../../../core/audio/globalAudio';
import type { ExerciseInputSource } from '../../JazzKiller/core/ExerciseInputAdapter';
import type { InnovativeExerciseInitialParams } from '../types';
import { innovativePanelContainerClass, innovativeSectionLabelClass } from '../InnovativeExercisesModule';

/** Minimal song for ii–V–I: one chord per measure, looped (full jazz band pipeline). */
function buildIiVISong() {
  return {
    title: 'ii-V-I',
    music: {
      measures: [
        { chords: ['Dm7'] },
        { chords: ['G7'] },
        { chords: ['Cmaj7'] },
      ],
      playbackPlan: [0, 1, 2],
    },
    TimeSignature: '4/4',
  };
}

export interface VoiceLeadingMazePanelProps {
  initialParams?: InnovativeExerciseInitialParams;
}

export function VoiceLeadingMazePanel({ initialParams }: VoiceLeadingMazePanelProps) {
  const { standards, getSongAsIRealFormat } = useJazzLibrary();
  const progressionOptions = useMemo(
    () => getVoiceLeadingProgressionsFromStandards(standards),
    [standards]
  );
  const [selectedProgressionId, setSelectedProgressionId] = useState<string>('ii-V-I');
  useEffect(() => {
    if (initialParams?.progressionId && progressionOptions.some(p => p.id === initialParams.progressionId)) {
      setSelectedProgressionId(initialParams.progressionId);
    }
  }, [initialParams?.progressionId, progressionOptions]);
  const selectedProgression = useMemo(
    () => progressionOptions.find(p => p.id === selectedProgressionId) ?? progressionOptions[0],
    [progressionOptions, selectedProgressionId]
  );
  const progressionChords = selectedProgression?.chords ?? [];

  const song = useMemo(() => {
    if (selectedProgressionId === 'ii-V-I' || !selectedProgression?.standard) {
      return buildIiVISong();
    }
    return getSongAsIRealFormat(selectedProgression.standard!, 0);
  }, [selectedProgressionId, selectedProgression, getSongAsIRealFormat]);

  const outputGateRef = useRef(true);
  const band = useJazzBand(song, true, { outputGateRef });

  const isBackingRunning = band.isPlayingSignal.value;
  const currentChordFromBand = isBackingRunning ? (band.currentChordSymbolSignal.value ?? '') : '';
  const playbackChordIndexFromBand = isBackingRunning ? (band.currentMeasureIndexSignal.value ?? 0) : null;

  const [inputSource, setInputSource] = useState<ExerciseInputSource>('mic');
  const { progression, currentChordIndex, currentChord, isMuted, hints, reset } = useVoiceLeadingMaze(inputSource, {
    playbackChordIndex: playbackChordIndexFromBand,
    progression: progressionChords,
    currentChordSymbol: currentChordFromBand || null,
  });

  outputGateRef.current = !isMuted;

  const startBacking = useCallback(async () => {
    await Tone.start();
    if (!isAudioReady()) await initAudio();
    band.togglePlayback();
  }, [band]);

  const handleReset = useCallback(() => {
    if (band.isPlayingSignal.value) band.togglePlayback();
    reset();
  }, [band, reset]);

  const handleProgressionChange = useCallback((id: string) => {
    setSelectedProgressionId(id);
    if (band.isPlayingSignal.value) band.togglePlayback();
    reset();
  }, [band, reset]);

  useEffect(() => {
    return () => {
      if (band.isPlayingSignal.value) band.togglePlayback();
    };
  }, []);

  return (
    <div className={`${innovativePanelContainerClass} flex flex-col gap-6`}>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Voice-Leading Maze</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          Play only guide tones (3rds and 7ths). Backing plays only when you play a correct note; wrong note mutes.
        </p>
      </div>

      <div>
        <p className={innovativeSectionLabelClass}>Progression (from jazz standards)</p>
        <select
          value={selectedProgressionId}
          onChange={(e) => handleProgressionChange(e.target.value)}
          className="w-full max-w-md rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-medium text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          aria-label="Select chord progression"
        >
          {progressionOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} ({opt.chords.length} chords)
            </option>
          ))}
        </select>
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${inputSource === 'midi' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'border-white/10 text-neutral-400 hover:border-emerald-500/30'}`}
          >
            <Keyboard size={14} /> MIDI
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={startBacking}
          className="px-4 py-2 rounded-xl border border-amber-500 bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-all"
        >
          {isBackingRunning ? 'Stop Backing' : 'Start Backing'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="p-3 bg-black/30 rounded-xl border border-white/5">
        <p className={innovativeSectionLabelClass}>Current chord</p>
        <p className="text-lg font-black text-white font-mono">{currentChord}</p>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          {isBackingRunning && playbackChordIndexFromBand != null
            ? (playbackChordIndexFromBand % progression.length) + 1
            : currentChordIndex + 1} / {progression.length}
        </p>
        {hints && (
          <p className="text-xs text-neutral-400 mt-1">Guide tones: 3rd = {hints.third}, 7th = {hints.seventh}</p>
        )}
      </div>

      <div className={`p-3 rounded-xl border text-sm font-bold ${isMuted ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
        {isMuted ? 'Muted — play a guide tone (3rd or 7th) to unmute.' : 'Playing — keep playing guide tones!'}
      </div>
    </div>
  );
}
