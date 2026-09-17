# User Story 1.2 — Profile creation

## Epic
EPIC 1 — Profile management

## Actor
User with no profile saved on this device (child, with or without a parent's help)

## User Story
**As a** user with no profile,
**I want** to create a simple profile by giving my name and my FFJM category,
**so that** I can start training with questions suited to my level.

## Context / Business rules
- No restriction on the categories offered: all 8 official FFJM categories are available.
- Each category must be presented with a clear description of the corresponding school level, so the user can choose without knowing FFJM jargon.
- The created profile is stored only via a local cookie (no server account).

## Categories available for selection

| Displayed category | Internal code | Corresponds to |
|---|---|---|
| CE1 / CE2 | CE | Elementary school (grades 2-3) |
| CM1 / CM2 | CM | Elementary school (grades 4-5) |
| 6e / 5e | C1 | Middle school, cycle 1 |
| 4e / 3e | C2 | Middle school, cycle 2 |
| 2nde / 1ère / Terminale | L1 | High school |
| Student (1st to 5th year higher ed) | L2 | Students |
| Adult, general public | GP | General public |
| High competition | HC | Experienced competitors |

## Acceptance criteria

### Scenario 1: Successful creation
- **Given** the user is on the profile creation page
- **When** they enter a non-empty name
- **And** they select a category among the 8 offered, each shown with its description in plain terms (e.g. "6e / 5e")
- **And** they submit the form
- **Then** a profile cookie is created, containing the name and the chosen category code
- **And** the user is redirected to their profile's home page

### Scenario 2: Empty name
- **Given** the user is on the profile creation page
- **When** they try to submit the form without having entered a name
- **Then** submission is blocked
- **And** a message indicates that the name is required

### Scenario 3: No category selected
- **Given** the user is on the profile creation page
- **When** they try to submit the form without having chosen a category
- **Then** submission is blocked
- **And** a message indicates that a category must be selected

### Scenario 4: Category readability
- **Given** the user views the category selector
- **Then** each option displays the school-level match in plain terms (e.g. "CE1 / CE2") and not only the FFJM code ("CE")

## Out of scope
- Changing the category after the fact (moving up a level from one year to the next) — to be handled in a later story if needed.
- Checking name uniqueness across several profiles (only one active profile at a time on the device).

## QA notes
- Check that all 8 categories are indeed offered, without restriction.
- Check the readability of each category label for a child unfamiliar with FFJM acronyms.
