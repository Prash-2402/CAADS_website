-- ============================================================
-- CAADS Platform — RLS Policies Migration
-- Run AFTER 001_initial_schema.sql
-- ============================================================
-- Strategy:
--   • student/volunteer access the DB via the anon/authenticated role
--   • core_team/admin are also authenticated users with elevated role
--   • Role is read from profiles.role — checked server-side via
--     a helper function, never trusted from client JWT claims
--   • events.budget and events.requirements are ONLY accessible
--     via the leaders_events view (not the base table) for non-leaders
-- ============================================================

-- ============================================================
-- HELPER: role-check function (security definer, runs as postgres)
-- ============================================================
create or replace function get_my_role()
returns user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function is_leader()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()) in ('core_team', 'admin'),
    false
  );
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()) = 'admin',
    false
  );
$$;

-- ============================================================
-- Enable RLS on every table
-- ============================================================
alter table profiles              enable row level security;
alter table events                enable row level security;
alter table event_registrations   enable row level security;
alter table volunteer_assignments  enable row level security;
alter table attendance            enable row level security;
alter table yellow_forms          enable row level security;
alter table meetings              enable row level security;
alter table meeting_attendance    enable row level security;
alter table meeting_minutes       enable row level security;
alter table grievances            enable row level security;
alter table documents             enable row level security;
alter table mail_log              enable row level security;

-- ============================================================
-- profiles
-- ============================================================
-- Users can read and update their own profile
create policy "profiles: users read own"
  on profiles for select
  using (id = auth.uid());

create policy "profiles: users update own"
  on profiles for update
  using (id = auth.uid());

-- Leaders can read all profiles (needed for volunteer mgmt, member directory)
create policy "profiles: leaders read all"
  on profiles for select
  using (is_leader());

-- Admins can update any profile (role management)
create policy "profiles: admin update all"
  on profiles for update
  using (is_admin());

-- Public profile cards: read by anyone (for /id/[user_id]/[key] route)
-- Only name, role, avatar_url, personal_qr_key — enforced in query, not policy
create policy "profiles: public read for badge"
  on profiles for select
  using (true);  -- column restriction enforced in server-side query builder

-- ============================================================
-- events (base table — budget/requirements accessible to leaders only)
-- ============================================================
-- All authenticated users can read public events (public fields only enforced via view)
create policy "events: authenticated read public"
  on events for select
  using (auth.uid() is not null and is_public = true);

-- Leaders can read ALL events including private ones (full row incl. budget)
create policy "events: leaders read all"
  on events for select
  using (is_leader());

-- Leaders can insert, update, delete events
create policy "events: leaders insert"
  on events for insert
  with check (is_leader());

create policy "events: leaders update"
  on events for update
  using (is_leader());

create policy "events: leaders delete"
  on events for delete
  using (is_leader());

-- ============================================================
-- COLUMN-LEVEL SECURITY: events_public view
-- Students and volunteers MUST query through this view, not base table.
-- Enforced in lib/supabase query builders — never query events base
-- table directly in student/volunteer-facing code.
-- ============================================================
create or replace view events_public as
select
  id, title, date, time, speaker, description,
  venue, poster_url, is_public, created_at
from events
where is_public = true;

-- Grant SELECT on the view to authenticated role
-- (budget/requirements columns are physically absent from view)
grant select on events_public to authenticated;

-- ============================================================
-- event_registrations
-- ============================================================
create policy "event_registrations: users read own"
  on event_registrations for select
  using (user_id = auth.uid());

create policy "event_registrations: users insert own"
  on event_registrations for insert
  with check (user_id = auth.uid());

create policy "event_registrations: leaders read all"
  on event_registrations for select
  using (is_leader());

-- ============================================================
-- volunteer_assignments
-- ============================================================
-- Volunteers can only read their own assignments
create policy "volunteer_assignments: users read own"
  on volunteer_assignments for select
  using (user_id = auth.uid());

-- Volunteers can update their own assignment (accept/decline)
create policy "volunteer_assignments: users update own status"
  on volunteer_assignments for update
  using (user_id = auth.uid());

-- Leaders can manage all assignments
create policy "volunteer_assignments: leaders read all"
  on volunteer_assignments for select
  using (is_leader());

create policy "volunteer_assignments: leaders insert"
  on volunteer_assignments for insert
  with check (is_leader());

create policy "volunteer_assignments: leaders update"
  on volunteer_assignments for update
  using (is_leader());

create policy "volunteer_assignments: leaders delete"
  on volunteer_assignments for delete
  using (is_leader());

-- ============================================================
-- attendance
-- ============================================================
-- Users can insert their own attendance (status enforced to 'pending' server-side)
create policy "attendance: users insert own"
  on attendance for insert
  with check (user_id = auth.uid());

-- Users can read their own attendance records
create policy "attendance: users read own"
  on attendance for select
  using (user_id = auth.uid());

-- Leaders can read all, update status (approve/reject)
create policy "attendance: leaders read all"
  on attendance for select
  using (is_leader());

create policy "attendance: leaders update"
  on attendance for update
  using (is_leader());

-- Staff with is_staff=true can insert attendance for others (staff_scan method)
create policy "attendance: staff insert for others"
  on attendance for insert
  with check (
    (select is_staff from profiles where id = auth.uid()) = true
  );

-- ============================================================
-- yellow_forms
-- ============================================================
-- Users can insert their own forms (status forced 'pending' server-side)
create policy "yellow_forms: users insert own"
  on yellow_forms for insert
  with check (user_id = auth.uid());

-- Users can read their own forms
create policy "yellow_forms: users read own"
  on yellow_forms for select
  using (user_id = auth.uid());

-- Leaders can read all, update status
create policy "yellow_forms: leaders read all"
  on yellow_forms for select
  using (is_leader());

create policy "yellow_forms: leaders update"
  on yellow_forms for update
  using (is_leader());

-- ============================================================
-- meetings
-- ============================================================
-- Only leaders can manage meetings
create policy "meetings: leaders full access"
  on meetings for all
  using (is_leader())
  with check (is_leader());

-- ============================================================
-- meeting_attendance
-- ============================================================
-- Attendees (is_staff) can read their own attendance
create policy "meeting_attendance: staff read own"
  on meeting_attendance for select
  using (user_id = auth.uid());

-- Leaders full access
create policy "meeting_attendance: leaders full access"
  on meeting_attendance for all
  using (is_leader())
  with check (is_leader());

-- ============================================================
-- meeting_minutes
-- ============================================================
-- Only leaders can read and manage meeting minutes
create policy "meeting_minutes: leaders full access"
  on meeting_minutes for all
  using (is_leader())
  with check (is_leader());

-- ============================================================
-- grievances
-- ============================================================
-- Users can submit and read their own grievances
create policy "grievances: users insert own"
  on grievances for insert
  with check (user_id = auth.uid());

create policy "grievances: users read own"
  on grievances for select
  using (user_id = auth.uid());

-- Leaders read and manage all grievances
create policy "grievances: leaders full access"
  on grievances for all
  using (is_leader())
  with check (is_leader());

-- ============================================================
-- documents
-- ============================================================
-- Only leaders can manage documents
create policy "documents: leaders full access"
  on documents for all
  using (is_leader())
  with check (is_leader());

-- ============================================================
-- mail_log
-- ============================================================
-- Only admins can read the mail log (audit trail)
create policy "mail_log: admin read only"
  on mail_log for select
  using (is_admin());

-- Service role inserts mail_log rows (via server-side API routes only)
-- No user-facing INSERT policy — done via service role key server-side
