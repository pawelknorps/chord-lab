/**
 * Shared AI (Gemini Nano / Prompt API) availability detection.
 * Used by AiAssistantBanner, AiAssistantSidebar, and any feature that needs to know
 * if the browser supports the built-in language model.
 *
 * Chrome Prompt API: LanguageModel.availability() returns
 * "unavailable" | "downloadable" | "downloading" | "available" (and possibly "readily" in some builds).
 */

export type AiAvailabilityStatus = 'supported' | 'unsupported';

const PROMPT_API_OPTS = {
  expectedInputs: [{ type: 'text' as const, languages: ['en'] as const }],
  expectedOutputs: [{ type: 'text' as const, languages: ['en'] as const }],
};

const LEGACY_OPTS = { languages: ['en'] as const };

declare global {
  interface Window {
    LanguageModel?: {
      availability?(opts?: object): Promise<string>;
      create?(opts?: object): Promise<unknown>;
    };
    ai?: {
      languageModel?: {
        capabilities(): Promise<{ available?: string }>;
      };
    };
  }
}

/** Returns true only when the API reports explicitly "unavailable". */
function isUnavailable(avail: unknown): boolean {
  if (typeof avail !== 'string') return false;
  return avail === 'unavailable';
}

/**
 * Check if the built-in AI (Gemini Nano / Prompt API) is available in this browser.
 * Resolves to 'supported' when the model is available, downloadable, or downloading;
 * 'unsupported' when the API reports unavailable or is missing.
 */
export async function checkAiAvailability(): Promise<AiAvailabilityStatus> {
  const w = typeof window !== 'undefined' ? window : undefined;
  if (!w) return 'unsupported';

  // Chrome Prompt API: window.LanguageModel (or navigator in some builds)
  const LM = w.LanguageModel ?? (typeof navigator !== 'undefined' && (navigator as { languageModel?: typeof w.LanguageModel }).languageModel);

  if (LM) {
    try {
      if (typeof LM.availability === 'function') {
        // Try with Prompt API expected inputs/outputs first
        let result: string | undefined;
        try {
          result = await LM.availability(PROMPT_API_OPTS);
        } catch {
          try {
            result = await LM.availability(LEGACY_OPTS);
          } catch {
            result = await LM.availability?.();
          }
        }
        return isUnavailable(result) ? 'unsupported' : 'supported';
      }
      // LM exists but no availability: treat as supported if create exists (session will fail later if not)
      if (typeof LM.create === 'function') return 'supported';
    } catch (e) {
      console.warn('AI availability check failed', e);
      // Some builds expose create but availability throws; treat as supported so UI shows AI option
      if (LM && typeof LM.create === 'function') return 'supported';
    }
  }

  // Legacy window.ai.languageModel
  if (w.ai?.languageModel) {
    try {
      const capabilities = await w.ai.languageModel.capabilities();
      return capabilities?.available === 'no' ? 'unsupported' : 'supported';
    } catch (e) {
      console.warn('AI capabilities check failed', e);
    }
  }

  return 'unsupported';
}
