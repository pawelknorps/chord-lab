# Resonance AI Requirements

## v1: The Radial Tonal Grid (Experimental UI)

### GRID-01: Visual Layout
- **Requirement**: Create a radial UI where the Tonic (1) is in the absolute center.
- **Spectrum**: Other intervals (b2 through 7) should be placed on concentric circles or at distances representing their relative stability.
- **Visuals**: Use colors that represent "tonal color" (e.g., bright for Major, dark for Minor, sharp/electric for dissonant intervals).

### GRID-02: Interactive Logic
- **Requirement**: Tapping a "node" on the grid plays that interval relative to the established tonal center.
- **Feedback**: Sustained visual resonance (glow/pulse) when a node is active.

### GRID-03: Functional Drill Mode
- **Requirement**: Establish a key center (cadence) then prompt the user to find a specific function (e.g., "Find the Dominant").
- **Success Criteria**: Correct node hit triggers a "resolution" animation and sound.

## v2: Generative Context & AI Integration

### GEN-01: Gemini Nano MIDI Seeds
- **Requirement**: Use Gemini Nano to generate a structured JSON object containing a 4-bar progression and a target melody note.
- **Prompting**: Structured prompts that define "Genre", "Key", and "Function".

### GEN-02: Multi-Timbral Rendering
- **Requirement**: Use existing SoundFont/Sampler architecture to play the generative seeds with variety (Piano, Rhodes, Wurli, Synth).

## v3: Vocal Harmonic Mirror

### VOC-01: High-Precision Pitch Detection
- **Requirement**: Connect the Universal Mic Handler to the Resonance engine.
- **Accuracy**: Detection must be stable enough for students to sing into the app and get instant confirmation.

### VOC-02: Calibrated Feedback
- **Requirement**: Provide "too sharp" or "too flat" feedback relative to the target functional note.

## Out of Scope
- Wearable haptics.
- Multi-user collaboration.
- Complex rhythmic dictation (for now).
