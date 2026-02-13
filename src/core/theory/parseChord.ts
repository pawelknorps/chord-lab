/**
 * Parse chord symbols (iReal-style and standard) into root + quality.
 * Single source of truth for chord interpretation in unified theory.
 */
import { CHORD_INTERVALS } from './chordIntervals';

export function parseChord(chordName: string): { root: string; quality: string; bass?: string } {
  if (!chordName) return { root: 'C', quality: 'maj' };

  // Handle slash chords (e.g., C/G) and minor-major 7 notation (e.g. Fm/maj7)
  const parts = chordName.split('/') as [string] | [string, string];
  const base = parts[0];
  const slashPart = (parts[1] ?? '').replace(/[()\[\]]/g, '').trim();

  // Robust Regex for Root + Quality
  const match = base.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return { root: 'C', quality: 'maj', bass: parts[1] };

  const root = match[1];
  let quality = match[2];

  // Strip parentheses/brackets
  quality = quality.replace(/[()\[\]]/g, '');

  if (!quality) quality = 'maj';

  // Fm/maj7, Fmin/maj7, Dm/M7 etc. = minor with major 7th (mM7), not a slash chord
  const isMinorBase = quality === 'm' || quality === 'min' || quality === '-';
  const isMaj7Slash = /^(maj7|M7|Δ7?|\^7?)$/i.test(slashPart);
  if (parts[1] != null && isMaj7Slash && isMinorBase) {
    return { root, quality: 'mM7' };
  }

  const bass = parts[1];

  // 1. Handle Shorthand Aliases — dim7 first so o7/07 aren't collapsed to triad
  if (quality === 'o7' || quality === '07' || quality === '°7' || quality === 'dim7') quality = 'dim7';
  else if (quality.includes('h') || quality.includes('ø')) quality = quality.replace('h', 'ø').replace('ø7', 'ø');
  else if (quality.includes('o') || quality.includes('°')) quality = quality.replace(/o/g, '°').replace(/°7?/g, '°').trim();
  if (quality.includes('^') || quality.includes('Δ')) quality = quality.replace('^', 'Δ').replace('Δ7', 'Δ');

  if (quality === '°' || quality === 'dim') quality = 'dim';
  else if (quality === '°7' || quality === 'dim7') quality = 'dim7';
  else if (quality === 'ø' || quality === 'm7b5' || quality === '-7b5') quality = 'm7b5';

  else if (quality === '+' || quality === 'aug') quality = 'aug';
  else if (quality === '+7' || quality === 'aug7' || quality === '7#5') quality = 'aug7';

  else if ((quality.startsWith('m') && !quality.startsWith('maj')) || quality.startsWith('-')) {
    const rest = quality.startsWith('min') ? quality.substring(3) : quality.substring(1);
    if (!rest) quality = 'min';
    else if (rest === '7') quality = 'min7';
    else if (rest === '9') quality = 'min9';
    else if (rest === '11') quality = 'min11';
    else if (rest === '6') quality = 'm6';
    else if (rest === 'maj7' || rest === 'M7' || rest === 'Δ' || rest === 'Δ7') quality = 'mM7';
    else quality = 'min' + rest;
  }

  else if (quality.startsWith('M') || quality.startsWith('maj') || quality.startsWith('Δ')) {
    const rest = quality.replace(/^(M|maj|Δ)/, '');
    if (!rest) quality = 'maj';
    else if (rest === '7' || rest === '') quality = 'maj7';
    else if (rest === '9') quality = 'maj9';
    else if (rest === '13') quality = 'maj13';
    else quality = 'maj' + rest;
  }

  if (quality === '7' || quality === 'dom7' || quality === 'dom') quality = 'dom7';
  else if (quality === '9') quality = '9';
  else if (quality === '11') quality = '11';
  else if (quality === '13') quality = '13';

  else if (quality === '7b9') quality = '7b9';
  else if (quality === '7#9') quality = '7#9';
  else if (quality === '7b5') quality = '7b5';
  else if (quality === '7#5') quality = 'aug7';
  else if (quality === 'alt' || quality === '7alt') quality = '7alt';
  else if (quality === 'sus4' || quality === 'sus') quality = 'sus4';
  else if (quality === 'sus2') quality = 'sus2';
  else if (quality === '7sus4' || quality === '7sus') quality = '7sus4';
  else if (quality.includes('sus4') && quality.includes('b9')) quality = 'b9sus4';

  if (!CHORD_INTERVALS[quality]) {
    if (quality.includes('7')) quality = 'dom7';
    else if (quality.includes('min') || quality.includes('m')) quality = 'min';
    else quality = 'maj';
  }

  return { root, quality, bass };
}
