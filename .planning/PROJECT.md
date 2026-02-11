# Project: The Incredible Teaching Machine (ITM) 2026

## Vision Statement
Transition from a music theory prototype to a full-scale "Incredible Teaching Machine" by perfecting the **Feedback Loop**—the dynamic cycle where the student plays, the app listens, and the AI corrects. ITM aims to facilitate true mastery through guided routines, active scoring, and AI-powered performance critique.

## Core Value Proposition
- **Adaptive Pedagogy**: Real-time AI analysis (Gemini Nano) that identifies specific student weaknesses and adapts the routine.
- **Measurable Progress**: A gamified "Mastery Tree" that enforces standards and skill acquisition (BPM, Accuracy, Key Cycles).
- **Immersive Performance**: Studio-quality stems and visual feedback that bridge the gap between "practice" and "performance."
- **Social Connectivity**: A shared ecosystem for students and teachers to track progress and share knowledge.

## Key Pillars

### 1. The "Feedback" Engine (Refining Core Logic)
- **Concept**: Solidifying the connection between student instrument and AI.
- **Goal**: Real-time correction and structured guided sessions.
- **Tech**: Pitch detection logic, Gemini Nano for performance analysis, Zustand for scoring state.

### 2. The "Mastery Tree" (Progressive Curriculum)
- **Concept**: A logical, standardized learning path for over 1,300 standards.
- **Goal**: Prevent student overwhelm and ensure deep internalization (Sonny Rollins routine).
- **Tech**: Skill-based tagging, visual progress tree (Duolingo style), unlock milestones.

### 3. The "Sonic" Layer (High-Fidelity Experience)
- **Concept**: Moving from "playable" to "immersive."
- **Goal**: Provide the best-in-class practice environment with high-fidelity stems and visual cues.
- **Tech**: 3-track Dynamic Mixer, Visual Transcription (Note Waterfall), Tone Matching.

### 4. Cloud & Community (The Ecosystem)
- **Concept**: Moving from a local tool to a shared platform.
- **Goal**: Teacher-student synchronization and community lick sharing.
- **Tech**: Supabase for progress tracking, PWA for offline/mobile use.

## Key Decisions

| Decision | Rationale | Status |
| :--- | :--- | :--- |
| **Zustand for Scoring** | Centralized, performant state management for real-time microphone analysis. | [Decided] |
| **Local-First AI** | Use Gemini Nano for instantaneous narration and performance critique feedback. | [Decided] |
| **PWA over Native** | Maximize accessibility on iPads and phones without app store friction. | [Decided] |
| **Supabase for Backend** | Reliable, real-time database for teacher dashboards and lick sharing. | [Proposed] |

## Out of Scope
- Direct VR/AR implementation (focus on PWA first).
- Professional DAW integration (keep it a teaching/practice tool).
- Multitrack recording/exporting (focus on real-time feedback).
