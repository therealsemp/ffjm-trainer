# Needs review

Questions extracted from `../raw/` by `/ingest`, waiting on human review against the source PDF before they're trusted. One JSON file per question, plus a PNG per figure it references — same shape as `../validated/`.

This directory's content is **not committed**: the `.json` and `.png` files here are local, temporary working state (see `.gitignore` at the repo root). Only this README is tracked, so the directory's purpose survives a fresh clone even when it's empty.

Once a question is reviewed and correct, it moves to `../validated/` (currently a manual step; the `/review` tool will do this from a UI once it exists).
