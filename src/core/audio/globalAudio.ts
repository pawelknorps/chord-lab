import * as Tone from 'tone';
import { midiToNoteName, noteNameToMidi } from '../theory';
import {
  pianoVolumeSignal,
  bassVolumeSignal,
  drumsVolumeSignal,
  reverbVolumeSignal,
  pianoReverbSignal,
  isPlayingSignal,
  currentMeasureIndexSignal,
  currentBeatSignal
} from './audioSignals';
import { effect } from '@preact/signals-react';

// Instrument Types
export type Style = 'Swing' | 'Jazz' | 'Bossa' | 'Ballad' | 'Guitar' | 'None';

export let piano: Tone.Sampler | null = null;
export let guitar: Tone.Sampler | null = null;
let bass: Tone.Sampler | null = null;
export let drums: {
  kick: Tone.Sampler;
  snare: Tone.Sampler;
  hihat: Tone.Sampler;
  ride: Tone.Sampler;
} | null = null;

let isInitialized = false;

// Visualization Callback
type VisualizationCallback = (notes: number[]) => void;
let onVisualization: VisualizationCallback | null = null;

export function setVisualizationCallback(cb: VisualizationCallback | null) {
  onVisualization = cb;
}

function emitVisualization(notes: number[]) {
  if (onVisualization) onVisualization(notes);
}

// Volume nodes & FX
let reverb: Tone.Reverb;
let pianoReverb: Tone.Reverb;
let chorus: Tone.Chorus;
let compressor: Tone.Compressor;
let masterVol: Tone.Volume;

let pianoVol: Tone.Volume;
let bassVol: Tone.Volume;
let drumsVol: Tone.Volume;

// Split-Brain Modules
let shellSynth: Tone.PolySynth | null = null;
let extensionSynth: Tone.PolySynth | null = null;
let shellPanner: Tone.Panner | null = null;
let extensionPanner: Tone.Panner | null = null;
let dissonanceTremolo: Tone.Tremolo | null = null;

