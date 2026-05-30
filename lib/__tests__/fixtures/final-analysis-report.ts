/**
 * Canonical test fixture: Final Analysis Report (final-project tier, low completion weight).
 *
 * Rubric: analysis 40 / evidence 30 / synthesis 25 / completion 5
 *
 * The completion criterion carries only 5 pts (vs. 20 pts in week1-reflection.ts).
 * Low completion weight signals a final-project assignment — a genuine attempt earns
 * almost nothing; content mastery is required to score well.
 *
 * Calibration principle (see presentation.txt §1–2):
 *   - "Shows up and tries" → ~35–45 pts (5 completion + thin content)
 *   - Score of 100 requires mastered theory, timestamped evidence, strategic synthesis
 *   - A response that earns 60–80 pts on the warm-up earns 35–55 pts here
 *
 * Comparison with week1-reflection.ts:
 *   Scenario  warm-up score  final score   delta
 *   A         100            99            -1    (near-perfect both ways)
 *   B1         60            37            -23   (effort alone no longer carries)
 *   B2         90            72            -18   (missing synthesis penalized heavily)
 *   B3         68            41            -27   (vague evidence tanks on low-completion)
 *   B4         82            55            -27   (mixed quality, no strategy)
 *   D           0             0             0    (short-circuit)
 *   E           0             0             0    (short-circuit + file flag)
 *
 * Assignment context: COMS 101 public speaking, final module.
 * Students analyze Brené Brown's "The Power of Vulnerability" (2010 TED) — a real
 * publicly available talk commonly assigned in public speaking courses.
 */

export const assignment = {
  id: 'test-assignment-002',
  title: 'Final Analysis Report – Delivery Analysis',
  instructions:
    "Select a professional speech from the provided list. Write a comprehensive delivery analysis (600+ words) that demonstrates mastery of delivery principles from this course. Your report must: (1) Analyze at least four distinct delivery concepts from course material (eye contact, vocal variety, pacing, gestures, physical movement, use of pauses, or structure). For each concept: describe what the speaker did, cite a specific moment as evidence, evaluate effectiveness, and provide a coaching note. (2) Write a strategic synthesis conclusion explaining how the speaker's delivery choices serve their specific communication goals — not just whether they were 'effective.' Use professional academic language throughout.",
  points_possible: 100,
}

export const rubric = {
  id: 'test-rubric-002',
  assignment_id: 'test-assignment-002',
  criteria: [
    {
      description: 'Applies at least four delivery concepts with accurate course-aligned explanations',
      points: 40,
    },
    {
      description: 'Supports each claim with specific, timestamped evidence from the speech',
      points: 30,
    },
    {
      description: "Conclusion connects delivery choices to the speaker's communication strategy",
      points: 25,
    },
    {
      description: 'Addresses all required elements of the prompt',
      points: 5,
    },
  ],
}

// ---------------------------------------------------------------------------
// Submission bodies
// ---------------------------------------------------------------------------

const bodyA = `Brené Brown's 2010 TED talk, "The Power of Vulnerability," serves as an exceptional case study in purposeful delivery. I analyze five delivery concepts: vocal variety, pacing, eye contact, use of pauses, and physical movement.

Vocal variety. Brown's pitch and volume shifts are clearly intentional. At 2:14, as she transitions from citing research statistics into personal story, her pitch drops and volume decreases noticeably — a classic "lean-in" signal that marks emotional intimacy. At 8:40, her voice rises sharply during the enumeration of numbing behaviors, creating urgency. The contrast across the two moments is purposeful and precise. Coaching: this vocal range is a model for students to study; no adjustment needed.

Pacing. Brown's average pace is approximately 130 wpm during narrative sections. She slows to under 100 wpm when advancing her core argument — most notably between 11:20 and 11:50 during the phrase "we numb vulnerability." The contrast makes the thesis land with disproportionate weight. One adjustment: the opening segment (0:00–2:00) is slightly rushed; a slower entry would strengthen early ethos-building.

Eye contact. Brown scans three audience sections consistently from 0:00 to 5:00, building credibility early. She almost never consults notes. The one exception — a brief downward glance at 7:15 while searching for a word — reads as authentic rather than unprepared, which paradoxically reinforces her message about vulnerability.

Use of pauses. At 15:45, Brown holds a 4-second pause before her central thesis. This is the single most effective delivery moment in the talk — silence creates expectation and the thesis arrives with maximum weight. At 6:30, a 2-second pause after a self-deprecating joke allows laughter to settle before she pivots to research findings. Good timing instinct on both.

Physical movement. Brown uses spatial staging: data is delivered from stage left, personal narrative from stage right, and her thesis from center. This blocking makes her structure physically visible. It is subtle enough that most audience members would not register it consciously, but it reinforces the structural logic of the argument.

Synthesis: Brown's delivery choices are not decorative — they are rhetorical. Her willingness to drop volume, pause visibly, and allow herself a visible word-search hesitation enacts the very vulnerability she is arguing for. The delivery IS the argument. A speaker who delivered this same content in a polished, controlled, affect-free style would undermine the thesis. This is what distinguishes strategic delivery from competent delivery: every choice is in service of the core claim.`

