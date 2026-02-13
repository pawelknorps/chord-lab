---
phase: 22.1
name: The "Studio" Polish (Priority High)
milestone: .planning/milestones/studio-polish/
waves: 3
dependencies: [
  "Phase 22: Trio Hi-Fi Mixer (parallel bus in globalAudio)",
  "globalAudio.ts, NoteWaterfall.tsx"
]
files_likely_modified: [
  "src/core/audio/globalAudio.ts",
  "public/worklets/jazz-compressor-processor.js",
  "src/modules/JazzKiller/components/NoteWaterfall.tsx"
]
---

# Studio Polish – Execution Plan (Phase 22.1)

**Phase Goal**: When a user puts on headphones, the app must **sound like a mastered record, not a MIDI file** ($29/mo justification). Deliver: parallel compression 70/30 with 8:1 fast-attack wet bus, Drum Bus +2 dB @ 12 kHz, Master ~-14 LUFS, and Note Waterfall at 60fps decoupled from audio ticks.

**Success Criteria**: REQ-STUDIO-01..06 satisfied; no regression on mute/solo/volume.

---

## Wave 1: Parallel Compression Bus (NY Trick)

**Goal**: DryBus and WetBus with 70% dry / 30% wet; WetBus uses Worklet Compressor 8:1, fast attack.

<task>
  <id>STUDIO-01</id>
  <title>Set 70/30 dry/wet blend in globalAudio</title>
  <description>
    In globalAudio.ts, set parallel dry gain to 0.7 and add an explicit wet-path gain of 0.3 so the blended sum is 70% dry and 30% wet. Use PARALLEL_DRY_GAIN = 0.7 (or equivalent) when Studio Polish / Pro Mix is enabled; add a Gain node on the wet path (after compressor or worklet) with gain 0.3. Ensure both paths sum into parallelSumGain and mute/solo/volume behaviour is unchanged.
  </description>
  <acceptance>Audible blend is ~70 dry / 30 wet; no regression on mute/solo/volume.</acceptance>
  <files>src/core/audio/globalAudio.ts</files>
</task>

<task>
  <id>STUDIO-02</id>
  <title>Worklet Compressor 8:1, fast attack</title>
  <description>
    In tryUseJazzCompressorWorklet(), pass processorOptions with ratio: 8 and attack: 0.005 (or ≤5 ms). In public/worklets/jazz-compressor-processor.js ensure the processor accepts ratio and uses it. For the Tone.Compressor fallback in initAudio(), set ratio to 8 and attack to 0.005 so wet path is heavy NY-style in both code paths.
  </description>
  <acceptance>Wet path uses 8:1 ratio and fast attack (≤5 ms); audibly punchy when blended with dry.</acceptance>
  <files>src/core/audio/globalAudio.ts, public/worklets/jazz-compressor-processor.js</files>
</task>

<task>
  <id>STUDIO-03</id>
  <title>Verify parallel bus topology and REQ-STUDIO-01/02/03</title>
  <description>
    Confirm DryBus and WetBus both receive trio sum; WetBus goes through Worklet (or Tone) Compressor; dry and wet gains are 0.7 and 0.3; sum feeds existing master chain. Update STATE.md checklist for Phase 1.
  </description>
  <acceptance>REQ-STUDIO-01, REQ-STUDIO-02, REQ-STUDIO-03 satisfied; STATE.md updated.</acceptance>
  <files>.planning/milestones/studio-polish/STATE.md</files>
</task>

---

## Wave 2: Air Band and Auto-Leveling (LUFS)

**Goal**: Drum Bus +2 dB @ 12 kHz; Master output ~-14 LUFS.

<task>
  <id>STUDIO-04</id>
  <title>Drum Bus high-shelf +2 dB @ 12 kHz</title>
  <description>
    In globalAudio.ts, set drumsAirBand (Tone.Filter high-shelf at 12 kHz) gain to 2 (REQ-STUDIO-04). Currently gain is 3; change to 2 so "Air" band matches Studio Polish spec.
  </description>
  <acceptance>Drums bus has +2 dB @ 12 kHz; audibly more air/definition without being harsh.</acceptance>
  <files>src/core/audio/globalAudio.ts</files>
</task>

<task>
  <id>STUDIO-05</id>
  <title>Master limiter targeting -14 LUFS</title>
  <description>
    Implement master output leveling so that typical playback (trio + user) measures approximately -14 LUFS (within ~1 dB). Add a gain node before masterLimiter and set gain so that when measured with an external LUFS meter the output is ~-14 LUFS; optionally implement a short-term LUFS meter and adjust gain periodically. Ensure no clipping (limiter ceiling remains).
  </description>
  <acceptance>With typical playback, master output measures ~-14 LUFS (±1 dB); no clipping.</acceptance>
  <files>src/core/audio/globalAudio.ts</files>
</task>

<task>
  <id>STUDIO-05-VERIFY</id>
  <title>Update STATE for Wave 2</title>
  <description>
    Mark REQ-STUDIO-04 and REQ-STUDIO-05 complete in STATE.md; note verification method for LUFS.
  </description>
  <acceptance>STATE.md Phase 2 checklist updated.</acceptance>
  <files>.planning/milestones/studio-polish/STATE.md</files>
</task>

---

## Wave 3: Visualizer Interpolation (60fps Note Waterfall)

**Goal**: Note Waterfall runs at 60fps independent of audio/Transport ticks.

<task>
  <id>STUDIO-06</id>
  <title>Decouple Note Waterfall from Transport time</title>
  <description>
    In NoteWaterfall.tsx, stop using Tone.Transport.seconds for the animation time base. When a note is pushed via onNoteEvent, store startTime using wall-clock time (e.g. performance.now() / 1000 or a ref updated each rAF). In the animate() loop, use the same wall-clock time for "now" so that age = now - note.startTime is driven by display refresh, not Transport. Keep note list and layout logic unchanged; only the time base for scroll position becomes independent of Transport.
  </description>
  <acceptance>Waterfall scroll is smooth at 60fps; no visible hitches when audio or Transport is busy; REQ-STUDIO-06 satisfied.</acceptance>
  <files>src/modules/JazzKiller/components/NoteWaterfall.tsx</files>
</task>

<task>
  <id>STUDIO-06-VERIFY</id>
  <title>Verify 60fps and update STATE</title>
  <description>
    Visually verify waterfall under normal load; confirm 60 updates/s or smooth animation. Update STATE.md Phase 3 checklist.
  </description>
  <acceptance>STATE.md Phase 3 complete; verification noted.</acceptance>
  <files>.planning/milestones/studio-polish/STATE.md</files>
</task>

---

## Verification Summary

| Requirement | Success criterion |
|-------------|-------------------|
| REQ-STUDIO-01 | DryBus and WetBus topology; trio feeds both; sum to master; mute/solo/volume unchanged. |
| REQ-STUDIO-02 | WetBus uses Worklet Compressor 8:1, fast attack (≤5 ms). |
| REQ-STUDIO-03 | Blend 70% dry / 30% wet audibly. |
| REQ-STUDIO-04 | Drum Bus high-shelf +2 dB @ 12 kHz. |
| REQ-STUDIO-05 | Master ~-14 LUFS; no clipping. |
| REQ-STUDIO-06 | Note Waterfall 60fps; decoupled from audio ticks; no hitches under load. |

**Next**: Run `/gsd-execute-phase 22.1` to execute waves in order.
