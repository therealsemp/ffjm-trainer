// Story 4.3 — "Mes favoris": every favorite, most recently added first.

import { PageContainer } from "../components/PageContainer"
import { QuestionListView } from "../components/QuestionListView"
import { formatListDate } from "../services/formatListDate"
import { useQuestionLists } from "../services/QuestionListsContext"

export function FavoritesPage() {
  const { favorites } = useQuestionLists()
  const items = favorites.map((entry) => ({
    questionId: entry.questionId,
    dateLabel: `Ajouté le ${formatListDate(entry.addedAt)}`,
  }))

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Mes favoris</h1>
      <QuestionListView
        items={items}
        linkBase="/favoris"
        empty={
          <p className="text-brand-muted">
            Pas encore de favoris : ajoute une question à tes favoris avec le signet affiché à côté de son titre.
          </p>
        }
      />
    </PageContainer>
  )
}
