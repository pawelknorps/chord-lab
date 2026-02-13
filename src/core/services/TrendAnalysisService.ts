import { PerformanceSegment } from '../../modules/ITM/types/PerformanceSegment';
import { localAgent } from './LocalAgentService';

export class TrendAnalysisService {
    /**
     * Analyzes the last few sessions to find growth patterns using Gemini Nano.
     */
    static async analyzeGrowth(sessions: PerformanceSegment[]): Promise<string> {
        if (sessions.length < 2) {
            return "Keep practicing to unlock long-term growth insights!";
        }

        const recentSessions = sessions
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .reverse();

        const statsContext = recentSessions.map((s, i) => {
            const date = new Date(s.timestamp).toLocaleDateString();
            return `Session ${i + 1} (${date}): Accuracy ${s.overallScore}%, BPM ${s.bpm}, Standard: ${s.standardId}`;
        }).join('\n');

        const prompt = `
You are a master jazz educator analyzing a student's progress over their last ${recentSessions.length} sessions.

### SESSION DATA (Oldest to Newest)
${statsContext}

### TASK
Provide a concise "Sensei's Observation" (max 2 sentences) on their growth trend. 
Specifically look for:
1. Significant accuracy jumps.
2. Consistency across different sessions.
3. Encouragement based on their persistence.

Keep it professional, encouraging, and technical (reference specific standards if helpful).
`.trim();

        try {
            return await localAgent.ask(prompt);
        } catch (err) {
            console.error('Trend analysis failed:', err);
            return "Your progress is being carefully watched by the masters. Keep swinging!";
        }
    }
}
