import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../core/supabase/client';
import { useAuth } from '../context/AuthContext';

export interface SupabaseProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'teacher';
}

export function useProfile(): SupabaseProfile | null {
  const { session } = useAuth();
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !session?.user?.id) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url, role')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (!cancelled && !error && data) {
          setProfile(data as SupabaseProfile);
        } else {
          setProfile(null);
        }
      });
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  return profile;
}
