# User Story 1.5 — Viewing account statistics

## Epic
EPIC 1 — Profile management

## Actor
User with an active profile

## User Story
**As a** user with an active profile,
**I want** to see my lifetime training statistics on the "My account" page,
**so that** I can track my progress across every training session I've ever done.

## Context / Business rules
- These are **cumulative, lifetime counters** for this profile — the sum of every training session ever run on this device, not just the current/most recent one. They are tracked independently of any single session's own statistics (Story 2.3): every self-assessment action (skip/found/not found) increments both the current session's counters and these lifetime counters at the same time (see Story 2.4).
- Displayed on the "My account" page (Story 1.3), not a separate page.
- Starting a new training session (Story 2.5) never resets these — only deleting the profile does (Story 1.3).
- Content: total number of questions skipped, found, and not found, overall and broken down per level (tier) — the same shape as Story 2.3's session-scoped view, just summed over every session instead of one.
- If the profile has never done any training, this section shows an empty/placeholder state rather than a wall of zeros.

## Acceptance criteria

### Scenario 1: Viewing statistics after some training
- **Given** the user has completed at least one question (skipped, found, or not found) in any training session, ever
- **When** they are on the "My account" page
- **Then** the lifetime totals are visible: total skipped, total found, total not found, and the breakdown per level

### Scenario 2: No training done yet
- **Given** the user has never skipped, found, or not-found a single question in any session
- **When** they are on the "My account" page
- **Then** a message indicates there are no statistics yet, instead of showing all-zero counters

### Scenario 3: Starting a new session doesn't reset lifetime stats
- **Given** the profile has non-zero lifetime statistics
- **When** the user starts a new training session (Story 2.5), discarding the previous one
- **Then** the lifetime statistics on the "My account" page are unchanged

## Out of scope
- Detailed history (which session, which date, question-by-question log) or trend charts over time — see `functional-spec.md`'s "Hors scope v1". These are running totals, not a history.

## QA notes
- Check that completing questions across *several different* sessions (not just one) all add up into the same lifetime total.
- Check that "Démarrer une nouvelle session" (Story 2.5) leaves the lifetime total untouched, only the session's own stats reset.
- Check that resetting the profile (Story 1.3) clears the lifetime total back to the empty state.
