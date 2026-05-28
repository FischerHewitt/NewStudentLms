# PRD: AI-Native LMS — First Demo Loop

**Labels**: `ready-for-agent`
**Scope**: Hackathon MVP — first complete demo loop only
**Stack**: Next.js · Supabase · Vercel AI SDK · Vercel

---

## Problem Statement

Teachers spend hours manually structuring courses from syllabi, and spend more hours grading submissions from a blank screen. Students receive a long syllabus and are left to interpret it alone. Canvas — the dominant LMS used by most universities — was designed before the AI era. It has AI features bolted on as sidebar tools, not woven into the core workflows. Its recent high-profile security incidents have further eroded institutional trust.

The result: teachers do repetitive structural work that AI could handle, students lack guided learning support at the moment they need it, and grading is slow and inconsistent.

---

## Solution

An AI-native LMS where AI is embedded in the three moments that matter most:

1. **Course creation** — teacher pastes a syllabus; AI generates the full course structure (modules, assignments, due dates, rubrics) in seconds. Teacher reviews and confirms.
2. **Student learning** — student opens an assignment, gets AI coaching that helps them think and plan without doing the work for them.
3. **Grading** — teacher opens a submission; AI reads it against the rubric and drafts a score and feedback. Teacher approves or edits. Final grade is always teacher-controlled.

This is not Canvas with a chatbot. The AI is the primary interface for the workflows that eat the most teacher time.

---

## Product Thesis: The Sleeping Giant Argument

Canvas helped replace Blackboard by being easier to use. It is now the incumbent — dominant, widely deployed, and built before the AI era. Its architecture reflects that: AI has been grafted onto a product that was never designed for it.

Our position: **the next LMS should be AI-native from the first line of code.** Not AI as a feature. AI as the core workflow for the two hardest parts of teaching — building a course and giving feedback.

The security angle strengthens this: Canvas's recent vulnerabilities remind institutions that the platform handling their most sensitive educational data should be modern, auditable, and trustworthy. We build with that posture from day one.

**The pitch in one sentence:**
> Canvas is a legacy LMS with AI bolted on. We are building the LMS that should have existed when AI arrived.

---

## Target Users

### Teacher (hackathon demo: one seeded user)
A university instructor who needs to stand up a course quickly, review student work, and give meaningful feedback without spending their evenings on it. They want AI help but need to stay in control — their name is on the grade.

### Student (hackathon demo: one seeded user)
A university student who wants to understand what is expected, get unstuck without cheating, and see feedback that explains their grade. They are overwhelmed by dense syllabi and blank assignment pages.

For the hackathon demo, both users are seeded with fixed UUIDs. A client-side role toggle switches between them. No real authentication is required.

---

## First Demo Loop

This is the only loop that must work flawlessly for the demo. Every must-have feature exists to serve it.

| Step | Actor | Action | System response |
|------|-------|--------|----------------|
| 1 | Teacher | Opens the app | Course dashboard (empty state with "Create from syllabus" CTA) |
| 2 | Teacher | Pastes a syllabus and clicks Generate | AI streams course structure: modules, assignments, due dates, rubrics |
| 3 | Teacher | Reviews generated structure, clicks Save | Course, Modules, Assignments, Rubrics written to DB; student auto-enrolled |
| 4 | Teacher | Switches to student view via role toggle | Student sees course dashboard with modules and upcoming assignments |
| 5 | Student | Opens an assignment | Assignment page: instructions, due date, points possible, text submission area |
| 6 | Student | Types a response and clicks Submit | Submission locked (status: submitted); teacher notified in gradebook |
| 7 | Teacher | Switches back to teacher view, opens gradebook | Gradebook shows student row with "Pending" cell for the submitted assignment |
| 8 | Teacher | Clicks into the submission, clicks "Run AI SpeedGrader" | AI reads submission + rubric, streams suggested score and feedback draft |
| 9 | Teacher | Edits feedback if desired, clicks Approve | Grade published; Submission status → graded; Final Grade appears in gradebook |
| 10 | Student | Switches to student view, opens gradebook | Sees Final Grade and feedback for the assignment |

