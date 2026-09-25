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
- The home page keeps its two main cards ("S'entraîner", "Consulter les archives") unchanged, and gets two smaller cards below them, side by side: "Mes favoris" (bookmark icon) and "Mes erreurs".
- Each card leads to its page (Stories 4.3 and 4.4).
- Each card shows how many questions its list holds (e.g. "5 questions", "1 question"), counting only questions that still exist in the app's data. When the list is empty, it says so instead of showing zero (e.g. "Aucune pour l'instant"), and the card stays usable (it leads to the page's empty state).
- The two cards stay side by side on a phone; their content is short enough to fit.

## Acceptance criteria

### Scenario 1: Entries shown with their counts
- **Given** the user has 5 favorites and 7 mistakes
- **When** they open the home page
- **Then** below the two main cards, a "Mes favoris" card shows "5 questions" and a "Mes erreurs" card shows "7 questions"

### Scenario 2: Empty lists
- **Given** the user has no favorites and no mistakes
- **When** they open the home page
- **Then** both cards show that their list is empty
- **And** tapping either one still opens its page

### Scenario 3: Opening a list
- **When** the user taps "Mes favoris" (respectively "Mes erreurs")
- **Then** the "Mes favoris" page (Story 4.3) (respectively "Mes erreurs", Story 4.4) opens

## Out of scope
- Showing the lists' contents directly on the home page.

## QA notes
- Check the counts match the number of rows on each page.
- Check the layout on a narrow phone screen (both cards side by side, nothing cut off).
