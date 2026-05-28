# Enrollment entity included in MVP

We include an Enrollment table (`course_id`, `student_id`, `enrolled_at`) even though the hackathon demo has exactly one seeded student and one course. The simpler alternative — letting the student implicitly access all courses, building the Gradebook directly from Submissions — was rejected.

The reason: the Gradebook is built from Enrollments, not Submissions. This means a student row appears in the Gradebook even if they haven't submitted anything yet (blank cell), which is the correct LMS behavior. Without Enrollment, the Gradebook would only show students who have at least one Submission, silently hiding non-submitters. Enrollment also gives the correct foundation for multi-student and multi-course scenarios without a schema change.

The seeded student is auto-enrolled when the teacher generates a course.

**Consequence**: Gradebook queries join through Enrollment rather than scanning Submissions directly. One extra table and join in exchange for correct blank-row behavior.