**Total demo time: ~3 minutes.** Every step must be visually compelling and load fast.

---

## User Stories

### Course generation
1. As a teacher, I want to paste a raw syllabus and click one button, so that I do not have to manually create modules, assignments, and due dates.
2. As a teacher, I want to see the AI-generated course structure appear progressively as it streams, so that the generation feels fast and alive.
3. As a teacher, I want to review the generated modules and assignments before they are saved, so that I can catch errors before students see them.
4. As a teacher, I want to edit the generated course structure in the review UI before saving, so that I can adjust titles, instructions, or due dates.
5. As a teacher, I want the generated structure to be preserved if I close the tab after generation, so that I do not lose my work if I navigate away before saving.
6. As a teacher, I want the saved course to immediately be visible in the student view, so that I can demonstrate the full loop without extra steps.

### Course and module navigation
7. As a teacher, I want to see a course dashboard listing all modules and upcoming assignments, so that I have an overview of the course I just created.
8. As a student, I want to see the course dashboard with modules and upcoming assignments and their due dates, so that I know what work is coming up.
9. As a student, I want to open a module and see the assignments inside it, so that I can navigate the course structure.

### Assignment and submission
10. As a student, I want to open an assignment and read the instructions and due date, so that I understand what is expected.
11. As a student, I want to write my response in a text area and submit it, so that my teacher can see my work.
12. As a student, I want my submission to be locked after I submit, so that I cannot accidentally change it after the teacher has seen it.
13. As a student, I want to see that my submission was received (status: submitted), so that I know it is in the teacher's queue.

### AI SpeedGrader
14. As a teacher, I want to open a student's submission and click a button to run the AI SpeedGrader, so that I get a suggested grade and feedback without starting from a blank screen.
15. As a teacher, I want the AI SpeedGrader to evaluate the submission against the assignment rubric specifically, so that the suggested grade reflects the stated criteria.
16. As a teacher, I want to see the AI's suggested score and its rationale, so that I understand why the AI graded it that way.
17. As a teacher, I want to see a draft feedback message addressed to the student, so that I can approve it or edit it before it is sent.
18. As a teacher, I want to edit the final score before approving, so that I am always in control of the grade.
19. As a teacher, I want to edit the feedback message before approving, so that I can personalize it or correct the AI's tone.
20. As a teacher, I want to click Approve to publish the grade and feedback to the student, so that the student can see it.
21. As a teacher, I want the AI's original suggested score to remain visible even after I edit it, so that I can compare my decision to the AI's recommendation.
22. As a teacher with the autorun setting enabled, I want the SpeedGrader to run automatically when I open a submission, so that I do not have to click a button each time.
23. As a teacher, I want to toggle the autorun setting on or off, so that I can choose my preferred grading workflow.

### Gradebook
24. As a teacher, I want to see a gradebook showing all enrolled students and all assignments in one table, so that I can track grading progress at a glance.
25. As a teacher, I want blank gradebook cells to indicate no submission yet, so that I know which students have not submitted.
26. As a teacher, I want gradebook cells to show "Pending" when a student has submitted but I have not yet graded it, so that I know which submissions are in my queue.
27. As a teacher, I want gradebook cells to show the AI suggested score in a muted style when the SpeedGrader has run but I have not yet approved, so that I can see grading progress before confirming.
28. As a teacher, I want gradebook cells to show the Final Grade in full weight once I have approved, so that I can see confirmed grades clearly.
29. As a student, I want to see my Final Grade and feedback in my gradebook view after the teacher approves, so that I know how I did and why.
30. As a student, I want to see blank or "Pending" states for assignments not yet graded, so that I know my work has been received and is being reviewed.

### Role toggle
31. As a demo presenter, I want a visible role toggle that switches between the teacher and student views, so that I can show both experiences in the same demo session without logging in and out.

---

## Implementation Decisions

### Data model (settled — see ADRs 0001–0003)

Eight tables. Schema is normalized except for two deliberate flattenings:

