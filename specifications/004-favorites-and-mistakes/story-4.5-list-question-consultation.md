# User Story 4.5 — Consulting a question from a list

## Epic
EPIC 4 — Favorites and mistakes

## Actor
User who opened a question from "Mes favoris" or "Mes erreurs"

## User Story
**As a** user going over my favorites or my mistakes,
**I want** to read each question with its answer and correction, and move from one to the next in my list,
**so that** I can review the whole list in a row without going back to it between each question.

## Context / Business rules
- A dedicated consultation screen, one per list: reached from "Mes favoris" (Story 4.3) or "Mes erreurs" (Story 4.4), each with its own address (e.g. `/favoris/<question>` and `/erreurs/<question>`). It is **not** the archive question screen (Story 3.2): it looks the same, but its navigation follows the list, not an edition.
- The screen shows, from top to bottom:
  - a link back to the list it came from ("Mes favoris" or "Mes erreurs");
  - the position within that list (e.g. "Favori 3 / 12", "Erreur 3 / 12");
  - the question's title, level badge and bookmark (Story 4.2);
  - its edition (e.g. "2021 · Demi-finale · Question 11"), as a link to the same question in the archives (Story 3.2), to see it in its edition's context;
  - "Previous" / "Next" links, following the list's order, hidden at the list's bounds (same look and placement as in the archives);
  - the out-of-category warning, under the same rule as in the archives (Story 3.2);
  - the statement, then the "show answers" toggle, hidden by default, revealing the answer and the detailed correction (same behavior as Story 3.3, including staying on when moving to the previous/next question).
- There is no self-assessment on this screen: consulting a question from a list never changes the mistakes list (Story 4.1), statistics, or any training session.
- **The list's order is frozen while browsing it**, from the moment the user enters it from the list page: removing the displayed question from the favorites (with its bookmark) leaves it displayed, and "Previous" / "Next" and the position keep referring to the list as it was when browsing started. Going back to the list page shows it updated.
- Reaching the screen directly (reload, a saved link) rebuilds the order from the list as it currently is. If the question isn't in that list (anymore), the user is taken to the list page instead.

## Acceptance criteria

### Scenario 1: Opening a question from a list
- **Given** the user is on "Mes favoris", which lists 12 questions
- **When** they open the third one
- **Then** the consultation screen shows that question, with "Favori 3 / 12"
- **And** a link back to "Mes favoris"
- **And** its answers hidden

### Scenario 2: Moving through the list
- **Given** the user is consulting favorite 3 of 12
- **When** they activate "Next"
- **Then** favorite 4 is displayed, with "Favori 4 / 12"
- **And** at favorite 12, "Next" is hidden; at favorite 1, "Previous" is hidden

### Scenario 3: Answers stay shown while moving
- **Given** the user turned on "show answers" on a question consulted from a list
- **When** they move to the next question
- **Then** its answers are shown too

### Scenario 4: Removing the displayed favorite
- **Given** the user is consulting favorite 3 of 12
- **When** they remove it from their favorites with its bookmark
- **Then** the question stays displayed, still as "Favori 3 / 12"
- **And** "Next" still leads to the question that was favorite 4
- **And** back on "Mes favoris", the list shows 11 questions

### Scenario 5: Going to the edition
- **Given** a question consulted from a list
- **When** the user follows its edition link
- **Then** the same question opens in the archives (Story 3.2), in its edition's navigation

### Scenario 6: Direct access to a question no longer in the list
- **Given** a saved link to a question consulted from "Mes erreurs", which has since been found in training
- **When** the user opens that link
- **Then** they are taken to the "Mes erreurs" page

### Scenario 7: No effect on mistakes and training
- **Given** a question consulted from "Mes erreurs"
- **When** the user reads it, shows its answers and moves on
- **Then** the mistakes list, the statistics and any training session are unchanged

## Out of scope
- Self-assessing or training from this screen (later epic).
- A summary of the list inside this screen (the list page itself plays that role).

## QA notes
- Check "Previous" / "Next" never go beyond the list's bounds.
- Check removing the displayed favorite changes neither the position shown nor where "Next" leads, until the user goes back to the list.
- Check reloading rebuilds the position from the current list.

## Technical notes
- The archive question screen's display blocks (question header with title/level badge/bookmark, edition line, out-of-category warning, statement + answers toggle + answer + correction, previous/next bar) are to be extracted into shared components, with the archive screen rebuilt on them and its behavior unchanged (its existing tests must keep passing). This screen then assembles the same components with its own list-based navigation, rather than the archive screen being adapted with list-specific conditions.
