# Multi-Agent Coordination

This project is designed to be worked on by multiple AI coding agents in parallel — Claude, Codex, Kiro, ChatGPT, or others. This document explains how agents should coordinate so parallel work stays safe and reviewable, even without deep human involvement in every PR.

---

## Shared sources of truth

Before starting any task, every agent must know where to find authoritative information:

| File / Directory | What it is |
|-----------------|------------|
| `CONTEXT.md` | Root orientation. Always read this first. |
| `docs/context/` | Focused docs: product scope, domain model, AI flows, security, demo scope. Read only what's relevant to the task. |
| `docs/adr/` | Architectural decisions. Do not reverse these without proposing a new ADR. |
| `docs/agents/` | Workflow rules for agents (this file and siblings). |
| GitHub Issues | The task queue. Agents work from issues, not vague instructions. |

---

## Multi-agent rules

- **Work from GitHub Issues.** Do not start work without a specific issue. Vague instructions like "improve the grading page" are not enough.
- **One issue per branch.** Each agent takes one small vertical issue and works on its own branch. Do not bundle multiple issues into one branch.
- **Avoid file collisions.** Before starting, check which files other active branches are touching (visible in open PRs). Avoid editing the same files as another active agent when possible.
- **Read before writing.** Read `CONTEXT.md` first, then only the focused docs relevant to the issue. Do not load all docs for every task.
- **Do not rename domain concepts.** The glossary in `docs/context/domain-model.md` is canonical. If a rename is genuinely warranted, propose it explicitly and update the glossary — do not silently rename in code.
- **Do not reverse ADRs.** If your implementation contradicts an existing ADR in `docs/adr/`, surface the conflict and write a new ADR before proceeding. Use `docs/adr/0000-template.md`.
- **Keep changes small.** Changes should be reviewable by a human in a few minutes. If a change touches many unrelated files, it is too large.
- **Run checks before handing off.** Run lint, typecheck, and tests locally before opening a PR.

---

## Preferred workflow (8 steps)

1. **Choose or create a GitHub Issue.** The issue must have a clear acceptance criterion. If it doesn't, add one or ask for clarification.
2. **Confirm the issue is `ready-for-agent`.** Check that it has the `ready-for-agent` label. If it has `needs-info` or `needs-triage`, do not start — surface it for human review first.
3. **Create a branch for that issue.** Name it `issue-<number>-short-slug`, e.g. `issue-12-submission-form`.
4. **Read `CONTEXT.md` and the relevant focused doc.** For a grading task, read `docs/context/ai-flows.md`. For a schema task, read `docs/context/domain-model.md`. Do not read docs unrelated to the issue.
5. **Implement only that issue.** Do not fix unrelated things. If you notice something broken outside the issue scope, open a follow-up issue and note it in your PR summary.
6. **Run local checks.** At minimum: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Fix any failures before proceeding.
7. **Summarize your work.** Write a clear summary of: changed files, what each change does, tests run, and any follow-up issues you noticed.
8. **Open a PR.** The PR triggers CI. Merge only after CI passes — see the merge policy below.

---

## Merge policy

Agents must not push directly to `main`. Every change goes through a branch and a PR.

### How to open a PR (plain-language version)

If you are not comfortable with the GitHub UI, agents can open PRs for you via the `gh` CLI:

```bash
gh pr create \
  --title "Short description of the change" \
  --body "Summary of changed files, tests run, and any follow-up issues."
```

Once the PR is open, CI runs automatically. You can check its status with:

```bash
gh pr checks
```

When CI passes and the change qualifies for auto-merge (see below), an agent can merge it:

```bash
gh pr merge <number> --squash --delete-branch
```

You never need to touch the GitHub website. Everything can be done via `gh` commands that agents can run on your behalf.

---

### Tier 1 — Auto-merge (low-risk)

An agent may merge automatically when **all** of the following are true:

- [ ] CI passes (lint + typecheck + test + build all green)
- [ ] The branch has no merge conflicts with `main`
- [ ] The issue is small and vertical (one slice, one concern)
- [ ] The agent changed only files directly relevant to the issue
- [ ] The change does **not** touch any of the following:
  - Supabase schema or migrations
  - Row Level Security (RLS) policies
  - Authentication or authorization logic
  - Grade publishing logic (`approved_at`, `final_score`, `final_feedback`)
  - AI grading behavior or prompts
  - API key handling or environment variables
  - ADRs in `docs/adr/`
  - Large cross-cutting refactors
- [ ] The agent has provided a clear summary of changed files and tests run

If all boxes are checked, the agent merges with `gh pr merge --squash --delete-branch`.

---

### Tier 2 — Merge-manager review (medium-risk)

For changes that do not qualify for auto-merge but are not in the human-required list, use a **merge-manager agent**. The merge-manager is a separate agent instance that acts as a lightweight gatekeeper.

The merge-manager agent should:

1. Read the PR summary and check which files changed
2. Confirm CI passed (`gh pr checks`)
3. Confirm the change satisfies the issue's acceptance criteria
4. Merge one branch at a time with `gh pr merge --squash --delete-branch`
5. Run the app locally after merge if possible and note any visible regressions
6. Create follow-up GitHub Issues for anything unfinished or noticed during review

The merge-manager does **not** need to deeply understand the code. It checks process, not correctness.

---

### Tier 3 — Human review required

The following changes always require a human to read and approve before merging, no exceptions:

- Supabase schema changes (new tables, column changes, migrations)
- Row Level Security (RLS) policies
- Authentication or authorization code
- Grade publishing logic (anything touching `approved_at`, `final_score`, `final_feedback`, or Submission `status → graded`)
- AI grading behavior (SpeedGrader prompts, scoring logic)
- API key handling or `.env` changes
- Major architecture changes
- ADR changes or reversals
- Large changes touching many unrelated files

For these, the agent opens the PR, writes a clear summary, and adds the `ready-for-human` label. The human reviews and merges manually via `gh pr merge` or the GitHub UI.

---

## CI requirement

Every PR must pass the CI workflow before it is eligible for any merge tier. See `.github/workflows/ci.yml` for the full workflow.

The CI runs:
1. Install dependencies
2. Lint (`npm run lint`)
3. Typecheck (`npm run typecheck`)
4. Test (`npm test`)
5. Build (`npm run build`)

An agent may not merge or request merge until all five steps are green. If CI fails, fix the failure on the same branch and push again — do not skip or ignore failing checks.
