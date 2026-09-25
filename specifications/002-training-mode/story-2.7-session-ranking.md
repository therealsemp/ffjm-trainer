# User Story 2.7 — Session ranking

## Epic
EPIC 2 — Doing exercises (training)

## Actor
User who has just completed a training session with a target question count

## User Story
**As a** user who just finished a training session,
**I want** my session to be given a rank (a letter grade, like in a game), shown in a rewarding way,
**so that** finishing a session feels like an achievement, and I have something to aim for next time.

## Context / Business rules

### Which sessions get a rank
- Only a **completed** session with a target question count (Story 2.6) gets a rank. A "No limit" session (Story 2.1) never completes, so it never gets one; neither does a targeted session abandoned before reaching its target (discarded via "Start a new session", Story 2.5).
- The rank is computed once, at the moment the session completes, from that session's own outcomes.

### How the rank is computed
- Only answered questions count: `found` and `notFound`. Skipped questions are **ignored** entirely, they neither help nor hurt. (Accepted trade-off: skipping is mostly used for a question already done before, not to game the rank. Since skipped questions don't count toward the target either, a completed session always has exactly `target` answered questions.)
- The level(s) of the questions (their tier) play **no** part in the rank: a session at CE and a session at L2/HC are ranked the same way.
- Success rate = `found / target`. Since session lengths are multiples of 5 (5, 10, 15, 20, Story 2.1), the rank thresholds are set in steps of 20%, so each one always falls on a whole number of correct answers:

| Rank | Label | Success rate | Out of 5 | Out of 10 | Out of 15 | Out of 20 |
|---|---|---|---|---|---|---|
| **S+** | Légendaire | 100% (no mistake), **and** target ≥ 10 | n/a | 10 | 15 | 20 |
| **S** | Excellent | ≥ 80% | 4-5 | 8-9 | 12-14 | 16-19 |
| **A** | Solide | ≥ 60% | 3 | 6-7 | 9-11 | 12-15 |
| **B** | Encourageant | ≥ 40% | 2 | 4-5 | 6-8 | 8-11 |
| **C** | En progrès | ≥ 20% | 1 | 2-3 | 3-5 | 4-7 |
| **D** | Premiers pas | < 20% | 0 | 0-1 | 0-2 | 0-3 |

- **S+ requires a session of at least 10 questions.** A perfect 5-question session (5/5) gets **S**, not S+, together with a hint that longer sessions unlock more ranks (see Scenario 3).
- The rank is identified by its letter; the label (Légendaire, Excellent...) is always shown alongside it wherever a single rank is presented on its own (the end-of-session screen), but not in the compact per-rank counters (Story 1.5).

### How the rank is shown (end-of-session screen, Story 2.6)
- The rank is the centerpiece of the end-of-session screen: the letter is shown large and put forward, with its label next to or below it.
- Every rank is drawn as a **medal** (metal rim, embossed letter, ribbon tails), so that lower ranks read as a lesser medal rather than a plain disc. Each rank has its own colors, taken from the app's blue/gold visual identity, higher ranks warmer/brighter (S+ and S gold medals on a blue ribbon, S+ with an extra iridescent/shimmer effect; A and B blue medals on a gold ribbon; C and D more neutral). The rank must never be conveyed by color alone: the letter and the label are always visible.
- The medal appears with a short entrance animation, and every rank gets a halo, getting smaller rank by rank (largest and continuously pulsing for S+, smallest for D) rather than disappearing below the top ranks. Higher ranks are more festive (sparkles for S and S+, continuous shimmer for S+). When the user's system asks for reduced motion, the animation is not played and the rank is shown directly in its final state.
- A graphical recap of the session's answers explains the letter: one dot per answered question, in the order they were answered, colored found / not found (same status colors as the in-session progress bar, Story 2.2). The dots are laid out in fixed rows, never free wrapping: rows of 10 on wide screens and rows of 5 on narrow ones (a 5-question session is a single row of 5). The block of dots is centered as a whole, while an incomplete last row (e.g. 15 = 10 + 5) stays left-aligned under the full row above it.
- A discreet counter shows how many questions were skipped during the session (e.g. "3 questions passées"), only when there is at least one. It is informational only: it has no bearing on the rank.
- A short sound plays once when the end-of-session screen appears, chosen by the rank obtained, unless the user has turned sounds off (Story 1.6). There is **one sound file per rank** (six in all): several ranks may use the same sound, but that grouping is decided only by which audio file each rank points to, so any rank can get its own sound later without changing the rule. The self-assessment that completes the session does **not** play its usual found/not-found sound (Story 2.2): only the rank's sound is heard, never two sounds back to back. The sound is not replayed when the end-of-session screen can't be shown again anyway (reload, navigation, Story 2.6).

### Saving
- The number of completed sessions obtained per rank is saved as a lifetime counter for the profile (see Story 2.4 for when it's saved, Story 1.5 for where it's shown). Only this per-rank count is kept, not a history of individual sessions.

## Acceptance criteria

### Scenario 1: Rank of a completed session
- **Given** a session with a target of 10 questions
- **And** the user has answered 7 of them "I found it" and 3 "I didn't find it" (plus any number of skips)
- **When** the session completes
- **Then** the end-of-session screen shows rank **A**, with the label "Solide"

### Scenario 2: Perfect session of 10 or more questions
- **Given** a session with a target of 10, 15 or 20 questions
- **When** the user completes it with every answered question marked "I found it"
- **Then** the end-of-session screen shows rank **S+**, with the label "Légendaire"

### Scenario 3: Perfect 5-question session
- **Given** a session with a target of 5 questions
- **When** the user completes it with all 5 answered questions marked "I found it"
- **Then** the end-of-session screen shows rank **S**, with the label "Excellent"
- **And** a short message hints that longer sessions unlock more ranks, without naming S+ (keeping it a bit of a mystery): "Les sessions d'au moins 10 questions permettent de débloquer des rangs supplémentaires."

### Scenario 4: The encouragement only appears for a perfect 5-question session
- **Given** a completed session that is not a perfect 5-question session (e.g. 4/5, or any 10+ question session)
- **When** the end-of-session screen is displayed
- **Then** the "longer sessions unlock more ranks" message is not shown

### Scenario 5: Skipped questions don't affect the rank
- **Given** two completed 10-question sessions, both with 8 found and 2 not found, one with no skip and one with 6 skips
- **Then** both get the same rank (**S**)
- **And** only the second one shows the skipped counter ("6 questions passées")

### Scenario 6: Recap of answers
- **Given** the end-of-session screen is displayed for an N-question session
- **Then** it shows exactly N dots, in the order the questions were answered, each colored according to its outcome (found / not found)
- **And** skipped questions don't appear as dots
- **And** on a wide screen, a 15-question session shows a row of 10 dots and, below it, a row of 5 dots aligned to the left of the first row

### Scenario 7: No rank for an unfinished or unlimited session
- **Given** a "No limit" session, or a targeted session discarded before reaching its target
- **Then** no rank is ever computed or saved for it

### Scenario 8: Rank sound
- **Given** sounds are enabled (Story 1.6)
- **When** the user self-assesses the question that completes the session
- **Then** no found/not-found sound plays for that answer
- **And** the end-of-session screen plays the sound of the rank obtained, once
- **And** with sounds turned off, no sound plays at all

### Scenario 9: Reduced motion
- **Given** the user's system requests reduced motion
- **When** the end-of-session screen is displayed
- **Then** the rank is shown directly, without its entrance animation

## Out of scope
- Taking the questions' level/tier into account in the rank.
- A history of past sessions and their ranks (only per-rank counters are kept, see Story 1.5).
- Any social/sharing feature around a rank.
- Reworking the shared statistics component (`StatsSummary`, used by Stories 1.5 and 2.3), planned separately later.

## QA notes
- Check every threshold for each session length (5, 10, 15, 20), especially the boundaries (e.g. 8/10 is S but 7/10 is A; 4/20 is C but 3/20 is D).
- Check that 5/5 gives S with the "longer sessions" hint, and 10/10 gives S+ without it.
- Check that reloading the end-of-session screen (which redirects to configuration, Story 2.6) never counts the same session's rank twice.
- Check the animation for each rank in both light and dark themes, on mobile and desktop widths, and with reduced motion enabled. A development-only preview page (not part of the deployed site) renders the end-of-session screen for every case listed above, to make this visual check possible without playing full sessions.
