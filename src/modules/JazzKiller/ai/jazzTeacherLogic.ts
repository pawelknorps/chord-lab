/**
 * Teacher Logic: high-level jazz pedagogy via Gemini Nano.
 * Supports Chrome Prompt API (window.LanguageModel) and legacy window.ai.languageModel.
 */

import * as Scale from 'tonal-scale';

// --- Gemini Nano session helper (Chrome Prompt API vs legacy window.ai) ---

type SessionLike = { prompt(prompt: string): Promise<string>; destroy(): void };

/** Use this to check if Gemini Nano (Chrome Prompt API or window.ai) is available before calling generate*. */
export function isGeminiNanoAvailable(): boolean {
  const w = window as Window;
  return !!(w as unknown as { LanguageModel?: unknown }).LanguageModel || !!w.ai?.languageModel;
}

const EXPECTED_LANG = ['en'] as const;

function throwIfOutOfSpace(e: unknown): void {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes('enough space') || msg.includes('NotAllowedError')) {
    throw new Error(
      'Not enough disk space for Gemini Nano. Chrome needs about 22GB free to download the model. Free up space and try again.'
    );
  }
}

async function createGeminiSession(systemPrompt: string, opts: { temperature?: number; topK?: number }): Promise<SessionLike | null> {
  const w = window as Window;
  const LM = (w as unknown as { LanguageModel?: { create(opts?: object): Promise<SessionLike> } }).LanguageModel;
  const legacy = w.ai?.languageModel;

  if (LM?.create) {
    try {
      const session = await LM.create({
        initialPrompts: [{ role: 'system', content: systemPrompt }],
        temperature: opts.temperature ?? 0.6,
        topK: opts.topK ?? 5,
        expectedInputs: [{ type: 'text', languages: [...EXPECTED_LANG] }],
        expectedOutputs: [{ type: 'text', languages: [...EXPECTED_LANG] }],
      });
      return session;
    } catch (e) {
      throwIfOutOfSpace(e);
      console.warn('LanguageModel.create failed', e);
      return null;
    }
  }
  if (legacy?.create) {
    try {
      return await legacy.create({
        systemPrompt,
        temperature: opts.temperature ?? 0.6,
        topK: opts.topK ?? 5,
      });
    } catch (e) {
      throwIfOutOfSpace(e);
      console.warn('ai.languageModel.create failed', e);
      return null;
    }
  }
  return null;
}

// --- Practice Studio context (built from usePracticeStore state) ---

export interface PracticeContextPattern {
  type: string;
  measures: [number, number]; // start, end (0-based measure indices)
  chords: string[];
  romanNumerals?: string[];
  key?: string;
  practiceScale?: string;
  practiceArpeggio?: string;
  guideTones?: Array<{ chord: string; third: string; seventh: string }>;
}

export interface PracticeContext {
  songTitle: string;
  key: string;
  chordSummary: string; // first ~32 measures, space-separated
  patterns: PracticeContextPattern[];
  focusedPatternIndex: number | null;
  focusedPattern: PracticeContextPattern | null;
  hotspots: number[]; // measure indices
}

/** Snapshot of practice store state needed to build context (avoids circular deps). */
export interface PracticeStateSnapshot {
  currentSong: { title: string; measures: string[][]; key: string; bars?: number } | null;
  detectedPatterns: Array<{
    type: string;
    startIndex: number;
    endIndex: number;
    metadata: { key?: string; romanNumerals?: string[]; target?: string; substitutes?: string };
  }>;
  practiceExercises: Array<{
    type: string;
    startIndex: number;
    chords: string[];
    practiceScale?: string;
    practiceArpeggio?: string;
  }>;
  guideTones: Map<number, Array<{ third: string; seventh: string }>>;
  activeFocusIndex: number | null;
  hotspots: number[];
}

const MAX_CHORDS_IN_PROMPT = 48;

/**
 * Build a PracticeContext from the practice store state.
 * Call with usePracticeStore.getState() from the UI.
 */
