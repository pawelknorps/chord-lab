import { useEffect, useState } from 'react';
import { supabase } from '../../core/supabase/client';
import { ItmSyncService } from '../../core/services/itmSyncService';
import { TeacherAnalyticsService } from '../../core/services/TeacherAnalyticsService';
import { AlertCircle, TrendingUp, User as UserIcon, BookOpen } from 'lucide-react';

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
  const [performanceByStudent, setPerformanceByStudent] = useState<Record<string, any[]>>({});
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data: members } = await supabase
        .from('classroom_students')
        .select('student_id')
        .eq('classroom_id', classroomId);

      if (cancelled) return;
      if (!members?.length) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const ids = members.map((m) => m.student_id);

      // Fetch Profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ids);

      if (cancelled) return;
      const studentList = (profiles ?? []).map((p) => ({
        student_id: p.id,
        display_name: p.display_name ?? p.id.slice(0, 8),
      }));
      setStudents(studentList);

      // Fetch Performance History for each student
      const perfMap: Record<string, any[]> = {};
      for (const id of ids) {
        perfMap[id] = await ItmSyncService.getStudentHistory(id);
      }
      if (!cancelled) setPerformanceByStudent(perfMap);

      // Fetch Class Hotspots
      const hotspotsData = await TeacherAnalyticsService.getClassHotspots(ids);
      if (!cancelled) setHotspots(hotspotsData);

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [classroomId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Aggregatiing Class Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <BookOpen size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">{classroomName}</h2>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{students.length} Enrolled Students</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
        >
          ← Back to Classes
        </button>
      </div>

      {/* Class Hotspots */}
      {hotspots.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500" />
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Pedagogical Hotspots</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotspots.slice(0, 3).map((h, i) => (
              <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-xs font-black text-white">{h.standardId}</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Avg. Accuracy</span>
                  <span className="text-sm font-black text-amber-500">{h.averageScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <UserIcon size={14} className="text-neutral-500" />
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Student Roster</h3>
        </div>

        {students.length === 0 ? (
          <div className="bg-white/5 rounded-[40px] p-12 text-center border border-dashed border-white/10">
            <p className="text-sm text-neutral-500">No students enrolled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {students.map((s) => (
              <div key={s.student_id} className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-8 group hover:border-indigo-500/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-neutral-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {s.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">{s.display_name}</h3>
                      <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">ID: {s.student_id.slice(0, 8)}</span>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Sessions</span>
                      <span className="text-lg font-black text-white">{(performanceByStudent[s.student_id] ?? []).length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Peak Accuracy</span>
                      <span className="text-lg font-black text-indigo-400">
                        {Math.max(0, ...(performanceByStudent[s.student_id] ?? []).map(p => p.overall_score))}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-neutral-500" />
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Recent Performance</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(performanceByStudent[s.student_id] ?? []).slice(0, 4).map((p, idx) => (
                      <div key={idx} className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                        <span className="text-[11px] font-black text-white truncate">{p.standard_id}</span>
                        <div className="flex justify-between items-end mt-1">
                          <span className="text-[9px] font-bold text-neutral-600">{new Date(p.timestamp).toLocaleDateString()}</span>
                          <span className="text-xs font-black text-indigo-400">{p.overall_score}%</span>
                        </div>
                      </div>
                    ))}
                    {(performanceByStudent[s.student_id] ?? []).length === 0 && (
                      <div className="col-span-full py-4 text-center">
                        <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest italic">No session history synced yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
