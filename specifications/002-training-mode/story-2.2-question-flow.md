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
- A question is drawn at random from among the levels selected for the session, weighted by each level's official coefficient (number of puzzles in the real contest: CE=5, CM=8, C1=11, C2=14, L1=16, GP=16, L2=18, HC=18), renormalized over the selected levels only. "Level" here means the question's `tier` (its native level), not `categories` (the cumulative list of categories that have access to it) — the pool for a given level is exactly the questions whose `tier` equals that level.
- Repeating a question already seen in the session is allowed: each draw is made over the full set of questions in the selected levels, with no exclusion of questions already seen.
- No time limit is imposed on a question.
- The user can skip a question at any time, including after having viewed the answer.
- Whenever the displayed question's `tier` is strictly above CM (i.e. C1, C2, L1/GP, or L2/HC), the FFJM "number of solutions" instruction must be shown alongside the answer and explanations (see `functional-spec.md`). This is a display rule derived from `tier`, not a stored field, and does not apply to CE/CM questions.

## Acceptance criteria

### Scenario 1: Displaying a new question
- **Given** the user is in an active session with selected levels
- **When** a question needs to be displayed (session start or after an action on the previous question)
- **Then** a question is drawn at random from among the selected levels, with a probability proportional to each level's coefficient
- **And** the statement (text + optional image) is displayed
- **And** two actions are available: "Skip" and "See the answer and explanations"
- **And** no timer is displayed or started

### Scenario 2: Skipping the question without viewing the answer
- **Given** a question is displayed without the answer having been viewed
- **When** the user activates "Skip"
- **Then** the question is counted as "skipped"
- **And** a new question is drawn at random following the same rules

### Scenario 3: Viewing the answer
- **Given** a question is displayed
- **When** the user activates "See the answer and explanations"
- **Then** the (short) answer is displayed
- **And** the explanations are also displayed, with no further action required
- **And** two buttons appear below the answer: "I found it" and "I didn't find it"
- **And** the "Skip" option remains available
- **And**, if the question's `tier` is strictly above CM, the FFJM "number of solutions" instruction is shown alongside the answer and explanations

### Scenario 4: Positive self-assessment
- **Given** the answer and explanations are displayed
- **When** the user activates "I found it"
- **Then** the question is counted as "done / found" for its level
- **And** a new question is drawn at random following the same rules

### Scenario 5: Negative self-assessment
- **Given** the answer and explanations are displayed
- **When** the user activates "I didn't find it"
- **Then** the question is counted as "done / not found" for its level
- **And** a new question is drawn at random following the same rules

### Scenario 6: Skipping after viewing the answer
- **Given** the answer and explanations are displayed
- **When** the user activates "Skip"
- **Then** the question is counted as "skipped" (and not as done)
- **And** a new question is drawn at random following the same rules

## Out of scope
- Limiting or excluding questions already seen in the session (repetition allowed as a product choice).
- Timing or a time limit per question.
- Viewing session statistics (see Story 2.3).

## QA notes
- Check that weighting follows the official coefficients renormalized, over a significant sample of draws (statistical test).
- Check that a question already seen can indeed come up again in a later draw.
- Check that none of the three final actions ("Skip", "I found it", "I didn't find it") leaves the interface stuck without a transition to a new question.
- Check that the "number of solutions" instruction appears for C1/C2/L1/GP/L2/HC questions and never for CE/CM questions, based on `tier` and not on `categories`.
