import { supabase } from '../supabase/client';
import { PerformanceSegment } from '../../modules/ITM/types/PerformanceSegment';
import { RecordedSolo } from '../store/useSoloStore';

/**
 * Service to synchronize ITM performance data with Supabase (REQ-CC-01, REQ-CC-02).
 */
export class ItmSyncService {
    /**
     * Pushes a performance segment to the cloud.
     */
    static async syncPerformanceSegment(segment: PerformanceSegment) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { error } = await supabase
            .from('performance_history')
            .upsert({
                id: segment.id, // Use existing UUID if available, or generate
                user_id: user.id,
                standard_id: segment.standardId,
                bpm: segment.bpm,
                overall_score: segment.overallScore,
                measures_json: segment.measures,
                timestamp: new Date(segment.timestamp).toISOString()
            });

        if (error) console.error('Sync error (performance):', error);
        return !error;
    }

    /**
     * Pushes a recorded solo to the cloud.
     */
    static async syncSolo(solo: RecordedSolo, isPublic: boolean = false) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { error } = await supabase
            .from('solos')
            .upsert({
                id: solo.id,
                user_id: user.id,
                standard_id: solo.standardId,
                bpm: solo.bpm,
                notes_json: solo.notes,
                musicalized_text: solo.musicalizedText,
                is_public: isPublic,
                timestamp: new Date(solo.timestamp).toISOString()
            });

        if (error) console.error('Sync error (solo):', error);
        return !error;
    }

    /**
     * Fetches public solos for the Lick Hub.
     */
    static async getPublicSolos() {
        const { data, error } = await supabase
            .from('solos')
            .select(`
                *,
                profiles (
                    display_name
                )
            `)
            .eq('is_public', true)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Fetch error (Lick Hub):', error);
            return [];
        }
        return data;
    }

    /**
     * Fetches performance history for a specific user (Teacher View).
     */
    static async getStudentHistory(studentId: string) {
        const { data, error } = await supabase
            .from('performance_history')
            .select('*')
            .eq('user_id', studentId)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Fetch error (Teacher View):', error);
            return [];
        }
        return data;
    }
}
