# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Rules

1. **Never run `git commit` (or any command that creates a commit).** The user commits everything themselves. Stage changes or leave them in the working tree if helpful, but do not commit — not even when asked to "save progress" or similar unless the user explicitly says the word "commit".

## Project

FFJM Trainer — a training tool for the FFJM (Fédération Française des Jeux Mathématiques) championship, for a small/family audience. See `docs/functional-spec.md` and `docs/technical-architecture.md` for the functional and technical foundations agreed before any implementation started.

Current phase: building the PDF import pipeline (`/pipeline`) that turns official FFJM archives into structured exercise data (`/data`). The web app (`/app`) is deliberately sequenced to start only once a validated data model exists.
