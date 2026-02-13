/**
 * Progression context for PawelSonik AI chatbot.
 * Builds compact markdown bundles and prompts for Gemini Nano.
 */

import { RomanNumeralAnalyzer } from '../theory/RomanNumeralAnalyzer';
import { ConceptAnalyzer } from '../theory/ConceptAnalyzer';

/**
 * Builds a compact markdown string for the current PawelSonik progression (key, chords, RN, concepts).
 * Used as context for the local AI prompt.
 */
export function buildProgressionBundle(
  chordSymbols: string[],
  key: string,
  scale: string = 'Major'
): string {
  const keyLine = `Key: ${key}, Scale: ${scale}`;
  if (!chordSymbols || chordSymbols.length === 0) {
    return `${keyLine}\nChords: (none)`;
  }
  const chordsLine = `Chords: ${chordSymbols.join(' | ')}`;
  const rnList = chordSymbols.map((c) => {
    const analysis = RomanNumeralAnalyzer.analyze(c, key);
    return analysis.romanNumeral || '?';
  });
  const rnLine = `RN: ${rnList.join(' | ')}`;
  const analysis = ConceptAnalyzer.analyze(chordSymbols, key);
  const conceptLabels =
    analysis.concepts.length > 0
      ? analysis.concepts.map((c) => c.type.replace(/([A-Z])/g, ' $1').trim()).join(', ')
      : '';
  const conceptsLine = conceptLabels ? `Concepts: ${conceptLabels}` : '';
  const lines = [keyLine, chordsLine, rnLine];
  if (conceptsLine) lines.push(conceptsLine);
  return lines.join('\n');
}

/** Max previous exchanges to include in prompt (keeps token count low). */
const MAX_HISTORY_PAIRS = 2;

/**
 * Builds the full prompt string to send to LocalAgentService.ask().
 * Includes PawelSonik persona hint, current progression bundle, optional history, and user message.
 */
export function buildChordLabPrompt(
  bundle: string,
  userMessage: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
  const preamble =
    'You are helping with a chord progression in PawelSonik. Answer briefly. Be concise. You can explain harmony, suggest continuations or substitutes, and answer questions about the progression.';
  let body = `Current progression:\n${bundle}\n\n`;
  if (history && history.length > 0) {
    const recent = history.slice(-MAX_HISTORY_PAIRS * 2);
    const pairs = recent
      .map((m) => (m.role === 'user' ? `Q: ${m.content}` : `A: ${m.content}`))
      .join('\n');
    body += `Previous:\n${pairs}\n\n`;
  }
  body += `User: ${userMessage}`;
  return `${preamble}\n\n${body}`;
}

/** Regex to match [[TYPE:ACTION:PARAM]] or [[TYPE:ACTION]] command tokens (case-insensitive, optional spaces). */
const COMMAND_REGEX = /\[\[\s*(DRILL|SET|UI)\s*:\s*[^\]]+\]\]/gi;

/**
 * Strips [[DRILL:...]], [[SET:...]], [[UI:...]] tokens from AI response text
 * so they are not shown in PawelSonik chat.
 */
export function stripCommandTokens(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text.replace(COMMAND_REGEX, '').replace(/\s{2,}/g, ' ').trim();
}
