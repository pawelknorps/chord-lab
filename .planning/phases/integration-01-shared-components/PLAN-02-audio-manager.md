---
wave: 1
dependencies: []
files_to_modify:
  - src/core/services/AudioManager.ts (new)
  - src/core/services/index.ts (new)
  - src/context/AudioContext.tsx (modify)
estimated_time: 4-6 hours
---

# Plan: Create Centralized Audio Manager

## Context

Currently, audio is managed independently in each module:
- ChordLab has its own Tone.js setup
- Ear Training has separate audio engines
- Rhythm Architect has metronome and polyrhythm engines
- Each module initializes its own instruments

This leads to:
- **Stuck notes** when switching modules (audio doesn't stop)
- **Memory leaks** from instruments not being disposed
- **Inconsistent sound** across modules
- **Duplicate instrument loading** (larger memory footprint)
- **Overlapping playback** from multiple modules

## Goal

Create a centralized `AudioManager` service that:
1. Manages all audio lifecycle (start, stop, cleanup)
2. Provides a shared instrument pool
3. Automatically stops audio when modules unmount
4. Prevents stuck notes and memory leaks
5. Maintains audio latency < 50ms

## Tasks

### Task 1: Design AudioManager Architecture

<task>
<description>
Define the architecture and API for the centralized AudioManager service.
</description>

<steps>
1. Create `src/core/services/AudioManager.ts`
2. Define AudioManager as a singleton class
3. Design public API:
   ```typescript
   class AudioManager {
     // Initialization
     static getInstance(): AudioManager
     initialize(): Promise<void>
     
     // Instrument management
     loadInstrument(name: string, config: InstrumentConfig): Promise<void>
     getInstrument(name: string): Tone.Instrument | null
     
     // Playback
     playNote(note: string | number, duration?: string, velocity?: number, instrument?: string): void
     playChord(notes: (string | number)[], duration?: string, velocity?: number, instrument?: string): void
     stopNote(note: string | number, instrument?: string): void
     stopAll(): void
     
     // Module lifecycle
     registerModule(moduleId: string): void
     unregisterModule(moduleId: string): void
     
     // Cleanup
     cleanup(): void
     dispose(): void
   }
   ```
4. Define types for InstrumentConfig, AudioSettings, etc.
5. Document the architecture in comments
</steps>

<verification>
- [ ] AudioManager class is defined with singleton pattern
- [ ] Public API is comprehensive and well-typed
- [ ] Architecture supports module-specific cleanup
- [ ] Types are exported for use in other modules
</verification>
</task>

### Task 2: Implement Core Audio Initialization

<task>
<description>
Implement Tone.js initialization and context management.
</description>

<steps>
1. Initialize Tone.js in the constructor:
   - Set up Tone.Transport
   - Configure latency settings (target < 50ms)
   - Set up master volume control
   - Add reverb/effects bus (optional)
2. Implement `initialize()` method:
   - Start Tone.context (requires user interaction)
   - Load default instruments (piano, synth)
   - Set up event listeners
   - Return Promise that resolves when ready
3. Handle browser audio context restrictions:
   - Detect if context is suspended
   - Provide method to resume context
   - Show user prompt if needed
4. Implement error handling:
   - Catch and log initialization errors
   - Provide fallback for unsupported browsers
   - Graceful degradation
</steps>

<verification>
- [ ] Tone.js initializes correctly
- [ ] Audio context starts without errors
- [ ] Latency is < 50ms (test with performance.now())
- [ ] Browser restrictions are handled gracefully
- [ ] Errors are caught and logged appropriately
</verification>
</task>

### Task 3: Implement Instrument Pool

<task>
<description>
Create a shared pool of instruments that can be reused across modules.
</description>

<steps>
1. Create instrument registry (Map<string, Tone.Instrument>)
2. Implement `loadInstrument()`:
   - Check if instrument already loaded
   - Create new instrument with config
   - Connect to master output
   - Store in registry
   - Return Promise when loaded
3. Implement `getInstrument()`:
   - Return instrument from registry
   - Return null if not found
4. Create default instruments:
   - Piano (Tone.Sampler with piano samples)
   - Synth (Tone.PolySynth)
   - Bass (Tone.MonoSynth)
5. Implement instrument disposal:
   - Disconnect from output
   - Dispose Tone.js resources
   - Remove from registry
6. Add instrument preloading:
   - Load commonly used instruments on init
   - Lazy load others on demand
</steps>

<verification>
- [ ] Instruments can be loaded dynamically
- [ ] Instruments are reused across modules
- [ ] Instruments are properly disposed
- [ ] Default instruments load correctly
- [ ] Memory usage is reasonable (check DevTools)
</verification>
</task>

### Task 4: Implement Note Playback

<task>
<description>
Implement methods for playing individual notes and chords.
</description>

<steps>
1. Implement `playNote()`:
   - Accept note as MIDI number or note name (e.g., "C4")
   - Convert MIDI to note name if needed
   - Get instrument (default to piano)
   - Call instrument.triggerAttackRelease(note, duration, time, velocity)
   - Track active notes for cleanup
2. Implement `playChord()`:
   - Accept array of notes
   - Play all notes simultaneously
   - Use Tone.now() for precise timing
   - Track all notes for cleanup
3. Implement `stopNote()`:
   - Stop specific note on specific instrument
   - Remove from active notes tracking
4. Implement `stopAll()`:
   - Stop all active notes on all instruments
   - Clear active notes tracking
   - Stop Tone.Transport if running
5. Add note tracking:
   - Map of active notes per module
   - Allows module-specific cleanup
6. Handle edge cases:
   - Rapid note triggering
   - Overlapping notes
   - Invalid note values
</steps>

<verification>
- [ ] Single notes play correctly
- [ ] Chords play all notes simultaneously
- [ ] Notes can be stopped individually
- [ ] stopAll() stops all audio immediately
- [ ] No stuck notes after playback
- [ ] Rapid triggering doesn't cause glitches
</verification>
</task>

### Task 5: Implement Module Lifecycle Management

<task>
<description>
Track which modules are active and clean up their audio when they unmount.
</description>

<steps>
1. Create module registry (Map<string, ModuleAudioState>)
2. Implement `registerModule()`:
   - Add module to registry
   - Initialize module-specific state
   - Return module ID for tracking
3. Implement `unregisterModule()`:
   - Stop all notes for this module
   - Clean up module-specific resources
   - Remove from registry
4. Create `ModuleAudioState` type:
   - activeNotes: Set<string>
   - instruments: Set<string>
   - scheduledEvents: Tone.Event[]
5. Implement automatic cleanup:
   - When module unregisters, stop its notes
   - Cancel its scheduled events
   - Dispose module-specific instruments (if any)
6. Add cleanup hook for React:
   - `useAudioCleanup(moduleId)` hook
   - Automatically calls unregisterModule on unmount
</steps>

<verification>
- [ ] Modules can register and unregister
- [ ] Module-specific audio stops on unregister
- [ ] No audio plays after module unmounts
- [ ] Switching modules doesn't cause stuck notes
- [ ] React hook works correctly
</verification>
</task>

### Task 6: Integrate with Existing AudioContext

<task>
<description>
Integrate AudioManager with the existing AudioContext provider.
</description>

<steps>
1. Modify `src/context/AudioContext.tsx`:
   - Import AudioManager
   - Initialize AudioManager in provider
   - Expose AudioManager instance via context
   - Add cleanup on unmount
2. Create context value:
   ```typescript
   {
     audioManager: AudioManager,
     isReady: boolean,
     initialize: () => Promise<void>
   }
   ```
3. Add initialization state:
   - Track if AudioManager is initialized
   - Show loading state if needed
   - Handle initialization errors
4. Provide convenience hooks:
   - `useAudioManager()` - Get AudioManager instance
   - `useAudioCleanup(moduleId)` - Auto cleanup on unmount
   - `useAudioReady()` - Check if audio is ready
5. Maintain backward compatibility:
   - Keep existing context values
   - Gradually migrate to AudioManager
   - Don't break existing modules
</steps>

<verification>
- [ ] AudioContext provides AudioManager instance
- [ ] AudioManager is initialized on mount
- [ ] Hooks work correctly
- [ ] Existing modules still work
- [ ] No breaking changes to existing code
</verification>
</task>

### Task 7: Add Performance Monitoring and Debugging

<task>
<description>
Add tools for monitoring audio performance and debugging issues.
</description>

<steps>
1. Add performance metrics:
   - Track audio latency
   - Count active notes
   - Monitor memory usage
   - Log instrument load times
2. Implement debug mode:
   - Enable via localStorage flag
   - Log all audio events
   - Show active notes in console
   - Display performance metrics
3. Add error tracking:
   - Catch and log all audio errors
   - Track stuck note occurrences
   - Monitor context state changes
4. Create debug panel (optional):
   - Show active modules
   - List active notes
   - Display instrument status
   - Show performance metrics
5. Add automated tests:
   - Test note playback
   - Test cleanup on unmount
   - Test stuck note prevention
   - Test memory leaks
</steps>

<verification>
- [ ] Performance metrics are tracked
- [ ] Debug mode provides useful information
- [ ] Errors are caught and logged
- [ ] Tests pass for core functionality
- [ ] No memory leaks detected
</verification>
</task>

### Task 8: Create Migration Guide and Documentation

<task>
<description>
Document how to migrate existing modules to use AudioManager.
</description>

<steps>
1. Create `AUDIO_MIGRATION.md`:
   - Explain benefits of AudioManager
   - Show before/after code examples
   - List migration steps
   - Common pitfalls and solutions
2. Document AudioManager API:
   - JSDoc comments for all methods
   - Usage examples for each method
   - Best practices
3. Create migration checklist:
   - Remove module-specific Tone.js initialization
   - Replace direct Tone.js calls with AudioManager
   - Add module registration/unregistration
   - Test for stuck notes
   - Verify cleanup on unmount
4. Document testing procedures:
   - How to test for stuck notes
   - How to verify cleanup
   - Performance testing
</steps>

<verification>
- [ ] Migration guide is comprehensive
- [ ] API documentation is clear
- [ ] Examples are helpful
- [ ] Checklist covers all steps
</verification>
</task>

## Success Criteria

- [ ] AudioManager is fully functional
- [ ] Singleton pattern works correctly
- [ ] Instrument pool is efficient
- [ ] Note playback works without glitches
- [ ] Module lifecycle management prevents stuck notes
- [ ] Integration with AudioContext is seamless
- [ ] Performance metrics show latency < 50ms
- [ ] No memory leaks detected
- [ ] Documentation is comprehensive
- [ ] Migration guide is clear

## Files Created/Modified

- `src/core/services/AudioManager.ts` - Main AudioManager class
- `src/core/services/index.ts` - Export AudioManager
- `src/context/AudioContext.tsx` - Modified to provide AudioManager
- `src/hooks/useAudioManager.ts` - Convenience hooks
- `AUDIO_MIGRATION.md` - Migration guide

## Testing Checklist

- [ ] Play single note - works correctly
- [ ] Play chord - all notes play simultaneously
- [ ] Stop note - specific note stops
- [ ] Stop all - all audio stops immediately
- [ ] Switch modules - no stuck notes
- [ ] Rapid clicking - no glitches
- [ ] MIDI input - works correctly
- [ ] Memory usage - no leaks after 100 module switches
- [ ] Latency - < 50ms consistently
- [ ] Error handling - graceful degradation

## Next Steps

After completing this plan:
1. Migrate ChordLab to use AudioManager (PLAN-04)
2. Migrate Ear Training to use AudioManager
3. Migrate Rhythm Architect to use AudioManager
4. Test across all modules for stuck notes

## Notes

- **Critical**: This is the foundation for eliminating stuck note bugs
- Test thoroughly - stuck notes are the #1 user complaint
- Performance is critical - any latency > 50ms is noticeable
- Consider using Web Workers for heavy audio processing (future optimization)
- Ensure compatibility with MIDI input devices
- Handle browser audio context restrictions (autoplay policies)
- Consider adding audio recording capabilities (future feature)
