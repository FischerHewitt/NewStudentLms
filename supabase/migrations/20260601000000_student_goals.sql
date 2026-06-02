-- Add student_goals table for persisting per-student semester GPA targets.
-- No RLS applied — consistent with the rest of the schema (post-hackathon concern).
-- See GitHub issue #93.

create table if not exists student_goals (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references users (id) on delete cascade,
  target_gpa numeric(3, 2) not null check (target_gpa >= 0.0 and target_gpa <= 4.0),
  updated_at timestamptz not null default now()
);

create index if not exists student_goals_student_id_idx on student_goals (student_id);
