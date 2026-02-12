# Innovative Interactive Exercises – Requirements

## Phase 17: Innovative Ear Training (Pitch-Centric)

### REQ-IE-01: Ghost Note Match

- **Requirement**: Implement “Ghost Note Match” exercise: app plays a short jazz lick with one note replaced by a “ghost” (white noise or muffled thump). Student plays the missing note on their instrument.
- **2026 Innovation**: Pitch system detects the frequency of the played note. If within **10 cents** of the target, the ghost note is replaced by a high-fidelity sample of a pro player playing that note, producing a “perfect” collaborative lick.
- **Pedagogy**: Teaches **harmonic anticipation**—hearing where the melody must go before it gets there.
- **Tech**: CREPE-WASM / SwiftF0 + Tonal.js; reuse `frequencyToNote` and “perfect intonation” (±10 cents); target note from lick metadata.
- **Acceptance**: One full lick flow: play missing note within 10 cents → ghost swaps to pro sample; lick plays through.

### REQ-IE-02: Intonation Heatmap (Tonal Gravity)

- **Requirement**: Implement “Intonation Heatmap” exercise: app plays a drone (e.g. C pedal). Student plays a slow scale (e.g. C Major) one note at a time.
- **2026 Innovation**: System does not only check “right/wrong.” It maps **tonal gravity**: e.g. Major 3rd slightly “bright,” minor 7th slightly “dark” (jazz expressive intonation).
- **Feedback**: UI displays a heatmap per scale degree. **Green** = Equal Temperament; **Blue** = “Just” intonation (sweet); **Red** = Out of tune.
- **Tech**: Sub-cent pitch accuracy (`frequencyToNote`, cents deviation); map each played note to scale degree and store cents; heatmap visualization component.
- **Acceptance**: Drone + scale produces heatmap (green/blue/red) per scale degree; at least ET vs “out of tune” distinguished.

### REQ-IE-03: Voice-Leading Maze

- **Requirement**: Implement “Voice-Leading Maze” exercise: app shows a chord progression (e.g. ii–V–I). Student must sing or play a continuous line of **guide tones** (3rds and 7ths) that connect chords with the shortest distance.
- **2026 Innovation**: If the student plays a note that is **not** a 3rd or 7th of the current chord, the app **mutes the backing track** until they play a correct connective note.
- **Tech**: Functional decomposition: reuse `GuideToneCalculator` (or equivalent) per chord; compare mic/MIDI pitch to allowed guide tones; transport/playback mute control.
- **Acceptance**: ii–V–I plays; playing a non–guide-tone mutes track; playing correct 3rd/7th keeps or restores track.

---

## Phase 17: Innovative Rhythm Training (Micro-Timing)

### REQ-IR-01: Swing Pocket Validator

- **Requirement**: Implement “Swing Pocket Validator” exercise: app plays a metronome on 2 and 4. Student plays a repetitive 8th-note pattern.
- **2026 Innovation**: System does not only check “on-beat/off-beat.” It analyzes **swing ratio** (e.g. 2:1 triplet vs 3:1 hard swing). UI shows a “Pocket Gauge.”
- **Challenge mode**: App can ask student to “Push” (play slightly ahead) or “Lay Back” (play behind the beat). System detects micro-offset in milliseconds and gives feedback (e.g. “You’re 15ms ahead—cool it for a Count Basie feel”).
- **Tech**: Millisecond time-stamping of onsets (mic or MIDI); compare to grid; compute swing ratio and offset; Pocket Gauge UI.
- **Acceptance**: 8th-note pattern yields swing ratio and pocket gauge; Push/Lay Back challenge reports offset in ms.

### REQ-IR-02: Call and Response Rhythmic Mimicry

- **Requirement**: Implement “Call and Response Rhythmic Mimicry” exercise: a drummer plays a 2-bar syncopated break. Student must scat or play the rhythm back into the mic.
- **2026 Innovation**: System uses **RMS (volume) envelopes** to match the attack of the student’s sound. Feedback: overlay student waveform on top of pro drummer’s waveform so the student can see where their “and of 4” (or other attacks) was late or early.
- **Tech**: Onset detection + RMS envelope from mic; align to reference break; waveform overlay UI (student vs pro).
- **Acceptance**: Student rhythm overlays pro waveform with clear early/late feedback (e.g. “and of 4” late).

### REQ-IR-03: Ghost Rhythm Poly-Meter

- **Requirement**: Implement “Ghost Rhythm Poly-Meter” exercise: app plays a 4/4 beat. Student must play a 3/4 cross-rhythm on their instrument using only one note (e.g. G).
- **2026 Innovation**: System tracks **pitch stability** during the rhythm. If pitch wavers while concentrating on the difficult rhythm, it indicates time is not yet internalized.
- **Win condition**: Keep pitch within **5 cents** variance while successfully hitting the 3-against-4 poly-meter.
- **Tech**: Pitch pipeline (useITMPitchStore / frequencyToNote) for stability; rhythm grid 3 vs 4; scoring combines rhythm accuracy + pitch stability (5-cent band).
- **Acceptance**: 3-over-4 with pitch-stability win (5-cent variance + correct rhythm) is detectable and rewarded.

---

## Summary

| ID | Exercise | Category | Key tech |
|----|----------|----------|----------|
| REQ-IE-01 | Ghost Note Match | Ear | 10¢ match → pro sample |
| REQ-IE-02 | Intonation Heatmap | Ear | Sub-cent, heatmap ET/Just/Out |
| REQ-IE-03 | Voice-Leading Maze | Ear | Guide tones only, mute on wrong |
| REQ-IR-01 | Swing Pocket Validator | Rhythm | Swing ratio, ms offset, Pocket Gauge |
| REQ-IR-02 | Call and Response Mimicry | Rhythm | RMS envelope, waveform overlay |
| REQ-IR-03 | Ghost Rhythm Poly-Meter | Rhythm | 3 vs 4, 5¢ pitch stability |

All exercises are **v1** for the Innovative Exercises milestone. Dependencies: existing pitch pipeline, GuideToneCalculator, transport/timing, and (for rhythm) onset/RMS and high-resolution time.
