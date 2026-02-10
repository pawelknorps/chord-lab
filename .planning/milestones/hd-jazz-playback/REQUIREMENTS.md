# HD Jazz Playback - Requirements

## v1 Requirements (Must-Have)

### BASS-01: Quarter-note default
**Status**: Active  
**Priority**: P0  
**Description**: The double bass uses a quarter-note rhythm pattern (one note per beat, pattern `[0, 1, 2, 3]`) as the default for the vast majority of bars.  
**Success Criteria**:
- Default rhythm pattern is exactly `[0, 1, 2, 3]` (four quarter notes per bar).
- Any logic that selects a different pattern must be explicitly gated (see BASS-02) and rare (see BASS-03).

### BASS-02: Tension-gated variations
**Status**: Active  
**Priority**: P0  
**Description**: Non–quarter-note bass patterns (e.g. eighth-note hits or extra attacks) are only allowed when band tension intensity is above a defined threshold.  
**Success Criteria**:
- A single “band tension intensity” value is used (derived from existing tension/activity signals).
- Variations are only considered when this value is above a configurable threshold (e.g. high tension + activity).
- When below threshold, the selected pattern is always `[0, 1, 2, 3]`.

### BASS-03: Variations are rare
**Status**: Active  
**Priority**: P0  
**Description**: When variations are allowed (above tension threshold), they are chosen with low probability so that quarter-note remains the dominant feel.  
**Success Criteria**:
- Probability of choosing a non–quarter-note pattern when above threshold is well below 50% (e.g. ≤ 20–30%).
- In listening tests, bass clearly feels “mostly quarter notes” with occasional color.

### BASS-04: Single place for bass rhythm rules
**Status**: Active  
**Priority**: P1  
**Description**: All logic that decides “quarter-note vs variation” lives in one clear place (e.g. one block or helper in `useJazzBand.ts`) for maintainability.  
**Success Criteria**:
- No scattered magic numbers for thresholds or probabilities; use named constants or a small config.
- Future changes to “when does bass vary?” require editing only this place.

## v2 / Deferred

- **BASS-05**: User-facing control for “bass complexity” or “variation frequency” (optional).
- **BASS-06**: Different variation profiles per style (e.g. Bossa vs Swing) using the same gating rules.

## Out of Scope

- Changing walking bass **note choice** (pitch selection remains in `JazzTheoryService`).
- Adding new instruments or sample sets.
- Modifying non-HD playback (e.g. `globalAudio` simple bass) in this milestone.