const bodyB1 = `In the TED talk I watched, the speaker used several delivery techniques from our course. I will analyze eye contact, vocal variety, and pacing.

Eye contact was good. The speaker looked at the audience throughout the presentation. This is important because eye contact makes the audience feel engaged and builds credibility with the speaker. The speaker seemed to look at different sections of the room during the talk.

Vocal variety was also present. The speaker changed her tone and volume at different points in the speech. This is an important concept from class because it keeps the audience interested. When speakers don't vary their voice it can feel monotonous and cause the audience to lose attention.

Pacing was appropriate for the most part. The speaker didn't speak too fast or too slow. Sometimes it seemed a little rushed but overall the pacing worked fine for the content being delivered.

Overall I thought the speaker was effective. Her delivery helped communicate her message and the audience seemed engaged. Some areas could be improved but she performed well overall.`

const bodyB2 = `For this analysis I chose Brené Brown's "The Power of Vulnerability" (2010 TED). I will examine four delivery concepts: vocal variety, eye contact, pacing, and pauses.

Vocal variety. Brown uses pitch and volume strategically. At the 8-minute mark, her voice rises during her list of numbing behaviors — the escalating volume mirrors the emotional weight of the list. At 2:14, her voice drops when she pivots from data to personal story, signaling the shift in tone. Both moments are intentional and effective. I would coach students to study the 8-minute sequence specifically.

Eye contact. Brown maintains eye contact across all three sections of the audience and consults notes perhaps twice in 20 minutes. This projects mastery of the material. The brief break at 7:15 mid-sentence is natural and actually humanizes the presentation rather than undermining it.

Pacing. Between 11:20 and 11:50, Brown's pace drops noticeably as she delivers the core thesis. This is effective — slower speech at a key moment forces the audience to register what is being said. Her opening segment (0:00–2:00) is slightly rushed, though this may reflect early nerves rather than a deliberate choice.

Pauses. The 4-second pause at 15:45 before the central thesis is the most powerful single moment in the talk. Brown also uses a brief pause after a joke at 6:30 to let the laughter settle — solid timing instinct.

Overall, Brown is a highly effective speaker who deploys these delivery tools with skill and intention. All four concepts are used correctly and contribute to an engaging presentation.`

const bodyB3 = `I analyzed a professional TED talk for this assignment. I will analyze four delivery concepts from our coursework: eye contact, vocal variety, pacing, and physical movement.

Eye contact: The speaker maintained strong eye contact throughout the presentation. She regularly scanned all sections of the audience, which helped establish credibility. Her eye contact was consistent and effective, making the audience feel engaged and connected.

Vocal variety: The speaker demonstrated excellent vocal variety during the talk. Her pitch and volume changed appropriately at different moments in the speech. She raised her voice during exciting parts and lowered it during more serious points. This made the speech more interesting and easier to follow.

Pacing: The pacing was well-suited to the content. The speaker varied her speed thoughtfully, slowing down at important moments and moving more quickly through transitions. Overall her pacing was one of her strongest delivery skills.

Physical movement: The speaker used deliberate movement on stage. She didn't stay in one position throughout, which helped keep the audience's attention. Her movement was natural and professional, adding energy to the presentation without becoming distracting.

In conclusion, the speaker demonstrated strong mastery of all four delivery concepts. Each technique was used effectively and contributed to a well-executed presentation. She is clearly a skilled communicator who has developed strong delivery habits.`

