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

## Data to save
- Levels selected for the session
- Total number of skipped questions
- Total number of completed questions, split into found / not found
- For each selected level: number of skipped / found / not-found questions

## Acceptance criteria

### Scenario 1: Saving after "Skip"
- **Given** a question is displayed
- **When** the user activates "Skip"
- **Then** the global skipped-questions counter is incremented and saved
- **And** the skipped-questions counter for the relevant level is incremented and saved

### Scenario 2: Saving after "I found it"
- **Given** the answer is displayed for a question
- **When** the user activates "I found it"
- **Then** the global found-questions counter is incremented and saved
- **And** the found-questions counter for the relevant level is incremented and saved

### Scenario 3: Saving after "I didn't find it"
- **Given** the answer is displayed for a question
- **When** the user activates "I didn't find it"
- **Then** the global not-found-questions counter is incremented and saved
- **And** the not-found-questions counter for the relevant level is incremented and saved

### Scenario 4: Persistence after closing the application
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
