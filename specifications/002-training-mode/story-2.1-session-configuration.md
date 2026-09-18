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
- A "level" here is a `tier` (CE, CM, C1, C2, L1/GP, L2/HC — 6 values, not the 8 FFJM categories: L1 and GP share one tier, as do L2 and HC, since they share the same question pool — see `shared/categories.mjs`), matching Story 2.2's weighted draw, which draws by `tier`.
- The levels offered range from the simplest up to the tier matching the active profile's category (maximum allowed level) — e.g. a profile of category L1 or GP both max out at tier L1/GP; a profile of category L2 or HC both reach all 6 tiers.
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
- Check that a profile of category CE sees only one level offered (CE), since it is the lowest tier.
- Check that a profile of category HC (or L2) sees all 6 levels offered.
- Check that a profile of category L1 (or GP) sees 5 levels offered (up to and including L1/GP), not 4 or 6.
