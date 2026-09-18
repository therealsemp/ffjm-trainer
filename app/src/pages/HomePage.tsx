// Placeholder landing page once a profile exists. Everything past this
// point (training, archives...) is a later story — this page only proves
// the profile-detection/creation flow works end to end.

import { Archive, Dumbbell } from "lucide-react"
import type { ReactNode } from "react"
import { Link, Navigate } from "react-router-dom"
import { PageContainer } from "../components/PageContainer"
import { useProfile } from "../services/ProfileContext"
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

export function HomePage() {
  const { profile } = useProfile()

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
          icon={<Archive size={40} />}
          title="Consulter les archives"
          description="Fonctionnalité en construction, elle arrive bientôt !"
          disabled
        />
      </div>
    </PageContainer>
  )
}
