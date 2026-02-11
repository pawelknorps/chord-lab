import type { Concept } from './AnalysisTypes';
import type { CurriculumNodeId } from '../store/useMasteryTreeStore';

export interface XPContribution {
    nodeId: CurriculumNodeId;
    points: number;
    reason: string;
}

export class CurriculumAnalysisService {
    /**
     * Maps ConceptTypes from the analyzer to Mastery Tree Node IDs
     */
    private static CONCEPT_MAP: Record<string, CurriculumNodeId> = {
        'MajorII-V-I': 'major-251',
        'MinorII-V-i': 'minor-tonality',
        'SecondaryDominant': 'secondary-dominants',
        'TritoneSubstitution': 'tritone-sub',
        'ColtraneChanges': 'upper-structures' // Coltrane changes are advanced
    };

    /**
     * Calculates XP rewards based on the patterns detected in a song and the user's performance.
     * 
     * @param detectedPatterns Patterns found in the song
     * @param heatmap Performance data (measure index -> success score)
     * @param songTitle Title of the song for specific node matching
     */
    static calculateXPRewards(
        detectedPatterns: Concept[],
        heatmap: Record<number, number>,
        songTitle: string
    ): XPContribution[] {
        const contributions: XPContribution[] = [];
        const nodePoints: Record<CurriculumNodeId, number> = {};

        // 1. Reward based on detected patterns
        detectedPatterns.forEach(pattern => {
            const nodeId = this.CONCEPT_MAP[pattern.type];
            if (nodeId) {
                // Calculate average success score for the measures this pattern covers
                let patternScore = 0;
                let measureCount = 0;

                for (let i = pattern.startIndex; i <= pattern.endIndex; i++) {
                    patternScore += heatmap[i] || 0;
                    measureCount++;
                }

                // If they played it well (at least some points), give XP
                if (patternScore > 0) {
                    const baseXP = 50; // XP per pattern instance
                    const performanceMultiplier = Math.min(2, patternScore / (measureCount * 10)); // Cap multiplier
                    const finalXP = Math.round(baseXP * performanceMultiplier);

                    nodePoints[nodeId] = (nodePoints[nodeId] || 0) + finalXP;
                }
            }
        });

        // 2. Generic Repertoire/Foundations XP
        // Always give some foundation XP if they played at all
        const totalScore = Object.values(heatmap).reduce((a, b) => a + b, 0);
        if (totalScore > 0) {
            nodePoints['foundations'] = (nodePoints['foundations'] || 0) + Math.min(100, Math.round(totalScore / 5));
        }

        // 3. Rhythm/Swing XP (Placeholder: if they played with a certain density/accuracy)
        if (totalScore > 500) {
            nodePoints['swing-feel'] = (nodePoints['swing-feel'] || 0) + 25;
        }

        // Convert grouped points to contributions
        Object.entries(nodePoints).forEach(([nodeId, points]) => {
            if (points > 0) {
                contributions.push({
                    nodeId: nodeId as CurriculumNodeId,
                    points,
                    reason: this.getReasonForNode(nodeId, songTitle)
                });
            }
        });

        return contributions;
    }

    private static getReasonForNode(nodeId: string, songTitle: string): string {
        switch (nodeId) {
            case 'major-251': return `Mastered Major ii-V-I progressions in "${songTitle}"`;
            case 'minor-tonality': return `Navigated Minor ii-V-i changes in "${songTitle}"`;
            case 'secondary-dominants': return `Identified and played Secondary Dominants in "${songTitle}"`;
            case 'foundations': return `Solid harmonic foundation on "${songTitle}"`;
            case 'swing-feel': return `Great rhythmic pocket and swing feel`;
            case 'tritone-sub': return `Chromatic accuracy during Tritone Substitutions`;
            default: return `Practiced ${nodeId} concepts in "${songTitle}"`;
        }
    }
}
