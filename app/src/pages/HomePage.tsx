// Landing page once a profile exists: four stacked cards of the same model,
// the two main modes (training and archive consultation), then the two
// question lists (Story 4.6), each with its current count — a list's card
// only appears once that list holds at least one question.

import { Archive, Bookmark, CircleX, Dumbbell } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { Link, Navigate } from "react-router-dom"
import { PageContainer } from "../components/PageContainer"
import { useProfile } from "../services/ProfileContext"
import { useQuestionLists } from "../services/QuestionListsContext"
import { questionMetadataService } from "../services/questionMetadataService"
import { CATEGORY_OPTIONS } from "../types/profile"

// Home-page-only greeting nicknames, keyed by profile name (case-insensitive).
// Not business logic — purely cosmetic, so it stays local to this page
// rather than in profileService/types.
const GREETING_NICKNAMES: Record<string, string> = {
  constance: "poulette",
  paulin: "beau gosse",
  julien: "patron",
  raph: "chérie",
  raphaëlle: "chérie",
  raphaelle: "chérie",
}

function greetingNameFor(name: string): string {
  return GREETING_NICKNAMES[name.trim().toLowerCase()] ?? name
}

function HomeActionCard({
  to,
  icon,
  title,
  description,
  disabled = false,
}: {
  to?: string
  icon: ReactNode
  title: string
  description: string
  disabled?: boolean
}) {
  const content = (
    <div
      className={`flex min-h-32 items-stretch gap-5 rounded-2xl border p-5 ${
        disabled
          ? "border-brand-line bg-brand-surface/50"
          : "border-brand-line bg-brand-surface transition hover:-translate-y-0.5 hover:border-brand-blue"
      }`}
    >
      <div
        className={`flex w-24 shrink-0 items-center justify-center rounded-xl border-2 ${
          disabled ? "border-brand-line bg-brand-line/20 text-brand-muted" : "border-brand-gold/40 bg-brand-gold/15 text-brand-gold"
        }`}
      >
        {icon}
      </div>
      <div className="flex flex-col justify-center gap-1">
        <h2 className={`text-xl font-bold ${disabled ? "text-brand-muted" : ""}`}>{title}</h2>
        <p className="text-sm text-brand-muted">{description}</p>
      </div>
    </div>
  )

  if (disabled || !to) {
    return (
      <div className="cursor-not-allowed" aria-disabled="true">
        {content}
      </div>
    )
  }

  return (
    <Link to={to} className="block cursor-pointer">
      {content}
    </Link>
  )
}

// Story 4.6 — counts only questions still present in the data (a listed
// question removed since is ignored); null while the manifest loads.
function useExistingCount(questionIds: string[]): number | null {
  const [count, setCount] = useState<number | null>(null)
  const idsKey = questionIds.join("|")
  useEffect(() => {
    let cancelled = false
    void questionMetadataService.getExistingByIds(idsKey === "" ? [] : idsKey.split("|")).then((existing) => {
      if (!cancelled) setCount(existing.length)
    })
    return () => {
      cancelled = true
    }
  }, [idsKey])
  return count
}

function countLabel(count: number): string {
  return `${count} ${count > 1 ? "questions" : "question"}.`
}

export function HomePage() {
  const { profile } = useProfile()
  const { favorites, mistakes } = useQuestionLists()
  const favoritesCount = useExistingCount(favorites.map((entry) => entry.questionId))
  const mistakesCount = useExistingCount(mistakes.map((entry) => entry.questionId))

  if (!profile) return <Navigate to="/profil/creation" replace />

  const category = CATEGORY_OPTIONS.find((option) => option.code === profile.category)

  return (
    <PageContainer gap="gap-4">
      <h1 className="text-3xl font-bold">Salut {greetingNameFor(profile.name)} !</h1>
      <p className="text-brand-muted">Catégorie : {category?.label ?? profile.category}</p>

      <div className="mt-2 flex flex-col gap-4">
        <HomeActionCard
          to="/entrainement"
          icon={<Dumbbell size={40} />}
          title="S'entraîner"
          description="Crée des sessions d'entraînement pour essayer de résoudre des exercices piochés au hasard des épreuves de la FFJM."
        />
        <HomeActionCard
          to="/archives"
          icon={<Archive size={40} />}
          title="Consulter les archives"
          description="Parcours les épreuves complètes des éditions précédentes, question par question."
        />
        {/* Hidden while counting (null) and when empty: no card leading to
            an empty list. */}
        {favoritesCount !== null && favoritesCount > 0 && (
          <HomeActionCard
            to="/favoris"
            icon={<Bookmark size={40} />}
            title="Mes favoris"
            description={`Les questions que tu as mises de côté avec le signet. ${countLabel(favoritesCount)}`}
          />
        )}
        {mistakesCount !== null && mistakesCount > 0 && (
          <HomeActionCard
            to="/erreurs"
            icon={<CircleX size={40} />}
            title="Mes erreurs"
            description={`Les questions que tu n'as pas trouvées en entraînement, jusqu'à ce que tu les trouves. ${countLabel(mistakesCount)}`}
          />
        )}
      </div>
    </PageContainer>
  )
}
