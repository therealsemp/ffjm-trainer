// Story 2.1 — session configuration.

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { SelectableCard } from "../components/SelectableCard"
import { useProfile } from "../services/ProfileContext"
import { questionMetadataService } from "../services/questionMetadataService"
import { useTrainingSession } from "../services/TrainingSessionContext"
import type { Tier } from "../types/question"

// Preset question counts offered for a fixed-length session; "Sans
// limite" (targetCount: null) keeps the previous, open-ended behavior.
const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const
const DEFAULT_TARGET_COUNT: number | null = 10

export function SessionConfigPage() {
  const { profile } = useProfile()
  const { startSession } = useTrainingSession()
  const navigate = useNavigate()

  const [selected, setSelected] = useState<Tier[]>([])
  const [targetCount, setTargetCount] = useState<number | null>(DEFAULT_TARGET_COUNT)
  const [error, setError] = useState<string | null>(null)

  if (!profile) return null

  const availableTiers = questionMetadataService.getAvailableTiers(profile.category)

  function toggleTier(tier: Tier) {
    setSelected((current) => (current.includes(tier) ? current.filter((t) => t !== tier) : [...current, tier]))
  }

  function handleStart() {
    if (selected.length === 0) {
      setError("Choisis au moins un niveau pour commencer.")
      return
    }
    startSession(selected, targetCount)
    navigate("/entrainement/question")
  }

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Configurer l'entraînement</h1>

      <div className="flex flex-col gap-2.5">
        <p className="text-brand-muted">Choisis le nombre de questions de la session.</p>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNT_OPTIONS.map((count) => (
            <SelectableCard
              key={count}
              type="radio"
              name="targetCount"
              value={String(count)}
              checked={targetCount === count}
              onChange={() => setTargetCount(count)}
            >
              <span className="font-heading font-bold">{count}</span>
            </SelectableCard>
          ))}
          <SelectableCard
            type="radio"
            name="targetCount"
            value="unlimited"
            checked={targetCount === null}
            onChange={() => setTargetCount(null)}
          >
            <span className="font-heading font-bold">Sans limite</span>
          </SelectableCard>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-brand-muted">Choisis les niveaux sur lesquels tu veux t'entraîner.</p>
        <button
          type="button"
          onClick={() => setSelected(availableTiers)}
          className="cursor-pointer self-start rounded-lg border border-brand-line px-3 py-1.5 font-medium whitespace-nowrap text-brand-text hover:bg-brand-surface"
        >
          Tout activer
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {availableTiers.map((tier) => (
          <SelectableCard
            key={tier}
            type="checkbox"
            name="levels"
            value={tier}
            checked={selected.includes(tier)}
            onChange={() => toggleTier(tier)}
          >
            <span className="font-heading text-lg font-bold">{tier}</span>
          </SelectableCard>
        ))}
      </div>

      {error && <p className="text-sm text-brand-danger">{error}</p>}

      <Button type="button" onClick={handleStart}>
        Commencer
      </Button>
    </PageContainer>
  )
}