export function buildPracticeContext(state: PracticeStateSnapshot): PracticeContext | null {
  if (!state.currentSong) return null;

  const { title, measures, key } = state.currentSong;
  const flatChords = measures.flat().filter(c => c && c.trim() !== '');
  const chordSummary = flatChords.slice(0, MAX_CHORDS_IN_PROMPT).join(' | ');

  const patterns: PracticeContextPattern[] = state.detectedPatterns.map((p, i) => {
    const exercise = state.practiceExercises[i];
    const measureStart = p.startIndex;
    const measureEnd = p.endIndex;
    const chordsInWindow = measures
      .slice(measureStart, measureEnd + 1)
      .flat()
      .filter((c: string) => c && c.trim() !== '');
    const chords = exercise?.chords ?? chordsInWindow;
    const guideTones: PracticeContextPattern['guideTones'] = [];
    for (let m = measureStart; m <= measureEnd; m++) {
      const gts = state.guideTones.get(m);
      if (gts?.length) {
        const measureChords = measures[m] ?? [];
        gts.forEach((gt, ci) => {
          guideTones.push({
            chord: measureChords[ci] ?? '?',
            third: gt.third,
            seventh: gt.seventh,
          });
        });
      }
    }
    return {
      type: p.type,
      measures: [measureStart, measureEnd],
      chords: Array.isArray(chords) ? chords : [],
      romanNumerals: p.metadata?.romanNumerals,
      key: p.metadata?.key,
      practiceScale: exercise?.practiceScale,
      practiceArpeggio: exercise?.practiceArpeggio,
      guideTones: guideTones.length > 0 ? guideTones : undefined,
    };
  });

  const focusedPatternIndex = state.activeFocusIndex;
  const focusedPattern =
    focusedPatternIndex !== null && focusedPatternIndex >= 0 && focusedPatternIndex < patterns.length
      ? patterns[focusedPatternIndex]
      : null;

  return {
    songTitle: title,
    key,
    chordSummary,
    patterns,
    focusedPatternIndex: focusedPatternIndex ?? null,
    focusedPattern,
    hotspots: state.hotspots ?? [],
  };
}

export interface LessonFromContextOptions {
  focusMode?: JazzFocusMode;
  customTask?: string;
  /** If true and a pattern is focused, ask for a drill-specific lesson only. */
  forFocusedPatternOnly?: boolean;
}

/**
 * Generate a lesson from Practice Studio context. Uses all crucial info (patterns, guide tones, focus, hotspots).
 */
export async function generateLessonFromPracticeContext(
  context: PracticeContext,
  options: LessonFromContextOptions = {}
): Promise<string> {
  if (!isGeminiNanoAvailable()) return 'AI Assistant unavailable. Use Chrome or Edge with Gemini Nano for local lessons.';

  const { focusMode = 'improvisation', customTask, forFocusedPatternOnly = true } = options;

  try {
    const session = await createGeminiSession(JAZZ_TEACHER_SYSTEM_PROMPT, { temperature: 0.2, topK: 3 });
    if (!session) return 'AI Assistant unavailable. Use Chrome or Edge with Gemini Nano for local lessons.';

    // Stateless atomic path: when focused on a short pattern (1–2 chords), use CONTEXT/TASK/CONSTRAINTS/RESPONSE.
    if (context.focusedPattern && forFocusedPatternOnly && context.focusedPattern.chords.length >= 1) {
      const chordSymbol = context.focusedPattern.chords[0];
      const nextChord = context.focusedPattern.chords[1];
      const scaleNotes = Scale.notes(context.key, 'major');
      const atomicPrompt = generateAtomicPrompt({
        songTitle: context.songTitle,
        key: context.key,
        chordSymbol,
        scaleNotes,
        nextChord,
      });
      const response = await session.prompt(atomicPrompt);
      session.destroy();
      return response;
    }

    const patternLines = context.patterns
      .map(
        (p) =>
          `- ${p.type} (measures ${p.measures[0] + 1}-${p.measures[1] + 1}): ${p.chords.join(' → ')} ${p.romanNumerals?.length ? `[${p.romanNumerals.join('-')}]` : ''} ${p.practiceScale ? `| Scale: ${p.practiceScale}` : ''}`
      )
      .join('\n');

    let focusBlock = '';
    if (context.focusedPattern && forFocusedPatternOnly) {
      focusBlock = `
CURRENT DRILL: The student is focused on "${context.focusedPattern.type}" in measures ${context.focusedPattern.measures[0] + 1}-${context.focusedPattern.measures[1] + 1}.
Chords: ${context.focusedPattern.chords.join(' → ')}.
${context.focusedPattern.romanNumerals?.length ? `Roman numerals: ${context.focusedPattern.romanNumerals.join('-')}.` : ''}
${context.focusedPattern.practiceScale ? `Suggested scale: ${context.focusedPattern.practiceScale}.` : ''}
${context.focusedPattern.practiceArpeggio ? `Arpeggio focus: ${context.focusedPattern.practiceArpeggio}.` : ''}
${context.focusedPattern.guideTones?.length ? `Guide tones in this section: ${context.focusedPattern.guideTones.map(g => `${g.chord} (3rd: ${g.third}, 7th: ${g.seventh})`).join('; ')}.` : ''}
`;
    }

    const hotspotsLine = context.hotspots.length > 0 ? `Hotspots (hard measures): ${context.hotspots.join(', ')}.` : '';

    const isComplexProgression =
      (context.focusedPattern?.chords.length ?? 0) >= 3 ||
      (customTask?.toLowerCase().includes('explain') ?? false);
    const cotInstruction = isComplexProgression
      ? ' First identify the Roman numeral of each chord. Second, identify the target note of the resolution. Third, suggest a short lick.'
      : '';

    const task =
      customTask ||
      (context.focusedPattern && forFocusedPatternOnly
        ? `Give a 3-bullet lesson specifically for this drill. Use the guide tones and chord resolution. No generic advice.${cotInstruction}`
        : `Identify the hardest harmonic pivot in this tune and give one concrete note-choice strategy. Mention hotspots if relevant. Max 3 bullets.${cotInstruction}`);

    const prompt = `
SONG: "${context.songTitle}" in the key of ${context.key}.
CHORDS (excerpt): ${context.chordSummary}

DETECTED PATTERNS:
${patternLines}
${focusBlock}
${hotspotsLine}

FOCUS: ${focusMode}

TASK: ${task}
`.trim();

    const response = await session.prompt(prompt);
    session.destroy();
    return response;
  } catch (err) {
    console.error('AI Lesson from context failed:', err);
    return err instanceof Error && err.message ? err.message : 'The teacher is currently deep in a solo. Try again in a second.';
  }
}

