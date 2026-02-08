import * as Tone from 'tone';
import { midiToNoteName, noteNameToMidi } from '../theory';

// Instrument Types
export type Style = 'Swing' | 'Bossa' | 'Ballad' | 'Guitar' | 'None';

let piano: Tone.Sampler | null = null;
let bass: Tone.MonoSynth | null = null;
let drums: {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  hihat: Tone.MetalSynth;
  ride: Tone.MetalSynth;
} | null = null;
let guitar: Tone.Sampler | null = null;

let isInitialized = false;

// Volume nodes & FX
let reverb: Tone.Reverb;
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
    wet: 0.3
  }).toDestination();
  await reverb.generate();

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
  pianoVol = new Tone.Volume(-8).connect(masterVol);
  bassVol = new Tone.Volume(-4).connect(masterVol);
  drumsVol = new Tone.Volume(-12).connect(masterVol);

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
      "A0": "A0.mp3",
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
    baseUrl: "https://tonejs.github.io/audio/salamander/"
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
      "C3": "C3.mp3",
      "E3": "E3.mp3",
      "G3": "G3.mp3",
    },
    baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-nylon/",
    onload: () => console.log('Guitar loaded')
  }).connect(pianoVol);

  // 5. Bass
  bass = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.8, release: 0.5 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, baseFrequency: 80, octaves: 3, exponent: 2 }
  }).connect(bassVol);

  // 6. Drums
  drums = {
    kick: new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 10, oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" }
    }).connect(drumsVol),
    snare: new Tone.NoiseSynth({
      noise: { type: "pink" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
    }).connect(drumsVol),
    hihat: new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
    }).connect(drumsVol),
    ride: new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 1.5, release: 0.5 }, harmonicity: 5.1, modulationIndex: 20, resonance: 6000, octaves: 1.0,
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
  bass?.triggerRelease();
}

