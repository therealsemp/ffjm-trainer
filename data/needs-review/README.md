# Needs review

Questions extracted from `../raw/` by `/ingest`, waiting on human review against the source PDF before they're trusted. Layout mirrors `../raw/` and `../validated/`:

```
{year}/{phase}/qNN.json
{year}/{phase}/qNN_fig-<name>.png   (one per figure the question references)
```

This directory's content is **not committed**: the `.json` and `.png` files here are local, temporary working state (see `.gitignore` at the repo root — `data/needs-review/**/*.json` and `**/*.png`, so this applies at any depth). Only this README is tracked, so the directory's purpose survives a fresh clone even when it's empty.

Once a question is reviewed and correct, use the **Valider** button in the `/review` tool — it re-runs `shared/validate.mjs` and, if it passes, moves the question (JSON + figures) to the matching `../validated/{year}/{phase}/` folder.
