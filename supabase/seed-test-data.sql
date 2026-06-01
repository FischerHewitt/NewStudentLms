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

INSERT INTO courses (id, title, teacher_id, raw_syllabus, generation_preview) VALUES
  (
    '00000000-0000-0000-0001-000000000002',
    'BIO 111 – General Biology',
    '00000000-0000-0000-0000-000000000001',
    'BIO 111 – General Biology. Instructor: Dr. Fischer Hewitt. Three units: Chemistry/Cells/Energy, Genetics/Heredity, Evolution/Ecology. Connect homework, lab notebooks, quizzes, two midterms, final.',
    NULL
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    'COMS 101 – Public Speaking',
    '00000000-0000-0000-0000-000000000001',
    'COMS 101 – Public Speaking. Instructor: Dr. Fischer Hewitt. Three speech rounds. Quizzes, written and verbal evaluations, reflections, delivery analysis.',
    NULL
  )
ON CONFLICT (id) DO NOTHING;


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
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SUBMISSIONS
-- Only for the 3 AI-gradeable text assignments:
--   A030 = BIO 111 Course Reflection        (10 pts)  — subs 001–012
--   A038 = COMS 101 Written Evaluation Round 1 (15 pts) — subs 013–024
--   A040 = COMS 101 Analyzing Delivery Style   (30 pts) — subs 025–036
--
-- State distribution per assignment (same students each time):
--   final        (4): 002 Alex Rivera, 003 Jordan Lee, 004 Maya Patel, 005 Tyler Brooks
--   ai_suggested (3): 006 Sam Nguyen, 007 Priya Sharma, 008 Marcus Johnson
--   pending      (3): 009 Sofia Reyes, 010 Ethan Kim, 011 Aaliyah Washington
--   draft        (2): 012 Connor Murphy, 013 Zoe Chen
--   blank        (3): 014 Diego Flores, 015 Hannah Okafor, 016 Liam Patel — no row
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- A030: BIO 111 Course Reflection  (submissions 001–012)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 001 · Alex Rivera · FINAL
  ('00000000-0000-0000-0006-000000000001',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000002',
   'The concept from Unit 1 that surprised me most was how enzymes work. Before this class I thought of enzymes as chemicals that just speed things up, but learning about the active site and how temperature and pH can denature an enzyme made me realize how fragile and precise cellular processes really are. It completely changed the way I think about why we get sick when we have a high fever — our enzymes are literally losing their shape and stopping work.

From Unit 2, Mendelian genetics genuinely fascinated me even though I had heard of it before. What I did not realize is how much the same basic principles apply to inheritance of disease risk. When we worked through pedigree problems it became clear that patterns of inheritance are actually useful tools for real medical decision-making, not just textbook exercises. I found myself thinking about my own family history in a completely different way.

The concept from Unit 3 that felt most relevant to my life was Hardy-Weinberg equilibrium. I had always thought evolution was something that happened over millions of years and was invisible on any human timescale. Learning that we can actually measure whether a population is evolving right now using allele frequencies made the whole idea feel concrete and measurable rather than abstract. The idea that a population in Hardy-Weinberg equilibrium is not evolving — and that real populations almost never meet all five conditions — was genuinely surprising to me.',
   NOW() - INTERVAL '5 days', 'graded'),

  -- 002 · Jordan Lee · FINAL
  ('00000000-0000-0000-0006-000000000002',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000003',
   'From Unit 1, cellular respiration was the most interesting concept to me. I never thought about how our bodies convert food into usable energy at a chemical level. Learning about ATP synthesis and the electron transport chain made me appreciate the complexity of what happens every time I eat something. The fact that glucose goes through glycolysis, the Krebs cycle, and oxidative phosphorylation before producing usable energy was genuinely mind-blowing.

In Unit 2, DNA replication stood out to me. The idea that your body copies approximately three billion base pairs every time a cell divides — and mostly gets it right — is incredible. It made me think about how cancer can result from even small errors in that process. The concept of proofreading enzymes that catch and fix mistakes during replication was something I had never considered before.

From Unit 3, natural selection felt most relevant to my everyday life. I have always heard the phrase "survival of the fittest" but I did not understand that fitness in biology specifically means reproductive success, not physical strength or intelligence. That distinction completely changed how I interpreted the concept. I also found the examples of antibiotic resistance in bacteria compelling because it shows evolution happening on a timescale we can actually observe.',
   NOW() - INTERVAL '4 days', 'graded'),

  -- 003 · Maya Patel · FINAL
  ('00000000-0000-0000-0006-000000000003',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000004',
   'The concept from Unit 1 that surprised me most was the fluid mosaic model of the cell membrane. I expected the membrane to be a simple barrier, but learning that it is a dynamic structure with proteins that move, channels that open and close, and a phospholipid bilayer that is selectively permeable changed my understanding entirely. The way cells regulate what enters and exits through active and passive transport felt almost like a sophisticated security system.

From Unit 2, the concept of gene expression — specifically how the same DNA can produce different proteins in different cell types — was the most relevant to my life. I have always wondered how a liver cell and a neuron can have the same DNA but look and function so differently. Learning about transcription factors and how they regulate which genes get expressed answered a question I had never even known to ask.

In Unit 3, the concept of coevolution stood out to me. The example of flowering plants and their pollinators evolving together over millions of years made me see the natural world as deeply interconnected in ways I had not appreciated before. I think about this now when I see bees in my garden — there is an evolutionary history behind every interaction I observe.',
   NOW() - INTERVAL '4 days', 'graded'),

  -- 004 · Tyler Brooks · FINAL
  ('00000000-0000-0000-0006-000000000004',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000005',
   'Unit 1 gave me a new appreciation for photosynthesis. I knew plants used sunlight to make food, but I had no idea about the light-dependent and light-independent reactions, or that the Calvin cycle is essentially a carbon-fixing machine running inside the chloroplast. What surprised me most was learning that the oxygen we breathe is a byproduct of splitting water molecules during the light reactions — it felt like a fact that should be more widely known.

From Unit 2, meiosis and genetic recombination were the most relevant concepts to me personally. I have a sibling and we look very different from each other despite having the same parents. Understanding crossing over and independent assortment during meiosis finally explained why siblings can be so genetically distinct. It also made me think about genetic diversity in a population as something that is actively generated, not just random.

In Unit 3, the concept of ecological succession was the most surprising. I did not know that ecosystems follow predictable patterns of change over time, from pioneer species to climax communities. Learning about primary and secondary succession made me think about the empty lot near my house differently — it is not just an abandoned space, it is an ecosystem in an early stage of succession.',
   NOW() - INTERVAL '3 days', 'graded')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 005 · Sam Nguyen · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000005',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000006',
   'From Unit 1, I found the section on macromolecules most interesting. Learning about how proteins are made from amino acids and how the sequence determines the shape and function was something I had not thought about before. It made me realize how much of what our bodies do depends on proteins working correctly.

