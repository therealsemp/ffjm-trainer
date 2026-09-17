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

## Acceptance criteria

### Scenario 1: Accessing statistics from a question
- **Given** the user is in an active session, with a question displayed (before or after viewing the answer)
- **When** they activate the statistics icon
- **Then** a popup/modal opens over the current screen
- **And** the question screen remains unchanged in the background

### Scenario 2: Content displayed in the popup
- **Given** the statistics popup is open
- **Then** it displays: the levels selected for the session, the total number of skipped questions, the total number of completed questions (found + not found), the overall found/not-found breakdown, and the skipped/found/not-found breakdown per selected level

### Scenario 3: Closing the popup
- **Given** the statistics popup is open
- **When** the user closes it
- **Then** they return exactly to the state of the question displayed before it opened (no data on the current question is lost or altered)

## Out of scope
- Statistics accumulated across several sessions or long-term history (a future evolution of the profile, outside EPIC 2).
- Exporting or sharing session statistics.
- Graphical representation (charts, diagrams) — a text/list display is enough in v1.

## QA notes
- Check that opening/closing the popup causes no loss of state on the current question (particularly if the answer was already shown).
- Check that the displayed numbers exactly match the saved data (see Story 2.4).
