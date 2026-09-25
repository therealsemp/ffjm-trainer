// Shown only right after finishing a fixed-length session. "Just
// finished" is tracked via a storage flag (trainingSessionService's
// just-completed key), set synchronously the moment the completing action
// is recorded and consumed (read once, then cleared) here — not React
// Router navigation state, which raced against the session context update
// and made this page unreliable. Reaching this URL any other way (reload,
// the nav menu, a stale link) means the flag is already gone, so it's
// treated the same as any other completed session: sent to configuration,
// never shown again — someone closing the browser right after finishing
// shouldn't be greeted with the same recap the next time they open the app.

import { PartyPopper } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { SessionRankCard } from "../components/SessionRankCard"
import { StatsSummary } from "../components/StatsSummary"
import { useProfile } from "../services/ProfileContext"
import { computeRankFromOutcomes } from "../services/sessionRank"
import { playRankSound } from "../services/soundEffects"
import { trainingSessionService } from "../services/trainingSessionService"
import { useTrainingSession } from "../services/TrainingSessionContext"

export function TrainingRecapPage() {
  const { session, sessionStats, sessionOutcomes, sessionComplete, discardSession } = useTrainingSession()
  const { profile } = useProfile()
  const navigate = useNavigate()
  // Captured once at mount, before the effect below clears it — read
  // directly from storage rather than through context state, so it's
  // available on this very first render with no timing dependency.
  const [justCompleted] = useState(() => trainingSessionService.getJustCompleted())

  useEffect(() => {
    trainingSessionService.clearJustCompleted()
  }, [])

  // Story 2.7: the rank's sound, once, on arrival right after finishing
  // (the completing answer itself stayed silent, see TrainingQuestionPage).
  // Allowed by browsers' autoplay rules since it follows the user's click
  // on that last answer. The ref keeps React StrictMode's double effect run
  // (development) from playing it twice.
  const rankSoundPlayed = useRef(false)
  const soundEnabled = profile?.soundEnabled ?? true
  useEffect(() => {
    if (rankSoundPlayed.current || !justCompleted || !soundEnabled || session?.targetCount == null) return
    rankSoundPlayed.current = true
    playRankSound(computeRankFromOutcomes(sessionOutcomes, session.targetCount))
  }, [justCompleted, soundEnabled, session, sessionOutcomes])

  if (!session) return <Navigate to="/entrainement/configuration" replace />
  // The flag takes priority over `sessionComplete`: right on the render
  // that follows the completing action, the flag (set synchronously,
  // before this page even mounted) is already reliable, while
  // `sessionComplete` (derived from the session context's own state) can
  // lag behind by a render — trusting `sessionComplete` first bounced
  // through here to "/entrainement" and on to configuration instead of
  // showing the recap.
  if (!justCompleted) {
    return <Navigate to={sessionComplete ? "/entrainement/configuration" : "/entrainement"} replace />
  }

  const skipped = session.levels.reduce((total, tier) => total + sessionStats[tier].skipped, 0)

  function handleNewSession() {
    discardSession()
    navigate("/entrainement/configuration")
  }

  return (
    <PageContainer gap="gap-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold">
        <PartyPopper className="text-brand-gold" />
        Session terminée !
      </h1>
      <p className="text-brand-muted">Bravo, tu as terminé ta session d'entraînement. Voici ton bilan.</p>

      {/* Story 2.7: the rank is the centerpiece; the per-level breakdown
          (Story 2.6) stays below it. */}
      {session.targetCount !== null && (
        <SessionRankCard outcomes={sessionOutcomes} target={session.targetCount} skipped={skipped} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Détail par niveau</h2>
        <p className="text-brand-muted">Niveaux : {session.levels.join(", ")}</p>
        <StatsSummary stats={sessionStats} levels={session.levels} />
      </section>

      <Button type="button" onClick={handleNewSession}>
        Nouvelle session d'entraînement
      </Button>
    </PageContainer>
  )
}
