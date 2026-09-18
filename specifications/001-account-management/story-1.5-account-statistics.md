# User Story 1.5 — Viewing account statistics

## Epic
EPIC 1 — Profile management

## Actor
User with an active profile

## User Story
**As a** user with an active profile,
**I want** to see my training statistics on the "My account" page,
**so that** I can track my progress over time.

## Context / Business rules
- Blocked on EPIC 2 (training mode): there is nothing meaningful to show until sessions are actually tracked (Story 2.4). Until then, the account page shows this section empty/placeholder rather than fabricated numbers.
- Displayed on the "My account" page (Story 1.3), not a separate page.
- Exact content (which numbers, at what granularity) is intentionally not finalized yet — to be defined once EPIC 2's session-stats model exists, so this story can be refined instead of guessed at now.

## Acceptance criteria

### Scenario 1: Viewing statistics
- **Given** the user is on the "My account" page
- **Then** basic statistics are visible (exact content to be defined with EPIC 2's detail: e.g. number of questions seen, found, not found)

## Out of scope
- Advanced statistics (detailed history, trend charts over time).
- Anything beyond the current, single most-recent state — no cross-session history beyond what Story 2.4/2.5 already track.

## QA notes
- Nothing to verify until EPIC 2 exists — revisit this story once Story 2.4 (statistics saving) is implemented.
