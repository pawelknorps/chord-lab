import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../core/supabase/client';
import { useAuth } from '../context/AuthContext';

export interface FeedLick {
  id: string;
  name: string;
  template: string;
  created_at: string;
  author_name: string | null;
}

const PAGE_SIZE = 20;

export function useLickFeed() {
  const { session, isConfigured } = useAuth();
  const [items, setItems] = useState<FeedLick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPage = useCallback(async (reset = false) => {
    if (!isSupabaseConfigured()) return;
    const from = reset ? 0 : offset;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('licks')
      .select('id, name, template, created_at, user_id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as { id: string; name: string; template: string; created_at: string; user_id: string }[];
    if (rows.length < PAGE_SIZE) setHasMore(false);

    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, display_name').in('id', userIds);
    const nameByUserId: Record<string, string | null> = {};
    (profiles ?? []).forEach((p: { id: string; display_name: string | null }) => {
      nameByUserId[p.id] = p.display_name;
    });

    const feedItems: FeedLick[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      template: r.template,
      created_at: r.created_at,
      author_name: nameByUserId[r.user_id] ?? null,
    }));

    if (reset) {
      setItems(feedItems);
      setOffset(PAGE_SIZE);
    } else {
      setItems((prev) => [...prev, ...feedItems]);
      setOffset((o) => o + PAGE_SIZE);
    }
    setLoading(false);
  }, [offset]);

  const publishLick = useCallback(
    async (name: string, template: string): Promise<{ error: Error | null }> => {
      if (!isConfigured || !session?.user) return { error: new Error('Sign in to publish') };
      const { error: err } = await supabase.from('licks').insert({
        user_id: session.user.id,
        name,
        template,
        is_public: true,
      });
      return err ? { error: err } : { error: null };
    },
    [isConfigured, session?.user?.id]
  );

  return { items, loading, error, hasMore, fetchPage, publishLick };
}
