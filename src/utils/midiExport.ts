import { Midi } from '@tonejs/midi';

interface ExportOptions {
  name?: string;
  bpm?: number;
  chordDurationBeats?: number;
}

export function exportToMidi(
  chords: number[][],
  options: ExportOptions = {}
): Blob {
  const {
    name = 'Chord Progression',
    bpm = 120,
    chordDurationBeats = 2,
  } = options;

  const midi = new Midi();
  midi.header.name = name;
  midi.header.setTempo(bpm);

  const track = midi.addTrack();
  track.name = 'Chords';

  let currentTime = 0;
  const chordDuration = chordDurationBeats; // in beats

  for (const chord of chords) {
    for (const note of chord) {
      track.addNote({
        midi: note,
        time: currentTime,
        duration: chordDuration * 0.9, // Slight gap between chords
        velocity: 0.8,
      });
    }
    currentTime += chordDuration;
  }

  const arrayBuffer = midi.toArray();
  return new Blob([new Uint8Array(arrayBuffer)], { type: 'audio/midi' });
}

export function downloadMidi(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.mid') ? filename : `${filename}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
