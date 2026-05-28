# Domain Model

Core entities, relationships, and canonical vocabulary for the AI-native LMS.

## Entities

### Course
The top-level container. Has a teacher, a title, a raw syllabus, a generation preview, and a generated course structure. A Course has no draft or published state — once the teacher confirms the generated structure, it is immediately persisted and visible to students.

Key fields: `id`, `title`, `teacher_id`, `raw_syllabus`, `generation_preview` (JSONB, nullable), `created_at`

### Module
A unit within a course — typically a week or topic. Generated from the syllabus.

Key fields: `id`, `course_id`, `title`, `description`, `order`, `week_number`

### Assignment
A piece of work within a module. Has instructions, a due date, point value, and an attached Rubric.

Key fields: `id`, `module_id`, `course_id`, `title`, `instructions`, `due_date`, `points_possible`, `rubric_id`

### Rubric
The grading criteria for an Assignment. Defines what a good submission looks like and how points are allocated. Used by the AI SpeedGrader to evaluate Submissions.

Key fields: `id`, `assignment_id`, `criteria` (array of `{ description, points }`)

### Enrollment
A record that a specific student has access to a specific Course. Created when the teacher generates a course (the seeded student is auto-enrolled). The Gradebook is built from Enrollments — one row per enrolled student — not from Submissions, so students with no Submissions still appear as blank rows.

Key fields: `id`, `course_id`, `student_id`, `enrolled_at`

### Submission
A student's written response to an Assignment.

Key fields: `id`, `assignment_id`, `student_id`, `body`, `submitted_at`, `status` (draft | submitted | graded)

- **draft** — student has started writing but not yet submitted.
- **submitted** — student has submitted; body is locked and cannot be edited. Awaiting grading.
- **graded** — the associated Grade has been published (teacher confirmed). Set when `Grade.approved_at` is written.

### Grade
The grading record for a Submission. Created when the AI SpeedGrader runs; published when the teacher confirms it. Tracks both the AI Suggested Grade and the Final Grade in one row.

Key fields: `id`, `submission_id`, `ai_suggested_score`, `ai_suggested_feedback` (text), `final_score`, `final_feedback` (text), `approved_by`, `approved_at`

- **Pending Grade** — a Grade where `approved_at` is null. The AI Suggested Grade and draft feedback are written at this point. Invisible to the student. The teacher may edit `final_score` and `final_feedback` before confirming.
- **Published Grade** — a Grade where `approved_at` is set. Triggered by the teacher clicking Approve. The Final Grade and Feedback become visible to the student at this moment.
- **AI Suggested Grade** — the draft score and rationale produced by the AI SpeedGrader. Read-only after creation; the teacher works on the final fields, not the AI suggestion.
- **Final Grade** — the teacher-approved score stored in the gradebook and visible to students once the Grade is published.

### User
Teacher or student. For the MVP, the database is seeded with exactly two hard-coded Users: one teacher and one student, each with a fixed UUID. The role toggle switches which User is active client-side. All Submissions reference the seeded student's UUID as `student_id`. Real authentication can be added later by mapping auth UIDs to these rows.

Key fields: `id`, `email`, `role` (teacher | student), `name`, `speedgrader_autorun` (boolean, default false)

- **speedgrader_autorun** — teacher preference. When true, the AI SpeedGrader runs automatically when the teacher opens a Submission. When false (default), the teacher triggers it manually via a button.

## Relationships

```
Course → Module (one-to-many)
Course → Enrollment (one-to-many)
Module → Assignment (one-to-many)
Assignment → Rubric (one-to-one)
Assignment → Submission (one-to-many, one per enrolled student)
Submission → Grade (one-to-one)
User → Enrollment (student is enrolled)
User → Submission (student submits)
User → Grade.approved_by (teacher approves)
```

## Glossary

| Term | Definition |
|------|------------|
| **Syllabus** | Raw text pasted by a teacher, used to generate a Course structure |
| **Course structure** | AI-generated set of Modules, Assignments, and due dates derived from a Syllabus |
| **Module** | A course unit (week/topic) containing Assignments |
| **Assignment** | A task given to students with instructions, due date, and a Rubric |
| **Rubric** | Grading criteria attached to an Assignment, used by AI SpeedGrader to evaluate Submissions |
| **Submission** | A student's text response to an Assignment |
| **AI Suggested Grade** | Draft score produced by the AI SpeedGrader; read-only after creation; never visible to the student |
| **Pending Grade** | A Grade where `approved_at` is null; visible to the teacher only |
| **Published Grade** | A Grade where `approved_at` is set; the Final Grade and Feedback become visible to the student |
| **Final Grade** | The teacher-confirmed score on a Published Grade; shown in the gradebook and visible to the student |
| **Feedback** | Text message explaining a grade, stored as two plain-text columns on Grade: `ai_suggested_feedback` (AI draft) and `final_feedback` (teacher-confirmed, visible to student) |
| **AI SpeedGrader** | Feature that reads a Submission + Rubric and suggests an AI Suggested Grade and Feedback |
| **AI coach** | Student-facing assistant that helps understand Assignments without writing the answer |
| **Enrollment** | A record that a student has access to a Course. Created automatically when the teacher generates a course. Drives Gradebook rows — enrolled students appear even with no Submissions |
| **Gradebook** | Table view of all enrolled students × Assignments for a Course. Each cell shows one of four states: blank (no Submission), Pending (Submission exists, no Grade yet), AI suggested score in muted style (Pending Grade), or confirmed Final Grade in full weight (Published Grade) |
| **Role toggle** | MVP mechanism for switching between teacher and student views |

## Avoid these synonyms (use the glossary terms above)

- Say **Module**, not "Unit", "Week", or "Chapter"
- Say **Submission**, not "Response", "Work", or "Answer"
- Say **AI SpeedGrader**, not "AI Grader" or "Auto-grader"
- Say **AI coach**, not "AI tutor" or "AI assistant"
- Say **Course structure**, not "Course outline" or "Curriculum"
- Say **Final Grade**, not "Approved grade" or "Teacher grade"
- Say **AI Suggested Grade**, not "AI grade" or "Draft grade"
- Say **Feedback**, not "Comment" or "Note"
