# User Story 2.4 — Continuous saving of session statistics

## Epic
EPIC 2 — Doing exercises (training)

## Actor
System (triggered by the user's actions during a session)

## User Story
**As a** user in a training session,
**I want** my session's characteristics and statistics to be saved after every action,
**so that** I lose nothing if I leave the application and can resume it later (see Story 2.5).

## Context / Business rules
- Saving is local (the same storage mechanism as the profile: browser/device).
- Saving happens after every action on a question: "Skip", "I found it", "I didn't find it".
- The saved data allows statistics to be resumed identically (but not the precise display state of the last question, see Story 2.5).
- Every action updates **two** independent sets of counters at once: the current session's own (reset when a new session starts, Story 2.5) and the profile's lifetime cumulative total (never reset by a new session — see Story 1.5). Both are saved together, from the same action, so they never drift apart.
- When an action completes a targeted session (Story 2.6), the session's rank (Story 2.7) is computed and the profile's lifetime per-rank counter (number of completed sessions per rank, see Story 1.5) is incremented and saved, in the same step as that last action. It is saved exactly once per completed session, never when the end-of-session screen is displayed or reloaded. This per-rank counter is stored separately from the per-level question counters (it counts sessions, not questions).

## Data to save
- Levels selected for the session
- Total number of skipped questions
- Total number of completed questions, split into found / not found
- For each selected level: number of skipped / found / not-found questions
- Profile-wide (not per session): number of completed sessions obtained for each rank (Story 2.7)

## Acceptance criteria

### Scenario 1: Saving after "Skip"
- **Given** a question is displayed
- **When** the user activates "Skip"
- **Then** the session's skipped-questions counter (global and for the relevant level) is incremented and saved
- **And** the profile's lifetime skipped-questions counter (global and for the relevant level, Story 1.5) is incremented and saved

### Scenario 2: Saving after "I found it"
- **Given** the answer is displayed for a question
- **When** the user activates "I found it"
- **Then** the session's found-questions counter (global and for the relevant level) is incremented and saved
- **And** the profile's lifetime found-questions counter (global and for the relevant level, Story 1.5) is incremented and saved

### Scenario 3: Saving after "I didn't find it"
- **Given** the answer is displayed for a question
- **When** the user activates "I didn't find it"
- **Then** the session's not-found-questions counter (global and for the relevant level) is incremented and saved
- **And** the profile's lifetime not-found-questions counter (global and for the relevant level, Story 1.5) is incremented and saved

### Scenario 4: Saving the rank when a session completes
- **Given** a targeted session one answered question away from its target
- **When** the user self-assesses that last question
- **Then** the session's rank is computed (Story 2.7)
- **And** the profile's lifetime counter for that rank is incremented by one and saved
- **And** reloading or revisiting the app afterwards never increments it again for that same session

### Scenario 5: Persistence after closing the application
- **Given** a session has statistics already saved
- **When** the user closes the application then reopens it
- **Then** the saved statistics are intact and available for resuming the session (Story 2.5)

## Out of scope
- Saving the precise display state of the current question (text shown, answer visible or not) — resuming always happens on a new question (see Story 2.5).
- Detailed question-by-question history (only aggregated counters are kept).

## QA notes
- Check that no action on a question is possible without triggering the corresponding save.
- Check the consistency of the global counters against the sum of the per-level counters.
- Simulate an abrupt closure (page reload) right after an action to verify that no data is lost.
- Check that both the session's counters and the profile's lifetime counters (Story 1.5) move together on every single action — never just one of the two.
- Check that the per-rank counter moves by exactly one per completed session, and never for a "No limit" session or a session discarded before its target.
