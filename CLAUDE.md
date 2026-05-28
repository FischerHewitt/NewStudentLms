# CLAUDE.md

## Agent skills

### Issue tracker

Issues live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Hybrid single-context layout: root `CONTEXT.md` as concise index, focused docs under `docs/context/`. See `docs/agents/domain.md`.

### Multi-agent coordination

Multiple AI agents (Claude, Codex, Kiro, ChatGPT, etc.) may work on this repo in parallel. Three-tier merge policy: auto-merge for low-risk issues, merge-manager agent for medium-risk, human review for schema/auth/grading/ADR changes. See `docs/agents/multi-agent.md`.

## Agent behavior rules

- **Prefer vertical slices over broad rewrites.** Implement one end-to-end slice (route → server action → DB → UI) at a time. Do not refactor unrelated code while adding a feature.
- **Do not casually rename domain concepts.** The glossary in `docs/context/domain-model.md` defines canonical terms. If a rename is warranted, propose it explicitly and update the glossary.
- **Propose an ADR before reversing major architecture or product decisions.** If your implementation contradicts an existing ADR, surface the conflict and write a new ADR in `docs/adr/` before proceeding. Use `docs/adr/0000-template.md` as the starting point.
