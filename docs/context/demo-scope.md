# Demo Scope

Defines what is in scope for the hackathon MVP demo and what is explicitly out of scope.

## The demo loop (must work end-to-end)

1. Teacher opens the app
2. Teacher pastes a syllabus
3. AI generates a course with Modules, Assignments, and due dates
4. Student opens the Course dashboard and sees upcoming work
5. Student opens an Assignment and submits a written response
6. Teacher opens AI SpeedGrader — AI suggests rubric score and Feedback
7. Teacher approves or edits the grade
8. Final Grade appears in the gradebook

**Every MVP feature must serve this loop.**

## Must-have features

| Feature | Notes |
|---------|-------|
| Teacher view | Dashboard, course pages, gradebook |
| Student view | Dashboard, assignment pages, submission form |
| Course dashboard | Course name, teacher, Modules, upcoming Assignments |
| Syllabus-to-course generator | Paste syllabus → AI generates Course structure |
| Modules | Generated from syllabus, ordered by week |
| Assignments | Title, instructions, due date, points possible, Rubric |
| Student text submission | Text area + submit button; file uploads not required |
| AI SpeedGrader | AI Suggested Grade + Feedback draft, teacher approval UI |
| Simple gradebook | Student × Assignment grid with AI Suggested and Final Grades |
| Role toggle | Switch between teacher and student views |

## Nice-to-have (only after the main loop works)

AI student coach, calendar view, quiz generator, discussion board, rubric builder, AI study guides, flashcards, announcements, analytics dashboard, security audit log mockup.

## Explicitly out of scope for the hackathon

Admin system, real school integrations, full quiz engine, complex notifications, file storage and uploads, mobile app, LTI, SIS sync, advanced security infrastructure, multi-school support.

These belong in the future pitch and roadmap, not the MVP build.

## Judging criteria to keep in mind

1. **Still an LMS** — schools can recognize and adopt it; it has the structure they expect
2. **AI-native** — feels fundamentally different from Canvas, not just Canvas with a chatbot added
3. **Teacher control and student trust** — AI assists without replacing human judgment or doing students' work
