import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test } from "vitest"
import { TrainingRecapPage } from "./TrainingRecapPage"
import { trainingSessionService } from "../services/trainingSessionService"
import { TrainingSessionProvider } from "../services/TrainingSessionContext"

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/entrainement/recap"]}>
      <TrainingSessionProvider>
        <Routes>
          <Route path="/entrainement/recap" element={<TrainingRecapPage />} />
          <Route path="/entrainement/configuration" element={<div>Configuration</div>} />
        </Routes>
      </TrainingSessionProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
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
