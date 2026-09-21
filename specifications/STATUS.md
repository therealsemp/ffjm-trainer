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
| 1.5 — Account statistics | Done | Lifetime cumulative stats (`trainingGlobalStats`, separate storage key from the session's own), shown via the shared `StatsSummary` component (per-tier horizontal stacked bars, colorblind-safe status palette validated with the dataviz skill's script). Empty-state placeholder when nothing's been trained yet. |
| 1.6 — Sound feedback preference | Done | `Profile.soundEnabled` (optional, defaults to `true` including for pre-existing profiles with no stored value). Toggle button on the account page, next to the theme control. Sounds themselves preloaded once (`soundEffects.ts`) and reused rather than recreated per play. |

## EPIC 2 — Training mode

| Story | Status | Notes |
|---|---|---|
| 2.1 — Session configuration | Done | Updated: also chooses the session length (5/10/15/20 presets or "Sans limite", default 10), stored as `TrainingSession.targetCount` (`null` = no limit). |
| 2.2 — Question flow | Done | Full statement/answer/correction rendering (markdown + inline LaTeX via KaTeX + GFM tables, figures resolved from `![...](figure:<id>)`), the "number of solutions" rule for tiers above CM (shown alongside the statement, collapsed by default), and a short-answer box (gold accent) separated from the detailed explanation, each with its own self-assessment buttons. Self-assessment plays a sound (see 1.6). For a targeted session, a `SessionProgressBar` (no numeric count, just the segments) shows next to the year/phase line, and reaching the target navigates to the recap (`{ state: { justCompleted: true } }`) instead of drawing another question. |
| 2.3 — Session stats view | Done | Popup (native `<dialog>`) reachable from an icon on the question screen, via the shared `StatsSummary` component. |
| 2.4 — Statistics saving | Done | Revised: every action now increments **two** independent counters (same `Stats` shape, different storage keys) — the session's own (`trainingSessionStats`, reset on a new session) and the profile's lifetime total (`trainingGlobalStats`, only reset on profile reset, see 1.5). |
| 2.5 — Resume or new session | Done | New `/entrainement` decision screen (`TrainingEntryPage`); home now links there instead of straight to configuration. Redirects to session configuration (not the recap) when the saved session is already complete — see 2.6 for why. |
| 2.6 — Session completion and recap | Done | New `/entrainement/recap` route (`TrainingRecapPage`), with a congratulatory message shown regardless of result. Completion itself is derived (`trainingSessionService.isComplete`, based on the ordered `trainingSessionOutcomes` log, not just aggregate `Stats`), but "just completed" (recap shown once) is tracked via a dedicated storage flag (`trainingSessionJustCompleted`, set synchronously by `markJustCompleted`/read-and-cleared by the recap page) — an earlier version used React Router navigation state for this and raced against the session context's own state update, occasionally bouncing through `/entrainement` to configuration instead of showing the recap. |

## EPIC 3 — Archives consultation

| Story | Status | Notes |
|---|---|---|
| 3.1 — Edition selection | Not started | Same data-index dependency as 2.2. |
| 3.2 — Edition navigation | Not started | |
| 3.3 — Answer display | Not started | |