// Play a single chord immediately
export function playChord(midiNotes: number[], duration = '8n', style: Style = 'None'): void {
  if (!piano || !isInitialized) return;
  const validNotes = midiNotes.filter(n => !isNaN(n) && isFinite(n));
  const noteNames = validNotes.map(m => midiToNoteName(m));
  if (noteNames.length > 0) {
    if (style === 'Guitar') {
      guitar?.triggerAttackRelease(noteNames, duration);
    } else {
      piano.triggerAttackRelease(noteNames, duration);
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
    piano.triggerAttackRelease(noteNames, duration);
  }
}

// --- SPLIT BRAIN API ---

export function playSplitBrain(shellNotes: string[] | number[], extensionNotes: string[] | number[], duration = '2n') {
  if (!isInitialized) return;

  // Convert MIDI to note names if needed
  const toNames = (notes: string[] | number[]) =>
    notes.map(n => typeof n === 'number' ? midiToNoteName(n) : n);

  const shells = toNames(shellNotes);
  const extensions = toNames(extensionNotes);

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

  let currentTime = 0; // in beats (quarter notes)

  progression.forEach((chord, i) => {
    const duration = chord.duration; // in beats
    const nextChord = progression[i + 1] || progression[0]; // Loop back to start for target

    // Schedule UI update
    Tone.Transport.schedule((time) => {
      Tone.Draw.schedule(() => {
        onChordStart?.(i);
      }, time);
    }, Tone.Time('4n').toSeconds() * currentTime + 0.05);

    const startSec = Tone.Time('4n').toSeconds() * currentTime;

    const noteNames = chord.notes.map(n => midiToNoteName(n));
    // Bass note: Try to keep it in E1-E3 range
    let rootMidi = noteNameToMidi(chord.root + '2');
    if (rootMidi < 28) rootMidi += 12; // E1 is 28

    // --- INSTRUMENT PART ---
    if (style === 'Swing') {
      const velocity = 0.5 + Math.random() * 0.2;
      Tone.Transport.schedule(t => {
        piano?.triggerAttackRelease(noteNames, '4n', t, velocity);
        Tone.Draw.schedule(() => onActiveNotesChange?.(chord.notes), t);
      }, startSec);

      Tone.Transport.schedule(t => {
        Tone.Draw.schedule(() => onActiveNotesChange?.([]), t);
      }, startSec + Tone.Time('4n').toSeconds());

      if (duration >= 2) {
        const syncTime = startSec + Tone.Time('0:1:2').toSeconds();
        Tone.Transport.schedule(t => {
          piano?.triggerAttackRelease(noteNames, '8n', t, velocity * 0.8);
          Tone.Draw.schedule(() => onActiveNotesChange?.(chord.notes), t);
        }, syncTime);
        Tone.Transport.schedule(t => {
          Tone.Draw.schedule(() => onActiveNotesChange?.([]), t);
        }, syncTime + Tone.Time('8n').toSeconds());
      }
    } else if (style === 'Bossa') {
      Tone.Transport.schedule(t => {
        piano?.triggerAttackRelease(noteNames, '16n', t, 0.6);
        Tone.Draw.schedule(() => onActiveNotesChange?.(chord.notes), t);
      }, startSec);
      Tone.Transport.schedule(t => {
        Tone.Draw.schedule(() => onActiveNotesChange?.([]), t);
      }, startSec + Tone.Time('2n').toSeconds());
    } else if (style === 'Guitar') {
      const vel = 0.4 + Math.random() * 0.2;
      noteNames.forEach((name, idx) => {
        const strumOffset = idx * 0.03;
        Tone.Transport.schedule(t => {
          guitar?.triggerAttackRelease(name, '2n', t, vel);
          if (idx === 0) Tone.Draw.schedule(() => onActiveNotesChange?.(chord.notes), t);
        }, startSec + strumOffset);
      });
      Tone.Transport.schedule(t => {
        Tone.Draw.schedule(() => onActiveNotesChange?.([]), t);
      }, startSec + Tone.Time('2n').toSeconds());
    } else {
      Tone.Transport.schedule(t => {
        piano?.triggerAttackRelease(noteNames, duration * Tone.Time('4n').toSeconds(), t, 0.5);
        Tone.Draw.schedule(() => onActiveNotesChange?.(chord.notes), t);
      }, startSec);
      Tone.Transport.schedule(t => {
        Tone.Draw.schedule(() => onActiveNotesChange?.([]), t);
      }, startSec + duration * Tone.Time('4n').toSeconds());
    }

    // --- BASS ---
    if (style !== 'None') {
      if (style === 'Swing') {
        let nextRootMidi = noteNameToMidi(nextChord.root + '2');
        if (nextRootMidi < 28) nextRootMidi += 12;

        for (let b = 0; b < duration; b++) {
          const beatTime = startSec + b * Tone.Time('4n').toSeconds();
          let target: number;

          if (b === 0) {
            target = rootMidi;
          } else if (b === duration - 1) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            target = nextRootMidi - direction;
          } else {
            const voicingNotes = chord.notes.map(n => (n % 12) + 36);
            const candidates = voicingNotes.filter(n => n !== (rootMidi % 12) + 36);
            target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : rootMidi + 7;
          }

          let loopCount = 0;
          while (target < 28 && loopCount < 5) { target += 12; loopCount++; }
          while (target > 55 && loopCount < 5) { target -= 12; loopCount++; }

          const noteName = midiToNoteName(target);
          if (noteName) {
            Tone.Transport.schedule(t => {
              bass?.triggerAttackRelease(noteName, '4n', t, 0.9);
            }, beatTime);
          }
        }
      } else if (style === 'Bossa') {
        Tone.Transport.schedule(t => {
          bass?.triggerAttackRelease(midiToNoteName(rootMidi), '4n.', t);
        }, startSec);
        if (duration >= 2) {
          const fifth = rootMidi + 7;
          Tone.Transport.schedule(t => {
            bass?.triggerAttackRelease(midiToNoteName(fifth), '4n', t);
          }, startSec + Tone.Time('4n').toSeconds() * 2);
        }
      } else {
        Tone.Transport.schedule(t => {
          bass?.triggerAttackRelease(midiToNoteName(rootMidi), '1n', t);
        }, startSec);
      }
    }

    // --- DRUMS ---
    if (style === 'Swing' && drums) {
      for (let b = 0; b < duration; b++) {
        const beatTime = startSec + b * Tone.Time('4n').toSeconds();
        const vel = (b % 2 === 0) ? 0.6 : 0.4;
        Tone.Transport.schedule(t => drums?.ride.triggerAttack(t, vel), beatTime);
        if (b % 2 !== 0) {
          Tone.Transport.schedule(t => drums?.ride.triggerAttack(t, 0.3), beatTime + Tone.Time('8t').toSeconds() * 2);
          Tone.Transport.schedule(t => drums?.hihat.triggerAttack(t, 0.5), beatTime);
        }
      }
    } else if (style === 'Bossa' && drums) {
      for (let b = 0; b < duration * 4; b++) {
        const time = startSec + b * Tone.Time('16n').toSeconds();
        const vel = (b % 2 === 0) ? 0.1 : 0.05;
        Tone.Transport.schedule(t => drums?.hihat.triggerAttack(t, vel), time);
      }
      Tone.Transport.schedule(t => drums?.snare.triggerAttack(t, 0.4), startSec);
      Tone.Transport.schedule(t => drums?.snare.triggerAttack(t, 0.3), startSec + Tone.Time('0:2:2').toSeconds());
    }

    currentTime += duration;
  });

  const totalDurationSec = Tone.Time('4n').toSeconds() * currentTime;
  Tone.Transport.schedule(() => {
    onFinish?.();
    stop();
    Tone.Draw.schedule(() => onActiveNotesChange?.([]), totalDurationSec);
  }, totalDurationSec);

  Tone.Transport.start();
}
