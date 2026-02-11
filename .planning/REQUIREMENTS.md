# ITM Requirements (2026 Roadmap)

## Phase 1: The "Feedback" Engine

### REQ-FB-01: Guided Practice Sessions

- **Requirement**: Implement "Guided Mode" where Gemini Nano narrates a 15-minute routine for a specific song.
- **Components**: Scales (5 mins), Guide Tones (5 mins), Soloing (5 mins).

### REQ-FB-02: Active Scoring Logic

- **Requirement**: Use pitch detection to calculate an "Accuracy Score" (0-100%) in real-time.
- **Bonus**: Implement "Target Note mastery" bonuses (hitting 3rds and 7ths on downbeats).

### REQ-FB-03: Nano-Powered Critique

- **Requirement**: Post-session analysis by Gemini Nano identifying specific strengths and weaknesses (e.g., "Consistently flat on the Bridge's II-V").

### REQ-FB-04: High-Performance Pitch Engine

- **Requirement**: Implement a WASM-based pitch detector (Pitchy v3 or CREPE) in an Audio Worklet.
- **Performance**: Use `SharedArrayBuffer` for zero-latency communication with the React UI.
- **Input Quality**: Enable `voiceIsolation` constraints on microphone streams to filter out practice room noise.

## Phase 2: The "Mastery Tree"

### REQ-MT-01: Skill-Based Tagging
- **Requirement**: Categorize 1,300+ standards by harmonic complexity (Diatonic, Secondary Dominants, Modal Interchange, etc.).

### REQ-MT-02: The Progress Map
- **Requirement**: Create a visual tree (Duolingo style) where students must "Pass" a song at specific BPM/Accuracy thresholds to unlock the next.

### REQ-MT-03: Key Cycles (Rollins Routine)
- **Requirement**: Automate "Mastery" tracking across multiple keys (e.g., must master in C, F, Bb, Eb to "Pass").

## Phase 3: The "Sonic" Layer

### REQ-SL-01: Dynamic Mixer
- **Requirement**: 3-track faders for Aebersold Stems (Drums, Bass, Piano).
- **Functionality**: Allow soloing/muting specific instruments for targeted practice.

### REQ-SL-02: Visual Transcription
- **Requirement**: Real-time "Note Waterfall" showing the shapes of jazz licks as they are played.

### REQ-SL-03: Tone Matching
- **Requirement**: Analyze mic input spectrum to detect tone quality (e.g., "honking" saxophone or "muddy" guitar).

## Phase 4: Cloud & Community

### REQ-CC-01: Teacher Dashboard
- **Requirement**: Implementation of "Classrooms" via Supabase where teachers can monitor student progress (BPM, Heatmaps).

### REQ-CC-02: Lick Sharing
- **Requirement**: Allow students to publish/subscribe to Lick formulas from the Lick Converter.

### REQ-CC-03: Mobile PWA
- **Requirement**: Ensure full PWA compatibility for offline practice room use.

## Technical Priorities
1. **High**: Pitch-to-Theory Sync (Turns app from book into teacher).
2. **Medium**: Gemini Nano Hint Loop (Ear training "AHA!" moments).
3. **Medium**: Cloudflare R2 Audio Hosting (Fast stem loading).
4. **Low**: Visual Geometry (p5.js aesthetics).
