# User Story 2.1 — Configuring a training session

## Epic
EPIC 2 — Doing exercises (training)

## Actor
User with an active profile

## User Story
**As a** user wanting to train,
**I want** to choose which question levels to include in my session before starting,
**so that** I can train on the levels that suit me, up to my maximum level.

## Context / Business rules
- The levels offered range from the simplest up to the active profile's category level (maximum allowed level).
- Each level is represented by a checkbox that can be toggled on or off.
- By default, all levels are off.
- A button lets the user enable all available levels in a single action.
- At least one level must be selected to start the session.
- This story only applies when there is no session in progress to resume (see Story 2.5).

## Acceptance criteria

### Scenario 1: Displaying available levels
- **Given** the user has an active profile of category X
- **When** they access the configuration of a new training session
- **Then** all levels from the simplest up to category X (inclusive) are displayed
- **And** levels above category X are not offered
- **And** each level is shown as a checkbox, off by default

### Scenario 2: Manually enabling one or more levels
- **Given** the user is on the configuration screen
- **When** they check one or more level checkboxes
- **Then** the corresponding levels are marked as selected
- **And** the confirm button becomes usable

### Scenario 3: Enable all levels
- **Given** the user is on the configuration screen
- **When** they activate the "Enable all" button
- **Then** all available levels (up to their category) are selected

### Scenario 4: Confirming with no selection
- **Given** the user is on the configuration screen
- **And** no level is selected
- **When** they try to confirm
- **Then** confirmation is blocked
- **And** a message indicates that at least one level must be selected

### Scenario 5: Successful confirmation
- **Given** the user has selected at least one level
- **When** they confirm the configuration
- **Then** a new session is created with the selected levels
- **And** the user is taken to the first question screen (Story 2.2)

## Out of scope
- Changing the selected levels while a session is in progress (the choice is fixed when the session is created).
- Manual weighting/prioritization between levels by the user (weighting is automatic, see Story 2.2).

## QA notes
- Check that a profile of category CE sees only one level offered (CE), since it is the lowest level.
- Check that a profile of category HC sees all 8 levels offered.
