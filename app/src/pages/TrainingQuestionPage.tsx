// Story 2.2 — question flow, with real content (statement/answer/
// correction) rendered via RichContent.

import { ChartColumn, ChevronsRight, ThumbsDown, ThumbsUp, TriangleAlert } from "lucide-react"
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { QuestionHeader } from "../components/QuestionHeader"
import { RichContent } from "../components/RichContent"
import { SessionProgressBar } from "../components/SessionProgressBar"
import { StatsSummary } from "../components/StatsSummary"
import { useProfile } from "../services/ProfileContext"
import { questionMetadataService } from "../services/questionMetadataService"
import { useQuestionLists } from "../services/QuestionListsContext"
import { questionService } from "../services/questionService"
import { playSound } from "../services/soundEffects"
import { trainingSessionService } from "../services/trainingSessionService"
import { useTrainingSession } from "../services/TrainingSessionContext"
import { PHASE_LABELS, type Question, type Tier } from "../types/question"

function SelfAssessmentButtons({ onFound, onNotFound }: { onFound: () => void; onNotFound: () => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={onFound} className="flex items-center gap-2">
        <ThumbsUp size={18} />
        J'avais trouvé
      </Button>
      <button
        type="button"
        onClick={onNotFound}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
      >
        <ThumbsDown size={18} />
        Je n'avais pas trouvé
      </button>
    </div>
  )
}

