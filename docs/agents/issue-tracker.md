# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub Issues. Use the `gh` CLI for all operations.

> **First-time setup**: This repo has no GitHub remote yet. Run `gh repo create` to create one, then `git remote add origin <url>` to connect it.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

`gh` infers the repo from `git remote -v` when run inside the clone.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## CI status

Every PR must pass `.github/workflows/ci.yml` before merging. Check with `gh pr checks`. See `docs/agents/multi-agent.md` for the full merge policy and tier rules.
