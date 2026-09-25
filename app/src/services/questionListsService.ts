// Epic 4 — favorites (Story 4.2) and the mistakes list (Story 4.1). Two
// independent storage keys: nothing ever moves a question from one list to
// the other. Both arrays are kept sorted most recent first as they're
// written, so readers never re-sort. Both belong to the profile: only a
// profile reset clears them (Story 1.3), never a new training session.

import type { FavoriteEntry, MistakeEntry } from "../types/questionLists"
import { storage } from "./storage"

const FAVORITES_KEY = "favorites"
const MISTAKES_KEY = "mistakes"

export const MISTAKES_LIMIT = 100

function isValidEntries(value: unknown, dateField: "addedAt" | "lastMistakeAt"): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as Record<string, unknown>).questionId === "string" &&
        typeof (entry as Record<string, unknown>)[dateField] === "string",
    )
  )
}

function getFavorites(): FavoriteEntry[] {
  const stored = storage.get<FavoriteEntry[]>(FAVORITES_KEY)
  return stored && isValidEntries(stored, "addedAt") ? stored : []
}

function getMistakes(): MistakeEntry[] {
  const stored = storage.get<MistakeEntry[]>(MISTAKES_KEY)
  return stored && isValidEntries(stored, "lastMistakeAt") ? stored : []
}

export const questionListsService = {
  getFavorites,
  getMistakes,

  isFavorite(questionId: string): boolean {
    return getFavorites().some((entry) => entry.questionId === questionId)
  },

  // Adds (dated `now`, at the top) or removes. Re-adding after a removal
  // counts as a new addition, with the new date.
  toggleFavorite(questionId: string, now: Date = new Date()): void {
    const favorites = getFavorites()
    const updated = favorites.some((entry) => entry.questionId === questionId)
      ? favorites.filter((entry) => entry.questionId !== questionId)
      : [{ questionId, addedAt: now.toISOString() }, ...favorites]
    storage.set(FAVORITES_KEY, updated satisfies FavoriteEntry[])
  },

  // "I didn't find it": the question goes (back) to the top with a fresh
  // date, never duplicated; past the limit, the oldest mistake drops off.
  recordMistake(questionId: string, now: Date = new Date()): void {
    const others = getMistakes().filter((entry) => entry.questionId !== questionId)
    const updated = [{ questionId, lastMistakeAt: now.toISOString() }, ...others].slice(0, MISTAKES_LIMIT)
    storage.set(MISTAKES_KEY, updated satisfies MistakeEntry[])
  },

  // "I found it": leaves the list if it was there, no-op otherwise.
  clearMistake(questionId: string): void {
    const mistakes = getMistakes()
    if (!mistakes.some((entry) => entry.questionId === questionId)) return
    storage.set(
      MISTAKES_KEY,
      mistakes.filter((entry) => entry.questionId !== questionId) satisfies MistakeEntry[],
    )
  },

  // Only called from profile reset (Story 1.3).
  resetAll(): void {
    storage.remove(FAVORITES_KEY)
    storage.remove(MISTAKES_KEY)
  },
}
