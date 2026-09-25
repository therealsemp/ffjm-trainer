// Story 4.2 — bookmark toggle: outlined when not a favorite, filled when
// it is; its accessible name states the action it performs. Filled, it
// takes the gold accent (a solid shape, clearly visible on either theme);
// outlined, it stays in the text color, since a thin gold stroke alone
// would be too faint on the light theme (gold is never used for thin
// foreground marks there, see index.css).

import { Bookmark } from "lucide-react"
import { useQuestionLists } from "../services/QuestionListsContext"

export function FavoriteButton({ questionId }: { questionId: string }) {
  const { isFavorite, toggleFavorite } = useQuestionLists()
  const favorite = isFavorite(questionId)
  const label = favorite ? "Retirer des favoris" : "Ajouter aux favoris"

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(questionId)}
      aria-label={label}
      aria-pressed={favorite}
      title={label}
      className={`flex shrink-0 cursor-pointer items-center rounded-lg p-1.5 hover:bg-brand-surface ${
        favorite ? "text-brand-gold" : "text-brand-text"
      }`}
    >
      <Bookmark size={22} fill={favorite ? "currentColor" : "none"} />
    </button>
  )
}
