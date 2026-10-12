# User Story 2.2 — Question flow

## Epic
EPIC 2 — Doing exercises (training)

## Actor
User in an active training session

## User Story
**As a** user in a training session,
**I want** to see a question drawn at random from among the selected levels, answer it at my own pace, then move to the next one,
**so that** I can train without time pressure and honestly self-assess.

## Context / Business rules
- A question is drawn at random from among the levels selected for the session, weighted by each level's official coefficient, renormalized over the selected levels only. "Level" here means the question's `tier` (its native level), not `categories` (the cumulative list of categories that have access to it) — the pool for a given level is exactly the questions whose `tier` equals that level.
- The coefficients are **incremental per tier** (how many questions natively belong to that tier), not the cumulative total a candidate of that category answers overall: CE=5, CM=3, C1=3, C2=3, L1/GP=2, L2/HC=2. (For reference, the cumulative totals — CE=5, CM=8, C1=11, C2=14, L1/GP=16, L2/HC=18 — are what a candidate of each category actually answers end to end, since they also get every lower tier's questions; but that cumulative figure is the wrong number to weight a single tier's own pool by.)
- A question never comes up twice in the same session: every question the user has acted on ("Already done", "I found it" or "I didn't find it") is excluded from the session's later draws. A question that was only displayed, with no action on it (e.g. the session was left and later resumed, Story 2.5), is not excluded. The list of questions acted on is saved with the session and reset when a new session starts.
- A level with no question left to draw is dropped from the draw, and the weighting is renormalized over the levels that still have some. Once every question of the selected levels has been acted on (only possible in a "No limit" session, the smallest level holding several dozen questions), a new round starts silently: the list of questions acted on is emptied, except for the question just acted on, so it doesn't come right back.
- No time limit is imposed on a question.
- The user can skip a question at any time, including after having viewed the answer, with the "Already done" action (label "Déjà fait"). The label reflects its main use: moving past a question the user has already done before (see Story 2.7); the question is still counted as "skipped".
- Whenever the displayed question's `tier` is strictly above CM (i.e. C1, C2, L1/GP, or L2/HC), the FFJM "number of solutions" instruction must be shown alongside the **statement**, not the answer (see `functional-spec.md`) — it tells the user what's expected of a complete answer *before* they attempt it, not after. This is a display rule derived from `tier`, not a stored field, and does not apply to CE/CM questions.
- Self-assessing a question plays a short sound effect, distinct for "I found it" versus "I didn't find it", unless the user has turned sounds off (see Story 1.6). Exception: the self-assessment that completes a targeted session plays no sound, since the end-of-session screen plays the rank's own sound instead (Story 2.7).
- "I didn't find it" also records the question in the profile's mistakes list, and "I found it" removes it from that list if it was there (Story 4.1).
- A bookmark next to the question's title lets the user add it to (or remove it from) their favorites, without affecting the session (Story 4.2).
- If the session has a target question count (Story 2.1), a progress bar is shown with one segment per question of that target, filled in order as each question is self-assessed: green for "found", orange for "not found". A skipped question does not fill a segment at all — it's neither counted nor does it advance the bar. Nothing is shown for a "No limit" session.
- Once self-assessing a question brings the session to its target count, the session ends there instead of drawing another question — see Story 2.6.
- A question with no detailed correction (only a results-only source, see Story 2.1's toggle) shows the short answer only — no "Explication détaillée" section, and no second copy of the self-assessment buttons (the short-answer box's own buttons are the only assessment action for that question).

## Acceptance criteria

### Scenario 1: Displaying a new question
- **Given** the user is in an active session with selected levels
- **When** a question needs to be displayed (session start or after an action on the previous question)
- **Then** a question is drawn at random from among the selected levels, with a probability proportional to each level's coefficient
- **And** the statement (text + optional image) is displayed
- **And**, if the question's `tier` is strictly above CM, the FFJM "number of solutions" instruction is shown alongside the statement
- **And** two actions are available: "Already done" and "See the answer and explanations"
- **And** no timer is displayed or started

### Scenario 2: Skipping the question without viewing the answer
- **Given** a question is displayed without the answer having been viewed
- **When** the user activates "Already done"
- **Then** the question is counted as "skipped"
- **And** a new question is drawn at random following the same rules

