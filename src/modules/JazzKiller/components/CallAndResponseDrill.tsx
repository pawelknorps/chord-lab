import React, { useState, useEffect, useRef } from 'react';
import * as Note from '@tonaljs/note';
import * as Tone from 'tone';
import { Mic, Play, Check, X } from 'lucide-react';
import { useHighPerformancePitch } from '../../ITM/hooks/useHighPerformancePitch';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { askNano } from '../../../core/services/nanoHelpers';

/** Default 4-note motif (C4 E4 G4 C5) for Call and Response (REQ-MIC-13). */
const DEFAULT_MOTIF_MIDI = [60, 64, 67, 72];
const LISTEN_SECONDS = 6;
const PITCH_TOLERANCE_SEMITONES = 0;

type Phase = 'idle' | 'playing' | 'listening' | 'match' | 'miss';

export function CallAndResponseDrill(): React.ReactElement {
  const [phase, setPhase] = useState<Phase>('idle');
  const [nanoTip, setNanoTip] = useState<string | null>(null);
  const { start, isActive, stream } = useMicrophone();
  const { isReady, getLatestPitch } = useHighPerformancePitch(stream);
  const bufferRef = useRef<number[]>([]);
  const expectedRef = useRef<number[]>(DEFAULT_MOTIF_MIDI);
  const listenEndRef = useRef<ReturnType<typeof setTimeout>>(0);

  // Track live midi in a separate effect for 120Hz reactivity
  useEffect(() => {
    if (phase !== 'listening' || !isReady) return;

    let rafId: number;
    const loop = () => {
      const result = getLatestPitch();
      if (result && result.clarity > 0.9) {
        const midiNum = Note.midi(Note.fromFreq(result.frequency));
        if (midiNum !== null) {
          const last = bufferRef.current[bufferRef.current.length - 1];
          if (last !== midiNum) bufferRef.current.push(midiNum);
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [phase, isReady, getLatestPitch]);

  const playMotif = async () => {
    setNanoTip(null);
    setPhase('playing');
    expectedRef.current = [...DEFAULT_MOTIF_MIDI];
    bufferRef.current = [];

    if (Tone.context.state !== 'running') await Tone.start();
    const GlobalAudio = await import('../../../core/audio/globalAudio');
    if (!GlobalAudio || !GlobalAudio.triggerAttackRelease) {
      setPhase('idle');
      return;
    }
    const noteDuration = 0.4;
    for (let i = 0; i < DEFAULT_MOTIF_MIDI.length; i++) {
      GlobalAudio.triggerAttackRelease(DEFAULT_MOTIF_MIDI[i], noteDuration);
      await new Promise((r) => setTimeout(r, noteDuration * 1000 + 80));
    }
    setPhase('listening');
    if (!isActive) void start();
    listenEndRef.current = setTimeout(() => {
      const expected = expectedRef.current;
      const buffer = bufferRef.current;
      const match =
        buffer.length >= expected.length &&
        expected.every((e, i) => buffer[i] !== undefined && Math.abs((buffer[i] % 12) - (e % 12)) <= PITCH_TOLERANCE_SEMITONES);
      if (match) {
        setPhase('match');
      } else {
        setPhase('miss');
        const context = {
          expected: expected.map((m) => Note.fromMidi(m)),
          played: buffer.map((m) => Note.fromMidi(m)),
          chord: 'C',
        };
        askNano(
          context,
          'Give a 1-sentence tip for the student: what note they missed or how to hear it. Do not give the answer directly.',
          'You are a jazz coach. Give a short, encouraging tip. Never give the correct note name directly.'
        ).then((tip) => setNanoTip(tip || 'Listen for the 3rd and 5th of the chord.'));
      }
    }, LISTEN_SECONDS * 1000);
  };

  const cancel = () => {
    if (listenEndRef.current) clearTimeout(listenEndRef.current);
    listenEndRef.current = 0;
    setPhase('idle');
    setNanoTip(null);
  };

  return (
    <div className="rounded-xl bg-neutral-800/80 border border-white/10 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Mic size={16} /> Call and Response
      </h3>
      <p className="text-xs text-neutral-400">
        App plays a 4-note motif. Start mic, then play it back. We listen and give a tip if you miss a note.
      </p>
      {phase === 'idle' && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={playMotif}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
          >
            <Play size={14} /> Play motif
          </button>
          {!isActive && (
            <button
              type="button"
              onClick={() => start()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-sm"
            >
              <Mic size={14} /> Enable mic
            </button>
          )}
        </div>
      )}
      {(phase === 'playing' || phase === 'listening') && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-amber-400">{phase === 'playing' ? 'Playing…' : 'Listen – play it back'}</span>
          {phase === 'listening' && (
            <button type="button" onClick={cancel} className="text-neutral-400 hover:text-white text-xs">
              Cancel
            </button>
          )}
        </div>
      )}
      {phase === 'match' && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <Check size={16} /> Match! Nice.
          <button type="button" onClick={() => setPhase('idle')} className="text-xs text-neutral-400 hover:text-white">
            Again
          </button>
        </div>
      )}
      {phase === 'miss' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <X size={16} /> Not quite
          </div>
          {nanoTip && <p className="text-xs text-neutral-300 bg-black/20 rounded p-2">{nanoTip}</p>}
          <button type="button" onClick={() => setPhase('idle')} className="text-xs text-cyan-400 hover:text-cyan-300">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
