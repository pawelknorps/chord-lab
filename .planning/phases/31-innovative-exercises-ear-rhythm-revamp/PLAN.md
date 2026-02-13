---
waves: 5
files:
  - src/modules/InnovativeExercises/config/innovativeExerciseDifficulty.ts
  - src/modules/InnovativeExercises/services/gamificationService.ts
  - src/modules/InnovativeExercises/ai/exerciseGenerator.ts
  - src/modules/InnovativeExercises/components/visualizations/IntonationHeatmapV2.tsx
---
# PLAN: Innovative Exercises - Ear & Rhythm Revamp

## Objective

To significantly revamp the "Innovative Exercises" module by introducing a granular difficulty system, new exercise variations, gamification elements, improved visualizations, and AI-driven exercise generation. This is a large-scope project, broken down into multiple waves for incremental implementation.

## Wave 1: Granular Difficulty System

### Tasks
- <task id="W1-T1">Create a new file `src/modules/InnovativeExercises/config/innovativeExerciseDifficulty.ts` to define the new granular difficulty system. This will replace the existing `innovativeExerciseLevels.ts`.</task>
- <task id="W1-T2">Design and implement a data structure for a 1-100 difficulty scale for each exercise, with functions to map the difficulty level to specific parameters (e.g., tempo, progression complexity).</task>
- <task id="W1-T3">Refactor the exercise components to use the new difficulty system. The `getParamsForLevel` function will be replaced with a new `getParamsForDifficulty` function.</task>

### Verification
- The new difficulty system is implemented and allows for a 1-100 difficulty range.
- The exercises correctly adapt their parameters based on the selected difficulty.

## Wave 2: New Exercise Variations

### Tasks
- <task id="W2-T1">Implement a new variation for the "Voice-Leading Maze" exercise that uses different chord progressions from the `progression-library`.</task>
- <task id="W2-T2">Implement a new variation for the "Swing Pocket" exercise that introduces different swing ratios.</task>
- <task id="W2-T3">Update the UI to allow the user to select these new variations.</task>

### Verification
- The new exercise variations are implemented and functional.
- The difficulty system correctly adjusts the parameters of the new variations.

## Wave 3: Gamification - Scoring and Achievements

### Tasks
- <task id="W3-T1">Create a `gamificationService.ts` to handle the logic for scoring and achievements.</task>
- <task id="W3-T2">Implement a more detailed scoring system that provides feedback on accuracy, timing, and consistency.</task>
- <task id="W3-T3">Design and implement an achievement system with at least 5 achievements related to the innovative exercises.</task>
- <task id="W3-T4">Create UI components to display the new score feedback and the unlocked achievements.</task>

### Verification
- The new scoring system is implemented and provides detailed feedback.
- The achievement system is functional and achievements are correctly awarded.
- The UI components for scoring and achievements are implemented.

## Wave 4: Improved Visualizations

### Tasks
- <task id="W4-T1">Create a new component `IntonationHeatmapV2.tsx` with an improved visualization for the "Intonation Heatmap" exercise, showing a real-time scrolling graph of pitch over time.</task>
- <task id="W4-T2">Refactor the "Intonation Heatmap" exercise to use the new visualization component.</task>
- <task id="W4-T3">Improve the visualization for the "Swing Pocket" exercise to show the user's timing relative to the beat with more detail.</task>

### Verification
- The new `IntonationHeatmapV2.tsx` component is implemented and provides a better user experience.
- The "Swing Pocket" visualization is improved and gives more detailed feedback.

## Wave 5: AI Exercise Generation (Proof of Concept)

### Tasks
- <task id="W5-T1">Create a new file `src/modules/InnovativeExercises/ai/exerciseGenerator.ts`.</task>
- <task id="W5-T2">Implement a simple proof-of-concept for AI-driven exercise generation. This will focus on generating new chord progressions for the "Voice-Leading Maze" exercise using a rule-based or Markov chain approach.</task>
- <task id="W5-T3">Integrate the exercise generator with the UI, allowing the user to request a new, AI-generated progression.</task>

### Verification
- The AI exercise generator can create new, musically coherent chord progressions.
- The user can request and play through an AI-generated exercise.