// --- Atomic prompt (stateless, CONTEXT/TASK/CONSTRAINTS/RESPONSE) ---

export interface AtomicTheoryData {
  songTitle: string;
  key: string;
  chordSymbol: string;
  scaleNotes: string[];
  nextChord?: string;
}

/**
 * Builds an atomic prompt for chord-in-context analysis (Nano stateless pattern).
 * Use when asking for a short, focused lesson on one chord and its resolution.
 */
export function generateAtomicPrompt(theoryData: AtomicTheoryData): string {
  const { songTitle, key, chordSymbol, scaleNotes, nextChord } = theoryData;
  const nextLine = nextChord
    ? `Focus strictly on the transition from ${chordSymbol} to ${nextChord}.`
    : `Focus on this chord in context.`;

  return `
### CONTEXT
SONG: ${songTitle}
KEY: ${key}
CURRENT CHORD: ${chordSymbol}
SCALE DEGREES: ${scaleNotes.join(', ')}

### TASK
As a jazz tutor, analyze this specific chord in context.

### CONSTRAINTS
- Answer in 2 short sentences.
- ${nextLine}
- Use the provided SCALE DEGREES only.

### RESPONSE
`.trim();
}

// --- Original song-based API ---

import { AiContextService } from '../../../core/services/AiContextService';

