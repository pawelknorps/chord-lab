export interface Lesson {
    id: string;
    title: string;
    description: string;
    concept: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    completed: boolean;
    content: LessonStep[];
}

export interface LessonStep {
    type: 'text' | 'interactive' | 'quiz';
    content: string; // Markdown text
    widget?: 'UpperStructureWidget' | 'NeoRiemannianWidget' | 'NegativeHarmonyWidget';
    chordToPlay?: string[];
    targetAnswer?: string;
}

const STORAGE_KEY = 'chord-lab-education-progress';

export function saveProgress(lessonId: string) {
    const saved = getProgress();
    if (!saved.includes(lessonId)) {
        saved.push(lessonId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
}

export function getProgress(): string[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

export const LESSONS: Lesson[] = [
    {
        id: 'module-1',
        title: 'Epistemological Foundations',
        description: 'Transition from functional labeling to structural hearing. Learn to perceive "gravity" and "color".',
        concept: 'Module I',
        difficulty: 'Advanced',
        completed: false,
        content: [
            {
                type: 'text',
                content: `## 1.1 Beyond Functional Recognition
        
The pedagogy of jazz education typically progresses through a linear sequence: identification of intervals, recognition of triad qualities, and the functional analysis of diatonic progressions (ii-V-I). For the adept musician, however, this functional framework often becomes a constraint rather than a tool.

The professional jazz composer and improviser must transition from identifying labels to perceiving **structural gravity** and **coloristic weight**. 

This module outlines a rigorous methodology for this transition, moving from the functional syntax of the Great American Songbook into the non-functional, symmetrical, and polytonal languages of post-1960s jazz.`
            },
            {
                type: 'text',
                content: `## 1.2 The Physiology of Aural Internalization

True mastery requires the integration of "inner hearing" (audiation) with tactile execution. The ear training protocols detailed herein are designed to bypass the intellectual labeling process ("that is a major third") and establish a direct neural pathway between the auditory cortex and the instrument.

We will focus on **"Singing the Architecture"**: vocalizing specific guide-tone lines and upper structures against static or moving roots.`
            }
        ]
    },
    {
        id: 'module-2',
        title: 'Vertical Color & Superimposition',
        description: 'Master the "Upper Structure Triad" system. Hear complex chords as simple triads over bass notes.',
        concept: 'Module II',
        difficulty: 'Advanced',
        completed: false,
        content: [
            {
                type: 'text',
                content: `## 2.1 The Upper Structure Triad System

Bill Dobbins’ approach to harmony posits that complex jazz chords are best understood as simple triads superimposed over foreign bass notes. This reduces cognitive load.

**The Dominant Aggregate**
The dominant chord is the most fertile ground for upper structures. The advanced ear must learn to identify not just "an altered dominant," but the specific flavor of alteration dictated by the upper triad.

Use the interactive tool below to explore the distinct "Gravities" of different upper structures over a C7 Shell.`
            },
            {
                type: 'interactive',
                content: `### Interactive: The Dominant Aggregate
        
Select a triad to hear its color against the C7 shell. Notice the "rub" of the tritone and the specific extensions generated.`,
                widget: 'UpperStructureWidget'
            }
        ]
    },
    {
        id: 'module-4',
        title: 'Transformational Geometries',
        description: 'Neo-Riemannian Theory for the modern jazz composer. PLR operations and the Tonnetz.',
        concept: 'Module IV',
        difficulty: 'Expert',
        completed: false,
        content: [
            {
                type: 'text',
                content: `## 4.1 The PLR Operations

For the modern jazz composer, functional analysis (ii-V-I) fails to explain the logic of chromatic mediant shifts. Neo-Riemannian Theory (NRT) offers a transformational map for these movements based on **parsimonious voice leading**.

**The Primary Transformations:**
- **P (Parallel)**: Major <-> Minor (C Major <-> C Minor). Keeps 5th and Root; moves 3rd.
- **L (Leading-Tone)**: Major <-> Minor (C Major <-> E Minor). Root moves semitone to become Leading Tone.
- **R (Relative)**: Major <-> Minor (C Major <-> A Minor). 5th moves whole tone to become Root.

Use the pad below to explore these transformations.`
            },
            {
                type: 'interactive',
                content: '### Interactive: Neo-Riemannian Pad',
                widget: 'NeoRiemannianWidget'
            }
        ]
    },
    {
        id: 'module-5',
        title: 'The Negative Harmony Mirror',
        description: 'Invert the gravitational tendencies of a key using the Axis of Symmetry.',
        concept: 'Module V',
        difficulty: 'Expert',
        completed: false,
        content: [
            {
                type: 'text',
                content: `## 5.1 The Axis of Symmetry

Every key has a "positive" (overtone) and "negative" (undertone) side. To find the negative equivalent of a chord, one must reflect it across the Axis of Symmetry.

**Calculation**: The axis is the midpoint between the Tonic (1) and the Dominant (5). In C Major, this is E / Eb.

## 5.2 Negative Cadences
In traditional harmony, G7 resolves to C via the leading tone (B->C).
In Negative Harmony, we invert G7 to **Fm6** (or D half-dim). This resolves to C by "pulling down" (Ab->G). This is the **Minor Plagal Cadence**.

Use the tool below to reflect standard functional chords into their negative counterparts.`
            },
            {
                type: 'interactive',
                content: '### Interactive: Negative Mirror',
                widget: 'NegativeHarmonyWidget'
            }
        ]
    }
];
