# Project: Rhythm Section Overhaul

## Vision
Transform the existing Rhythm section into a premium, gamified, and highly effective training module. The goal is to provide a "Swiss/Minimalist" interface that is not only beautiful but also pedagogically sound, guiding users from novice to pro through progressive difficulty tiers.

## Core Value
*   **Effective Learning:** Exercises adapt to user skill, ensuring optimal challenge.
*   **Engagement:** Gamification (XP, streaks, scores) keeps users motivated.
*   **Aesthetics:** A stunning, clean interface that invites interaction.

## High-Level Requirements
*   **Visuals:** Unified Swiss/Minimalist design language.
*   **Gamification:** Universal scoring and progression across all modules.
*   **Functionality:** Audio engine stability (auto-stop), bug fixes (ghost notes), and deeper interactive features (tapping, dictation).

## Key Decisions
| Decision | Rationale |
| :--- | :--- |
| **Tone.js for Audio** | Already in use, robust enough for web-based rhythm. |
| **Zustand for State** | Simple, effective global state for XP/Streaks (already in use). |
| **Component-Level Engines** | Keep engine logic close to components but ensure cleanup on unmount/tab switch. |
Note: The user disliked the Swiss/Minimalist refactor of ChordLab. Reverted to Classic layout.
