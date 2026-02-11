-- Phase 4: Cloud & Community – Supabase schema and RLS
-- Run this in Supabase SQL Editor or via migrations.

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Song progress (per user, per song)
create table if not exists public.song_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_title text not null,
  max_bpm integer not null default 0,
  attempts integer not null default 0,
  last_practiced timestamptz not null default now(),
  mastered boolean not null default false,
  hotspot_scores jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, song_title)
);

create index if not exists song_progress_user_id on public.song_progress(user_id);
create index if not exists song_progress_song_title on public.song_progress(song_title);

-- RLS: profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS: song_progress
alter table public.song_progress enable row level security;

create policy "Users can read own song_progress"
  on public.song_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own song_progress"
  on public.song_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own song_progress"
  on public.song_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own song_progress"
  on public.song_progress for delete
  using (auth.uid() = user_id);

-- Trigger: update updated_at on profiles
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger song_progress_updated_at
  before update on public.song_progress
  for each row execute function public.set_updated_at();

-- Wave 2: Classrooms (teacher-owned)
create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classroom_students (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(classroom_id, student_id)
);

create index if not exists classrooms_teacher_id on public.classrooms(teacher_id);
create index if not exists classroom_students_classroom_id on public.classroom_students(classroom_id);
create index if not exists classroom_students_student_id on public.classroom_students(student_id);

alter table public.classrooms enable row level security;
alter table public.classroom_students enable row level security;

create policy "Teachers can manage own classrooms"
  on public.classrooms for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "Teachers can manage students in own classrooms"
  on public.classroom_students for all
  using (
    exists (select 1 from public.classrooms c where c.id = classroom_id and c.teacher_id = auth.uid())
  )
  with check (
    exists (select 1 from public.classrooms c where c.id = classroom_id and c.teacher_id = auth.uid())
  );

create policy "Students can read own classroom memberships"
  on public.classroom_students for select
  using (auth.uid() = student_id);

-- Teachers can read song_progress of students in their classrooms
drop policy if exists "Users can read own song_progress" on public.song_progress;
create policy "Users can read own song_progress"
  on public.song_progress for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.classroom_students cs
      join public.classrooms c on c.id = cs.classroom_id
      where cs.student_id = song_progress.user_id and c.teacher_id = auth.uid()
    )
  );

create trigger classrooms_updated_at
  before update on public.classrooms
  for each row execute function public.set_updated_at();

-- Wave 3: Lick feed (public licks)
create table if not exists public.licks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  template text not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists licks_user_id on public.licks(user_id);
create index if not exists licks_public_created on public.licks(is_public, created_at desc);

alter table public.licks enable row level security;

create policy "Users can CRUD own licks"
  on public.licks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can read public licks"
  on public.licks for select
  using (is_public = true);
