export class LocalAgentService {
    private static instance: LocalAgentService;
    private session: any = null;

    static getInstance() {
        if (!LocalAgentService.instance) {
            LocalAgentService.instance = new LocalAgentService();
        }
        return LocalAgentService.instance;
    }

    async isAvailable(): Promise<boolean> {
        return 'ai' in window && 'languageModel' in (window as any).ai;
    }

    async initialize() {
        if (!await this.isAvailable()) {
            console.warn('window.ai not available');
            return false;
        }

        try {
            const ai = (window as any).ai;
            this.session = await ai.languageModel.create({
                systemPrompt: 'You are a jazz mentor. Provide concise, actionable advice for improvisation.'
            });
            return true;
        } catch (e) {
            console.error('Failed to init agent:', e);
            return false;
        }
    }

    async ask(question: string): Promise<string> {
        if (!this.session) {
            await this.initialize();
        }
        if (!this.session) return 'Agent unavailable. Using pre-baked lessons.';

        try {
            return await this.session.prompt(question);
        } catch (e) {
            return 'Error: ' + (e as Error).message;
        }
    }

    dispose() {
        if (this.session?.destroy) {
            this.session.destroy();
        }
        this.session = null;
    }
}

export const localAgent = LocalAgentService.getInstance();
