import React, { useEffect, useState } from 'react';
import { supabase } from '../../core/supabase/client';
import { clsx } from 'clsx';

export interface StudentRow {
  student_id: string;
  display_name: string | null;
}

export interface ProgressRow {
  song_title: string;
  max_bpm: number;
  attempts: number;
  last_practiced: string;
  mastered: boolean;
}

interface StudentProgressViewProps {
  classroomId: string;
  classroomName: string;
  onBack: () => void;
}

export function StudentProgressView({ classroomId, classroomName, onBack }: StudentProgressViewProps) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [progressByStudent, setProgressByStudent] = useState<Record<string, ProgressRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: members } = await supabase
        .from('classroom_students')
        .select('student_id')
        .eq('classroom_id', classroomId);

      if (cancelled) {
        setLoading(false);
        return;
      }
      if (!members?.length) {
        setStudents([]);
        setProgressByStudent({});
        setLoading(false);
        return;
      }

      const ids = members.map((m) => m.student_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ids);

      const studentList: StudentRow[] = (profiles ?? []).map((p) => ({
        student_id: p.id,
        display_name: p.display_name ?? p.id.slice(0, 8),
      }));
      if (!cancelled) setStudents(studentList);

      const next: Record<string, ProgressRow[]> = {};
      for (const id of ids) {
        const { data: rows } = await supabase
          .from('song_progress')
          .select('song_title, max_bpm, attempts, last_practiced, mastered')
          .eq('user_id', id)
          .order('last_practiced', { ascending: false });
        if (!cancelled) next[id] = (rows ?? []) as ProgressRow[];
      }
      if (!cancelled) setProgressByStudent(next);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [classroomId]);

  if (loading) return <div className="text-sm text-neutral-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-white/10"
        >
          ← Back
        </button>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{classroomName}</h2>
      </div>
      {students.length === 0 ? (
        <p className="text-sm text-neutral-500">No students in this classroom yet. Share the invite code.</p>
      ) : (
        <div className="space-y-6">
          {students.map((s) => (
            <div key={s.student_id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-bold text-[var(--text-primary)] mb-3">{s.display_name ?? s.student_id.slice(0, 8)}</h3>
              <ul className="space-y-2">
                {(progressByStudent[s.student_id] ?? []).map((p) => (
                  <li
                    key={p.song_title}
                    className={clsx(
                      'flex items-center justify-between text-sm',
                      'text-[var(--text-primary)]'
                    )}
                  >
                    <span>{p.song_title}</span>
                    <span className="text-neutral-400">
                      BPM {p.max_bpm} · {p.mastered ? '✓ Mastered' : `${p.attempts} attempts`}
                    </span>
                  </li>
                ))}
                {(progressByStudent[s.student_id] ?? []).length === 0 && (
                  <li className="text-sm text-neutral-500">No progress yet</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
