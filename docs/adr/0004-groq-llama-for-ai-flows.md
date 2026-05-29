# ADR-0004: Groq / Llama 3.3 for AI flows

**Date**: 2026-05-28
**Status**: Accepted

## Context

The PRD specified Claude (via `@ai-sdk/anthropic`) as the AI model for both the course generator and SpeedGrader. During development the Anthropic API key was unavailable in the local environment, blocking iteration. Groq provides a free-tier API with fast inference and full Vercel AI SDK compatibility.

## Decision

Both AI flows — `POST /api/generate-course` and `runSpeedGrader` — use `@ai-sdk/groq` with `llama-3.3-70b-versatile` instead of Anthropic Claude. The `streamObject` call in the course generator sets `mode: 'tool'` because Groq requires tool-call mode for structured object generation (it does not support the `json` output mode).

`@ai-sdk/anthropic` remains in `package.json`; switching back is a one-line model swap in each file.

## Consequences

- **Positive**: unblocks local development and demo iteration without an Anthropic key; Groq inference is fast (low latency for streaming demo).
- **Negative / trade-offs**: output quality and instruction-following may differ from Claude, especially for complex rubric-grounded grading. The PRD and pitch narrative reference "Claude via Vercel AI SDK" — this should be corrected or the swap made explicit before the hackathon demo.
- **Risks**: Groq free tier has rate limits that could interrupt a live demo. If a `GROQ_API_KEY` is not set in the Vercel environment, both AI flows will fail silently. Restore Claude before deploying to production or presenting to judges if an Anthropic key is available.
