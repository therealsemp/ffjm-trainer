# User Story 2.5 — Resume or start a new session

## Epic
EPIC 2 — Doing exercises (training)

## Actor
User with an active profile

## User Story
**As a** user returning to training mode,
**I want** to be able to resume my session in progress if it exists, or start a new one,
**so that** I don't lose my progress if I don't want to, while keeping the freedom to start over.

## Context / Business rules
- Only one session can be saved at a time (for the device's active profile).
- Starting a new session permanently deletes the existing saved session, **including its own statistics** — but never the profile's lifetime statistics (Story 1.5), which are separate and keep accumulating regardless of how many sessions get discarded.
- Resuming a session always displays a new question drawn at random directly (no restoring the precise display state of the last question viewed, see Story 2.2/2.4).
- A session that has already reached its target question count (Story 2.1/2.6) is never offered as resumable: accessing training mode with such a session (via this screen) goes straight to session configuration (Story 2.1), skipping the resume/new-session choice below entirely — the recap (Story 2.6) is reached only right after finishing, never by navigating back here.

## Acceptance criteria

### Scenario 1: No existing session
- **Given** the user accesses training mode
- **And** no session is saved for their profile
- **When** the page loads
- **Then** the user is taken directly to configuring a new session (Story 2.1)

### Scenario 2: Existing session — choice offered
- **Given** the user accesses training mode
- **And** an unfinished session is saved for their profile (no target count, or a target not yet reached)
- **When** the page loads
- **Then** two options are offered: "Resume current session" and "Start a new session"
- **And** the saved session's characteristics are displayed next to the resume option, kept compact: the selected levels, and a "Progression" line (answered questions out of the target, e.g. "7 / 10 questions", or the number of answered questions for a "no limit" session)
- **And** for a session with a target, its progress bar (the same one shown on the question screen, Story 2.2: one segment per question of the target, colored found / not found once answered) is shown under that line
- **And** the detailed statistics (skipped/found/not-found totals and per-level breakdown) are not shown on this screen: they stay available from the question screen once resumed (Story 2.3)

### Scenario 2bis: Existing session already completed
- **Given** the user accesses training mode
- **And** the saved session has already reached its target question count
- **When** the page loads
- **Then** the user is taken directly to session configuration (Story 2.1), not the resume/new-session choice, and not the recap (Story 2.6)

### Scenario 3: Resuming the current session
- **Given** the session choice screen is displayed
- **When** the user activates "Resume current session"
- **Then** the saved session is reactivated with its selected levels and statistics
- **And** a new question is drawn at random following the rules of Story 2.2
- **And** the user is taken to the question screen (Story 2.2)

### Scenario 4: Starting a new session
- **Given** the session choice screen is displayed
- **When** the user activates "Start a new session"
- **Then** the existing saved session (levels, its own statistics) is permanently deleted
- **And** the profile's lifetime statistics (Story 1.5) are left untouched
- **And** the user is taken to configuring a new session (Story 2.1)

## Out of scope
- Keeping a history of previous sessions after deletion.
- Being able to have several saved sessions in parallel.

## QA notes
- Check that after deletion (new session), the old session can no longer be recovered.
- Check that resuming correctly restores the saved counters exactly (consistency with Story 2.4).
- Check that starting a new session leaves the profile's lifetime statistics (Story 1.5) exactly as they were.
- Check the behavior if the profile is deleted (Story 1.3): the associated session, its statistics, and the profile's lifetime statistics must all be deleted.
