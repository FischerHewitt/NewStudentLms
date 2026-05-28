-- ============================================================
-- AI-Native LMS — Initial Schema
-- Migration: 20260528000000_initial_schema
-- ============================================================
-- This migration creates all 8 tables for the hackathon MVP.
-- No Row Level Security is applied at this stage.
-- RLS is a post-hackathon concern (see docs/context/security.md).
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Enum: submission_status
-- ------------------------------------------------------------
do $$ begin
  create type submission_status as enum ('draft', 'submitted', 'graded');
exception
  when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
create table if not exists users (
  id                   uuid primary key default gen_random_uuid(),
  email                text not null unique,
  role                 text not null check (role in ('teacher', 'student')),
  name                 text not null,
  speedgrader_autorun  boolean not null default false,
  created_at           timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table: courses
-- ------------------------------------------------------------
create table if not exists courses (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  teacher_id          uuid not null references users (id),
  raw_syllabus        text not null,
  generation_preview  jsonb,               -- B-lite: holds AI output until teacher saves
  created_at          timestamptz not null default now()
);

create index if not exists courses_teacher_id_idx on courses (teacher_id);

-- ------------------------------------------------------------
-- Table: enrollments
-- ------------------------------------------------------------
create table if not exists enrollments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses (id) on delete cascade,
  student_id  uuid not null references users (id),
  enrolled_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index if not exists enrollments_course_id_idx on enrollments (course_id);
create index if not exists enrollments_student_id_idx on enrollments (student_id);

-- ------------------------------------------------------------
-- Table: modules
-- ------------------------------------------------------------
create table if not exists modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references courses (id) on delete cascade,
  title        text not null,
  description  text not null default '',
  "order"      integer not null,
  week_number  integer not null,
  created_at   timestamptz not null default now()
);

create index if not exists modules_course_id_order_idx on modules (course_id, "order");

-- ------------------------------------------------------------
-- Table: assignments
-- ------------------------------------------------------------
create table if not exists assignments (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid not null references modules (id) on delete cascade,
  course_id        uuid not null references courses (id) on delete cascade,
  title            text not null,
  instructions     text not null,
  due_date         date,
  points_possible  integer not null default 100,
  created_at       timestamptz not null default now()
);

create index if not exists assignments_module_id_idx on assignments (module_id);
create index if not exists assignments_course_id_idx on assignments (course_id);

-- ------------------------------------------------------------
-- Table: rubrics
-- One-to-one with assignments. Stored as a separate table
-- (see docs/adr/: rubric kept normalized for future rubric library).
-- criteria shape: [{description: string, points: number}]
-- ------------------------------------------------------------
create table if not exists rubrics (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null unique references assignments (id) on delete cascade,
  criteria       jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table: submissions
-- ------------------------------------------------------------
create table if not exists submissions (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null references assignments (id) on delete cascade,
  student_id      uuid not null references users (id),
  body            text not null default '',
  submitted_at    timestamptz,
  status          submission_status not null default 'draft',
  created_at      timestamptz not null default now(),
  unique (assignment_id, student_id)   -- one submission per student per assignment
);

create index if not exists submissions_assignment_id_idx on submissions (assignment_id);
create index if not exists submissions_student_id_idx    on submissions (student_id);

-- ------------------------------------------------------------
-- Table: grades
-- Created when SpeedGrader runs (Pending Grade).
-- Published when teacher approves (approved_at IS NOT NULL).
-- See docs/adr/0003-grade-pending-published-lifecycle.md
-- ------------------------------------------------------------
create table if not exists grades (
  id                      uuid primary key default gen_random_uuid(),
  submission_id           uuid not null unique references submissions (id) on delete cascade,

  -- AI Suggested Grade — written on SpeedGrader run, read-only thereafter
  ai_suggested_score      integer not null,
  ai_suggested_feedback   text not null,

  -- Final Grade — written by teacher before/on approval
  -- NULL until teacher approves; visible to student only when approved_at IS NOT NULL
  final_score             integer,
  final_feedback          text,
  approved_by             uuid references users (id),
  approved_at             timestamptz,

  created_at              timestamptz not null default now(),

  constraint grades_scores_check check (
    ai_suggested_score >= 0
    and (final_score is null or final_score >= 0)
  )
);

create index if not exists grades_submission_id_idx on grades (submission_id);
-- Index to quickly find all published grades (student-facing queries)
create index if not exists grades_approved_at_idx on grades (approved_at) where approved_at is not null;
