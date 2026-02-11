import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkAiAvailability } from './aiDetection';

describe('aiDetection', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.stubGlobal('window', { ...originalWindow });
    vi.stubGlobal('navigator', { ...originalWindow?.navigator });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns unsupported when LanguageModel and window.ai are missing', async () => {
    (globalThis as any).window = { LanguageModel: undefined, ai: undefined };
    expect(await checkAiAvailability()).toBe('unsupported');
  });

  it('returns supported when LanguageModel.availability returns "available"', async () => {
    (globalThis as any).window = {
      LanguageModel: {
        availability: vi.fn().mockResolvedValue('available'),
      },
    };
    expect(await checkAiAvailability()).toBe('supported');
  });

  it('returns supported when LanguageModel.availability returns "downloadable"', async () => {
    (globalThis as any).window = {
      LanguageModel: {
        availability: vi.fn().mockResolvedValue('downloadable'),
      },
    };
    expect(await checkAiAvailability()).toBe('supported');
  });

  it('returns supported when LanguageModel.availability returns "downloading"', async () => {
    (globalThis as any).window = {
      LanguageModel: {
        availability: vi.fn().mockResolvedValue('downloading'),
      },
    };
    expect(await checkAiAvailability()).toBe('supported');
  });

  it('returns unsupported when LanguageModel.availability returns "unavailable"', async () => {
    (globalThis as any).window = {
      LanguageModel: {
        availability: vi.fn().mockResolvedValue('unavailable'),
      },
    };
    expect(await checkAiAvailability()).toBe('unsupported');
  });

  it('returns supported when LanguageModel has create but availability throws', async () => {
    (globalThis as any).window = {
      LanguageModel: {
        availability: vi.fn().mockRejectedValue(new Error('not implemented')),
        create: vi.fn(),
      },
    };
    expect(await checkAiAvailability()).toBe('supported');
  });

  it('returns unsupported when legacy window.ai.capabilities().available === "no"', async () => {
    (globalThis as any).window = {
      LanguageModel: undefined,
      ai: {
        languageModel: {
          capabilities: vi.fn().mockResolvedValue({ available: 'no' }),
        },
      },
    };
    expect(await checkAiAvailability()).toBe('unsupported');
  });

  it('returns supported when legacy window.ai.capabilities() returns available', async () => {
    (globalThis as any).window = {
      LanguageModel: undefined,
      ai: {
        languageModel: {
          capabilities: vi.fn().mockResolvedValue({ available: 'yes' }),
        },
      },
    };
    expect(await checkAiAvailability()).toBe('supported');
  });
});
