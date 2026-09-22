# User Story 3.1 — Selecting an edition

## Epic
EPIC 3 — Consulting an edition

## Actor
User with an active profile

## User Story
**As a** user wanting to browse archives,
**I want** to see every available edition at a glance and open one directly,
**so that** I can access the exact edition I'm interested in without extra steps.

## Context / Business rules
- Each edition (year + phase) is a **single shared exam**: one official exercise sheet, common to all 8 FFJM categories — not one separate sheet per category. This mirrors how the archives are actually sourced: one statement PDF per year/phase, regardless of level.
- A category's participants only officially play a prefix of that shared, ordered sequence (e.g. CE plays the first 5 exercises, CM the first 8, ...) — captured in each question's `categories` field. Consulting an edition always shows the **full** sequence, never a subset.
- Selecting an edition is not limited by the active profile's category: the user sees the same full edition no matter their own level. Questions outside the active profile's category are flagged with a warning while browsing, rather than hidden — see Story 3.2.
- Every edition actually present in the data is listed directly — one row per year, most recent year first, each showing its available phases (at most 3: quarter-final, semi-final, final) as directly clickable items. There is no separate selector-and-confirm step: activating a phase within a year immediately opens that edition's summary (Story 3.4). Since only combinations that actually exist in the data are ever listed, there is no "invalid combination" or "incomplete selection" case to handle — nothing else can be clicked.

## Acceptance criteria

### Scenario 1: Displaying available editions
- **Given** the user accesses "Edition consultation" mode
- **Then** every year present in the data is listed, most recent first
- **And** each year shows its available phases as directly clickable items, in at most 3 (quarter-final, semi-final, final)
- **And** no year or phase absent from the data is shown

### Scenario 2: Opening an edition
- **Given** the list of available editions is displayed
- **When** the user activates a phase within a year
- **Then** they are taken directly to that edition's summary (Story 3.4), which lists the full ordered list of exercises for that edition
- **And** the answer-display setting is initialized to "hidden" by default (Story 3.3), ready for whenever a specific question is opened from there

## Out of scope
- Filtering the edition's question list by category — the full edition is always shown (see Story 3.2 for the per-question category warning).
- Saving a history of editions already consulted.
- Any selector-and-confirm interaction, or handling an incomplete/invalid combination: only real, existing editions are ever presented, and each is one click away.

## QA notes
- Check that the listed years/phases exactly match what's present in the data — nothing more, nothing less.
- Check that activating a phase opens that exact edition's summary, with no intermediate confirmation step.
