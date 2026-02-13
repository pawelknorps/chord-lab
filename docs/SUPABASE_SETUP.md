# Supabase setup for Chord Lab

To turn on Supabase (auth, progress sync, classrooms, lick feed), do the following.

## 1. Environment variables

From your Supabase project:

1. Open **Supabase Dashboard** → your project → **Project Settings** (gear) → **API**.
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

Create a local env file (not committed):

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Restart the dev server after changing env vars.

## 2. Database schema

In Supabase: **SQL Editor** → New query → paste and run the contents of:

**`src/core/supabase/schema.sql`**

That creates:

- **profiles** – user display name, role (student/teacher)
- **song_progress** – per-user, per-song progress (BPM, attempts, mastered, hotspot_scores)
- **classrooms** – teacher-created classrooms with invite codes
- **classroom_students** – classroom membership
- **licks** – user licks, with public feed
- RLS policies and triggers

## 3. Auth (optional)

If you use email sign-in:

- **Authentication** → **Providers** – enable Email and configure as you like.
- **URL Configuration**: add your app URL (e.g. `http://localhost:5173` for dev, and your production URL) to **Redirect URLs** so auth redirects work.

---

**Summary:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`, run `schema.sql` in the SQL Editor, then restart the dev server. Auth and URL config are optional but recommended for full functionality.
