# FFJM Trainer

A training tool for the FFJM (Fédération Française des Jeux Mathématiques) championship, built on the real official archives, for family/personal use.

See [`docs/functional-spec.md`](docs/functional-spec.md) (functional scope) and [`docs/technical-architecture.md`](docs/technical-architecture.md) (technical decisions) for the full context.

## Project status

- **PDF ingestion pipeline** — in progress, usable: turns FFJM archives into structured question data (see below).
- **Review/validation tool** — available: reviews and validates that data before it feeds the web app.
- **Web app** (`/app`) — implemented and deployed: account management, training mode, and archive consultation are all built (see [`specifications/STATUS.md`](specifications/STATUS.md) for the detailed story-by-story status).

## Repository structure

```
/data
  /raw          FFJM PDF sources, laid out {year}/{phase}/ (committed)
  /needs-review extracted questions awaiting human review, {year}/{phase}/qNN.json (local, gitignored)
  /validated    validated questions, {year}/{phase}/qNN.json (committed) — source of truth
/ingest         PDF -> JSON conversion (Node, own dependencies)
/review         validation tool: small local server + UI
/shared         code used by both /ingest and /review (e.g. validate.mjs)
/app            deployed static site (React + Vite + TypeScript)
/docs           functional and technical specifications
/specifications epics/stories describing /app's expected behavior, one subdirectory per epic (see specifications/README.md)
```

`/data` belongs to no single tool: `/ingest` writes to it (`needs-review`), the review tool reads and promotes files (`needs-review` -> `validated`), `/app` reads `validated` at build time. A question's validation state is which directory it's in, not a field inside its JSON.

## Ingestion pipeline (`/ingest`)

```bash
cd ingest
npm install
node render-page.mjs <pdf> <page> <scale> <out.png>        # render a page as an image, to locate a figure
node crop-figure.mjs <pdf> <page> <x> <y> <w> <h> <out.png> # extract a precise figure as a PNG
```

Transcribing a PDF's text/math into structured JSON is done with the help of a model that can read PDFs directly (see `docs/technical-architecture.md`), not by a one-shot script.

## Manual data review (`/review`)

Once questions are extracted into `data/needs-review/`, they need a human review before joining `data/validated/` — the (AI-assisted) ingestion pipeline can make mistakes, especially on figures and math.

The review tool is a small local web app (server + UI, `express` as its only dependency) that displays the rendered question (statement, expected answer, correction, with math and figures) next to the source PDF, with tabs to switch between the statement and the detailed solution(s). A **Validate** button re-runs schema validation and, if it passes, moves the question (JSON + figure PNGs) into `data/validated/`.

Starting the tool:

```bash
cd review
npm install
npm start
```

Then open **http://localhost:5175** in a browser. The port can be changed: `node server.mjs <port>`.

This is a development tool, not a feature of the final app — it only ever runs on the reviewer's own machine.

## Validating a question from the command line

```bash
node shared/validate.mjs data/needs-review/*/*/*.json
```

Checks the JSON's structure, the presence of categories/coefficients, and that every referenced figure/source PDF (`imageUrl`, `sourceFiles`) actually exists at the given relative path. Same validation as the review tool's "Validate" button — useful to check several files at once without going through the UI.

## Web application (`/app`)

The deployed static site: React 19 + Vite + TypeScript, Tailwind CSS v4, React Router. No backend — all state (profile, training sessions, stats, preferences) lives in the browser's `localStorage`. See `docs/technical-architecture.md` for the full design (service layer, data model, theming, deployment) and `specifications/` for the detailed, story-by-story functional behavior.

It covers three areas:
- **Account management** — local profile (name + FFJM category), light/dark/system theme, sound feedback preference, lifetime training statistics, profile reset.
- **Training mode** — configurable sessions (levels + optional target question count), questions drawn at random and weighted by official level coefficients, self-assessment, session and lifetime stats, resuming an in-progress session or reviewing a completed one's recap.
- **Archive consultation** — browsing a past edition (year + phase) question by question in official order, or jumping directly to one via a summary, with a global answer show/hide switch.

Running it locally:

```bash
cd app
npm install
npm run dev
```

`npm run dev`/`npm run build` first regenerate `app/public/data/` from `data/validated/` (see `app/scripts/build-data-index.mjs`) — the app never reads `/data` directly at runtime, only this build-time manifest + mirrored question files.

Deployment is tag-triggered: pushing a semantic-version git tag (`vX.Y.Z`) runs the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds the app and publishes it to GitHub Pages. A plain push to `main` deploys nothing.

## Data license

The PDFs in `/data/raw`, and content derived from them, belong to the FFJM. Strictly private/family use for now; any wider publication would require the federation's prior authorization.
