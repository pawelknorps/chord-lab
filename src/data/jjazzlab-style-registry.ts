/**
 * Style registry for playback: re-exports JJazzLab style catalog for use in
 * style registry and "Choose style" UI (Phase 4).
 * @see .planning/milestones/jjazzlab-playback-research/LIBRARY_IMPORT.md
 */

export {
  JJAZZLAB_STYLE_CATALOG,
  getStylesByGenre,
  searchStyles,
  type JJazzLabStyleEntry,
  type JJazzLabGenre,
} from './jjazzlab-style-catalog';

/** Playback-relevant genre ids for a "Choose style" dropdown (Jazz, Bossa, Waltz, etc.). */
export const PLAYBACK_GENRES = [
  'JAZZ',
  'BOSSA',
  'ROCK',
  'POP',
  'BLUES',
  'FUNK',
  'RnB',
  'SAMBA',
  'LATIN',
] as const;
