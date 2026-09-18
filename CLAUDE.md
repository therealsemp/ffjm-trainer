# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Rules

1. **Never run `git commit` (or any command that creates a commit).** The user commits everything themselves. Stage changes or leave them in the working tree if helpful, but do not commit — not even when asked to "save progress" or similar unless the user explicitly says the word "commit".
2. **Before transcribing a PDF (statement/correction) into a question JSON, read `ingest/TRANSCRIPTION-GUIDE.md`.** There's no deterministic extraction script — the transcription is done by reading the PDF directly and writing the JSON by hand, and that guide documents recurring mistakes (flattened lists, condensed reasoning, missed figures) to avoid repeating.
3. **Language split: code in English, user-facing UI text in French, no exceptions.** All code, identifiers, comments, commit messages, and specifications/stories are written in English. Everything a user of the deployed `/app` actually sees (labels, buttons, messages) is hardcoded in French — the FFJM audience is exclusively French-speaking. There is no i18n/translation layer and no language switcher; do not add one or design for future multilingual support.
4. **Never use an em dash (—) in `/app` UI labels/copy.** Use a comma, colon, or parentheses instead. Doesn't apply to code comments or docs/specifications prose — only to text actually rendered to the user.
5. **Before running your own `npm run dev`/`build`/`build-data` in `/app`, check for and stop any dev server already running** (e.g. `ss -ltnp | grep 5173` or `ps aux | grep -i vite`) — the user may have one open for their own live testing, and a concurrent run can race on `app/public/data/` or collide on the port. Do all your verification while it's stopped, then start a fresh `npm run dev` for the user once you're done, so they can just refresh their browser instead of restarting it themselves.

## Project

FFJM Trainer — a training tool for the FFJM (Fédération Française des Jeux Mathématiques) championship, for a small/family audience. See `docs/functional-spec.md` and `docs/technical-architecture.md` for the functional and technical foundations agreed before any implementation started, `specifications/` for the detailed user-facing epics/stories that `/app` will implement, and `README.md` for a day-to-day contributor overview.

Current phase: building the PDF ingestion pipeline that turns official FFJM archives into structured question data. The web app is deliberately sequenced to start only once a validated data model exists.

## Repository structure

```
/data
  /raw          → PDF sources FFJM, {year}/{phase}/ (committed)
  /needs-review → questions extracted and awaiting human review, {year}/{phase}/qNN.json (local only, gitignored)
  /validated    → validated questions, {year}/{phase}/qNN.json (committed) — source of truth
/ingest         → PDF → JSON conversion tooling (Node; own package.json/deps); see TRANSCRIPTION-GUIDE.md
/review         → validation tool: small local server + UI to review needs-review against raw, then promote to validated
/shared         → code used by both /ingest and /review (e.g. shared/validate.mjs)
/app            → the deployed static site (not built yet)
/docs           → functional-spec.md and technical-architecture.md
/specifications → user-facing epics/stories for /app, one subdirectory per epic, one file per story (English; see specifications/README.md)
```

All three areas under `/data` share the same `{year}/{phase}/` layout (sized for the eventual scale — potentially 1000+ question files, unworkable flat in one directory). `raw/` keeps full descriptive filenames (`2026_qf_statement.pdf`) since those are source files that may travel outside their directory; `needs-review/`/`validated/` use short filenames (`q01.json`, `q01_fig-grid.png`) since the path already carries year/phase and these files never leave their directory.

`/data` belongs to no single tool: `/ingest` writes to `needs-review`, `/review` reads `needs-review`+`raw` and promotes to `validated`, `/app` reads `validated` at build time. Validation state is which directory a file is in, not a field inside the JSON.
