import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test } from "vitest"
import { SessionConfigPage } from "./SessionConfigPage"
import { ProfileProvider } from "../services/ProfileContext"
import { profileService } from "../services/profileService"
import { trainingSessionService } from "../services/trainingSessionService"
import { TrainingSessionProvider } from "../services/TrainingSessionContext"

function renderPage() {
  profileService.createProfile({ name: "Julien", category: "HC" })
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <ProfileProvider>
        <TrainingSessionProvider>
          <Routes>
            <Route path="/" element={<SessionConfigPage />} />
            <Route path="/entrainement/question" element={<div>Question</div>} />
          </Routes>
        </TrainingSessionProvider>
      </ProfileProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe("SessionConfigPage — 'detailed solutions only' toggle", () => {
  test("defaults to on, labeled as restricting to detailed solutions", () => {
    renderPage()
    expect(screen.getByRole("checkbox", { name: "Solutions détaillées uniquement" })).toBeChecked()
    expect(screen.getByText("Avec solutions détaillées uniquement")).toBeInTheDocument()
  })

  test("turning it off changes the label to describe the broader inclusion", async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole("checkbox", { name: "Solutions détaillées uniquement" }))
    expect(screen.getByText("Inclut les questions avec solution mais sans explication")).toBeInTheDocument()
  })

  test("starting a session with the toggle on (default) records includeWithoutDetailedCorrection: false", async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole("checkbox", { name: "CE" }))
    await user.click(screen.getByRole("button", { name: "Commencer" }))
    expect(trainingSessionService.getActiveSession()?.includeWithoutDetailedCorrection).toBe(false)
  })

  test("turning it off and starting records includeWithoutDetailedCorrection: true", async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole("checkbox", { name: "CE" }))
    await user.click(screen.getByRole("checkbox", { name: "Solutions détaillées uniquement" }))
    await user.click(screen.getByRole("button", { name: "Commencer" }))
    expect(trainingSessionService.getActiveSession()?.includeWithoutDetailedCorrection).toBe(true)
  })
})
