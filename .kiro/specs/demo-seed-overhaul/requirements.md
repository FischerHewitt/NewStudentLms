# Requirements Document

## Introduction

Rebuild the demo seed data to support a live hackathon demo of Alumos. The demo shows:
1. BIO 111 and COMS 101 pre-loaded with 15 students and realistic gradebook data
2. MATH 143 generated live from a syllabus paste during the demo
3. A student (Alex Rivera) submitting a polar tangent line problem with a sign error
4. The teacher autograding and receiving ~90% because method is correct but final arithmetic is wrong

## Glossary

| Term | Definition |
|------|------------|
| **seed-test-data.sql** | The SQL file run after `supabase db reset` to populate the demo database with courses, students, submissions, and grades |
| **key assignment** | One of the 3 AI-gradeable text assignments used for SpeedGrader demos: BIO Course Reflection, COMS Written Eval Round 1, COMS Analyzing Delivery Style |
| **gradebook state** | One of four states a student's assignment can be in: blank (no submission), draft, pending (submitted, no grade), ai_suggested (grade not approved), or final (grade approved) |
| **Quiz 7** | The polar tangent line assignment seeded into the MATH 143 syllabus via the `## Assignments` section, used for the live SpeedGrader demo |
| **sign error** | The deliberate mistake in the demo submission: writing $\frac{-1}{-1} = -1$ instead of $= 1$ at the final step |

## Requirements

### Requirement 1: Fix instructor names in syllabus fixtures

**User Story:** As a demo presenter, I want all syllabus files to show "Dr. Fischer Hewitt" as the instructor, so that the demo is consistent and professional.

#### Acceptance Criteria

1. `lib/__tests__/fixtures/syllabi/math-143.txt` — "Prof. Montserrat Dabkowski" replaced with "Dr. Fischer Hewitt"
2. `lib/__tests__/fixtures/syllabi/bio-111.txt` — "Prof. Weston Gonor" replaced with "Dr. Fischer Hewitt"
3. `lib/__tests__/fixtures/demo/syllabi/math-143-syllabus.txt` — same swap as criterion 1
4. `lib/__tests__/fixtures/demo/syllabi/bio-111-syllabus.txt` — same swap as criterion 2
5. `lib/__tests__/fixtures/syllabi/coms-101.txt` — "TBD" replaced with "Dr. Fischer Hewitt"
6. `lib/__tests__/fixtures/demo/syllabi/coms-101-syllabus.txt` — "TBD" replaced with "Dr. Fischer Hewitt"

### Requirement 2: Add ## Assignments section to MATH 143 syllabus

**User Story:** As a demo presenter, I want the MATH 143 syllabus to contain an authoritative assignments list, so that when I paste it into the course generator, Quiz 7 is always generated with the exact rubric needed for the SpeedGrader demo.

#### Acceptance Criteria

1. Both `lib/__tests__/fixtures/syllabi/math-143.txt` and `lib/__tests__/fixtures/demo/syllabi/math-143-syllabus.txt` have an `## Assignments` section appended
2. The section lists every assignment from the weekly schedule: Homework 1–8, Quiz 1–7, Midterm 1, Midterm 2, Midterm 1 Reflection, Final Exam
3. Quiz 7 is titled "Quiz 7 – Polar Tangent Lines" with 10 points possible
4. Quiz 7 instructions ask the student to find the slope of the tangent line to r = 1 + cosθ at θ = π/2, showing all steps: parametric form, product rule differentiation of dy/dθ and dx/dθ, forming the ratio, and substituting θ = π/2
5. Quiz 7 rubric has exactly 6 method-agnostic criteria summing to 10 pts: parametric setup (2), dy/dθ structure (2), dx/dθ structure (2), ratio formation (2), substitution and final slope (1), organized work (1)
6. All other assignments listed with title, brief description, and points only

### Requirement 3: Create demo copy-paste submission file

**User Story:** As a demo presenter, I want a ready-to-paste text file containing Steps 1–3 of the Quiz 7 solution, so that I only need to type the final line live during the demo.

#### Acceptance Criteria

1. File created at `lib/__tests__/fixtures/demo/math-143-quiz7-submission.txt`
2. Top of file contains clear instructions: paste this text into the submission box, then type the final line live as `$\frac{-1}{-1} = -1$`
3. Body contains Steps 1–3 of the polar tangent line solution, all mathematically correct
4. Step 4 (the final substitution arithmetic) is NOT included in the file — that is typed live
5. The only error in the complete submission is writing = -1 instead of = 1 at the final step

### Requirement 4: Rewrite supabase/seed-test-data.sql

**User Story:** As a demo presenter, I want the seed file to have 15 students with realistic data across BIO 111 and COMS 101 only, so that the gradebook looks populated and I can test as any student.

#### Acceptance Criteria

1. All MATH 143 data removed: course, modules, assignments, rubrics, enrollments, submissions, and grades
2. 10 new student users added with UUIDs `...007` through `...016`: Priya Sharma, Marcus Johnson, Sofia Reyes, Ethan Kim, Aaliyah Washington, Connor Murphy, Zoe Chen, Diego Flores, Hannah Okafor, Liam Patel
3. Existing students kept unchanged: Jordan Lee (`...003`), Maya Patel (`...004`), Tyler Brooks (`...005`), Sam Nguyen (`...006`)
4. BIO 111 and COMS 101 course, module, assignment, and rubric rows are identical to the previous seed
5. All 15 students enrolled in both BIO 111 and COMS 101 (30 enrollment rows total)
6. Submissions seeded for 3 key assignments only: A030 BIO Course Reflection, A038 COMS Written Eval Round 1, A040 COMS Analyzing Delivery Style
7. Each key assignment has all gradebook states represented: 4 final (Alex Rivera always included), 3 ai_suggested, 3 pending, 2 draft, 3 blank
8. Strong submission bodies are 300–500 words and specific; weak bodies are vague or short; draft bodies are incomplete sentences
9. Grade rows include ai_suggested_feedback with per-criterion point breakdown
10. All INSERT statements use ON CONFLICT (id) DO NOTHING and the file is valid PostgreSQL

### Requirement 5: Update raw_syllabus strings in seed-test-data.sql

**User Story:** As a demo presenter, I want the seeded course records to show the correct instructor name, so that the course detail view is consistent with the syllabus fixtures.

#### Acceptance Criteria

1. BIO 111 raw_syllabus value in seed-test-data.sql includes "Instructor: Dr. Fischer Hewitt"
2. COMS 101 raw_syllabus value in seed-test-data.sql includes "Instructor: Dr. Fischer Hewitt"

### Requirement 6: Commit and push all changes

**User Story:** As a developer, I want all changes committed and pushed in a single commit, so that the demo environment can be reset from a clean state.

#### Acceptance Criteria

1. All modified and created files are staged
2. Commit message is: "feat: demo seed overhaul — 15 students, BIO+COMS only, math-143 syllabus with Quiz 7"
3. Changes pushed to origin/main successfully
