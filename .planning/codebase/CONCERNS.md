# Technical Concerns & Debt

## ⚖️ Scalability
- **Large Assets**: The `public` directory contains thousands of files (MIDI recordings). Managing the index (`midi_index.json`) is critical for performance.
- **Lazy Loading**: While route-based lazy loading is implemented, some modules are still heavy due to large theoretical dictionaries or 3D assets.

## 🎵 Audio Latency & Scheduling
- **Tone.js scheduling**: There are known issues with scheduling events inside scheduled callbacks. Centralizing the transport management could alleviate this.
- **Instrument Loading**: Loading multiple high-quality SoundFonts can cause initial UI jank.

## 🎹 MIDI & Theory
- **Enharmonic Complexity**: Correctly identifying whether to use flats or sharps across various keys and secondary dominants is a complex logic that needs robust testing.
- **Web MIDI Access**: Handling brownout/permissions for Web MIDI in different browsers.

## 🧩 Architectural Debt
- **Module Isolation**: Some modules share logic via `src/utils` which is good, but they sometimes have redundant state that could be simplified via a shared store.
- **Legacy Projects**: The `legacy_projects` folder contains unrelated codebases that increase the project's disk footprint and could lead to path confusion if not explicitly ignored.

## 🛠️ Infrastructure
- **CommonJS vs ESM**: The project is strictly ESM, but some library dependencies or local tools (like GSD) might require `require()` workarounds (`.cjs`).
