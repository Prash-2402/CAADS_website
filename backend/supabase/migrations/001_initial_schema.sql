-- ============================================================
-- CAADS Platform — Initial Schema Migration
-- Run this in your Supabase SQL Editor (new project, clean slate)
-- ============================================================

-- Enable UUID extension (usually already enabled on Supabase)
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('student', 'volunteer', 'core_team', 'admin');
create type volunteer_status as enum ('invited', 'accepted', 'declined');
create type attendance_method as enum ('qr_self', 'self_claim', 'staff_scan');
create type attendance_status as enum ('pending', 'approved', 'rejected');
create type yellow_form_method as enum ('qr', 'manual');
create type yellow_form_status as enum ('pending', 'approved', 'rejected');
create type grievance_status as enum ('open', 'resolved');

-- ============================================================
-- profiles
-- ============================================================
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  reg_no        text unique,
  role          user_role not null default 'student',
  is_staff      boolean not null default false,
  personal_qr_key text unique,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- events
-- ============================================================
create table events (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  date          date not null,
  time          time,
  speaker       text,
  description   text,
  venue         text,
  poster_url    text,
  -- leader-only fields (never expose to student/volunteer via query)
  budget        numeric(12,2),
  requirements  text,
  -- visibility / QR
  is_public     boolean not null default false,
  qr_secret     text unique,
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- event_registrations
-- ============================================================
create table event_registrations (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid not null references events(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  form_response jsonb,
  registered_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- ============================================================
-- volunteer_assignments
-- ============================================================
create table volunteer_assignments (
  id                uuid primary key default uuid_generate_v4(),
  event_id          uuid not null references events(id) on delete cascade,
  user_id           uuid not null references profiles(id) on delete cascade,
  role              text,
  expected_duration text,
  status            volunteer_status not null default 'invited',
  invited_by        uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(event_id, user_id)
);

-- ============================================================
-- attendance
-- ============================================================
create table attendance (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references events(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  method      attendance_method not null,
  status      attendance_status not null default 'pending',
  scanned_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(event_id, user_id)
);

-- ============================================================
-- yellow_forms
-- ============================================================
create table yellow_forms (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  event_id    uuid not null references events(id) on delete cascade,
  periods     text[] not null default '{}',   -- e.g. '{"P2","P3"}'
  method      yellow_form_method not null default 'manual',
  status      yellow_form_status not null default 'pending',
  approved_by uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, event_id)
);

-- ============================================================
-- meetings
-- ============================================================
create table meetings (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  date        timestamptz not null,
  agenda      text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- meeting_attendance
-- ============================================================
create table meeting_attendance (
  id          uuid primary key default uuid_generate_v4(),
  meeting_id  uuid not null references meetings(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  method      attendance_method not null,
  status      attendance_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique(meeting_id, user_id)
);

-- ============================================================
-- meeting_minutes
-- ============================================================
create table meeting_minutes (
  id                uuid primary key default uuid_generate_v4(),
  meeting_id        uuid not null unique references meetings(id) on delete cascade,
  raw_notes         text,
  ai_refined_notes  text,
  sent_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- grievances
-- ============================================================
create table grievances (
  id          uuid primary key default uuid_generate_v4(),
  meeting_id  uuid references meetings(id) on delete set null,  -- nullable
  user_id     uuid not null references profiles(id) on delete cascade,
  message     text not null,
  status      grievance_status not null default 'open',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- documents
-- ============================================================
create table documents (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid references events(id) on delete cascade,     -- nullable
  meeting_id  uuid references meetings(id) on delete cascade,   -- nullable
  drive_link  text not null,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  -- at least one of event_id or meeting_id must be set
  constraint document_must_have_context check (
    event_id is not null or meeting_id is not null
  )
);

-- ============================================================
-- mail_log
-- ============================================================
create table mail_log (
  id          uuid primary key default uuid_generate_v4(),
  recipient   text not null,
  subject     text not null,
  template    text not null,
  metadata    jsonb,
  sent_at     timestamptz not null default now()
);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, is_staff)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'student',
    false
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- INDEXES (performance for common query patterns)
-- ============================================================
create index idx_events_date on events(date);
create index idx_events_is_public on events(is_public);
create index idx_attendance_event on attendance(event_id);
create index idx_attendance_user on attendance(user_id);
create index idx_volunteer_assignments_event on volunteer_assignments(event_id);
create index idx_volunteer_assignments_user on volunteer_assignments(user_id);
create index idx_yellow_forms_user on yellow_forms(user_id);
create index idx_yellow_forms_event on yellow_forms(event_id);
create index idx_event_registrations_event on event_registrations(event_id);
create index idx_event_registrations_user on event_registrations(user_id);
create index idx_meeting_attendance_meeting on meeting_attendance(meeting_id);
