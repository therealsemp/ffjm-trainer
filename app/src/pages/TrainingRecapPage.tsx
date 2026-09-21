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
import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { StatsSummary } from "../components/StatsSummary"
import { trainingSessionService } from "../services/trainingSessionService"
import { useTrainingSession } from "../services/TrainingSessionContext"

export function TrainingRecapPage() {
  const { session, sessionStats, sessionComplete, discardSession } = useTrainingSession()
  const navigate = useNavigate()
  // Captured once at mount, before the effect below clears it — read
  // directly from storage rather than through context state, so it's
  // available on this very first render with no timing dependency.
  const [justCompleted] = useState(() => trainingSessionService.getJustCompleted())

  useEffect(() => {
    trainingSessionService.clearJustCompleted()
  }, [])

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
      <p className="text-brand-muted">Niveaux : {session.levels.join(", ")}</p>

      <StatsSummary stats={sessionStats} levels={session.levels} />

      <Button type="button" onClick={handleNewSession}>
        Nouvelle session d'entraînement
      </Button>
    </PageContainer>
  )
}
