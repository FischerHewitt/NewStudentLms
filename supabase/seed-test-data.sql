-- =============================================================================
-- SEED TEST DATA
-- 5 students · 3 courses (MATH 143, BIO 111, COMS 101) · representative submissions
--
-- QUARTER CONTEXT
--   Spring Quarter 2026 started April 28, 2026.
--   Today (~May 29) = Week 5 of 11.  Midterm week for MATH and COMS Round 1.
--   All timestamps use NOW() so submission dates always read as "a few days ago"
--   relative to whenever this seed is run — no stale dates.
--
--   Week 1  = Apr 28  (Sequences, BIO Chemistry intro, COMS Foundations)
--   Week 5  = May 26  (MATH Midterm 1 + Reflection, COMS Round 1 speeches) ← here
--   Week 8  = Jun 16  (MATH Midterm 2, BIO Midterm 2)
--   Week 11 = Jul 7   (Finals)
--
-- Run AFTER migrations and seed.sql:
--   supabase db reset          ← applies migrations + seed.sql (teacher + Alex Rivera)
--   psql $DB_URL -f supabase/seed-test-data.sql   ← adds everything below
--
-- ID scheme (easy to read at a glance):
--   Users       00000000-0000-0000-0000-0000000000XX
--   Courses     00000000-0000-0000-0001-0000000000XX
--   Modules     00000000-0000-0000-0002-0000000000XX
--   Assignments 00000000-0000-0000-0003-0000000000XX
--   Rubrics     00000000-0000-0000-0004-0000000000XX
--   Enrollments 00000000-0000-0000-0005-0000000000XX
--   Submissions 00000000-0000-0000-0006-0000000000XX
--   Grades      00000000-0000-0000-0007-0000000000XX
-- =============================================================================


-- =============================================================================
-- USERS  (teacher 001 + Alex Rivera 002 already exist from seed.sql)
-- =============================================================================

INSERT INTO users (id, email, name, role, speedgrader_autorun) VALUES
  ('00000000-0000-0000-0000-000000000003', 'jordan@demo.lms',  'Jordan Lee',   'student', false),
  ('00000000-0000-0000-0000-000000000004', 'maya@demo.lms',    'Maya Patel',   'student', false),
  ('00000000-0000-0000-0000-000000000005', 'tyler@demo.lms',   'Tyler Brooks', 'student', false),
  ('00000000-0000-0000-0000-000000000006', 'sam@demo.lms',     'Sam Nguyen',   'student', false)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- COURSES
-- =============================================================================

INSERT INTO courses (id, title, teacher_id, raw_syllabus, generation_preview) VALUES
  (
    '00000000-0000-0000-0001-000000000001',
    'MATH 143 – Calculus III',
    '00000000-0000-0000-0000-000000000001',
    'MATH 143 Calculus III. Sequences, series, vectors, parametric and polar curves. Weekly quizzes (file upload), homework, two midterms, final exam.',
    NULL
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    'BIO 111 – General Biology',
    '00000000-0000-0000-0000-000000000001',
    'BIO 111 General Biology. Three units: Chemistry/Cells/Energy, Genetics/Heredity, Evolution/Ecology. Connect homework, lab notebooks, quizzes, two midterms, final.',
    NULL
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    'COMS 101 – Public Speaking',
    '00000000-0000-0000-0000-000000000001',
    'COMS 101 Public Speaking. Three speech rounds. Quizzes, written and verbal evaluations, reflections, delivery analysis.',
    NULL
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- MODULES
-- =============================================================================

INSERT INTO modules (id, course_id, title, description, "order", week_number) VALUES

  -- MATH 143
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'Sequences and Series', 'Limits of sequences, convergence tests, power series, Taylor series.', 1, 1),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001',
   'Midterm 1', 'Review and first midterm exam covering sequences and series.', 2, 5),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
   'Vectors and 3D Geometry', 'Vector operations, dot and cross products, lines and planes in 3D.', 3, 6),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000001',
   'Parametric and Polar Curves', 'Parametric equations, polar coordinates, area in polar form.', 4, 9),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000001',
   'Final Exam', 'Comprehensive final exam covering all units.', 5, 11),

  -- BIO 111
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'Chemistry, Cells, and Energy', 'Atomic structure, macromolecules, cell structure, photosynthesis, cellular respiration.', 1, 1),
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'Genetics and Heredity', 'DNA structure, mitosis, meiosis, Mendelian genetics, gene expression.', 2, 5),
  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000002',
   'Evolution and Ecology', 'Natural selection, evidence of evolution, population and community ecology.', 3, 8),
  ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000002',
   'Final Exam', 'Comprehensive final exam covering all three units.', 4, 11),

  -- COMS 101
  ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000003',
   'Foundations', 'Speech structure, delivery techniques, community building.', 1, 1),
  ('00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000003',
   'Round 1 – Introductory Speeches', 'Planning and delivering introductory speeches. Peer verbal and written evaluations.', 2, 4),
  ('00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000003',
   'Round 2 – Informative Speeches', 'Research, visual aids, informative speech delivery. Delivery style analysis.', 3, 7),
  ('00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000003',
   'Round 3 – Persuasive Speeches', 'Persuasive techniques, Monroe''s Motivated Sequence, final speech round.', 4, 9),
  ('00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0001-000000000003',
   'Finals', 'Final course reflection.', 5, 11)

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- ASSIGNMENTS + RUBRICS
-- =============================================================================

