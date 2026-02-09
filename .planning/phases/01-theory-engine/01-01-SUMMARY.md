# Plan Summary: 01-01 Create Centralized Theory Engine

## What was built

Consolidated music theory logic into `src/utils/theoryEngine.ts`. This engine uses `Tonal.js` to provide context-aware note naming, specifically handling Jazz functional rules for secondary dominants and modal interchange.

## Technical Approach

- Used pitch class analysis to map MIDI notes to functional spellings.
- Implemented specific rules for leading tones in secondary dominants.
- Added parallel minor mappings for modal interchange.

## Key Files Created

- `src/utils/theoryEngine.ts`
- `src/utils/theoryEngine.test.ts`
