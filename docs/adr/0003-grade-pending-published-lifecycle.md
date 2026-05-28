# Grade lifecycle: Pending and Published

A Grade row is created when the AI SpeedGrader runs — before the teacher confirms anything. It starts as a Pending Grade (`approved_at` is null) with `ai_suggested_score` and `ai_suggested_feedback` populated. The teacher can edit `final_score` and `final_feedback` freely. When the teacher clicks Approve, `approved_at` and `approved_by` are set — the Grade becomes a Published Grade and becomes visible to the student. The Submission status moves to `graded` at this moment.

The alternative was to keep the SpeedGrader result ephemeral (in memory only) and only create the Grade row on teacher approval. We rejected this because it loses the AI suggestion if the teacher navigates away before approving, and it makes the Gradebook unable to distinguish "submitted but not yet graded" from "SpeedGrader has run but teacher hasn't confirmed."

**Consequence**: there are Grade rows in the database that are not yet visible to students. Any query that surfaces grades to students must filter on `approved_at IS NOT NULL`. The AI Suggested Grade fields are read-only after creation — the teacher works on the `final_*` fields only.