-- ---------------- MATH 143 · Module 1: Sequences and Series ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'Homework 1 – Sequences',
   'Complete Section 11.1: problems #3, 5, 7, 11, 13, 15, 17, 23, 25. Show all work. Submit as a scanned PDF or photo upload. Graded on completion — attempt every problem for full credit.',
   2),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'Homework 2 – Series',
   'Complete Section 11.2: #17–25 odd, #27, #29, #31, #33, #37, #39. Show all work. Upload as PDF or photo.',
   2),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'Quiz 1 – Sequences',
   'In-class quiz on sequences, limits of sequences, and the squeeze theorem. Upload a photo or scan of your completed quiz paper. No calculators. Partial credit awarded for correct approach even if final answer is wrong.',
   10),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'Quiz 2 – Series Basics',
   'Quiz covering geometric series, telescoping series, and the divergence test. Upload handwritten work. Show all steps for partial credit.',
   10),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'Quiz 3 – Convergence Tests',
   'Quiz on comparison test, limit comparison, ratio test, and root test. Show which test you are applying and why. Upload handwritten work.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001',
   '[{"description": "All assigned problems attempted with work shown (completion)", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000002',
   '[{"description": "All assigned problems attempted with work shown (completion)", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000003',
   '[{"description": "Correct method and setup shown for each problem", "points": 6},
     {"description": "Final answers are correct", "points": 3},
     {"description": "Work is legible and organized", "points": 1}]'),
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000004',
   '[{"description": "Correct method and setup shown for each problem", "points": 6},
     {"description": "Final answers are correct", "points": 3},
     {"description": "Work is legible and organized", "points": 1}]'),
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000005',
   '[{"description": "Correct convergence test identified and applied", "points": 5},
     {"description": "Correct conclusion (converges or diverges) with justification", "points": 4},
     {"description": "Work is legible and organized", "points": 1}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- MATH 143 · Module 2: Midterm 1 ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001',
   'Midterm 1 – Sequences and Series',
   'In-class exam covering Weeks 1–4 (sequences, series, convergence tests, power series). No calculators. Score entered by instructor.',
   100),
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001',
   'Midterm 1 Reflection',
   'Write a reflection of 250+ words on your experience with the sequences and series unit. Address: (1) Which concept was hardest for you and why? (2) What would you do differently studying for Midterm 2? Be specific — name actual topics and study strategies.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0003-000000000006',
   '[{"description": "Exam performance (score entered by instructor)", "points": 100}]'),
  ('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0003-000000000007',
   '[{"description": "Identifies a specific concept or topic that was challenging", "points": 3},
     {"description": "Describes a concrete, actionable change to study strategy for the next midterm", "points": 4},
     {"description": "Makes a genuine attempt to reflect (250+ words, organized writing)", "points": 3}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- MATH 143 · Module 3: Vectors ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
   'Homework 5 – Vectors',
   'Complete problems on vector operations, dot product, and projections. Show all steps. Upload as PDF or photo.',
   2),
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
   'Quiz 4 – Vector Basics',
   'Quiz on vector addition, scalar multiplication, magnitude, and unit vectors. Upload handwritten work.',
   10),
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
   'Quiz 5 – Dot Product and Projections',
   'Quiz on dot product, angle between vectors, and vector projections. Show all steps for partial credit.',
   10),
  ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
   'Midterm 2 – Vectors and 3D Geometry',
   'In-class exam covering Weeks 6–7 (vectors, dot product, cross product, lines and planes). No calculators. Score entered by instructor.',
   100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0003-000000000008',
   '[{"description": "All assigned problems attempted with work shown (completion)", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0003-000000000009',
   '[{"description": "Correct method and setup shown", "points": 6},
     {"description": "Final answers are correct", "points": 3},
     {"description": "Work is legible and organized", "points": 1}]'),
  ('00000000-0000-0000-0004-000000000010', '00000000-0000-0000-0003-000000000010',
   '[{"description": "Correct method and setup shown", "points": 6},
     {"description": "Final answers are correct", "points": 3},
     {"description": "Work is legible and organized", "points": 1}]'),
  ('00000000-0000-0000-0004-000000000011', '00000000-0000-0000-0003-000000000011',
   '[{"description": "Exam performance (score entered by instructor)", "points": 100}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- MATH 143 · Module 4: Parametric and Polar ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000001',
   'Quiz 6 – Parametric Curves',
   'Quiz on parametric equations, derivatives, tangent lines, and arc length. Upload handwritten work. Show all steps.',
   10),
  ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000001',
   'Quiz 7 – Polar Coordinates',
   'Quiz on polar coordinates, conversions, and area in polar form. Upload handwritten work.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000012', '00000000-0000-0000-0003-000000000012',
   '[{"description": "Correct method and setup shown", "points": 6},
     {"description": "Final answers are correct", "points": 3},
     {"description": "Work is legible and organized", "points": 1}]'),
  ('00000000-0000-0000-0004-000000000013', '00000000-0000-0000-0003-000000000013',
   '[{"description": "Correct method and setup shown", "points": 6},
     {"description": "Final answers are correct", "points": 3},
     {"description": "Work is legible and organized", "points": 1}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- MATH 143 · Module 5: Final Exam ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000001',
   'Final Exam – Calculus III',
   'Comprehensive in-class final covering all units (sequences/series, vectors, parametric/polar). No calculators. Score entered by instructor.',
   100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000014', '00000000-0000-0000-0003-000000000014',
   '[{"description": "Exam performance (score entered by instructor)", "points": 100}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- BIO 111 · Module 1: Chemistry, Cells, Energy ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 1 – Scientific Method and Cell Basics',
   'Answer the following questions based on this week''s reading. Write in complete sentences. (1) Describe the steps of the scientific method and give one example of how each step would apply to a real biology experiment. (2) What is the difference between a prokaryotic and eukaryotic cell? Give two examples of each.',
   5),
  ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 2 – Macromolecules',
   'In your own words, describe the four major types of biological macromolecules (carbohydrates, lipids, proteins, nucleic acids). For each: name its building blocks, describe its primary function, and give one real-world example.',
   5),
  ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'Lab 1 Notebook – Microscopy',
   'Write up your lab observations from the microscopy lab. Include: (1) a description of what you observed at each magnification, (2) how you calculated the field of view, and (3) one thing that surprised you about what you saw. 2+ paragraphs.',
   10),
  ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'Lab 2 Notebook – Macromolecule Identification',
   'Summarize your results from the macromolecule identification lab. Describe what each indicator test (iodine, Benedict''s, Biuret) detected in each substance. Then explain what your results indicate about the composition of each substance. 2+ paragraphs.',
   10),
  ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'Quiz 1 – Cells and Chemistry',
   'Online quiz covering atomic structure, macromolecules, cell structure, and transport. Timed, 25 points. Score recorded automatically.',
   25),
  ('00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'Midterm 1 – Chemistry and Cells',
   'In-class multiple choice exam covering Unit 1 (Weeks 1–4). Scantron required. Score entered by instructor.',
   100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000015', '00000000-0000-0000-0003-000000000015',
   '[{"description": "Accurately describes the scientific method with a real example", "points": 3},
     {"description": "Correctly distinguishes prokaryotic and eukaryotic cells with examples", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000016', '00000000-0000-0000-0003-000000000016',
   '[{"description": "All four macromolecules described with building blocks and function", "points": 3},
     {"description": "Real-world examples are accurate and specific", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000017', '00000000-0000-0000-0003-000000000017',
   '[{"description": "Describes observations at multiple magnifications accurately", "points": 4},
     {"description": "Field of view calculation described or shown", "points": 3},
     {"description": "Writing is organized (2+ paragraphs) with genuine attempt", "points": 3}]'),
  ('00000000-0000-0000-0004-000000000018', '00000000-0000-0000-0003-000000000018',
   '[{"description": "Describes what each indicator test detected in each substance", "points": 4},
     {"description": "Explains what results indicate about composition (connects to macromolecule concepts)", "points": 4},
     {"description": "Writing is organized (2+ paragraphs) with genuine attempt", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000019', '00000000-0000-0000-0003-000000000019',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 25}]'),
  ('00000000-0000-0000-0004-000000000020', '00000000-0000-0000-0003-000000000020',
   '[{"description": "Exam performance (score entered by instructor)", "points": 100}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- BIO 111 · Module 2: Genetics and Heredity ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 5 – DNA and Replication',
   'In your own words, describe the structure of DNA and explain the process of DNA replication. Why is it important that replication is semi-conservative? 1–2 paragraphs.',
   5),
  ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'Lab 3 Notebook – Mitosis Observation',
   'Describe and sketch the stages of mitosis you observed under the microscope. For each stage (prophase, metaphase, anaphase, telophase), explain what is happening genetically. What is the significance of each phase? 2+ paragraphs.',
   10),
  ('00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'Quiz 2 – DNA and Cell Division',
   'Online quiz on DNA structure, replication, and mitosis. Timed, 25 points.',
   25),
  ('00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'Quiz 3 – Mendelian Genetics',
   'Online quiz on Punnett squares, dominance patterns, sex-linked traits, and pedigrees. Timed, 25 points.',
   25),
  ('00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'Lab Midterm Exam',
   'In-class lab exam covering Labs 1–4 (microscopy, macromolecules, cell division, genetics). Score entered by instructor.',
   50),
  ('00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'Midterm 2 – Genetics and Heredity',
   'In-class multiple choice exam covering Units 1–2. Scantron required. Score entered by instructor.',
   100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000021', '00000000-0000-0000-0003-000000000021',
   '[{"description": "Accurately describes DNA structure (double helix, base pairing)", "points": 2},
     {"description": "Explains replication process and why semi-conservative matters", "points": 3}]'),
  ('00000000-0000-0000-0004-000000000022', '00000000-0000-0000-0003-000000000022',
   '[{"description": "All four stages described with what is happening genetically", "points": 5},
     {"description": "Explains the significance of each phase (not just what is visible)", "points": 3},
     {"description": "Writing is organized (2+ paragraphs) with genuine attempt", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000023', '00000000-0000-0000-0003-000000000023',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 25}]'),
  ('00000000-0000-0000-0004-000000000024', '00000000-0000-0000-0003-000000000024',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 25}]'),
  ('00000000-0000-0000-0004-000000000025', '00000000-0000-0000-0003-000000000025',
   '[{"description": "Lab exam performance (score entered by instructor)", "points": 50}]'),
  ('00000000-0000-0000-0004-000000000026', '00000000-0000-0000-0003-000000000026',
   '[{"description": "Exam performance (score entered by instructor)", "points": 100}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- BIO 111 · Module 3: Evolution and Ecology ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 8 – Evolution',
   'Describe natural selection in your own words. What are the four conditions required for natural selection to occur? Give a real-world example of a population that has evolved through natural selection and explain which conditions were met.',
   5),
  ('00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000002',
   'Lab 5 Notebook – Hardy-Weinberg Simulation',
   'Summarize what you observed in the Hardy-Weinberg simulation. Did allele frequencies change over generations? Apply one concept from population genetics lecture to explain your results. 2+ paragraphs.',
   10),
  ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000002',
   'Quiz 4 – Evolution',
   'Online quiz on natural selection, evidence of evolution, speciation, and phylogenetics. Timed, 25 points.',
   25),
  ('00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000002',
   'Course Reflection',
   'In 2–3 paragraphs (300+ words), describe one concept from each unit that surprised you or felt most relevant to your own life. Unit 1: Chemistry/Cells/Energy. Unit 2: Genetics/Heredity. Unit 3: Evolution/Ecology. For each, explain why that concept stood out to you personally.',
   10),
  ('00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000002',
   'Lab Final Exam',
   'In-class lab exam covering Labs 5–9. Score entered by instructor.',
   60)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000027', '00000000-0000-0000-0003-000000000027',
   '[{"description": "Accurately describes natural selection and its four conditions", "points": 3},
     {"description": "Real-world example is accurate and conditions are correctly applied", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000028', '00000000-0000-0000-0003-000000000028',
   '[{"description": "Accurately describes what happened to allele frequencies", "points": 4},
     {"description": "Applies a population genetics concept from lecture to explain results", "points": 4},
     {"description": "Writing is organized (2+ paragraphs) with genuine attempt", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000029', '00000000-0000-0000-0003-000000000029',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 25}]'),
  ('00000000-0000-0000-0004-000000000030', '00000000-0000-0000-0003-000000000030',
   '[{"description": "Addresses a concept from Unit 1 (Chemistry/Cells/Energy) with personal connection", "points": 3},
     {"description": "Addresses a concept from Unit 2 (Genetics/Heredity) with personal connection", "points": 3},
     {"description": "Addresses a concept from Unit 3 (Evolution/Ecology) with personal connection", "points": 2},
     {"description": "Makes a genuine attempt (300+ words, organized writing)", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000031', '00000000-0000-0000-0003-000000000031',
   '[{"description": "Lab exam performance (score entered by instructor)", "points": 60}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- BIO 111 · Module 4: Final Exam ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000002',
   'Final Exam – General Biology',
   'Comprehensive in-class exam covering all three units. Multiple choice and short answer. Score entered by instructor.',
   200)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000032', '00000000-0000-0000-0003-000000000032',
   '[{"description": "Exam performance (score entered by instructor)", "points": 200}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- COMS 101 · Module 1: Foundations ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000003',
   'Creating Classroom Community',
   'In-class activity: introduce yourself and share one communication challenge you hope to work on this quarter. Participation recorded in class. Score entered by instructor.',
   15),
  ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000003',
   'Office Visit',
   'Schedule and attend a 10-minute office visit with the instructor. Come prepared with one question about the course or your speaking goals. Score entered by instructor after your visit.',
   10),
  ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000003',
   'Quiz 1 – Speech Structure',
   'Online quiz on introduction, body, conclusion structure and organizational patterns. Score recorded automatically.',
   15),
  ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000003',
   'Quiz 2 – Delivery',
   'Online quiz on eye contact, vocal variety, pacing, gestures, and managing anxiety. Score recorded automatically.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000033', '00000000-0000-0000-0003-000000000033',
   '[{"description": "Participation recorded by instructor", "points": 15}]'),
  ('00000000-0000-0000-0004-000000000034', '00000000-0000-0000-0003-000000000034',
   '[{"description": "Office visit completed and confirmed by instructor", "points": 10}]'),
  ('00000000-0000-0000-0004-000000000035', '00000000-0000-0000-0003-000000000035',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 15}]'),
  ('00000000-0000-0000-0004-000000000036', '00000000-0000-0000-0003-000000000036',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 15}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- COMS 101 · Module 2: Round 1 – Introductory Speeches ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000003',
   'Specific Purpose & Central Idea – Round 1',
   'Submit your speech planning document before your Round 1 speech. Include: (1) Specific purpose — one sentence using a measurable verb (explain, describe, list). No conjunctions. (2) Central idea — one sentence stating what you will accomplish. (3) Preview of 2–4 main points. (4) One personal speaking goal for this round.',
   0),
  ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000003',
   'Written Evaluation – Round 1',
   'Write a constructive evaluation of a classmate''s Round 1 introductory speech. Address all five areas: (1) organization, (2) delivery, (3) eye contact, (4) vocal variety, and (5) content. Be specific — cite actual moments from the speech, not generalizations. 400+ words.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000037', '00000000-0000-0000-0003-000000000037',
   '[{"description": "Checkpoint completed (0 pts — planning document submitted before speech)", "points": 0}]'),
  ('00000000-0000-0000-0004-000000000038', '00000000-0000-0000-0003-000000000038',
   '[{"description": "Addresses all five evaluation criteria (organization, delivery, eye contact, vocal variety, content)", "points": 6},
     {"description": "Cites specific moments from the speech rather than speaking in generalities", "points": 6},
     {"description": "Tone is constructive and writing is organized (400+ words)", "points": 3}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- COMS 101 · Module 3: Round 2 – Informative Speeches ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000003',
   'Quiz 3 – Research and Visual Aids',
   'Online quiz on finding credible sources, integrating evidence, avoiding plagiarism, and designing effective visual aids. Score recorded automatically.',
   15),
  ('00000000-0000-0000-0003-000000000040', '00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000003',
   'Analyzing Delivery Style',
   'Watch the assigned speech video. In 400+ words, analyze the speaker''s delivery using at least three specific concepts from course material (e.g. eye contact, vocal variety, pacing, gestures, structure). For each concept: describe what the speaker did, evaluate whether it was effective, and explain what you would coach them to improve.',
   30),
  ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000003',
   'Written Evaluation – Round 2',
   'Write a constructive evaluation of a classmate''s Round 2 informative speech. Address organization, delivery, eye contact, vocal variety, content, and use of visual aids. Cite specific moments. 400+ words.',
   15),
  ('00000000-0000-0000-0003-000000000042', '00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000003',
   'Reflection 2',
   'Three-part reflection on your Round 2 speech: (1) One sentence — your specific goal for Round 3, drawn from feedback you received. (2) One paragraph — your concrete plan for achieving that goal. (3) 1–2 paragraphs — honest reflection on how Round 2 went and what you would do differently.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000039', '00000000-0000-0000-0003-000000000039',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 15}]'),
  ('00000000-0000-0000-0004-000000000040', '00000000-0000-0000-0003-000000000040',
   '[{"description": "Applies at least three distinct course concepts correctly", "points": 15},
     {"description": "Supports each claim with specific evidence from the video", "points": 10},
     {"description": "Writing is organized and professional (400+ words)", "points": 5}]'),
  ('00000000-0000-0000-0004-000000000041', '00000000-0000-0000-0003-000000000041',
   '[{"description": "Addresses all six evaluation criteria including visual aids", "points": 6},
     {"description": "Cites specific moments from the speech", "points": 6},
     {"description": "Tone is constructive and writing is organized (400+ words)", "points": 3}]'),
  ('00000000-0000-0000-0004-000000000042', '00000000-0000-0000-0003-000000000042',
   '[{"description": "Round 3 goal is specific and measurable (one sentence)", "points": 3},
     {"description": "Implementation plan is concrete and actionable (one paragraph)", "points": 4},
     {"description": "Reflection on Round 2 shows genuine self-assessment (1–2 paragraphs)", "points": 3}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- COMS 101 · Module 4: Round 3 – Persuasive Speeches ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000043', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000003',
   'Quiz 4 – Persuasive Speaking',
   'Online quiz on Aristotle''s appeals (logos, ethos, pathos) and Monroe''s Motivated Sequence. Score recorded automatically.',
   30),
  ('00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000003',
   'Written Evaluation – Round 3',
   'Write a constructive evaluation of a classmate''s Round 3 persuasive speech. Address organization, delivery, use of persuasive appeals (logos/ethos/pathos), evidence, and call to action. Cite specific moments. 400+ words.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000043', '00000000-0000-0000-0003-000000000043',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 30}]'),
  ('00000000-0000-0000-0004-000000000044', '00000000-0000-0000-0003-000000000044',
   '[{"description": "Addresses organization, delivery, and all three persuasive appeals", "points": 7},
     {"description": "Cites specific moments from the speech", "points": 5},
     {"description": "Tone is constructive and writing is organized (400+ words)", "points": 3}]')
