/**
 * Canonical test fixture: Week 1 Reflection (warm-up assignment, high completion weight).
 *
 * Rubric: skill 30 / career 30 / writing 20 / completion 20
 * All mock AI payloads and expected scores were calibrated manually in a grilling session.
 * See presentation.txt for calibration principles.
 */

export const assignment = {
  id: 'test-assignment-001',
  title: 'Week 1 Reflection',
  instructions:
    'Write a 2–3 paragraph reflection on what you hope to learn in this course and how it connects to your career goals. Be specific about at least one skill you want to develop.',
  points_possible: 100,
}

export const rubric = {
  id: 'test-rubric-001',
  assignment_id: 'test-assignment-001',
  criteria: [
    { description: 'Identifies at least one specific skill to develop', points: 30 },
    { description: 'Connects course to concrete career goals', points: 30 },
    { description: 'Writing is organized and coherent (2+ paragraphs)', points: 20 },
    { description: 'Makes a genuine attempt to respond to the prompt', points: 20 },
  ],
}

// ---------------------------------------------------------------------------
// Submission bodies
// ---------------------------------------------------------------------------

const bodyA = `I'm taking this course because I want to develop strong data analysis skills, specifically learning how to use Python and SQL to draw insights from messy real-world datasets. I've always been interested in working with numbers, but I've never had formal training in how to structure that work.

In terms of career goals, I'm planning to go into product management after graduation, and I know that PMs who can do their own data pulls and analysis are significantly more valuable than those who can't. This course feels like the missing piece between where I am now and where I want to be when I start applying for jobs next spring.

I learn best by doing, so I'm hoping the assignments push me to apply concepts to real problems rather than just reading about them. If I leave this course able to write a SQL query from scratch and explain the results to a non-technical audience, I'll consider that a success.`

const bodyB1 = `I want to improve my public speaking skills in this course. It's something I've always struggled with and I know it matters in every job. I'm hoping the presentations and group work push me out of my comfort zone.

I'm a bit nervous about the workload but I'll stay on top of the readings. I've heard good things from upperclassmen so I'm optimistic.`

const bodyB2 = `One skill I specifically want to develop is writing clear technical documentation — I've noticed in my internship that nobody reads docs that aren't well-organized, and I want to fix that in my own work.

I'm planning to go into software engineering after graduation, so being able to communicate technical decisions to non-technical stakeholders feels essential. This course seems like a good place to practice that bridge between technical and business thinking.

I work best when I can see the real-world application of what I'm learning, so I'm hoping the assignments tie back to actual industry problems.`

const bodyB3 = `I hope to learn how to manage projects more effectively, including how to break large goals down into smaller milestones. I've struggled with scope creep on group projects and want a more systematic approach.

I'm not totally sure what career path I want yet, but I know that project management skills transfer across a lot of fields, so developing them now feels like a safe investment regardless of where I end up.`

const bodyB4 = `This course is going to help me with a lot of things I need for my future. I want to get better at communicating and also at understanding how businesses work. I think those are really important skills.

I'm excited to learn from my classmates too because everyone brings different experiences. I think this semester will be really valuable for my personal and professional growth.

I'm committed to doing my best work and I look forward to the challenge.`

// ---------------------------------------------------------------------------
// Mock AI response payloads (used in fast unit/integration tests — no Groq call)
// Scores calibrated to match expected totals exactly.
// ---------------------------------------------------------------------------

