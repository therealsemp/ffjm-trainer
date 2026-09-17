# User Story 1.1 — Automatic detection and redirection on load

## Epic
EPIC 1 — Profile management

## Actor
User (child or parent using the device)

## User Story
**As a** user opening the application,
**I want** to be automatically redirected to my space if I already have a profile saved on this device, or to profile creation otherwise,
**so that** I don't have to identify myself again every time I open it and can go straight to my training.

## Context / Business rules
- The profile is stored locally via a browser cookie (no server account, no authentication).
- Only one active profile at a time per browser/device.
- This story runs automatically when the application loads, with no user action.

## Acceptance criteria

### Scenario 1: Existing, valid profile
- **Given** a valid profile cookie is present in the browser (contains a name and a recognized category)
- **When** the user opens the application
- **Then** the application automatically redirects to the profile's home page, with no intermediate screen
- **And** no action is required from the user

### Scenario 2: No saved profile
- **Given** no profile cookie is present in the browser
- **When** the user opens the application
- **Then** the application automatically redirects to the profile creation page (Story 1.2)

### Scenario 3: Corrupted or invalid profile
- **Given** a profile cookie is present but its content is invalid (unknown category, incorrect format, missing name)
- **When** the user opens the application
- **Then** the application treats this case as "no profile"
- **And** redirects to the profile creation page (Story 1.2)
- **And** the invalid cookie is ignored or cleared (does not cause a blocking error)

## Out of scope
- Managing several simultaneous profiles on the same browser.
- Synchronization between different devices/browsers.
- Password authentication.

## QA notes
- Check the behavior after manually deleting the cookie via browser developer tools.
- Check the behavior after manually altering the cookie value (robustness test).
