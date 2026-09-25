// Story 3.2's out-of-category warning, shared with list consultation
// (Story 4.5): informational only, never hides the question.

import { TriangleAlert } from "lucide-react"
import { useProfile } from "../services/ProfileContext"
import type { Question } from "../types/question"

export function OutOfCategoryWarning({ question }: { question: Question }) {
  const { profile } = useProfile()
  if (!profile || question.categories.includes(profile.category)) return null

  return (
    <p className="flex items-center gap-2 rounded-lg border-l-4 border-brand-danger bg-brand-danger/10 p-3 text-sm">
      <TriangleAlert size={16} />
      Cette question ne fait pas partie de ta catégorie ({profile.category}).
    </p>
  )
}
