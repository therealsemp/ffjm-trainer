# Validated questions

This is the source of truth: one JSON file per question (plus its figure PNGs, if any), committed to the repo. This is what `/app` will read at build time. Layout mirrors `../raw/` and `../needs-review/`: `{year}/{phase}/qNN.json`.

A file lands here only after a human has reviewed it against the source PDF in `../raw/`. Files waiting on that review live in `../needs-review/` instead (see its own README — that directory's content isn't committed, only validated files are).

Naming and schema: see `/shared/validate.mjs` (validation rules) and `docs/technical-architecture.md` (data model).
