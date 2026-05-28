# Feedback flattened onto Grade

We store feedback as two plain-text columns on the Grade row (`ai_suggested_feedback`, `final_feedback`) rather than a separate Feedback table. The original domain model had a dedicated Feedback entity with `authored_by` (ai | teacher) to preserve both versions independently.

We dropped the separate table because the only consumer in the MVP is the SpeedGrader UI (which needs both texts at once) and the student-facing grade view (which needs only `final_feedback`). Both are satisfied by columns on Grade with no join. The authorship-tracking use case — AI transparency logs, audit history of teacher edits — is explicitly out of scope for the hackathon.

**Consequence**: adding feedback versioning or authorship metadata later requires a schema migration to extract these columns into a Feedback table.
