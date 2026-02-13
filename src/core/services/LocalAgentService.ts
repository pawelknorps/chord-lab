import { PerformanceSegment } from '../../modules/ITM/types/PerformanceSegment';

/**
 * Singleton for Gemini Nano (window.ai / LanguageModel).
 */
export class LocalAgentService {
    private static instance: LocalAgentService;
    private session: any = null;
    private requestCount = 0;
    private aiWorker: Worker | null = null;
    /** After this many requests, session is destroyed and recreated on next ask(). Set 0 to disable. */
    private static readonly RESET_AFTER_REQUESTS = 8;

    static getInstance() {
        if (!LocalAgentService.instance) {
            LocalAgentService.instance = new LocalAgentService();
        }
        return LocalAgentService.instance;
    }

    private getWorker(): Worker {
        if (!this.aiWorker) {
            this.aiWorker = new Worker(new URL('../audio/AiWorker.ts', import.meta.url), { type: 'module' });
        }
        return this.aiWorker;
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
            const systemPrompt = 'You are a master jazz educator (style: Barry Harris / Hal Galper). Provide concise, technical, yet encouraging advice based on performance data.';
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

    /**
     * Highly isolated analysis: prepares prompt in Worker B, then prompts Nano in Main thread.
     */
    async analyzePracticeSession(segment: PerformanceSegment): Promise<string> {
        const worker = this.getWorker();

        return new Promise((resolve) => {
            const handleMessage = async (e: MessageEvent) => {
                const { type, data } = e.data;
                if (type === 'analysis_complete') {
                    worker.removeEventListener('message', handleMessage);
                    // Actual AI call on main thread (small task)
                    const critique = await this.ask(data.prompt);
                    resolve(critique);
                }
            };
            worker.addEventListener('message', handleMessage);
            worker.postMessage({ type: 'analyze', data: segment });
        });
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
        if (this.aiWorker) {
            this.aiWorker.terminate();
            this.aiWorker = null;
        }
    }
}

export const localAgent = LocalAgentService.getInstance();