const bodyB4 = `For my Final Analysis Report I analyzed a speech by Brené Brown, a social researcher known for her work on vulnerability and shame. I will analyze four delivery concepts: vocal variety, gestures, pacing, and use of pauses.

Vocal variety. Brown's most notable vocal choice is what I call "strategic softening" — she frequently reduces her volume to near-whisper during key emotional moments. At around 2:00, she almost whispers the phrase about her research crisis, which draws the audience physically forward. At 9:00, during the numbing behaviors list, volume rises steadily in an emotional escalation. The contrasts are deliberate. Coaching: she could use more pitch variation (not just volume) during data-heavy sections to maintain engagement.

Gestures. Brown uses open-palm gestures frequently, which our textbook identifies as a trust-building signal. However, I noticed she sometimes crosses her arms briefly during data sections, around 3:30 and again near 10:00. In class we discussed that crossed arms can signal defensiveness. Brown may be unconsciously expressing discomfort with the research data itself, which could ironically undercut her ethos during the moments when data credibility is most important.

Pacing. Around 11:20, Brown slows significantly during her core argument — this marks the thesis moment effectively. The opening is uneven: between 0:30 and 1:30 she rushes through setup information that might be unclear to a first-time audience.

Use of pauses. A long pause at approximately 15:45 precedes her central thesis. The silence creates expectation and the thesis arrives with weight. She also pauses after jokes, showing good audience timing.

In conclusion, Brown's delivery is highly skilled in most areas. The vocal variety and pause analysis are the clearest examples of deliberate, course-aligned choices. The gesture observation adds an interesting layer, though more coaching on correcting arm-crossing would strengthen that section.`

// ---------------------------------------------------------------------------
// Mock AI response payloads (used in fast unit/integration tests — no Groq call)
// Scores calibrated to match expected totals exactly.
// ---------------------------------------------------------------------------

