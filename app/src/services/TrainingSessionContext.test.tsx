import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, test } from "vitest"
import { TrainingSessionProvider, useTrainingSession } from "./TrainingSessionContext"
import { trainingSessionService } from "./trainingSessionService"

function wrapper({ children }: { children: ReactNode }) {
  return <TrainingSessionProvider>{children}</TrainingSessionProvider>
}

beforeEach(() => {
  window.localStorage.clear()
})

describe("TrainingSessionContext — ranking on completion (Story 2.7)", () => {
  test("the action that reaches the target saves the rank once and exposes it", () => {
    const { result } = renderHook(() => useTrainingSession(), { wrapper })
    act(() => result.current.startSession(["CE"], 5, false))
    for (let i = 0; i < 4; i++) {
      let completed = true
      act(() => {
        completed = result.current.recordFound("CE")
      })
      expect(completed).toBe(false)
    }
    let completed = false
    act(() => {
      completed = result.current.recordNotFound("CE")
    })
    expect(completed).toBe(true)
    expect(result.current.rankCounts).toEqual({ S: 1 })
    expect(trainingSessionService.getRankCounts()).toEqual({ S: 1 })
    expect(trainingSessionService.getJustCompleted()).toBe(true)
  })

  test("an action recorded after completion doesn't count the rank again", () => {
    const { result } = renderHook(() => useTrainingSession(), { wrapper })
    act(() => result.current.startSession(["CE"], 5, false))
    for (let i = 0; i < 5; i++) act(() => void result.current.recordFound("CE"))
    act(() => result.current.recordSkip("CE"))
    act(() => void result.current.recordFound("CE"))
    expect(trainingSessionService.getRankCounts()).toEqual({ S: 1 })
  })

  test("an unlimited session never saves a rank", () => {
    const { result } = renderHook(() => useTrainingSession(), { wrapper })
    act(() => result.current.startSession(["CE"], null, false))
    for (let i = 0; i < 25; i++) act(() => void result.current.recordFound("CE"))
    expect(result.current.rankCounts).toEqual({})
  })

  test("a session discarded before its target saves no rank", () => {
    const { result } = renderHook(() => useTrainingSession(), { wrapper })
    act(() => result.current.startSession(["CE"], 10, false))
    for (let i = 0; i < 9; i++) act(() => void result.current.recordFound("CE"))
    act(() => result.current.discardSession())
    expect(trainingSessionService.getRankCounts()).toEqual({})
  })

  test("resetTrainingData clears rank counts", () => {
    const { result } = renderHook(() => useTrainingSession(), { wrapper })
    act(() => result.current.startSession(["CE"], 5, false))
    for (let i = 0; i < 5; i++) act(() => void result.current.recordFound("CE"))
    act(() => result.current.resetTrainingData())
    expect(result.current.rankCounts).toEqual({})
    expect(trainingSessionService.getRankCounts()).toEqual({})
  })
})
