# Integrations

## External Services & APIs

- **Supabase**: Backend for auth and data. Used via `@supabase/supabase-js`; client in `src/core/supabase/client.ts`. Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. When either is missing or URL invalid, a no-op mock client is used (no real SDK calls). `.env.example` uses `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — code expects `VITE_SUPABASE_ANON_KEY`; align env var names for new setups.
- **Local/Browser APIs**: Web Audio API (via Tone.js), Web MIDI API (`@types/webmidi`). Custom contexts: `AudioContext`, `MidiContext`, `AuthContext`.

## Data Formats

- **iReal Pro**: `ireal-reader` for parsing charts locally.
- **MIDI**: `@tonejs/midi` for parsing/generating MIDI.
- **JSON Standards**: Custom JSON for jazz standards (e.g. `src/modules/JazzKiller/utils/standards.json`).

## Internationalization

- **i18next**: Local translation files and `src/utils/i18n` for content localization.

## Machine Learning

- **ml5.js**: Browser-based ML (e.g. input devices).
- **ONNX (SwiftF0)**: `onnxruntime-web` for neural pitch detection in workers.

## PWA

- **Vite PWA**: `vite-plugin-pwa` with `registerType: 'autoUpdate'`; manifest and assets configured.
