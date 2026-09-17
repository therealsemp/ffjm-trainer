# User Story 3.1 — Selecting an edition

## Epic
EPIC 3 — Consulting an edition

## Actor
User with an active profile

## User Story
**As a** user wanting to browse archives,
**I want** to choose a year, a phase, and a category,
**so that** I can access the exact exercises of the edition I'm interested in.

## Context / Business rules
- Each edition (year + phase) contains exercises for each of the 8 FFJM categories.
- The selection is not limited by the active profile's category: the user can browse any category, regardless of their own level.
- All three criteria (year, phase, category) are needed to identify a precise set of exercises.

## Acceptance criteria

### Scenario 1: Displaying selection criteria
- **Given** the user accesses "Edition consultation" mode
- **Then** three selectors are offered: year, phase, category
- **And** the values offered match the editions/phases/categories actually available in the data

### Scenario 2: Complete selection and confirmation
- **Given** the user has chosen a year, a phase, and a category
- **When** they confirm their selection
- **Then** they are taken to the first question of the selected edition (Story 3.2)
- **And** the answer-display setting is initialized to "hidden" by default (Story 3.3)

### Scenario 3: Incomplete selection
- **Given** the user has not filled in all three criteria (year, phase, category)
- **When** they try to confirm
- **Then** confirmation is blocked
- **And** a message indicates the missing criteria

### Scenario 4: Combination with no available exercises
- **Given** the user has selected a year/phase/category combination for which no exercise exists in the data
- **When** they try to confirm
- **Then** a clear message informs them that no exercise is available for this combination
- **And** they stay on the selection screen to adjust their choice

## Out of scope
- Filtering or recommendations based on the active profile's category.
- Saving a history of editions already consulted.

## QA notes
- Check that the selectors only offer year/phase combinations actually present in the data (no year with no phase available).
- Check the error message on an empty combination (if the test data allows it).
