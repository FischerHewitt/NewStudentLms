# ADR-0010: Assignment Content Blocks — synthesize, instructions stays canonical

**Date**: 2026-06-02
**Status**: Accepted

## Context

The Rich Assignment Editor (PRD issue #107) gives each Assignment an ordered list
of Content Blocks — `text`, `math`, or `download` — so the student Assignment view
can present structured content (instructions, rendered LaTeX, downloadable files)
in a teacher-controlled order, instead of a single plain `instructions` string.

The foundation slice (issue #108) must decide two things before any editor UI is
built, because both shape the persisted Assignment and the contract of the
transactional `publish_course_structure` function (ADR-0006):

1. **Where do Content Blocks come from** — does the syllabus-to-course AI emit
   them directly, or do we synthesize them after generation?
2. **What is the source of truth for an Assignment's text** — the `instructions`
   column, or the `text` block?

Constraints:

- ADR-0009 switched course generation off Groq tool mode to plain JSON because
  `llama-3.3-70b-versatile` was already failing on the simpler course schema. A
  richer nested schema reintroduces that failure risk.
- Many existing consumers read `assignments.instructions` directly: the AI
  SpeedGrader prompt builder, the Student Coach, `TeacherAssignmentView`, and the
  gradebook. Changing the source of truth for text touches all of them.

## Decision

**Decision 1 — Synthesize (AI unchanged).** Generation stays exactly as ADR-0009
left it. When a preview Assignment carries no `content_blocks`, none are persisted.
At read time, `getAssignmentBlocks` synthesizes a single `text` block from the
Assignment's `instructions`. This same code path serves both post-generation
synthesis and read-time backfill of Assignments created before Content Blocks
existed — no historical row migration is required.

**Decision 2 — `instructions` stays canonical.** `content_blocks` rides alongside
`instructions`; `instructions` remains the authoritative text. The first `text`
block is a view onto `instructions`; any further `text` blocks are ordered addenda.
Existing readers of `instructions` keep working untouched.

Block shape (carried in `coursePreviewSchema` so it round-trips through the
`generation_preview` JSONB, and persisted to a new `assignments.content_blocks`
JSONB column by `publish_course_structure`):

```ts
type ContentBlock = { id: string; kind: 'text' | 'math' | 'download'; label: string }
```

Both Option B alternatives (AI emits blocks; blocks become canonical) are recorded
as deferred work in `things-to-do.txt`. The persisted shape chosen here is
forward-compatible with both.

## Consequences

- **Positive**: zero change to the generation prompt/schema — no new generation
  failure modes, ADR-0009 behavior is preserved.
- **Positive**: synthesis and historical backfill are one function, so old and new
  courses render identically with no data migration.
- **Positive**: the AI SpeedGrader, Student Coach, gradebook, and teacher views
  that read `instructions` need no changes in this slice.
- **Positive**: `publish_course_structure` stays transactional — blocks are written
  in the same loop as the Assignment row (ADR-0006 preserved).
- **Negative / trade-offs**: the AI never pre-populates a `math` block even for an
  obviously math-heavy assignment; the teacher structures content manually.
- **Negative / trade-offs**: "first `text` block mirrors `instructions`, extras are
  addenda" is a convention the editor must enforce; it is not expressible in the
  schema alone.
- **Risks**: if multi-text-block authoring becomes a real need, Decision 2 must be
  revisited (deferred Option B), which is the higher-blast-radius change.
