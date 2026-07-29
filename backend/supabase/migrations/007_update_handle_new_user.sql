-- ============================================================
-- Migration 007: Update handle_new_user trigger to save reg_no
-- Extracts reg_no from raw_user_meta_data during signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, reg_no, role, is_staff)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'reg_no',
    'student',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    reg_no = COALESCE(EXCLUDED.reg_no, public.profiles.reg_no);

  RETURN new;
END;
$$;