export const mockAiResponse = {
  A: {
    criterion_scores: [
      { description: 'Identifies at least one specific skill to develop', points_possible: 30, points_awarded: 30, evidence: 'Explicitly names data analysis with Python and SQL as the target skill.' },
      { description: 'Connects course to concrete career goals', points_possible: 30, points_awarded: 30, evidence: 'States product management career goal and job applications next spring as concrete targets.' },
      { description: 'Writing is organized and coherent (2+ paragraphs)', points_possible: 20, points_awarded: 20, evidence: 'Three well-structured paragraphs with clear progression.' },
      { description: 'Makes a genuine attempt to respond to the prompt', points_possible: 20, points_awarded: 20, evidence: 'Substantive and specific response throughout.' },
    ],
    feedback_draft:
      'Excellent reflection. You clearly identified a specific skill (Python/SQL for data analysis) and connected it to a concrete career goal (product management). Your writing is organized and shows genuine engagement.',
  },
  B1: {
    criterion_scores: [
      { description: 'Identifies at least one specific skill to develop', points_possible: 30, points_awarded: 25, evidence: 'Names public speaking as a target skill — specific but underdeveloped.' },
      { description: 'Connects course to concrete career goals', points_possible: 30, points_awarded: 0, evidence: 'No mention of career goals or professional context.' },
      { description: 'Writing is organized and coherent (2+ paragraphs)', points_possible: 20, points_awarded: 15, evidence: 'Two paragraphs present but thin in content.' },
      { description: 'Makes a genuine attempt to respond to the prompt', points_possible: 20, points_awarded: 20, evidence: 'Clearly engaged with the prompt despite missing the career criterion.' },
    ],
    feedback_draft:
      'Good start on identifying a skill to develop. To improve, add a paragraph connecting this skill to your specific career goals after graduation.',
  },
  B2: {
    criterion_scores: [
      { description: 'Identifies at least one specific skill to develop', points_possible: 30, points_awarded: 28, evidence: 'Technical documentation named as the specific skill with real internship context.' },
      { description: 'Connects course to concrete career goals', points_possible: 30, points_awarded: 28, evidence: 'Software engineering career and communication to non-technical stakeholders named explicitly.' },
      { description: 'Writing is organized and coherent (2+ paragraphs)', points_possible: 20, points_awarded: 17, evidence: 'Three clear paragraphs; could be more fully developed.' },
      { description: 'Makes a genuine attempt to respond to the prompt', points_possible: 20, points_awarded: 17, evidence: 'Solid, substantive attempt throughout.' },
    ],
    feedback_draft:
      'Strong reflection. Your specific skill (technical documentation) and career goal (software engineering) are both clearly stated. One more sentence per paragraph would push this to full marks.',
  },
  B3: {
    criterion_scores: [
      { description: 'Identifies at least one specific skill to develop', points_possible: 30, points_awarded: 28, evidence: 'Project management and milestone-breaking named as specific skill areas.' },
      { description: 'Connects course to concrete career goals', points_possible: 30, points_awarded: 12, evidence: 'Acknowledges career path is uncertain; connection to goals is vague.' },
      { description: 'Writing is organized and coherent (2+ paragraphs)', points_possible: 20, points_awarded: 10, evidence: 'Two paragraph-length blocks but read as extended sentences rather than developed paragraphs.' },
      { description: 'Makes a genuine attempt to respond to the prompt', points_possible: 20, points_awarded: 18, evidence: 'Genuine attempt; addresses most criteria.' },
    ],
    feedback_draft:
      'You identified a clear skill and made a genuine attempt, but the response needs more development — both in paragraph depth and in connecting your goals to a specific career direction.',
  },
  B4: {
    criterion_scores: [
      { description: 'Identifies at least one specific skill to develop', points_possible: 30, points_awarded: 22, evidence: 'Mentions communication and business understanding but without specificity.' },
      { description: 'Connects course to concrete career goals', points_possible: 30, points_awarded: 22, evidence: 'References future and professional growth but no concrete career context.' },
      { description: 'Writing is organized and coherent (2+ paragraphs)', points_possible: 20, points_awarded: 20, evidence: 'Three full paragraphs, organized and coherent.' },
      { description: 'Makes a genuine attempt to respond to the prompt', points_possible: 20, points_awarded: 18, evidence: 'Genuine attempt across all criteria.' },
    ],
    feedback_draft:
      'Your writing is well-organized with three clear paragraphs. To improve your score, be more specific about which skills you want to develop and name a concrete career goal rather than speaking generally about your future.',
  },
}

// ---------------------------------------------------------------------------
// Submission scenarios (full shape used in tests)
// ---------------------------------------------------------------------------

export const submissions = {
  A: {
    body: bodyA,
    file: null,
    expectedScore: 100,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Strong — all criteria fully met',
  },
  B1: {
    body: bodyB1,
    file: null,
    expectedScore: 60,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Partial — mentions skill, skips career entirely',
  },
  B2: {
    body: bodyB2,
    file: null,
    expectedScore: 90,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Partial — nearly complete, needs one more sentence',
  },
  B3: {
    body: bodyB3,
    file: null,
    expectedScore: 68,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Partial — covers all criteria but sentences not paragraphs',
  },
  B4: {
    body: bodyB4,
    file: null,
    expectedScore: 82,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Partial — three real paragraphs but vague content',
  },
  D: {
    body: '',
    file: null,
    expectedScore: 0,
    shouldShortCircuit: true,
    shouldFlagEmpty: false,
    description: 'Empty — no body, no file',
  },
  E: {
    body: '',
    file: { url: 'https://example.com/essay.pdf', fileName: 'essay.pdf', fileType: 'application/pdf', fileSize: 204800 },
    expectedScore: 0,
    shouldShortCircuit: true,
    shouldFlagEmpty: true,
    description: 'File-only — no text body, attachment present; UI flag shown',
  },
} as const
