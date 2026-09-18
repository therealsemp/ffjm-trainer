// Placeholder landing page once a profile exists. Everything past this
// point (training, archives...) is a later story — this page only proves
// the profile-detection/creation flow works end to end.

import { Navigate } from "react-router-dom"
import { useProfile } from "../services/ProfileContext"
import { CATEGORY_OPTIONS } from "../types/profile"

export function HomePage() {
  const { profile } = useProfile()

  if (!profile) return <Navigate to="/profil/creation" replace />

  const category = CATEGORY_OPTIONS.find((option) => option.code === profile.category)

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-8">
      <h1 className="text-3xl font-bold">Salut {profile.name} !</h1>
      <p className="text-brand-muted">Catégorie : {category?.label ?? profile.category}</p>
      <p className="rounded-lg border border-dashed border-brand-line p-4 text-brand-muted">
        Le reste de l'application est en construction.
      </p>
    </main>
  )
}
