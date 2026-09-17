# User Story 3.2 — Navigating an edition's questions

## Epic
EPIC 3 — Consulting an edition

## Actor
User browsing a selected edition

## User Story
**As a** user browsing an edition,
**I want** to go through the exercises in the contest's official order, moving forward or backward freely,
**so that** I can relive the contest as it happened or go back to an exercise already seen.

## Context / Business rules
- An edition's exercises are displayed one at a time, in the contest's official order (increasing order of difficulty, as in the real contest) — the full, unfiltered sequence (see Story 3.1: an edition is a single shared exam, not one sheet per category).
- The position within the edition is shown to the user (e.g. "Question 4/16").
- A question whose `categories` does not include the active profile's category is outside what that profile actually plays — it stays visible, but with a warning (e.g. "This question isn't part of your category (CM)"), since browsing always shows the full edition.
- This story does not cover showing or hiding answers (see Story 3.3), which applies on top of this navigation.

## Acceptance criteria

### Scenario 1: Displaying the first question
- **Given** the user has just confirmed the selection of an edition (Story 3.1)
- **When** the consultation screen is displayed
- **Then** the edition's first question is displayed
- **And** the position indicator shows "Question 1/N" (N being the edition's total number of exercises)

### Scenario 2: Navigating to the next question
- **Given** the user is viewing question K (K < N)
- **When** they activate "Next"
- **Then** question K+1 is displayed
- **And** the position indicator is updated

### Scenario 3: Navigating to the previous question
- **Given** the user is viewing question K (K > 1)
- **When** they activate "Previous"
- **Then** question K-1 is displayed
- **And** the position indicator is updated

### Scenario 4: Boundary at the end of the edition
- **Given** the user is viewing the edition's last question (K = N)
- **Then** the "Next" button is disabled or hidden (no action possible beyond the last question)

### Scenario 5: Boundary at the start of the edition
- **Given** the user is viewing the edition's first question (K = 1)
- **Then** the "Previous" button is disabled or hidden (no action possible before the first question)

### Scenario 6: Question outside the active profile's category
- **Given** the displayed question's `categories` does not include the active profile's category
- **Then** a visible warning is shown alongside the question, indicating it isn't part of the profile's category
- **And** the question remains fully viewable (statement, and answer once revealed per Story 3.3) — the warning is informational, not a restriction

## Out of scope
- Jumping directly to a specific question via a list or selector (navigation is sequential only in v1).
- Remembering the last question viewed when leaving and returning to this edition (each new edition selection starts back at question 1).

## QA notes
- Check that the position indicator always stays consistent with the question displayed.
- Check that it is impossible to go beyond the bounds 1 and N by repeatedly clicking "Previous"/"Next".
- Check that the out-of-category warning is based on the active profile's category vs. the question's `categories`, and never hides or blocks the question.
