# User Story 4.1 — Recording mistakes

## Epic
EPIC 4 — Favorites and mistakes

## Actor
System (triggered by the user's self-assessments during training)

## User Story
**As a** user training regularly,
**I want** the questions I didn't find to be kept automatically in a list,
**so that** I can come back to them later, without having to think about noting them myself.

## Context / Business rules
- The mistakes list is fed **only** by self-assessments in training mode (Story 2.2). Archive consultation (Epic 3) has no self-assessment and never changes it.
- "I didn't find it" on a question adds it to the list, with the date of that mistake. If the question is already in the list, it isn't duplicated: its date is simply replaced by the new one (so it moves back to the top of the list, Story 4.4).
- "I found it" on a question that is in the list removes it from the list. On a question that isn't in the list, it does nothing.
- "Skip" never changes the list.
- This applies to every training session, targeted or "No limit", including the self-assessment that completes a session.
- One entry per question, holding only the question's identity and the date of its latest mistake. No mistake counter, no history of successive attempts: the list only reflects each question's latest status.
- The list holds at most **100 questions**. Adding a 101st one removes the question whose latest mistake is the oldest.
- There is **no manual removal** in this version: the only way for a question to leave the list is to be found in a later training session. (Having understood a mistake by reading its correction is a different notion from the automatic record, deliberately not covered here.)
- The list is local, stored on this device like the rest of the profile's data, and belongs to the profile: resetting the profile (Story 1.3) erases it. Starting a new training session (Story 2.5) never touches it.
- Nothing is retroactive: the app kept no answer history before this feature, so the list starts empty.
- A question in the list that no longer exists in the app's data (e.g. removed or renamed at a later data update) is silently ignored wherever the list is displayed or counted.

## Acceptance criteria

### Scenario 1: A question not found is recorded
- **Given** a question that isn't in the mistakes list
- **When** the user self-assesses it "I didn't find it" in a training session
- **Then** the question is added to the mistakes list, with today's date

### Scenario 2: A question not found again moves back to the top
- **Given** a question already in the mistakes list, recorded on an earlier date
- **When** the user self-assesses it "I didn't find it" again
- **Then** the list still contains that question only once
- **And** its date is replaced by today's date

### Scenario 3: A question found later leaves the list
- **Given** a question in the mistakes list
- **When** the user self-assesses it "I found it" in a training session
- **Then** the question is removed from the mistakes list

### Scenario 4: Skipping changes nothing
- **Given** any question, in the mistakes list or not
- **When** the user skips it
- **Then** the mistakes list is unchanged

### Scenario 5: Limit of 100 questions
- **Given** the mistakes list already holds 100 questions
- **When** a new question is self-assessed "I didn't find it"
- **Then** it is added
- **And** the question with the oldest mistake date is removed, so the list still holds 100 questions

### Scenario 6: Profile reset
- **Given** the mistakes list holds questions
- **When** the user resets their profile (Story 1.3)
- **Then** the mistakes list is erased

## Out of scope
- Removing a question from the list manually.
- Counting how many times a question was missed, or keeping a history of attempts.
- Training on the mistakes list (drawing a session's questions from it, or including it through session options): planned for a later epic.
- Sharing the list.

## QA notes
- Check that the same question missed several times appears once, dated from its latest mistake.
- Check that the completing self-assessment of a targeted session updates the list like any other.
- Check that skipping and archive consultation never change the list.
- Check the 100-question limit removes the oldest entry, not the newest.
