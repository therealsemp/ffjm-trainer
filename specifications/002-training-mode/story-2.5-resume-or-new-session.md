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

## Acceptance criteria

### Scenario 1: No existing session
- **Given** the user accesses training mode
- **And** no session is saved for their profile
- **When** the page loads
- **Then** the user is taken directly to configuring a new session (Story 2.1)

### Scenario 2: Existing session — choice offered
- **Given** the user accesses training mode
- **And** a session is saved for their profile
- **When** the page loads
- **Then** two options are offered: "Resume current session" and "Start a new session"
- **And** the saved session's characteristics and statistics are displayed next to the resume option (selected levels, number of skipped/found/not-found questions)

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
