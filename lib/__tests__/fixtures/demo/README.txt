Demo & Manual Test Fixtures
============================

This folder contains files for manually testing the app in your browser.
All content is calibrated to the seed data in supabase/seed-test-data.sql.


HOW TO USE
----------

1. Test Course Creation (Teacher view)
   Go to the Teacher dashboard → New Course → paste or upload a syllabus.
   Syllabi are in: demo/syllabi/
     math-143-syllabus.txt
     bio-111-syllabus.txt
     coms-101-syllabus.txt

2. Test AI Grading (SpeedGrader)
   Open any text-submission assignment in the gradebook.
   Copy a sample submission from demo/sample-submissions/ and paste it
   into the student submission box, then run SpeedGrader.

   Each AI-gradeable assignment has two files:
     *-strong.txt  — should earn near-full credit (90–100%)
     *-weak.txt    — should earn partial credit (55–70%)

   Use the strong/weak pair to verify the AI grades proportionally.


ASSIGNMENTS COVERED
-------------------

math-143/
  midterm-1-reflection    — 10 pts — 250+ words — rubric: concept, strategy, completion

bio-111/
  connect-hw-1            — 5 pts  — short answer — rubric: scientific method, cell types
  lab-2-notebook          — 10 pts — 2+ paragraphs — rubric: indicator tests, composition
  course-reflection       — 10 pts — 300+ words — rubric: one concept from each of 3 units

coms-101/
  written-eval-round1     — 15 pts — 400+ words — rubric: 5 criteria, specific moments
  analyzing-delivery      — 30 pts — 400+ words — rubric: 3 concepts, evidence, organization
  reflection-2            — 10 pts — structured — rubric: goal, plan, self-assessment
  reflection-3            — 10 pts — 400+ words — rubric: growth, skill, future plan


EXPECTED SCORES (approximate)
------------------------------
  *-strong.txt  →  AI should score 90–100% of points
  *-weak.txt    →  AI should score 55–70% of points

If the AI scores a strong submission below 80% or a weak submission above 80%,
that is a calibration issue worth investigating.
