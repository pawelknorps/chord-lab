# Testing Strategy

## 🧪 Framework
- **Vitest**: The project uses Vitest for unit and integration testing.

## 📁 Structure
- Tests are typically located alongside the source code with `.test.ts` or `.spec.ts` extensions (WIP).

## 🎯 Current Status
- **Music Theory Logic**: Core utilities in `src/utils/` are the primary candidates for unit tests.
- **Chord Parsing**: `test_chord_parsing.ts` exists in the root for validating chord detection logic.
- **Audio Testing**: Tone.js testing requires a mocked AudioContext or specialized headless testing environment.

## 🛠️ Commands
- `npm test`: Run all tests (WIP).
- `npm run coverage`: Generate coverage reports.
