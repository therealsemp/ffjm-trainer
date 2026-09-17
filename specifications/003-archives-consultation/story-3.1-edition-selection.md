# User Story 3.1 — Selecting an edition

## Epic
EPIC 3 — Consulting an edition

## Actor
User with an active profile

## User Story
**As a** user wanting to browse archives,
**I want** to choose a year and a phase,
**so that** I can access the exact edition I'm interested in.

## Context / Business rules
- Each edition (year + phase) is a **single shared exam**: one official exercise sheet, common to all 8 FFJM categories — not one separate sheet per category. This mirrors how the archives are actually sourced: one statement PDF per year/phase, regardless of level.
- A category's participants only officially play a prefix of that shared, ordered sequence (e.g. CE plays the first 5 exercises, CM the first 8, ...) — captured in each question's `categories` field. Consulting an edition always shows the **full** sequence, never a subset.
- Selecting an edition is not limited by the active profile's category: the user sees the same full edition no matter their own level. Questions outside the active profile's category are flagged with a warning while browsing, rather than hidden — see Story 3.2.
- Both criteria (year, phase) are needed to identify a precise edition.

## Acceptance criteria

### Scenario 1: Displaying selection criteria
- **Given** the user accesses "Edition consultation" mode
- **Then** two selectors are offered: year, phase
- **And** the values offered match the editions/phases actually available in the data

### Scenario 2: Complete selection and confirmation
- **Given** the user has chosen a year and a phase
- **When** they confirm their selection
- **Then** they are taken to the first question of the selected edition (Story 3.2), which contains the full ordered list of exercises for that edition
- **And** the answer-display setting is initialized to "hidden" by default (Story 3.3)

### Scenario 3: Incomplete selection
- **Given** the user has not filled in both criteria (year, phase)
- **When** they try to confirm
- **Then** confirmation is blocked
- **And** a message indicates the missing criterion

### Scenario 4: Combination with no available exercises
- **Given** the user has selected a year/phase combination for which no exercise exists in the data
- **When** they try to confirm
- **Then** a clear message informs them that no exercise is available for this combination
- **And** they stay on the selection screen to adjust their choice

## Out of scope
- Filtering the edition's question list by category — the full edition is always shown (see Story 3.2 for the per-question category warning).
- Saving a history of editions already consulted.

## QA notes
- Check that the selectors only offer year/phase combinations actually present in the data.
- Check the error message on an empty combination (if the test data allows it).
