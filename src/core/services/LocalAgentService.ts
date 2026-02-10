/**
 * Singleton for Gemini Nano (window.ai / LanguageModel).
 * Uses one long-lived session; for theory/note-specific Q&A (e.g. Chord Lab Progression Assistant),
 * prefer per-request sessions via jazzTeacherLogic (generateJazzLesson / generateLessonFromPracticeContext)
 * to avoid context drift. Optional: call resetSession() periodically (e.g. every N requests) to create a fresh session.
 */
export class LocalAgentService {
    private static instance: LocalAgentService;
    private session: any = null;
    private requestCount = 0;
    /** After this many requests, session is destroyed and recreated on next ask(). Set 0 to disable. */
    private static readonly RESET_AFTER_REQUESTS = 8;

    static getInstance() {
        if (!LocalAgentService.instance) {
            LocalAgentService.instance = new LocalAgentService();
        }
        return LocalAgentService.instance;
    }

    async isAvailable(): Promise<boolean> {
        const w = window as Window & { LanguageModel?: unknown; ai?: { languageModel?: unknown } };
        return !!w.LanguageModel || !!(w.ai?.languageModel);
    }

    async initialize() {
        if (!await this.isAvailable()) {
            console.warn('Gemini Nano (LanguageModel / window.ai) not available');
            return false;
        }

        try {
            const w = window as Window & {
                LanguageModel?: { create(opts?: { initialPrompts?: Array<{ role: string; content: string }> }): Promise<{ prompt(s: string): Promise<string>; destroy(): void }> };
                ai?: { languageModel?: { create(opts?: { systemPrompt?: string }): Promise<{ prompt(s: string): Promise<string>; destroy(): void }> } };
            };
            const systemPrompt = 'You are a jazz mentor. Provide concise, actionable advice for improvisation.';
            if (w.LanguageModel?.create) {
                this.session = await w.LanguageModel.create({
                    initialPrompts: [{ role: 'system', content: systemPrompt }],
                });
            } else if (w.ai?.languageModel?.create) {
                this.session = await w.ai.languageModel.create({ systemPrompt });
            }
            return !!this.session;
        } catch (e) {
            console.error('Failed to init agent:', e);
            return false;
        }
    }

    async ask(question: string): Promise<string> {
        if (LocalAgentService.RESET_AFTER_REQUESTS > 0 && this.requestCount >= LocalAgentService.RESET_AFTER_REQUESTS) {
            this.dispose();
            this.requestCount = 0;
        }
        if (!this.session) {
            await this.initialize();
        }
        if (!this.session) return 'Agent unavailable. Using pre-baked lessons.';

        try {
            this.requestCount++;
            return await this.session.prompt(question);
        } catch (e) {
            return 'Error: ' + (e as Error).message;
        }
    }

    /** Force a new session on next ask(); use to avoid context drift. */
    resetSession(): void {
        this.dispose();
        this.requestCount = 0;
    }

    dispose() {
        if (this.session?.destroy) {
            this.session.destroy();
        }
        this.session = null;
    }
}

export const localAgent = LocalAgentService.getInstance();
