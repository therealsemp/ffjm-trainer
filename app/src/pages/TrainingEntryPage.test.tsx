import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test } from "vitest"
import { TrainingEntryPage } from "./TrainingEntryPage"
import { trainingSessionService } from "../services/trainingSessionService"
import { TrainingSessionProvider } from "../services/TrainingSessionContext"

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/entrainement"]}>
      <TrainingSessionProvider>
        <Routes>
          <Route path="/entrainement" element={<TrainingEntryPage />} />
          <Route path="/entrainement/configuration" element={<div>Configuration</div>} />
        </Routes>
      </TrainingSessionProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe("TrainingEntryPage — compact session summary (Story 2.5)", () => {
  test("a targeted session shows its levels, a 'Progression' line and the progress bar", () => {
    trainingSessionService.startSession(["CE", "CM"], 10, false)
    trainingSessionService.recordSkip("CE")
    trainingSessionService.recordFound("CE")
    trainingSessionService.recordNotFound("CM")
    renderPage()
    expect(screen.getByText("Niveaux : CE, CM")).toBeInTheDocument()
    expect(screen.getByText("Progression : 2 / 10 questions")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Progression de la session : 2 sur 10 questions" })).toBeInTheDocument()
  })

  test("an unlimited session shows the answered count, without a progress bar", () => {
    trainingSessionService.startSession(["CE"], null, false)
    for (let i = 0; i < 3; i++) trainingSessionService.recordFound("CE")
    renderPage()
    expect(screen.getByText("Progression : 3 questions répondues (sans limite)")).toBeInTheDocument()
    expect(screen.queryByRole("img", { name: /Progression de la session/ })).not.toBeInTheDocument()
  })

  test("no detailed statistics and no 'Objectif' label anymore", () => {
    trainingSessionService.startSession(["CE"], 10, false)
    trainingSessionService.recordSkip("CE")
    renderPage()
    expect(screen.queryByText("Statistiques de la session")).not.toBeInTheDocument()
    expect(screen.queryByText("Ignorées")).not.toBeInTheDocument()
    expect(screen.queryByText(/Objectif/)).not.toBeInTheDocument()
  })

  test("a completed session redirects to configuration", () => {
    trainingSessionService.startSession(["CE"], 5, false)
    for (let i = 0; i < 5; i++) trainingSessionService.recordFound("CE")
    renderPage()
    expect(screen.getByText("Configuration")).toBeInTheDocument()
  })
})
