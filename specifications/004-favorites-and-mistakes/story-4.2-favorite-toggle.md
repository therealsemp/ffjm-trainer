# User Story 4.2 — Adding and removing a favorite

## Epic
EPIC 4 — Favorites and mistakes

## Actor
User viewing a question (training, archives, or one of their lists)

## User Story
**As a** user looking at a question,
**I want** to save it to my favorites in one tap, and remove it just as easily,
**so that** I can set aside the questions I want to see again, whatever the reason (a beautiful problem, one to rework, one to show someone).

## Context / Business rules
- The favorite control is a **bookmark** icon (not a heart, which reads as a social "like", nor a star, which reads as a rating and would be confused with session ranks, Story 2.7): outlined when the question isn't a favorite, filled when it is. Its accessible name states the action it performs: "Ajouter aux favoris" or "Retirer des favoris".
- It is shown next to the question's title and level badge on:
  - the training question screen (Story 2.2);
  - the archive question screen (Story 3.2);
  - the screen consulting a question from a list (Story 4.5);
  - each row of the "Mes favoris" and "Mes erreurs" pages (Stories 4.3 and 4.4).
- Tapping it toggles the question's favorite status immediately, with no confirmation, and updates the icon right away.
- A favorite keeps the question's identity and the date it was added. Removing a favorite and adding it again later counts as a new addition, dated from that new addition.
- Favorites are independent from the mistakes list (Story 4.1): a question can be in either, both, or neither, and nothing moves a question from one to the other automatically.
- Toggling a favorite has no effect on the current training session (statistics, progress, rank) or on the mistakes list.
- No limit on the number of favorites.
- Favorites are local, stored on this device like the rest of the profile's data: resetting the profile (Story 1.3) erases them; starting a new training session doesn't.
- A favorite whose question no longer exists in the app's data is silently ignored wherever favorites are displayed or counted.

## Acceptance criteria

### Scenario 1: Adding a favorite
- **Given** a question that isn't a favorite, displayed on one of the screens listed above
- **When** the user taps the bookmark
- **Then** the question is added to their favorites, dated today
- **And** the bookmark is shown filled, labeled "Retirer des favoris"

### Scenario 2: Removing a favorite
- **Given** a question that is a favorite
- **When** the user taps the filled bookmark
- **Then** the question is removed from their favorites
- **And** the bookmark is shown outlined, labeled "Ajouter aux favoris"

### Scenario 3: Same status everywhere
- **Given** a question the user just added to their favorites from the training screen
- **When** they later see that same question in the archives or in one of their lists
- **Then** its bookmark is shown filled there too

### Scenario 4: No effect on the training session
- **Given** a question displayed in a training session
- **When** the user toggles its favorite status
- **Then** the session's statistics, progress and outcome are unchanged, and the question stays displayed

### Scenario 5: Profile reset
- **Given** the user has favorites
- **When** they reset their profile (Story 1.3)
- **Then** their favorites are erased

## Out of scope
- A favorite control on the end-of-session screen (Story 2.6), which doesn't list the session's questions.
- Notes, tags or folders on favorites.
- Sharing favorites.

## QA notes
- Check the bookmark state is consistent across the training, archive and list screens for the same question.
- Check the accessible name changes with the state.
- Check toggling during a training session doesn't redraw the question or change the session's counters.
