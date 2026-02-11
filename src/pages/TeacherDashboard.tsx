import React, { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { ClassroomList } from '../components/TeacherDashboard/ClassroomList';
import { StudentProgressView } from '../components/TeacherDashboard/StudentProgressView';
import { clsx } from 'clsx';

export default function TeacherDashboard() {
  const profile = useProfile();
  const [selectedClassroom, setSelectedClassroom] = useState<{ id: string; name: string } | null>(null);

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-500">
        Loading…
      </div>
    );
  }

  if (!profile || profile.role !== 'teacher') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-[var(--text-primary)]">You need to be signed in as a teacher to view this page.</p>
        <p className="text-sm text-neutral-500">Update your role in the Supabase profiles table to &quot;teacher&quot;.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className={clsx('text-2xl font-bold', 'text-[var(--text-primary)]')}>
          Teacher Dashboard
        </h1>
        {selectedClassroom ? (
          <StudentProgressView
            classroomId={selectedClassroom.id}
            classroomName={selectedClassroom.name}
            onBack={() => setSelectedClassroom(null)}
          />
        ) : (
          <ClassroomList
            onSelectClassroom={(id, name) => setSelectedClassroom({ id, name })}
          />
        )}
      </div>
    </div>
  );
}
