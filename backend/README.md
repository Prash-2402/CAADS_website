# CAADS — Supabase Backend

## Migrations

Run these SQL files in order in your **Supabase SQL Editor** (Database → SQL Editor → New query).

| File | What it does |
|---|---|
| `001_initial_schema.sql` | Creates all enums, tables, indexes, and the `handle_new_user()` trigger |
| `002_rls_policies.sql` | Enables RLS on every table, writes all policies, creates helper functions and the `events_public` view |
| `003_rls_tests.sql` | Verification queries — run after 001 + 002 to confirm security is correct |

## Setup Steps

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Wait for provisioning (~2 min)
3. Go to **SQL Editor** → paste and run `001_initial_schema.sql`
4. Run `002_rls_policies.sql`
5. Run `003_rls_tests.sql` and confirm all expected results (see comments in the file)
6. Copy your project credentials into `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

## Key Design Decisions

- **`events.budget` and `events.requirements`** are never queryable by students/volunteers. The `events_public` view physically excludes these columns. All student/volunteer-facing code in `frontend/lib/supabase/` must query `events_public`, never the base `events` table.
- **Attendance and yellow form status** is always forced to `pending` in the server-side API route, not in the DB. The DB allows any status on insert, but the API strips and overrides it.
- **`handle_new_user()` trigger** fires on every new `auth.users` row, creating a `profiles` row with `role = 'student'` and `is_staff = false`.
- **`is_leader()` / `is_admin()`** are security-definer SQL functions that read from `profiles`. They are used in all RLS policies.

## Edge Functions

The `functions/` directory is reserved for Supabase Edge Functions (Resend email sending, cron-adjacent logic). None are written yet — populated in Phase 5.
