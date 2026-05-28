# AI Flows

The three core AI-powered features of the LMS.

## 1. Syllabus-to-Course Generator

**Trigger**: Teacher pastes raw syllabus text and clicks Generate.

**Input**: Raw syllabus text (string).

**AI task**: Parse the syllabus and produce a structured Course with Modules and Assignments.

**Output schema**:
```json
{
  "title": "string",
  "modules": [
    {
      "title": "string",
      "week_number": "number",
      "description": "string",
      "assignments": [
        {
          "title": "string",
          "instructions": "string",
          "due_date": "ISO date string",
          "points_possible": "number",
          "rubric": {
            "criteria": [
              { "description": "string", "points": "number" }
            ]
          }
        }
      ]
    }
  ]
}
```

**Key principle**: AI generates a first draft. The teacher reviews and can edit before saving to the database.

**Implementation**: Use Vercel AI SDK `streamObject` to stream the generated structure into React state. When streaming completes, write the full JSON to `Course.generation_preview` (JSONB). The teacher reviews and edits in the UI — edits stay in React state. On Save, the server explodes `generation_preview` into normalized Module, Assignment, and Rubric rows. If the teacher closes the tab after streaming but before saving, `generation_preview` preserves the AI output for recovery.

---

## 2. AI SpeedGrader

**Trigger**: Teacher clicks "Run AI SpeedGrader" on a Submission page. If the teacher's `speedgrader_autorun` preference is enabled, the AI runs automatically on open instead.

**Input**: Submission body + Assignment instructions + Rubric criteria.

**AI task**: Evaluate the Submission against the Rubric and produce an AI Suggested Grade and a Feedback draft.

**Output**:
- `ai_suggested_score` — number from 0 to `points_possible`
- `rationale` — explanation of the score relative to the Rubric
- `feedback_draft` — message addressed to the student

**Key principle**: AI gives the first draft. Teacher approves, edits, or overrides. The Final Grade is always teacher-controlled. The AI Suggested Grade is never auto-applied.

**Implementation**: Use Vercel AI SDK structured object generation (`generateObject` or `streamObject`). Streaming is preferable for the teacher UI so the score and feedback appear incrementally.

---

## 3. AI Student Coach

**Trigger**: Student opens an Assignment and asks for help.

**Input**: Assignment instructions + student's current draft body (if any) + the student's question.

**AI task**: Help the student understand the Assignment, brainstorm, or outline — without writing the final Submission for them.

**Guardrails**:
- Never produce text the student can submit verbatim as their answer
- Frame responses as coaching: "Here's how to think about this..." not "Here's the answer..."
- Use Socratic questions to guide the student toward their own conclusions
- If the student explicitly asks the coach to write their answer, decline and redirect

**Implementation**: Use Vercel AI SDK `streamText` with a system prompt that enforces the coaching role and embeds the Assignment instructions as context.
