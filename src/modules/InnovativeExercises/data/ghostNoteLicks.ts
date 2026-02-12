import * as Note from '@tonaljs/note';
import type { GhostNoteLick, LickEvent } from '../types';

/** One curated lick: 1 bar, one ghost on the 3rd 8th. Target = E4 (64). */
function buildSampleLick(): LickEvent[] {
  const quarter = 0.5; // 120 BPM → 0.5s per beat
  const eighth = quarter / 2;
  const notes: [string, number][] = [
    ['G4', 0],
    ['A4', eighth],
    ['E4', eighth * 2], // ghost slot – student plays E4
    ['F#4', eighth * 3],
    ['G4', eighth * 4],
  ];
  return notes.map(([pitch, timeOffset], i) => {
    const isGhost = i === 2;
    const midi = Note.midi(pitch) ?? undefined;
    return {
      pitch: isGhost ? '' : pitch,
      duration: eighth,
      timeOffset,
      isGhost,
      midi, // For ghost slot, this is the target MIDI the student should play.
    } as LickEvent;
  });
}

const sampleEvents = buildSampleLick();
/** Ghost index is 2 (third 8th). */
const ghostIndex = 2;

export const SAMPLE_GHOST_LICK: GhostNoteLick = {
  id: 'sample-ii-v-lick',
  name: 'Sample ii–V Lick (ghost on 3)',
  bpm: 120,
  events: sampleEvents,
  ghostIndex,
};

/** Target MIDI for the ghost slot (for 10¢ check). */
export function getGhostTargetMidi(lick: GhostNoteLick): number | undefined {
  const ghostEvent = lick.events[lick.ghostIndex];
  if (!ghostEvent?.isGhost) return undefined;
  return ghostEvent.midi;
}

/** Target note name for display (e.g. "E4"). */
export function getGhostTargetNoteName(lick: GhostNoteLick): string | undefined {
  const midi = getGhostTargetMidi(lick);
  if (midi == null) return undefined;
  return Note.fromMidi(midi);
}
