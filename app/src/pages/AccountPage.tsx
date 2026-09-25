// Story 1.3 — account access and profile reset, Story 1.4 (theme), and
// Story 1.5 (lifetime training statistics). Reached only through
// AppLayout, which only renders once a profile exists, so `profile` is
// never null here in practice.

import { Volume2, VolumeX } from "lucide-react"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useProfile } from "../services/ProfileContext"
import { useTrainingSession } from "../services/TrainingSessionContext"
import { CATEGORY_OPTIONS } from "../types/profile"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { RankCountsSummary } from "../components/RankCountsSummary"
import { StatsSummary } from "../components/StatsSummary"
import { ThemeToggle } from "../components/ThemeToggle"

export function AccountPage() {
  const { profile, resetProfile, setSoundEnabled } = useProfile()
  const { globalStats, rankCounts, resetTrainingData } = useTrainingSession()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  if (!profile) return null

  const category = CATEGORY_OPTIONS.find((option) => option.code === profile.category)
  const soundEnabled = profile.soundEnabled ?? true
  const hasAnyStats = Object.values(globalStats).some((tierStats) => tierStats.skipped + tierStats.found + tierStats.notFound > 0)

  function handleConfirmReset() {
    dialogRef.current?.close()
    resetTrainingData()
    resetProfile()
    navigate("/profil/creation", { replace: true })
  }

  return (
    <PageContainer gap="gap-8">
      <h1 className="text-3xl font-bold">Mon compte</h1>

      <section className="flex flex-col gap-1">
        <p>
          <span className="font-semibold">Prénom :</span> {profile.name}
        </p>
        <p>
          <span className="font-semibold">Catégorie :</span> {category?.label ?? profile.category}
        </p>
      </section>

      {/* Each top-level block after the identity one is separated by a thin
          rule, same as the reset block at the bottom. */}
      <section className="flex flex-col gap-2 border-t border-brand-line pt-6">
        <h2 className="text-xl font-bold">Thème</h2>
        <ThemeToggle />
      </section>

      <section className="flex flex-col gap-2 border-t border-brand-line pt-6">
        <h2 className="text-xl font-bold">Sons</h2>
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex w-fit cursor-pointer items-center gap-2 self-start rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          {soundEnabled ? "Sons activés" : "Sons désactivés"}
        </button>
      </section>

      <section className="flex flex-col gap-2 border-t border-brand-line pt-6">
        <h2 className="text-xl font-bold">Statistiques des entraînements</h2>
        {hasAnyStats ? (
          <>
            <p className="text-sm text-brand-muted">Cumulées depuis la création de ton profil.</p>
            <div className="flex flex-col gap-6">
              <RankCountsSummary counts={rankCounts} />
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold">Questions rencontrées</h3>
                <StatsSummary stats={globalStats} />
              </div>
            </div>
          </>
        ) : (
          <p className="text-brand-muted">
            Pas encore de statistiques : elles apparaîtront une fois que tu auras commencé à t'entraîner.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2 border-t border-brand-line pt-6">
        <Button type="button" variant="danger" onClick={() => dialogRef.current?.showModal()}>
          Réinitialiser mon profil
        </Button>
      </section>

      <dialog
        ref={dialogRef}
        className="m-auto max-w-sm rounded-xl border border-brand-line bg-brand-bg p-6 text-brand-text backdrop:bg-black/40"
      >
        <p className="mb-4">
          Toutes tes données (profil et progression) sont stockées uniquement sur cet appareil. Si tu confirmes,
          elles seront définitivement effacées.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="cursor-pointer rounded-lg px-4 py-2 font-semibold hover:bg-brand-surface"
            onClick={() => dialogRef.current?.close()}
          >
            Annuler
          </button>
          <Button type="button" variant="danger" onClick={handleConfirmReset}>
            Confirmer la réinitialisation
          </Button>
        </div>
      </dialog>
    </PageContainer>
  )
}
