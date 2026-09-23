import { beforeEach, describe, expect, test } from "vitest"
import { trainingSessionService } from "./trainingSessionService"

beforeEach(() => {
  window.localStorage.clear()
})

describe("trainingSessionService — session lifecycle", () => {
  test("getActiveSession is null before any session starts", () => {
    expect(trainingSessionService.getActiveSession()).toBeNull()
  })

  test("startSession stores the session and resets its stats/outcomes", () => {
    trainingSessionService.startSession(["CE", "CM"], 10)
    expect(trainingSessionService.getActiveSession()).toEqual({ levels: ["CE", "CM"], targetCount: 10 })
    expect(trainingSessionService.getSessionOutcomes()).toEqual([])
  })

  test("startSession accepts targetCount: null (unlimited)", () => {
    trainingSessionService.startSession(["CE"], null)
    expect(trainingSessionService.getActiveSession()).toEqual({ levels: ["CE"], targetCount: null })
  })

  test("clearSession removes the session but not the global stats", () => {
    trainingSessionService.startSession(["CE"], 5)
    trainingSessionService.recordFound("CE")
    trainingSessionService.clearSession()
    expect(trainingSessionService.getActiveSession()).toBeNull()
    expect(trainingSessionService.getSessionOutcomes()).toEqual([])
    expect(trainingSessionService.getGlobalStats().CE.found).toBe(1)
  })

  test("a corrupted stored session is treated as no session", () => {
    window.localStorage.setItem("ffjm-trainer:trainingSession", JSON.stringify({ levels: "not-an-array" }))
    expect(trainingSessionService.getActiveSession()).toBeNull()
  })
})

describe("trainingSessionService — isComplete", () => {
  test("an unlimited session (targetCount: null) is never complete", () => {
    const session = { levels: ["CE" as const], targetCount: null }
    expect(trainingSessionService.isComplete(session, 0)).toBe(false)
    expect(trainingSessionService.isComplete(session, 1000)).toBe(false)
  })

  test("a targeted session is incomplete below the target", () => {
    const session = { levels: ["CE" as const], targetCount: 10 }
    expect(trainingSessionService.isComplete(session, 9)).toBe(false)
  })

  test("a targeted session is complete once the target is reached", () => {
    const session = { levels: ["CE" as const], targetCount: 10 }
    expect(trainingSessionService.isComplete(session, 10)).toBe(true)
  })

  test("a targeted session stays complete past the target", () => {
    const session = { levels: ["CE" as const], targetCount: 10 }
    expect(trainingSessionService.isComplete(session, 11)).toBe(true)
  })
})

describe("trainingSessionService — recording actions", () => {
  test("recordFound increments both session and global stats for the right tier, and appends an outcome", () => {
    trainingSessionService.startSession(["CE"], null)
    trainingSessionService.recordFound("CE")
    expect(trainingSessionService.getSessionStats().CE).toEqual({ skipped: 0, found: 1, notFound: 0 })
    expect(trainingSessionService.getGlobalStats().CE).toEqual({ skipped: 0, found: 1, notFound: 0 })
    expect(trainingSessionService.getSessionOutcomes()).toEqual(["found"])
  })

  test("recordNotFound increments notFound and appends an outcome", () => {
    trainingSessionService.startSession(["CM"], null)
    trainingSessionService.recordNotFound("CM")
    expect(trainingSessionService.getSessionStats().CM.notFound).toBe(1)
    expect(trainingSessionService.getSessionOutcomes()).toEqual(["notFound"])
  })

  test("recordSkip increments skipped but does not append an outcome", () => {
    trainingSessionService.startSession(["C1"], null)
    trainingSessionService.recordSkip("C1")
    expect(trainingSessionService.getSessionStats().C1.skipped).toBe(1)
    expect(trainingSessionService.getSessionOutcomes()).toEqual([])
  })

  test("global stats accumulate across sessions, session stats reset each time", () => {
    trainingSessionService.startSession(["CE"], null)
    trainingSessionService.recordFound("CE")
    trainingSessionService.startSession(["CE"], null)
    expect(trainingSessionService.getSessionStats().CE.found).toBe(0)
    expect(trainingSessionService.getGlobalStats().CE.found).toBe(1)
  })

  test("resetGlobalStats clears lifetime stats only", () => {
    trainingSessionService.startSession(["CE"], null)
    trainingSessionService.recordFound("CE")
    trainingSessionService.resetGlobalStats()
    expect(trainingSessionService.getGlobalStats().CE.found).toBe(0)
  })
})

describe("trainingSessionService — just-completed flag", () => {
  test("defaults to false, can be set and cleared", () => {
    expect(trainingSessionService.getJustCompleted()).toBe(false)
    trainingSessionService.markJustCompleted()
    expect(trainingSessionService.getJustCompleted()).toBe(true)
    trainingSessionService.clearJustCompleted()
    expect(trainingSessionService.getJustCompleted()).toBe(false)
  })

  test("startSession clears a stale just-completed flag from a previous session", () => {
    trainingSessionService.markJustCompleted()
    trainingSessionService.startSession(["CE"], null)
    expect(trainingSessionService.getJustCompleted()).toBe(false)
  })
})
