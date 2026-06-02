-- =============================================================================
-- SEED TEST DATA
-- 15 students · 2 courses (BIO 111, COMS 101) · representative submissions
--
-- QUARTER CONTEXT
--   Spring Quarter 2026 started April 28, 2026.
--   Today (~May 29) = Week 5 of 11.  Midterm week for COMS Round 1.
--   All timestamps use NOW() so submission dates always read as "a few days ago"
--   relative to whenever this seed is run — no stale dates.
--
--   Week 1  = Apr 28  (BIO Chemistry intro, COMS Foundations)
--   Week 5  = May 26  (COMS Round 1 speeches) ← here
--   Week 8  = Jun 16  (BIO Midterm 2)
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
  ('00000000-0000-0000-0000-000000000003', 'jordan@demo.lms',   'Jordan Lee',        'student', false),
  ('00000000-0000-0000-0000-000000000004', 'maya@demo.lms',     'Maya Patel',        'student', false),
  ('00000000-0000-0000-0000-000000000005', 'tyler@demo.lms',    'Tyler Brooks',      'student', false),
  ('00000000-0000-0000-0000-000000000006', 'sam@demo.lms',      'Sam Nguyen',        'student', false),
  ('00000000-0000-0000-0000-000000000007', 'priya@demo.lms',    'Priya Sharma',      'student', false),
  ('00000000-0000-0000-0000-000000000008', 'marcus@demo.lms',   'Marcus Johnson',    'student', false),
  ('00000000-0000-0000-0000-000000000009', 'sofia@demo.lms',    'Sofia Reyes',       'student', false),
  ('00000000-0000-0000-0000-000000000010', 'ethan@demo.lms',    'Ethan Kim',         'student', false),
  ('00000000-0000-0000-0000-000000000011', 'aaliyah@demo.lms',  'Aaliyah Washington','student', false),
  ('00000000-0000-0000-0000-000000000012', 'connor@demo.lms',   'Connor Murphy',     'student', false),
  ('00000000-0000-0000-0000-000000000013', 'zoe@demo.lms',      'Zoe Chen',          'student', false),
  ('00000000-0000-0000-0000-000000000014', 'diego@demo.lms',    'Diego Flores',      'student', false),
  ('00000000-0000-0000-0000-000000000015', 'hannah@demo.lms',   'Hannah Okafor',     'student', false),
  ('00000000-0000-0000-0000-000000000016', 'liam@demo.lms',     'Liam Patel',        'student', false)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- COURSES  (BIO 111 and COMS 101 only — MATH 143 is generated live during demo)
-- =============================================================================

INSERT INTO courses (id, title, teacher_id, status, raw_syllabus, generation_preview) VALUES
  (
    '00000000-0000-0000-0001-000000000002',
    'BIO 111 – General Biology',
    '00000000-0000-0000-0000-000000000001',
    'published',
    'BIO 111 – General Biology. Instructor: Dr. Fischer Hewitt. Three units: Chemistry/Cells/Energy, Genetics/Heredity, Evolution/Ecology. Connect homework, lab notebooks, quizzes, two midterms, final.',
    NULL
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    'COMS 101 – Public Speaking',
    '00000000-0000-0000-0000-000000000001',
    'published',
    'COMS 101 – Public Speaking. Instructor: Dr. Fischer Hewitt. Three speech rounds. Quizzes, written and verbal evaluations, reflections, delivery analysis.',
    NULL
  )
ON CONFLICT (id) DO UPDATE SET status = 'published';


-- =============================================================================
-- MODULES
-- =============================================================================

INSERT INTO modules (id, course_id, title, description, "order", week_number) VALUES

  -- BIO 111
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'Chemistry, Cells, and Energy', 'Atomic structure, macromolecules, cell structure, photosynthesis, cellular respiration.', 1, 1),
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'Genetics and Heredity', 'DNA structure, mitosis, meiosis, Mendelian genetics, gene expression.', 2, 5),
  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000002',
   'Evolution and Ecology', 'Natural selection, evidence of evolution, population and community ecology.', 3, 8),
  ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000002',
   'Final Exam', 'Comprehensive final exam covering all three units.', 4, 11),

  -- COMS 101 — one module per week (Weeks 1–11)
  ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000003',
   'Week 1 – Community Building', 'Introductions, course objectives, syllabus review, community agreements.', 1, 1),
  ('00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0001-000000000003',
   'Week 2 – Speech Structure', 'Introduction, body, conclusion; organizational patterns (chronological, topical, problem-solution). Quiz 1.', 2, 2),
  ('00000000-0000-0000-0002-000000000016', '00000000-0000-0000-0001-000000000003',
   'Week 3 – Delivery', 'Eye contact, vocal variety, pacing, gestures, managing anxiety. Office Visit due. Quiz 2.', 3, 3),
  ('00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000003',
   'Week 4 – Round 1 Prep', 'Specific Purpose & Central Idea Statement due. Tips for introductory speeches.', 4, 4),
  ('00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0001-000000000003',
   'Week 5 – Round 1 Speeches (Part 1)', 'In-class introductory speeches. Verbal evaluations. Written Evaluation Round 1 due Sunday.', 5, 5),
  ('00000000-0000-0000-0002-000000000018', '00000000-0000-0000-0001-000000000003',
   'Week 6 – Round 1 Speeches (Part 2) & Research', 'Remaining Round 1 speeches. Finding credible sources, integrating evidence, avoiding plagiarism.', 6, 6),
  ('00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000003',
   'Week 7 – Visual Aids & Round 2 Prep', 'Designing effective slides and visual aids. Quiz 3. Specific Purpose & Central Idea – Round 2 due.', 7, 7),
  ('00000000-0000-0000-0002-000000000019', '00000000-0000-0000-0001-000000000003',
   'Week 8 – Round 2 Speeches', 'In-class informative speeches. Verbal evaluations. Analyzing Delivery Style due Sunday.', 8, 8),
  ('00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000003',
   'Week 9 – Persuasive Speaking & Round 3 Prep', 'Aristotle''s appeals, Monroe''s Motivated Sequence. Quiz 4. Written Evaluation Round 2 & Reflection 2 due.', 9, 9),
  ('00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0001-000000000003',
   'Week 10 – Round 3 Speeches', 'In-class persuasive speeches. Verbal evaluations. Written Evaluation Round 3 due Sunday.', 10, 10),
  ('00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0001-000000000003',
   'Week 11 – Finals', 'Final course reflection due. No final exam.', 11, 11)

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- ASSIGNMENTS + RUBRICS
-- =============================================================================

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
ON CONFLICT (assignment_id) DO NOTHING;

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
ON CONFLICT (assignment_id) DO NOTHING;

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
ON CONFLICT (assignment_id) DO NOTHING;

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
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 1: Community Building ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000003',
   'Introduction',
   'Write a brief introduction of yourself: your name, your major, and one communication challenge you want to work on this quarter. 2–3 sentences is fine.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000033', '00000000-0000-0000-0003-000000000033',
   '[{"description": "Introduces themselves with name, major, and a specific communication challenge", "points": 10}, {"description": "Writing is complete and genuine (2–3 sentences minimum)", "points": 5}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 2: Speech Structure ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0001-000000000003',
   'Quiz 1 – Speech Structure',
   'In your own words, describe the three-part speech structure (introduction, body, conclusion) and explain what each part should accomplish. Write 2–3 sentences for each part. Submit your answer in the text box.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000035', '00000000-0000-0000-0003-000000000035',
   '[{"description": "Accurately describes the introduction — purpose and what it should accomplish", "points": 5}, {"description": "Accurately describes the body — purpose and what it should accomplish", "points": 5}, {"description": "Accurately describes the conclusion — purpose and what it should accomplish", "points": 5}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 3: Delivery ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0002-000000000016', '00000000-0000-0000-0001-000000000003',
   'Office Visit',
   'Schedule and attend a 10-minute office visit with the instructor. Come prepared with one question about the course or your speaking goals. Score entered by instructor after your visit.',
   10),
  ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0002-000000000016', '00000000-0000-0000-0001-000000000003',
   'Quiz 2 – Delivery',
   'Online quiz on eye contact, vocal variety, pacing, gestures, and managing anxiety. Score recorded automatically.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000034', '00000000-0000-0000-0003-000000000034',
   '[{"description": "Office visit completed and confirmed by instructor", "points": 10}]'),
  ('00000000-0000-0000-0004-000000000036', '00000000-0000-0000-0003-000000000036',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 15}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 4: Round 1 Prep ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000003',
   'Specific Purpose & Central Idea – Round 1',
   'Submit your speech planning document before your Round 1 speech. Include: (1) Specific purpose — one sentence using a measurable verb (explain, describe, list). No conjunctions. (2) Central idea — one sentence stating what you will accomplish. (3) Preview of 2–4 main points. (4) One personal speaking goal for this round.',
   0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000037', '00000000-0000-0000-0003-000000000037',
   '[{"description": "Checkpoint completed (0 pts — planning document submitted before speech)", "points": 0}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 5: Round 1 Speeches (Part 1) ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0001-000000000003',
   'Written Evaluation – Round 1',
   'Write a constructive evaluation of a classmate''s Round 1 introductory speech. Address all five areas: (1) organization, (2) delivery, (3) eye contact, (4) vocal variety, and (5) content. Be specific — cite actual moments from the speech, not generalizations. 400+ words.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000038', '00000000-0000-0000-0003-000000000038',
   '[{"description": "Addresses all five evaluation criteria (organization, delivery, eye contact, vocal variety, content)", "points": 6},
     {"description": "Cites specific moments from the speech rather than speaking in generalities", "points": 6},
     {"description": "Tone is constructive and writing is organized (400+ words)", "points": 3}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 6: Round 1 Speeches (Part 2) & Research ----------------
-- (no graded assignments this week — lecture on research and sources)

