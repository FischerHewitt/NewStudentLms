# Project Context

AI-native LMS hackathon MVP — competing with Canvas.

## One-sentence pitch

> We are building an AI-native LMS that turns a syllabus into a course, helps students learn responsibly, and helps teachers grade faster while keeping humans in control.

## Stack

Next.js · Supabase · Vercel AI SDK · deployed on Vercel

## Core demo loop

1. Teacher pastes a syllabus → AI generates course structure (modules, assignments, due dates)
2. Student views the course dashboard, sees upcoming work
3. Student opens an assignment, uses AI coach for help
4. Student submits a written response
5. Teacher opens AI SpeedGrader → AI suggests rubric score and feedback
6. Teacher approves or edits the grade
7. Final grade appears in the gradebook

## Focused context docs

Read only the doc relevant to your task:

| Doc | When to read it |
|-----|----------------|
| [`docs/context/product.md`](docs/context/product.md) | Product thesis, MVP scope, hackathon goals |
| [`docs/context/domain-model.md`](docs/context/domain-model.md) | Entities, glossary, data relationships |
| [`docs/context/ai-flows.md`](docs/context/ai-flows.md) | AI feature specs (syllabus generator, SpeedGrader, student coach) |
| [`docs/context/security.md`](docs/context/security.md) | Security constraints and trust model |
| [`docs/context/demo-scope.md`](docs/context/demo-scope.md) | Must-have vs nice-to-have, what we are NOT building |

## ADRs

Architectural decisions live in [`docs/adr/`](docs/adr/). Use [`docs/adr/0000-template.md`](docs/adr/0000-template.md) for new records.
