# User Story 2.6 — Session completion and recap

## Epic
EPIC 2 — Doing exercises (training)

## Actor
User in a training session with a target question count

## User Story
**As a** user training toward a fixed number of questions,
**I want** to see a clear recap once I reach that number,
**so that** my session feels like a complete exercise with a real finish line, not an endless loop.

## Context / Business rules
- Only applies to a session with a target question count (Story 2.1); a "No limit" session never ends on its own.
- The session is complete as soon as the count of answered questions (found + not found, skipped excluded) reaches the target — this is checked right after each self-assessment (Story 2.2, scenarios 4/5).
- A completed session cannot be resumed: it is never offered on the resume/new-session screen (Story 2.5).
- The recap is shown **only** immediately after the action that completes the session — reaching it any other way (the navigation menu, a reload, a stale link, or simply coming back to the app later) does not show it again: a completed session accessed that way goes straight to session configuration (Story 2.1) instead, as if it weren't there. Someone who finishes a session and closes the app shouldn't be greeted with that same recap the next time they open it.
- The recap always shows a congratulatory message, regardless of how the session actually went (skip/found/not-found mix) — finishing the session is itself the thing being celebrated.
- The recap is built around the session's **rank** (Story 2.7): the rank letter and its label are the centerpiece, followed by the graphical recap of answers (one dot per answered question) and a discreet skipped-questions counter, as described in Story 2.7. This is a dedicated display for the end of a session, distinct from the shared statistics component used by the in-session popup (Story 2.3) and the account page (Story 1.5).
- Below the rank, the recap still shows the session's own statistics (same breakdown as Story 2.3/2.4: skipped/found/not-found per level), not the profile's lifetime statistics (Story 1.5).
- The only action offered from the recap is starting a new session, which discards the completed session (same deletion behavior as Story 2.5's "Start a new session") and returns to session configuration (Story 2.1). Navigating away from the recap without starting a new session leaves the completed session in storage, but — per the rule above — it won't be shown again; it's only actually cleared once a new session starts.

## Acceptance criteria

### Scenario 1: Reaching the target ends the session
- **Given** a session with a target question count, one question away from that target
- **When** the user self-assesses that last question ("I found it" or "I didn't find it")
- **Then** no new question is drawn
- **And** the user is taken to the recap screen

### Scenario 2: Recap content
- **Given** the recap screen is displayed
- **Then** it shows a congratulatory message
- **And** it shows the session's rank, put forward (letter and label), with its graphical recap of answers (Story 2.7)
- **And** below that, it shows the session's own statistics (skipped/found/not-found, per level)
- **And** it offers a single action to start a new session

### Scenario 3: Starting a new session from the recap
- **Given** the recap screen is displayed
- **When** the user starts a new session
- **Then** the completed session and its own statistics are permanently deleted
- **And** the profile's lifetime statistics (Story 1.5) are left untouched
- **And** the user is taken to configuring a new session (Story 2.1)

### Scenario 4: Returning to a completed session via the navigation menu
- **Given** a session has already reached its target, and the user is not in the middle of the completion transition (e.g. they used Home > Training, or reopened the app later)
- **When** they reach training mode, or navigate directly to the question or recap screen
- **Then** they are taken straight to session configuration (Story 2.1), never to the recap or back to the question flow

### Scenario 5: Reloading the recap page
- **Given** the recap screen is displayed right after finishing
- **When** the user reloads the page
- **Then** they are taken to session configuration instead of seeing the recap again

## Out of scope
- A history of past completed sessions (once a new session starts, the completed one is gone, same as Story 2.5). Only a per-rank count of completed sessions is kept (Story 2.7, Story 1.5).
- Any social/sharing feature around a completed session's results.

## QA notes
- Check that the recap is reached automatically right after the action that completes the session, with no extra confirmation step.
- Check that navigating to `/entrainement`, the question screen, or the recap URL directly after completion (menu, reload, stale link) always lands on session configuration, not the recap, the resume choice, or a stale question.
- Check that starting a new session from the recap leaves the profile's lifetime statistics exactly as they were.
- Check that reloading the recap (Scenario 5) doesn't record the session's rank a second time (Story 2.7).