In Unit 2, the genetics unit was challenging but I found Punnett squares satisfying once I understood how to use them. The idea that you can predict the probability of traits in offspring using simple ratios was surprising to me. I also found the section on sex-linked traits interesting because it explained patterns I had noticed in my own family.

From Unit 3, the ecology section was my favorite part of the course. I liked learning about food webs and how energy flows through an ecosystem. The concept of trophic levels made me think about the environmental impact of different diets, which is something I care about.',
   NOW() - INTERVAL '4 days', 'submitted'),

  -- 006 · Priya Sharma · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000006',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000007',
   'Biology has been a challenging but rewarding course this quarter. From Unit 1, the concept that stood out to me was osmosis and how water moves across cell membranes. I had heard the word before but did not understand the mechanism. Learning that water moves from areas of low solute concentration to high solute concentration through a semipermeable membrane helped me understand things like why plants wilt when they are not watered.

From Unit 2, I found the section on mutations and their effects on proteins most relevant. The idea that a single base change in DNA can cause a disease like sickle cell anemia made the connection between molecular biology and human health very concrete for me.

In Unit 3, the concept of natural selection was the most surprising. I understood the basic idea before this class, but learning about the specific mechanisms — variation, heritability, differential reproduction — made it feel much more rigorous and scientific than I had previously thought.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 007 · Marcus Johnson · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000007',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000008',
   'This course covered a lot of material and I found different parts interesting for different reasons. In Unit 1, the most relevant concept to my life was cellular respiration. I play sports and I had always wondered why I get tired during exercise. Learning about how muscles switch from aerobic to anaerobic respiration when oxygen runs low, and how lactic acid builds up as a result, directly explained something I experience regularly.

From Unit 2, the concept of epigenetics came up briefly in lecture and I found it fascinating. The idea that gene expression can be influenced by environmental factors without changing the DNA sequence itself was something I had never encountered before. It made me think about how lifestyle choices might affect not just my own health but potentially future generations.

