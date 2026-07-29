-- ============================================================
-- CAADS Platform — Sample Accounts SQL Seed Script
-- Run this in your Supabase SQL Editor to insert test users into auth.users & profiles
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- Cost 10 bcrypt salt required by Supabase GoTrue auth engine
  v_password_hash text := crypt('Password123!', gen_salt('bf', 10));

  v_admin_id     uuid := 'a0000000-0000-0000-0000-000000000001';
  v_coreteam_id  uuid := 'a0000000-0000-0000-0000-000000000002';
  v_vol_lead_id  uuid := 'a0000000-0000-0000-0000-000000000003';
  v_volunteer_id uuid := 'a0000000-0000-0000-0000-000000000004';
  v_student1_id  uuid := 'a0000000-0000-0000-0000-000000000005';
  v_student2_id  uuid := 'a0000000-0000-0000-0000-000000000006';
BEGIN

  -- Delete existing test users if any, to reset passwords cleanly
  DELETE FROM auth.users WHERE email IN (
    'admin@christuniversity.in',
    'coreteam@christuniversity.in',
    'volunteer.lead@christuniversity.in',
    'volunteer@christuniversity.in',
    'student@christuniversity.in',
    'student2@christuniversity.in'
  );

  ------------------------------------------------------------
  -- 1. ADMIN USER
  ------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@christuniversity.in', v_password_hash,
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin User"}'::jsonb,
    now(), now()
  );

  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_admin_id, v_admin_id::text, v_admin_id,
    jsonb_build_object('sub', v_admin_id, 'email', 'admin@christuniversity.in'),
    'email', now(), now(), now()
  );

  INSERT INTO public.profiles (id, full_name, reg_no, role, is_staff, personal_qr_key)
  VALUES (v_admin_id, 'Admin User', '2130001', 'admin', true, 'qr-key-admin-001')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', is_staff = true, reg_no = '2130001', personal_qr_key = 'qr-key-admin-001';


  ------------------------------------------------------------
  -- 2. CORE TEAM USER
  ------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_coreteam_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'coreteam@christuniversity.in', v_password_hash,
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Core Team Lead"}'::jsonb,
    now(), now()
  );

  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_coreteam_id, v_coreteam_id::text, v_coreteam_id,
    jsonb_build_object('sub', v_coreteam_id, 'email', 'coreteam@christuniversity.in'),
    'email', now(), now(), now()
  );

  INSERT INTO public.profiles (id, full_name, reg_no, role, is_staff, personal_qr_key)
  VALUES (v_coreteam_id, 'Core Team Lead', '2130002', 'core_team', true, 'qr-key-core-002')
  ON CONFLICT (id) DO UPDATE SET role = 'core_team', is_staff = true, reg_no = '2130002', personal_qr_key = 'qr-key-core-002';


  ------------------------------------------------------------
  -- 3. VOLUNTEER LEAD
  ------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_vol_lead_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'volunteer.lead@christuniversity.in', v_password_hash,
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Volunteer Lead"}'::jsonb,
    now(), now()
  );

  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_vol_lead_id, v_vol_lead_id::text, v_vol_lead_id,
    jsonb_build_object('sub', v_vol_lead_id, 'email', 'volunteer.lead@christuniversity.in'),
    'email', now(), now(), now()
  );

  INSERT INTO public.profiles (id, full_name, reg_no, role, is_staff, personal_qr_key)
  VALUES (v_vol_lead_id, 'Volunteer Lead', '2130003', 'volunteer', true, 'qr-key-vol-003')
  ON CONFLICT (id) DO UPDATE SET role = 'volunteer', is_staff = true, reg_no = '2130003', personal_qr_key = 'qr-key-vol-003';


  ------------------------------------------------------------
  -- 4. EVENT VOLUNTEER
  ------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_volunteer_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'volunteer@christuniversity.in', v_password_hash,
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Event Volunteer"}'::jsonb,
    now(), now()
  );

  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_volunteer_id, v_volunteer_id::text, v_volunteer_id,
    jsonb_build_object('sub', v_volunteer_id, 'email', 'volunteer@christuniversity.in'),
    'email', now(), now(), now()
  );

  INSERT INTO public.profiles (id, full_name, reg_no, role, is_staff, personal_qr_key)
  VALUES (v_volunteer_id, 'Event Volunteer', '2130004', 'volunteer', true, 'qr-key-vol-004')
  ON CONFLICT (id) DO UPDATE SET role = 'volunteer', is_staff = true, reg_no = '2130004', personal_qr_key = 'qr-key-vol-004';


  ------------------------------------------------------------
  -- 5. REGULAR STUDENT
  ------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_student1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'student@christuniversity.in', v_password_hash,
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Regular Student"}'::jsonb,
    now(), now()
  );

  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_student1_id, v_student1_id::text, v_student1_id,
    jsonb_build_object('sub', v_student1_id, 'email', 'student@christuniversity.in'),
    'email', now(), now(), now()
  );

  INSERT INTO public.profiles (id, full_name, reg_no, role, is_staff)
  VALUES (v_student1_id, 'Regular Student', '2130005', 'student', false)
  ON CONFLICT (id) DO UPDATE SET role = 'student', is_staff = false, reg_no = '2130005';


  ------------------------------------------------------------
  -- 6. PARTICIPANT STUDENT
  ------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_student2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'student2@christuniversity.in', v_password_hash,
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Participant Student"}'::jsonb,
    now(), now()
  );

  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_student2_id, v_student2_id::text, v_student2_id,
    jsonb_build_object('sub', v_student2_id, 'email', 'student2@christuniversity.in'),
    'email', now(), now(), now()
  );

  INSERT INTO public.profiles (id, full_name, reg_no, role, is_staff)
  VALUES (v_student2_id, 'Participant Student', '2130006', 'student', false)
  ON CONFLICT (id) DO UPDATE SET role = 'student', is_staff = false, reg_no = '2130006';

END $$;
