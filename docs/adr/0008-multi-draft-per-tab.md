# ADR-0008: Multi-draft course creation — one draft per tab, home-page recovery UI

**Date**: 2026-05-30
**Status**: Accepted

## Context

`saveCoursePreview` enforces a "one draft slot per teacher" rule: it always finds
the most recent `courses` row where `generation_preview IS NOT NULL` and overwrites
it. This was sufficient when the only creation path was a single-browser
syllabus-to-AI flow.

Two problems surfaced as the product grew:

1. **Silent overwrite**: if a teacher generates an AI draft, navigates back to idle,
   then clicks Start Building (manual mode), `saveCoursePreview` silently replaces
   the AI draft with an empty preview. No warning is shown.

2. **Two-tab collision**: opening `/generate` in two browser tabs causes each tab's
   saves to overwrite the other's work, because both see the same "most recent
   draft" row.

The current SELECT-then-conditional-upsert pattern also adds an extra round-trip
on every save.

## Decision

### 1. Draft identity — one draft per tab via `sessionStorage` key

When `/generate` loads, the client generates a UUID and stores it in
`sessionStorage` (tab-scoped, cleared on tab close). This key is passed to
`saveCoursePreview` on every save.

The `courses` table gains a nullable `draft_key TEXT` column with a partial unique
constraint on `(teacher_id, draft_key) WHERE draft_key IS NOT NULL`. Two tabs
produce two separate draft rows; the same tab always updates the same row.

`saveCoursePreview` is rewritten as a plain `UPSERT ON CONFLICT (teacher_id,
draft_key)`. The SELECT-then-conditional pattern is removed.

### 2. Recovery UI — drafts panel on the teacher home page

Tab-close recovery moves off the `/generate` page and onto the teacher home page.
A "Drafts" section lists all pending drafts for the teacher (courses where
`generation_preview IS NOT NULL`), sorted newest first, filtered to those created
within the last 30 days. Each item shows the course title and when it was last
saved, with two actions:

- **Resume** — navigates to `/generate?courseId=<id>`. The generate page reads the
  `courseId` param, fetches that specific draft, and drops straight into the review
  state.
- **Discard** — hard-deletes the draft row immediately.

The automatic amber-banner recovery on `/generate` is removed. Teachers who want
to resume a draft go through the home page.

### 3. Staleness — 30-day TTL enforced at read time

Drafts older than 30 days are excluded from the home-page query
(`created_at > now() - interval '30 days'`). No background job or DB trigger is
needed. Stale rows are not visible to the teacher and will be cleaned up by a
future maintenance migration.

### 4. Dedup removal

The SELECT-then-conditional-upsert in `saveCoursePreview` is replaced with a
single UPSERT keyed on `(teacher_id, draft_key)`. This removes one DB round-trip
from every save in the generation flow.

## Consequences

- **Positive**: two browser tabs never collide — each has its own draft row
- **Positive**: navigating from AI draft back to idle and then choosing manual mode
  no longer silently destroys the AI draft
- **Positive**: `saveCoursePreview` becomes a single UPSERT — simpler and one fewer
  round-trip
- **Positive**: the home page becomes the canonical place to find and manage
  in-progress work (consistent with how teachers will expect an LMS to work)
- **Negative / trade-offs**: tab-close recovery is no longer automatic — teachers
  must navigate to the home page to resume, adding one click
- **Negative / trade-offs**: `sessionStorage` is cleared on tab close, so the
  draft_key from the original tab is lost; if the teacher re-opens `/generate`
  directly (not via home page Resume), they start a new draft instead of resuming
  the old one
- **Risks**: the 30-day TTL is a read-time filter only; the DB will accumulate
  stale rows until a cleanup migration runs; acceptable for MVP scale
- **Risks**: `draft_key` is nullable to avoid breaking existing rows; new code must
  handle the null case (treat null-key rows as legacy recoverable drafts)

## Migration scope

1. `ALTER TABLE courses ADD COLUMN draft_key TEXT` — nullable, no backfill needed
2. `CREATE UNIQUE INDEX courses_teacher_draft_key_idx ON courses (teacher_id, draft_key) WHERE draft_key IS NOT NULL`
3. Update `saveCoursePreview` Server Action: accept `draft_key`, use UPSERT
4. Add `getCourseDrafts()` Server Action — returns all drafts within 30-day TTL
5. Add `discardDraft(courseId)` Server Action — hard-delete
6. Update teacher home page — add Drafts section
7. Update `/generate` page — read `?courseId` param, remove automatic amber-banner recovery
8. Update `GenerateFlow` — generate and persist `draft_key` in `sessionStorage` on mount