In Unit 3, I found the section on invasive species and their ecological impact most relevant. There are several invasive species in my region and understanding why they are so disruptive — because they lack natural predators and can outcompete native species — gave me a much better framework for thinking about conservation.',
   NOW() - INTERVAL '3 days', 'submitted')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 008 · Sofia Reyes · PENDING
  ('00000000-0000-0000-0006-000000000008',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000009',
   'Biology was interesting this quarter. From Unit 1 I liked learning about cell structure and how organelles work together. From Unit 2, genetics was confusing at first but Punnett squares made sense once I practiced them. From Unit 3 I liked the ecology section because I like animals and thinking about how populations interact.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 009 · Ethan Kim · PENDING
  ('00000000-0000-0000-0006-000000000009',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000010',
   'Unit 1 was about cells and chemistry which was hard. I liked the lab where we used the microscope. Unit 2 was genetics and I thought the DNA stuff was interesting. Unit 3 was evolution and ecology. I liked learning about food chains.',
   NOW() - INTERVAL '1 day', 'submitted'),

  -- 010 · Aaliyah Washington · PENDING
  ('00000000-0000-0000-0006-000000000010',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000011',
   'From Unit 1 the most surprising concept was how enzymes work and how they can be denatured. From Unit 2 I found DNA replication interesting. From Unit 3 natural selection was the most relevant concept to my life because I see examples of it in nature around me.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 011 · Connor Murphy · DRAFT
  ('00000000-0000-0000-0006-000000000011',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000012',
   'Unit 1 was about chemistry and cells. I think the most interesting thing was',
   NULL, 'draft'),

  -- 012 · Zoe Chen · DRAFT
  ('00000000-0000-0000-0006-000000000012',
   '00000000-0000-0000-0003-000000000030',
   '00000000-0000-0000-0000-000000000013',
   'The concept that surprised me most from this course was in Unit 2 when we learned about',
   NULL, 'draft')

  -- 013 Diego Flores, 014 Hannah Okafor, 015 Liam Patel: BLANK — no row

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A038: COMS 101 Written Evaluation – Round 1  (submissions 013–024)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 013 · Alex Rivera · FINAL
  ('00000000-0000-0000-0006-000000000013',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000002',
   'The speaker I evaluated in Round 1 showed strong content knowledge and clear organization, but had room to grow in delivery and audience engagement. Here is my evaluation across all five criteria.

Organization: The speech had a clear three-part structure with a strong introduction that grabbed attention with a personal story about growing up in two different cities. The transitions between main points were smooth — the speaker used signpost phrases like "moving on to my second point" which made it easy to follow. The conclusion summarized the main points clearly, though it ended a bit abruptly without a memorable closing line or callback to the opening story.

Delivery: The speaker''s pace was generally good but sped up noticeably during the second main point, which made some sentences hard to follow. There were several filler words ("um", "like", "you know") in the middle section, though the speaker recovered well by the conclusion and finished with good energy and confidence.

Eye Contact: Eye contact was inconsistent. The speaker looked at their notes frequently in the first minute but improved significantly by the second half of the speech. One strength was making deliberate eye contact with different sections of the room rather than just one side — this showed awareness of the full audience.

Vocal Variety: The speaker used good volume and spoke clearly, but pitch stayed relatively flat throughout. More variation in tone when emphasizing key points would increase engagement. The one moment of strong vocal variety was when the speaker described a childhood memory — the change in tone there was effective and natural.

Content: The speech was well-researched and the main points were relevant and specific. The speaker used a credible source for the second point which added weight to the argument. One suggestion: the third main point felt rushed compared to the first two and would benefit from one more supporting detail or example.',
   NOW() - INTERVAL '7 days', 'graded'),

  -- 014 · Jordan Lee · FINAL
  ('00000000-0000-0000-0006-000000000014',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000003',
   'I evaluated my classmate''s Round 1 introductory speech and found it to be a strong first effort with clear areas for growth. Here is my assessment of each criterion.

Organization: The speech was well-organized with a clear introduction, body, and conclusion. The speaker opened with a rhetorical question — "Have you ever felt like you belonged in two places at once?" — which immediately drew the audience in. The three main points were clearly previewed in the introduction and each was addressed in order. The conclusion was effective but could have been stronger with a more memorable final line.

Delivery: The speaker''s delivery was confident for a first speech. They stood still and avoided nervous movement, which projected composure. The pace was slightly fast in the middle section, particularly when describing their family background, but slowed appropriately for the conclusion.

Eye Contact: Eye contact was one of the speaker''s strongest areas. They made consistent contact with multiple sections of the audience and rarely looked at their notes after the first thirty seconds. This made the speech feel conversational rather than read.

Vocal Variety: Vocal variety was adequate but could be improved. The speaker''s volume was appropriate throughout, but the pitch and rate stayed fairly consistent. Adding more emphasis on key words — particularly in the main points — would make the speech more dynamic.

Content: The content was personal and engaging. The speaker shared specific details about their background that made the speech memorable. One area for improvement: the second main point relied on a general claim without a specific example or source to back it up. Adding one concrete detail there would strengthen the argument considerably.',
   NOW() - INTERVAL '6 days', 'graded'),

  -- 015 · Maya Patel · FINAL
  ('00000000-0000-0000-0006-000000000015',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000004',
   'My evaluation of the Round 1 speech covers all five required areas. Overall the speaker demonstrated solid preparation and a genuine connection to their topic, which made the speech engaging to listen to.

Organization: The speech followed a clear structure. The introduction used a startling statistic to open, which was an effective attention-getter. The body had three distinct main points, each introduced with a clear transition. The conclusion restated the main points and ended with a call to action, which gave the speech a sense of purpose beyond just sharing information.

Delivery: Delivery was the area with the most room for growth. The speaker held their note cards throughout the speech and referenced them frequently, which interrupted the flow. When they were not looking at their notes, their delivery was natural and confident. I would encourage them to practice enough that the cards become a safety net rather than a script.

Eye Contact: Related to the delivery issue, eye contact suffered because of the note card reliance. The speaker made good eye contact during the introduction and conclusion but looked down frequently during the body. The moments of direct eye contact were effective — the audience visibly responded when the speaker looked at them directly.

Vocal Variety: The speaker used good vocal variety in the introduction, varying their pace and pitch to build interest. This energy faded somewhat in the middle of the speech but returned for the conclusion. Maintaining that variety throughout would significantly improve the overall impact.

Content: The content was well-chosen and specific. The speaker clearly knew their topic and included details that showed genuine research. One suggestion: the third main point introduced a new idea that was not previewed in the introduction, which felt slightly disconnected from the rest of the speech.',
   NOW() - INTERVAL '6 days', 'graded'),

  -- 016 · Tyler Brooks · FINAL
  ('00000000-0000-0000-0006-000000000016',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000005',
   'This evaluation covers the five required criteria for the Round 1 introductory speech. The speaker I observed showed genuine enthusiasm for their topic and a willingness to engage with the audience, which are strong foundations to build on.

Organization: The speech was clearly organized. The introduction opened with a personal anecdote that established the speaker''s credibility and connection to the topic. The body had two main points rather than the recommended three, which made the speech feel slightly thin. The conclusion was strong — the speaker circled back to the opening story, which gave the speech a satisfying sense of closure.

Delivery: The speaker''s delivery was energetic and natural. They moved purposefully during the speech, using the space effectively rather than staying frozen behind the podium. The pace was well-controlled throughout, with appropriate pauses before key points. The only delivery issue was a tendency to trail off at the end of sentences, which made some points harder to hear.

Eye Contact: Eye contact was excellent. The speaker made consistent, deliberate contact with different parts of the room and held eye contact long enough to feel genuine rather than scanning. This was the strongest aspect of the speech and made the whole presentation feel like a conversation.

Vocal Variety: Vocal variety was good overall. The speaker used changes in pace and volume effectively, slowing down for emphasis and speeding up to convey excitement. One area to work on: the pitch stayed in a fairly narrow range. Experimenting with higher and lower tones would add another dimension to the delivery.

Content: The content was engaging and personal. The speaker shared specific stories that made the speech memorable. The main weakness was the lack of a third main point — the speech felt like it ended before fully developing the topic. Adding one more supporting point would make the argument more complete.',
   NOW() - INTERVAL '5 days', 'graded')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 017 · Sam Nguyen · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000017',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000006',
   'I evaluated my classmate''s Round 1 speech and thought they did a really good job overall. Their organization was clear and they had a strong introduction that got my attention right away. Their delivery was confident and they did not seem nervous at all, which was impressive for a first speech.

For eye contact, they looked at the audience most of the time which was great to see. Their vocal variety was good too — they sped up when they were excited about their topic which added energy to the speech. I noticed they slowed down for the conclusion which was effective.

The content was interesting and relevant to the audience. I learned something new from their speech which I think is the goal of an informative presentation. One thing I would suggest is to make the conclusion a little stronger with a callback to the opening. The introduction was memorable but the ending did not quite match it in impact.

Overall this was a solid first effort and I think they will continue to improve as the quarter goes on. The strongest areas were eye contact and delivery confidence.',
   NOW() - INTERVAL '6 days', 'submitted'),

  -- 018 · Priya Sharma · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000018',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000007',
   'The speaker I evaluated gave a solid Round 1 speech with some clear strengths and a few areas to work on. Here is my feedback on each of the five areas.

Organization was good. The speech had a clear beginning, middle, and end. The introduction was engaging and the main points were easy to follow. The conclusion summarized the speech well.

Delivery was confident. The speaker did not seem nervous and spoke at a good pace. There were a few filler words but not enough to be distracting.

Eye contact was decent. The speaker looked at the audience regularly but tended to focus on one side of the room. Making eye contact with the whole audience would improve this.

Vocal variety was present but could be stronger. The speaker used some changes in volume but the pitch stayed mostly the same throughout. More variation would make the speech more engaging.

Content was appropriate and well-chosen. The speaker clearly knew their topic. I would suggest adding one more specific example to the second main point to make it more convincing.',
   NOW() - INTERVAL '5 days', 'submitted'),

  -- 019 · Marcus Johnson · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000019',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000008',
   'My evaluation of the Round 1 speech focuses on the five required areas. The speaker showed good preparation and a clear connection to their topic.