export const mockAiResponse = {
  A: {
    criterion_scores: [
      {
        description: 'Applies at least four delivery concepts with accurate course-aligned explanations',
        points_possible: 40,
        points_awarded: 40,
        evidence:
          'Five concepts analyzed (vocal variety, pacing, eye contact, pauses, physical movement). Each section applies course terminology accurately, includes coaching, and evaluates effectiveness with precision.',
      },
      {
        description: 'Supports each claim with specific, timestamped evidence from the speech',
        points_possible: 30,
        points_awarded: 29,
        evidence:
          'Every concept is supported with a specific timestamp (2:14, 8:40, 11:20–11:50, 15:45, 6:30). One point deducted: the volume-drop estimate at 2:14 is described as "noticeable" without a precise measure, which is an approximation rather than a citable moment.',
      },
      {
        description: "Conclusion connects delivery choices to the speaker's communication strategy",
        points_possible: 25,
        points_awarded: 25,
        evidence:
          "Synthesis explicitly argues that Brown's delivery enacts her thesis — vulnerability is modeled, not just described. Explains what would be lost if the talk were delivered in a controlled, affect-free style. This is strategic analysis, not a competency checklist.",
      },
      {
        description: 'Addresses all required elements of the prompt',
        points_possible: 5,
        points_awarded: 5,
        evidence:
          'All required elements present: four or more concepts (five here), specific timestamped evidence for each, coaching notes for each, and a strategic synthesis conclusion.',
      },
    ],
    feedback_draft:
      'Exceptional analysis. You analyzed five delivery concepts with precision, provided specific timestamped evidence for every claim, and — most importantly — your synthesis argues that Brown\'s delivery enacts her thesis rather than merely illustrating it. That is the level of strategic thinking this assignment is designed to assess.',
  },
  B1: {
    criterion_scores: [
      {
        description: 'Applies at least four delivery concepts with accurate course-aligned explanations',
        points_possible: 40,
        points_awarded: 18,
        evidence:
          'Only three concepts addressed — one below the required minimum of four. Descriptions remain at the definition level ("eye contact builds credibility") rather than applied analysis. No coaching note provided for any concept.',
      },
      {
        description: 'Supports each claim with specific, timestamped evidence from the speech',
        points_possible: 30,
        points_awarded: 6,
        evidence:
          'No timestamps in the entire paper. The one near-specific observation ("seemed to look at different sections of the room") is vague. All other claims are generalizations that could describe any speaker in any talk.',
      },
      {
        description: "Conclusion connects delivery choices to the speaker's communication strategy",
        points_possible: 25,
        points_awarded: 9,
        evidence:
          'Final paragraph states delivery "helped communicate her message" but does not identify what the message is or how any specific delivery choice serves it. "She did well overall" is a grade, not a synthesis.',
      },
      {
        description: 'Addresses all required elements of the prompt',
        points_possible: 5,
        points_awarded: 4,
        evidence:
          'Lists concepts and attempts evaluation; no coaching element included for any concept; synthesis does not satisfy requirement 2.',
      },
    ],
    feedback_draft:
      'You identified three delivery concepts and made some general observations, but this analysis does not reach the standard for a final-project report. Missing: a fourth concept, specific timestamped evidence, coaching notes, and a strategic synthesis. "Effective" is a conclusion, not an analysis — work backward from specific evidence to your judgment.',
  },
  B2: {
    criterion_scores: [
      {
        description: 'Applies at least four delivery concepts with accurate course-aligned explanations',
        points_possible: 40,
        points_awarded: 34,
        evidence:
          'Four concepts analyzed correctly with accurate course terminology. Vocal variety and pause analysis are strong. Coaching provided for vocal variety only — the other three concepts receive evaluation but no coaching note, which the assignment requires for each.',
      },
      {
        description: 'Supports each claim with specific, timestamped evidence from the speech',
        points_possible: 30,
        points_awarded: 26,
        evidence:
          'Vocal variety has two precise timestamps (8 min, 2:14). Eye contact, pacing, and pauses each have at least one specific moment. Minor deduction: the pacing coaching ("may reflect nerves") lacks a specific timestamp, and the 15:45 pause is approximate.',
      },
      {
        description: "Conclusion connects delivery choices to the speaker's communication strategy",
        points_possible: 25,
        points_awarded: 7,
        evidence:
          'Conclusion states Brown "deploys tools with skill and intention" but does not identify what her communication goals are, what her thesis is about, or how any specific delivery choice serves those goals. "Engaging presentation" is not a strategic synthesis.',
      },
      {
        description: 'Addresses all required elements of the prompt',
        points_possible: 5,
        points_awarded: 5,
        evidence:
          'Four concepts analyzed, timestamps provided, evaluations present. Coaching is included for only one concept; however the other required elements are substantially present.',
      },
    ],
    feedback_draft:
      'Strong technical work — your timestamps and specific moments are exactly what this assignment asks for. The gap is in your synthesis: "deploys tools with skill" is a grade, not an analysis. For full marks, explain why Brown\'s specific delivery choices serve her specific thesis about vulnerability. What would be lost if she delivered this exact content in a flat, controlled, affect-free style?',
  },
  B3: {
    criterion_scores: [
      {
        description: 'Applies at least four delivery concepts with accurate course-aligned explanations',
        points_possible: 40,
        points_awarded: 24,
        evidence:
          'Four concepts named and described in terms consistent with course material. Evaluations are present in each section. However, no coaching note is provided for any concept, and the analysis stays at description level — "used deliberately," "added energy" — without explaining the mechanism.',
      },
      {
        description: 'Supports each claim with specific, timestamped evidence from the speech',
        points_possible: 30,
        points_awarded: 4,
        evidence:
          'Zero timestamps. Every evidence claim is a generalization: "changed appropriately at different moments," "slowing down at important moments," "didn\'t stay in one position." None of these can be verified or located in the speech. One point for noting the eye contact scanning pattern, which is at least a behavior description.',
      },
      {
        description: "Conclusion connects delivery choices to the speaker's communication strategy",
        points_possible: 25,
        points_awarded: 8,
        evidence:
          'Conclusion is a sequence of positive adjectives ("strong mastery," "well-executed") without identifying the speaker\'s communication goals or connecting any delivery choice to the thesis. No strategic reasoning present.',
      },
      {
        description: 'Addresses all required elements of the prompt',
        points_possible: 5,
        points_awarded: 5,
        evidence:
          'Four concepts listed, evaluations attempted for each, conclusion present. All three required structural elements are technically addressed, though shallowly.',
      },
    ],
    feedback_draft:
      'You identified four concepts and provided evaluations, but this analysis lacks the specific evidence that a final-project assignment requires. Every claim — "raised her voice during exciting parts," "movement was natural" — needs a specific citable moment: a timestamp, a direct quote, a named gesture. Vague agreement is not evidence. Rewrite with one specific, locatable moment per concept.',
  },
  B4: {
    criterion_scores: [
      {
        description: 'Applies at least four delivery concepts with accurate course-aligned explanations',
        points_possible: 40,
        points_awarded: 25,
        evidence:
          'Four concepts addressed. Vocal variety section is genuinely strong (specific, course-aligned, with coaching). Pause analysis is correct. Pacing is present but underdeveloped. Gesture section: the crossed-arms observation is creative and shows engagement, but overstates the case — describing it as evidence of unconscious discomfort is interpretive overreach; crossed arms during data delivery is more likely postural habit. Misapplication of the course concept reduces the score.',
      },
      {
        description: 'Supports each claim with specific, timestamped evidence from the speech',
        points_possible: 30,
        points_awarded: 18,
        evidence:
          'Vocal variety has two approximate timestamps (2:00, 9:00) and specific behavior. Gestures cite approximate timestamps (3:30, 10:00) and a specific behavior. Pacing has a time range (0:30–1:30, 11:20). Pauses have an approximate timestamp (15:45). Quality is uneven across sections — vocal variety evidence is strong, gesture evidence supports an overinterpretation.',
      },
      {
        description: "Conclusion connects delivery choices to the speaker's communication strategy",
        points_possible: 25,
        points_awarded: 7,
        evidence:
          'Conclusion notes which sections were "clearest examples" but does not connect Brown\'s delivery choices to her thesis about vulnerability. "Highly skilled in most areas" is a performance evaluation, not a strategic synthesis.',
      },
      {
        description: 'Addresses all required elements of the prompt',
        points_possible: 5,
        points_awarded: 5,
        evidence:
          'Four concepts, timestamps, evaluations, and coaching present throughout. All required prompt elements addressed.',
      },
    ],
    feedback_draft:
      'Your vocal variety analysis shows real analytical instinct — the near-whisper observation with the physical lean-in effect is exactly the kind of specific, course-grounded insight this assignment is looking for. The gesture section overreaches: crossed arms during data delivery is more likely a postural habit than unconscious discomfort, and claiming it "could undercut ethos" requires more evidence than two approximate timestamps. Your synthesis needs to connect these specific choices back to Brown\'s communication goals about vulnerability.',
  },
}

