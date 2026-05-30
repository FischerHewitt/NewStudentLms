# ADR-0007: Course draft/published lifecycle

**Date**: 2026-05-30
**Status**: Accepted

## Context

The original domain model stated: "A Course has no draft or published state — once the
teacher confirms the generated structure, it is immediately persisted and visible to students."
This worked for the hackathon demo where the only creation path was syllabus → AI generate →
one-shot confirm.

As the product expands to support manual course building (adding Modules, Assignments,
Resources, Rubric criteria across multiple editing sessions), a half-built Course must not
be visible to enrolled students. A teacher may take days to finish building a course before
it is ready to share.

## Decision

Course gains a `status` field with two states:

- **draft** — only the teacher can see the Course; enrolled students have no access
- **published** — live to all enrolled students; the teacher explicitly triggers this

The teacher publishes a Course via an explicit "Publish Course" action. There is no automatic
publish on save. A published Course can be taken back to draft (unpublished) by the teacher,
which immediately hides it from students again.

This supersedes the "no draft/published state" statement in `docs/context/domain-model.md`.

## Consequences

- **Positive**: teachers can build and edit courses over multiple sessions without students
  seeing incomplete work; aligns with how every real LMS (Canvas, Blackboard, etc.) works
- **Positive**: the published transition is a clear, intentional action — no accidental
  course exposure
- **Negative / trade-offs**: adds a state to manage in RLS policies (students query must
  filter `status = 'published'`); the existing hackathon demo flow (generate → confirm →
  immediately navigate to course) needs an extra publish step or the confirm button becomes
  the publish action
- **Risks**: if the teacher forgets to publish, students see nothing — consider a prominent
  draft banner on the teacher's course view
