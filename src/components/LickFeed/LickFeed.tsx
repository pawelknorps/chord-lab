import React, { useEffect } from 'react';
import { useLickFeed, type FeedLick } from '../../hooks/useLickFeed';
import { addLickToLocalLibrary } from '../../modules/JazzKiller/components/LickLibrary';
import { clsx } from 'clsx';

export function LickFeed() {
  const { items, loading, error, hasMore, fetchPage } = useLickFeed();

  useEffect(() => {
    fetchPage(true);
  }, []);

  const handleCopy = (lick: FeedLick) => {
    addLickToLocalLibrary(lick.name, lick.template);
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 shadow-2xl">
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400">Lick Feed</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">Public licks from the community</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {error && <p className="text-xs text-red-400">{error.message}</p>}
        {loading && items.length === 0 && <p className="text-sm text-neutral-500">Loading…</p>}
        {items.map((lick) => (
          <div
            key={lick.id}
            className={clsx(
              'rounded-xl border border-white/10 bg-white/5 p-3',
              'text-[var(--text-primary)]'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{lick.name}</div>
                <div className="text-[10px] font-mono text-neutral-500 truncate mt-0.5">{lick.template}</div>
                {lick.author_name && (
                  <div className="text-[10px] text-neutral-500 mt-1">by {lick.author_name}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(lick)}
                className="shrink-0 rounded-lg border border-amber-500/50 px-2 py-1 text-xs font-bold text-amber-500 hover:bg-amber-500/10"
              >
                Copy to library
              </button>
            </div>
          </div>
        ))}
        {hasMore && (
          <button
            type="button"
            onClick={() => fetchPage(false)}
            disabled={loading}
            className="w-full rounded-lg border border-white/20 py-2 text-sm text-neutral-400 hover:bg-white/5 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
}
