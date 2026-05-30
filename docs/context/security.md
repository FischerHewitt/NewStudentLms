# Security Context

## Hackathon MVP constraints

This is a demo app. The minimum security goals are:

- Keep all AI API keys server-side — never expose them to the client
- All AI calls go through Next.js API routes or Server Actions
- Students should only be able to read their own Submissions and Grades
- Only teachers can approve Final Grades
- Do not use real student data in the demo

## Role model

Two roles for the MVP:

| Role | Permissions |
|------|------------|
| **teacher** | View all Submissions, run AI SpeedGrader, approve/edit Final Grades, manage course structure |
| **student** | View course, submit work, use AI coach, view their own Grades |

## Role toggle vs real authorization

**For the hackathon demo, a client-side role toggle is acceptable.** It does not need to be backed by real authentication. The toggle exists to demonstrate the two user experiences, not to enforce security.

**This is not real authorization.** If and when Supabase Auth is added, the following rules must be enforced server-side and via Supabase Row Level Security (RLS):

- A student can only `SELECT` their own Submissions and Grades (filter by `student_id = auth.uid()`)
- A student cannot `UPDATE` or `INSERT` into Grades
- Only a teacher role can approve (`UPDATE`) Final Grades
- API routes and Server Actions must verify the caller's role before performing any write operation

Do not rely on client-side role state for access control when real auth is in place.

## Key invariant

**AI suggestions are never auto-applied.** All AI output — generated Course structure, AI Suggested Grades, Feedback drafts, coach responses — requires explicit teacher or student action before it affects stored data.

## Teacher-created student accounts

When a teacher enrolls a student by email (manual entry or CSV upload), a User row is created
immediately so the `student_id` FK chain (Enrollment → Submission → Grade) stays intact.
These pre-created accounts must be treated as **pending** until the student verifies their
email and sets a password. Security rules:

- Pending accounts cannot log in and have no active session
- The teacher cannot read or infer whether an email already exists in the system (no
  enumeration leakage — always respond with "invite sent" regardless)
- CSV upload must be validated server-side: strip whitespace, validate email format, reject
  rows that would create duplicate enrollments for the same course
- Pre-created User rows must not inherit any permissions until the student activates the
  account via email verification

For the hackathon demo, student User rows are seeded manually and this flow is mocked.
Implement the full invite/activation flow before any real student data touches the system.

## What we are NOT building for the hackathon

Two-factor authentication, detailed audit logs, institution-level security controls, emergency read-only mode, AI transparency logs, complex role hierarchies. These belong in the future roadmap.
