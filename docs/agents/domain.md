# Domain Docs

How the engineering skills should consume this repo's domain documentation.

## Layout: hybrid single-context

This repo uses a root `CONTEXT.md` as a concise index, with focused context docs under `docs/context/`. It is a single Next.js + Supabase app — not a monorepo.

```
/
├── CONTEXT.md                    ← start here; read this first
├── docs/
│   ├── context/
│   │   ├── product.md            ← product thesis, MVP scope
│   │   ├── domain-model.md       ← entities, glossary, relationships
│   │   ├── ai-flows.md           ← AI feature specs
│   │   ├── security.md           ← security constraints and trust model
│   │   └── demo-scope.md         ← must-have vs nice-to-have, out-of-scope
│   └── adr/                      ← architectural decision records
│       └── 0000-template.md
└── src/
```

## Before exploring, read these

1. **`CONTEXT.md`** at the repo root — always read this first
2. **The focused `docs/context/` doc** most relevant to your task (see table in CONTEXT.md)
3. **`docs/adr/`** — read ADRs that touch the area you're about to work in

Read only what's relevant. Do not load all context docs for every task.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `docs/context/domain-model.md`. Do not drift to synonyms the glossary explicitly avoids.

If a concept you need isn't in the glossary yet, either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your implementation contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-XXXX ([title]) — but worth reopening because…_

Write a new ADR before proceeding. Use `docs/adr/0000-template.md`.