ON CONFLICT (id) DO NOTHING;

-- ---------------- COMS 101 · Module 5: Finals ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000045', '00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0001-000000000003',
   'Reflection 3 – Final Course Reflection',
   'Write a final reflection on your growth as a public speaker over the quarter. Address: (1) How have your speaking skills changed from Round 1 to Round 3? Give specific examples. (2) What is the one skill you are most proud of developing? (3) What will you continue to work on after this course? 400+ words, double-spaced.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000045', '00000000-0000-0000-0003-000000000045',
   '[{"description": "Describes specific growth from Round 1 to Round 3 with examples", "points": 4},
     {"description": "Identifies one skill developed with genuine reflection", "points": 3},
     {"description": "Writing is organized and genuine (400+ words)", "points": 3}]')
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- ENROLLMENTS  (all 5 students in all 3 courses)
-- =============================================================================

INSERT INTO enrollments (id, course_id, student_id, enrolled_at) VALUES
  -- MATH 143
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000002', NOW()),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000003', NOW()),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000004', NOW()),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000005', NOW()),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000006', NOW()),
  -- BIO 111
  ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', NOW()),
  ('00000000-0000-0000-0005-000000000007', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000003', NOW()),
  ('00000000-0000-0000-0005-000000000008', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000004', NOW()),
  ('00000000-0000-0000-0005-000000000009', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000005', NOW()),
  ('00000000-0000-0000-0005-000000000010', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000006', NOW()),
  -- COMS 101
  ('00000000-0000-0000-0005-000000000011', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000002', NOW()),
  ('00000000-0000-0000-0005-000000000012', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003', NOW()),
  ('00000000-0000-0000-0005-000000000013', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000004', NOW()),
  ('00000000-0000-0000-0005-000000000014', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000005', NOW()),
  ('00000000-0000-0000-0005-000000000015', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000006', NOW())
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SUBMISSIONS
-- Demonstrates all four gradebook states:
--   blank      = no submission row
--   pending    = status='submitted', no grade
--   ai_suggested = grade exists, approved_at IS NULL
--   final      = grade exists, approved_at IS NOT NULL
--
-- Key assignments seeded:
--   A007 = MATH 143 Midterm Reflection      (10 pts, written)
--   A030 = BIO 111 Course Reflection        (10 pts, written)
--   A038 = COMS 101 Written Eval Round 1    (15 pts, written)
-- =============================================================================

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- MATH 143 Midterm Reflection (A007)
  -- Alex Rivera: submitted + graded (final state)
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000002',
   'The hardest part of the sequences and series unit for me was understanding the ratio and root convergence tests — specifically knowing which one to apply and when. I kept second-guessing myself on problems where both seemed like they could work, and I wasted a lot of time on the midterm switching between them.

For Midterm 2 I am going to change two things. First, I will make a decision flowchart for choosing convergence tests so I can just follow the logic instead of guessing. Second, I am going to do every problem on the practice exam under timed conditions the day before, because I realized I understand the material when I have unlimited time but I slow way down under pressure. The timed practice should help me get used to working faster.

I also think I should spend more time on Taylor series applications. I understood how to find a Taylor series but the questions that asked me to use one to approximate a value were harder than I expected. I plan to do the extra textbook problems in section 11.10 that were not assigned.',
   NOW() - INTERVAL '3 days', 'graded'),

  -- Jordan Lee: submitted + AI suggested (teacher has not approved yet)
  ('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000003',
   'I found the convergence tests pretty confusing at first. There are so many of them and it was hard to remember which one to use. I think I need to practice more problems.

For the next midterm I am going to start studying earlier and make sure I understand the vectors chapter before the exam. I also want to go to office hours this time because I did not go before Midterm 1 and I think that hurt me.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- Maya Patel: submitted, no grade yet (pending state)
  ('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000004',
   'Convergence tests were my biggest challenge. The comparison test made sense but I kept getting confused when to use limit comparison versus regular comparison. Also I ran out of time on the midterm which hurt my score.

Next time I will practice more under timed conditions. I will also review the test criteria before each problem so I do not waste time trying the wrong approach first.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- Tyler Brooks: draft (not submitted)
  ('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000005',
   'I struggled with the midterm. I need to study more.',
   NULL, 'draft')

  -- Sam Nguyen: no submission (blank) — intentionally omitted

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- BIO 111 Course Reflection (A030)
  -- Alex Rivera: submitted + graded (final state)
  ('00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0000-000000000002',
   'The concept from Unit 1 that surprised me most was how enzymes work. Before this class I thought of enzymes as chemicals that just speed things up, but learning about the active site and how temperature and pH can denature an enzyme made me realize how fragile and precise cellular processes really are. It changed the way I think about why we get sick when we have a high fever.

From Unit 2, Mendelian genetics genuinely fascinated me even though I had heard of it before. What I did not realize is how much the same basic principles apply to inheritance of disease risk. When we worked through pedigree problems it became clear that patterns of inheritance are actually useful tools for real medical decision-making, not just textbook exercises.

The concept from Unit 3 that felt most relevant to my life was the Hardy-Weinberg equilibrium. I had always thought evolution was something that happened over millions of years and was invisible in any human timescale. Learning that we can actually measure whether a population is evolving right now using allele frequencies made the whole idea feel concrete and measurable rather than abstract.',
   NOW() - INTERVAL '5 days', 'graded'),

  -- Jordan Lee: submitted + AI suggested (pending approval)
  ('00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0000-000000000003',
   'From Unit 1, cellular respiration was the most interesting to me. I never thought about how our bodies convert food into usable energy at a chemical level. Learning about ATP and the electron transport chain made me appreciate the complexity of what happens every time I eat something.

In Unit 2, DNA replication stood out. The idea that your body copies 3 billion base pairs every time a cell divides — and mostly gets it right — is incredible. It made me think about how cancer can result from even small errors in that process.

From Unit 3, natural selection felt most relevant. I have always heard about survival of the fittest but I did not understand that it specifically means reproductive success, not just physical strength. That distinction completely changed how I interpreted the concept.',
   NOW() - INTERVAL '4 days', 'submitted'),

  -- Maya Patel: submitted, no grade yet
  ('00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0000-000000000004',
   'Biology has been interesting this quarter. From Unit 1 I liked learning about cell structure. It was cool to see how everything inside a cell has a specific job. From Unit 2, genetics was a little confusing but Punnett squares made sense once I practiced them. From Unit 3 I liked the ecology section because I like animals and thinking about how populations interact with each other.',
   NOW() - INTERVAL '3 days', 'submitted')

  -- Tyler and Sam: no submission (blank) — intentionally omitted

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- COMS 101 Written Evaluation Round 1 (A038)
  -- Alex Rivera: submitted + graded (final state)
  ('00000000-0000-0000-0006-000000000008', '00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0000-000000000002',
   'The speaker I evaluated in Round 1 showed strong content knowledge and clear organization, but had room to grow in delivery and audience engagement. Here is my evaluation across the five criteria.

Organization: The speech had a clear three-part structure with a strong introduction that grabbed attention with a personal story. The transitions between main points were smooth — the speaker used signpost phrases like "moving on to my second point" which made it easy to follow. The conclusion summarized the main points clearly, though it ended a bit abruptly without a memorable closing line.

Delivery: The speaker''s pace was generally good but sped up noticeably during the second main point, which made some sentences hard to follow. There were several filler words ("um", "like") in the middle of the speech, though the speaker recovered well by the conclusion.

Eye Contact: Eye contact was inconsistent. The speaker looked at their notes frequently in the first minute but improved significantly by the second half of the speech. One strength was making deliberate eye contact with different sections of the room rather than just one side.

Vocal Variety: The speaker used good volume and spoke clearly, but pitch stayed relatively flat throughout. More variation in tone when emphasizing key points would increase engagement.

Content: The speech was well-researched and the main points were relevant and specific. The speaker used a credible source for their second point which added weight to the argument. One suggestion: the third main point felt rushed compared to the first two and would benefit from one more supporting detail.',
   NOW() - INTERVAL '7 days', 'graded'),

  -- Jordan Lee: submitted + AI suggested (pending approval)
  ('00000000-0000-0000-0006-000000000009', '00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0000-000000000003',
   'I evaluated my teammate''s Round 1 speech and thought they did a really good job overall. Their organization was clear and they had a strong introduction. Their delivery was confident and they did not seem nervous.

For eye contact, they looked at the audience most of the time which was great to see for a first speech. Their vocal variety was good too — they sped up when they were excited which added energy.

The content was interesting and relevant. I learned something new from their speech which I think is the goal. One thing I would suggest is to make the conclusion a little stronger with a callback to the opening story. Overall this was a solid first effort and I think they will continue to improve.',
   NOW() - INTERVAL '6 days', 'submitted')

  -- Maya, Tyler, Sam: no submission (blank) — intentionally omitted

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- GRADES
-- =============================================================================

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- MATH Midterm Reflection – Alex Rivera: PUBLISHED (final state)
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0006-000000000001',
   10,
   'Specific concept (ratio/root test confusion): 3/3 — clearly names the exact topic and explains why it caused difficulty.
Concrete study strategy change (flowchart + timed practice + Taylor series extra problems): 4/4 — three actionable changes with specific details.
Genuine attempt (well over 250 words, organized paragraphs): 3/3.',
   10,
   'Excellent reflection. You named specific concepts, explained exactly why they were hard, and described concrete changes to your study strategy. The decision flowchart idea is particularly strong — keep that up for the final.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- MATH Midterm Reflection – Jordan Lee: AI SUGGESTED (pending approval)
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0006-000000000002',
   6,
   'Specific concept (convergence tests): 2/3 — mentions confusion but does not name which test was hardest.
Concrete study strategy change: 2/4 — "study earlier" and "go to office hours" are stated but not specific enough. No concrete plan for what to do differently.
Genuine attempt: 2/3 — under 250 words, two short paragraphs.',
   NULL, NULL, NULL, NULL),

  -- BIO Course Reflection – Alex Rivera: PUBLISHED (final state)
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0006-000000000005',
   10,
   'Unit 1 concept (enzymes and denaturation): 3/3 — accurate, personal connection to fever is insightful.
Unit 2 concept (Mendelian genetics and medical pedigrees): 3/3 — accurate, personal relevance well explained.
Unit 3 concept (Hardy-Weinberg): 2/2 — correct and specific.
Genuine attempt: 2/2 — strong writing, well over 300 words.',
   10,
   'Outstanding reflection. Every concept is accurate and your personal connections are genuinely insightful, not just restating the textbook. The observation about Hardy-Weinberg making evolution measurable is exactly the kind of thinking this course aims for.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '4 days'),

  -- BIO Course Reflection – Jordan Lee: AI SUGGESTED (pending approval)
  ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0006-000000000006',
   9,
   'Unit 1 concept (ATP and cellular respiration): 3/3 — accurate, personal connection is genuine.
Unit 2 concept (DNA replication and cancer): 3/3 — accurate and shows real understanding beyond the textbook.
Unit 3 concept (natural selection and fitness): 2/2 — correct distinction between reproductive success and physical strength.
Genuine attempt: 1/2 — well over 300 words and organized, minor deduction for slightly brief paragraphs.',
   NULL, NULL, NULL, NULL),

  -- COMS Written Eval Round 1 – Alex Rivera: PUBLISHED (final state)
  ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0006-000000000008',
   15,
   'Addresses all five criteria: 6/6 — organization, delivery, eye contact, vocal variety, and content all addressed with substance.
Cites specific moments: 6/6 — multiple specific examples throughout (personal story opening, filler words in second section, looking at notes in first minute, third point feeling rushed).
Constructive tone and writing quality: 3/3 — professional, organized, well over 400 words.',
   15,
   'Excellent evaluation. You addressed every criterion with specificity — citing actual moments from the speech rather than speaking in generalities. This is exactly what constructive peer feedback looks like.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '5 days'),

  -- COMS Written Eval Round 1 – Jordan Lee: AI SUGGESTED (pending approval)
  ('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0006-000000000009',
   8,
   'Addresses all five criteria: 3/6 — organization and delivery mentioned, but eye contact and vocal variety are only briefly noted without real analysis. Content addressed but superficially.
Cites specific moments: 2/6 — "looked at the audience most of the time" and "sped up when excited" are the only specific observations. Rest is general.
Constructive tone and writing quality: 3/3 — tone is positive and appropriate, writing is clear.',
   NULL, NULL, NULL, NULL)

ON CONFLICT (id) DO NOTHING;
