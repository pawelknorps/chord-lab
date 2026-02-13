# Phase 12: Walking Bass Engine — Research

## Target Vectors & the "Target & Enclosure" Algorithm (2026 Edition)

To achieve the sophisticated sound of Paul Chambers or Ray Brown, you must stop thinking in "scales" and start thinking in **Target Vectors**.

Top jazz bassists play **teleologically**—every note in the bar is chosen specifically to set up the **Downbeat of the Next Bar**.

Here is the "Target & Enclosure" Algorithm (2026 Edition), which replaces random walking with proven Bebop vocabulary.

---

## Classic Walking Bass Rules (The Old Rules)

The traditional foundation for walking bass—**scales**, **arpeggios**, **stepwise motion**, and **chromatic** approach—remains the vocabulary we build on. The "Pro" strategies (Target & Enclosure, Dominant Drop, etc.) use these same materials in a goal-directed way.

### Scales

- Use the **chord scale** (e.g. Mixolydian on dominant, Dorian on minor) to choose notes that fit the harmony.
- Scale steps (root, 2nd, 3rd, 4th, 5th, 6th, 7th) give a safe, consonant path through the bar.
- **Old rule**: "Stay in the scale of the chord." The Pro approach still uses scale tones for the "path" (Beats 2–3) but prioritizes the **target** (next bar’s root) when choosing Beat 4.

### Arpeggios

- **Chord tones** (root, 3rd, 5th, 7th) are the strongest notes. Walking lines often outline the chord: e.g. Root–3rd–5th–7th or Root–5th–3rd–root.
- **Old rule**: "Arpeggiate the chord." The Pro approach uses arpeggios in Circle of Fifths (e.g. Root–3rd–5th–approach) and Static (Root–5th–6th–5th) strategies.

### Stepwise motion

- Moving by **whole or half step** (scale steps) keeps the line smooth and singable.
- **Old rule**: "Prefer stepwise motion; avoid big jumps." The Pro approach uses stepwise motion especially in **stepwise harmonic motion** (e.g. Cmaj7→Dm7): Beats 2–3–4 form a path (often with enclosure) into the next root.

### Chromatic

