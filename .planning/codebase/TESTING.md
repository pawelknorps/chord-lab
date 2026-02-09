# Testing Strategy

## Framework
- **Runner**: `vitest`
- **Frontend**: Likely `react-testing-library` (implied by typical Vitest usage, though explicit dependency check needed).

## Test Locations
- **Co-located**: Some tests are found near the code (`src/utils/theoryEngine.test.ts`).
- **Module Tests**: `src/modules/ChordBuildr/test/` suggests some modules have dedicated test folders.

## Coverage
- **Unit Tests**: Logic in `utils` and `core/theory` is the primary target.
- **Component Tests**: Sparse. Focusing on logic engines seems to be the current pattern.
- **E2E**: No Playwright/Cypress config found in root, suggesting no E2E tests currently.

## Mocking
- **Audio**: `tone` often needs mocking in CI environments. `setup.ts` likely handles this.
