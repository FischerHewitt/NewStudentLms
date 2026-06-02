# Implementation Plan: Demo Seed Overhaul

## Overview

10 tasks covering instructor name fixes, MATH 143 syllabus `## Assignments` section, demo copy-paste file, full seed rewrite, and commit/push. Tasks 1–3 are independent. Tasks 4–9 must run in order (each block of the seed depends on the previous). Task 10 runs last.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1, 2, 3, 4] },
    { "wave": 2, "tasks": [5] },
    { "wave": 3, "tasks": [6] },
    { "wave": 4, "tasks": [7] },
    { "wave": 5, "tasks": [8] },
    { "wave": 6, "tasks": [9] },
    { "wave": 7, "tasks": [10] }
  ]
}
```

Tasks 1, 2, 3 are independent file edits/creates. Task 4 creates the seed file fresh. Tasks 5–9 append to it in dependency order (courses → modules → assignments → enrollments → submissions → grades). Task 10 commits everything.

## Tasks

- [x] 1. Fix instructor names in all 6 syllabus fixture files
  - [x] 1.1 `lib/__tests__/fixtures/syllabi/math-143.txt` — replace "Prof. Montserrat Dabkowski" with "Dr. Fischer Hewitt"
  - [x] 1.2 `lib/__tests__/fixtures/syllabi/bio-111.txt` — replace "Prof. Weston Gonor" with "Dr. Fischer Hewitt"
  - [x] 1.3 `lib/__tests__/fixtures/syllabi/coms-101.txt` — replace "TBD" with "Dr. Fischer Hewitt"
  - [x] 1.4 `lib/__tests__/fixtures/demo/syllabi/math-143-syllabus.txt` — replace "Prof. Montserrat Dabkowski" with "Dr. Fischer Hewitt"
  - [x] 1.5 `lib/__tests__/fixtures/demo/syllabi/bio-111-syllabus.txt` — replace "Prof. Weston Gonor" with "Dr. Fischer Hewitt"
  - [x] 1.6 `lib/__tests__/fixtures/demo/syllabi/coms-101-syllabus.txt` — replace "TBD" with "Dr. Fischer Hewitt"
  - _Requirements: 1_

- [x] 2. Append `## Assignments` section to both MATH 143 syllabus files
  - [x] 2.1 Append to `lib/__tests__/fixtures/syllabi/math-143.txt` — full assignments list with Quiz 7 in complete detail (problem statement, instructions, 6-criterion rubric summing to 10 pts)
  - [x] 2.2 Append identical content to `lib/__tests__/fixtures/demo/syllabi/math-143-syllabus.txt`
  - _Requirements: 2_

- [x] 3. Create demo copy-paste submission file
  - [x] 3.1 Create `lib/__tests__/fixtures/demo/math-143-quiz7-submission.txt` with presenter instructions at top and Steps 1–4 of the polar tangent line solution (presenter types `= -1` as the final line live)
  - _Requirements: 3_

- [x] 4. Rewrite seed-test-data.sql — header and USERS block
  - [x] 4.1 Create `supabase/seed-test-data.sql` with header comment (quarter context, ID scheme, run-order instructions) and INSERT for 14 students (UUIDs `...003` through `...016`)
  - _Requirements: 4_

- [x] 5. Append COURSES and MODULES to seed-test-data.sql
  - [x] 5.1 Append BIO 111 and COMS 101 course rows with updated raw_syllabus values including "Instructor: Dr. Fischer Hewitt"
  - [x] 5.2 Append all BIO 111 modules (4 rows) and COMS 101 modules (5 rows)
  - _Requirements: 4, 5_

- [x] 6. Append ASSIGNMENTS and RUBRICS to seed-test-data.sql
  - [x] 6.1 Append all BIO 111 assignments and rubrics (modules 1–4, assignments 015–032)
  - [x] 6.2 Append all COMS 101 assignments and rubrics (modules 1–5, assignments 033–045)
  - _Requirements: 4_

- [x] 7. Append ENROLLMENTS to seed-test-data.sql
  - [x] 7.1 Append 30 enrollment rows: all 15 students in BIO 111 (001–015) and all 15 in COMS 101 (016–030)
  - _Requirements: 4_

- [x] 8. Append SUBMISSIONS to seed-test-data.sql
  - [x] 8.1 Append submissions for A030 BIO Course Reflection (12 rows: 4 final, 3 ai_suggested, 3 pending, 2 draft; 3 students blank)
  - [x] 8.2 Append submissions for A038 COMS Written Eval Round 1 (same distribution)
  - [x] 8.3 Append submissions for A040 COMS Analyzing Delivery Style (same distribution)
  - _Requirements: 4_

- [x] 9. Append GRADES and due dates to seed-test-data.sql
  - [x] 9.1 Append grade rows for all final-state submissions (12 rows with approved_at set, full feedback)
  - [x] 9.2 Append grade rows for all ai_suggested-state submissions (9 rows, approved_at NULL)
  - [x] 9.3 Append UPDATE statements for all assignment due dates (BIO 015–032, COMS 033–045)
  - _Requirements: 4_

- [x] 10. Commit and push all changes
  - [x] 10.1 Stage all modified and created files
  - [x] 10.2 Commit with message: "feat: demo seed overhaul — 15 students, BIO+COMS only, math-143 syllabus with Quiz 7"
  - [x] 10.3 Push to origin/main
  - _Requirements: 6_

## Notes

- Tasks 1, 2, 3 are independent of each other and of tasks 4–9. They can be done in any order.
- Tasks 4–9 must be done in sequence — each appends to the file created in task 4, and foreign key constraints require the order: users → courses → modules → assignments → enrollments → submissions → grades.
- The seed file already exists with the old content. Task 4 creates (overwrites) it fresh; tasks 5–9 append to it.
- After task 9, verify the file is valid PostgreSQL before committing (no unclosed strings, balanced parentheses).
