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
    trainingSessionService.startSession(["CE", "CM"], 10, false)
    expect(trainingSessionService.getActiveSession()).toEqual({
      levels: ["CE", "CM"],
      targetCount: 10,
      includeWithoutDetailedCorrection: false,
    })
    expect(trainingSessionService.getSessionOutcomes()).toEqual([])
  })

  test("startSession accepts targetCount: null (unlimited)", () => {
    trainingSessionService.startSession(["CE"], null, false)
    expect(trainingSessionService.getActiveSession()).toEqual({
      levels: ["CE"],
      targetCount: null,
      includeWithoutDetailedCorrection: false,
    })
  })

  test("startSession records includeWithoutDetailedCorrection: true when asked", () => {
    trainingSessionService.startSession(["CE"], null, true)
    expect(trainingSessionService.getActiveSession()?.includeWithoutDetailedCorrection).toBe(true)
  })

  test("clearSession removes the session but not the global stats", () => {
    trainingSessionService.startSession(["CE"], 5, false)
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
    trainingSessionService.startSession(["CE"], null, false)
    trainingSessionService.recordFound("CE")
    expect(trainingSessionService.getSessionStats().CE).toEqual({ skipped: 0, found: 1, notFound: 0 })
    expect(trainingSessionService.getGlobalStats().CE).toEqual({ skipped: 0, found: 1, notFound: 0 })
    expect(trainingSessionService.getSessionOutcomes()).toEqual(["found"])
  })

  test("recordNotFound increments notFound and appends an outcome", () => {
    trainingSessionService.startSession(["CM"], null, false)
    trainingSessionService.recordNotFound("CM")
    expect(trainingSessionService.getSessionStats().CM.notFound).toBe(1)
    expect(trainingSessionService.getSessionOutcomes()).toEqual(["notFound"])
  })

  test("recordSkip increments skipped but does not append an outcome", () => {
    trainingSessionService.startSession(["C1"], null, false)
    trainingSessionService.recordSkip("C1")
    expect(trainingSessionService.getSessionStats().C1.skipped).toBe(1)
    expect(trainingSessionService.getSessionOutcomes()).toEqual([])
  })

  test("global stats accumulate across sessions, session stats reset each time", () => {
    trainingSessionService.startSession(["CE"], null, false)
    trainingSessionService.recordFound("CE")
    trainingSessionService.startSession(["CE"], null, false)
    expect(trainingSessionService.getSessionStats().CE.found).toBe(0)
    expect(trainingSessionService.getGlobalStats().CE.found).toBe(1)
  })

  test("resetGlobalStats clears lifetime stats only", () => {
    trainingSessionService.startSession(["CE"], null, false)
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
    trainingSessionService.startSession(["CE"], null, false)
    expect(trainingSessionService.getJustCompleted()).toBe(false)
  })
})

describe("trainingSessionService — rank counts (Story 2.7)", () => {
  function completeTargetedSession(found: number, notFound: number) {
    trainingSessionService.startSession(["CE"], found + notFound, false)
    for (let i = 0; i < found; i++) trainingSessionService.recordFound("CE")
    for (let i = 0; i < notFound; i++) trainingSessionService.recordNotFound("CE")
    return trainingSessionService.completeSession(trainingSessionService.getActiveSession()!)
  }

  test("empty before any session is ranked", () => {
    expect(trainingSessionService.getRankCounts()).toEqual({})
  })

  test("completeSession returns the rank, counts it, and sets the just-completed flag", () => {
    expect(completeTargetedSession(7, 3)).toBe("A")
    expect(trainingSessionService.getRankCounts()).toEqual({ A: 1 })
    expect(trainingSessionService.getJustCompleted()).toBe(true)
  })

  test("skipped questions don't affect the rank", () => {
    trainingSessionService.startSession(["CE"], 5, false)
    for (let i = 0; i < 6; i++) trainingSessionService.recordSkip("CE")
    for (let i = 0; i < 5; i++) trainingSessionService.recordFound("CE")
    expect(trainingSessionService.completeSession(trainingSessionService.getActiveSession()!)).toBe("S")
  })

  test("counts accumulate across sessions, per rank", () => {
    completeTargetedSession(10, 0)
    completeTargetedSession(7, 3)
    completeTargetedSession(6, 4)
    expect(trainingSessionService.getRankCounts()).toEqual({ "S+": 1, A: 2 })
  })

  test("an unlimited session is never ranked", () => {
    trainingSessionService.startSession(["CE"], null, false)
    trainingSessionService.recordFound("CE")
    expect(trainingSessionService.completeSession(trainingSessionService.getActiveSession()!)).toBeNull()
    expect(trainingSessionService.getRankCounts()).toEqual({})
  })

  test("starting or clearing a session leaves rank counts untouched", () => {
    completeTargetedSession(5, 0)
    trainingSessionService.clearSession()
    trainingSessionService.startSession(["CE"], 10, false)
    expect(trainingSessionService.getRankCounts()).toEqual({ S: 1 })
  })

  test("resetGlobalStats clears rank counts too", () => {
    completeTargetedSession(5, 0)
    trainingSessionService.resetGlobalStats()
    expect(trainingSessionService.getRankCounts()).toEqual({})
  })

  test.each([
    ["not an object", "oops"],
    ["an array", ["S"]],
    ["an unknown rank", { Z: 1 }],
    ["a negative count", { A: -1 }],
    ["a non-integer count", { A: 1.5 }],
  ])("a stored value that is %s is treated as empty", (_label, value) => {
    window.localStorage.setItem("ffjm-trainer:trainingRankCounts", JSON.stringify(value))
    expect(trainingSessionService.getRankCounts()).toEqual({})
  })
})
