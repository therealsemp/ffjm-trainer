// Epic 4 — the profile's two question lists. Each entry only identifies
// a question (its manifest id) and when it entered the list; everything
// else (title, edition, tier) is read from the question data when shown.
// Dates are ISO 8601 strings, as stored.

// Story 4.1 — latest status only: no counter, no attempt history.
export interface MistakeEntry {
  questionId: string
  lastMistakeAt: string
}

// Story 4.2
export interface FavoriteEntry {
  questionId: string
  addedAt: string
}
