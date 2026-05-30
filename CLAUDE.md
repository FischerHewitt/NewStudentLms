# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server on port 8001
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest unit tests (excludes snapshot/e2e)
npm run test:slow    # vitest snapshot tests (real Groq API calls)
npm run test:e2e     # playwright e2e (requires dev server running on 8001)
npm run test:e2e:ui  # playwright interactive UI mode
```

Run a single vitest test file:
```bash
npx vitest run lib/__tests__/speedgrader.test.ts
```

## Architecture

**Stack**: Next.js 15 App Router · Supabase (Postgres + RLS) · Vercel AI SDK · Tailwind

**AI model**: Groq `llama-3.3-70b-versatile` via `@ai-sdk/groq` (ADR-0004). `GROQ_API_KEY` must be set in `.env.local`. Switching to Claude is a one-line model swap; `@ai-sdk/anthropic` is already in `package.json`.

### Request flow

```
app/page.tsx                 → HomeContent (role toggle, course list)
app/generate/                → GenerateFlow (syllabus → course preview → confirm)
  POST /api/generate-course  → streamObject with Groq → course_preview JSONB
  saveCourseStructure()      → calls DB function publish_course_structure() (ADR-0006)

app/course/[id]/             → CourseDashboard (teacher) or StudentDashboard
app/course/[id]/assignment/[aid]/ → AssignmentView (student submission)
app/course/[id]/speedgrader/[sid]/ → SpeedGrader (teacher grading)
```

### Key layers

- **`app/actions/`** — Next.js Server Actions; one file per domain area (`course.ts`, `assignment.ts`, `speedgrader.ts`, `gradebook.ts`, `dashboard.ts`). All DB writes go through here.
- **`lib/`** — pure business logic (no Next.js dependencies). Each file is independently testable. Vitest tests live in `lib/__tests__/`.
- **`app/api/`** — streaming API routes for AI flows: `generate-course`, `student-coach`, `parse-document`, `upload`.
- **`lib/supabase/`** — `browser.ts` (client-side client), `server.ts` (Server Action client), `course.ts` (course-specific queries).
- **`context/RoleContext.tsx`** — client-side role toggle (teacher/student). The active role maps to a hard-coded UUID from `lib/constants.ts` (`TEACHER_ID`, `STUDENT_ID`).
- **`lib/routes.ts`** — canonical URL builders (`courseHref`, `assignmentHref`, `speedgraderHref`).

### Database

Supabase Postgres. Migrations live in `supabase/migrations/`. `supabase/seed.sql` seeds the two hard-coded demo users and test course data. The `publish_course_structure` DB function (ADR-0006) atomically inserts Modules, Assignments, Rubrics, and Enrollment in one transaction.

### Test structure

- **Vitest unit** (`lib/__tests__/*.test.ts`) — pure logic, no DB. Fast.
- **Vitest snapshot** (`**/snapshots/**`) — real Groq API calls; excluded from `npm run test`, run with `npm run test:slow`.
- **Playwright e2e** (`tests/`) — full browser against the running dev server on port 8001.
- **Integration** (`lib/__tests__/integration/`) — tests that need a real DB connection.

## Agent skills

### Issue tracker

Issues live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Hybrid single-context layout: root `CONTEXT.md` as concise index, focused docs under `docs/context/`. See `docs/agents/domain.md`.

### Multi-agent coordination

Multiple AI agents (Claude, Codex, Kiro, ChatGPT, etc.) may work on this repo in parallel. Three-tier merge policy: auto-merge for low-risk issues, merge-manager agent for medium-risk, human review for schema/auth/grading/ADR changes. See `docs/agents/multi-agent.md`.

## Dev server

- **Do not start a dev server on port 3000 or 8000.** Those ports are reserved. Use a different port (e.g. `next dev -p 3001`) or ask the user which port to use.
- **At the start of every new session**, check whether the dev server is already running on port 8001. If it is not, start it automatically in the background with `npm run dev` (which runs `next dev -p 8001`). Do not wait for the user to ask. Check with: `lsof -ti:8001`.

## Agent behavior rules

- **Prefer vertical slices over broad rewrites.** Implement one end-to-end slice (route → server action → DB → UI) at a time. Do not refactor unrelated code while adding a feature.
- **Do not casually rename domain concepts.** The glossary in `docs/context/domain-model.md` defines canonical terms. If a rename is warranted, propose it explicitly and update the glossary.
- **Propose an ADR before reversing major architecture or product decisions.** If your implementation contradicts an existing ADR, surface the conflict and write a new ADR in `docs/adr/` before proceeding. Use `docs/adr/0000-template.md` as the starting point.
