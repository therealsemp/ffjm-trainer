// React wiring around questionListsService — same pattern as
// ProfileContext/TrainingSessionContext.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { questionListsService } from "./questionListsService"
import type { FavoriteEntry, MistakeEntry } from "../types/questionLists"

interface QuestionListsContextValue {
  // Most recent first.
  favorites: FavoriteEntry[]
  mistakes: MistakeEntry[]
  isFavorite: (questionId: string) => boolean
  toggleFavorite: (questionId: string) => void
  // Story 4.1, called on training self-assessment.
  recordMistake: (questionId: string) => void
  clearMistake: (questionId: string) => void
  // Story 1.3 profile reset.
  resetQuestionLists: () => void
}

const QuestionListsContext = createContext<QuestionListsContextValue | null>(null)

export function QuestionListsProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() => questionListsService.getFavorites())
  const [mistakes, setMistakes] = useState<MistakeEntry[]>(() => questionListsService.getMistakes())

  const value = useMemo<QuestionListsContextValue>(
    () => ({
      favorites,
      mistakes,
      isFavorite: (questionId) => favorites.some((entry) => entry.questionId === questionId),
      toggleFavorite: (questionId) => {
        questionListsService.toggleFavorite(questionId)
        setFavorites(questionListsService.getFavorites())
      },
      recordMistake: (questionId) => {
        questionListsService.recordMistake(questionId)
        setMistakes(questionListsService.getMistakes())
      },
      clearMistake: (questionId) => {
        questionListsService.clearMistake(questionId)
        setMistakes(questionListsService.getMistakes())
      },
      resetQuestionLists: () => {
        questionListsService.resetAll()
        setFavorites([])
        setMistakes([])
      },
    }),
    [favorites, mistakes],
  )

  return <QuestionListsContext.Provider value={value}>{children}</QuestionListsContext.Provider>
}

export function useQuestionLists(): QuestionListsContextValue {
  const context = useContext(QuestionListsContext)
  if (!context) {
    throw new Error("useQuestionLists must be used within a QuestionListsProvider")
  }
  return context
}