- **Chromatic approach**: half-step below or above the target (e.g. B or C# into C). Creates tension that resolves on the downbeat.
- **Old rule**: "Use chromatic notes to approach the next chord tone." The Pro approach makes this explicit: Beat 4 is often a **chromatic leading tone** into the next bar’s root (Ray Brown pattern) or part of an **enclosure** (upper neighbor → lower neighbor → target).

Together, scales + arpeggios + stepwise + chromatic are the "old rules"; the Target & Enclosure algorithm applies them **teleologically** (every note chosen to set up the next bar).

---

## Hybrid Algorithm: "School of Ray Brown" + Target Vectors

The engine uses a **hybrid**: the **principled, rule-based classic** (Ray Brown algorithm) and the **target-vector** strategies (Circle of Fifths, Enclosure, Static).

- **Blend**: With probability `CLASSIC_WEIGHT` (default 0.5) we use the **School of Ray Brown** classic; otherwise we use the full **target-vector** strategies.
- **Classic path (Ray Brown)**: Target-centric, directional, no repetition. See below.
- **Target-vector path**: Circle of Fifths (Ray Brown / Dominant Drop), Stepwise (Enclosure), Static (Ron Carter / Octave Skip).

Tuning: set `CLASSIC_WEIGHT` in `WalkingBassEngine` (0 = always target-vector, 1 = always classic).

---

## The "School of Ray Brown" Algorithm (Principled Classic)

A classic walking line is a **specific path**: it starts at home (Root), picks a direction (Up/Down), and resolves to the next chord. The algorithm is **target-centric** and **geometry-based** (not random flash).

### 1. The 4 Principles

- **Beat 1 is God**: Always play the Root (or 3rd if the chord hasn’t changed). This grounds the band.
- **Beat 4 is the Arrow**: Beat 4 is the **Approach Note** to the next bar’s root. It is calculated **first** (relative to next root).
- **Beats 2 & 3 are the Bridge**: They connect Beat 1 to Beat 4 using **arpeggios** (skips) or **scales** (steps), in a **direction** (up or down).
- **Avoid Repetition**: Never play the same pitch twice in a row (unless specifically pedaling).

### 2. Implementation (Target-Centric)

1. **Beat 1**: Anchor = current root.
2. **Beat 4**: Calculated first. **Approach** = chromatic from above (target+1), chromatic from below (target−1), or 5th of target (pick the 5th closest to Beat 1 for a smooth line).
3. **Beats 2 & 3**: **fillBridge(currentChord, beat1, beat4)**:
   - **Direction**: `isAscending = (beat4 > beat1)`.
   - **Arpeggio** (if distance > 4 semitones): Use 3rd and 5th of current chord in that direction (ascending: 3rd then 5th; descending: 5th then 3rd). Guarantees the line outlines the chord.
   - **Scale steps** (if distance small): Ascending: Root → 2nd → 3rd (start+2, start+4). Descending: Root → 7th → 6th (start−2, start−4).
4. **No repetition**: If any two consecutive notes are equal, nudge by semitone (chromatic neighbor) or octave so the line never repeats the same pitch back-to-back.
5. **Range**: Same as elsewhere (E1–G3); `constrainAndSmooth` applies lower-register preference and phrase contour.

### 3. Why This Works

- **Target-centric**: Beat 4 is chosen first, so the line always resolves clearly.
- **Directional**: The bridge follows “I am going up/down to the approach note,” so the path is logical.
- **Arpeggio logic**: Using 3rd and 5th for the bridge makes the chord sound (e.g. Cmaj7 sounds like C), instead of random chromatic motion.
- **No repetition**: Keeps the line moving and avoids a “stuck” feel.

---

## Additional Rules: Lower Register & Logical Phrases (Counterpoint)

Two extra rules are applied when choosing the octave and contour of the line:

### 1. Prefer lower register

When multiple octave placements are valid (all notes in E1–G3 and reasonably close to the previous bar's last note), the engine **prefers the lower option**. So the line tends to sit in the lower half of the range (E1–B2) rather than climbing into the upper register (C3–G3) unless needed for voice leading. This keeps the bass sounding like a bass and leaves room for piano/comping above.

### 2. Logical phrases that follow the counterpoint

Among valid octave choices, the engine prefers lines that:

- **Smaller leaps**: Lower total interval sum (sum of |note[i+1] − note[i]|), so more stepwise motion and fewer big jumps.
- **Clearer direction**: Fewer direction changes (up→down→up counts as two changes). So contours like "up, up, down" or "down, down, up" are preferred over zigzags.

Together this gives **logical phrases** that move in a coherent way and "follow the counterpoint" (smooth voice leading, clear contour) instead of jumping around randomly.

Implementation: in `constrainAndSmooth`, all valid octave shifts (current, −12, +12) that keep the line in range are scored by: lower average pitch (prefer lower register) + smaller total leap + fewer direction changes. The highest-scoring candidate is used.

---

## Dynamic Swing Engine (2026) — Whole Band

Swing is **tempo-dependent**: slow = deep swing (late "and"); fast = straighter (driving). The band uses a single **GrooveManager** so bass ghost notes and ride "and" land on the same grid.

### 1. Swing ratio by tempo (GrooveManager.getSwingRatio)

- **Slow (&lt;100 BPM)**: 0.68 — deep/heavy "swag"; the "and" is late.
- **Medium (100–150)**: 0.66 — standard triplet (the pocket).
- **Medium-fast (150–220)**: 0.60 — modern/lighter swing.
- **Fast (&gt;220)**: 0.54 — burner, almost straight 8ths.

`Tone.Transport.swing` is set from this ratio so the whole transport follows the groove.

### 2. Off-beat placement (getOffBeatOffsetInBeat)

The "and" of each beat is placed at **ratio × beat duration** from the downbeat. Bass ghost notes and ride cymbal "and" (beats 2 & 4) use this same offset so they **lock** and create a tight pocket.

### 3. Bass articulation (variable duration)

- **Downbeats**: Legato (1.1× quarter) for a fat, connected walk.
- **Ghost/skip notes**: Short (0.3× beat) so the contrast with long notes defines the swing feel.

### 4. Instrument personality (getMicroTiming)

Applied **after** the swing grid:

- **Ride**: Pushes (−10 ms) to drive the band.
- **Snare**: Drags (+20 ms) to widen the beat.
- **Bass**: Lays back (+15 ms) on slow tempos; pushes (−5 ms) on fast.

Final time: `GridTime + SwingOffset + InstrumentPersonality + RandomJitter`.

---

## More Chromatic: Approach Notes, Enclosure, Tension & Release

The engine emphasizes **counterpoint** and **tension–release** by using more chromatic approach notes and enclosures across all strategies.

### Approach notes

- **Chromatic approach**: Half-step below or above the target (e.g. B or C# into C). Used on Beat 4 into the next bar’s root in classic and circle-of-fifths.
- **Double approach**: Beat 3 = approach to the approach note, Beat 4 = approach to target (e.g. … Bb, B → C). Adds extra tension before resolution.
- **Chromatic passing**: Beat 2 or 3 as a chromatic neighbor (e.g. approach to 3rd, then 3rd, then approach to target).

### Enclosure

- **Upper–lower**: Beat 3 = whole step above target, Beat 4 = half step below target → resolve on next bar’s downbeat. Used in classic, circle-of-fifths, and stepwise.
- **Lower–upper**: Beat 3 = half step below, Beat 4 = whole step above (reverse enclosure) for a different tension curve in stepwise.
- **Enclosure of 5th** (static): Root – 4th – 6th – 5th (surround the 5th from above and below).

### Tension and release

- **7th as tension**: Circle-of-fifths uses Root – Octave – 7th – 5th of target (7th pulls toward resolution).
- **Chromatic neighbor**: Static uses Root – 5th – b6 (#5) – 5th (tension on beat 3, release on beat 4).
- **Enclosure** itself is tension (upper/lower neighbors) → release (target on next bar).

Implementation: each strategy (Classic, Circle of Fifths, Stepwise, Static) now includes several patterns; a random roll picks among arpeggio + approach, enclosure, double chromatic, or tension–release variants so the line is more chromatic and follows counterpoint (approach notes, enclosure, clear resolution).

---

### 1. The Core Concept: "The Target Note"

The most important note is **Beat 1 of the NEXT bar** (usually the Root of the next chord).

- **Beat 1 (Current)**: Anchor (Root).
- **Beat 4 (Current)**: The Setup. It must create tension that resolves to the Target.
- **Beats 2 & 3**: The "Path" connecting Anchor to Setup.

### 2. The 3 "Pro" Strategies

We implement three specific movement patterns used by masters:

**The Chromatic Wrap (Enclosure)**: "Surrounding" the target note from above and below.

- Example (Target C): Play D (above), then B (below), then land on C.

**The Dominant Drop**: Jumping down to the low 5th of the target chord on Beat 4.

- Example (Target C): Play G (low) on Beat 4. This is the strongest harmonic movement (V-I).

**The Scalar Run**: Using the "Bebop Scale" (adding a chromatic passing tone) to make the line smooth.

### 3. Implementation: ProBassEngine / WalkingBassEngine

This engine analyzes the **interval between the Current Root and Next Root** to pick the best strategy:

- **Circle of Fifths** (|interval| = 5 or 7): Use **Dominant Drop** (5th of destination on Beat 4) or **Ray Brown** (Root–3rd–5th–Chromatic approach).
- **Stepwise** (|interval| = 1 or 2): Use **Enclosure** (upper neighbor → lower neighbor → target) or scalar run.
- **Static** (same chord): Use **Ron Carter** pedal (Root–5th–6th–5th) or **Octave Skip**.

Range: E1 (28)–G3 (55) for standard 4-string bass / jazz range.

### 4. Why This Sounds Better

**The "Enclosure" (Stepwise Strategy)**:

- Old way: Randomly pick a note near the target.
- New way: Upper Neighbor → Lower Neighbor → Target. This is the specific "Bebop Vocabulary" that ears recognize as "Jazz." It creates a magnetic pull toward the next bar.

**The "Dominant Drop" (Circle Strategy)**:

- Instead of just walking up 1-2-3-4, we play 1-8-b7-5(of next). Playing the 5th of the destination chord on Beat 4 is the strongest way to say "Here comes the resolution!"

### 5. Ghost Note Articulation (The Final Polish)

Paul Chambers often "swallows" notes to make the line propulsive. Apply a **Probability Mask** to velocities:

- **Beat 2 Drop**: Often Beat 2 is played softly (ghosted) to accent Beat 3.
- **The "One" Accent**: Beat 1 is always the loudest.

Implementation uses a "Pro" velocity profile:

```ts
const velocities = [
  1.0,  // Beat 1: Heavy Anchor
  0.6,  // Beat 2: Lighter (Swing feel often ghosts this)
  0.9,  // Beat 3: Secondary Anchor
  0.85  // Beat 4: Driving into next bar
];
```

### 6. Next Step (Optional)

**Tritone Substitution** for the bass: e.g. on G7→Cmaj7, the bass occasionally plays lines based on Db7 instead, creating modern "outside" tension. Can be added as a fourth strategy or variation.

---

## Bass Rhythm Variation ("The Sauce")

Walking bass becomes more organic when occasional rhythmic variations are applied instead of strict quarter notes. Three essential variations and when to use them:

### 1. The Skip (The "And" Anticipation)

- **Standard**: Play on Beat 3.
- **Variation**: Play short on the "and of 2," rest on 3. Pushes the rhythm forward.
- **Logic**: Use when heading toward a strong target (e.g. root of next chord). Beat 4 already functions as approach; skipping beat 3 and anticipating on "and of 2" creates forward momentum.
- **Implementation**: Shorten beat 2 to 8n; add ghost/muted note at "and of 2" (Tone time ~`0:1:2` or equivalent for eighth); omit beat 3; beat 4 normal.

### 2. The Rake (Dead Note Triplet)

- **Standard**: Play on Beat 1.
- **Variation**: Two muted ghost notes (triplet feel) leading into Beat 1: *tu-tu-BOM*.
- **Logic**: Use at the start of a new 4-bar phrase or section change. Signals a fresh phrase without changing harmony.
- **Implementation**: Ghost 16t at `0:0:0`; main note at `0:0:1` (or equivalent triplet grid). Technically borrows from end of previous bar.

### 3. The Drop (Space)

- **Standard**: Play 1, 2, 3, 4.
- **Variation**: Omit one beat — e.g. 1, (rest), 3, 4 or 1, 2, (rest), 4.
- **Logic**: Use during high-energy piano moments to let the soloist breathe. Avoid overdoing; ~5% chance per bar.

### Probability Guidelines

- **Skip**: ~15% (don’t overdo).
- **Rake**: ~5% (special effect, phrase start).
- **Drop**: ~5% (breathing room).
- **Standard**: remainder (~75%).

Roll once per bar; mutually exclusive application (e.g. single roll with cumulative thresholds: &lt; SKIP → Skip; &lt; SKIP+RAKE → Rake; &lt; SKIP+RAKE+DROP → Drop; else Standard).

---

## Sample Switch (Critical)

Rhythm variations sound wrong if every note uses the same long-sustain bass sample.

- **Standard note**: Use existing long-decay bass sample (e.g. current `/audio/bass/` samples; release ~0.8s).
- **Ghost / Skip / Rake muted notes**: Use a **muted** or **staccato** sample, OR:
  - If no muted sample exists: **shorten the release envelope** (e.g. ADSR Release = 0.05s) so the note doesn’t ring.
- **Logic**: `event.isGhost === true` → trigger muted sample or same sampler with very short release (e.g. `triggerAttackRelease(note, 0.05, time, velocity)`).

Current codebase: `useJazzBand` uses a single `Tone.Sampler` for bass with `release: 0.8`. No `Bass_Mute.wav` or `Bass_Staccato.wav` in `public/audio/bass/`. **Recommendation**: Implement ghost notes by calling the same sampler with a very short duration (e.g. `"32n"` or `0.05` seconds); optionally add muted/staccato samples later for better tone.

---

## Integration Points

- **WalkingBassEngine**: Currently returns `number[]` (4 MIDI notes). Bass rhythm variation can sit **above** this: engine still generates the 4-note line; a **BassRhythmVariator** converts `number[]` + bar index (and optional context) into **BassEvent[]** (time, duration, velocity, isGhost?, note).
- **useJazzBand**: Today it schedules one bass note per beat (`line[beat]`, duration `"4n"`). To support variations, the band must **schedule a list of BassEvents** for the bar (at bar start), each with its own time, duration, velocity, and ghost flag (which drives sample choice or release).
- **Tone.js time**: Use transport time strings (e.g. `"0:0:0"`, `"0:1:2"`) or seconds relative to bar start; schedule all events for the current bar in one pass (e.g. `time + Tone.Time(event.time).toSeconds()`).

---

## Optional Context (Future)

- **Skip**: Slightly increase probability when `nextChord` root is a strong resolution (e.g. I or V).
- **Rake**: Increase probability when `barIndex % 4 === 0` (start of 4-bar phrase) or on section boundaries.
- **Drop**: Increase probability when piano density is high (e.g. `pianoDensity > 0.8`) so the bass leaves space.

Initial implementation can use fixed probabilities; context-aware tuning can follow.
