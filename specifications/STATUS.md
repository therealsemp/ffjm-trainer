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
| 1.5 — Account statistics | Done | Lifetime cumulative stats (`trainingGlobalStats`, separate storage key from the session's own), shown via the shared `StatsSummary` component. Empty-state placeholder when nothing's been trained yet. |

## EPIC 2 — Training mode

| Story | Status | Notes |
|---|---|---|
| 2.1 — Session configuration | Done | |
| 2.2 — Question flow | Done | Full statement/answer/correction rendering (markdown + inline LaTeX via KaTeX + GFM tables, figures resolved from `![...](figure:<id>)`), the "number of solutions" rule for tiers above CM (shown alongside the statement, collapsed by default), and a short-answer box (gold accent) separated from the detailed explanation, each with its own self-assessment buttons. |
| 2.3 — Session stats view | Done | Popup (native `<dialog>`) reachable from an icon on the question screen, via the shared `StatsSummary` component. |
| 2.4 — Statistics saving | Done | Revised: every action now increments **two** independent counters (same `Stats` shape, different storage keys) — the session's own (`trainingSessionStats`, reset on a new session) and the profile's lifetime total (`trainingGlobalStats`, only reset on profile reset, see 1.5). |
| 2.5 — Resume or new session | Done | New `/entrainement` decision screen (`TrainingEntryPage`); home now links there instead of straight to configuration. |

## EPIC 3 — Archives consultation

| Story | Status | Notes |
|---|---|---|
| 3.1 — Edition selection | Not started | Same data-index dependency as 2.2. |
| 3.2 — Edition navigation | Not started | |
| 3.3 — Answer display | Not started | |
