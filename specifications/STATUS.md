# Implementation status

Tracked in this one file rather than a field inside each story — same reasoning as the data model's validation state (see `docs/technical-architecture.md`): a status field scattered across 12 files is easy to forget to update, one central list isn't.

Update this file whenever a story's implementation state changes. Values: `Not started`, `In progress`, `Done`.

## EPIC 1 — Account management

| Story | Status | Notes |
|---|---|---|
| 1.1 — Detection/redirection | Done | |
| 1.2 — Profile creation | Done | |
| 1.3 — Account access and profile reset | Done | |
| 1.4 — Theme preference | Done | |
| 1.5 — Account statistics | Not started | Split out of 1.3 — blocked on EPIC 2 (nothing to show until session stats exist). Page currently shows a placeholder message. |

## EPIC 2 — Training mode

| Story | Status | Notes |
|---|---|---|
| 2.1 — Session configuration | Done | |
| 2.2 — Question flow | In progress | Draw (weighted by tier), skip/reveal/self-assess loop, and counters all work — but only metadata (year/phase/tier/number) is shown, not the real statement/answer/correction (needs markdown+KaTeX rendering, a later lot). The "number of solutions" display rule is also deferred to that lot, since it only makes sense once an answer is actually rendered. |
| 2.3 — Session stats view | Not started | |
| 2.4 — Statistics saving | Done | `trainingSessionService` persists after every action, per level. Global totals aren't stored separately — they're summed from the per-level counters on demand, same principle as not storing `tier` redundantly. |
| 2.5 — Resume or new session | Not started | Session already persists (2.4) — what's missing is the resume-vs-new decision screen. For now, opening the config page always starts fresh. |

## EPIC 3 — Archives consultation

| Story | Status | Notes |
|---|---|---|
| 3.1 — Edition selection | Not started | Same data-index dependency as 2.2. |
| 3.2 — Edition navigation | Not started | |
| 3.3 — Answer display | Not started | |