export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  await Tone.start();

  // --- FX CHAIN ---
  reverb = new Tone.Reverb({
    decay: 2.5,
    preDelay: 0.1,
    wet: reverbVolumeSignal.value
  }).toDestination();
  await reverb.generate();

  pianoReverb = new Tone.Reverb({
    decay: 3.0,
    preDelay: 0.15,
    wet: pianoReverbSignal.value
  }).toDestination();
  await pianoReverb.generate();

  chorus = new Tone.Chorus({
    frequency: 1.5,
    delayTime: 3.5,
    depth: 0.7,
    wet: 0.1
  }).connect(reverb);

  compressor = new Tone.Compressor({
    threshold: -20,
    ratio: 3,
    attack: 0.05,
    release: 0.2
  }).connect(chorus);

  masterVol = new Tone.Volume(0).connect(compressor);

  // --- BUSSES ---
  pianoVol = new Tone.Volume(pianoVolumeSignal.value).connect(pianoReverb);
  bassVol = new Tone.Volume(bassVolumeSignal.value).connect(compressor);
  drumsVol = new Tone.Volume(drumsVolumeSignal.value).connect(compressor);

  // Bind signals to Tone nodes
  effect(() => {
    if (pianoVol) pianoVol.volume.rampTo(pianoVolumeSignal.value, 0.1);
  });
  effect(() => {
    if (bassVol) bassVol.volume.rampTo(bassVolumeSignal.value, 0.1);
  });
  effect(() => {
    if (drumsVol) drumsVol.volume.rampTo(drumsVolumeSignal.value, 0.1);
  });
  effect(() => {
    if (reverb) reverb.wet.rampTo(reverbVolumeSignal.value, 0.1);
  });
  effect(() => {
    if (pianoReverb) pianoReverb.wet.rampTo(pianoReverbSignal.value, 0.1);
  });

  // --- SPLIT BRAIN BUSSES ---
  // Left Ear (Shells)
  shellPanner = new Tone.Panner(-0.8).connect(masterVol);
  // Right Ear (Extensions)
  extensionPanner = new Tone.Panner(0.8).connect(masterVol);

  // Dissonance Effect (Right Ear)
  dissonanceTremolo = new Tone.Tremolo(10, 0).start();
  dissonanceTremolo.wet.value = 1;
  dissonanceTremolo.connect(extensionPanner);

  // --- INSTRUMENTS ---

  // 1. Main Piano (Center/Global) - REALISTIC SAMPLER
  piano = new Tone.Sampler({
    urls: {
      "C1": "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      "A1": "A1.mp3",
      "C2": "C2.mp3",
      "D#2": "Ds2.mp3",
      "F#2": "Fs2.mp3",
      "A2": "A2.mp3",
      "C3": "C3.mp3",
      "D#3": "Ds3.mp3",
      "F#3": "Fs3.mp3",
      "A3": "A3.mp3",
      "C4": "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      "A4": "A4.mp3",
      "C5": "C5.mp3",
      "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3",
      "A5": "A5.mp3",
      "C6": "C6.mp3",
      "D#6": "Ds6.mp3",
      "F#6": "Fs6.mp3",
      "A6": "A6.mp3",
      "C7": "C7.mp3",
      "D#7": "Ds7.mp3",
      "F#7": "Fs7.mp3",
      "A7": "A7.mp3",
      "C8": "C8.mp3"
    },
    release: 1,
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/piano/"
  }).connect(pianoVol);

  // 2. Shell Synth (Left - Warm)
  shellSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 1 },
    volume: -5
  }).connect(shellPanner);

  // 3. Extension Synth (Right - Bright + Wobble)
  extensionSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 1 },
    volume: -5
  }).connect(dissonanceTremolo);


  // 4. Guitar (Nylon)
  guitar = new Tone.Sampler({
    urls: {
      "A2": "A2.mp3",
      "E3": "E3.mp3",
      "G3": "G3.mp3",
    },
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-nylon/",
    onload: () => console.log('Guitar loaded')
  }).connect(pianoVol);

  // 5. Electric Bass Sampler
  bass = new Tone.Sampler({
    urls: {
      "A#1": "As1.mp3",
      "C#1": "Cs1.mp3",
      "E1": "E1.mp3",
      "G1": "G1.mp3",
      "A#2": "As2.mp3",
      "C#2": "Cs2.mp3",
      "E2": "E2.mp3",
      "G2": "G2.mp3",
      "A#3": "As3.mp3",
      "C#3": "Cs3.mp3",
      "E3": "E3.mp3",
      "G3": "G3.mp3",
      "A#4": "As4.mp3",
      "C#4": "Cs4.mp3",
      "E4": "E4.mp3",
      "G4": "G4.mp3",
      "C#5": "Cs5.mp3"
    },
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/bass-electric/",
    onload: () => console.log('Electric Bass loaded')
  }).connect(bassVol);

  // 6. Drums (Nate Smith Local Samples - Multi-Sampled)
  const drumBaseUrl = "/drum_samples/";
  drums = {
    kick: new Tone.Sampler({
      urls: {
        "C1": "KickTight1_NateSmith.wav",
        "D1": "KickTight2_NateSmith.wav",
        "E1": "KickOpen1_NateSmith.wav"
      },
      baseUrl: drumBaseUrl,
      onload: () => console.log('Kick sampler loaded (multi)')
    }).connect(drumsVol),
    snare: new Tone.Sampler({
      urls: {
        "C1": "SnareTight1_NateSmith.wav",
        "D1": "SnareDeep1_NateSmith.wav",
        "E1": "CrossStick1_NateSmith.wav"
      },
      baseUrl: drumBaseUrl,
      onload: () => console.log('Snare sampler loaded (multi)')
    }).connect(drumsVol),
    hihat: new Tone.Sampler({
      urls: {
        "C1": "HiHatClosed1_NateSmith.wav",
        "D1": "HiHatClosed2_NateSmith.wav",
        "E1": "HiHatClosed3_NateSmith.wav",
        "F1": "HiHatOpen1_NateSmith.wav"
      },
      baseUrl: drumBaseUrl,
      onload: () => console.log('HiHat sampler loaded (multi)')
    }).connect(drumsVol),
    ride: new Tone.Sampler({
      urls: {
        "C1": "Ride1_NateSmith.wav",
        "D1": "Ride2_NateSmith.wav",
        "E1": "RideBell_NateSmith.wav",
        "F1": "CrashRide1_NateSmith.wav"
      },
      baseUrl: drumBaseUrl,
      onload: () => console.log('Ride sampler loaded (multi)')
    }).connect(drumsVol)
  };

  isInitialized = true;
}

