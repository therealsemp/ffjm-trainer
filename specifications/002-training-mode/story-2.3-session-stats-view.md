# User Story 2.3 — Viewing current session statistics

## Epic
EPIC 2 — Doing exercises (training)

## Actor
User in an active training session

## User Story
**As a** user in a training session,
**I want** to view the statistics of my current session at any time,
**so that** I can track my progress without interrupting my training.

## Context / Business rules
- Statistics are accessed via an icon that is permanently visible while a question is displayed (Story 2.2).
- Viewing happens in a popup/modal, without leaving the current question screen.
- The statistics displayed are for the current session only (not the profile's overall history).
- Display rule for the per-level breakdown (shared by Stories 1.5, 2.3 and 2.6): the per-level bars and the per-level figures next to them show **found / not found only**, never skipped questions. Skipping is mostly used for a question already done before, not because it's hard, so it says nothing about a level's success; the skipped total is still shown once, as an overall figure. The stored counters themselves are unchanged (skipped is still counted per level, Story 2.4); only the display leaves it out.
- Statistics layout (the same display everywhere statistics are shown: this popup, the account page's lifetime statistics, Story 1.5, and the end-of-session recap's per-level detail, Story 2.6):
  - Left-aligned, using the full content width.
  - Three **equal-width tiles** in a row, regardless of their content: success rate ("Réussite", found / answered as a percentage, "-" while nothing has been answered yet), found ("Trouvées") and not found ("Non trouvées"). The found and not-found tiles carry a colored dot in the bars' colors, which doubles as the legend (no separate legend).
  - A discreet line below with the answered and skipped totals (e.g. "22 questions répondues, 3 passées"), the only place skipped questions appear.
  - One row per level: the level code (small, lighter than headings), a bar, and the value "found / answered" (e.g. "14 / 15") in its own right-aligned column.
  - The bars keep **absolute lengths**, proportional to the level with the most answered questions, so the volume done per level stays visible (not normalized to 100% per level). Each bar is thin and rounded at both ends, split into a found segment and a not-found segment (same status colors as the progress bar, Story 2.2) separated by a small gap, and drawn over a faint track that fills the whole bar column, so every row's track ends at the same right edge. The track never extends under the value column.
  - Hovering a segment shows its exact count.
  - Which levels get a row: in a session view (this popup, the recap), every level selected for the session, even with nothing answered yet ("0 / 0"); in the lifetime view (Story 1.5), only levels with at least one found or not-found answer.

## Acceptance criteria

### Scenario 1: Accessing statistics from a question
- **Given** the user is in an active session, with a question displayed (before or after viewing the answer)
- **When** they activate the statistics icon
- **Then** a popup/modal opens over the current screen
- **And** the question screen remains unchanged in the background

### Scenario 2: Content displayed in the popup
- **Given** the statistics popup is open
- **Then** it displays, following the statistics layout above: the success rate, found and not-found totals as three equal-width tiles, the answered and skipped totals as a discreet line, and one row per selected level with its found/not-found bar and "found / answered" value (skipped questions are not shown per level)

### Scenario 3: Closing the popup
- **Given** the statistics popup is open
- **When** the user closes it
- **Then** they return exactly to the state of the question displayed before it opened (no data on the current question is lost or altered)

## Out of scope
- Statistics accumulated across several sessions or long-term history (a future evolution of the profile, outside EPIC 2).
- Exporting or sharing session statistics.

## QA notes
- Check that opening/closing the popup causes no loss of state on the current question (particularly if the answer was already shown).
- Check that the displayed numbers exactly match the saved data (see Story 2.4).
