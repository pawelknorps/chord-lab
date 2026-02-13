import { useState, useMemo } from 'react';
import { BookMarked, CloudUpload, Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applyLickToChords, type LickResult } from '../utils/lickConverter';
import { useAuth } from '../../../context/AuthContext';
import { useLickFeed } from '../../../hooks/useLickFeed';

const STORAGE_KEY = 'pawelsonik-lick-library';

export interface SavedLick {
  id: string;
  name: string;
  template: string;
}

function loadLicks(): SavedLick[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedLick[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLicks(licks: SavedLick[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(licks));
}

function generateId() {
  return `lick-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Add a lick to local library (used by Lick Feed "Copy to my library"). */
export function addLickToLocalLibrary(name: string, template: string): void {
  const next = [...loadLicks(), { id: generateId(), name, template }];
  saveLicks(next);
}

interface LickLibraryProps {
  /** All chord symbols from the current song (e.g. from music.measures) */
  currentSongChords: string[];
  onClose?: () => void;
}

export function LickLibrary({ currentSongChords, onClose }: LickLibraryProps) {
  const [licks, setLicks] = useState<SavedLick[]>(loadLicks);
  const [selectedId, setSelectedId] = useState<string | null>(licks[0]?.id ?? null);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('1 2 b3 5');
  const [showAdd, setShowAdd] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { session, isConfigured } = useAuth();
  const { publishLick } = useLickFeed();

  const selectedLick = licks.find(l => l.id === selectedId);
  const appliedResults = useMemo(() => {
    if (!selectedLick || currentSongChords.length === 0) return [];
    return applyLickToChords(selectedLick.template, currentSongChords);
  }, [selectedLick, currentSongChords]);

  const handleAdd = () => {
    const name = newName.trim() || 'New Lick';
    const template = newTemplate.trim() || '1 2 b3 5';
    const id = generateId();
    const next = [...licks, { id, name, template }];
    setLicks(next);
    saveLicks(next);
    setSelectedId(id);
    setNewName('');
    setNewTemplate('1 2 b3 5');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const next = licks.filter(l => l.id !== id);
    setLicks(next);
    saveLicks(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  const handlePublishToFeed = async () => {
    if (!selectedLick || !isConfigured) return;
    if (!session) {
      setPublishStatus('error');
      return;
    }
    setPublishStatus('idle');
    const { error } = await publishLick(selectedLick.name, selectedLick.template);
    setPublishStatus(error ? 'error' : 'success');
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] overflow-hidden bg-neutral-900/95 rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          <BookMarked size={18} className="text-amber-400" />
          Lick Library
          <Link to="/lick-feed" className="ml-auto text-[10px] font-bold text-amber-500 hover:text-amber-400">
            Browse feed
          </Link>
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Saved formulas list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Saved formulas</span>
            <div className="flex items-center gap-1">
              {selectedLick && isConfigured && (
                <button
                  type="button"
                  onClick={handlePublishToFeed}
                  title={session ? 'Publish to feed' : 'Sign in to publish'}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-amber-500 hover:text-amber-400 disabled:opacity-50"
                  disabled={!session}
                >
                  <CloudUpload size={14} /> Publish
                </button>
              )}
              {publishStatus === 'success' && <span className="text-[10px] text-green-400">Published</span>}
              {publishStatus === 'error' && <span className="text-[10px] text-red-400">Failed</span>}
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-amber-500 hover:text-amber-400"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
          {licks.length === 0 ? (
            <p className="text-xs text-neutral-600 py-2">No licks saved. Add a formula (e.g. 1 2 b3 5) to see it applied to every chord.</p>
          ) : (
            <ul className="space-y-1">
              {licks.map(l => (
                <li
                  key={l.id}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                    selectedId === l.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-white'
                      : 'bg-white/5 border-white/5 hover:border-white/10 text-neutral-300'
                  }`}
                  onClick={() => setSelectedId(l.id)}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{l.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate">{l.template}</div>
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(l.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-500 hover:text-red-400 shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <input
              type="text"
              placeholder="Lick name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm border border-white/10 focus:border-amber-500/50 outline-none"
            />
            <input
              type="text"
              placeholder="Formula (e.g. 1 2 b3 5 or R b3 5 b7)"
              value={newTemplate}
              onChange={e => setNewTemplate(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm font-mono border border-white/10 focus:border-amber-500/50 outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Applied to current song */}
        {selectedLick && currentSongChords.length > 0 && (
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
              Applied to this song
            </span>
            <ul className="mt-2 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {appliedResults.map((r: LickResult, i: number) => (
                <li
                  key={`${r.chord}-${i}`}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-xs"
                >
                  <span className="font-mono font-bold text-amber-400 shrink-0">{r.chord}</span>
                  <span className="text-neutral-400 truncate">{r.display}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