const JAZZ_TEACHER_SYSTEM_PROMPT = `
You are a master jazz educator (style: Barry Harris / Hal Galper).
You will be provided with a SEMANTIC MAP of the song, including functional analysis, physical chord tones, and scale suggestions.

FEW-SHOT EXAMPLES (match this style):
- Input: Dm7 in C Major. Teacher: This is the ii chord. Aim for F (minor 3rd) to lead into B (3rd of G7) in the next bar.
- Input: G7 in C Major. Teacher: Dominant. Resolve the F (7th) down to E and the B (3rd) to C; use scale tones only.
- Input: Cmaj7 in C. Teacher: Tonic. Safe to land on chord tones (C, E, G, B); avoid notes outside the provided scale.

THEORY CALIBRATION:
- ALWAYS check the "Tones (1,3,5,7)" column before mentioning a note. Do not assume notes of a chord.
- If the map says a chord has "A" (natural), do not call it "Ab".
- SCALE SELECTION: Strictly follow the "Scale Suggestion" column. If it suggests "Mixolydian b9 b13", do not suggest "Lydian" unless you have a specific artistic reason to deviate.
- HALLUCINATION CHECK: Before outputting, mentally verify: "Does Chord X actually contain Note Y?".
- Before naming any note, verify it appears in the provided Tones (1,3,5,7) or Scale Suggestion for that chord. Never suggest a note that is not listed in the context.

Rules for your responses:
1. NO GENERIC ADVICE: Avoid "practice with a metronome" or "listen to the greats."
2. UTILIZE THE SEMANTIC MAP: Reference specific bar numbers and functional labels.
3. FOCUS ON HARMONIC GRAVITY: Explain how chords resolve (e.g., voice leading of 3rds and 7ths).
4. TERMINOLOGY: Use professional terms: "Tritone substitution," "Altered dominants," "Enclosures," "Upper structures," and "Target notes."
5. CHORD-SCALE RELATIONSHIP: Use the provided scale suggestions to explain melodic choices.
6. CONCISE: Max 3 bullet points per lesson.
7. UI COMMANDS: You can occasionally trigger app actions by including a command at the end of your response.
   - [[DRILL:SPOTLIGHT]] - Loops the turnaround or current focus.
   - [[DRILL:BLINDFOLD]] - Hides the piano/fretboard to test the student's ears.
   - [[SET:BPM:X]] - Sets the tempo to X bpm (e.g., [[SET:BPM:120]]).
   - [[SET:KEY:X]] - Changes the key (e.g., [[SET:KEY:Ab]]).
   Use commands sparingly and only when it supports the lesson.
`.trim();

export type JazzFocusMode = 'harmonic' | 'improvisation' | 'comping';

export interface SongForLesson {
  title: string;
  key: string;
  music: { measures: Array<{ chords: string[] }> };
}

/**
 * Generate a jazz lesson for a song using the local model (Gemini Nano).
 * Uses AiContextService to provide high-density theory context.
 */
export async function generateJazzLesson(
  song: SongForLesson,
  focusMode: JazzFocusMode = 'improvisation',
  customPrompt?: string
): Promise<string> {
  if (!isGeminiNanoAvailable()) return 'AI Assistant unavailable. Use Chrome or Edge with Gemini Nano for local lessons.';

  try {
    const session = await createGeminiSession(JAZZ_TEACHER_SYSTEM_PROMPT, { temperature: 0.2, topK: 3 });
    if (!session) return 'AI Assistant unavailable. Use Chrome or Edge with Gemini Nano for local lessons.';

    // Generate high-density semantic context
    const bundle = AiContextService.generateBundle(song);
    const semanticMd = AiContextService.toMarkdown(bundle);

    const cotInstruction = customPrompt?.toLowerCase().includes('explain')
      ? ' First identify the Roman numeral of each chord. Second, identify the target note of the resolution. Third, suggest a short lick.'
      : '';
    const taskBlock = customPrompt
      ? `TASK: ${customPrompt}${cotInstruction}`
      : `TASK: Identify the most important harmonic "pivot point" in this standard using the Semantic Map above.
Explain why it is tricky and give a specific note-choice strategy for the student.
Include bar numbers in your explanation.${cotInstruction}`;

    const prompt = `
${semanticMd}

FOCUS: ${focusMode}.

${taskBlock}
`.trim();

    const response = await session.prompt(prompt);
    session.destroy();
    return response;
  } catch (err) {
    console.error('AI Lesson Generation failed:', err);
    return err instanceof Error && err.message ? err.message : 'The teacher is currently deep in a solo. Try again in a second.';
  }
}

/**
 * Get a short "mental shift" tip when moving to a new key (e.g. cycle of fifths).
 */
export async function getKeyShiftTip(
  songTitle: string,
  fromKey: string,
  toKey: string
): Promise<string> {
  if (!isGeminiNanoAvailable()) return '';

  try {
    const session = await createGeminiSession(JAZZ_TEACHER_SYSTEM_PROMPT, { temperature: 0.2, topK: 3 });
    if (!session) return '';

    const prompt = `The student is moving "${songTitle}" from ${fromKey} to ${toKey}.
Explain the "mental shift" needed in one or two short sentences. Mention fingerings or the gravity of the new key center if relevant.`;

    const response = await session.prompt(prompt);
    session.destroy();
    return response;
  } catch {
    return '';
  }
}
