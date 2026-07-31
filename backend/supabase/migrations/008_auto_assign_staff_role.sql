-- ============================================================
-- Migration 008: Auto-assign staff role based on metadata
-- Allows the backend to securely pass 'assigned_role' during 
-- first-time staff activation via the Admin API.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role text;
  is_staff_val boolean;
BEGIN
  -- Read the assigned role, default to 'student'
  assigned_role := coalesce(new.raw_user_meta_data->>'assigned_role', 'student');
  
  -- Determine if they get a staff badge
  is_staff_val := assigned_role IN ('volunteer', 'core_team', 'admin');

  INSERT INTO public.profiles (id, full_name, reg_no, role, is_staff)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'reg_no',
    assigned_role,
    is_staff_val
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    reg_no = COALESCE(EXCLUDED.reg_no, public.profiles.reg_no),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    is_staff = COALESCE(EXCLUDED.is_staff, public.profiles.is_staff);

  RETURN new;
END;
$$;
