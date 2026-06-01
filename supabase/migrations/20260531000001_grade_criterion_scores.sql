-- Add ai_criterion_scores JSONB column to grades table.
-- Stores the structured per-criterion AI scoring output produced by the SpeedGrader:
-- [{ description, points_possible, points_awarded, evidence, anomaly_flag }]
-- Nullable: existing rows and short-circuit grades (empty submissions) remain valid.
-- See GitHub issue #81.

alter table grades
  add column if not exists ai_criterion_scores jsonb;
