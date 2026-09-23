# User Story 3.3 — Global answer show/hide

## Epic
EPIC 3 — Consulting an edition

## Actor
User browsing a selected edition

## User Story
**As a** user browsing an edition,
**I want** a global switch to show or hide answers,
**so that** I can freely choose, at any time, to search on my own or check the corrections.

## Context / Business rules
- The switch is unique for the whole edition consultation (no per-question setting).
- It is permanently visible during consultation, whichever question is displayed.
- Its state applies immediately to the currently displayed question, as well as to all following questions viewed (until it is toggled back).
- By default, when starting to consult an edition, answers are hidden.
- Unlike training mode (Story 2.2), the FFJM "number of solutions" instruction is **not** shown here, on any question — archive consultation isn't about attempting the question under contest conditions, just reading the statement and, optionally, the answer.
- A question with no detailed correction (only a results-only source was available, see `ingest/TRANSCRIPTION-GUIDE.md` rule 10) shows just the answer when the switch is on — no "Explication détaillée" section at all, since there's nothing to show there.

## Acceptance criteria

### Scenario 1: Default state
- **Given** the user has just selected an edition (Story 3.1) and opened a question from its summary (Story 3.4)
- **When** that question is displayed
- **Then** the "Show answers" switch is "hidden" (OFF)
- **And** no answer is visible on the displayed question

### Scenario 2: Turning answer display on
- **Given** the user is viewing any question, answers hidden
- **When** they turn on the "Show answers" switch
- **Then** the answer (and explanation) for the currently displayed question appears immediately
- **And** the switch stays "shown" (ON) for the following questions viewed

### Scenario 3: Turning answer display off
- **Given** the user is viewing any question, answers shown
- **When** they turn off the "Show answers" switch
- **Then** the answer and explanation for the currently displayed question are hidden immediately
- **And** the switch stays "hidden" (OFF) for the following questions viewed

### Scenario 4: State persists during navigation
- **Given** the switch is set to "shown" (or "hidden")
- **When** the user navigates to another question (Previous/Next, Story 3.2)
- **Then** the switch setting stays unchanged
- **And** the newly displayed question respects this state (answer visible or not, consistent with the switch)

## Out of scope
- Per-question display setting.
- Remembering the switch's state from one consultation session to another (each new edition selection starts back on "hidden" by default).
- The FFJM "number of solutions" instruction — deliberately never shown here, see the context/business rules above (it's a training-mode-only display, Story 2.2).

## QA notes
- Check that changing the switch's state applies instantly with no page reload.
- Check that the switch's state is correctly kept while navigating between several consecutive questions.
- Check that the "number of solutions" instruction never appears on any question here, regardless of `tier`, even though it does in training mode.
- Check that a question with no detailed correction shows the answer (when it has one) but never an "Explication détaillée" section, and that this doesn't depend on `answer.value` being present or not.
