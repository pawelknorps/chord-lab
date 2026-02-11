import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../core/supabase/client';
import { useAuth } from '../context/AuthContext';
import { useProfileStore } from '../core/profiles/useProfileStore';
import type { SongProgress } from '../core/profiles/ProfileTypes';

const SYNC_DEBOUNCE_MS = 2000;

function mapProgressToRow(progress: SongProgress): Record<string, unknown> {
  const hotspotScores: Record<string, number> = {};
  progress.hotspotScores.forEach((v, k) => {
    hotspotScores[String(k)] = v;
  });
  return {
    song_title: progress.songTitle,
    max_bpm: progress.maxBpm,
    attempts: progress.attempts,
    last_practiced: new Date(progress.lastPracticed).toISOString(),
    mastered: progress.mastered,
    hotspot_scores: hotspotScores,
  };
}

export function useSupabaseProgressSync() {
  const { session, isConfigured } = useAuth();
  const [lastError, setLastError] = useState<Error | null>(null);

  const syncToCloud = useCallback(async () => {
    if (!isConfigured || !session?.user) return;
    const { currentProfile } = useProfileStore.getState();
    if (!currentProfile) return;

    const entries = Array.from(currentProfile.songProgress.entries());
    if (entries.length === 0) return;

    setLastError(null);
    for (const [, progress] of entries) {
      const row = mapProgressToRow(progress);
      const { error } = await supabase.from('song_progress').upsert(
        {
          user_id: session.user.id,
          ...row,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,song_title' }
      );
      if (error) {
        setLastError(error);
        return;
      }
    }
  }, [isConfigured, session?.user?.id]);

  const hydrateFromCloud = useCallback(async () => {
    if (!isConfigured || !session?.user) return;

    setLastError(null);
    const { data, error } = await supabase
      .from('song_progress')
      .select('song_title, max_bpm, attempts, last_practiced, mastered, hotspot_scores')
      .eq('user_id', session.user.id);

    if (error) {
      setLastError(error);
      return;
    }
    if (data && data.length > 0) {
      const rows = data.map((r) => ({
        song_title: r.song_title,
        max_bpm: r.max_bpm ?? 0,
        attempts: r.attempts ?? 0,
        last_practiced: typeof r.last_practiced === 'string' ? new Date(r.last_practiced).getTime() : Date.now(),
        mastered: Boolean(r.mastered),
        hotspot_scores: (r.hotspot_scores as Record<string, number> | null) ?? {},
      }));
      useProfileStore.getState().mergeProgressFromCloud(rows);
    }
  }, [isConfigured, session?.user?.id]);

  /** On sign-in: hydrate from cloud, then push local to cloud once. */
  useEffect(() => {
    if (!isSupabaseConfigured() || !session?.user) return;
    let cancelled = false;
    (async () => {
      await hydrateFromCloud();
      if (!cancelled) await syncToCloud();
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id, hydrateFromCloud, syncToCloud]);

  /** Debounced sync to cloud when profile progress changes. */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isConfigured || !session?.user) return;
    const unsubscribe = useProfileStore.subscribe(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        syncToCloud();
      }, SYNC_DEBOUNCE_MS);
    });
    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isConfigured, session?.user?.id, syncToCloud]);

  return { syncToCloud, hydrateFromCloud, lastError };
}
