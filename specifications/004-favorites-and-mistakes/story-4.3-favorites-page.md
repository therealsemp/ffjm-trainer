# User Story 4.3 — "Mes favoris" page

## Epic
EPIC 4 — Favorites and mistakes

## Actor
User with an active profile

## User Story
**As a** user who saved questions to their favorites,
**I want** to see them all on one page,
**so that** I can find and reopen any of them quickly.

## Context / Business rules
- Dedicated page titled "Mes favoris", reached from the home page (Story 4.6).
- Lists every favorite (Story 4.2), most recently added first.
- Each row shows:
  - the question's title (or "Question N" when it has none);
  - its edition: year, phase and number (e.g. "2021 · Demi-finale · Question 11");
  - its level badge (tier);
  - the date it was added (e.g. "Ajouté le 24/09/2026");
  - the bookmark control (Story 4.2), filled.
- Tapping a row (anywhere but the bookmark) opens the question in list consultation (Story 4.5), positioned within this list.
- Tapping the bookmark of a row removes that favorite: the row disappears from the list right away.
- When there are no favorites, the page shows a short message explaining how to add some (the bookmark on any question) instead of an empty list.
- This page shares its look with "Mes erreurs" (Story 4.4): same row layout, only the data source and the date wording differ.

## Acceptance criteria

### Scenario 1: Listing favorites
- **Given** the user has added three questions to their favorites on different dates
- **When** they open "Mes favoris"
- **Then** the three questions are listed, the most recently added first
- **And** each row shows the title, edition, level, date added and a filled bookmark

### Scenario 2: Opening a favorite
- **Given** the "Mes favoris" page lists several favorites
- **When** the user taps the second row
- **Then** that question opens in list consultation (Story 4.5), as favorite 2 of the list

### Scenario 3: Removing a favorite from the list
- **Given** the "Mes favoris" page lists several favorites
- **When** the user taps the bookmark of one row
- **Then** that question is removed from their favorites
- **And** its row disappears from the list

### Scenario 4: No favorites yet
- **Given** the user has no favorites
- **When** they open "Mes favoris"
- **Then** a message explains that questions can be added with the bookmark shown on each question

## Out of scope
- Sorting or filtering the list (by level, edition...).
- Undoing a removal (the question can simply be added again from any question screen).

## QA notes
- Check the order follows the date added, re-adding a question moving it back to the top.
- Check tapping the bookmark doesn't also open the question.
- Check a favorite whose question no longer exists in the data is not listed.
