-- Assignment Versions: immutable published snapshots of an Assignment.
-- Students always read from the latest version row, never the live assignments row.
-- Created when a teacher explicitly publishes an Assignment, or automatically
-- for all Assignments when a Course is first published (ADR pending).

create table if not exists assignment_versions (
  id               uuid primary key default gen_random_uuid(),
  assignment_id    uuid not null references assignments (id) on delete cascade,
  instructions     text not null,
  due_date         date,
  points_possible  integer not null,
  rubric_snapshot  jsonb,
  published_at     timestamptz not null default now()
);

create index if not exists assignment_versions_assignment_id_idx
  on assignment_versions (assignment_id, published_at desc);
