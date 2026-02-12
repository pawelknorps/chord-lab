/**
 * Trio context (Phase 18): place-in-cycle and song-style for Creative Jazz Trio Playback.
 * Hybrid: these helpers are additive; band loop and engines keep existing behaviour
 * when trio context is not used. Never replaces the old concept—only upgrades it.
 */

/** Where we are in the tune: drives density, space, and "build" feel. */
export type PlaceInCycle = 'intro' | 'head' | 'solo' | 'out head' | 'ending';

/** Song style tag: drives comping/bass/drums character (Ballad vs Medium vs Latin etc.). */
export type SongStyleTag = 'Ballad' | 'Medium Swing' | 'Up-tempo' | 'Latin' | 'Bossa' | 'Waltz';

/** Measure from getSongAsIRealFormat: optional sectionLabel on first bar of section. */
export interface TrioMeasure {
    sectionLabel?: string;
    endingNumber?: number;
    isFirstOfSection?: boolean;
    isFirstOfEnding?: boolean;
}

/**
 * Resolves current place in the cycle from loop index and optional measure metadata.
 * Used at beat 0 in useJazzBand; engines receive this in addition to existing tuneProgress/activity.
 */
export function getPlaceInCycle(
    currentLoop: number,
    totalLoops: number,
    logicalBar: number,
    planLen: number,
    measure?: TrioMeasure | null
): PlaceInCycle {
    if (totalLoops <= 0) return 'head';

    const isFirstChorus = currentLoop === 0;
    const isLastChorus = currentLoop >= totalLoops - 1;
    const isMiddleChorus = !isFirstChorus && !isLastChorus;

    // Ending: last 2–4 bars of last chorus or measure with ending marker
    if (isLastChorus && measure != null) {
        if (measure.endingNumber != null || measure.isFirstOfEnding) return 'ending';
        const barsFromEnd = planLen - 1 - logicalBar;
        if (barsFromEnd <= 3) return 'ending';
    }

    // Intro: first chorus and first section label suggests intro (e.g. first 8 bars)
    if (isFirstChorus && logicalBar < 8 && measure?.sectionLabel != null) {
        const label = (measure.sectionLabel ?? '').toLowerCase();
        if (label.includes('intro')) return 'intro';
    }

    if (isFirstChorus) return 'head';
    if (isMiddleChorus) return 'solo';
    if (isLastChorus) return 'out head';

    return 'head';
}

/** Song shape from useJazzBand: style (Rhythm), compStyle, TimeSignature, Tempo. */
export interface TrioSongStyle {
    style?: string;
    compStyle?: string;
    TimeSignature?: string;
    Tempo?: number;
}

/**
 * Derives song-style tag from song metadata and optional current BPM.
 * Default: Medium Swing when unknown. Hybrid: existing balladMode in useJazzBand
 * can still be derived from style/compStyle; this tag is the canonical trio upgrade.
 */
export function getSongStyleTag(song: TrioSongStyle | null | undefined, bpm?: number): SongStyleTag {
    if (!song) return 'Medium Swing';

    const style = (song.style ?? '').toLowerCase();
    const compStyle = (song.compStyle ?? '').toLowerCase();
    const combined = `${style} ${compStyle}`;
    const tempo = song.Tempo ?? bpm ?? 120;

    if (combined.includes('ballad') || tempo < 90) return 'Ballad';
    if (song.TimeSignature === '3/4' || combined.includes('waltz')) return 'Waltz';
    if (combined.includes('bossa')) return 'Bossa';
    if (combined.includes('latin') || combined.includes('samba') || combined.includes('mambo')) return 'Latin';
    if (tempo > 190 || combined.includes('up-tempo') || combined.includes('uptempo')) return 'Up-tempo';

    return 'Medium Swing';
}

/**
 * True when band should leave space for the soloist: solo choruses or ballad style.
 * Used to cap density, bias sustain, and reduce bass variation (REQ-TRIO-06).
 */
export function isSoloistSpace(placeInCycle: PlaceInCycle, songStyle: SongStyleTag): boolean {
    return placeInCycle === 'solo' || songStyle === 'Ballad';
}
