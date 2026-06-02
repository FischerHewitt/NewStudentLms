# Design Document

## Overview

Targeted edits to 6 existing fixture/seed files and creation of 2 new files. No application code changes. All changes are to syllabus text fixtures, a demo copy-paste file, and the SQL seed file.

## Architecture

This spec operates entirely on static data files — no runtime architecture changes. The relevant system components are:

- **Syllabus fixtures** (`lib/__tests__/fixtures/syllabi/` and `lib/__tests__/fixtures/demo/syllabi/`) — plain text files pasted into the course generator during demos and testing
- **Course generator** (`app/api/generate-course/route.ts`) — reads the `## Assignments` section as an authoritative override list when present
- **Seed file** (`supabase/seed-test-data.sql`) — run after `supabase db reset` to populate the demo database
- **Demo copy-paste file** (`lib/__tests__/fixtures/demo/math-143-quiz7-submission.txt`) — new file used by the presenter during the live demo

## Components and Interfaces

### Syllabus `## Assignments` section

The course generator system prompt contains this rule:
> If the input contains a `## Assignments` section, treat everything after it as the authoritative list of assignments (use their titles, instructions, and point values directly).

The MATH 143 syllabus will have this section appended. Each assignment entry must include:
- `title` — matches the assignment title the AI will generate
- `instructions` — student-facing, actionable
- `points_possible` — integer
- `rubric` — 2–6 criteria with descriptions and point values that sum to `points_possible`

Quiz 7 entry must be fully specified. All other assignments need title, brief description, and points only.

### Seed file structure

The seed file follows the existing ID scheme:
```
Users       00000000-0000-0000-0000-0000000000XX  (01=teacher, 02–16=students)
Courses     00000000-0000-0000-0001-0000000000XX  (02=BIO, 03=COMS)
Modules     00000000-0000-0000-0002-0000000000XX  (06–14)
Assignments 00000000-0000-0000-0003-0000000000XX  (015–045)
Rubrics     00000000-0000-0000-0004-0000000000XX  (015–045)
Enrollments 00000000-0000-0000-0005-0000000000XX  (001–030)
Submissions 00000000-0000-0000-0006-0000000000XX  (001–036)
Grades      00000000-0000-0000-0007-0000000000XX  (001–021)
```

All INSERT statements use `ON CONFLICT (id) DO NOTHING` for idempotency.

## Data Models

### Gradebook state distribution (per key assignment)

| Students | UUIDs | State | Grade row |
|----------|-------|-------|-----------|
| Alex Rivera, Jordan Lee, Maya Patel, Tyler Brooks | 002–005 | **final** | approved_at IS NOT NULL |
| Sam Nguyen, Priya Sharma, Marcus Johnson | 006–008 | **ai_suggested** | approved_at IS NULL |
| Sofia Reyes, Ethan Kim, Aaliyah Washington | 009–011 | **pending** | no grade row |
| Connor Murphy, Zoe Chen | 012–013 | **draft** | no grade row |
| Diego Flores, Hannah Okafor, Liam Patel | 014–016 | **blank** | no submission row |

### Quiz 7 rubric (6 criteria, 10 pts total)

| Criterion | Points |
|-----------|--------|
| Sets up parametric form x = r cosθ, y = r sinθ with r = 1+cosθ | 2 |
| Applies product rule to find dy/dθ — structure correct regardless of sign | 2 |
| Applies product rule to find dx/dθ — structure correct regardless of sign | 2 |
| Forms the ratio dy/dθ ÷ dx/dθ correctly from their expressions | 2 |
| Substitutes θ = π/2 and states a final numerical slope | 1 |
| Work is clearly organized and steps are labeled | 1 |

**Expected demo score:** 9/10. The sign error (writing = -1 instead of = 1) does not affect the method criteria. The substitution is shown so criterion 5 is earned. Criterion 6 is earned because steps are labeled.

## Correctness Properties

Property 1: The `## Assignments` section must list ALL assignments from the weekly schedule, not just Quiz 7. If any are missing, the generator may infer different assignments from the weekly schedule text.
**Validates: Requirements 2.2**

Property 2: Rubric criteria point values for Quiz 7 must sum exactly to 10. The generator validates this.
**Validates: Requirements 2.5**

Property 3: All 30 enrollment rows must be present before submissions are inserted (foreign key dependency).
**Validates: Requirements 4.5**

Property 4: Grade rows reference submission IDs — submissions must be inserted before grades.
**Validates: Requirements 4.9**

## Error Handling

- All INSERT statements use `ON CONFLICT (id) DO NOTHING` so the seed is safe to run multiple times.
- The seed file must be run after `supabase db reset` (which applies migrations and seed.sql). Running it before will fail on foreign key constraints for teacher and Alex Rivera.

## Testing Strategy

After running the seed, verify manually:
1. Teacher dashboard shows BIO 111 and COMS 101 with 15 students each
2. Gradebook for BIO Course Reflection shows all 4 states across the 15 students
3. Paste the MATH 143 syllabus into the course generator — Quiz 7 appears in Week 10 with the correct rubric
4. Paste the demo submission body + type `= -1` → submit → run SpeedGrader → score is 9/10
