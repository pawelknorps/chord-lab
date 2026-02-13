# Phase 12.1 Research: Bass Rhythm Variation

## Rhythmic Variations

### 1. The "Skip" (The "And" Anticipation)
- **Standard**: Beat 3.
- **Variation**: Play short on the "and of 2", rest on 3.
- **Goal**: Push rhythm forward toward a strong target (Root).

### 2. The "Rake" (Dead Note Triplet)
- **Standard**: Beat 1.
- **Variation**: Two muted ghost notes leading into Beat 1 (tu-tu-BOM).
- **Goal**: Signal start of a new 4-bar phrase or section change.

### 3. The "Drop" (Space)
- **Standard**: 1, 2, 3, 4.
- **Variation**: Omit Beat 2 or 3.
- **Goal**: Breathing room for soloist during high-energy piano moments.

## Audio Implementation (Sample Switch)

Since we don't have dedicated muted bass samples, we will use Tone.js sampler envelope manipulation.

- **Standard Note**: `release: 0.8` (current setting in `useJazzBand.ts`).
- **Ghost/Muted Note**:
  - `triggerAttackRelease(note, duration, time, velocity)`
  - For ghost notes: `duration = "16n"` (or similar), `velocity = 0.4 - 0.6`.
  - To simulate "muted" sound, we can temporarily change the sampler's release or just use a very short duration.
  - The user suggests: "If you don't have a muted sample, dramatically shorten the release envelope (ADSR Release = 0.05s)."
  - In Tone.js Sampler, `release` is a property. Changing it globally before `triggerAttackRelease` might affect other notes currently playing.
  - Better approach: Use a separate "Muted Bass" sampler instance or use `triggerAttackRelease` with a very short duration and manually manage the envelope if possible.
  - Actually, `triggerAttackRelease` takes a `duration`. If the sampler's `release` is short, it should work.
  - `bassRef.current` has `release: 0.8`.
  - For ghost notes, we can use `triggerAttackRelease(note, "32n", time, 0.4)`.

## Variator Logic integration

`BassRhythmVariator` will be a pure function/class that transforms the 4-note MIDI array into a `BassEvent[]` array.
The `useJazzBand` hook will:
1. Call `generateWalkingLine` at beat 0.
2. Call `variator.applyVariations` on the resulting line.
3. Use `Tone.Transport.schedule` or similar to play the events at the correct times within the bar, OR just check the events during the `Tone.Loop` (which runs every `4n`).

Wait, the `Tone.Loop` in `useJazzBand` runs every `4n` (quarter note).
```typescript
160:         const loop = new Tone.Loop((time) => {
...
326:         }, "4n");
```
If we have sub-beat variations (like "and of 2" or triplets), we need to schedule them more precisely.

The `BassRhythmVariator` returns times like `"0:1:2"` (triplet grid).
If the loop runs every quarter note, we can schedule events for the *next* quarter note's duration, or just schedule the whole bar at beat 0.

Actually, the current loop handles one beat at a time.
For "and of 2", it happens between beat 1 and 2.
For "rake", it happens leading into beat 0.

Better approach for `useJazzBand` refactor:
- At `beat === 0`, generate the `BassEvent[]` for the *entire bar*.
- Schedule all events in that bar using `Tone.Transport.schedule` or `bassRef.current.triggerAttackRelease(..., time)`.
- However, since `useJazzBand` uses a `Tone.Loop`, we might want to keep the "one beat at a time" logic for reactivity.
- But variations like "rake" and "skip" are intra-beat or sub-beat.

I'll refactor the bass part of `useJazzBand` to:
1. At `beat === 0`, generate `BassEvent[]` for the whole bar.
2. Keep the event list in a ref.
3. During each `4n` loop iteration, play any events that fall within that beat's time window.
   Wait, if an event is at `"0:1:2"`, it's between beat 1 and 2.
   If the loop runs at `beat === 1`, it can schedule the event at `time + Tone.Time("8n").toSeconds()`.

Actually, the user's `BassEvent` has `time: string` like `"0:0:0"`, `"0:1:0"`, `"0:1:2"`.
The second digit is the beat (0-3).
The third digit is the sixteenth note (0-3).
Wait, `"0:1:2"` is beat 1, sixteenth note 2 (the "and").
Wait, triplet grid? The user said `"0:1:2" // Triplet grid "And" roughly`.
Standard Tone.js time notation `bar:beat:sixteenth`.
`0:1:2` is beat 1, 16th note 2.

I'll use `Tone.Time` to convert these to relative seconds from the start of the bar.
When the loop runs at `time` (current beat's starting time), and `beat` is the current beat number, we can find all events where `parts[1] === beat` and schedule them at `time + Tone.Time("0:0:parts[2]").toSeconds()`.
Wait, `parts[2]` in `0:1:2` is 2. `0:0:2` is 2 sixteenth notes (an 8th note). Correct.

## Sample Switch Refinement

```typescript
const isGhost = event.isGhost;
const originalRelease = bassRef.current.release;
if (isGhost) {
   bassRef.current.release = 0.05;
}
bassRef.current.triggerAttackRelease(note, event.duration, scheduleTime, event.velocity);
if (isGhost) {
   // Revert after a short delay? No, Tone.js properties are global.
   // This is tricky if other notes are playing.
}
```
Better: Just use a very short duration in `triggerAttackRelease` and hope the release doesn't ring out too much.
Or, create a second sampler for muted notes.
`bassMutedRef.current = new Tone.Sampler(...)` with same samples but `release: 0.05`.
This is the cleanest "Sample Switch" without actual new samples.
