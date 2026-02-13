import type { Concept } from './AnalysisTypes';
import type { CurriculumNodeId } from '../store/useMasteryTreeStore';
import { PerformanceSegment } from '../../modules/ITM/types/PerformanceSegment';

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
        'ColtraneChanges': 'upper-structures'
    };

    /**
     * Modern entry point for XP calculation using the full PerformanceSegment.
     */
    static calculateRewardsFromSegment(
        segment: PerformanceSegment,
        detectedPatterns: Concept[]
    ): XPContribution[] {
        const contributions: XPContribution[] = [];
        const nodePoints: Record<CurriculumNodeId, number> = {};

        // 1. Reward Patterns with granular accuracy
        detectedPatterns.forEach(pattern => {
            const nodeId = this.CONCEPT_MAP[pattern.type];
            if (nodeId) {
                let totalAccuracy = 0;
                let measureCount = 0;

                for (let i = pattern.startIndex; i <= pattern.endIndex; i++) {
                    const measure = segment.measures[i];
                    if (measure) {
                        totalAccuracy += measure.accuracyScore;
                        measureCount++;
                    }
                }

                if (measureCount > 0) {
                    const avgAccuracy = totalAccuracy / measureCount;
                    if (avgAccuracy > 20) {
                        const baseXP = 60;
                        const accuracyMultiplier = avgAccuracy / 80; // Reward higher accuracy
                        const finalXP = Math.round(baseXP * accuracyMultiplier);
                        nodePoints[nodeId] = (nodePoints[nodeId] || 0) + finalXP;
                    }
                }
            }
        });

        // 2. Foundation XP
        const totalAccuracy = segment.measures.reduce((acc: number, m) => acc + m.accuracyScore, 0);
        const avgTotalAccuracy = totalAccuracy / segment.measures.length;
        if (avgTotalAccuracy > 30) {
            nodePoints['foundations'] = (nodePoints['foundations'] || 0) + Math.round(avgTotalAccuracy);
        }

        // 3. Rhythm/Swing XP (based on note density and accuracy)
        const totalNotes = segment.measures.reduce((acc: number, m) => acc + m.notes.length, 0);
        if (totalNotes > 20 && avgTotalAccuracy > 70) {
            nodePoints['swing-feel'] = (nodePoints['swing-feel'] || 0) + 40;
        }

        Object.entries(nodePoints).forEach(([nodeId, points]) => {
            if (points > 0) {
                contributions.push({
                    nodeId: nodeId as CurriculumNodeId,
                    points,
                    reason: this.getReasonForNode(nodeId, segment.standardId)
                });
            }
        });

        return contributions;
    }

    /**
     * Legacy entry point (kept for compatibility or simple heatmap flows)
     */
    static calculateXPRewards(
        detectedPatterns: Concept[],
        heatmap: Record<number, number>,
        songTitle: string
    ): XPContribution[] {
        const contributions: XPContribution[] = [];
        const nodePoints: Record<CurriculumNodeId, number> = {};

        detectedPatterns.forEach(pattern => {
            const nodeId = this.CONCEPT_MAP[pattern.type];
            if (nodeId) {
                let patternScore = 0;
                let measureCount = 0;

                for (let i = pattern.startIndex; i <= pattern.endIndex; i++) {
                    patternScore += heatmap[i] || 0;
                    measureCount++;
                }

                if (patternScore > 0) {
                    const baseXP = 50;
                    const performanceMultiplier = Math.min(2, patternScore / (measureCount * 10));
                    const finalXP = Math.round(baseXP * performanceMultiplier);

                    nodePoints[nodeId] = (nodePoints[nodeId] || 0) + finalXP;
                }
            }
        });

        const totalScore = Object.values(heatmap).reduce((a, b) => a + b, 0);
        if (totalScore > 0) {
            nodePoints['foundations'] = (nodePoints['foundations'] || 0) + Math.min(100, Math.round(totalScore / 5));
        }

        if (totalScore > 500) {
            nodePoints['swing-feel'] = (nodePoints['swing-feel'] || 0) + 25;
        }

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
