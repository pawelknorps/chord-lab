/**
 * Prompt API (Gemini Nano) - Chrome/Edge built-in AI.
 * Chrome exposes the global LanguageModel (spec); some builds use window.ai.languageModel.
 * @see https://developer.chrome.com/docs/ai/prompt-api
 */
interface PromptApiCapabilities {
  available?: 'readily' | 'after-download' | 'no';
}

interface LanguageModelSession {
  prompt(prompt: string): Promise<string>;
  destroy(): void;
}

/** Legacy / alternate: window.ai.languageModel (e.g. systemPrompt option) */
interface LegacyLanguageModel {
  capabilities(): Promise<PromptApiCapabilities>;
  create(options?: {
    systemPrompt?: string;
    temperature?: number;
    topK?: number;
  }): Promise<LanguageModelSession>;
}

/** Chrome Prompt API: global LanguageModel (initialPrompts, availability()) */
interface PromptApiLanguageModelLike {
  create(options?: {
    initialPrompts?: Array<{ role: string; content: string }>;
    temperature?: number;
    topK?: number;
    expectedInputs?: Array<{ type: string; languages?: string[] }>;
    expectedOutputs?: Array<{ type: string; languages?: string[] }>;
  }): Promise<LanguageModelSession>;
  availability?(options?: object): Promise<string>;
}

declare global {
  interface Window {
    /** Chrome Prompt API (Gemini Nano) - global in supported builds */
    LanguageModel?: PromptApiLanguageModelLike;
    ai?: {
      languageModel?: LegacyLanguageModel;
      canCreateTextSession?: () => Promise<'readily' | 'after-download' | 'no'>;
      createTextSession?: (options?: { systemPrompt?: string }) => Promise<LanguageModelSession>;
    };
  }
}

export {};