```
users              id, email, role, name, speedgrader_autorun
courses            id, title, teacher_id, raw_syllabus, generation_preview (JSONB), created_at
enrollments        id, course_id, student_id, enrolled_at
modules            id, course_id, title, description, order, week_number
assignments        id, module_id, course_id, title, instructions, due_date, points_possible
rubrics            id, assignment_id, criteria (JSONB: [{description, points}])
submissions        id, assignment_id, student_id, body, submitted_at, status (draft|submitted|graded)
grades             id, submission_id, ai_suggested_score, ai_suggested_feedback,
                   final_score, final_feedback, approved_by, approved_at
```

**Key invariants from ADRs:**
- Feedback is two text columns on Grade (not a separate table) — ADR-0001
- Enrollment drives the Gradebook; student rows appear even without submissions — ADR-0002
- Grade is created on SpeedGrader run (Pending); published only when `approved_at` is set — ADR-0003
- Any query surfacing grades to students must filter `approved_at IS NOT NULL`
- `ai_suggested_score` and `ai_suggested_feedback` are read-only after creation
- Submission `body` is locked (immutable) once `status = submitted`

**Seed data:** One migration seeds two Users with fixed UUIDs — one teacher, one student. No other data is pre-seeded; the course is generated live during the demo.

### Module 1 — DB Schema + Seed Migration
One Supabase migration file creates all 8 tables with the correct types, foreign keys, and indexes. A separate seed script inserts the two hard-coded Users. No RLS for the MVP — all rows are readable by the app's service role key. Real RLS is a post-hackathon concern documented in `docs/context/security.md`.

### Module 2 — Course Generator Server Action
A Next.js Server Action that accepts `raw_syllabus: string`. It calls Vercel AI SDK `streamObject` with a Zod schema matching the generation output shape. As the stream completes, it writes the full JSON blob to `courses.generation_preview`. The client streams the result into React state for progressive rendering.

A pure helper function `explodeCoursePreview(preview: GenerationPreview): { modules, assignments, rubrics }` converts the JSONB into the normalized row shapes. On teacher "Save", a second Server Action calls `explodeCoursePreview`, bulk-inserts Module, Assignment, and Rubric rows, then creates an Enrollment for the seeded student.

This is a deep module: `explodeCoursePreview` is a pure function with no side effects and is the most important function to test in isolation.

### Module 3 — Course Dashboard (Teacher + Student)
A single route that renders differently based on the active role. Teacher view: full module list, assignment list with submission counts, link to Gradebook, link to SpeedGrader for pending submissions. Student view: module cards with assignment cards showing due date and submission status (not submitted / submitted / graded). Both views read from the same Course + Module + Assignment + Submission + Enrollment tables.

### Module 4 — Assignment Page + Submission Server Action
The assignment page shows the title, instructions, due date, and points possible. For the student role: a text area for writing, a Submit button (disabled once submitted), and a status indicator. A Server Action handles the submit transition: validates `status = draft`, sets `status = submitted`, sets `submitted_at`, and freezes `body`.

### Module 5 — AI SpeedGrader Server Action + Approval Action
Two Server Actions:
- `runSpeedGrader(submissionId)` — fetches the Submission body, Assignment instructions, and Rubric criteria; builds a prompt; calls Vercel AI SDK (`streamObject` or `generateObject`); creates a Pending Grade row with `ai_suggested_score` and `ai_suggested_feedback`.
- `approveGrade(gradeId, finalScore, finalFeedback)` — validates `approved_at IS NULL` (idempotency guard), sets `final_score`, `final_feedback`, `approved_by`, `approved_at`; updates `submissions.status` to `graded`.

The teacher UI pre-populates the editable fields from the AI suggestion. The AI suggestion fields are displayed as read-only reference values throughout.

The `speedgrader_autorun` User preference is read client-side on the submission page. If true, the page fires `runSpeedGrader` on mount.

### Module 6 — Gradebook Query
A pure function `gradebookCellState(submission, grade): CellState` maps the four states:
- No submission → `{ type: 'blank' }`
- Submission, no Grade → `{ type: 'pending' }`
- Pending Grade (`approved_at` null) → `{ type: 'ai-suggested', score: grade.ai_suggested_score }`
- Published Grade → `{ type: 'final', score: grade.final_score }`

