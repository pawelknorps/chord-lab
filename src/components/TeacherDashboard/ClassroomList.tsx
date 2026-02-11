import React, { useEffect, useState } from 'react';
import { supabase } from '../../core/supabase/client';
import { clsx } from 'clsx';

export interface Classroom {
  id: string;
  name: string;
  invite_code: string;
  teacher_id: string;
  created_at: string;
}

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface ClassroomListProps {
  onSelectClassroom: (classroomId: string, classroomName: string) => void;
}

export function ClassroomList({ onSelectClassroom }: ClassroomListProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      supabase
        .from('classrooms')
        .select('id, name, invite_code, teacher_id, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!cancelled) {
            setLoading(false);
            if (!error && data) setClassrooms(data as Classroom[]);
          }
        });
    });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = createName.trim();
    if (!name || creating) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCreating(true);
    const inviteCode = generateInviteCode();
    const { data: inserted, error } = await supabase.from('classrooms').insert({
      teacher_id: user.id,
      name,
      invite_code: inviteCode,
    }).select('id, name, invite_code, teacher_id, created_at').single();
    setCreating(false);
    if (!error && inserted) {
      setCreateName('');
      setClassrooms((prev) => [inserted as Classroom, ...prev]);
    }
  };

  if (loading) return <div className="text-sm text-neutral-400">Loading classrooms…</div>;

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          placeholder="Classroom name"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          className={clsx(
            'flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm',
            'text-[var(--text-primary)] placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none'
          )}
        />
        <button
          type="submit"
          disabled={creating || !createName.trim()}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
        >
          Create
        </button>
      </form>
      <ul className="space-y-2">
        {classrooms.map((c) => (
          <li key={c.id || c.invite_code}>
            <button
              type="button"
              onClick={() => c.id && onSelectClassroom(c.id, c.name)}
              className={clsx(
                'w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left',
                'hover:border-amber-500/50 transition-colors',
                'text-[var(--text-primary)]'
              )}
            >
              <span className="font-bold">{c.name}</span>
              <span className="ml-2 text-xs text-neutral-500">Invite: {c.invite_code}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