Organization: The speech was well-structured with a clear introduction and conclusion. The body had three main points that were easy to follow. Transitions were present but could be smoother — a few times the speaker just moved to the next point without a clear signal.

Delivery: The speaker''s delivery was natural and conversational. They spoke at a comfortable pace and used appropriate pauses. One area to improve is avoiding the tendency to look at the floor when thinking — it breaks the connection with the audience.

Eye contact: Eye contact was inconsistent. Strong in the introduction, weaker in the body, and recovered for the conclusion. The speaker should practice enough to maintain eye contact throughout.

Vocal variety: The speaker used good volume but limited pitch variation. The speech would benefit from more dynamic changes in tone, especially when emphasizing key points.

Content: The content was relevant and specific. The speaker used a personal story effectively in the introduction. The third main point was the weakest — it felt less developed than the first two and could use more supporting detail.',
   NOW() - INTERVAL '5 days', 'submitted')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 020 · Sofia Reyes · PENDING
  ('00000000-0000-0000-0006-000000000020',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000009',
   'The speech I evaluated was good. The organization was clear and easy to follow. The delivery was confident. Eye contact was okay. The vocal variety could be better. The content was interesting and relevant.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 021 · Ethan Kim · PENDING
  ('00000000-0000-0000-0006-000000000021',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000010',
   'I thought the speech was well done. The speaker was organized and had good eye contact. Their delivery was natural. The content was interesting. I would suggest working on vocal variety.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 022 · Aaliyah Washington · PENDING
  ('00000000-0000-0000-0006-000000000022',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000011',
   'The speaker did a good job with organization and had a clear structure. Their eye contact was strong and they seemed comfortable in front of the audience. Delivery was good overall. Content was relevant. Vocal variety could be improved with more changes in pitch and pace.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 023 · Connor Murphy · DRAFT
  ('00000000-0000-0000-0006-000000000023',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000012',
   'The speech I evaluated had good organization. The introduction was strong with a personal story. The delivery was',
   NULL, 'draft'),

  -- 024 · Zoe Chen · DRAFT
  ('00000000-0000-0000-0006-000000000024',
   '00000000-0000-0000-0003-000000000038',
   '00000000-0000-0000-0000-000000000013',
   'Organization: clear structure with intro body conclusion. Delivery: confident. Eye contact:',
   NULL, 'draft')

  -- 014 Diego Flores, 015 Hannah Okafor, 016 Liam Patel: BLANK — no row

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A040: COMS 101 Analyzing Delivery Style  (submissions 025–036)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 025 · Alex Rivera · FINAL
  ('00000000-0000-0000-0006-000000000025',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000002',
   'The assigned speech video featured a speaker delivering a ten-minute informative presentation on climate change. I analyzed the delivery using three course concepts: eye contact, vocal variety, and pacing.

Eye Contact: The speaker demonstrated strong eye contact throughout the speech. Rather than scanning the room mechanically, they held eye contact with individual audience members for two to three seconds at a time before moving on — a technique we discussed in class as creating genuine connection rather than the appearance of it. This was particularly effective during the opening two minutes when the speaker was establishing credibility. The one weakness was a tendency to look down at notes during transitions between main points, which briefly broke the connection. I would coach this speaker to internalize their transitions so they can maintain eye contact even when moving between sections.

Vocal Variety: The speaker used vocal variety effectively in several moments. When describing the projected consequences of inaction, they slowed their pace and lowered their volume, which created a sense of gravity that matched the content. During the call to action at the end, they increased both pace and volume, which built energy and urgency. However, the middle section of the speech — covering the scientific evidence — was delivered in a relatively flat, monotone style that made it harder to stay engaged. I would coach the speaker to identify two or three key statistics in that section and use pitch changes to signal their importance.

Pacing: The overall pacing was well-controlled. The speaker used pauses deliberately — particularly after asking rhetorical questions — which gave the audience time to process the content. One area for improvement: the speaker rushed through the explanation of carbon feedback loops, which was the most technically complex part of the speech. Slowing down for complex content and speeding up for simpler transitions is a technique we covered in Week 2 that would serve this speaker well.',
   NOW() - INTERVAL '8 days', 'graded'),

  -- 026 · Jordan Lee · FINAL
  ('00000000-0000-0000-0006-000000000026',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000003',
   'For this assignment I analyzed the delivery of the assigned speech video using three concepts from course material: gestures, structure, and vocal variety.

Gestures: The speaker used gestures frequently and naturally throughout the speech. Their hand movements generally reinforced the verbal content — for example, when describing a timeline, they moved their hand from left to right, which visually anchored the concept for the audience. We discussed in class that effective gestures should be purposeful and match the content, and this speaker largely achieved that. The one area for improvement was a tendency to use the same gesture — a pointing motion — repeatedly, which started to feel repetitive by the middle of the speech. I would coach them to expand their gestural vocabulary and vary the types of movements they use.

Structure: The speech was clearly structured with a preview in the introduction and a summary in the conclusion. The three main points were distinct and well-organized. However, the transitions between points were weak — the speaker often just paused briefly and moved on without a verbal signal. Using explicit transition phrases like "now that we have covered X, let''s turn to Y" would make the structure more apparent to the audience and easier to follow.

Vocal Variety: The speaker''s vocal variety was the strongest aspect of their delivery. They used changes in pitch, pace, and volume strategically throughout the speech. The most effective moment was when they told a personal story — their voice became quieter and more intimate, which drew the audience in. I would encourage them to use that same technique more deliberately in other parts of the speech where they want to create emotional connection.',
   NOW() - INTERVAL '7 days', 'graded'),

  -- 027 · Maya Patel · FINAL
  ('00000000-0000-0000-0006-000000000027',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000004',
   'My analysis of the assigned speech video focuses on three delivery concepts: eye contact, pacing, and use of space.

Eye Contact: The speaker''s eye contact was inconsistent. During the introduction and conclusion, they maintained strong eye contact with the audience, which created a sense of confidence and connection. During the body of the speech, however, they frequently looked at the screen behind them when referencing their slides. While some glancing at visual aids is expected, the speaker often turned their back to the audience for several seconds at a time, which broke the connection entirely. I would coach this speaker to practice with their slides enough that they can reference them with a brief glance rather than a full turn, keeping their body oriented toward the audience.

Pacing: The pacing was generally appropriate but had one significant issue: the speaker did not use pauses effectively. After making important points, they immediately moved on without giving the audience time to absorb the information. We discussed in class that strategic pauses after key claims signal their importance and give the audience processing time. I would coach this speaker to identify their three most important points and practice pausing for a full two seconds after each one.

Use of Space: The speaker used the stage space effectively. They moved purposefully between sections of the stage, which helped maintain audience attention and signaled transitions between main points. This is a technique we covered in the delivery unit — using physical movement to reinforce structure. The speaker executed this well and it was one of the most polished aspects of their presentation.',
   NOW() - INTERVAL '7 days', 'graded'),

  -- 028 · Tyler Brooks · FINAL
  ('00000000-0000-0000-0006-000000000028',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000005',
   'I analyzed the assigned speech video using three course concepts: vocal variety, eye contact, and managing anxiety.

Vocal Variety: The speaker demonstrated strong vocal variety throughout the speech. They used changes in pace, pitch, and volume to maintain audience engagement and signal the relative importance of different points. The most effective use of vocal variety was during the narrative section of the speech, where the speaker slowed their pace and lowered their volume to create intimacy. This matched the content perfectly and drew the audience in. One area for improvement: the speaker''s volume dropped at the end of sentences, which made some points harder to hear. I would coach them to maintain consistent volume through the end of each sentence.

Eye Contact: Eye contact was strong overall. The speaker made deliberate contact with different sections of the audience and held it long enough to feel genuine. The one weakness was during the question-and-answer section at the end, where the speaker looked at the floor while thinking before responding. Maintaining eye contact while formulating a response — even if it means a brief pause — projects more confidence and keeps the audience engaged.

Managing Anxiety: The speaker showed visible signs of anxiety in the first two minutes — slightly faster pace, occasional voice tremor, and fidgeting with their notes. However, they settled into the speech by the third minute and the anxiety became much less apparent. This is a pattern we discussed in class: anxiety is often highest at the start and decreases as the speaker gets into their material. I would coach this speaker to use a deliberate pause and breath at the very beginning of the speech before saying their first word, which can help reset the nervous system and project calm from the start.',
   NOW() - INTERVAL '6 days', 'graded')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 029 · Sam Nguyen · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000029',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000006',
   'I watched the assigned speech video and analyzed the speaker''s delivery using three concepts from class: eye contact, vocal variety, and gestures.

Eye contact was one of the speaker''s strengths. They looked at the audience regularly and did not rely too heavily on their notes. This made the speech feel more conversational and engaging. I would encourage them to continue developing this skill and work on distributing their eye contact more evenly across the room rather than focusing on one section.

Vocal variety was present but inconsistent. The speaker used good volume and spoke clearly, but the pitch stayed relatively flat for most of the speech. There were a few moments — particularly in the introduction and conclusion — where they used more dynamic variation, and those moments were noticeably more engaging. I would coach them to bring that same energy to the body of the speech.

Gestures were natural and appropriate. The speaker used hand movements that matched their words without being distracting. One area for improvement is that the gestures were mostly small and close to the body. Larger, more expansive gestures would project more confidence and be more visible to audience members in the back of the room.',
   NOW() - INTERVAL '5 days', 'submitted'),

  -- 030 · Priya Sharma · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000030',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000007',
   'For this assignment I analyzed the delivery of the assigned speech using three concepts: pacing, structure, and eye contact.

Pacing: The speaker''s pacing was generally good. They spoke at a comfortable rate that was easy to follow. They used pauses effectively after key points, which gave the audience time to process the information. One area for improvement: the speaker rushed through the technical section of the speech, which made it harder to follow. Slowing down for complex content is a technique we covered in class that would help here.

Structure: The speech was clearly organized with a preview, three main points, and a summary. The transitions between points were clear and helped the audience follow along. The conclusion was effective and ended with a memorable statement. One suggestion: the introduction could be stronger — it started with a definition, which is a less engaging attention-getter than a story or question.

Eye contact: Eye contact was adequate but could be improved. The speaker made contact with the audience regularly but tended to look at the same section of the room. Distributing eye contact more evenly — including the sides and back of the room — would make more audience members feel included in the speech.',
   NOW() - INTERVAL '4 days', 'submitted'),

  -- 031 · Marcus Johnson · AI_SUGGESTED
  ('00000000-0000-0000-0006-000000000031',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000008',
   'My analysis of the assigned speech video uses three course concepts: vocal variety, use of space, and managing anxiety.

Vocal variety: The speaker used vocal variety effectively in the introduction and conclusion but less so in the body. The most effective moment was when they raised their voice to emphasize a key statistic — this drew the audience''s attention and signaled the importance of the information. I would coach the speaker to identify two or three more moments in the body where they can use similar emphasis.

Use of space: The speaker stayed mostly in one spot throughout the speech, which limited their use of the stage. We discussed in class that purposeful movement can reinforce structure and maintain audience attention. I would encourage this speaker to practice moving to a different part of the stage when transitioning between main points.

Managing anxiety: The speaker appeared comfortable and confident throughout the speech. There were no visible signs of anxiety — no fidgeting, voice tremors, or rushed pacing. This is a real strength and suggests good preparation. The one suggestion I have is to use more deliberate pauses, which would add gravitas to the delivery and make the speaker appear even more in control.',
   NOW() - INTERVAL '4 days', 'submitted')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 032 · Sofia Reyes · PENDING
  ('00000000-0000-0000-0006-000000000032',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000009',
   'The speaker in the video had good eye contact and spoke clearly. Their vocal variety was okay. They used gestures that matched their words. I think they could improve by using more pauses and varying their pitch more.',
   NOW() - INTERVAL '3 days', 'submitted'),

  -- 033 · Ethan Kim · PENDING
  ('00000000-0000-0000-0006-000000000033',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000010',
   'I analyzed the speech using eye contact, pacing, and gestures. Eye contact was good. Pacing was a little fast in the middle. Gestures were natural. Overall a solid delivery with room to improve on vocal variety.',
   NOW() - INTERVAL '2 days', 'submitted'),

  -- 034 · Aaliyah Washington · PENDING
  ('00000000-0000-0000-0006-000000000034',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000011',
   'The speaker demonstrated strong vocal variety and good use of eye contact. Their pacing was well-controlled and they used pauses effectively. One area for improvement is gestures — they were limited and could be more expressive. The structure of the speech was clear and easy to follow.',
   NOW() - INTERVAL '2 days', 'submitted')

ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, assignment_id, student_id, body, submitted_at, status) VALUES

  -- 035 · Connor Murphy · DRAFT
  ('00000000-0000-0000-0006-000000000035',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000012',
   'Eye contact: the speaker made good eye contact with the audience. They looked at different parts of the room. Vocal variety:',
   NULL, 'draft'),

  -- 036 · Zoe Chen · DRAFT
  ('00000000-0000-0000-0006-000000000036',
   '00000000-0000-0000-0003-000000000040',
   '00000000-0000-0000-0000-000000000013',
   'I watched the assigned speech and noticed the speaker used pacing effectively. They slowed down for important points and',
   NULL, 'draft')

  -- 014 Diego Flores, 015 Hannah Okafor, 016 Liam Patel: BLANK — no row

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- GRADES
-- final state:        ai_suggested_score + final_score + approved_by + approved_at
-- ai_suggested state: ai_suggested_score only (final_score/feedback/approved = NULL)
-- pending/draft:      no grade row
--
-- Grade IDs 001–007  → A030 BIO Course Reflection
-- Grade IDs 008–014  → A038 COMS Written Eval Round 1
-- Grade IDs 015–021  → A040 COMS Analyzing Delivery Style
-- =============================================================================

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- ── A030 BIO 111 Course Reflection ──────────────────────────────────────────

  -- G001 · Alex Rivera · FINAL (sub 001)
  ('00000000-0000-0000-0007-000000000001',
   '00000000-0000-0000-0006-000000000001',
   10,
   'Unit 1 concept (enzymes and denaturation): 3/3 — accurate, personal connection to fever is insightful and shows genuine understanding beyond the textbook.
Unit 2 concept (Mendelian genetics and medical pedigrees): 3/3 — accurate, personal relevance well explained with a real-world application.
Unit 3 concept (Hardy-Weinberg equilibrium): 2/2 — correct and specific, the observation about populations almost never meeting all five conditions is excellent.
Genuine attempt: 2/2 — strong writing, well over 300 words, organized paragraphs.',
   10,
   'Outstanding reflection. Every concept is accurate and your personal connections are genuinely insightful, not just restating the textbook. The observation about Hardy-Weinberg making evolution measurable is exactly the kind of thinking this course aims for.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '4 days'),

  -- G002 · Jordan Lee · FINAL (sub 002)
  ('00000000-0000-0000-0007-000000000002',
   '00000000-0000-0000-0006-000000000002',
   9,
   'Unit 1 concept (ATP and cellular respiration): 3/3 — accurate, personal connection is genuine and specific.
Unit 2 concept (DNA replication and cancer): 3/3 — accurate and shows real understanding beyond the textbook.
Unit 3 concept (natural selection and fitness): 2/2 — correct distinction between reproductive success and physical strength, antibiotic resistance example is well-chosen.
Genuine attempt: 1/2 — well over 300 words and organized, minor deduction for slightly brief paragraphs.',
   9,
   'Strong reflection with accurate concepts and genuine personal connections. The antibiotic resistance example for natural selection is particularly well-chosen. To push toward a 10 next time, develop each paragraph a bit further — your ideas are good but some could use one more sentence of explanation.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '3 days'),

  -- G003 · Maya Patel · FINAL (sub 003)
  ('00000000-0000-0000-0007-000000000003',
   '00000000-0000-0000-0006-000000000003',
   10,
   'Unit 1 concept (fluid mosaic model and membrane transport): 3/3 — accurate and the "security system" analogy shows genuine conceptual understanding.
Unit 2 concept (gene expression and cell differentiation): 3/3 — excellent — addresses a sophisticated concept and explains it clearly.
Unit 3 concept (coevolution): 2/2 — accurate and the personal observation about bees is a lovely real-world connection.
Genuine attempt: 2/2 — well over 300 words, organized, thoughtful writing.',
   10,
   'Excellent work. You chose sophisticated concepts and explained them with real depth. The gene expression paragraph in particular shows you understood one of the harder ideas in the course. The coevolution observation about your garden is exactly the kind of personal connection this assignment asks for.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '3 days'),

  -- G004 · Tyler Brooks · FINAL (sub 004)
  ('00000000-0000-0000-0007-000000000004',
   '00000000-0000-0000-0006-000000000004',
   9,
   'Unit 1 concept (photosynthesis and oxygen as byproduct): 3/3 — accurate, the observation about oxygen coming from water splitting is a great specific detail.
Unit 2 concept (meiosis and genetic recombination): 3/3 — accurate, personal connection to sibling differences is relatable and well-explained.
Unit 3 concept (ecological succession): 2/2 — accurate, the empty lot example is a strong real-world application.
Genuine attempt: 1/2 — well over 300 words, organized, minor deduction for slightly surface-level treatment of Unit 3.',
   9,
   'Good reflection with accurate concepts and strong personal connections. The photosynthesis paragraph is particularly well-done — the specific detail about oxygen coming from water splitting shows you really engaged with the material. Develop the ecological succession paragraph a bit more next time.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- G005 · Sam Nguyen · AI_SUGGESTED (sub 005)
  ('00000000-0000-0000-0007-000000000005',
   '00000000-0000-0000-0006-000000000005',
   7,
   'Unit 1 concept (macromolecules and proteins): 2/3 — concept is accurate but the personal connection is thin. "Made me realize how much depends on proteins" is vague.
Unit 2 concept (Punnett squares and sex-linked traits): 2/3 — Punnett squares are mentioned but the reflection is more about finding them satisfying than explaining why the concept was relevant.
Unit 3 concept (food webs and trophic levels): 2/2 — accurate, personal connection to diet and environment is genuine.
Genuine attempt: 1/2 — adequate length but writing is somewhat surface-level throughout.',
   NULL, NULL, NULL, NULL),

  -- G006 · Priya Sharma · AI_SUGGESTED (sub 006)
  ('00000000-0000-0000-0007-000000000006',
   '00000000-0000-0000-0006-000000000006',
   8,
   'Unit 1 concept (osmosis): 3/3 — accurate, the plant wilting example is a strong real-world connection.
Unit 2 concept (mutations and sickle cell anemia): 3/3 — accurate and shows understanding of the molecular-to-phenotype connection.
Unit 3 concept (natural selection mechanisms): 1/2 — correct but the reflection is brief and does not go beyond restating the four conditions.
Genuine attempt: 1/2 — adequate length, writing is organized but somewhat brief in the third paragraph.',
   NULL, NULL, NULL, NULL),

  -- G007 · Marcus Johnson · AI_SUGGESTED (sub 007)
  ('00000000-0000-0000-0007-000000000007',
   '00000000-0000-0000-0006-000000000007',
   8,
   'Unit 1 concept (aerobic vs. anaerobic respiration and lactic acid): 3/3 — accurate, personal connection to sports is specific and genuine.
Unit 2 concept (epigenetics): 2/3 — interesting choice, but epigenetics was only briefly mentioned in lecture. The reflection shows curiosity but the concept description is somewhat imprecise.
Unit 3 concept (invasive species): 2/2 — accurate, regional connection is a strong personal application.
Genuine attempt: 1/2 — adequate length, writing is organized but the epigenetics paragraph needs more precision.',
   NULL, NULL, NULL, NULL)

ON CONFLICT (id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- ── A038 COMS 101 Written Evaluation Round 1 ────────────────────────────────

  -- G008 · Alex Rivera · FINAL (sub 013)
  ('00000000-0000-0000-0007-000000000008',
   '00000000-0000-0000-0006-000000000013',
   15,
   'Addresses all five criteria: 6/6 — organization, delivery, eye contact, vocal variety, and content all addressed with substance and specificity.
Cites specific moments: 6/6 — multiple specific examples throughout (personal story opening, filler words in middle section, looking at notes in first minute, third point feeling rushed, deliberate eye contact with different room sections).
Constructive tone and writing quality: 3/3 — professional, organized, well over 400 words.',
   15,
   'Excellent evaluation. You addressed every criterion with specificity — citing actual moments from the speech rather than speaking in generalities. This is exactly what constructive peer feedback looks like. Strong work.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '6 days'),

  -- G009 · Jordan Lee · FINAL (sub 014)
  ('00000000-0000-0000-0007-000000000009',
   '00000000-0000-0000-0006-000000000014',
   14,
   'Addresses all five criteria: 6/6 — all five areas addressed with substance.
Cites specific moments: 5/6 — good specificity throughout (rhetorical question opener, fast pace in middle, eye contact with multiple sections, volume drop at sentence ends). Minor deduction: vocal variety section could cite one more specific moment.
Constructive tone and writing quality: 3/3 — professional, organized, well over 400 words.',
   14,
   'Strong evaluation with good specificity throughout. You identified concrete moments in the speech for most criteria. To reach a 15 next time, make sure every criterion has at least two specific examples — your vocal variety section was the one area that stayed a bit general.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '5 days'),

  -- G010 · Maya Patel · FINAL (sub 015)
  ('00000000-0000-0000-0007-000000000010',
   '00000000-0000-0000-0006-000000000015',
   14,
   'Addresses all five criteria: 6/6 — all five areas addressed with substance and clear analysis.
Cites specific moments: 5/6 — strong specificity (startling statistic opener, note card reliance, eye contact recovery in conclusion, vocal variety in introduction). Minor deduction: content section mentions a disconnected third point but does not describe what it was.
Constructive tone and writing quality: 3/3 — professional, organized, well over 400 words.',
   14,
   'Very good evaluation. Your analysis of the note card issue and its effect on eye contact was particularly insightful — you connected two criteria together, which shows sophisticated thinking. Name the specific disconnected point in the content section next time for full marks.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '5 days'),

  -- G011 · Tyler Brooks · FINAL (sub 016)
  ('00000000-0000-0000-0007-000000000011',
   '00000000-0000-0000-0006-000000000016',
   13,
   'Addresses all five criteria: 5/6 — all five areas addressed, but delivery section is brief and does not fully analyze the trailing-off issue.
Cites specific moments: 5/6 — good specificity (personal anecdote opener, purposeful movement, two main points instead of three, eye contact with full room, pitch range). Minor deduction: delivery section lacks a specific example.
Constructive tone and writing quality: 3/3 — professional, organized, well over 400 words.',
   13,
   'Good evaluation with strong specificity in most areas. The observation about the speaker having only two main points is an important structural critique. Develop the delivery section more — you identified the trailing-off issue but did not give a specific example of when it happened.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '4 days')

ON CONFLICT (id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- G012 · Sam Nguyen · AI_SUGGESTED (sub 017)
  ('00000000-0000-0000-0007-000000000012',
   '00000000-0000-0000-0006-000000000017',
   8,
   'Addresses all five criteria: 3/6 — organization and delivery mentioned with some substance. Eye contact and vocal variety are noted but not analyzed. Content addressed but superficially.
Cites specific moments: 2/6 — "looked at the audience most of the time" and "sped up when excited" are the only specific observations. The rest is general praise.
Constructive tone and writing quality: 3/3 — tone is positive and appropriate, writing is clear, adequate length.',
   NULL, NULL, NULL, NULL),

  -- G013 · Priya Sharma · AI_SUGGESTED (sub 018)
  ('00000000-0000-0000-0007-000000000013',
   '00000000-0000-0000-0006-000000000018',
   9,
   'Addresses all five criteria: 5/6 — all five areas addressed. Eye contact section is brief and lacks depth.
Cites specific moments: 2/6 — "focused on one side of the room" is the only specific observation. All other criteria are described in general terms without citing actual moments from the speech.
Constructive tone and writing quality: 2/3 — tone is appropriate, writing is organized but below 400 words.',
   NULL, NULL, NULL, NULL),

  -- G014 · Marcus Johnson · AI_SUGGESTED (sub 019)
  ('00000000-0000-0000-0007-000000000014',
   '00000000-0000-0000-0006-000000000019',
   10,
   'Addresses all five criteria: 5/6 — all five areas addressed with some analysis. Vocal variety section is brief.
Cites specific moments: 3/6 — "looked at the floor when thinking" and "strong in introduction, weaker in body" are specific. Transitions issue is identified but not illustrated with an example. Other criteria stay general.
Constructive tone and writing quality: 2/3 — tone is appropriate and constructive, writing is organized but slightly under 400 words.',
   NULL, NULL, NULL, NULL)

ON CONFLICT (id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- ── A040 COMS 101 Analyzing Delivery Style ──────────────────────────────────

  -- G015 · Alex Rivera · FINAL (sub 025)
  ('00000000-0000-0000-0007-000000000015',
   '00000000-0000-0000-0006-000000000025',
   29,
   'Applies at least three distinct course concepts: 15/15 — eye contact, vocal variety, and pacing all applied correctly with accurate course terminology.
Supports each claim with specific evidence: 10/10 — every concept is backed by specific observations from the video (2–3 second eye contact holds, volume drop for gravity, pace increase for call to action, rushing through carbon feedback loops).
Writing is organized and professional: 4/5 — well over 400 words, clear structure, minor deduction for one slightly abrupt transition.',
   29,
   'Excellent analysis. You applied all three concepts with precision and backed every claim with specific evidence from the video. The observation about the speaker rushing through the most technically complex section is a sophisticated coaching insight. Strong work.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '7 days'),

  -- G016 · Jordan Lee · FINAL (sub 026)
  ('00000000-0000-0000-0007-000000000016',
   '00000000-0000-0000-0006-000000000026',
   28,
   'Applies at least three distinct course concepts: 14/15 — gestures, structure, and vocal variety applied correctly. Minor deduction: the structure analysis focuses on transitions but does not fully address the overall organizational pattern.
Supports each claim with specific evidence: 9/10 — strong specificity throughout (left-to-right gesture for timeline, pointing gesture repetition, weak transitions, intimate storytelling moment). Minor deduction: vocal variety section could cite one more specific moment.
Writing is organized and professional: 5/5 — well over 400 words, clear structure, professional tone.',
   28,
   'Very strong analysis. The observation about the speaker using the same pointing gesture repeatedly is a specific and insightful coaching note. Develop the structure section a bit more next time — transitions are one aspect of structure but not the whole picture.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '6 days'),

  -- G017 · Maya Patel · FINAL (sub 027)
  ('00000000-0000-0000-0007-000000000017',
   '00000000-0000-0000-0006-000000000027',
   28,
   'Applies at least three distinct course concepts: 14/15 — eye contact, pacing, and use of space applied correctly. Minor deduction: use of space section is slightly brief.
Supports each claim with specific evidence: 10/10 — excellent specificity throughout (turning back to screen, pausing after rhetorical questions, rushing through carbon feedback loops, purposeful stage movement between sections).
Writing is organized and professional: 4/5 — well over 400 words, clear structure, minor deduction for slightly abrupt ending.',
   28,
   'Strong analysis with excellent specificity. The observation about the speaker turning their back to the audience when referencing slides is a precise and actionable coaching note. The use of space section is your strongest — develop the eye contact section to the same level next time.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '6 days'),

  -- G018 · Tyler Brooks · FINAL (sub 028)
  ('00000000-0000-0000-0007-000000000018',
   '00000000-0000-0000-0006-000000000028',
   27,
   'Applies at least three distinct course concepts: 14/15 — vocal variety, eye contact, and managing anxiety applied correctly. Minor deduction: managing anxiety section is slightly brief.
Supports each claim with specific evidence: 9/10 — good specificity (volume drop at sentence ends, floor-looking during Q&A, faster pace and voice tremor in first two minutes, settling by minute three). Minor deduction: vocal variety section could cite one more specific moment.
Writing is organized and professional: 4/5 — well over 400 words, clear structure, minor deduction for one section feeling slightly rushed.',
   27,
   'Good analysis with solid specificity. The observation about anxiety being highest at the start and decreasing as the speaker gets into their material shows you connected the video to course concepts effectively. Develop the managing anxiety section more — you have the right idea but it ends a bit abruptly.',
   '00000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '5 days')

ON CONFLICT (id) DO NOTHING;

INSERT INTO grades (id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_by, approved_at) VALUES

  -- G019 · Sam Nguyen · AI_SUGGESTED (sub 029)
  ('00000000-0000-0000-0007-000000000019',
   '00000000-0000-0000-0006-000000000029',
   20,
   'Applies at least three distinct course concepts: 10/15 — eye contact, vocal variety, and gestures identified correctly. However, the analysis of each is surface-level and does not demonstrate deep application of course terminology.
Supports each claim with specific evidence: 7/10 — some specific observations (small gestures close to body, dynamic variation in introduction and conclusion) but several claims are general ("eye contact was one of the speaker''s strengths" without a specific example).
Writing is organized and professional: 3/5 — adequate length, organized, but writing is somewhat formulaic.',
   NULL, NULL, NULL, NULL),

  -- G020 · Priya Sharma · AI_SUGGESTED (sub 030)
  ('00000000-0000-0000-0007-000000000020',
   '00000000-0000-0000-0006-000000000030',
   21,
   'Applies at least three distinct course concepts: 11/15 — pacing, structure, and eye contact applied correctly. Pacing and structure sections show good understanding. Eye contact section is brief.
Supports each claim with specific evidence: 7/10 — good specificity in pacing (rushing through technical section) and structure (definition as attention-getter). Eye contact section lacks specific examples.
Writing is organized and professional: 3/5 — adequate length, organized, writing is clear but somewhat brief in the eye contact section.',
   NULL, NULL, NULL, NULL),

  -- G021 · Marcus Johnson · AI_SUGGESTED (sub 031)
  ('00000000-0000-0000-0007-000000000021',
   '00000000-0000-0000-0006-000000000031',
   22,
   'Applies at least three distinct course concepts: 12/15 — vocal variety, use of space, and managing anxiety applied correctly. Use of space section correctly identifies the issue but the analysis is brief.
Supports each claim with specific evidence: 7/10 — good specificity for vocal variety (raising voice for key statistic) and managing anxiety (no visible signs, deliberate pauses). Use of space section lacks a specific example of where the speaker stayed rooted.
Writing is organized and professional: 3/5 — adequate length, organized, writing is clear but the use of space section needs more development.',
   NULL, NULL, NULL, NULL)

ON CONFLICT (id) DO NOTHING;


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
UPDATE assignments SET due_date = '2026-05-30' WHERE id = '00000000-0000-0000-0003-000000000033';
UPDATE assignments SET due_date = '2026-06-02' WHERE id = '00000000-0000-0000-0003-000000000034';
UPDATE assignments SET due_date = '2026-06-06' WHERE id = '00000000-0000-0000-0003-000000000035';
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
