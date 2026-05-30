# ADR-0006: Transactional Course structure persistence

**Date**: 2026-05-29
**Status**: Accepted

## Context

The Syllabus-to-Course Generator stores AI output in `Course.generation_preview`
until the teacher reviews and saves the Course structure. Saving a Course
structure must create Modules, Assignments, Rubrics, and the seeded student's
Enrollment. ADR-0002 says Enrollment drives Gradebook rows, so a saved Course
without Enrollment breaks the Gradebook promise.

The previous TypeScript Server Action cleared `generation_preview` before the
normalized rows and Enrollment were all written. A failure after that point could
leave a partially saved Course structure with no recoverable draft.

## Decision

Course structure persistence is handled by the database function
`publish_course_structure(course_id, teacher_id, student_id, preview)`.

The function runs the full publish sequence transactionally:

- validate and lock the Course row for the teacher
- insert Modules from the reviewed Course structure
- insert Assignments under their Modules
- insert one Rubric per Assignment
- insert the seeded student's Enrollment
- clear `Course.generation_preview` only after the structure is complete

The Next.js Server Action is a thin adapter that calls this function through the
server-side Supabase client. Client roles cannot execute the function directly;
execution is granted only to `service_role`.

## Consequences

- **Positive**: Course structure writes are atomic. A failure rolls back the
  entire publish instead of leaving partial Modules, Assignments, Rubrics, or
  Enrollment.
- **Positive**: The Course structure persistence module has a small interface;
  callers no longer need to know insertion order or foreign-key mapping.
- **Positive**: ADR-0002 is easier to preserve because Enrollment is written in
  the same transaction as the Course structure.
- **Negative / trade-offs**: Some implementation logic moves into PL/pgSQL,
  which is harder to unit-test with Vitest than TypeScript.
- **Risks**: The JSONB shape accepted by the function must stay aligned with
  `coursePreviewSchema`.
