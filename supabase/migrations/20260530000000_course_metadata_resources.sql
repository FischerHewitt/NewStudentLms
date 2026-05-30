-- ============================================================
-- Migration: 20260530000000_course_metadata_resources
-- Adds course lifecycle fields, user status, and resources table.
-- See docs/adr/0007-course-draft-published-lifecycle.md
-- ============================================================

-- ------------------------------------------------------------
-- courses: metadata + lifecycle status
-- ------------------------------------------------------------
alter table courses
  add column if not exists term    text,
  add column if not exists section text,
  add column if not exists start_date date,
  add column if not exists end_date   date,
  add column if not exists status     text not null default 'draft'
    check (status in ('draft', 'published'));

-- Allow blank-start courses (no syllabus document)
alter table courses
  alter column raw_syllabus drop not null;

-- ------------------------------------------------------------
-- users: activation status for teacher-enrolled students
-- ------------------------------------------------------------
alter table users
  add column if not exists status text not null default 'active'
    check (status in ('pending', 'active'));

-- Backfill: seeded demo users are already active
update users set status = 'active' where status is null;

-- ------------------------------------------------------------
-- Table: resources
-- Reference materials attached to Assignments (files or links).
-- ------------------------------------------------------------
create table if not exists resources (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references assignments (id) on delete cascade,
  title          text not null,
  type           text not null check (type in ('file', 'link')),
  url            text not null,
  created_at     timestamptz not null default now()
);

create index if not exists resources_assignment_id_idx on resources (assignment_id);
