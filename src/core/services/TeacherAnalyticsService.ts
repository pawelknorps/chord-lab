import { supabase } from '../supabase/client';

/**
 * Service to aggregate student performance data for educators (REQ-CC-01).
 */
export class TeacherAnalyticsService {
    /**
     * Identifies "Hotspots" - standards where multiple students are struggling.
     */
    static async getClassHotspots(studentIds: string[]) {
        if (studentIds.length === 0) return [];

        const { data, error } = await supabase
            .from('performance_history')
            .select('standard_id, overall_score')
            .in('user_id', studentIds);

        if (error) {
            console.error('Hotspot analysis error:', error);
            return [];
        }

        // Aggregate by standard
        const stats: Record<string, { totalScore: number; count: number }> = {};

        data.forEach(row => {
            if (!stats[row.standard_id]) {
                stats[row.standard_id] = { totalScore: 0, count: 0 };
            }
            stats[row.standard_id].totalScore += row.overall_score;
            stats[row.standard_id].count += 1;
        });

        return Object.entries(stats)
            .map(([id, s]) => ({
                standardId: id,
                averageScore: Math.round(s.totalScore / s.count),
                studentCount: s.count
            }))
            .sort((a, b) => a.averageScore - b.averageScore); // Difficult ones first
    }

    /**
     * Generates an AI summary of class-wide progress using Gemini Nano.
     */
    static async generateClassSummary(hotspots: any[]) {
        // This would call a specialized prompt in jazzTeacherLogic
        // For now, returning a structured summary skeleton
        return {
            criticalStandards: hotspots.slice(0, 2).map(h => h.standardId),
            classAverage: hotspots.length > 0
                ? Math.round(hotspots.reduce((acc, h) => acc + h.averageScore, 0) / hotspots.length)
                : 0,
            recommendation: hotspots.length > 0
                ? `Focus on the bridge sections of ${hotspots[0].standardId}.`
                : "Encourage more consistent practice across the roster."
        };
    }
}
