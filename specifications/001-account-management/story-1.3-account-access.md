# User Story 1.3 — Account access, statistics, and profile deletion

## Epic
EPIC 1 — Profile management

## Actor
User with an active profile on this device

## User Story
**As a** user with an active profile,
**I want** to access a "My account" space to view my statistics or delete my profile,
**so that** I can track my progress or free up the device for another user to create their own profile.

## Context / Business rules
- All profile data (identity, category, statistics) is stored only on this device/browser, via cookie/local storage — no server backup.
- Deletion is permanent and local: it only affects this device.

## Acceptance criteria

### Scenario 1: Access to the account space
- **Given** the user has an active profile and is on the home page
- **When** they activate the "My account" entry point
- **Then** a page is displayed with: the profile name, the associated FFJM category, the profile's statistics, and the theme setting (Story 1.4)

### Scenario 2: Viewing statistics
- **Given** the user is on the "My account" page
- **Then** basic statistics are visible (exact content to be defined with EPIC 2's detail: e.g. number of questions seen, found, not found)

### Scenario 3: Requesting profile deletion
- **Given** the user is on the "My account" page
- **When** they activate the "Delete my profile" button
- **Then** a confirmation pop-up is displayed
- **And** this pop-up clearly explains that the data is stored only on this device/browser and that deletion is permanent (e.g.: "All your data — profile and progress — is stored only on this device. If you confirm, it will be permanently erased.")
- **And** the pop-up offers two actions: "Cancel" and "Confirm deletion"

### Scenario 4: Confirming deletion
- **Given** the deletion confirmation pop-up is displayed
- **When** the user activates "Confirm deletion"
- **Then** the profile cookie and all associated data (statistics, progress) are erased
- **And** the user is redirected to the profile creation page (Story 1.2)

### Scenario 5: Cancelling deletion
- **Given** the deletion confirmation pop-up is displayed
- **When** the user activates "Cancel"
- **Then** the pop-up closes
- **And** no data is modified or deleted
- **And** the user stays on the "My account" page

## Out of scope
- Exporting or backing up data before deletion.
- Recovering a deleted profile.
- Advanced statistics (detailed history, trend charts over time) — the precise content of statistics will be refined when EPIC 2 is detailed.

## QA notes
- Check that no deletion is possible without going through the confirmation step.
- Check that the pop-up message explicitly mentions the local and permanent nature of the deletion.
- Check that reloading the page after deletion correctly leads back to profile creation (and not to a ghost profile).
