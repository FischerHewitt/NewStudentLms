# Recommended Stack: Stack 1

## Stack

**Next.js + Supabase + Vercel AI SDK**

This is the recommended stack for the hackathon MVP.

## Why this stack

This stack is good because it lets us build a polished web app quickly while still having real backend features.

It gives us:

- A frontend for the LMS interface
- Backend routes for AI calls and app logic
- A database for courses, assignments, submissions, and grades
- Authentication for teachers and students
- A way to connect AI features into the app
- Easy deployment for the demo

## What each part does

### Next.js

Next.js is the main app framework.

It will be used for:

- Teacher dashboard
- Student dashboard
- Course pages
- Assignment pages
- Gradebook
- AI SpeedGrader interface
- Syllabus-to-course generator interface

### Supabase

Supabase handles the backend database and authentication.

It will be used for:

- User accounts
- Teacher/student roles
- Courses
- Modules
- Assignments
- Student submissions
- Grades
- Basic access control

Supabase can also support email login, magic links, and two-factor authentication later.

### Vercel AI SDK

Vercel AI SDK helps connect the app to an AI model.

It will be used for:

- Turning a syllabus into course modules and assignments
- Generating assignment feedback
- Helping grade student submissions with a rubric
- Powering the student AI coach if we have time

## Why it fits this project

The MVP needs to prove that an LMS can be AI-native.

The most important:

1. Teacher pastes a syllabus.
2. AI generates modules, assignments, and due dates.
3. Student views the course and submits work.
4. AI SpeedGrader drafts rubric-based feedback.
5. Teacher approves or edits the grade.
6. Grade appears in the gradebook.

This stack supports all of those flows without being too complicated.

## Security note

This stack can be secure enough for a hackathon MVP if we do the basics correctly.

Minimum security goals:

- Keep AI API keys server-side
- Use teacher and student roles
- Do not use real student data
- Make sure students only see their own grades/submissions
- Make sure only teachers can approve final grades
- Two factor authentication
- Add a simple activity log if there is time