-- ---------------- COMS 101 · Week 7: Visual Aids & Round 2 Prep ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000003',
   'Quiz 3 – Research and Visual Aids',
   'Online quiz on finding credible sources, integrating evidence, avoiding plagiarism, and designing effective visual aids. Score recorded automatically.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000039', '00000000-0000-0000-0003-000000000039',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 15}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 8: Round 2 Speeches ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000040', '00000000-0000-0000-0002-000000000019', '00000000-0000-0000-0001-000000000003',
   'Analyzing Delivery Style',
   'Watch the assigned speech video. In 400+ words, analyze the speaker''s delivery using at least three specific concepts from course material (e.g. eye contact, vocal variety, pacing, gestures, structure). For each concept: describe what the speaker did, evaluate whether it was effective, and explain what you would coach them to improve.',
   30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000040', '00000000-0000-0000-0003-000000000040',
   '[{"description": "Applies at least three distinct course concepts correctly", "points": 15},
     {"description": "Supports each claim with specific evidence from the video", "points": 10},
     {"description": "Writing is organized and professional (400+ words)", "points": 5}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 9: Persuasive Speaking & Round 3 Prep ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000043', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000003',
   'Quiz 4 – Persuasive Speaking',
   'Online quiz on Aristotle''s appeals (logos, ethos, pathos) and Monroe''s Motivated Sequence. Score recorded automatically.',
   30),
  ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000003',
   'Written Evaluation – Round 2',
   'Write a constructive evaluation of a classmate''s Round 2 informative speech. Address organization, delivery, eye contact, vocal variety, content, and use of visual aids. Cite specific moments. 400+ words.',
   15),
  ('00000000-0000-0000-0003-000000000042', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000003',
   'Reflection 2',
   'Three-part reflection on your Round 2 speech: (1) One sentence — your specific goal for Round 3, drawn from feedback you received. (2) One paragraph — your concrete plan for achieving that goal. (3) 1–2 paragraphs — honest reflection on how Round 2 went and what you would do differently.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000043', '00000000-0000-0000-0003-000000000043',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 30}]'),
  ('00000000-0000-0000-0004-000000000041', '00000000-0000-0000-0003-000000000041',
   '[{"description": "Addresses all six evaluation criteria including visual aids", "points": 6},
     {"description": "Cites specific moments from the speech", "points": 6},
     {"description": "Tone is constructive and writing is organized (400+ words)", "points": 3}]'),
  ('00000000-0000-0000-0004-000000000042', '00000000-0000-0000-0003-000000000042',
   '[{"description": "Round 3 goal is specific and measurable (one sentence)", "points": 3},
     {"description": "Implementation plan is concrete and actionable (one paragraph)", "points": 4},
     {"description": "Reflection on Round 2 shows genuine self-assessment (1–2 paragraphs)", "points": 3}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 10: Round 3 Speeches ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0001-000000000003',
   'Written Evaluation – Round 3',
   'Write a constructive evaluation of a classmate''s Round 3 persuasive speech. Address organization, delivery, use of persuasive appeals (logos/ethos/pathos), evidence, and call to action. Cite specific moments. 400+ words.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000044', '00000000-0000-0000-0003-000000000044',
   '[{"description": "Addresses organization, delivery, and all three persuasive appeals", "points": 7},
     {"description": "Cites specific moments from the speech", "points": 5},
     {"description": "Tone is constructive and writing is organized (400+ words)", "points": 3}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 11: Finals ----------------

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
ON CONFLICT (assignment_id) DO NOTHING;


-- =============================================================================
-- ENROLLMENTS
-- All 15 students in BIO 111 (001–015) and COMS 101 (016–030)
-- Students: 002=Alex Rivera, 003=Jordan Lee, 004=Maya Patel, 005=Tyler Brooks,
--           006=Sam Nguyen, 007=Priya Sharma, 008=Marcus Johnson, 009=Sofia Reyes,
--           010=Ethan Kim, 011=Aaliyah Washington, 012=Connor Murphy, 013=Zoe Chen,
--           014=Diego Flores, 015=Hannah Okafor, 016=Liam Patel
-- =============================================================================

INSERT INTO enrollments (id, course_id, student_id, enrolled_at) VALUES
  -- BIO 111 (enrollments 001–015)
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', NOW()),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000003', NOW()),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000004', NOW()),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000005', NOW()),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000006', NOW()),
  ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000007', NOW()),
  ('00000000-0000-0000-0005-000000000007', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000008', NOW()),
  ('00000000-0000-0000-0005-000000000008', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000009', NOW()),
  ('00000000-0000-0000-0005-000000000009', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000010', NOW()),
  ('00000000-0000-0000-0005-000000000010', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000011', NOW()),
  ('00000000-0000-0000-0005-000000000011', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000012', NOW()),
  ('00000000-0000-0000-0005-000000000012', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000013', NOW()),
  ('00000000-0000-0000-0005-000000000013', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000014', NOW()),
  ('00000000-0000-0000-0005-000000000014', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000015', NOW()),
  ('00000000-0000-0000-0005-000000000015', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000016', NOW()),
  -- COMS 101 (enrollments 016–030)
  ('00000000-0000-0000-0005-000000000016', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000002', NOW()),
  ('00000000-0000-0000-0005-000000000017', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003', NOW()),
  ('00000000-0000-0000-0005-000000000018', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000004', NOW()),
  ('00000000-0000-0000-0005-000000000019', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000005', NOW()),
  ('00000000-0000-0000-0005-000000000020', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000006', NOW()),
  ('00000000-0000-0000-0005-000000000021', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000007', NOW()),
  ('00000000-0000-0000-0005-000000000022', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000008', NOW()),
  ('00000000-0000-0000-0005-000000000023', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000009', NOW()),
  ('00000000-0000-0000-0005-000000000024', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000010', NOW()),
  ('00000000-0000-0000-0005-000000000025', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000011', NOW()),
  ('00000000-0000-0000-0005-000000000026', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000012', NOW()),
  ('00000000-0000-0000-0005-000000000027', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000013', NOW()),
  ('00000000-0000-0000-0005-000000000028', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000014', NOW()),
  ('00000000-0000-0000-0005-000000000029', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000015', NOW()),
  ('00000000-0000-0000-0005-000000000030', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000016', NOW())
ON CONFLICT (course_id, student_id) DO NOTHING;


-- =============================================================================
-- SUBMISSIONS
-- Week 1 assignments for BIO 111 and COMS 101:
--   A015 = BIO 111 Connect Homework 1 – Scientific Method and Cell Basics (5 pts)
--   A033 = COMS 101 Introduction (15 pts)
--   A035 = COMS 101 Quiz 1 – Speech Structure (15 pts)
--
-- State distribution per assignment (same students each time):
--   final        (6): 002 Alex Rivera, 003 Jordan Lee, 004 Maya Patel, 005 Tyler Brooks, 006 Sam Nguyen, 007 Priya Sharma
--   ai_suggested (3): 008 Marcus Johnson, 009 Sofia Reyes, 010 Ethan Kim
--   pending      (3): 011 Aaliyah Washington, 012 Connor Murphy, 013 Zoe Chen
--   draft        (2): 014 Diego Flores, 015 Hannah Okafor
--   blank        (1): 016 Liam Patel — no row
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- A015: BIO 111 Connect Homework 1 – Scientific Method and Cell Basics  (submissions 001–014)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 001 · Alex Rivera · FINAL
  ('00000000-0000-0000-0006-000000000001',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000002',
   'The scientific method is a systematic process scientists use to investigate natural phenomena. It begins with an observation, which leads to a question, then a hypothesis — a testable, falsifiable prediction about what we expect to find. To test a hypothesis, scientists design a controlled experiment. For example, to investigate whether light intensity affects plant growth, I could grow two sets of bean seedlings under identical conditions except for the amount of light they receive. The group receiving more light is the experimental group; the group with minimal light is the control. After measuring stem height and leaf size over two weeks, I could analyze whether my results support or refute the hypothesis. If results are not consistent, the hypothesis is revised and the cycle continues.

The second part of this assignment asks about prokaryotic versus eukaryotic cells. Prokaryotic cells lack a membrane-bound nucleus and other membrane-enclosed organelles. Bacteria and archaea are the two domains of prokaryotic life. Their genetic material floats freely in the cytoplasm in a region called the nucleoid. Eukaryotic cells, by contrast, contain a true nucleus housing their DNA, as well as specialized organelles such as mitochondria and the endoplasmic reticulum. Animal cells and plant cells are classic examples of eukaryotes. A key structural difference is that plant cells also contain chloroplasts and a rigid cell wall made of cellulose, which animal cells lack.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 002 · Jordan Lee · FINAL
  ('00000000-0000-0000-0006-000000000002',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000003',
   'The scientific method provides a reliable framework for answering questions about the natural world. After making an initial observation, a scientist forms a hypothesis — a proposed explanation that must be testable. A controlled experiment is then designed to isolate the variable of interest. Consider testing whether temperature affects enzyme activity: an experiment might expose identical enzyme solutions to temperatures of 4°C, 25°C, 37°C, and 70°C and measure the rate at which each solution catalyzes a reaction. The independent variable is temperature, the dependent variable is reaction rate, and all other factors (enzyme concentration, substrate concentration, pH) are held constant as controls. Data are collected, analyzed statistically, and used to either support or falsify the hypothesis. The scientific method is iterative — inconclusive or unexpected results prompt new hypotheses and further experimentation.

Regarding cell types: prokaryotic cells are structurally simpler and evolutionarily older. They include bacteria such as Escherichia coli and archaea such as Methanobacterium. These cells have no nucleus; instead, their circular DNA resides in a nucleoid region. They also lack membrane-bound organelles. Eukaryotic cells evolved later and are considerably more complex. Animal cells — such as a human muscle cell — and plant cells — such as a leaf mesophyll cell — are eukaryotic. They house their DNA within a nucleus and contain mitochondria, ribosomes, and an endomembrane system. Plant cells additionally have chloroplasts for photosynthesis and a cell wall for structural support.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 003 · Maya Patel · FINAL
  ('00000000-0000-0000-0006-000000000003',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000004',
   'The scientific method is a structured approach to generating reliable knowledge. It begins with curiosity: an observation prompts a question. The scientist then proposes a hypothesis — a specific, measurable prediction — and designs an experiment to test it. A good experiment manipulates exactly one independent variable while controlling all others. For instance, to test whether different soil types affect seed germination rate, I would plant identical seeds in clay, loam, and sandy soils, keep all other conditions constant (water, light, temperature), and count germinated seeds over ten days. The data would either support the hypothesis or require its revision. Peer review and replication by other scientists further validate findings before they become accepted scientific knowledge.

Prokaryotic cells are characterized by their lack of a membrane-bound nucleus and membrane-enclosed organelles. The two groups of prokaryotes are bacteria — such as Staphylococcus aureus — and archaea — such as Halobacterium, which thrives in extremely salty environments. Both types carry their DNA in a nucleoid region and are generally much smaller than eukaryotic cells. Eukaryotic cells possess a true nucleus containing their chromosomes, as well as organelles like the Golgi apparatus and mitochondria. Animal cells and plant cells are both eukaryotic, though they differ: plant cells have chloroplasts that carry out photosynthesis, a central vacuole that maintains turgor pressure, and a cellulose cell wall that provides rigidity — none of which are found in animal cells.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 004 · Tyler Brooks · FINAL
  ('00000000-0000-0000-0006-000000000004',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000005',
   'Scientists rely on the scientific method because it minimizes bias and produces reproducible results. The process starts with an observation that sparks a question, then moves to forming a hypothesis — a clear, testable statement of expected results. The experimental design must include a control group and an experimental group that differ by only one variable. For example, to determine whether caffeine affects the heart rate of Daphnia (water fleas), I would expose one group to a caffeine solution and keep a control group in plain water. I would measure beats per minute under a microscope for both groups and record the data. If the caffeine group shows a statistically significant increase, the hypothesis is supported. If not, it is rejected and a revised hypothesis is formed. The method is cyclical: results always lead to new questions.

Prokaryotic and eukaryotic cells differ fundamentally in their internal organization. Prokaryotes — including bacteria like Bacillus subtilis and archaea like Thermococcus — lack a nucleus; their DNA forms a single circular chromosome in the cytoplasm. They are also smaller and reproduce rapidly by binary fission. Eukaryotes, by contrast, have a defined nucleus enclosed by a nuclear envelope, and their DNA is organized into multiple linear chromosomes. Animal cells and plant cells are eukaryotic: animal cells have centrioles and lysosomes, while plant cells have chloroplasts, a large central vacuole, and a cell wall. These structural differences reflect the different evolutionary histories and functional demands of each cell type.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 005 · Sam Nguyen · FINAL
  ('00000000-0000-0000-0006-000000000005',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000006',
   'The scientific method is how scientists test ideas in a controlled and repeatable way. It starts with an observation, then a question, then a hypothesis. To test a hypothesis, you design an experiment with a control group and an experimental group, changing only the variable you are testing. A good example is testing whether fertilizer amount affects tomato plant yield: one group gets the recommended dose, one gets double, and one gets none. You keep water, light, and soil the same for all three groups. After the growing season you compare tomato yields across groups. The results either support the hypothesis or show it needs to be revised. The scientific method is important because it gives everyone a shared process for testing ideas so results can be trusted and repeated.

Prokaryotic cells are simpler than eukaryotic cells. They do not have a nucleus — their DNA floats in the cytoplasm. The two types of prokaryotes are bacteria and archaea. Bacteria are found almost everywhere, including in our digestive systems. Archaea often live in extreme environments. Eukaryotic cells are larger and have a membrane-enclosed nucleus as well as organelles. Animal cells and plant cells are both eukaryotic. The main differences between them are that plant cells have a cell wall and chloroplasts, while animal cells do not. These differences allow plant cells to make their own food through photosynthesis, which is a key distinction.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 006 · Priya Sharma · FINAL
  ('00000000-0000-0000-0006-000000000006',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000007',
   'The scientific method is a step-by-step process for investigating questions about the natural world. A scientist begins by observing something interesting, formulates a question, and then proposes a hypothesis — a testable explanation for what they expect to find. The experiment that follows must be designed carefully so that only one variable differs between the control and experimental groups. For instance, to test whether exercise duration affects resting heart rate over a month, participants in the experimental group would exercise 30 minutes daily while the control group remains sedentary, and all other lifestyle factors would be standardized. Heart rate would be measured at the same time each morning. The results are then analyzed and used to support or refute the hypothesis. If the data are unclear, the hypothesis is modified and the process repeats.

There are two broad categories of cells: prokaryotic and eukaryotic. Prokaryotic cells, found in bacteria and archaea, are defined by the absence of a membrane-bound nucleus. Their genetic material is located in a region of the cytoplasm called the nucleoid. They are generally small and structurally simple. Eukaryotic cells, in contrast, contain a nucleus surrounded by a nuclear membrane, as well as membrane-bound organelles like mitochondria and the endoplasmic reticulum. Animal cells and plant cells are both eukaryotes. Plant cells are distinguished by the presence of chloroplasts (for photosynthesis), a large central vacuole, and a rigid cell wall made of cellulose. Animal cells lack these structures but have centrioles, which play a role in cell division.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 007 · Marcus Johnson · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000007',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000008',
   'The scientific method is a process used to answer scientific questions. You start with an observation and then ask a question. Then you make a hypothesis, which is a prediction about what will happen. You test the hypothesis with an experiment where you have a control group and an experimental group. After collecting data you see if the hypothesis was right or wrong.

Prokaryotic cells do not have a nucleus. Two examples are bacteria and archaea. Eukaryotic cells have a nucleus. Animal cells and plant cells are eukaryotic. Plant cells have a cell wall and chloroplasts.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 008 · Sofia Reyes · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000008',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000009',
   'Scientists use the scientific method to study the world. It involves making an observation, asking a question, forming a hypothesis, and doing an experiment. The control group stays the same and the experimental group is changed. An example would be testing different amounts of water on plants and seeing which grows tallest.

Prokaryotic cells include bacteria and archaea. They are smaller and simpler than eukaryotic cells and do not have a nucleus. Eukaryotic cells have a nucleus. Examples are animal cells and plant cells. Plant cells look different because they have a green color from chlorophyll.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 009 · Ethan Kim · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000009',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000010',
   'The scientific method helps scientists find answers. First you observe something and ask a question. Then you guess what might happen — that is the hypothesis. You run an experiment and collect data to see if you were right. Scientists repeat experiments to make sure the results are reliable.

For cell types, prokaryotic cells are bacteria and archaea. They do not have a nucleus. Eukaryotic cells have a nucleus and are more complex. Animal and plant cells are eukaryotic. They are different from each other in some ways like the cell wall in plant cells.',
   NOW() - INTERVAL '1 day', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 010 · Aaliyah Washington · PENDING
  ('00000000-0000-0000-0006-000000000010',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000011',
   'The scientific method is steps scientists follow. You observe, ask a question, make a hypothesis and test it. Prokaryotic cells dont have a nucleus like bacteria. Eukaryotic cells have a nucleus like animal and plant cells.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 011 · Connor Murphy · PENDING
  ('00000000-0000-0000-0006-000000000011',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000012',
   'Scientists use the scientific method to study things. Prokaryotic cells are like bacteria they have no nucleus. Eukaryotic cells include animal cells and plant cells and they have a nucleus.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 012 · Zoe Chen · PENDING
  ('00000000-0000-0000-0006-000000000012',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000013',
   'The scientific method is a way to do experiments. Prokaryotes are bacteria. Eukaryotes have a nucleus. Plant and animal cells are eukaryotes.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 013 · Diego Flores · DRAFT
  ('00000000-0000-0000-0006-000000000013',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000014',
   'The scientific method involves',
   NULL, 'draft'),

  -- 014 · Hannah Okafor · DRAFT
  ('00000000-0000-0000-0006-000000000014',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000015',
   'The scientific method involves',
   NULL, 'draft')

  -- 016 Liam Patel: BLANK — no row

ON CONFLICT (assignment_id, student_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A033: COMS 101 Introduction  (submissions 015–028)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 015 · Alex Rivera · FINAL
  ('00000000-0000-0000-0006-000000000015',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000002',
   'Hi, I''m Alex Rivera, a Business Administration major. My biggest communication challenge is that I tend to speak too quickly when I''m nervous, which makes it hard for people to follow my train of thought. I want to work on slowing down, using deliberate pauses, and letting key points land before moving on.',
   NOW() - INTERVAL '4 days', 'submitted'),

  -- 016 · Jordan Lee · FINAL
  ('00000000-0000-0000-0006-000000000016',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000003',
   'Hi, I''m Jordan Lee, a Psychology major. My main communication challenge is making eye contact with an audience — I tend to focus on one spot or look at my notes instead of scanning the room. I''m hoping this class will help me become more comfortable looking at people directly while I speak so my delivery feels more natural and confident.',
   NOW() - INTERVAL '4 days', 'submitted'),

  -- 017 · Maya Patel · FINAL
  ('00000000-0000-0000-0006-000000000017',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000004',
   'Hi, I''m Maya Patel, a Nursing major. One communication challenge I consistently face is organizing my thoughts on the spot — I know what I want to say but it comes out jumbled under pressure. I want to learn techniques for structuring ideas quickly so that even impromptu responses sound clear and purposeful.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 018 · Tyler Brooks · FINAL
  ('00000000-0000-0000-0006-000000000018',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000005',
   'Hi, I''m Tyler Brooks, a Criminal Justice major. My biggest communication challenge is vocal variety — I tend to speak in a flat, monotone voice that does not convey enthusiasm even when I care about the topic. I want to develop more dynamic delivery so that audiences stay engaged and my words have the impact they deserve.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 019 · Sam Nguyen · FINAL
  ('00000000-0000-0000-0006-000000000019',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000006',
   'Hi, I''m Sam Nguyen, an Environmental Science major. A communication challenge I struggle with is filler words — I say "um" and "like" constantly when I''m thinking, which undermines how knowledgeable I sound. I want to build the habit of pausing silently instead of filling silence with words, so my speech sounds more polished and intentional.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 020 · Priya Sharma · FINAL
  ('00000000-0000-0000-0006-000000000020',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000007',
   'Hi, I''m Priya Sharma, a Computer Science major. My communication challenge is projecting confidence when I''m not sure about something — I tend to trail off or hedge too much, which makes me sound uncertain even when I have a valid point. I want to learn how to deliver ideas with conviction while still being honest about uncertainty.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 021 · Marcus Johnson · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000021',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000008',
   'Hi I''m Marcus Johnson and I''m majoring in Kinesiology. My communication challenge is getting nervous in front of groups and forgetting what I was going to say.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 022 · Sofia Reyes · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000022',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000009',
   'My name is Sofia Reyes and I am a Graphic Design major. I find it hard to speak in front of people and I want to get better at it.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 023 · Ethan Kim · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000023',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000010',
   'Hi, I am Ethan Kim. I am studying Accounting. I struggle with public speaking and hope this class helps me improve.',
   NOW() - INTERVAL '1 day', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 024 · Aaliyah Washington · PENDING
  ('00000000-0000-0000-0006-000000000024',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000011',
   'My name is Aaliyah Washington.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 025 · Connor Murphy · PENDING
  ('00000000-0000-0000-0006-000000000025',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000012',
   'Connor Murphy.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 026 · Zoe Chen · PENDING
  ('00000000-0000-0000-0006-000000000026',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000013',
   'My name is Zoe Chen.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 027 · Diego Flores · DRAFT
  ('00000000-0000-0000-0006-000000000027',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000014',
   'My name is',
   NULL, 'draft'),

  -- 028 · Hannah Okafor · DRAFT
  ('00000000-0000-0000-0006-000000000028',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000015',
   'My name is',
   NULL, 'draft')

  -- 016 Liam Patel: BLANK — no row

ON CONFLICT (assignment_id, student_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A035: COMS 101 Quiz 1 – Speech Structure  (submissions 029–042)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 029 · Alex Rivera · FINAL
  ('00000000-0000-0000-0006-000000000029',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000002',
   'The introduction of a speech serves two essential functions: it captures the audience''s attention and orients them to the topic. An effective introduction opens with an attention-getter — such as a startling statistic, a rhetorical question, or a brief personal story — and then previews the main points the speaker will cover. Without this preview, the audience has no roadmap and may struggle to follow the structure of the speech.

The body is the heart of the speech, where the speaker develops each main point in depth. Each main point should be supported by evidence — facts, examples, statistics, or testimony — and the points should connect through clear transitions. Good transitions signal to the audience that the speaker is moving from one idea to the next, maintaining coherence throughout.

The conclusion has two jobs: to summarize what was said and to provide a sense of closure, often through a call to action or a memorable final statement. Echoing the attention-getter from the introduction — a technique called a callback — is particularly effective because it gives the audience a satisfying sense of completion and reinforces the central message.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 030 · Jordan Lee · FINAL
  ('00000000-0000-0000-0006-000000000030',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000003',
   'A well-structured speech has three distinct parts, each with a specific purpose. The introduction must do more than just announce the topic — it needs to earn the audience''s attention and trust. Effective attention-getters include humor, a compelling anecdote, or a thought-provoking question. After grabbing attention, the introduction states the thesis and previews the main points, so the audience knows exactly what to expect.

The body develops the argument or information across two to four main points. Each point is introduced, developed with supporting evidence, and closed before transitioning to the next. The transitions between points are critical: without them, the speech feels choppy and disconnected. Strong transitions recap the previous point and preview the next one, keeping the audience oriented at all times.

The conclusion signals to the audience that the speech is ending — which matters because audiences tend to remember the last thing they hear. A strong conclusion restates the thesis, briefly reviews the main points, and closes with a memorable final thought or call to action. Ending abruptly without a proper conclusion leaves the audience feeling unfinished.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 031 · Maya Patel · FINAL
  ('00000000-0000-0000-0006-000000000031',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000004',
   'Speech structure follows a three-part format that audiences have been conditioned to expect. The introduction establishes credibility and context: it uses an attention-getter to engage the audience emotionally or intellectually, establishes the speaker''s connection to the topic, states the central thesis, and previews the main points in the order they will be addressed. This roadmap reduces cognitive load for the audience.

In the body, the speaker develops each main point with specific, credible evidence. Organizing the body points in a logical order — chronological, problem-solution, or topical — helps the audience follow the argument. Each point should be distinct enough to stand alone while contributing to the overall thesis. Internal summaries at the end of long main points can help the audience retain the information.

The conclusion fulfills a psychological contract with the audience. After hearing the speaker develop an argument, the audience expects closure. The conclusion restates the thesis in fresh language, summarizes the main points concisely, and delivers a final statement that leaves a lasting impression. A call to action is especially appropriate for persuasive speeches because it gives the audience something concrete to do with the information they have received.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 032 · Tyler Brooks · FINAL
  ('00000000-0000-0000-0006-000000000032',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000005',
   'Every effective speech relies on a clear three-part structure. The introduction is the audience''s first impression of both the speaker and the topic. It should open with an attention device — something unexpected, emotional, or provocative — and then transition smoothly into the thesis and a preview of the main points. A strong introduction signals that the speaker is prepared and worth listening to.

The body is where the speaker does the real argumentative or informational work. Each main point should be clearly stated, supported with evidence, and connected to the thesis. Transitions between points are not optional — they are the connective tissue that holds the speech together. Without transitions, the audience must work too hard to follow the logic, which increases the chance they will disengage.

The conclusion is the last thing the audience hears, so it carries disproportionate weight in shaping their overall impression. It should begin with a clear signal that the speech is ending (such as "In conclusion" or "To summarize"), briefly restate the main points, and end with a strong closing line. A callback to the opening attention-getter creates a sense of symmetry and makes the speech feel polished and complete.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 033 · Sam Nguyen · FINAL
  ('00000000-0000-0000-0006-000000000033',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000006',
   'A speech is organized into three parts. The introduction grabs the audience''s attention with a hook and tells them what the speech will be about by previewing the main points. A good attention-getter could be a surprising fact, a short story, or a question the audience can relate to. The introduction ends by stating the main thesis clearly.

The body develops the main points one at a time and uses evidence to support each one. Transitions between points help the audience follow along and understand the connection between ideas. Each point should be focused and relevant to the overall topic.

The conclusion wraps up the speech by restating the main points and leaving the audience with something to remember or act on. It should feel like a natural ending, not just stopping in the middle. A call to action works well in persuasive speeches to motivate the audience to do something with what they have learned.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 034 · Priya Sharma · FINAL
  ('00000000-0000-0000-0006-000000000034',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000007',
   'The three-part structure of a speech — introduction, body, and conclusion — is designed to serve the audience. The introduction does more than announce a topic. It builds interest through an attention-getter, establishes the speaker''s credibility, and previews what is coming so the audience can follow along. Without a clear preview, audiences can feel lost from the start.

The body is where the speaker delivers the content. It is organized into main points, each developed with evidence and connected by transitions. The transitions matter because they signal the audience when one idea is ending and another is beginning, keeping the argument coherent. Each main point should be strong enough to stand alone but unified by the overall thesis.

The conclusion reinforces everything the speaker has said and provides a memorable ending. Restating the main points briefly helps the audience walk away with the key ideas intact. A strong closing line — whether a memorable quote, a call to action, or a return to the opening image — ensures the audience leaves with a clear impression of the speech''s purpose.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 035 · Marcus Johnson · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000035',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000008',
   'The introduction starts the speech and gets the audience interested. The body has the main points with evidence. The conclusion ends the speech and summarizes what was said.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 036 · Sofia Reyes · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000036',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000009',
   'The introduction grabs attention and previews the speech. The body develops the main points with supporting details. The conclusion restates the main points and provides a closing statement.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 037 · Ethan Kim · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000037',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000010',
   'A speech has three parts. The introduction hooks the audience and states the topic. The body covers the main points. The conclusion summarizes the speech.',
   NOW() - INTERVAL '1 day', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 038 · Aaliyah Washington · PENDING
  ('00000000-0000-0000-0006-000000000038',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000011',
   'A speech has an introduction body and conclusion. The introduction gets attention. The body talks about the main points and the conclusion is when you end the speech and remind people what you talked about.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 039 · Connor Murphy · PENDING
  ('00000000-0000-0000-0006-000000000039',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000012',
   'Speeches have three parts introduction body conclusion. The introduction grabs attention. The body has the info. The conclusion ends it.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 040 · Zoe Chen · PENDING
  ('00000000-0000-0000-0006-000000000040',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000013',
   'A speech has three parts. You start with the intro to get peoples attention then you have the body where you say your main points and then the conclusion to finish.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 041 · Diego Flores · DRAFT
  ('00000000-0000-0000-0006-000000000041',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000014',
   'The introduction is the first part of a speech',
   NULL, 'draft'),

  -- 042 · Hannah Okafor · DRAFT
  ('00000000-0000-0000-0006-000000000042',
   '00000000-0000-0000-0003-000000000035',
   '00000000-0000-0000-0000-000000000015',
   'The introduction is the first part of a speech',
   NULL, 'draft')

  -- 016 Liam Patel: BLANK — no row

ON CONFLICT (assignment_id, student_id) DO NOTHING;


-- =============================================================================
-- GRADES
-- final state:        ai_suggested_score + final_score + approved_by + approved_at
-- ai_suggested state: ai_suggested_score only (final_score/feedback/approved = NULL)
-- pending/draft:      no grade row
--
-- Grade IDs 001–009  → A015 BIO Connect Homework 1 (6 final + 3 ai_suggested)
-- Grade IDs 010–018  → A033 COMS Introduction
-- Grade IDs 019–027  → A035 COMS Quiz 1 – Speech Structure
-- =============================================================================

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- ── A015 BIO 111 Connect Homework 1 ─────────────────────────────────────────

  -- G001 · Alex Rivera · FINAL (sub 001)
  ('00000000-0000-0000-0007-000000000001',
   '00000000-0000-0000-0006-000000000001',
   5,
   'Scientific method with example: 3/3 — accurate, specific example given (bean seedlings under different light intensities). Control/experimental groups clearly identified and hypothesis described correctly.
Prokaryotic vs. eukaryotic: 2/2 — bacteria and archaea correctly named as prokaryotes; animal cell and plant cell correctly named as eukaryotes with accurate structural distinctions (nucleus, organelles, cell wall, chloroplasts).',
   5,
   'Excellent work. Your scientific method paragraph gives a concrete, well-explained example and your cell comparison is accurate and complete. The detail about the nucleoid region and chloroplasts shows genuine engagement with the material.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- G002 · Jordan Lee · FINAL (sub 002)
  ('00000000-0000-0000-0007-000000000002',
   '00000000-0000-0000-0006-000000000002',
   5,
   'Scientific method with example: 3/3 — accurate, specific example given (enzyme activity at different temperatures). Independent and dependent variables correctly identified; controls well described.
Prokaryotic vs. eukaryotic: 2/2 — E. coli and Methanobacterium named as prokaryotes; human muscle cell and leaf mesophyll cell named as eukaryotes. Structural differences (nucleus, organelles, cell wall, chloroplasts) accurately described.',
   5,
   'Strong submission. Your enzyme activity example is specific and technically accurate, and naming actual species for both prokaryotes and eukaryotes shows real engagement. Full marks.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- G003 · Maya Patel · FINAL (sub 003)
  ('00000000-0000-0000-0007-000000000003',
   '00000000-0000-0000-0006-000000000003',
   5,
   'Scientific method with example: 3/3 — accurate, specific example given (soil type vs. seed germination rate). Hypothesis, control variables, and iterative nature of the method all addressed.
Prokaryotic vs. eukaryotic: 2/2 — Staphylococcus aureus and Halobacterium correctly named; animal and plant cells correctly distinguished with accurate details (central vacuole, cellulose cell wall).',
   5,
   'Excellent response. Your scientific method example is well-chosen and your cell comparison names real organisms. The detail about the central vacuole and cellulose cell wall is exactly the level of specificity this assignment is looking for.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day'),

  -- G004 · Tyler Brooks · FINAL (sub 004)
  ('00000000-0000-0000-0007-000000000004',
   '00000000-0000-0000-0006-000000000004',
   5,
   'Scientific method with example: 3/3 — accurate, specific example given (caffeine and Daphnia heart rate). Control/experimental groups correctly identified; iterative nature of the method noted.
Prokaryotic vs. eukaryotic: 2/2 — Bacillus subtilis and Thermococcus correctly named as prokaryotes; animal and plant cells correctly distinguished with organelle-level details (centrioles, lysosomes, chloroplasts, cell wall).',
   5,
   'Excellent work. The Daphnia example is creative and specific, and your cell comparison demonstrates real knowledge of organelle-level differences. Full marks.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day'),

  -- G005 · Sam Nguyen · FINAL (sub 005)
  ('00000000-0000-0000-0007-000000000005',
   '00000000-0000-0000-0006-000000000005',
   4,
   'Scientific method with example: 3/3 — accurate, specific example given (fertilizer dose vs. tomato yield). Three experimental groups and controls clearly described.
Prokaryotic vs. eukaryotic: 1/2 — bacteria and archaea correctly named as prokaryotes; animal and plant cells correctly named as eukaryotes. However, the structural distinction is simplified — "cell wall and chloroplasts" is correct but the response does not mention the nucleus as the defining feature of eukaryotes.',
   4,
   'Good work. Your fertilizer experiment is a clear and specific example. For the cell comparison, make sure you center the nucleus as the defining difference between prokaryotes and eukaryotes — the absence of a membrane-bound nucleus is the key criterion, not just the cell wall and chloroplasts.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day'),

  -- G006 · Priya Sharma · FINAL (sub 006)
  ('00000000-0000-0000-0007-000000000006',
   '00000000-0000-0000-0006-000000000006',
   5,
   'Scientific method with example: 3/3 — accurate, specific example given (exercise duration vs. resting heart rate). Control/experimental setup, standardized conditions, and hypothesis revision all addressed.
Prokaryotic vs. eukaryotic: 2/2 — bacteria and archaea correctly named as prokaryotes; animal and plant cells correctly named as eukaryotes with accurate organelle-level distinctions (centrioles, chloroplasts, cell wall, central vacuole).',
   5,
   'Excellent response. Your exercise experiment example is well-designed and shows you understand how to control variables. The cell comparison is thorough and accurate. Full marks.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day')

ON CONFLICT (submission_id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- G007 · Marcus Johnson · AI_SUGGESTED (sub 007)
  ('00000000-0000-0000-0007-000000000007',
   '00000000-0000-0000-0006-000000000007',
   3,
   'Scientific method with example: 1/3 — the steps are listed correctly but no specific example is given. The response describes the process in abstract terms only.
Prokaryotic vs. eukaryotic: 2/2 — bacteria and archaea correctly named as prokaryotes; animal and plant cells correctly named as eukaryotes. Cell wall and chloroplasts correctly noted as plant cell features.',
   NULL, NULL, NULL, NULL),

  -- G008 · Sofia Reyes · AI_SUGGESTED (sub 008)
  ('00000000-0000-0000-0007-000000000008',
   '00000000-0000-0000-0006-000000000008',
   3,
   'Scientific method with example: 2/3 — an example is present (water amount vs. plant height) but it lacks detail: no mention of the control group, dependent variable, or what data would be collected.
Prokaryotic vs. eukaryotic: 1/2 — bacteria and archaea correctly identified as prokaryotes; animal and plant cells identified as eukaryotes. However, stating plant cells "look green from chlorophyll" is imprecise — chloroplasts are the organelle; chlorophyll is the pigment inside them.',
   NULL, NULL, NULL, NULL),

  -- G009 · Ethan Kim · AI_SUGGESTED (sub 009)
  ('00000000-0000-0000-0007-000000000009',
   '00000000-0000-0000-0006-000000000009',
   3,
   'Scientific method with example: 1/3 — steps are listed but no example is provided. "Run an experiment" does not demonstrate understanding of experimental design.
Prokaryotic vs. eukaryotic: 2/2 — bacteria and archaea correctly named as prokaryotes; animal and plant cells correctly named as eukaryotes. Cell wall noted as a plant cell feature.',
   NULL, NULL, NULL, NULL)

ON CONFLICT (submission_id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- ── A033 COMS 101 Introduction ──────────────────────────────────────────────

  -- G010 · Alex Rivera · FINAL (sub 015)
  ('00000000-0000-0000-0007-000000000010',
   '00000000-0000-0000-0006-000000000015',
   15,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 4/10 — speaking too quickly when nervous is a specific, authentic challenge. Good self-awareness.
Genuine 2–3 sentences with actionable goal: 5/5 — three sentences, specific goal stated (slow down, use deliberate pauses, let key points land). Reads as authentic.',
   15,
   'Strong introduction. You identified a specific communication challenge and described a concrete goal. This is exactly the kind of self-aware framing that will help you get the most out of this course.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '3 days'),

  -- G011 · Jordan Lee · FINAL (sub 016)
  ('00000000-0000-0000-0007-000000000011',
   '00000000-0000-0000-0006-000000000016',
   15,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 4/10 — difficulty maintaining eye contact is a specific, common challenge. Personal authenticity comes through.
Genuine 2–3 sentences with actionable goal: 5/5 — three sentences, specific goal (scan the room, feel more natural and confident). Reads as genuine.',
   15,
   'Good work. Eye contact is a real and common challenge, and your goal is specific enough to work toward. I look forward to seeing your progress over the quarter.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '3 days'),

  -- G012 · Maya Patel · FINAL (sub 017)
  ('00000000-0000-0000-0007-000000000012',
   '00000000-0000-0000-0006-000000000017',
   15,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 4/10 — organizing thoughts on the spot is a specific and relatable challenge, especially relevant for a Nursing major.
Genuine 2–3 sentences with actionable goal: 5/5 — three sentences, specific goal stated (techniques for structuring ideas quickly so impromptu responses sound clear and purposeful). Reads as genuine.',
   15,
   'Excellent introduction. The challenge you describe — knowing what you want to say but having it come out jumbled — is specific and honest, and your goal is actionable. This is a great start.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- G013 · Tyler Brooks · FINAL (sub 018)
  ('00000000-0000-0000-0007-000000000013',
   '00000000-0000-0000-0006-000000000018',
   15,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 4/10 — flat, monotone delivery is a specific challenge. Insightful to note it happens even when you care about the topic.
Genuine 2–3 sentences with actionable goal: 5/5 — three sentences, specific goal (dynamic delivery, audience engagement, impact). Reads as genuine.',
   15,
   'Strong introduction. Identifying monotone delivery as your challenge shows good self-awareness, and noting that it happens even when you care about the topic is an insightful observation. That awareness is the first step toward change.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- G014 · Sam Nguyen · FINAL (sub 019)
  ('00000000-0000-0000-0007-000000000014',
   '00000000-0000-0000-0006-000000000019',
   15,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 4/10 — filler words ("um" and "like") is a specific, common challenge. Connecting it to credibility shows real understanding of its impact.
Genuine 2–3 sentences with actionable goal: 5/5 — three sentences, specific goal (pause silently instead of filling silence, sound more polished and intentional). Reads as genuine.',
   15,
   'Good introduction. Filler words are one of the most common challenges speakers face, and your goal — pausing silently instead of filling silence — is exactly the right technique to practice. Well done.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- G015 · Priya Sharma · FINAL (sub 020)
  ('00000000-0000-0000-0007-000000000015',
   '00000000-0000-0000-0006-000000000020',
   15,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 4/10 — trailing off and over-hedging is a specific challenge. The nuance of wanting to sound confident without being dishonest about uncertainty is sophisticated.
Genuine 2–3 sentences with actionable goal: 5/5 — three sentences, specific goal (deliver ideas with conviction while remaining honest about uncertainty). Reads as genuine.',
   15,
   'Excellent introduction. The challenge you describe — wanting to project confidence without overstating certainty — is one of the more nuanced communication goals in this class. That self-awareness will serve you well.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day')

ON CONFLICT (submission_id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- G016 · Marcus Johnson · AI_SUGGESTED (sub 021)
  ('00000000-0000-0000-0007-000000000016',
   '00000000-0000-0000-0006-000000000021',
   8,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 2/10 — "getting nervous and forgetting what I was going to say" is a common experience but described only vaguely. No specific goal or strategy mentioned.
Genuine 2–3 sentences with actionable goal: 3/5 — two sentences, but no specific action plan. Response reads as genuine in tone but lacks the required goal statement.',
   NULL, NULL, NULL, NULL),

  -- G017 · Sofia Reyes · AI_SUGGESTED (sub 022)
  ('00000000-0000-0000-0007-000000000017',
   '00000000-0000-0000-0006-000000000022',
   7,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 1/10 — "I find it hard to speak in front of people" is very vague. No specific challenge named and no goal described.
Genuine 2–3 sentences with actionable goal: 3/5 — two sentences, but the second is a generic aspiration rather than a specific goal.',
   NULL, NULL, NULL, NULL),

  -- G018 · Ethan Kim · AI_SUGGESTED (sub 023)
  ('00000000-0000-0000-0007-000000000018',
   '00000000-0000-0000-0006-000000000023',
   7,
   'Name and major: 3/10 — present and clear.
Communication challenge identified: 1/10 — "I struggle with public speaking" is too broad. No specific aspect of public speaking identified.
Genuine 2–3 sentences with actionable goal: 3/5 — two sentences; "hope this class helps me improve" is not a specific goal.',
   NULL, NULL, NULL, NULL)

ON CONFLICT (submission_id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- ── A035 COMS 101 Quiz 1 – Speech Structure ──────────────────────────────────

  -- G019 · Alex Rivera · FINAL (sub 029)
  ('00000000-0000-0000-0007-000000000019',
   '00000000-0000-0000-0006-000000000029',
   15,
   'Introduction (purpose + how): 5/5 — accurately describes the two functions (attention-getting and previewing), names specific attention-getter types, and explains the preview''s role for the audience.
Body (development + evidence + transitions): 5/5 — correctly identifies evidence-based development, logical organization, and transitions as connective tissue; explains what transitions do for the audience.
Conclusion (summary + closure): 5/5 — accurately describes restating the thesis, summarizing main points, and providing a memorable close; bonus: correctly explains the callback technique.',
   15,
   'Excellent answer. You described each part accurately and with real depth — especially the callback technique in the conclusion. This is a strong demonstration of the course material.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- G020 · Jordan Lee · FINAL (sub 030)
  ('00000000-0000-0000-0007-000000000020',
   '00000000-0000-0000-0006-000000000030',
   15,
   'Introduction (purpose + how): 5/5 — accurately describes earning attention and trust, names attention-getter types, explains thesis and preview.
Body (development + evidence + transitions): 5/5 — accurately describes main point development, evidence, and transitions; correctly identifies transitions as "connective tissue" that keeps the argument coherent.
Conclusion (summary + closure): 5/5 — accurately describes restating the thesis, reviewing main points, and closing with a memorable thought; notes the psychological importance of the last thing the audience hears.',
   15,
   'Strong response throughout. The observation that the conclusion carries disproportionate weight because audiences remember the last thing they hear shows real understanding of audience psychology. Full marks.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- G021 · Maya Patel · FINAL (sub 031)
  ('00000000-0000-0000-0007-000000000021',
   '00000000-0000-0000-0006-000000000031',
   15,
   'Introduction (purpose + how): 5/5 — accurately describes attention-getter, credibility establishment, thesis, and preview; correctly notes the preview reduces cognitive load.
Body (development + evidence + transitions): 5/5 — accurately describes evidence, logical ordering, and internal summaries; demonstrates understanding of multiple organizational patterns.
Conclusion (summary + closure): 5/5 — accurately describes thesis restatement, main point summary, and final statement; correctly notes call to action is especially appropriate for persuasive speeches.',
   15,
   'Excellent work. Your response shows sophisticated understanding — noting the cognitive load function of previews and the appropriateness of calls to action for persuasive speeches. Full marks.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day'),

  -- G022 · Tyler Brooks · FINAL (sub 032)
  ('00000000-0000-0000-0007-000000000022',
   '00000000-0000-0000-0006-000000000032',
   15,
   'Introduction (purpose + how): 5/5 — accurately describes attention device, thesis, and preview; notes the introduction signals speaker preparation.
Body (development + evidence + transitions): 5/5 — accurately describes main points, evidence, and transitions; correctly notes transitions are "not optional" and explains what happens without them.
Conclusion (summary + closure): 5/5 — accurately describes the signal phrase, main point review, and strong closing line; correctly identifies the callback as creating a sense of symmetry.',
   15,
   'Strong response. Framing transitions as "not optional" is a great way to put it — it emphasizes how critical they are. And noting the signal phrase ("In conclusion") shows attention to practical delivery. Full marks.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day'),

  -- G023 · Sam Nguyen · FINAL (sub 033)
  ('00000000-0000-0000-0007-000000000023',
   '00000000-0000-0000-0006-000000000033',
   13,
   'Introduction (purpose + how): 4/5 — accurately describes attention-getter and preview; correctly notes thesis. One sentence per element is on the minimal side.
Body (development + evidence + transitions): 5/5 — accurately describes main points, evidence, and transitions.
Conclusion (summary + closure): 4/5 — accurately describes restatement and call to action. Missing: no mention of closure or memorable final statement beyond the call to action.',
   13,
   'Good response overall. Your body section is strong and your description of the introduction is accurate. The conclusion section would benefit from more detail — a call to action is one option, but the conclusion can also close with a memorable quote or a callback to the opening. Add that nuance next time.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day'),

  -- G024 · Priya Sharma · FINAL (sub 034)
  ('00000000-0000-0000-0007-000000000024',
   '00000000-0000-0000-0006-000000000034',
   15,
   'Introduction (purpose + how): 5/5 — accurately describes serving the audience, attention-getter, credibility, and preview; correctly notes what happens without a preview.
Body (development + evidence + transitions): 5/5 — accurately describes main points, evidence, and transitions; correctly explains the function of transitions for the audience.
Conclusion (summary + closure): 5/5 — accurately describes restating the thesis in fresh language, summarizing main points, and delivering a lasting impression; notes specific closing techniques.',
   15,
   'Excellent response. Framing the introduction as serving the audience — rather than just announcing a topic — shows real rhetorical understanding. And noting that the thesis should be restated "in fresh language" is a sophisticated detail. Full marks.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day')

ON CONFLICT (submission_id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- G025 · Marcus Johnson · AI_SUGGESTED (sub 035)
  ('00000000-0000-0000-0007-000000000025',
   '00000000-0000-0000-0006-000000000035',
   5,
   'Introduction (purpose + how): 1/5 — one sentence; names "getting the audience interested" but does not describe the attention-getter or preview.
Body (development + evidence + transitions): 2/5 — one sentence; correctly notes main points and evidence but omits transitions.
Conclusion (summary + closure): 2/5 — one sentence; correctly notes summarizing but omits the call to action or closing statement.',
   NULL, NULL, NULL, NULL),

  -- G026 · Sofia Reyes · AI_SUGGESTED (sub 036)
  ('00000000-0000-0000-0007-000000000026',
   '00000000-0000-0000-0006-000000000036',
   7,
   'Introduction (purpose + how): 2/5 — one sentence; correctly names attention-getter and preview but no explanation of purpose or how each works.
Body (development + evidence + transitions): 3/5 — one sentence; correctly names main points and supporting details but does not explain the role of transitions.
Conclusion (summary + closure): 2/5 — one sentence; correctly names restating main points and closing statement but no explanation of why these matter.',
   NULL, NULL, NULL, NULL),

  -- G027 · Ethan Kim · AI_SUGGESTED (sub 037)
  ('00000000-0000-0000-0007-000000000027',
   '00000000-0000-0000-0006-000000000037',
   5,
   'Introduction (purpose + how): 1/5 — one sentence; names "hooks the audience and states the topic" but no explanation of how or why.
Body (development + evidence + transitions): 2/5 — one sentence; correctly names main points but omits evidence and transitions entirely.
Conclusion (summary + closure): 2/5 — one sentence; correctly names summarizing but no mention of closure, call to action, or memorable final statement.',
   NULL, NULL, NULL, NULL)

ON CONFLICT (submission_id) DO NOTHING;


-- ── Assignment due dates ──────────────────────────────────────────────────────
-- BIO 111 (015–032)
UPDATE assignments SET due_date = '2026-05-28' WHERE id = '00000000-0000-0000-0003-000000000015';
UPDATE assignments SET due_date = '2026-06-01' WHERE id = '00000000-0000-0000-0003-000000000016';
UPDATE assignments SET due_date = '2026-06-04' WHERE id = '00000000-0000-0000-0003-000000000017';
UPDATE assignments SET due_date = '2026-06-08' WHERE id = '00000000-0000-0000-0003-000000000018';
UPDATE assignments SET due_date = '2026-06-11' WHERE id = '00000000-0000-0000-0003-000000000019';
UPDATE assignments SET due_date = '2026-06-15' WHERE id = '00000000-0000-0000-0003-000000000020';
UPDATE assignments SET due_date = '2026-06-18' WHERE id = '00000000-0000-0000-0003-000000000021';
UPDATE assignments SET due_date = '2026-06-22' WHERE id = '00000000-0000-0000-0003-000000000022';
UPDATE assignments SET due_date = '2026-06-25' WHERE id = '00000000-0000-0000-0003-000000000023';
UPDATE assignments SET due_date = '2026-06-29' WHERE id = '00000000-0000-0000-0003-000000000024';
UPDATE assignments SET due_date = '2026-07-02' WHERE id = '00000000-0000-0000-0003-000000000025';
UPDATE assignments SET due_date = '2026-07-06' WHERE id = '00000000-0000-0000-0003-000000000026';
UPDATE assignments SET due_date = '2026-07-09' WHERE id = '00000000-0000-0000-0003-000000000027';
UPDATE assignments SET due_date = '2026-07-13' WHERE id = '00000000-0000-0000-0003-000000000028';
UPDATE assignments SET due_date = '2026-07-16' WHERE id = '00000000-0000-0000-0003-000000000029';
UPDATE assignments SET due_date = '2026-07-20' WHERE id = '00000000-0000-0000-0003-000000000030';
UPDATE assignments SET due_date = '2026-07-27' WHERE id = '00000000-0000-0000-0003-000000000031';
UPDATE assignments SET due_date = '2026-08-04' WHERE id = '00000000-0000-0000-0003-000000000032';
-- COMS 101 (033–045)
UPDATE assignments SET due_date = '2026-05-28' WHERE id = '00000000-0000-0000-0003-000000000033';
UPDATE assignments SET due_date = '2026-06-02' WHERE id = '00000000-0000-0000-0003-000000000034';
UPDATE assignments SET due_date = '2026-06-02' WHERE id = '00000000-0000-0000-0003-000000000035';
UPDATE assignments SET due_date = '2026-06-09' WHERE id = '00000000-0000-0000-0003-000000000036';
UPDATE assignments SET due_date = '2026-06-13' WHERE id = '00000000-0000-0000-0003-000000000037';
UPDATE assignments SET due_date = '2026-06-16' WHERE id = '00000000-0000-0000-0003-000000000038';
UPDATE assignments SET due_date = '2026-06-20' WHERE id = '00000000-0000-0000-0003-000000000039';
UPDATE assignments SET due_date = '2026-06-23' WHERE id = '00000000-0000-0000-0003-000000000040';
UPDATE assignments SET due_date = '2026-06-27' WHERE id = '00000000-0000-0000-0003-000000000041';
UPDATE assignments SET due_date = '2026-07-07' WHERE id = '00000000-0000-0000-0003-000000000042';
UPDATE assignments SET due_date = '2026-07-14' WHERE id = '00000000-0000-0000-0003-000000000043';
UPDATE assignments SET due_date = '2026-07-21' WHERE id = '00000000-0000-0000-0003-000000000044';
UPDATE assignments SET due_date = '2026-08-07' WHERE id = '00000000-0000-0000-0003-000000000045';


-- ============= WEEK-FILL: added to ensure every week has a module =============

-- =============================================================================
-- BIO 111 — NEW MODULES (Weeks 2, 3, 4, 6, 7, 9, 10)
-- =============================================================================

INSERT INTO modules (id, course_id, title, description, "order", week_number) VALUES
  ('00000000-0000-0000-0002-000000000021', '00000000-0000-0000-0001-000000000002',
   'Photosynthesis and Cellular Respiration', 'Energy flow in cells: ATP synthesis, light-dependent and light-independent reactions in chloroplasts, glycolysis, Krebs cycle, and oxidative phosphorylation in mitochondria.', 2, 2),
  ('00000000-0000-0000-0002-000000000022', '00000000-0000-0000-0001-000000000002',
   'Cell Transport and Membrane Biology', 'Phospholipid bilayer structure, selective permeability, osmosis, diffusion, facilitated diffusion, and active transport across the plasma membrane.', 3, 3),
  ('00000000-0000-0000-0002-000000000023', '00000000-0000-0000-0001-000000000002',
   'Midterm Prep and Cell Division Intro', 'Review of Units 1–2 for Midterm 1. Introduction to the cell cycle, phases of mitosis, and checkpoints that regulate cell division.', 4, 4),
  ('00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0001-000000000002',
   'Meiosis and Genetic Variation', 'Meiosis I and II, crossing over, independent assortment, and how sexual reproduction generates genetic diversity in a population.', 6, 6),
  ('00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0001-000000000002',
   'Gene Expression', 'Transcription (DNA to mRNA), translation (mRNA to protein), the genetic code, types of mutations, and how errors in gene expression can affect protein structure and function.', 7, 7),
  ('00000000-0000-0000-0002-000000000026', '00000000-0000-0000-0001-000000000002',
   'Population Ecology', 'Population growth models (exponential and logistic), carrying capacity, limiting factors, density-dependent and density-independent controls, and life history strategies.', 9, 9),
  ('00000000-0000-0000-0002-000000000027', '00000000-0000-0000-0001-000000000002',
   'Community Ecology and Biomes', 'Species interactions (predation, competition, symbiosis), ecological succession, biome classification, and the abiotic factors that define terrestrial and aquatic biomes.', 10, 10)
ON CONFLICT (id) DO NOTHING;

-- ---------------- BIO 111 · Week 2: Photosynthesis and Cellular Respiration ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000046', '00000000-0000-0000-0002-000000000021', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 3 – Photosynthesis and Cellular Respiration',
   'Answer in complete sentences. (1) Compare and contrast photosynthesis and cellular respiration: where does each occur, what are the reactants and products, and how do they depend on each other? (2) Trace a carbon atom from CO₂ in the air through the Calvin cycle into a glucose molecule. What happens to that carbon if the glucose is later used in cellular respiration?',
   5),
  ('00000000-0000-0000-0003-000000000047', '00000000-0000-0000-0002-000000000021', '00000000-0000-0000-0001-000000000002',
   'Lab 3 Notebook – Photosynthesis Rate',
   'Write up your observations from the photosynthesis rate lab using the floating leaf disk assay. (1) Describe the trend you observed as light intensity increased, and explain why in terms of the light-dependent reactions. (2) What was your experimental control and what variable did you manipulate? (3) Identify one source of error and explain how it could have affected your results. 2+ paragraphs.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000046', '00000000-0000-0000-0003-000000000046',
   '[{"description": "Accurately compares photosynthesis and cellular respiration (location, reactants, products, interdependence)", "points": 3},
     {"description": "Correctly traces a carbon atom through the Calvin cycle and into cellular respiration", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000047', '00000000-0000-0000-0003-000000000047',
   '[{"description": "Describes observed trend and connects it to the light-dependent reactions", "points": 4},
     {"description": "Correctly identifies control and manipulated variable", "points": 3},
     {"description": "Identifies a plausible source of error with a specific explanation of its effect", "points": 3}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- BIO 111 · Week 3: Cell Transport and Membrane Biology ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000048', '00000000-0000-0000-0002-000000000022', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 4 – Cell Transport',
   'Answer in complete sentences. (1) Define osmosis and explain what happens to an animal cell placed in a hypotonic, isotonic, and hypertonic solution. Why does this matter for cells in living organisms? (2) What is the difference between passive transport and active transport? Give one specific example of each in the human body, and explain why active transport requires energy.',
   5),
  ('00000000-0000-0000-0003-000000000049', '00000000-0000-0000-0002-000000000022', '00000000-0000-0000-0001-000000000002',
   'Quiz 5 – Cell Transport and Membranes',
   'Online quiz covering phospholipid bilayer structure, osmosis, diffusion, facilitated diffusion, and active transport. Includes diagram interpretation questions. Timed, 15 points. Score recorded automatically.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000048', '00000000-0000-0000-0003-000000000048',
   '[{"description": "Correctly predicts and explains cell behavior in all three solution types", "points": 3},
     {"description": "Clearly distinguishes passive and active transport with accurate examples and energy explanation", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000049', '00000000-0000-0000-0003-000000000049',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 15}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- BIO 111 · Week 4: Midterm Prep and Cell Division Intro ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000050', '00000000-0000-0000-0002-000000000023', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 6 – Cell Cycle and Mitosis',
   'Answer in complete sentences. (1) Describe the phases of the cell cycle (G1, S, G2, M). What happens during each phase and why is interphase so critical? (2) What is a cell cycle checkpoint? Describe what is checked at the G1/S checkpoint and explain what happens if a cell fails the check.',
   5),
  ('00000000-0000-0000-0003-000000000051', '00000000-0000-0000-0002-000000000023', '00000000-0000-0000-0001-000000000002',
   'Midterm 1 Review',
   'Complete the optional review activity before Midterm 1. The review covers all Unit 1 topics: atomic structure, macromolecules, cell structure, transport, photosynthesis, and cellular respiration. This is ungraded — use it to identify gaps before the exam.',
   0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000050', '00000000-0000-0000-0003-000000000050',
   '[{"description": "Accurately describes each phase of the cell cycle with what occurs", "points": 3},
     {"description": "Correctly defines a checkpoint and explains G1/S consequences", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000051', '00000000-0000-0000-0003-000000000051',
   '[{"description": "Ungraded checkpoint (0 pts — completion recorded)", "points": 0}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- BIO 111 · Week 6: Meiosis and Genetic Variation ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000052', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 7 – Meiosis and Genetic Variation',
   'Answer in complete sentences. (1) Compare mitosis and meiosis: what is the purpose of each, how many divisions occur, and what is the ploidy of the resulting cells? (2) Explain how crossing over during prophase I and independent assortment during metaphase I each contribute to genetic variation. Why is this variation important for a population''s long-term survival?',
   5),
  ('00000000-0000-0000-0003-000000000053', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0001-000000000002',
   'Lab 4 Notebook – Meiosis Modeling',
   'Summarize your observations from the meiosis modeling activity. (1) Describe what happened to chromosome number and genetic composition at each major stage of meiosis I and II. (2) Explain one point during the activity where you had to make a choice that demonstrated independent assortment. (3) How did your model illustrate crossing over, and what was the genetic result? 2+ paragraphs.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000052', '00000000-0000-0000-0003-000000000052',
   '[{"description": "Accurately compares mitosis and meiosis (purpose, divisions, ploidy)", "points": 3},
     {"description": "Correctly explains how crossing over and independent assortment generate variation and why that matters", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000053', '00000000-0000-0000-0003-000000000053',
   '[{"description": "Describes chromosome number and genetic changes through both meiotic divisions", "points": 4},
     {"description": "Identifies a specific moment demonstrating independent assortment in the activity", "points": 3},
     {"description": "Explains how crossing over was modeled and describes the genetic result (2+ paragraphs)", "points": 3}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- BIO 111 · Week 7: Gene Expression ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000054', '00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 8 – Gene Expression',
   'Answer in complete sentences. (1) Describe the two main steps of gene expression (transcription and translation). Where does each occur in a eukaryotic cell and what molecules are involved? (2) Explain the difference between a missense mutation, a nonsense mutation, and a frameshift mutation. For each, describe the likely effect on the resulting protein.',
   5),
  ('00000000-0000-0000-0003-000000000055', '00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0001-000000000002',
   'Quiz 6 – Gene Expression and Mutations',
   'Online quiz on transcription, translation, the genetic code, and mutation types. Includes codon table interpretation questions. Timed, 25 points. Score recorded automatically.',
   25)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000054', '00000000-0000-0000-0003-000000000054',
   '[{"description": "Accurately describes transcription and translation with correct location and molecules for each", "points": 3},
     {"description": "Correctly defines all three mutation types with an accurate description of protein-level effects", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000055', '00000000-0000-0000-0003-000000000055',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 25}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- BIO 111 · Week 9: Population Ecology ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000056', '00000000-0000-0000-0002-000000000026', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 9 – Population Ecology',
   'Answer in complete sentences. (1) Compare exponential and logistic population growth: what does each model assume, what does the growth curve look like, and when does each model apply in nature? (2) Define carrying capacity and identify two density-dependent limiting factors and one density-independent limiting factor. Explain how each factor would affect a deer population.',
   5),
  ('00000000-0000-0000-0003-000000000057', '00000000-0000-0000-0002-000000000026', '00000000-0000-0000-0001-000000000002',
   'Lab 6 Notebook – Population Growth Simulation',
   'Write up your results from the population growth simulation. (1) Describe the shape of your growth curve and identify the phase where growth was fastest. (2) At what approximate population size did growth begin to slow, and what does this value represent? (3) Which limiting factors in the simulation had the greatest effect on the population, and why? 2+ paragraphs.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000056', '00000000-0000-0000-0003-000000000056',
   '[{"description": "Accurately compares exponential and logistic growth models (assumptions, curve shape, applicability)", "points": 3},
     {"description": "Correctly defines carrying capacity and identifies and explains density-dependent and density-independent factors with the deer example", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000057', '00000000-0000-0000-0003-000000000057',
   '[{"description": "Describes growth curve shape and correctly identifies the phase of fastest growth", "points": 3},
     {"description": "Correctly identifies the carrying capacity value and explains what it represents", "points": 4},
     {"description": "Identifies the most impactful limiting factors with a specific explanation (2+ paragraphs)", "points": 3}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- BIO 111 · Week 10: Community Ecology and Biomes ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000058', '00000000-0000-0000-0002-000000000027', '00000000-0000-0000-0001-000000000002',
   'Connect Homework 10 – Community Ecology',
   'Answer in complete sentences. (1) Define and give one specific example each of predation, competition, mutualism, commensalism, and parasitism. For each, indicate which species benefit, are harmed, or are unaffected. (2) Describe primary ecological succession starting from bare rock. Name at least two pioneer species types and explain how they change the environment for later species.',
   5),
  ('00000000-0000-0000-0003-000000000059', '00000000-0000-0000-0002-000000000027', '00000000-0000-0000-0001-000000000002',
   'Quiz 7 – Community Ecology and Biomes',
   'Online quiz on species interactions, ecological succession, biome classification, and the abiotic factors defining major terrestrial and aquatic biomes. Timed, 25 points. Score recorded automatically.',
   25)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000058', '00000000-0000-0000-0003-000000000058',
   '[{"description": "Provides accurate examples of all five interaction types with correct effect on each species", "points": 3},
     {"description": "Describes primary succession with at least two pioneer species types and explains facilitation", "points": 2}]'),
  ('00000000-0000-0000-0004-000000000059', '00000000-0000-0000-0003-000000000059',
   '[{"description": "Quiz performance (score recorded automatically)", "points": 25}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- =============================================================================
-- COMS 101 — MISSING ASSIGNMENTS (Weeks 5, 6, 7, 8, 9, 10)
-- =============================================================================

-- ---------------- COMS 101 · Week 5: Verbal Evaluation + Reflection 1 ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000060', '00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0001-000000000003',
   'Verbal Evaluation – Round 1',
   'During Round 1 speech days, you will deliver a 60–90 second verbal evaluation of a classmate''s speech immediately after they finish. Your evaluation must address at least two strengths and one specific area for improvement. Be constructive, be specific, and speak to the presenter — not about them. Score entered by instructor in class.',
   15),
  ('00000000-0000-0000-0003-000000000061', '00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0001-000000000003',
   'Reflection 1',
   'Write a short reflection after receiving feedback on your Round 1 speech. In 2–3 paragraphs: (1) Describe one piece of feedback (written or verbal) that surprised you and explain why. (2) Identify the one delivery skill you most want to improve before Round 2 and explain concretely what you will do differently. (3) Rate your overall confidence level on a scale of 1–10 and briefly explain your rating.',
   10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000060', '00000000-0000-0000-0003-000000000060',
   '[{"description": "Verbal evaluation delivered in class (score entered by instructor)", "points": 15}]'),
  ('00000000-0000-0000-0004-000000000061', '00000000-0000-0000-0003-000000000061',
   '[{"description": "Discusses a specific piece of feedback received and explains its significance", "points": 4},
     {"description": "Identifies one skill to improve with a concrete, actionable plan for Round 2", "points": 4},
     {"description": "Confidence rating is included with a genuine brief explanation (2–3 paragraphs total)", "points": 2}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 6: Research and Sources Exercise ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000062', '00000000-0000-0000-0002-000000000018', '00000000-0000-0000-0001-000000000003',
   'Research and Sources Exercise',
   'Find two credible sources you could use in your Round 2 informative speech. For each source: (1) write a full APA or MLA citation, (2) write one sentence summarizing the main point relevant to your speech, and (3) explain in one sentence why this source is credible (consider author credentials, publication type, and date). Then write one short paragraph explaining how you plan to integrate both sources into your speech without plagiarizing.',
   5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000062', '00000000-0000-0000-0003-000000000062',
   '[{"description": "Both sources have complete, correctly formatted citations", "points": 2},
     {"description": "Each source has an accurate summary sentence and a credibility explanation", "points": 2},
     {"description": "Integration paragraph shows awareness of how to use sources without plagiarizing", "points": 1}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 7: Specific Purpose & Central Idea – Round 2 ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000063', '00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000003',
   'Specific Purpose & Central Idea – Round 2',
   'Submit your Round 2 speech planning document before your informative speech. Include: (1) Specific purpose — one sentence with a measurable verb (explain, describe, compare). No conjunctions. (2) Central idea — one complete sentence summarizing your main argument or topic. (3) Preview of 2–4 main points. (4) A brief description of the visual aid you plan to use and how it will support your speech.',
   0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000063', '00000000-0000-0000-0003-000000000063',
   '[{"description": "Checkpoint completed (0 pts — planning document submitted before Round 2 speech)", "points": 0}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 8: Verbal Evaluation – Round 2 ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000064', '00000000-0000-0000-0002-000000000019', '00000000-0000-0000-0001-000000000003',
   'Verbal Evaluation – Round 2',
   'Deliver a 60–90 second verbal evaluation of a classmate''s Round 2 informative speech immediately after they finish. Your evaluation must address at least two specific strengths and one area for improvement, including at least one comment on their use of visual aids. Speak directly to the presenter in an encouraging and professional tone. Score entered by instructor in class.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000064', '00000000-0000-0000-0003-000000000064',
   '[{"description": "Verbal evaluation delivered in class (score entered by instructor)", "points": 15}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 9: Specific Purpose & Central Idea – Round 3 ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000065', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000003',
   'Specific Purpose & Central Idea – Round 3',
   'Submit your Round 3 speech planning document before your persuasive speech. Include: (1) Specific purpose — one sentence with a persuasive verb (persuade, convince, motivate). No conjunctions. (2) Central idea — one complete sentence stating your position or call to action. (3) Preview of 2–4 main points structured using Monroe''s Motivated Sequence or another persuasive pattern. (4) Identify the primary appeal you plan to use (logos, ethos, or pathos) and explain why it fits your audience and topic.',
   0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000065', '00000000-0000-0000-0003-000000000065',
   '[{"description": "Checkpoint completed (0 pts — planning document submitted before Round 3 speech)", "points": 0}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- ---------------- COMS 101 · Week 10: Verbal Evaluation – Round 3 ----------------

INSERT INTO assignments (id, module_id, course_id, title, instructions, points_possible) VALUES
  ('00000000-0000-0000-0003-000000000066', '00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0001-000000000003',
   'Verbal Evaluation – Round 3',
   'Deliver a 60–90 second verbal evaluation of a classmate''s Round 3 persuasive speech immediately after they finish. Your evaluation must comment on the effectiveness of their persuasive strategy, address at least one of the three rhetorical appeals (logos, ethos, pathos), and provide one specific, actionable suggestion. Speak directly to the presenter. Score entered by instructor in class.',
   15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rubrics (id, assignment_id, criteria) VALUES
  ('00000000-0000-0000-0004-000000000066', '00000000-0000-0000-0003-000000000066',
   '[{"description": "Verbal evaluation delivered in class (score entered by instructor)", "points": 15}]')
ON CONFLICT (assignment_id) DO NOTHING;

-- =============================================================================
-- DUE DATES — new assignments (046–066)
-- BIO 111 started Apr 28; weeks advance by 7 days.
--   Week 2 = ~May 7,  Week 3 = ~May 14, Week 4 = ~May 21
--   Week 6 = ~Jun  4, Week 7 = ~Jun 11, Week 9 = ~Jun 25, Week 10 = ~Jul 2
-- COMS 101 same start; due dates mirror BIO cadence for matching weeks.
-- =============================================================================

-- BIO 111 new assignments (046–059)
UPDATE assignments SET due_date = '2026-05-10' WHERE id = '00000000-0000-0000-0003-000000000046';
UPDATE assignments SET due_date = '2026-05-10' WHERE id = '00000000-0000-0000-0003-000000000047';
UPDATE assignments SET due_date = '2026-05-17' WHERE id = '00000000-0000-0000-0003-000000000048';
UPDATE assignments SET due_date = '2026-05-17' WHERE id = '00000000-0000-0000-0003-000000000049';
UPDATE assignments SET due_date = '2026-05-24' WHERE id = '00000000-0000-0000-0003-000000000050';
UPDATE assignments SET due_date = '2026-05-24' WHERE id = '00000000-0000-0000-0003-000000000051';
UPDATE assignments SET due_date = '2026-06-07' WHERE id = '00000000-0000-0000-0003-000000000052';
UPDATE assignments SET due_date = '2026-06-07' WHERE id = '00000000-0000-0000-0003-000000000053';
UPDATE assignments SET due_date = '2026-06-14' WHERE id = '00000000-0000-0000-0003-000000000054';
UPDATE assignments SET due_date = '2026-06-14' WHERE id = '00000000-0000-0000-0003-000000000055';
UPDATE assignments SET due_date = '2026-06-28' WHERE id = '00000000-0000-0000-0003-000000000056';
UPDATE assignments SET due_date = '2026-06-28' WHERE id = '00000000-0000-0000-0003-000000000057';
UPDATE assignments SET due_date = '2026-07-05' WHERE id = '00000000-0000-0000-0003-000000000058';
UPDATE assignments SET due_date = '2026-07-05' WHERE id = '00000000-0000-0000-0003-000000000059';
-- COMS 101 new assignments (060–066)
UPDATE assignments SET due_date = '2026-06-19' WHERE id = '00000000-0000-0000-0003-000000000060';
UPDATE assignments SET due_date = '2026-06-22' WHERE id = '00000000-0000-0000-0003-000000000061';
UPDATE assignments SET due_date = '2026-06-26' WHERE id = '00000000-0000-0000-0003-000000000062';
UPDATE assignments SET due_date = '2026-06-30' WHERE id = '00000000-0000-0000-0003-000000000063';
UPDATE assignments SET due_date = '2026-07-03' WHERE id = '00000000-0000-0000-0003-000000000064';
UPDATE assignments SET due_date = '2026-07-14' WHERE id = '00000000-0000-0000-0003-000000000065';
UPDATE assignments SET due_date = '2026-07-21' WHERE id = '00000000-0000-0000-0003-000000000066';

-- =============================================================================
-- FIX: sync submission status for approved grades
-- Grade inserts above set approved_at but don't update submissions.status.
-- These UPDATEs bring the two tables into agreement.
-- Submission IDs with FINAL grades:
--   A015 BIO Connect HW1 : 001–006
--   A033 COMS Intro       : 015–020
--   A035 COMS Quiz 1      : 029–034
-- =============================================================================
UPDATE submissions SET status = 'graded' WHERE id IN (
  '00000000-0000-0000-0006-000000000001',
  '00000000-0000-0000-0006-000000000002',
  '00000000-0000-0000-0006-000000000003',
  '00000000-0000-0000-0006-000000000004',
  '00000000-0000-0000-0006-000000000005',
  '00000000-0000-0000-0006-000000000006',
  '00000000-0000-0000-0006-000000000015',
  '00000000-0000-0000-0006-000000000016',
  '00000000-0000-0000-0006-000000000017',
  '00000000-0000-0000-0006-000000000018',
  '00000000-0000-0000-0006-000000000019',
  '00000000-0000-0000-0006-000000000020',
  '00000000-0000-0000-0006-000000000029',
  '00000000-0000-0000-0006-000000000030',
  '00000000-0000-0000-0006-000000000031',
  '00000000-0000-0000-0006-000000000032',
  '00000000-0000-0000-0006-000000000033',
  '00000000-0000-0000-0006-000000000034'
);


-- =============================================================================
-- FILL-IN: Ensure every student has at least 1 submitted assignment per course
-- Diego Flores (014) and Hannah Okafor (015) — upgrade drafts to submitted
-- Liam Patel (016) — insert new submitted rows (was fully blank)
-- =============================================================================

-- Diego Flores: BIO A015 Connect HW1 (sub 013) — draft → submitted
UPDATE submissions
SET body        = 'The scientific method involves making an observation, forming a testable hypothesis, designing a controlled experiment, collecting data, and drawing conclusions. An example would be testing how the amount of water affects plant growth — one group of plants gets the normal amount, another gets twice as much, and all other conditions are kept the same.

Prokaryotic cells do not have a nucleus. Examples include bacteria and archaea. Eukaryotic cells have a true nucleus and membrane-bound organelles. Animal cells and plant cells are both eukaryotic. The main differences between them are that plant cells have a cell wall and chloroplasts, which animal cells do not.',
    status      = 'submitted',
    submitted_at = NOW() - INTERVAL '12 hours'
WHERE id = '00000000-0000-0000-0006-000000000013';

-- Diego Flores: COMS A033 Introduction (sub 027) — draft → submitted
UPDATE submissions
SET body        = 'My name is Diego Flores and I am a Computer Engineering major. My biggest communication challenge is speaking up in group settings — I tend to hold back my ideas even when I think they are good. I want to work on building enough confidence to contribute more in class discussions and in team environments.',
    status      = 'submitted',
    submitted_at = NOW() - INTERVAL '10 hours'
WHERE id = '00000000-0000-0000-0006-000000000027';

-- Hannah Okafor: BIO A015 Connect HW1 (sub 014) — draft → submitted
UPDATE submissions
SET body        = 'The scientific method is a process scientists use to investigate questions about the world. You start with an observation, form a hypothesis, run a controlled experiment where you change only one variable, collect data, and decide if the hypothesis was supported or needs revision.

Prokaryotic cells are simple cells that lack a nucleus. Bacteria and archaea are the two types of prokaryotes. Eukaryotic cells are more complex and contain a true nucleus as well as other organelles. Both animal cells and plant cells are eukaryotic. Plant cells differ from animal cells because they have a cell wall and chloroplasts.',
    status      = 'submitted',
    submitted_at = NOW() - INTERVAL '6 hours'
WHERE id = '00000000-0000-0000-0006-000000000014';

-- Hannah Okafor: COMS A033 Introduction (sub 028) — draft → submitted
UPDATE submissions
SET body        = 'My name is Hannah Okafor and I am majoring in Biochemistry. A communication challenge I want to work on this quarter is sounding more confident when I speak — I often second-guess myself mid-sentence and it comes through in my delivery. I hope this class gives me concrete tools for preparing and presenting ideas clearly and calmly.',
    status      = 'submitted',
    submitted_at = NOW() - INTERVAL '4 hours'
WHERE id = '00000000-0000-0000-0006-000000000028';

-- Liam Patel: BIO A015 Connect HW1 — new submitted row (sub 043)
INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES
  ('00000000-0000-0000-0006-000000000043',
   '00000000-0000-0000-0003-000000000015',
   '00000000-0000-0000-0000-000000000016',
   'The scientific method is a process for answering questions. You observe something, form a hypothesis, test it with an experiment, and analyze the results to see if your hypothesis was correct.

Prokaryotic cells do not have a nucleus. Bacteria and archaea are prokaryotes. Eukaryotic cells have a nucleus. Animal cells and plant cells are both eukaryotic. Plant cells also have a cell wall and chloroplasts.',
   NOW() - INTERVAL '2 hours', 'submitted')
ON CONFLICT (assignment_id, student_id) DO NOTHING;

-- Liam Patel: COMS A033 Introduction — new submitted row (sub 044)
INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES
  ('00000000-0000-0000-0006-000000000044',
   '00000000-0000-0000-0003-000000000033',
   '00000000-0000-0000-0000-000000000016',
   'Hi, I am Liam Patel and I am a Business Administration major. A communication challenge I want to work on is getting less nervous before I speak so I can stay focused and say what I actually mean.',
   NOW() - INTERVAL '1 hour', 'submitted')
ON CONFLICT (assignment_id, student_id) DO NOTHING;
