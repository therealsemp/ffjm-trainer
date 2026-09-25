import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, test } from "vitest"
import { AccountPage } from "./AccountPage"
import { ProfileProvider } from "../services/ProfileContext"
import { profileService } from "../services/profileService"
import { ThemeProvider } from "../services/ThemeContext"
import { trainingSessionService } from "../services/trainingSessionService"
import { TrainingSessionProvider } from "../services/TrainingSessionContext"

function renderPage() {
  profileService.createProfile({ name: "Julien", category: "HC" })
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <ProfileProvider>
          <TrainingSessionProvider>
            <AccountPage />
          </TrainingSessionProvider>
        </ProfileProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

function completeSession(found: number, target: number) {
  trainingSessionService.startSession(["CE"], target, false)
  for (let i = 0; i < found; i++) trainingSessionService.recordFound("CE")
  for (let i = found; i < target; i++) trainingSessionService.recordNotFound("CE")
  trainingSessionService.completeSession(trainingSessionService.getActiveSession()!)
}

beforeEach(() => {
  window.localStorage.clear()
})

describe("AccountPage — sessions per rank (Story 1.5)", () => {
  test("shows a chip per obtained rank, highest first", () => {
    completeSession(7, 10)
    completeSession(3, 5)
    completeSession(10, 10)
    renderPage()
    expect(screen.getByRole("heading", { name: "Sessions par rang" })).toBeInTheDocument()
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "S+1 session",
      "A2 sessions",
    ])
  })

  test("no per-rank part when the profile trained without completing a targeted session", () => {
    trainingSessionService.startSession(["CE"], null, false)
    trainingSessionService.recordFound("CE")
    renderPage()
    expect(screen.getByText("Cumulées depuis la création de ton profil.")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Sessions par rang" })).not.toBeInTheDocument()
  })
})
