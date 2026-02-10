# Integrations

## External Services & APIs

- **None detected**: No explicit AWS, Firebase, Supabase, or other cloud service SDKs found in `package.json`.
- **Local/Browser APIs**: Heavy usage of Web Audio API (via Tone.js) and Web MIDI API.
- **Context Providers**: Custom React Contexts (`AudioContext`, `MidiContext`) manage global state and lifecycle for these APIs.

## Data formats

- **iReal Pro**: `ireal-reader` integration to parse charts locally.
- **MIDI**: `@tonejs/midi` for parsing/generating MIDI files.
- **JSON Standards**: Custom JSON format for jazz standards storage and analysis.

## Internationalization

- **i18next**: Local translation files (`src/utils/languages.json`) handle content localization.

## Machine Learning

- **ml5.js**: Browser-based ML, likely accessing webcam or microphone for input.

## Instruments

- **ToneJS Instruments**: Uses hosted or local sample libraries for playback (Piano, Guitar, Harp).
