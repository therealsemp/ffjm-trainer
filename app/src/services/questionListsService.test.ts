import { beforeEach, describe, expect, test } from "vitest"
import { MISTAKES_LIMIT, questionListsService } from "./questionListsService"

const day = (n: number) => new Date(Date.UTC(2026, 8, n))

beforeEach(() => {
  window.localStorage.clear()
})

describe("questionListsService — favorites (Story 4.2)", () => {
  test("empty by default", () => {
    expect(questionListsService.getFavorites()).toEqual([])
    expect(questionListsService.isFavorite("a")).toBe(false)
  })

  test("toggling adds (most recent first) then removes", () => {
    questionListsService.toggleFavorite("a", day(1))
    questionListsService.toggleFavorite("b", day(2))
    expect(questionListsService.getFavorites().map((entry) => entry.questionId)).toEqual(["b", "a"])
    expect(questionListsService.isFavorite("a")).toBe(true)
    questionListsService.toggleFavorite("a", day(3))
    expect(questionListsService.getFavorites().map((entry) => entry.questionId)).toEqual(["b"])
  })

  test("re-adding after a removal counts as a new addition, back on top", () => {
    questionListsService.toggleFavorite("a", day(1))
    questionListsService.toggleFavorite("b", day(2))
    questionListsService.toggleFavorite("a", day(3))
    questionListsService.toggleFavorite("a", day(4))
    expect(questionListsService.getFavorites()).toEqual([
      { questionId: "a", addedAt: day(4).toISOString() },
      { questionId: "b", addedAt: day(2).toISOString() },
    ])
  })
})

describe("questionListsService — mistakes (Story 4.1)", () => {
  test("recording adds with the date, most recent first", () => {
    questionListsService.recordMistake("a", day(1))
    questionListsService.recordMistake("b", day(2))
    expect(questionListsService.getMistakes()).toEqual([
      { questionId: "b", lastMistakeAt: day(2).toISOString() },
      { questionId: "a", lastMistakeAt: day(1).toISOString() },
    ])
  })

  test("missing a listed question again moves it back to the top, without duplicate", () => {
    questionListsService.recordMistake("a", day(1))
    questionListsService.recordMistake("b", day(2))
    questionListsService.recordMistake("a", day(3))
    expect(questionListsService.getMistakes()).toEqual([
      { questionId: "a", lastMistakeAt: day(3).toISOString() },
      { questionId: "b", lastMistakeAt: day(2).toISOString() },
    ])
  })

  test("clearing removes a listed question, and is a no-op otherwise", () => {
    questionListsService.recordMistake("a", day(1))
    questionListsService.clearMistake("z")
    expect(questionListsService.getMistakes()).toHaveLength(1)
    questionListsService.clearMistake("a")
    expect(questionListsService.getMistakes()).toEqual([])
  })

  test(`keeps at most ${MISTAKES_LIMIT} questions, dropping the oldest`, () => {
    for (let i = 0; i < MISTAKES_LIMIT; i++) questionListsService.recordMistake(`q${i}`, new Date(Date.UTC(2026, 0, 1, 0, i)))
    questionListsService.recordMistake("new", day(20))
    const ids = questionListsService.getMistakes().map((entry) => entry.questionId)
    expect(ids).toHaveLength(MISTAKES_LIMIT)
    expect(ids[0]).toBe("new")
    expect(ids).not.toContain("q0")
    expect(ids).toContain("q1")
  })

  test("favorites and mistakes are independent", () => {
    questionListsService.recordMistake("a", day(1))
    questionListsService.toggleFavorite("a", day(1))
    questionListsService.clearMistake("a")
    expect(questionListsService.isFavorite("a")).toBe(true)
  })
})

describe("questionListsService — reset and corrupted storage", () => {
  test("resetAll erases both lists", () => {
    questionListsService.recordMistake("a", day(1))
    questionListsService.toggleFavorite("b", day(1))
    questionListsService.resetAll()
    expect(questionListsService.getMistakes()).toEqual([])
    expect(questionListsService.getFavorites()).toEqual([])
  })

  test.each([
    ["not an array", { a: 1 }],
    ["entries without a question id", [{ addedAt: "x", lastMistakeAt: "x" }]],
  ])("a stored value that is %s is treated as empty", (_label, value) => {
    window.localStorage.setItem("ffjm-trainer:favorites", JSON.stringify(value))
    window.localStorage.setItem("ffjm-trainer:mistakes", JSON.stringify(value))
    expect(questionListsService.getFavorites()).toEqual([])
    expect(questionListsService.getMistakes()).toEqual([])
  })
})
