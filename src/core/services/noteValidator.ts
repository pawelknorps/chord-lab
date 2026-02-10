/**
 * Validates AI-suggested notes against Tonal.js scale/chord (REQ-NANO-07).
 * Do not display suggestions that are not in the current scale/chord.
 */

import * as Chord from '@tonaljs/chord';

export interface NoteValidatorContext {
  key: string;
  scaleNotes: string[];
  chordSymbol?: string;
}

/** Match note names (A-G with optional # or b). Case-insensitive, then normalize. */
const NOTE_PATTERN = /\b([A-Ga-g](#|b|#)?)\b/g;

function normalizeNote(match: string): string {
  const upper = match.charAt(0).toUpperCase();
  const acc = match.slice(1).trim().toLowerCase();
  if (acc === '#') return upper + '#';
  if (acc === 'b') return upper + 'b';
  return upper;
}

/**
 * Returns allowed note names (without octave). If chordSymbol is given, use chord tones;
 * otherwise use scaleNotes only.
 */
function getAllowedNotes(context: NoteValidatorContext): Set<string> {
  if (context.chordSymbol) {
    const chord = Chord.get(context.chordSymbol);
    if (!chord.empty && chord.notes?.length) {
      const withOctave = new Set(chord.notes);
      const withoutOctave = new Set(chord.notes.map(n => n.replace(/\d/g, '')));
      return withoutOctave;
    }
  }
  return new Set(context.scaleNotes.map(n => n.replace(/\d/g, '')));
}

/**
 * Validates AI response text: notes not in the allowed set are replaced with "[use scale tone]"
 * and a short disclaimer is appended when any invalid note was found.
 */
export function validateSuggestedNotes(responseText: string, context: NoteValidatorContext): string {
  const allowed = getAllowedNotes(context);
  let hadInvalid = false;
  const sanitized = responseText.replace(NOTE_PATTERN, (match) => {
    const note = normalizeNote(match);
    const notePc = note.replace(/\d/g, '');
    if (allowed.has(notePc)) return match;
    hadInvalid = true;
    return '[use scale tone]';
  });
  if (hadInvalid && context.scaleNotes.length) {
    const scaleList = context.scaleNotes.slice(0, 7).join(', ');
    return `${sanitized}\n\n(Use only scale tones: ${scaleList}.)`;
  }
  return sanitized;
}
