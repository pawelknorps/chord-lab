/**
 * Build voice-leading progressions from the jazz standards library.
 * Each progression is a list of chord symbols that have guide tones (3rd & 7th).
 */
import { GuideToneCalculator } from '../../../core/theory/GuideToneCalculator';
import { JazzTheoryService } from '../../JazzKiller/utils/JazzTheoryService';
import type { JazzStandard } from '../../JazzKiller/hooks/useJazzLibrary';

export interface VoiceLeadingProgressionOption {
  id: string;
  name: string;
  chords: string[];
  /** Full standard from library (for use with getSongAsIRealFormat); only set for library items. */
  standard?: JazzStandard;
}

const MIN_CHORDS = 2;

function chordHasGuideTones(symbol: string): boolean {
  const main = JazzTheoryService.getMainChord(symbol);
  return main.length > 0 && GuideToneCalculator.calculate(main) !== null;
}

/**
 * Flatten a section's Chords string (e.g. "Dm7|G7|Cmaj7|Am7") into an array of chord symbols,
 * one per measure, using main chord only and filtering to chords that have guide tones.
 */
function chordsFromSectionChords(chordsStr: string): string[] {
  if (!chordsStr?.trim()) return [];
  const measures = chordsStr.split('|').map(m => m.trim()).filter(Boolean);
  const result: string[] = [];
  for (const measure of measures) {
    const beatChords = measure.split(',').map(c => JazzTheoryService.getMainChord(c.trim())).filter(Boolean);
    const first = beatChords[0];
    if (first && chordHasGuideTones(first)) result.push(first);
  }
  return result;
}

/**
 * Build list of progression options from jazz standards.
 * First option is always the default ii–V–I; then one progression per standard (first section).
 */
export function getVoiceLeadingProgressionsFromStandards(standards: JazzStandard[]): VoiceLeadingProgressionOption[] {
  const defaultOptions: VoiceLeadingProgressionOption[] = [
    {
      id: 'ii-V-I',
      name: 'Major ii–V–I (Dm7 G7 Cmaj7)',
      chords: ['Dm7', 'G7', 'Cmaj7'],
    },
    {
      id: 'minor-ii-V-i',
      name: 'Minor ii–V–i (Dø7 G7alt Cm7)',
      chords: ['Dø7', 'G7alt', 'Cm7'],
    }
  ];

  const fromLibrary: VoiceLeadingProgressionOption[] = [];
  const seenIds = new Set<string>(defaultOptions.map(o => o.id));

  for (const song of standards) {
    const title = song.Title || 'Untitled';
    const composer = song.Composer ? ` — ${song.Composer}` : '';
    const safeId = title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') || `song-${fromLibrary.length}`;
    const id = seenIds.has(safeId) ? `${safeId}-${fromLibrary.length}` : safeId;
    if (!seenIds.has(safeId)) seenIds.add(safeId);

    const section = song.Sections?.[0];
    if (!section?.MainSegment?.Chords) continue;

    const chords = chordsFromSectionChords(section.MainSegment.Chords);
    if (chords.length < MIN_CHORDS) continue;

    fromLibrary.push({
      id,
      name: `${title}${composer}`,
      chords,
      standard: song,
    });
  }

  return [...defaultOptions, ...fromLibrary];
}
