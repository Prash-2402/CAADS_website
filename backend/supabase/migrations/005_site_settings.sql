-- Migration 005: site_settings table
-- Used by /admin/settings to read/write marketing content (About, Team, Highlights)
-- without requiring a code redeploy.
-- RLS: admin/core_team can update; anon/authenticated can read.

CREATE TABLE IF NOT EXISTS public.site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);

-- Seed the default row so lib/site-settings.ts always finds data
INSERT INTO public.site_settings (key, value)
VALUES (
  'marketing',
  jsonb_build_object(
    'about_title',       'About CAADS',
    'about_description', 'CAADS — Centre for AI and Data Science — is the official AI/Data Science club at Christ University. We host workshops, hackathons, speaker sessions, and community projects to foster a culture of applied AI thinking.',
    'mission',           'To empower every student with the skills, mindset, and community needed to build with data and AI.',
    'vision',            'A campus where every student thinks in data and acts on insight.',
    'highlights',        '[]'::jsonb,
    'team_members',      '[]'::jsonb
  )
)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can read settings — powers the public home page
CREATE POLICY "Anyone can read site_settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only leaders (core_team / admin) can update settings
CREATE POLICY "Leaders can update site_settings"
  ON public.site_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('core_team', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('core_team', 'admin')
    )
  );

-- Only leaders can insert (covers the seed row being overridden if someone calls upsert)
CREATE POLICY "Leaders can insert site_settings"
  ON public.site_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('core_team', 'admin')
    )
  );
