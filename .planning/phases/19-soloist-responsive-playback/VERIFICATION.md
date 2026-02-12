# Phase 19: Soloist-Responsive Playback — Verification

## Manual Test Steps

1. **Toggle off (regression)**  
   Turn Soloist-Responsive off. Load a standard, start playback. Confirm band behaviour is unchanged from Phase 18 (place-in-cycle, song style, activity from BPM/tune intensity).

2. **Toggle on, no mic**  
   Turn Soloist-Responsive on. Do not enable mic (or disable mic). Start playback. Band should behave as if soloist is resting (normal or slightly increased backing); no errors.

3. **Toggle on, play busily**  
   Turn Soloist-Responsive on. Enable mic. Start playback. Play busily into the mic (sustained notes or many notes). Band should leave more space (sparser comping, lighter drums/bass) than with toggle off.

4. **Toggle on, rest**  
   With toggle on and mic on, stop playing for a few bars. Band should fill (normal or slightly higher density).

5. **Toggle discoverable**  
   Toggle control is visible in Mixer or band panel with a clear label (e.g. “Soloist-Responsive” or “Call-and-Response”).

## Success Criteria

- REQ-SRP-01..08 satisfied (see milestone REQUIREMENTS.md).
- No regression when toggle off.
- Existing band rules (place-in-cycle, song style, trio context) remain the single source of behaviour; soloist-responsive only steers the activity value.