The Gradebook page queries: all Enrollments for the Course → for each enrolled student, all Assignments → left-join Submissions and Grades. One query, rendered as a student × assignment grid.

### Module 7 — Role Toggle + User Preferences
A persistent client-side context (React context + localStorage) tracks which seeded User UUID is currently active: teacher or student. The toggle is a visible UI element present on all pages. A simple settings panel (teacher view only) reads and writes `users.speedgrader_autorun` via a Server Action.

### AI flows (see `docs/context/ai-flows.md`)

**Syllabus Generator** — `streamObject` with a Zod schema. The schema enforces the full Course structure shape including nested rubric criteria. Stream renders progressively in the review UI.

**SpeedGrader** — `generateObject` or `streamObject`. Input: submission body + assignment instructions + flattened rubric criteria text. Output: `{ suggested_score: number, rationale: string, feedback_draft: string }`. The rationale is shown to the teacher only; feedback_draft becomes the editable `final_feedback` field.

**AI model** — Claude via Vercel AI SDK. The same model handles both flows. No fine-tuning. System prompts are stored as constants in the Server Actions.

### Security / trust invariants

- All AI API keys are server-side only. Never passed to the client. All AI calls go through Server Actions.
- Students never see a Grade where `approved_at IS NULL`. Enforced in the Gradebook query and the student-facing grade view.
- `ai_suggested_score` and `ai_suggested_feedback` are set once and never updated. The teacher edits `final_score` and `final_feedback` only.
- Submission `body` cannot be modified after `status = submitted`. Enforced in the Server Action.
- The role toggle is client-side only — it is not a security boundary. For the demo, this is acceptable. Real RLS is documented for post-hackathon.
- No real student data is used anywhere in the demo.

---

## Testing Decisions

### What makes a good test here
Test external behavior and invariants, not implementation details. The most valuable tests are for the pure functions that encode decisions — if these break, the demo breaks or produces incorrect grades.

### Modules to test

**`explodeCoursePreview(preview)` — highest priority**
- Given a valid `generation_preview` JSON, returns the correct number of Module, Assignment, and Rubric row shapes
- Given a preview with missing or malformed rubric criteria, handles gracefully (returns empty criteria array, does not throw)
- Rubric `criteria` points sum matches `assignment.points_possible`

**`gradebookCellState(submission, grade)` — high priority**
- Returns `blank` when submission is null
- Returns `pending` when submission exists and grade is null
- Returns `ai-suggested` with correct score when grade exists but `approved_at` is null
- Returns `final` with correct score when `approved_at` is set

**Submission status transition — high priority**
- A `submitted` submission cannot be transitioned back to `draft`
- A `graded` submission cannot be transitioned to `submitted`
- The `approveGrade` Server Action is idempotent: calling it twice does not overwrite `approved_at` or `approved_by`

**SpeedGrader prompt builder — medium priority**
- Given submission body, instructions, and rubric criteria, produces a prompt string that contains all three inputs
- Handles empty rubric criteria without crashing

### What not to test
- The AI model's output quality (non-deterministic)
- Streaming behavior (integration concern, not unit)
- The Supabase client itself
- UI rendering details

---

## Judging Strategy

### Solves the problem
The demo loop must close end-to-end in under 3 minutes. The judge should see: messy syllabus in → organized course out → student submits → AI grades → teacher approves → grade in gradebook. Every step is visible. There is no "trust me, it works" moment.

The contrast with Canvas should be stated explicitly in the pitch: Canvas requires a teacher to manually create each module, assignment, rubric, and due date. We do it in one paste.

### Presentation quality
- The UI should look like a real LMS, not a hackathon prototype. Use a design system (shadcn/ui or similar). Show a real course dashboard with module cards, assignment cards, and a proper gradebook table.
- The AI generation should stream visibly — watching course structure appear in real time is the most compelling moment in the demo. Do not hide it behind a spinner.
- The SpeedGrader should show the AI's reasoning alongside the score. A judge who sees "AI suggested 82/100 because the student addressed criterion 1 and 2 but missed criterion 3" will remember it.
- The role toggle should be prominent and labeled clearly. Judges need to understand they are seeing two different user experiences.

