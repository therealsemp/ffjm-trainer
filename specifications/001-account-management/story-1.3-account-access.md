# User Story 1.3 — Account access and profile reset

## Epic
EPIC 1 — Profile management

## Actor
User with an active profile on this device

## User Story
**As a** user with an active profile,
**I want** to access a "My account" space and reset my profile from there,
**so that** I can free up the device for another user to create their own profile.

## Context / Business rules
- All profile data (identity, category, statistics) is stored only on this device/browser, via cookie/local storage — no server backup.
- The reset is permanent and local: it only affects this device.
- The "My account" entry point lives in a persistent header, visible on every page once a profile is active (not just the home page). Pages reached before a profile exists (detection/redirection, profile creation) have no header, since there is nothing to link to yet.
- The theme control (Story 1.4) lives on this "My account" page only — never in the header.
- The page also shows the profile's lifetime training statistics — see Story 1.5.
- The page's top-level blocks (identity, theme, sound, statistics, reset) are separated from one another by a thin horizontal rule.

## Acceptance criteria

### Scenario 1: Access to the account space
- **Given** the user has an active profile
- **When** they activate the "My account" entry point in the header, from any page
- **Then** a page is displayed with: the profile name, the associated FFJM category, the theme setting (Story 1.4), and a statistics section (Story 1.5)

### Scenario 2: Requesting a profile reset
- **Given** the user is on the "My account" page
- **When** they activate the "Reset my profile" button
- **Then** a confirmation pop-up is displayed
- **And** this pop-up clearly explains that the data is stored only on this device/browser and that the reset is permanent (e.g.: "All your data — profile and progress — is stored only on this device. If you confirm, it will be permanently erased.")
- **And** the pop-up offers two actions: "Cancel" and "Confirm reset"

### Scenario 3: Confirming the reset
- **Given** the reset confirmation pop-up is displayed
- **When** the user activates "Confirm reset"
- **Then** the profile cookie and all associated data are erased — including any in-progress training session (Story 2.5) and the profile's lifetime statistics (Story 1.5), per-rank session counts included (Story 2.7), favorites (Story 4.2) and the mistakes list (Story 4.1)
- **And** the user is redirected to the profile creation page (Story 1.2)

### Scenario 4: Cancelling the reset
- **Given** the reset confirmation pop-up is displayed
- **When** the user activates "Cancel"
- **Then** the pop-up closes
- **And** no data is modified or deleted
- **And** the user stays on the "My account" page

## Out of scope
- Exporting or backing up data before resetting.
- Recovering a profile after it's been reset.
- Statistics content and behavior — see Story 1.5.

## QA notes
- Check that no reset is possible without going through the confirmation step.
- Check that the pop-up message explicitly mentions the local and permanent nature of the reset.
- Check that reloading the page after a reset correctly leads back to profile creation (and not to a ghost profile).
