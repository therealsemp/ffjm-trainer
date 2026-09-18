# User Story 1.4 — Theme preference (light / dark / system)

## Epic
EPIC 1 — Profile management

## Actor
User of the application (with or without an active profile)

## User Story
**As a** user of the application,
**I want** to choose between a light, dark, or "follow system" display theme,
**so that** the interface matches my preference or my device's setting, including in low-light conditions.

## Context / Business rules
- By default, with no explicit choice, the app follows the operating system/browser's color scheme preference (light or dark).
- The user can explicitly override this default by choosing "Light", "Dark", or "System" (back to automatic).
- The choice is stored locally on this device only (same storage mechanism as the rest of the profile) and applies immediately, with no page reload.
- The theme setting is device-level, not tied to a specific profile: it persists even if the profile is deleted (Story 1.3) or before any profile is created.
- The setting is reachable only from the "My account" page (Story 1.3) — never from the persistent header itself.

## Acceptance criteria

### Scenario 1: Default behavior with no explicit choice
- **Given** the user has never set an explicit theme preference on this device
- **When** they open the application
- **Then** the interface automatically follows the OS/browser's color scheme (light or dark)

### Scenario 2: Explicit choice — Dark
- **Given** the user is on the theme setting control
- **When** they select "Dark"
- **Then** the interface switches to the dark theme immediately
- **And** this choice is saved

### Scenario 3: Explicit choice — Light
- **Given** the user is on the theme setting control
- **When** they select "Light"
- **Then** the interface switches to the light theme immediately
- **And** this choice is saved

### Scenario 4: Explicit choice — System
- **Given** the user had previously chosen "Light" or "Dark" explicitly
- **When** they select "System"
- **Then** the interface immediately follows the OS/browser's current color scheme again
- **And**, from then on, it keeps following the OS/browser preference live if it changes while the app stays open, without needing to reopen the app

### Scenario 5: Persistence across reloads
- **Given** the user has explicitly chosen "Light" or "Dark"
- **When** they close and reopen the application
- **Then** the same explicit theme is applied (not reset to "System")

## Out of scope
- Per-page or per-section theme.
- Custom color palettes beyond light/dark.
- Automatic scheduling of the theme by time of day, independently of the OS/browser preference.

## QA notes
- Verify that on first-ever load (no stored preference), the theme exactly matches the OS/browser preference, with no visible flash of the wrong theme if feasible.
- Verify that with "System" selected, changing the OS-level color scheme while the app is open updates the interface live.
- Verify that deleting the profile (Story 1.3) does not reset an explicit theme choice.
