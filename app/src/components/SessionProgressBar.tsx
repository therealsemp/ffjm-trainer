import type { QuestionOutcome } from "../types/trainingSession"

interface SessionProgressBarProps {
  outcomes: QuestionOutcome[]
  target: number
}

// One segment per question of the session's target — filled green/orange
// once answered, in order; skipped questions never appear here at all
// (they neither advance nor fill a segment). Only rendered for a session
// with a target (never for an unlimited one).
export function SessionProgressBar({ outcomes, target }: SessionProgressBarProps) {
  return (
    <div
      className="mt-0.5 flex gap-1"
      role="img"
      aria-label={`Progression de la session : ${outcomes.length} sur ${target} questions`}
    >
      {Array.from({ length: target }, (_, index) => {
        const outcome = outcomes[index]
        return (
          <div
            key={index}
            className="h-3 flex-1 rounded-full border border-brand-line"
            style={
              outcome
                ? {
                    backgroundColor: outcome === "found" ? "var(--color-status-good)" : "var(--color-status-warning)",
                    borderColor: "transparent",
                  }
                : undefined
            }
          />
        )
      })}
    </div>
  )
}
