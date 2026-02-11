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
