import type { QuestionOutcome } from "../types/trainingSession"

interface SessionProgressBarProps {
  outcomes: QuestionOutcome[]
  target: number
}

// One segment per question of the session's target — filled green/orange
// once answered, in order; skipped questions never appear here at all
// (they neither advance nor fill a segment). Only rendered for a session
// with a target (never for an unlimited one). Visual trial: a thin,
// full-width, rounded "story-style" bar rather than a compact row of
// pills next to the year/phase line — meant to read as an objective/
// completion indicator, not just a stats readout.
export function SessionProgressBar({ outcomes, target }: SessionProgressBarProps) {
  return (
    <div
      className="flex w-full gap-1"
      role="img"
      aria-label={`Progression de la session : ${outcomes.length} sur ${target} questions`}
    >
      {Array.from({ length: target }, (_, index) => {
        const outcome = outcomes[index]
        return (
          <div
            key={index}
            className="h-1.5 flex-1 rounded-full bg-brand-muted/25"
            style={
              outcome
                ? { backgroundColor: outcome === "found" ? "var(--color-status-good)" : "var(--color-status-warning)" }
                : undefined
            }
          />
        )
      })}
    </div>
  )
}
