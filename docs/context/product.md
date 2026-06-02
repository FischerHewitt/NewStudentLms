# Product Context

## Demo Pitch

Alumos is a proof-of-concept AI-native LMS that challenges Canvas.

Canvas has become old, bloated, and difficult to extend with AI. Teachers often struggle to build organized courses because they have to manually turn syllabi, assignments, modules, rubrics, and grading policies into a course structure. As Canvas keeps adding more features, it becomes more confusing for teachers, which then makes it harder for students to stay organized.

Alumos is an AI-native LMS designed to reduce ambiguity in course creation while still giving teachers creative control. Instead of forcing teachers to manually build everything, it helps generate a structured course from existing materials like syllabi, assignments, and teacher prompts.

**The demo loop (under two minutes):**

1. A teacher uploads a math course syllabus
2. The AI generates a course structure with ~11 weekly modules
3. The AI creates or imports a math assignment based on the teacher's input
4. The demo switches to student view
5. The student completes the math assignment using a math-input feature
6. The student submits work with a small mistake
7. The teacher view shows the submitted assignment
8. The AI grades the work like a teacher would — giving partial credit rather than only marking answers right or wrong
9. The teacher reviews or edits the grade
10. The student sees the final grade and feedback

**The core innovation** is not "AI grading" or "AI course generation" in isolation. The real value is the full loop: syllabus → course → assignment → student submission → AI-assisted grading → teacher approval → student feedback.

The product should feel like a simpler, smarter Canvas built around AI from the beginning. The goal is not to remove teacher control — it is to reduce repetitive setup work and help teachers create clearer courses faster.

For the demo, the most important thing is to show a complete working flow in under two minutes. It does not need to be a fully finished LMS. It needs to prove the concept: teachers can go from a syllabus to a working course quickly, students get a clean learning experience, and teachers get AI-assisted grading that still allows human judgment.

---

## Pitch

Alumos is a smarter LMS built around clarity. It reads the syllabus, assignments, grades, and course updates, then turns them into a simple command center for students and teachers. Instead of making people search through course pages, Alumos tells them what changed, what matters, and what to do next.

## Thesis

A traditional LMS helps organize learning. Alumos actively surfaces what matters — removing the friction of hunting through course pages so students can act and teachers can decide.

Canvas is the current incumbent — widely adopted but built before the AI era. Its recent security issues reinforce why schools need a more modern, secure, and trustworthy platform.

Our positioning: Canvas makes you search. Alumos tells you.

## Target users (hackathon MVP)

- **Teacher** — creates courses, reviews submissions, approves grades
- **Student** — views courses, submits work, gets AI coaching

For the MVP, a simple role toggle is sufficient. No real authentication is required for the demo.

## Core product principles

1. **Teachers stay in control.** AI gives a first draft; the teacher makes the final call on grades and course structure.
2. **Students are coached, not done-for.** The AI coach helps students think, plan, and learn — it does not write their answers.
3. **The system should feel like a real LMS**, not an AI toy. Structure (courses, modules, assignments, gradebook) must be present.
4. **Trust and transparency.** All AI suggestions are visible and overridable. Nothing is auto-applied.

## MVP must-haves

- Teacher and student views
- Course dashboard
- Syllabus-to-course generator
- Generated modules with assignments and due dates
- Student text submission flow
- AI SpeedGrader with teacher approval
- Simple gradebook

## Nice-to-have (add only after main demo loop works)

AI student coach, calendar view, quiz generator, discussion board, rubric builder, AI study guides, flashcards, announcements, analytics dashboard, security audit log mockup.

## What we are NOT building for the hackathon

Admin system, real school integrations, full quiz engine, complex notifications, file uploads, mobile app, LTI, SIS sync, advanced security infrastructure, multi-school support. These belong in the future roadmap pitch, not the MVP build.
