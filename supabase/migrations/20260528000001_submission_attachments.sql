-- Add optional file-attachment columns to submissions.
-- A submission is valid if it has a non-empty body, a file attachment, or both.

alter table submissions
  add column if not exists file_url    text,
  add column if not exists file_name   text,
  add column if not exists file_type   text,
  add column if not exists file_size   integer;

-- Public read bucket for submission attachments (no RLS — matches MVP policy)
insert into storage.buckets (id, name, public, file_size_limit)
values ('submission-attachments', 'submission-attachments', true, 52428800)
on conflict (id) do nothing;
