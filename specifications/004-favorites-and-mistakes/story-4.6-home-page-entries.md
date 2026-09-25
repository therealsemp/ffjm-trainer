# User Story 4.6 — Home page entries

## Epic
EPIC 4 — Favorites and mistakes

## Actor
User with an active profile, on the home page

## User Story
**As a** user arriving on the home page,
**I want** to reach my favorites and my mistakes directly, and see how many there are,
**so that** I'm reminded they exist and can open them in one tap.

## Context / Business rules
- The home page keeps its two main cards ("S'entraîner", "Consulter les archives") unchanged, and gets two more cards below them, stacked vertically on the same model (large icon, title, short description): "Mes favoris" (bookmark icon) and "Mes erreurs".
- Each card leads to its page (Stories 4.3 and 4.4).
- A card is shown **only when its list holds at least one question**: an empty list has no card on the home page (its page stays reachable by its address, showing its empty state).
- Each card's description ends with how many questions its list holds (e.g. "5 questions.", "1 question."), counting only questions that still exist in the app's data (a list holding only questions no longer in the data counts as empty, so gets no card).

## Acceptance criteria

### Scenario 1: Entries shown with their counts
- **Given** the user has 5 favorites and 7 mistakes
- **When** they open the home page
- **Then** below the two main cards, and on the same model, a "Mes favoris" card mentions "5 questions" and a "Mes erreurs" card mentions "7 questions"

### Scenario 2: Empty lists
- **Given** the user has no favorites and no mistakes
- **When** they open the home page
- **Then** only the two main cards are shown, with no "Mes favoris" or "Mes erreurs" card

### Scenario 2bis: Only one list has questions
- **Given** the user has mistakes but no favorites
- **When** they open the home page
- **Then** the "Mes erreurs" card is shown, and no "Mes favoris" card

### Scenario 3: Opening a list
- **When** the user taps "Mes favoris" (respectively "Mes erreurs")
- **Then** the "Mes favoris" page (Story 4.3) (respectively "Mes erreurs", Story 4.4) opens

## Out of scope
- Showing the lists' contents directly on the home page.

## QA notes
- Check the counts match the number of rows on each page.
- Check a card appears as soon as its list gets its first question, and disappears once it's empty again (e.g. last favorite removed, last mistake found).
- Check the four cards read as one consistent set on a narrow phone screen.
