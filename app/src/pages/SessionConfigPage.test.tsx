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

describe("SessionConfigPage — 'include without detailed correction' toggle", () => {
  test("defaults to off", () => {
    renderPage()
    expect(screen.getByRole("checkbox", { name: "Inclure les questions sans solution détaillée" })).not.toBeChecked()
  })

  test("starting a session with the toggle off records includeWithoutDetailedCorrection: false", async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole("checkbox", { name: "CE" }))
    await user.click(screen.getByRole("button", { name: "Commencer" }))
    expect(trainingSessionService.getActiveSession()?.includeWithoutDetailedCorrection).toBe(false)
  })

  test("toggling it on and starting records includeWithoutDetailedCorrection: true", async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole("checkbox", { name: "CE" }))
    await user.click(screen.getByRole("checkbox", { name: "Inclure les questions sans solution détaillée" }))
    await user.click(screen.getByRole("button", { name: "Commencer" }))
    expect(trainingSessionService.getActiveSession()?.includeWithoutDetailedCorrection).toBe(true)
  })
})
