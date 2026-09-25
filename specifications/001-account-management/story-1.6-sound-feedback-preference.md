# User Story 1.6 — Sound feedback preference

## Epic
EPIC 1 — Profile management

## Actor
User with an active profile

## User Story
**As a** user with an active profile,
**I want** to turn the self-assessment sound effects on or off,
**so that** I can train quietly (or keep the audio feedback) depending on where I am.

## Context / Business rules
- A short sound effect plays when the user self-assesses a question during training (Story 2.2): one sound for "I found it", a different one for "I didn't find it". The end-of-session screen also plays a sound depending on the rank obtained (Story 2.7); the same preference turns it on or off.
- This is a per-profile preference (unlike the theme, Story 1.4, which is device-level): it's stored as part of the profile itself, so resetting the profile (Story 1.3) also resets this preference back to its default.
- Default, with no explicit choice, is **enabled** — this also covers a profile created before this preference existed (no stored value at all), so a pre-existing profile keeps playing sounds after this feature ships, rather than going silent unexpectedly.
- The setting is reachable only from the "My account" page (Story 1.3), next to the theme control.
- Toggling the setting takes effect immediately, no reload needed.

## Acceptance criteria

### Scenario 1: Default behavior with no explicit choice
- **Given** a profile with no stored sound preference (newly created, or created before this feature existed)
- **When** the user self-assesses a question during training
- **Then** the corresponding sound effect plays

### Scenario 2: Turning sounds off
- **Given** the user is on the sound setting control, currently "on"
- **When** they turn it off
- **Then** the control immediately reflects "off"
- **And** self-assessing a question during training no longer plays any sound, nor does the end-of-session screen (Story 2.7)
- **And** this choice is saved

### Scenario 3: Turning sounds back on
- **Given** the user had turned the setting off
- **When** they turn it back on
- **Then** self-assessing a question during training plays the sound effects again
- **And** this choice is saved

### Scenario 4: Persistence across reloads
- **Given** the user has explicitly turned the setting off
- **When** they close and reopen the application
- **Then** the setting is still off

### Scenario 5: Profile reset clears the preference
- **Given** the user had turned the setting off
- **When** they reset their profile (Story 1.3)
- **Then** the new profile has sounds enabled by default (the old preference is not carried over)

## Out of scope
- Volume control or muting individual sounds separately.
- Custom/uploadable sounds.
- Sound effects for actions other than self-assessment and session completion (e.g. skip, session start).

## QA notes
- Verify a profile stored before this feature existed (no `soundEnabled` field) plays sounds by default.
- Verify "I found it" and "I didn't find it" each play their own distinct sound.
- Verify the setting persists across a reload but not across a profile reset.
