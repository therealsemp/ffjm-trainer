// Story 4.4 — "Mes erreurs": the mistakes list (Story 4.1), most recent
// mistake first. Read-only as far as mistakes go: the bookmark here only
// acts on favorites.

import { PageContainer } from "../components/PageContainer"
import { QuestionListView } from "../components/QuestionListView"
import { formatListDate } from "../services/formatListDate"
import { useQuestionLists } from "../services/QuestionListsContext"

export function MistakesPage() {
  const { mistakes } = useQuestionLists()
  const items = mistakes.map((entry) => ({
    questionId: entry.questionId,
    dateLabel: `Ratée le ${formatListDate(entry.lastMistakeAt)}`,
  }))

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Mes erreurs</h1>
      <p className="text-brand-muted">
        Les questions que tu n'as pas trouvées en entraînement. Elles quittent la liste dès que tu les trouves lors
        d'une prochaine session.
      </p>
      <QuestionListView
        items={items}
        linkBase="/erreurs"
        empty={
          <p className="text-brand-muted">
            Aucune erreur pour l'instant : les questions que tu ne trouves pas en entraînement apparaîtront ici.
          </p>
        }
      />
    </PageContainer>
  )
}
