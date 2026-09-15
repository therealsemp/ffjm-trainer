# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Rules

1. **Never run `git commit` (or any command that creates a commit).** The user commits everything themselves. Stage changes or leave them in the working tree if helpful, but do not commit — not even when asked to "save progress" or similar unless the user explicitly says the word "commit".

## Project

FFJM Trainer — a training tool for the FFJM (Fédération Française des Jeux Mathématiques) championship, for a small/family audience. See `docs/functional-spec.md` and `docs/technical-architecture.md` for the functional and technical foundations agreed before any implementation started, and `README.md` for a day-to-day contributor overview.

Current phase: building the PDF ingestion pipeline that turns official FFJM archives into structured question data. The web app is deliberately sequenced to start only once a validated data model exists.

## Repository structure

```
/data
  /raw          → PDF sources FFJM, per year (committed)
  /needs-review → questions extracted and awaiting human review (local only, gitignored)
  /validated    → validated questions, one JSON file per question (committed) — source of truth
/ingest         → PDF → JSON conversion tooling (Node; own package.json/deps)
/review         → validation tool: small local server + UI to review needs-review against raw, then promote to validated (not built yet)
/shared         → code used by both /ingest and /review (e.g. shared/validate.mjs)
/app            → the deployed static site (not built yet)
/docs           → functional-spec.md and technical-architecture.md
```

`/data` belongs to no single tool: `/ingest` writes to `needs-review`, `/review` reads `needs-review`+`raw` and promotes to `validated`, `/app` reads `validated` at build time. Validation state is which directory a file is in, not a field inside the JSON.
