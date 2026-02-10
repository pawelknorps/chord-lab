# v1 Requirements: Jazz Evolution

## Audio & Samples (AUD)
- **AUD-01**: Refactor `useJazzPlayback` to support multi-sample loading for Piano (`C1-C8`) and Bass (`E1-C5`).
- **AUD-02**: Implement per-instrument gain and reverb staging to ensure "mix" clarity.

## Bass Algorithm (BASS)
- **BASS-01**: Implement "Ron Carter" walking logic:
    - Target root on Beat 1.
    - Chromatic approach from above/below on Beat 4.
    - Scalaic/Chordal connectivity on Beats 2 and 3.
- **BASS-02**: Add rhythmic "drops" (octave leaps, triplet ghost notes) at phrase endings.

## Piano Algorithm (PIANO)
- **PIANO-01**: Implement Core Voicing Library:
    - **A/B Type Rootless Voicings** (3, 5, 7, 9).
    - **Red Garland Block Chords** (4-way close + octaves).
    - **Quartal Voicings** (So What chords, 4th stacks).
- **PIANO-02**: Implement Rhythmic "Interaction" events (syncopated hits, Charleston patterns, Anticipations).

## Drum Algorithm (DRUMS)
- **DRUMS-01**: Adaptive Snare/Kick:
    - Snare "chatter" (ghost notes) on off-beats.
    - Snare "accents" that mirror Piano rhythmic hits.
    - Kick "feathering" (consistent low-velocity pulse on 4 on the floor).

## System Architecture (SYS)
- **SYS-01**: Implement a `StyleController` that switches algorithm parameters based on song metadata (Tempo, Jazz style).
- **SYS-02**: Legacy Fallback: Toggle in UI to switch back to the original simpler algorithm.
