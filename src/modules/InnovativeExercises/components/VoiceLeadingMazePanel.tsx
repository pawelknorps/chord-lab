import { useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import * as Chord from '@tonaljs/chord';
import { useVoiceLeadingMaze } from '../hooks/useVoiceLeadingMaze';
import { initAudio } from '../../../core/audio/globalAudio';

const BPM = 120;
const BEATS_PER_CHORD = 8;
const SEC_PER_BEAT = 60 / BPM;
const SEC_PER_CHORD = BEATS_PER_CHORD * SEC_PER_BEAT;

function getChordMidis(symbol: string, octave: number = 4): number[] {
  const c = Chord.get(symbol);
  if (!c.notes?.length) return [];
  return c.notes.map(n => Tone.Frequency(`${n}${octave}`).toMidi()).filter((m): m is number => typeof m === 'number' && m >= 0 && m <= 127);
}

export function VoiceLeadingMazePanel() {
  const { progression, currentChordIndex, currentChord, isMuted, hints, reset } = useVoiceLeadingMaze();
  const gainRef = useRef<Tone.Gain | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const scheduledRef = useRef(false);

  const startBacking = useCallback(async () => {
    await initAudio();
    await Tone.start();
    if (!synthRef.current) {
      const gain = new Tone.Gain(1).toDestination();
      gainRef.current = gain;
      synthRef.current = new Tone.PolySynth(Tone.Synth, { volume: -10 }).connect(gain);
    }
    if (scheduledRef.current) return;
    scheduledRef.current = true;
    const times = [0, SEC_PER_CHORD, SEC_PER_CHORD * 2];
    progression.forEach((symbol, i) => {
      const midis = getChordMidis(symbol);
      const noteNames = midis.map(m => Tone.Frequency(m, 'midi').toNote());
      Tone.Transport.schedule(time => {
        if (synthRef.current) synthRef.current.triggerAttackRelease(noteNames, SEC_PER_CHORD * 0.9, time);
      }, times[i]);
    });
    Tone.Transport.start();
  }, [progression]);

  useEffect(() => {
    const g = gainRef.current;
    if (!g) return;
    if (isMuted) g.gain.rampTo(0, 0.1);
    else g.gain.rampTo(1, 0.1);
  }, [isMuted]);

  const handleReset = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    scheduledRef.current = false;
    reset();
  }, [reset]);

  useEffect(() => {
    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      synthRef.current?.dispose();
      gainRef.current?.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Voice-Leading Maze</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        ii–V–I progression. Play only guide tones (3rds and 7ths). Wrong note mutes the backing until you play a correct connective note.
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={startBacking} className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--text-on-accent)]">
          Start Backing
        </button>
        <button type="button" onClick={handleReset} className="px-4 py-2 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)]">
          Reset
        </button>
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)]">
        Current chord: <strong>{currentChord}</strong> ({currentChordIndex + 1}/{progression.length})
      </p>
      {hints && (
        <p className="text-sm text-[var(--text-muted)]">
          Guide tones: 3rd = {hints.third}, 7th = {hints.seventh}
        </p>
      )}
      <p className={`text-sm font-medium ${isMuted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
        {isMuted ? 'Muted — play a guide tone (3rd or 7th) to unmute.' : 'Playing — keep playing guide tones!'}
      </p>
    </div>
  );
}
