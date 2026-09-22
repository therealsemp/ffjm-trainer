# User Story 3.4 — Edition summary and direct navigation

## Epic
EPIC 3 — Consulting an edition

## Actor
User browsing a selected edition

## User Story
**As a** user browsing an edition,
**I want** an overview of every question in that edition, with its title and level,
**so that** I can see the whole edition at a glance and jump straight to any question I'm interested in.

## Context / Business rules
- The summary lists every question of the selected edition, in the contest's official order (same order as Story 3.2), each showing at least its title and its level (`tier`).
- Activating an entry opens that exact question directly, in the same consultation screen used for sequential navigation (Story 3.2) — Previous/Next remain available from there regardless of whether the question was reached via the summary or via sequential navigation.
- The summary itself shows no answers — it's a table of contents, not a preview of the content (Story 3.3 applies only once inside a specific question).
- Reachable from the question consultation screen at any time (e.g. a dedicated button/link), not only right after selecting the edition.

## Acceptance criteria

### Scenario 1: Displaying the summary
- **Given** the user is consulting an edition
- **When** they open the summary
- **Then** every question of the edition is listed in official order, each showing its title and level
- **And** no answers are shown in this list

### Scenario 2: Jumping to a question from the summary
- **Given** the summary is displayed
- **When** the user activates one of its entries
- **Then** they are taken directly to that question, on the consultation screen (Story 3.2)
- **And** Previous/Next from there navigate relative to that question's position in the edition, exactly as if reached sequentially

## Out of scope
- Filtering or searching within the summary.
- Showing answers, or any indication of the answer, directly in the summary list.

## QA notes
- Check that the summary's order exactly matches the sequential (Previous/Next) order from Story 3.2.
- Check that jumping to a question from the summary, then using Previous/Next, lands on the correct neighboring questions.
