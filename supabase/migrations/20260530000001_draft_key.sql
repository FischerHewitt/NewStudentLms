-- ADR-0008: one draft per browser tab, keyed by draft_key generated in sessionStorage.
-- NULLs are distinct in PostgreSQL unique indexes, so existing rows (draft_key IS NULL)
-- are unaffected and multiple NULL-key rows are allowed.

alter table courses add column if not exists draft_key text;

create unique index if not exists courses_teacher_draft_key_idx
  on courses (teacher_id, draft_key);
