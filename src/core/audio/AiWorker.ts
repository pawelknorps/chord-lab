import { PerformanceSegment } from '../../modules/ITM/types/PerformanceSegment';

/**
 * AiWorker: Asynchronous AI Pipeline (Worker B)
 * Handles heavy processing of PerformanceSegments and preparing prompts for Gemini Nano.
 * Note: Actual window.ai calls may need to happen on the main thread if unavailable in workers.
 */

self.onmessage = (e) => {
    const { type, data } = e.data;

    if (type === 'analyze') {
        const segment = data as PerformanceSegment;
        const analysis = analyzePerformance(segment);
        const prompt = generatePrompt(segment, analysis);

        self.postMessage({ type: 'analysis_complete', data: { analysis, prompt } });
    }
};

function analyzePerformance(segment: PerformanceSegment) {
    const averageAccuracy = segment.overallScore;

    // Identify different types of weak spots
    const hotspots = segment.measures.map(m => {
        const noteCount = m.notes.length;
        const accuracy = m.accuracyScore;

        let issueType: 'none' | 'pitch' | 'timing' | 'density' | 'lost' = 'none';
        if (accuracy < 60) {
            if (noteCount > 8) issueType = 'density'; // Too busy/cluttered
            else if (noteCount === 0) issueType = 'lost'; // Silence
            else issueType = 'pitch'; // Missing targets
        }

        return {
            measureIndex: m.measureIndex + 1,
            accuracy,
            noteCount,
            issueType,
            chords: m.chords
        };
    }).filter(h => h.issueType !== 'none');

    const totalNotes = segment.measures.reduce((acc, m) => acc + m.notes.length, 0);

    // Calculate consistency (variance in accuracy)
    const accuracies = segment.measures.map(m => m.accuracyScore);
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const variance = accuracies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / accuracies.length;
    const consistency = Math.max(0, 100 - Math.sqrt(variance));

    return {
        averageAccuracy,
        hotspots: hotspots.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5),
        totalNotes,
        consistency
    };
}

function generatePrompt(segment: PerformanceSegment, analysis: any) {
    const hotspotsText = analysis.hotspots.map((h: any) =>
        `- Bar ${h.measureIndex} (${h.chords.join(' ')}): ${h.issueType === 'density' ? 'Too many notes, unclear phrasing' : h.issueType === 'lost' ? 'Missed this section entirely' : 'Inaccurate pitch/targeting'}`
    ).join('\n');

    return `
You are a elite jazz mentor (style: Barry Harris/Hal Galper). Analyze this performance on "${segment.standardId}" in ${segment.key} at ${segment.bpm} BPM.

### STATS
- Overall Accuracy: ${analysis.averageAccuracy.toFixed(1)}%
- Phrasing Consistency: ${analysis.consistency.toFixed(1)}%
- Total Notes: ${analysis.totalNotes}

### DETECTED HOTSPOTS
${hotspotsText || 'No specific hotspots detected. Great control!'}

### TASK
Provide a "Sandwich Technique" critique:
1. One strength (e.g. consistency or general flow).
2. One specific area for improvement based on the HOTSPOTS above, referencing the chords if possible.
3. A concrete "Barry Harris" style advice for next time (e.g. "Focus on the 3rd of the dominant", "Use half-step approach notes").

### CONSTRAINTS
- Max 3 short sentences.
- Professional, encouraging, but honest.
- Reference bar numbers.
    `.trim();
}
