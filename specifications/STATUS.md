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
| 2.2 — Question flow | Done | Full statement/answer/correction rendering (markdown + inline LaTeX via KaTeX + GFM tables, figures resolved from `![...](figure:<id>)`), the "number of solutions" rule for tiers above CM (shown alongside the statement, collapsed by default), and a short-answer box (gold accent) separated from the detailed explanation, each with its own self-assessment buttons. Self-assessment plays a sound (see 1.6). For a targeted session, a `SessionProgressBar` (no numeric count, just the segments) shows next to the year/phase line, and reaching the target navigates to the recap instead of drawing another question (see 2.6 for how "just completed" is tracked). |
| 2.3 — Session stats view | Done | Popup (native `<dialog>`) reachable from an icon on the question screen, via the shared `StatsSummary` component. |
| 2.4 — Statistics saving | Done | Revised: every action now increments **two** independent counters (same `Stats` shape, different storage keys) — the session's own (`trainingSessionStats`, reset on a new session) and the profile's lifetime total (`trainingGlobalStats`, only reset on profile reset, see 1.5). |
| 2.5 — Resume or new session | Done | New `/entrainement` decision screen (`TrainingEntryPage`); home now links there instead of straight to configuration. Redirects to session configuration (not the recap) when the saved session is already complete — see 2.6 for why. |
| 2.6 — Session completion and recap | Done | New `/entrainement/recap` route (`TrainingRecapPage`), with a congratulatory message shown regardless of result. Completion itself is derived (`trainingSessionService.isComplete`, based on the ordered `trainingSessionOutcomes` log, not just aggregate `Stats`), but "just completed" (recap shown once) is tracked via a dedicated storage flag (`trainingSessionJustCompleted`, set synchronously by `markJustCompleted`/read-and-cleared by the recap page) — an earlier version used React Router navigation state for this and raced against the session context's own state update, occasionally bouncing through `/entrainement` to configuration instead of showing the recap. |

## EPIC 3 — Archives consultation

| Story | Status | Notes |
|---|---|---|
| 3.1 — Edition selection | Done | New `/archives` route (`ArchiveSelectionPage`). `questionMetadataService.getAvailableEditions()` groups the manifest by year (most recent first); `PHASE_ORDER` (qf → sf → fn) is used to always render all 3 phases in a fixed 3-column grid, greying out (non-clickable) whichever phase a year has no data for, instead of only listing what exists — keeps every year's row aligned and avoids pills wrapping on narrow screens. Short page-local labels ("1/4 de Finale", "1/2 Finale", "Finale") instead of `PHASE_LABELS`' full words, which are kept for prose elsewhere. One click straight into the edition's summary (3.4). |
| 3.2 — Edition navigation | Done | New `/archives/:year/:phase/:number` route (`ArchiveQuestionPage`), `questionMetadataService.getEditionQuestions()` returns the edition sorted by `number` (the official order). Position shown as "Question K/N"; Previous/Next are plain text links (not buttons) to `number ± 1`, laid out left/right (`justify-between`), hidden at the bounds, shown above the statement and again below the answer once revealed. Out-of-category warning compares `question.categories` to the active profile's category. |
| 3.3 — Answer display | Done | A single `showAnswers` boolean local to `ArchiveQuestionPage`, defaulting to hidden — persists across Previous/Next/summary-jump since the same component instance stays mounted (only the route params change), matching "stays in effect for following questions" without extra plumbing. Rendered as an actual toggle switch (track + sliding knob), not a button, so its on/off state reads unambiguously. |
| 3.4 — Edition summary and direct navigation | Done | Dedicated page (`/archives/:year/:phase/sommaire`, `ArchiveSummaryPage`) listing every question's title/tier for the edition, linked from a labeled "Sommaire" control next to the title (an earlier icon-only version wasn't clear enough); each entry links straight to that question. Titles live only in a question's full content (not the lightweight manifest), so the page fetches every question of the edition in full via `questionService.getQuestion`, in parallel. (A first version used a `<dialog>` popup, but an unconditional `flex` utility class on it defeated the native `dialog:not([open]) { display: none }` rule, so it never actually hid — switched to a plain page instead.) |
