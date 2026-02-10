/**
 * Zero-shot context wrapper for Gemini Nano. REQ-NANO-08; Phase 7 Step 24.
 * All Nano calls must re-inject ground truth; never assume the model remembers prior context.
 */

type SessionLike = { prompt(prompt: string): Promise<string>; destroy(): void };

function isNanoAvailable(): boolean {
  const w = window as Window & { LanguageModel?: unknown; ai?: { languageModel?: unknown } };
  return !!w.LanguageModel || !!w.ai?.languageModel;
}

async function createOneShotSession(systemPrompt: string): Promise<SessionLike | null> {
  const w = window as Window & {
    LanguageModel?: { create(opts?: object): Promise<SessionLike> };
    ai?: { languageModel?: { create(opts?: { systemPrompt?: string }): Promise<SessionLike> } };
  };
  if (w.LanguageModel?.create) {
    try {
      return await w.LanguageModel.create({
        initialPrompts: [{ role: 'system', content: systemPrompt }],
      });
    } catch (e) {
      console.warn('LanguageModel.create failed', e);
      return null;
    }
  }
  if (w.ai?.languageModel?.create) {
    try {
      return await w.ai.languageModel.create({ systemPrompt });
    } catch (e) {
      console.warn('ai.languageModel.create failed', e);
      return null;
    }
  }
  return null;
}

/**
 * Ask Nano with full context re-injected. One-shot: create session, prompt, destroy.
 * Use for ear hints, rhythm scat, and any Nano call that must not rely on prior turns.
 */
export async function askNano(
  context: object,
  question: string,
  systemPrompt?: string
): Promise<string> {
  if (!isNanoAvailable()) {
    return '';
  }
  const prompt =
    systemPrompt ?? 'You are a concise Jazz Coach. Limit answers to 15 words.';
  const session = await createOneShotSession(prompt);
  if (!session) return '';
  try {
    const fullPrompt = `Context: ${JSON.stringify(context)}. Question: ${question}`;
    const response = await session.prompt(fullPrompt);
    return response?.trim() ?? '';
  } catch (e) {
    console.warn('askNano prompt failed', e);
    return '';
  } finally {
    session.destroy?.();
  }
}

export function isNanoAvailableSync(): boolean {
  return isNanoAvailable();
}