export function setVolume(type: 'piano' | 'bass' | 'drums', val: number) {
  if (type === 'piano') pianoVol.volume.value = val;
  if (type === 'bass') bassVol.volume.value = val;
  if (type === 'drums') drumsVol.volume.value = val;
}

export function setBpm(bpm: number) {
  Tone.Transport.bpm.value = bpm;
}

export function isAudioReady(): boolean {
  return isInitialized;
}

export function stop() {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  // Release all notes
  piano?.releaseAll();
  guitar?.releaseAll();
  bass?.releaseAll();
}

// Play a single chord immediately or at a scheduled time
export function playChord(midiNotes: number[], duration = '8n', style: Style = 'None', time: number | string = Tone.now()): void {
  if (!piano || !isInitialized) return;
  const validNotes = midiNotes.filter(n => !isNaN(n) && isFinite(n));
  const noteNames = validNotes.map(m => midiToNoteName(m));
  if (noteNames.length > 0) {
    emitVisualization(validNotes);
    if (style === 'Guitar') {
      guitar?.triggerAttackRelease(noteNames, duration, time);
    } else {
      piano.triggerAttackRelease(noteNames, duration, time);
    }
  }
}

// Real-time MIDI triggers
export function triggerAttack(midiNote: number, velocity: number = 0.7) {
  if (!piano || !isInitialized) return;
  const noteName = midiToNoteName(midiNote);
  if (noteName) {
    piano.triggerAttack(noteName, Tone.now(), velocity);
  }
}

export function triggerRelease(midiNote: number) {
  if (!piano || !isInitialized) return;
  const noteName = midiToNoteName(midiNote);
  if (noteName) {
    piano.triggerRelease(noteName, Tone.now());
  }
}

// Play specific parts (Shell / Extension)
export function playChordPart(midiNotes: number[], duration = '2n', _type: 'shell' | 'extension' = 'shell'): void {
  // Legacy method, forwarding to main piano for now or could map to split brain
  if (!piano || !isInitialized) return;
  const validNotes = midiNotes.filter(n => !isNaN(n) && isFinite(n));
  const noteNames = validNotes.map(m => midiToNoteName(m));
  if (noteNames.length > 0) {
    emitVisualization(validNotes);
    piano.triggerAttackRelease(noteNames, duration);
  }
}

// --- SPLIT BRAIN API ---

export function playSplitBrain(shellNotes: string[] | number[], extensionNotes: string[] | number[], duration = '2n') {
  if (!isInitialized) return;

  // Convert MIDI to note names if needed
  const toNames = (notes: string[] | number[]) =>
    notes.map(n => typeof n === 'number' ? midiToNoteName(n) : n);
  const toMidi = (notes: string[] | number[]) =>
    notes.map(n => typeof n === 'string' ? noteNameToMidi(n) : n);

  const shells = toNames(shellNotes);
  const extensions = toNames(extensionNotes);
  const allMidi = [...toMidi(shellNotes), ...toMidi(extensionNotes)];

  if (allMidi.length > 0) {
    emitVisualization(allMidi);
  }

  if (shells.length > 0 && shellSynth) {
    shellSynth.triggerAttackRelease(shells, duration);
  }
  if (extensions.length > 0 && extensionSynth) {
    extensionSynth.triggerAttackRelease(extensions, duration);
  }
}

export function setDissonance(amount: number) {
  if (!dissonanceTremolo || !isInitialized) return;

  // Amount 0-1
  if (amount <= 0.01) {
    dissonanceTremolo.depth.rampTo(0, 0.2);
    dissonanceTremolo.frequency.rampTo(0, 0.2);
  } else {
    dissonanceTremolo.frequency.rampTo(4 + amount * 16, 0.1);
    dissonanceTremolo.depth.rampTo(amount, 0.1);
  }
}

