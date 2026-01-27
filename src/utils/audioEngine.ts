import * as Tone from 'tone';
import { midiToNoteName } from './musicTheory';

let synth: Tone.PolySynth | null = null;
let isInitialized = false;

// Different synth presets for various sounds
const SYNTH_PRESETS = {
  'Piano': {
    oscillator: { type: 'triangle' as const },
    envelope: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.4,
      release: 1.2,
    },
  },
  'Electric Piano': {
    oscillator: { type: 'sine' as const },
    envelope: {
      attack: 0.01,
      decay: 0.5,
      sustain: 0.3,
      release: 1.5,
    },
  },
  'Pad': {
    oscillator: { type: 'sawtooth' as const },
    envelope: {
      attack: 0.3,
      decay: 0.5,
      sustain: 0.7,
      release: 2,
    },
  },
  'Organ': {
    oscillator: { type: 'square' as const },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.9,
      release: 0.3,
    },
  },
  'Synth Lead': {
    oscillator: { type: 'sawtooth' as const },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.8,
    },
  },
};

export type SynthPreset = keyof typeof SYNTH_PRESETS;

// Initialize the audio context (must be called from user interaction)
export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  
  await Tone.start();
  
  synth = new Tone.PolySynth(Tone.Synth, SYNTH_PRESETS['Piano']).toDestination();
  synth.volume.value = -6;
  
  isInitialized = true;
}

// Change the synth preset
export function setSynthPreset(preset: SynthPreset): void {
  if (!synth) return;
  
  const settings = SYNTH_PRESETS[preset];
  synth.set(settings);
}

// Play a single chord (immediate)
export function playChord(midiNotes: number[], duration = '2n'): void {
  if (!synth || !isInitialized) return;
  
  const noteNames = midiNotes.map(m => midiToNoteName(m));
  synth.triggerAttackRelease(noteNames, duration);
}

// Play a chord with attack (for sustained play)
export function attackChord(midiNotes: number[]): void {
  if (!synth || !isInitialized) return;
  
  const noteNames = midiNotes.map(m => midiToNoteName(m));
  synth.triggerAttack(noteNames);
}

// Release all notes
export function releaseAll(): void {
  if (!synth || !isInitialized) return;
  synth.releaseAll();
}

// Play a progression
export async function playProgression(
  chords: number[][],
  bpm = 120,
  onChordPlay?: (index: number) => void,
  onComplete?: () => void
): Promise<() => void> {
  if (!synth || !isInitialized) return () => {};
  
  let cancelled = false;
  const beatDuration = 60000 / bpm; // ms per beat
  const chordDuration = beatDuration * 2; // 2 beats per chord
  
  for (let i = 0; i < chords.length; i++) {
    if (cancelled) break;
    
    const chord = chords[i];
    const noteNames = chord.map(m => midiToNoteName(m));
    
    onChordPlay?.(i);
    synth.triggerAttackRelease(noteNames, '2n');
    
    await new Promise(resolve => setTimeout(resolve, chordDuration));
  }
  
  if (!cancelled) {
    onComplete?.();
  }
  
  return () => {
    cancelled = true;
    releaseAll();
  };
}

// Check if audio is ready
export function isAudioReady(): boolean {
  return isInitialized;
}

// Get current BPM
let currentBpm = 120;

export function setBpm(bpm: number): void {
  currentBpm = Math.max(40, Math.min(200, bpm));
  Tone.getTransport().bpm.value = currentBpm;
}

export function getBpm(): number {
  return currentBpm;
}

// Volume control
export function setVolume(db: number): void {
  if (synth) {
    synth.volume.value = db;
  }
}

export { SYNTH_PRESETS };
