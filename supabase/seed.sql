-- ============================================================
-- AI-Native LMS — Seed Data
-- ============================================================
-- Two hard-coded demo users with stable UUIDs.
-- These UUIDs are referenced throughout the codebase — do not change them.
--
-- Teacher UUID: 00000000-0000-0000-0000-000000000001
-- Student UUID: 00000000-0000-0000-0000-000000000002
--
-- The role toggle in the UI switches between these two identities.
-- See docs/context/domain-model.md — User entity.
-- ============================================================

insert into users (id, email, role, name, speedgrader_autorun)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'teacher@demo.lms',
    'teacher',
    'Dr. Fischer Hewitt',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'student@demo.lms',
    'student',
    'Alex Rivera',
    false
  )
on conflict (id) do nothing;