### Scenario 3: Viewing the answer
- **Given** a question is displayed
- **When** the user activates "See the answer and explanations"
- **Then** the (short) answer is displayed
- **And** the explanations are also displayed, with no further action required — unless the question has no detailed correction (Scenario 3bis)
- **And** two buttons appear below the answer: "I found it" and "I didn't find it"
- **And** the "Already done" option remains available

### Scenario 3bis: Viewing the answer of a question with no detailed correction
- **Given** a question with no detailed correction is displayed (only included in the draw because Story 2.1's toggle was turned on)
- **When** the user activates "See the answer and explanations"
- **Then** the (short) answer is displayed
- **And** no "Explication détaillée" section is shown at all
- **And** only one copy of "I found it"/"I didn't find it" appears (below the short answer)

### Scenario 4: Positive self-assessment
- **Given** the answer and explanations are displayed
- **When** the user activates "I found it"
- **Then** the question is counted as "done / found" for its level
- **And**, unless sounds are turned off (Story 1.6), the "found" sound effect plays
- **And**, if the session has a target question count and this brings it to that target, the session ends (Story 2.6) instead of drawing another question
- **And** otherwise, a new question is drawn at random following the same rules, and if a progress bar is shown, its next segment fills green

### Scenario 5: Negative self-assessment
- **Given** the answer and explanations are displayed
- **When** the user activates "I didn't find it"
- **Then** the question is counted as "done / not found" for its level
- **And**, unless sounds are turned off (Story 1.6), the "not found" sound effect plays
- **And**, if the session has a target question count and this brings it to that target, the session ends (Story 2.6) instead of drawing another question
- **And** otherwise, a new question is drawn at random following the same rules, and if a progress bar is shown, its next segment fills orange

### Scenario 6: Skipping after viewing the answer
- **Given** the answer and explanations are displayed
- **When** the user activates "Already done"
- **Then** the question is counted as "skipped" (and not as done)
- **And** a new question is drawn at random following the same rules

### Scenario 7: No repeat within a session
- **Given** the user has acted on a question ("Already done", "I found it" or "I didn't find it") in the current session
- **When** any later question of the same session is drawn, including after leaving and resuming the session (Story 2.5)
- **Then** that question is never drawn again
- **And** a level whose questions have all been acted on is no longer drawn, the weighting being renormalized over the remaining levels

### Scenario 8: Every question of the selected levels has been acted on
- **Given** a "No limit" session in which the user has acted on every question of the selected levels
- **When** the next question is drawn
- **Then** a new round starts with no message: every question of the selected levels can be drawn again
- **And** the question just acted on is not the one drawn

## Out of scope
- Excluding questions across sessions (e.g. never offering a question already done in a previous session): the exclusion only applies within one session.
- Timing or a time limit per question.
- Viewing session statistics (see Story 2.3).
- What the end-of-session screen looks like, and what happens to a completed session afterward (see Story 2.6).

## QA notes
- Check that weighting follows the official coefficients renormalized, over a significant sample of draws (statistical test).
- Check that a question acted on never comes up again in the same session, including after resuming it, and that it can come up again in a new session.
- Check, with a "No limit" session restricted to a small level and the "Solutions détaillées" toggle on, that once the whole level has been acted on, the session keeps drawing questions (new round) and never shows the last question twice in a row.
- Check that none of the three final actions ("Already done", "I found it", "I didn't find it") leaves the interface stuck without a transition to a new question, except reaching the target count, which ends the session instead.
- Check that the "number of solutions" instruction appears for C1/C2/L1/GP/L2/HC questions and never for CE/CM questions, based on `tier` and not on `categories`.
- Check that no sound plays for either self-assessment button when the sound preference (Story 1.6) is off.
- Check that skipping never fills a progress bar segment and never counts toward the target, at any point in the session (including as the very next action after the second-to-last answered question).
- Check that no progress bar is shown for a "No limit" session.
- Check that a question with no detailed correction never shows an "Explication détaillée" section and never duplicates the self-assessment buttons, whether or not the answer has a `value`.
