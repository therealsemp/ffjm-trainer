import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { TrainingRecapPage } from "./TrainingRecapPage"
import { ProfileProvider } from "../services/ProfileContext"
import { profileService } from "../services/profileService"
import { playRankSound } from "../services/soundEffects"
import { trainingSessionService } from "../services/trainingSessionService"
import { TrainingSessionProvider } from "../services/TrainingSessionContext"

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/entrainement/recap"]}>
      <ProfileProvider>
        <TrainingSessionProvider>
          <Routes>
            <Route path="/entrainement/recap" element={<TrainingRecapPage />} />
            <Route path="/entrainement/configuration" element={<div>Configuration</div>} />
          </Routes>
        </TrainingSessionProvider>
      </ProfileProvider>
    </MemoryRouter>,
  )
}

vi.mock("../services/soundEffects", () => ({ playRankSound: vi.fn(), playSound: vi.fn() }))

function completeSession(found: number, target: number) {
  trainingSessionService.startSession(["CE"], target, false)
  for (let i = 0; i < found; i++) trainingSessionService.recordFound("CE")
  for (let i = found; i < target; i++) trainingSessionService.recordNotFound("CE")
  trainingSessionService.completeSession(trainingSessionService.getActiveSession()!)
}

beforeEach(() => {
  window.localStorage.clear()
  vi.mocked(playRankSound).mockClear()
})

describe("TrainingRecapPage — rank (Story 2.7)", () => {
  test("right after completing, shows the rank, the skipped counter and the per-level detail below", () => {
    trainingSessionService.startSession(["CE", "CM"], 10, false)
    trainingSessionService.recordSkip("CM")
    for (let i = 0; i < 7; i++) trainingSessionService.recordFound("CE")
    for (let i = 0; i < 3; i++) trainingSessionService.recordNotFound("CM")
    trainingSessionService.completeSession(trainingSessionService.getActiveSession()!)
    renderPage()

    expect(screen.getByRole("img", { name: "Rang A" })).toBeInTheDocument()
    expect(screen.getByText("Solide")).toBeInTheDocument()
    expect(screen.getByText("1 question passée")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Détail par niveau" })).toBeInTheDocument()
    expect(screen.getByText("Niveaux : CE, CM")).toBeInTheDocument()
  })

  test("displaying the recap doesn't count the rank again", () => {
    trainingSessionService.startSession(["CE"], 5, false)
    for (let i = 0; i < 5; i++) trainingSessionService.recordFound("CE")
    trainingSessionService.completeSession(trainingSessionService.getActiveSession()!)
    renderPage()
    expect(trainingSessionService.getRankCounts()).toEqual({ S: 1 })
  })

  test("without the just-completed flag (e.g. reload), redirects to configuration", () => {
    trainingSessionService.startSession(["CE"], 5, false)
    for (let i = 0; i < 5; i++) trainingSessionService.recordFound("CE")
    renderPage()
    expect(screen.getByText("Configuration")).toBeInTheDocument()
  })
})

describe("TrainingRecapPage — rank sound (Story 2.7)", () => {
  test("plays the obtained rank's sound once, right after completing", () => {
    completeSession(7, 10)
    renderPage()
    expect(playRankSound).toHaveBeenCalledExactlyOnceWith("A")
  })

  test("plays the S+ sound for a perfect 10-question session", () => {
    completeSession(10, 10)
    renderPage()
    expect(playRankSound).toHaveBeenCalledExactlyOnceWith("S+")
  })

  test("stays silent when the profile disabled sounds", () => {
    profileService.createProfile({ name: "Julien", category: "HC", soundEnabled: false })
    completeSession(7, 10)
    renderPage()
    expect(screen.getByRole("img", { name: "Rang A" })).toBeInTheDocument()
    expect(playRankSound).not.toHaveBeenCalled()
  })

  test("stays silent when redirected (no just-completed flag, e.g. reload)", () => {
    trainingSessionService.startSession(["CE"], 5, false)
    for (let i = 0; i < 5; i++) trainingSessionService.recordFound("CE")
    renderPage()
    expect(playRankSound).not.toHaveBeenCalled()
  })
})