export function TrainingQuestionPage() {
  const { profile } = useProfile()
  const { session, sessionStats, sessionOutcomes, recordSkip, recordFound, recordNotFound } = useTrainingSession()
  const { recordMistake, clearMistake } = useQuestionLists()
  const navigate = useNavigate()
  // Captured once at mount, not read reactively from context: a session
  // that's already complete when this page is first reached (stale link,
  // direct nav) should redirect away, but `sessionComplete` itself flips to
  // true mid-session the instant the completing action is recorded — using
  // it reactively here raced against this component's own navigate() to
  // the recap on that very same action, and won, bouncing to configuration
  // instead of showing the recap.
  const [wasAlreadyComplete] = useState(() => {
    const activeSession = trainingSessionService.getActiveSession()
    return (
      activeSession !== null &&
      trainingSessionService.isComplete(activeSession, trainingSessionService.getSessionOutcomes().length)
    )
  })
  const [question, setQuestion] = useState<Question | null>(null)
  const [revealed, setRevealed] = useState(false)
  const statsDialogRef = useRef<HTMLDialogElement>(null)
  const correctionEndRef = useRef<HTMLDivElement>(null)
  // Forces the draw to a specific question via ?q=<id> — handy to reach an
  // exact question (e.g. an edge case) that the weighted random draw would
  // make impractical to hit by clicking through the app.
  const [searchParams] = useSearchParams()
  const forcedQuestionId = searchParams.get("q")

  function scrollToCorrectionEnd(event: MouseEvent) {
    event.preventDefault()
    correctionEndRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function drawNext(levels: Tier[]) {
    let id = forcedQuestionId
    if (!id) {
      const tier = questionMetadataService.pickWeightedTier(levels)
      const metadata = await questionMetadataService.pickRandomQuestionInTier(
        tier,
        session?.includeWithoutDetailedCorrection ?? false,
      )
      id = metadata.id
    }
    const full = await questionService.getQuestion(id)
    setQuestion(full)
    setRevealed(false)
  }

  useEffect(() => {
    if (session) void drawNext(session.levels)
    // Draw once on mount only — later draws are triggered explicitly by
    // the action handlers below, not by session/question changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!session) return <Navigate to="/entrainement/configuration" replace />
  // Reaching this page with an already-complete session (stale link, direct
  // nav) isn't "just finished" — send it to configuration like any other
  // completed session, not to the recap (see TrainingRecapPage).
  if (wasAlreadyComplete) return <Navigate to="/entrainement/configuration" replace />
  if (!question) {
    return (
      <PageContainer wide>
        <p className="text-brand-muted">Chargement de la question...</p>
      </PageContainer>
    )
  }

  const basePath = `${import.meta.env.BASE_URL}data/${question.year}/${question.phase}`

  function handleSkip() {
    recordSkip(question!.tier)
    void drawNext(session!.levels)
  }
  const soundEnabled = profile?.soundEnabled ?? true

  // The answer that completes the session plays no answer sound: the recap
  // plays the rank's own sound instead (Story 2.7), rather than two sounds
  // back to back.
  // Story 4.1: every self-assessment, the completing one included, also
  // updates the profile's mistakes list; skipping never does.
  function handleFound() {
    clearMistake(question!.id)
    const completed = recordFound(question!.tier)
    if (completed) {
      navigate("/entrainement/recap")
      return
    }
    if (soundEnabled) playSound("ok")
    void drawNext(session!.levels)
  }
  function handleNotFound() {
    recordMistake(question!.id)
    const completed = recordNotFound(question!.tier)
    if (completed) {
      navigate("/entrainement/recap")
      return
    }
    if (soundEnabled) playSound("ko")
    void drawNext(session!.levels)
  }

  return (
    <PageContainer wide>
      <QuestionHeader
        question={question}
        subtitle={`${question.year} · ${PHASE_LABELS[question.phase]}`}
        actions={
          <button
            type="button"
            onClick={() => statsDialogRef.current?.showModal()}
            title="Statistiques de la session"
            aria-label="Statistiques de la session"
            className="flex cursor-pointer items-center rounded-lg border border-brand-line p-2 hover:bg-brand-surface"
          >
            <ChartColumn size={18} />
          </button>
        }
      />

      {session.targetCount !== null && (
        <div className="-my-2">
          <SessionProgressBar outcomes={sessionOutcomes} target={session.targetCount} />
        </div>
      )}

      <dialog
        ref={statsDialogRef}
        className="m-auto max-w-md rounded-xl border border-brand-line bg-brand-bg p-6 text-brand-text backdrop:bg-black/40"
      >
        <h2 className="mb-4 text-xl font-bold">Statistiques de la session</h2>
        <StatsSummary stats={sessionStats} levels={session.levels} />
        <button
          type="button"
          onClick={() => statsDialogRef.current?.close()}
          className="mt-4 cursor-pointer rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
        >
          Fermer
        </button>
      </dialog>

      <div className="rounded-xl border border-brand-line bg-brand-surface p-4">
        <RichContent content={question.statement} basePath={basePath} />
      </div>

      {questionMetadataService.isAboveCM(question.tier) && (
        <details className="rounded-lg border-l-4 border-brand-gold bg-brand-gold/10 p-3 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold">
            <TriangleAlert size={16} />
            Règlement officiel FFJM sur le nombre de solutions
          </summary>
          <p className="mt-2">
            Attention&nbsp;! Pour qu'un problème soit complètement résolu, vous devez donner le nombre de ses
            solutions, et donner la solution s'il n'en a qu'une, ou deux solutions s'il en a plus d'une. Pour tous
            les problèmes susceptibles d'avoir plusieurs solutions, l'emplacement a été prévu pour écrire deux
            solutions (mais il se peut qu'il n'y en ait qu'une !)
          </p>
        </details>
      )}

      <div className="flex flex-wrap gap-3">
        {!revealed && (
          <Button type="button" onClick={() => setRevealed(true)}>
            Vérifier ma réponse
          </Button>
        )}
        <button
          type="button"
          onClick={handleSkip}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
        >
          Ignorer
          <ChevronsRight size={18} />
        </button>
      </div>

      {revealed && (
        <>
          <div className="flex flex-col gap-4 rounded-xl border-2 border-brand-gold bg-brand-gold/10 p-4">
            <p className="text-lg">
              <span className="font-semibold">Réponse :</span>{" "}
              {question.answer.value !== undefined ? (
                question.answer.value
              ) : (
                <a
                  href="#correction-end"
                  onClick={scrollToCorrectionEnd}
                  className="underline decoration-2 underline-offset-2 hover:text-brand-blue"
                >
                  voir la réponse en image à la fin de l'explication détaillée
                </a>
              )}
            </p>
            <SelfAssessmentButtons onFound={handleFound} onNotFound={handleNotFound} />
          </div>

          {question.correction && (
            <div className="flex flex-col gap-4 rounded-xl border border-brand-line bg-brand-surface p-4">
              <h2 className="text-lg font-bold">Explication détaillée</h2>
              <RichContent content={question.correction} basePath={basePath} />
              <div id="correction-end" ref={correctionEndRef} />
              <SelfAssessmentButtons onFound={handleFound} onNotFound={handleNotFound} />
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
