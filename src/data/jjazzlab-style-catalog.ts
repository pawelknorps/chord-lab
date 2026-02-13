/**
 * JJazzLab style catalog — derived from YamJJazzDefaultRhythms (JJazzLab, LGPL v2.1).
 * Used for style registry and UI (e.g. "Choose style" dropdown).
 * Source: legacy_projects/JJazzLab-master/plugins/YamJJazz/.../YamJJazzDefaultRhythms.java
 * @see https://www.jjazzlab.org
 */

export type JJazzLabGenre =
  | "CUBAN"
  | "BOSSA"
  | "CHACHACHA"
  | "MAMBO"
  | "RUMBA"
  | "SALSA"
  | "SAMBA"
  | "CALYPSO"
  | "REGGAE"
  | "DANCE"
  | "FOLK"
  | "BLUES"
  | "SOUL"
  | "RnB"
  | "FUNK"
  | "HIP_HOP"
  | "ROCK"
  | "POP"
  | "JAZZ";

export interface JJazzLabStyleEntry {
  /** Style filename (e.g. BossaNova2.S469.prs) — use as stable id. */
  id: string;
  /** Human-readable name derived from filename. */
  name: string;
  genre: JJazzLabGenre;
  tags: string[];
}

function entry(id: string, genre: JJazzLabGenre, ...tags: string[]): JJazzLabStyleEntry {
  const name = id.replace(/\.[^.]+$/, "").replace(/[._]/g, " ");
  return { id, name, genre, tags };
}

/**
 * Canonical list of JJazzLab default styles (genre + tags) for style registry and search.
 */
export const JJAZZLAB_STYLE_CATALOG: JJazzLabStyleEntry[] = [
  entry("AfroCuban.S730.prs", "CUBAN", "afr", "cuba"),
  entry("BossaNova2.S469.prs", "BOSSA", "bossa", "song-for-my-father"),
  entry("ChaCha.S628.prs", "CHACHACHA", "chach", "cha-ch", "tango"),
  entry("Mambo5.S722.prs", "MAMBO", "mambo", "mereng", "world", "latin"),
  entry("PopRumba.S625.bcs", "RUMBA", "rhumba", "rumba"),
  entry("BigBandSalsa.STY", "SALSA", "salsa"),
  entry("SambaCity213.s460.yjz", "SAMBA", "samba", "brazi", "brasi", "forro", "chorro"),
  entry("Calypso.S354.prs", "CALYPSO", "calyp"),
  entry("HappyReggae.S655.prs", "REGGAE", "reggae"),
  entry("DiscoHouse.S145.prs", "DANCE", "party", "dance", "club", "disco", "house", "garage"),
  entry("Folkball.S702.sty", "FOLK", "folk", "country"),
  entry("BluesRock.S524.sst", "BLUES", "blues"),
  entry("Soul.S199.prs", "SOUL", "soul"),
  entry("SoulR&B.S130.prs", "RnB", "r&b", "rnb"),
  entry("Urban Funk.S066.STY", "FUNK", "funk"),
  entry("ClassicHipHop.S145.prs", "HIP_HOP", "hip"),
  entry("StandardRock.STY", "ROCK", "rock", "heavy", "metal"),
  entry("90'sOrgRockBld.T162.STY", "ROCK", "slow rock", "rock slow", "slow-rock", "rock-slow"),
  entry("RockShuffle.S547.bcs", "ROCK", "rock-triplet", "rock shuffle"),
  entry("Cool8Beat.S737.sst", "POP", "even 8", "8beat", "8-beat", "rock pop", "pop rock", "pop-rock"),
  entry("16beat.S556.yjz", "POP", "even 16", "16beat", "16-beat", "pop bal", "pop bld"),
  entry("PopShuffle1.S552.prs", "POP", "shuffle"),
  entry("6-8ModernBallad.S560.prs", "POP", "12/8", "12-8", "6/8", "6-8"),
  entry("JazzWaltzSlow.S423.prs", "JAZZ", "waltz swing slow", "jazz waltz slow", "waltz slow", "slow waltz"),
  entry("JazzWaltzMed.S351.sst", "JAZZ", "waltz", "waltz swing", "jazz waltz", "footprints"),
  entry("JazzWaltzFast.S499.sty", "JAZZ", "waltz swing fast", "jazz waltz fast", "waltz fast", "slow fast"),
  entry("FastFolkWaltz7.S093.STY", "JAZZ", "waltz straight"),
];

/** Styles by genre for quick filtering. */
export function getStylesByGenre(genre: JJazzLabGenre): JJazzLabStyleEntry[] {
  return JJAZZLAB_STYLE_CATALOG.filter((s) => s.genre === genre);
}

/** Find styles whose id or tags match a search string (case-insensitive). */
export function searchStyles(query: string): JJazzLabStyleEntry[] {
  const q = query.toLowerCase();
  return JJAZZLAB_STYLE_CATALOG.filter(
    (s) =>
      s.id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
  );
}
