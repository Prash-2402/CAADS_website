-- Migration 006: rate_limit_events table
-- Required by lib/rate-limit.ts which uses this table to throttle
-- event registrations, attendance self-claims, and yellow form requests.

CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action     TEXT        NOT NULL,
  actor_key  TEXT        NOT NULL,   -- format: "user_id:ip_address"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by (action, actor_key) within a time window
CREATE INDEX IF NOT EXISTS idx_rate_limit_action_actor
  ON public.rate_limit_events (action, actor_key, created_at DESC);

-- Only the service-role key can insert/read (called server-side only)
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

-- No user-facing RLS policies — this table is accessed exclusively
-- via the service-role client (lib/supabase/service.ts).
-- Adding a blanket deny makes this explicit.
CREATE POLICY "Deny all direct access"
  ON public.rate_limit_events
  FOR ALL
  USING (false);

-- Auto-prune: delete records older than 1 hour every time a new one is inserted
-- (handled in application code via a separate cleanup step, or via pg_cron if available)
-- For now we rely on the window-based query which is already efficient with the index.
