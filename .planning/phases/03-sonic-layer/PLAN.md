---
waves: 3
dependencies: ["Phase 2: The Mastery Tree"]
files_modified: [
    "src/modules/JazzKiller/hooks/useJazzBand.ts",
    "src/modules/JazzKiller/components/PremiumMixer.tsx",
    "src/modules/JazzKiller/JazzKillerModule.tsx",
    "src/core/audio/globalAudio.ts",
    "src/modules/JazzKiller/components/NoteWaterfall.tsx"
]
---

# Phase 3 Plan: The Sonic Layer (Revised)

Focus: Moving from prototype audio to high-fidelity practice with studio stems and a premium mixing environment. Note: Cloudflare Pages hosting will be used for assets instead of R2.

## Wave 1: Premium Mixer & Master Chain
*Goal: Provide studio-grade control over the practice environment.*

- <task id="W1-T1">Create `PremiumMixer` component with glassmorphic sliders for Bass, Drums, and Piano tracks.</task>
- <task id="W1-T2">Implement **Master Audio Chain** in `globalAudio.ts` with a Limiter and Master EQ to prevent clipping and ensure consistent volume.</task>
- <task id="W1-T3">Add **"Solo" and "Mute"** functionality per track in the mixer to allow "Minus-one" practice modes.</task>
- <task id="W1-T4">Integrate the new Mixer into the `JazzKillerModule` UI.</task>

## Wave 2: Note Waterfall Visualization
*Goal: Visual transcription layer for better polyphonic understanding.*

- <task id="W2-T1">Implement `NoteWaterfall` Canvas component that renders MIDI events from the active band engine (`useJazzBand`).</task>
- <task id="W2-T2">Sync Waterfall timing with `Tone.Transport` for frame-perfect alignment with the audio output.</task>
- <task id="W2-T3">Add **Harmonic Coloring**: Notes are colored based on their function in the current chord (Roots = Blue, 3rds = Green, 7ths = Red).</task>

## Wave 3: Tone Analysis & Polish
*Goal: Signal processing feedback on instrument quality.*

- <task id="W3-T1">Implement `ToneSpectrumAnalyzer` to visualize harmonic overtones of the Mic input in real-time.</task>
- <task id="W3-T2">Add **"Acoustic Feedback"** widget that rates the user's tone (Warmth vs. Brightness) using FFT analysis.</task>
- <task id="W3-T3">Performance audit: Ensure low-latency audio and 60fps visuals remain stable under load.</task>

## Verification
- [ ] No clipping/distortion when all tracks are at 100% volume (Limiter check).
- [ ] Note Waterfall maintains 60fps during intense up-tempo sections.
- [ ] Mute/Solo buttons correctly state-manage the `Tone.Sampler` channels.