// Schedule playback
export function playProgression(
  progression: { root: string; quality: string; duration: number; notes: number[] }[],
  style: Style,
  bpm: number,
  onChordStart?: (index: number) => void,
  onFinish?: () => void,
  onActiveNotesChange?: (notes: number[]) => void
) {
  if (!isInitialized) return;

  stop();
  Tone.Transport.bpm.value = bpm;
  isPlayingSignal.value = true;

  let currentTime = 0; // in beats (quarter notes)

  progression.forEach((chord, i) => {
    const duration = chord.duration; // in beats
    const nextChord = progression[i + 1] || progression[0]; // Loop back to start for target

    // Schedule UI update
    Tone.Transport.schedule((time) => {
      Tone.Draw.schedule(() => {
        onChordStart?.(i);
        currentMeasureIndexSignal.value = i;
      }, time);
    }, Tone.Time('4n').toSeconds() * currentTime + 0.05);

    const startSec = Tone.Time('4n').toSeconds() * currentTime;

    const noteNames = chord.notes.map(n => midiToNoteName(n));
    // Bass note: Try to keep it in E1-E3 range
    let rootMidi = noteNameToMidi(chord.root + '2');
    if (rootMidi < 28) rootMidi += 12; // E1 is 28

    // --- PIANO / COMPING ---
    if (style === 'Swing' || style === 'Jazz') {
      const isThreeFour = duration === 3;
      const velocity = 0.5 + Math.random() * 0.2;
      const jitter = () => (Math.random() - 0.5) * 0.015;

      // Decide on a rhythm pattern for this measure
      const patternType = Math.floor(Math.random() * 5);
      const beatsToPlay: { beat: number; dur: string; velMult: number }[] = [];

      if (isThreeFour) {
        // 3/4 Patterns
        if (patternType === 0) beatsToPlay.push({ beat: 0, dur: '2.n', velMult: 1 });
        else if (patternType === 1) {
          beatsToPlay.push({ beat: 0, dur: '4n', velMult: 1 });
          beatsToPlay.push({ beat: 1.66, dur: '8n', velMult: 0.8 });
        } else {
          beatsToPlay.push({ beat: 0, dur: '4n', velMult: 1 });
          beatsToPlay.push({ beat: 2, dur: '4n', velMult: 0.7 });
        }
      } else {
        // 4/4 Patterns
        if (patternType === 0) {
          // The Charleston
          beatsToPlay.push({ beat: 0, dur: '4n.', velMult: 1 });
          beatsToPlay.push({ beat: 1.5, dur: '8n', velMult: 0.8 });
        } else if (patternType === 1) {
          // Red Garland / Syncopated
          beatsToPlay.push({ beat: 0, dur: '8n', velMult: 0.6 });
          beatsToPlay.push({ beat: 1.66, dur: '4n', velMult: 1 });
          beatsToPlay.push({ beat: 3.66, dur: '8n', velMult: 0.8 });
        } else if (patternType === 2) {
          // Sparse / Languid
          beatsToPlay.push({ beat: 0, dur: '1n', velMult: 0.9 });
        } else if (patternType === 3) {
          // Offbeat clusters
          beatsToPlay.push({ beat: 0.5, dur: '4n', velMult: 0.7 });
          beatsToPlay.push({ beat: 2.5, dur: '4n', velMult: 1 });
        } else {
          // Anticipation
          beatsToPlay.push({ beat: 0, dur: '2n', velMult: 1 });
          beatsToPlay.push({ beat: 3.5, dur: '8n', velMult: 0.9 });
        }
      }

      beatsToPlay.forEach(config => {
        const beatTime = startSec + config.beat * Tone.Time('4n').toSeconds();

        Tone.Transport.schedule(t => {
          const actualTime = t + jitter();
          noteNames.forEach((name, idx) => {
            const noteOffset = idx * (0.01 + Math.random() * 0.02);
            const noteVel = (velocity * config.velMult) * (0.9 + Math.random() * 0.2);
            piano?.triggerAttackRelease(name, config.dur, actualTime + noteOffset, noteVel);
          });

          Tone.Draw.schedule(() => {
            onActiveNotesChange?.(chord.notes);
            emitVisualization(chord.notes);
          }, actualTime);
        }, beatTime);
      });

    } else if (style === 'Bossa') {
      Tone.Transport.schedule(t => {
        piano?.triggerAttackRelease(noteNames, '16n', t, 0.6);
        Tone.Draw.schedule(() => {
          onActiveNotesChange?.(chord.notes);
          emitVisualization(chord.notes);
        }, t);
      }, startSec);
    } else if (style === 'Guitar') {
      const vel = 0.4 + Math.random() * 0.2;
      noteNames.forEach((name, idx) => {
        const strumOffset = idx * 0.03;
        Tone.Transport.schedule(t => {
          guitar?.triggerAttackRelease(name, '2n', t, vel);
          if (idx === 0) Tone.Draw.schedule(() => {
            onActiveNotesChange?.(chord.notes);
            emitVisualization(chord.notes);
          }, t);
        }, startSec + strumOffset);
      });
    } else {
      Tone.Transport.schedule(t => {
        piano?.triggerAttackRelease(noteNames, duration * Tone.Time('4n').toSeconds(), t, 0.5);
        Tone.Draw.schedule(() => {
          onActiveNotesChange?.(chord.notes);
          emitVisualization(chord.notes);
        }, t);
      }, startSec);
    }

    // --- BASS ---
    if (style !== 'None') {
      for (let b = 0; b < duration; b++) {
        const beatTime = startSec + b * Tone.Time('4n').toSeconds();

        // Update current beat signal
        Tone.Transport.schedule(t => {
          Tone.Draw.schedule(() => {
            currentBeatSignal.value = b;
          }, t);
        }, beatTime);

        if (style === 'Swing' || style === 'Jazz') {
          let targetMidi: number;
          if (b === 0) {
            targetMidi = rootMidi;
          } else if (b === duration - 1) {
            // Chromatic approach to next chord
            const nextRootMidi = noteNameToMidi(nextChord.root + '2');
            targetMidi = nextRootMidi + (Math.random() > 0.5 ? 1 : -1);
          } else {
            // Scale or arpeggio tones
            const tones = chord.notes.map(n => noteNameToMidi(midiToNoteName(n).replace(/[0-9]/g, '') + '2'));
            targetMidi = tones[Math.floor(Math.random() * tones.length)];
          }

          while (targetMidi < 28) targetMidi += 12;
          while (targetMidi > 52) targetMidi -= 12;

          const name = midiToNoteName(targetMidi);
          Tone.Transport.schedule(t => {
            const vel = b === 0 ? 0.9 : 0.7 + Math.random() * 0.2;
            bass?.triggerAttackRelease(name, '4n', t, vel);
          }, beatTime);
        } else if (style === 'Bossa') {
          if (b === 0) {
            Tone.Transport.schedule(t => bass?.triggerAttackRelease(midiToNoteName(rootMidi), '4n.', t), beatTime);
          } else if (b === 2) {
            const fifth = rootMidi + 7;
            Tone.Transport.schedule(t => bass?.triggerAttackRelease(midiToNoteName(fifth), '4n', t), beatTime);
          }
        } else if (b === 0) {
          Tone.Transport.schedule(t => bass?.triggerAttackRelease(midiToNoteName(rootMidi), '1n', t), beatTime);
        }
      }
    }

    // --- DRUMS ---
    if ((style === 'Swing' || style === 'Jazz') && drums) {
      // ... (existing drum logic)
      for (let b = 0; b < duration; b++) {
        const beatTime = startSec + b * Tone.Time('4n').toSeconds();
        const jitter = () => (Math.random() - 0.5) * 0.015;

        // 1. Ride cymbal (Classic spang-a-lang)
        // const ridePattern = [1, 0, 0.5, 0]; // downbeat, skip, upbeat, skip
        // basic swing ride
        Tone.Transport.schedule(t => {
          const vel = (b % 2 === 0 ? 0.7 : 0.5) + Math.random() * 0.1;
          drums?.ride.triggerAttack("C1", t + jitter(), vel);
        }, beatTime);

        // 2 and 4 Hihat
        if (b % 2 === 1) {
          Tone.Transport.schedule(t => {
            drums?.hihat.triggerAttack("C1", t + jitter(), 0.6);
          }, beatTime);
        }

        // Kick feathering (very soft on all beats)
        Tone.Transport.schedule(t => {
          drums?.kick.triggerAttack("C1", t + jitter(), 0.1);
        }, beatTime);
      }
    }

    currentTime += duration;
  });

  const totalDurationSec = Tone.Time('4n').toSeconds() * currentTime;
  Tone.Transport.schedule(() => {
    onFinish?.();
    isPlayingSignal.value = false;
    currentMeasureIndexSignal.value = -1;
    currentBeatSignal.value = -1;
    stop();
    Tone.Draw.schedule(() => onActiveNotesChange?.([]), totalDurationSec);
  }, totalDurationSec);

  Tone.Transport.start();
}