// ---------------------------------------------------------------------------
// Submission scenarios (full shape used in tests)
// ---------------------------------------------------------------------------

export const submissions = {
  A: {
    body: bodyA,
    file: null,
    expectedScore: 99,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Strong — five concepts, timestamped evidence, strategic synthesis',
  },
  B1: {
    body: bodyB1,
    file: null,
    expectedScore: 37,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Minimal — three concepts, no timestamps, no coaching, no synthesis',
  },
  B2: {
    body: bodyB2,
    file: null,
    expectedScore: 72,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Partial — strong analysis + evidence, synthesis missing strategy',
  },
  B3: {
    body: bodyB3,
    file: null,
    expectedScore: 41,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Partial — correct structure but every evidence claim is a generality',
  },
  B4: {
    body: bodyB4,
    file: null,
    expectedScore: 55,
    shouldShortCircuit: false,
    shouldFlagEmpty: false,
    description: 'Mixed — one strong section, one misapplied concept, weak synthesis',
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
    file: {
      url: 'https://example.com/analysis.pdf',
      fileName: 'analysis.pdf',
      fileType: 'application/pdf',
      fileSize: 204800,
    },
    expectedScore: 0,
    shouldShortCircuit: true,
    shouldFlagEmpty: true,
    description: 'File-only — no text body, attachment present; UI flag shown',
  },
} as const
