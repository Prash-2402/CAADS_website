-- ============================================================
-- CAADS Platform — RLS Verification Test Script
-- Run this in Supabase SQL Editor AFTER 001 and 002 migrations
-- These are manual verification queries — each should return
-- the expected result noted in the comment above it.
-- ============================================================

-- ============================================================
-- TEST SETUP
-- You need two test users:
--   1. A user with role = 'student'   (call their UUID: <student_uuid>)
--   2. A leader user with role = 'core_team' or 'admin'
--
-- Replace the placeholders below with real UUIDs from your auth.users
-- ============================================================

-- ============================================================
-- TEST 1: student CANNOT read budget or requirements from events
-- Expected: ERROR — column "budget" does not exist (on the view)
--           OR the query returns rows with NULL/missing budget column
--
-- Run this while authenticated as the student user (set role below):
-- ============================================================

-- Simulate student JWT context (replace <student_uuid> with real UUID)
-- set local role authenticated;
-- set local request.jwt.claim.sub = '<student_uuid>';

-- This should SUCCEED (student can read public event fields via view):
select id, title, date, speaker from events_public limit 5;

-- This should FAIL with "column budget does not exist" (view excludes it):
-- select budget from events_public limit 1;

-- This direct base-table query should return 0 rows for non-public events
-- and should NOT expose budget even for public events (RLS blocks base table for student):
-- select budget, requirements from events where is_public = true limit 1;

-- ============================================================
-- TEST 2: student CANNOT read another user's attendance
-- Expected: 0 rows returned (RLS filters to own rows only)
-- ============================================================

-- Replace <other_user_uuid> with a UUID that is NOT the student's own UUID
-- Run as student user context:

-- select * from attendance where user_id = '<other_user_uuid>';
-- Expected: 0 rows (RLS policy: user_id = auth.uid() only)

-- ============================================================
-- TEST 3: student CANNOT read events that are not public
-- Expected: 0 rows for is_public = false events
-- ============================================================

-- select id, title from events where is_public = false;
-- Expected: 0 rows (student RLS policy requires is_public = true)

-- ============================================================
-- TEST 4: student CANNOT insert attendance with status != 'pending'
-- Expected: The server MUST override status to 'pending' — enforce in API route
-- This is an app-layer check, not purely RLS.
-- RLS allows the insert (user_id = auth.uid()), but the API route
-- must strip and force status = 'pending' before writing.
-- ============================================================

-- Verify by checking: after a student self-claim, status in DB = 'pending'
-- select status from attendance where user_id = auth.uid() order by created_at desc limit 1;
-- Expected: 'pending'

-- ============================================================
-- TEST 5: leader CAN read budget and requirements from base events table
-- Expected: rows with budget and requirements values visible
-- ============================================================

-- Run as a core_team/admin user:
-- select id, title, budget, requirements from events limit 5;
-- Expected: full rows including budget and requirements

-- ============================================================
-- TEST 6: student CANNOT read another user's yellow_forms
-- Expected: 0 rows
-- ============================================================

-- Run as student user:
-- select * from yellow_forms where user_id != auth.uid();
-- Expected: 0 rows

-- ============================================================
-- TEST 7: student CANNOT read meetings or meeting_minutes
-- Expected: 0 rows for both tables
-- ============================================================

-- select * from meetings;         -- Expected: 0 rows for student
-- select * from meeting_minutes;  -- Expected: 0 rows for student

-- ============================================================
-- QUICK AUTOMATED CHECK (run as postgres/service role to inspect policies)
-- ============================================================

-- List all RLS policies currently active:
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Verify all tables have RLS enabled:
select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
join pg_namespace on pg_namespace.oid = pg_class.relnamespace
where pg_namespace.nspname = 'public'
  and relkind = 'r'
order by relname;
-- Expected: rls_enabled = true for every row
