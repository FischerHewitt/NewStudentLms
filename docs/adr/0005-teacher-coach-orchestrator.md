# ADR-0005: Teacher Coach as Orchestrator with Pluggable Sub-agents

**Date**: 2026-05-29
**Status**: Accepted

## Context

The product needs a teacher-facing AI surface. Two AI flows already exist (SpeedGrader and
Course Generator) but each is invoked directly from its own page with no shared entry point.
As the feature set grows, wiring new AI capabilities directly into individual pages produces
a fragmented teacher experience and makes each new AI feature a standalone integration effort.

A general-purpose Teacher Coach was proposed: a collapsible sidebar chat panel available on
every teacher page, mirroring the existing StudentCoach pattern. The question was whether this
coach should be a narrow grading assistant or a general orchestrator capable of routing to
multiple specialized sub-agents.

## Decision

The Teacher Coach is an **orchestrator agent** that delegates to specialized sub-agents via
tool use. Each sub-agent is registered as a named tool with a description. The orchestrator
LLM reads the teacher's message, selects the appropriate tool, and invokes the sub-agent.

Currently implemented sub-agents:
- **SpeedGrader agent** — AI grading for a submitted assignment
- **Course Generator agent** — generates modules, assignments, and rubrics from a syllabus

Planned but not yet implemented:
- Grill Me (grading calibration)
- Gradebook summarizer
- Assignment advisor (rubric improvement)

Adding a new sub-agent requires: (1) implementing the sub-agent logic, (2) registering it as
a tool on the orchestrator with a clear description and input schema. No changes to the
orchestrator routing logic itself.

The Teacher Coach sidebar is the only entry point for teacher-facing AI. Direct page-level
AI buttons (e.g. the current "AI Suggest" button in SpeedGrader) are kept for now as
shortcuts but are considered redundant UI once the Coach is fully built out.

## Consequences

- **Positive**: Single extensible entry point for all teacher AI features. New sub-agents
  slot in without touching the orchestrator. Consistent UX — teachers learn one interface.
- **Positive**: Mirrors the Claude tool-use pattern, which the codebase already uses via
  `@ai-sdk/groq`. Sub-agent registration follows the same schema.
- **Negative / trade-offs**: Adds one extra LLM hop (orchestrator classifies intent, then
  sub-agent executes). Latency increases slightly for every teacher AI interaction.
- **Negative / trade-offs**: Orchestrator routing can misfire on ambiguous messages.
  Edge cases (e.g. "help me with this" with no context) need a fallback response.
- **Risks**: Sub-agent tool descriptions must be kept accurate as sub-agents evolve —
  stale descriptions cause misrouting. Treat tool descriptions as load-bearing contracts.