### Projected savings
Prepare concrete estimates for the pitch:
- **Course setup**: Average time to structure a course manually in Canvas: ~4–6 hours per semester. With syllabus generator: ~10 minutes for review and save.
- **Grading**: Average time per submission without AI assistance: ~5–10 minutes. With AI SpeedGrader: ~1–2 minutes (review + approve). For a class of 30 students, that is 2–4 hours saved per assignment.
- **Frame it as a teaching tax**: teachers spend 30–40% of their time on administrative work that AI can now absorb. This product returns that time to actual teaching.

---

## Demo Script Outline

> Presenter controls the app. Switches roles visibly. Narrates each moment.

**[0:00] Open the app as teacher**
> "This is our AI-native LMS. Right now the teacher has an empty course. Let me paste in a real university syllabus."

**[0:15] Paste syllabus, click Generate**
> "Watch what happens."
*(AI streams course structure — modules, assignments, due dates, rubrics appear in real time)*
> "In about 10 seconds, we have a fully structured course. The teacher reviews it, makes any edits, and clicks Save."

**[0:45] Click Save, switch to student view via role toggle**
> "Now I'm the student. I can see my course — all the modules, all the upcoming assignments, all the due dates. Exactly what I'd see in Canvas, but it was built in 10 seconds, not 6 hours."

**[1:00] Open an assignment, write a response, submit**
> "I'll submit a response to this assignment."
*(Types a short response, clicks Submit)*
> "Submission locked. Now back to the teacher."

**[1:20] Switch to teacher view, open gradebook**
> "The gradebook shows the student's submission is pending. I'll open it."

**[1:35] Click "Run AI SpeedGrader"**
> "The AI reads the submission against the rubric."
*(Score and feedback appear)*
> "It suggests an 80 out of 100, explains why, and drafts feedback for the student. I can edit this — let me adjust the wording — and approve."

**[1:55] Click Approve, switch to student view**
> "The student can now see their grade and feedback."

**[2:05] Show gradebook in student view**
> "And it shows up in the gradebook. That's the full loop. Syllabus to grade in 2 minutes."

**[2:15] Close pitch**
> "Canvas requires hours of manual setup and grading from a blank screen. We built the LMS for the AI era — AI-native from the first line of code, with the teacher always in control."

---

## Out of Scope

The following are explicitly not part of this PRD. Do not implement them to hit the demo deadline:

- AI student coach (nice-to-have; add only if demo loop is complete with time remaining)
- Calendar view
- Quiz generator
- Discussion board
- Rubric builder UI (rubrics are AI-generated, not manually built)
- File upload for submissions
- Real Supabase Auth / Row Level Security
- Multiple courses or multiple students
- Announcements or notifications
- Admin roles
- Student progress indicators or analytics
- Activity logs or audit trails
- Email or magic link authentication
- Mobile layout
- LTI, SIS, or any external integrations

---

## Further Notes

### Publish this PRD to GitHub Issues
Once the GitHub repo is created (`gh repo create`), publish this PRD as a GitHub Issue:

```bash
gh issue create \
  --title "Demo Loop v1 — AI-Native LMS MVP" \
  --label "ready-for-agent" \
  --body-file docs/prd/demo-loop-v1.md
```

### Breaking this PRD into implementation issues
Use `/to-issues` to break this PRD into independently-grabbable GitHub Issues — one per vertical slice (DB schema, course generator, assignment page, SpeedGrader, gradebook). Each issue should be small enough for one agent in one session.

### ADRs to review before building
- ADR-0001: Feedback flattened onto Grade
- ADR-0002: Enrollment in MVP
- ADR-0003: Grade pending/published lifecycle

### Suggested build order
1. DB schema + seed migration (unblocks everything)
2. Role toggle + layout shell (unblocks both views)
3. Course Generator Server Action + review UI
4. Course dashboard (teacher + student)
5. Assignment page + Submission Server Action
6. AI SpeedGrader Server Action + approval
7. Gradebook
8. User preference: speedgrader_autorun
