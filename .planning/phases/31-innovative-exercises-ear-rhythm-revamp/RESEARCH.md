# Research: Innovative Exercises - Ear & Rhythm Revamp

This document outlines the research required for the revamp of the "Innovative Exercises" module, focusing on the five areas selected by the user.

## 1. Granular Difficulty

### Current Implementation

The current difficulty is handled by a `innovativeExerciseLevels.ts` file, which defines 3 levels for each exercise. The levels are mapped to specific parameters like tempo, key, or progression ID.

### Proposed Improvement

A more flexible and granular difficulty system is needed. Instead of 3 discrete levels, we could use a continuous difficulty score (e.g., 0.0 to 1.0) or a larger number of levels (e.g., 1 to 100).

### Research Tasks

- Analyze the parameter mapping in `innovativeExerciseLevels.ts` for each exercise.
- Design a new data structure to represent a continuous or multi-level difficulty setting.
- Research interpolation techniques to map a difficulty score to the various exercise parameters (e.g., linear interpolation, exponential scaling).
- Investigate how to update the `getParamsForLevel` function to work with the new difficulty system.

## 2. New Exercise Variations

### Current Implementation

There are six distinct exercises. Each exercise is a separate React component with its own logic.

### Proposed Improvement

Create new variations of the existing exercises to increase the content and keep the user engaged.

### Research Tasks

- Analyze the code for each of the six exercises to understand their internal logic and how they are parameterized.
- Brainstorm and document new variations for each exercise. For example:
    - **Voice-Leading Maze**: Add support for different chord progressions (e.g., minor ii-V-I, circle of fifths).
    - **Swing Pocket**: Introduce different swing ratios, or exercises based on other feels (e.g., shuffle, latin).
    - **Ghost Note**: Use different scales (e.g., pentatonic, blues) or allow the user to input their own licks.
- For each new variation, define the necessary parameters and how they will be controlled by the new difficulty system.

## 3. Gamification

### Current Implementation

The current system has a basic scoring mechanism and progress tracking (XP).

### Proposed Improvement

Introduce a more comprehensive gamification system to increase user motivation and engagement.

### Research Tasks

- Research gamification best practices in popular educational apps like Duolingo, Khan Academy, and music learning apps like Yousician or Melodics.
- Design a scoring system that provides more detailed feedback on accuracy, timing, and consistency.
- Design an achievement system with a set of unlockable badges for completing specific challenges (e.g., "Master of Swing", "Perfect Intonation").
- Design a leaderboard system (e.g., weekly high scores for each exercise).
- Investigate the technical requirements for implementing these features, including data storage (in the user's profile or a separate store) and UI components.

## 4. Improved Visualizations

### Current Implementation

The exercises have basic visualizations, some using SVG and `framer-motion`.

### Proposed Improvement

Enhance the visualizations to provide more detailed, intuitive, and aesthetically pleasing feedback.

### Research Tasks

- Review the current visualization for each exercise and identify their limitations.
- Sketch or prototype new visualization ideas. For example:
    - **Intonation Heatmap**: A real-time scrolling graph of pitch over time, with colored zones for in-tune, sharp, and flat.
    - **Swing Pocket**: A visual representation of the beat, with markers for the user's onsets, showing whether they are ahead or behind the beat.
    - **Call and Response**: A side-by-side comparison of the target rhythm and the user's rhythm, possibly using a piano roll or a waveform-like display.
- Research SVG animation techniques or other libraries that could be used to implement these visualizations. The project already uses `framer-motion`, which is a good candidate.

## 5. AI Exercise Generation

### Current Implementation

The AI (Gemini Nano) is used to recommend exercises from a predefined list.

### Proposed Improvement

Use AI to generate new and personalized exercises on the fly.

### Research Tasks

- Define the scope of the AI generation. Start with a simple goal, such as generating new chord progressions for the "Voice-Leading Maze" exercise.
- Research procedural generation techniques for music. For this project, a good starting point would be to use music theory rules and probabilistic models (e.g., Markov chains) to generate content that is musically coherent.
- Investigate how to integrate the generation logic with Gemini Nano. The AI could be used to guide the generation process based on the user's progress and goals. For example, the AI could decide to generate a progression with a specific chord that the user is struggling with.
- Propose a phased implementation plan, starting with a simple rule-based generator and gradually adding more AI-driven capabilities.
