# User Story 4.4 — "Mes erreurs" page

## Epic
EPIC 4 — Favorites and mistakes

## Actor
User with an active profile

## User Story
**As a** user who has trained,
**I want** to see the questions I didn't find and haven't found since,
**so that** I can go back over them and understand what I missed.

## Context / Business rules
- Dedicated page titled "Mes erreurs", reached from the home page (Story 4.6).
- Lists the mistakes list's questions (Story 4.1), most recent mistake first.
- Each row has the same layout as "Mes favoris" (Story 4.3):
  - the question's title (or "Question N" when it has none);
  - its edition (e.g. "2021 · Demi-finale · Question 11");
  - its level badge (tier);
  - the date of its latest mistake (e.g. "Ratée le 24/09/2026");
  - the bookmark control (Story 4.2), showing whether the question is also a favorite, and letting the user add it to (or remove it from) their favorites.
- The bookmark on this page only acts on favorites: it never removes the question from the mistakes list. The page offers no way to remove a mistake (a question only leaves this list by being found in a later training session, Story 4.1).
- Tapping a row (anywhere but the bookmark) opens the question in list consultation (Story 4.5), positioned within this list.
- A short line explains how the list works: the questions not found in training appear here, and leave it once found in a later session.
- When the list is empty, the page shows a short message instead (e.g. no mistakes recorded yet, they'll appear here after training).

## Acceptance criteria

### Scenario 1: Listing mistakes
- **Given** the user missed three questions in training, on different dates, and hasn't found them since
- **When** they open "Mes erreurs"
- **Then** the three questions are listed, the most recent mistake first
- **And** each row shows the title, edition, level, date of the latest mistake and the bookmark

### Scenario 2: A question found since is no longer listed
- **Given** a question missed in an earlier session and found in a later one
- **When** the user opens "Mes erreurs"
- **Then** that question is not listed

### Scenario 3: Adding a mistake to favorites
- **Given** a question listed on "Mes erreurs" that isn't a favorite
- **When** the user taps its bookmark
- **Then** the question is added to their favorites (Story 4.2)
- **And** it stays listed on "Mes erreurs"

### Scenario 4: Opening a mistake
- **Given** the "Mes erreurs" page lists several questions
- **When** the user taps one of the rows
- **Then** that question opens in list consultation (Story 4.5), positioned within this list

### Scenario 5: No mistakes yet
- **Given** the mistakes list is empty
- **When** the user opens "Mes erreurs"
- **Then** a message explains that questions not found in training will appear there

## Out of scope
- Removing a mistake manually.
- Training on the mistakes list (later epic).
- Sorting or filtering the list.

## QA notes
- Check that the bookmark on this page never removes the question from "Mes erreurs".
- Check the order follows the latest mistake date.
