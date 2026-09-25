import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { HomePage } from "./HomePage"
import { ProfileProvider } from "../services/ProfileContext"
import { profileService } from "../services/profileService"
import { questionListsService } from "../services/questionListsService"
import { QuestionListsProvider } from "../services/QuestionListsContext"
import { fixtureMetadata } from "../test/questionFixtures"

vi.mock("../services/questionMetadataService", () => ({ questionMetadataService: { getExistingByIds: vi.fn() } }))
import { questionMetadataService } from "../services/questionMetadataService"

vi.mocked(questionMetadataService.getExistingByIds).mockImplementation(async (ids: string[]) =>
  ids.flatMap((id) => {
    const number = Number(id.split("-")[2])
    return number <= 5 ? [fixtureMetadata(number)] : []
  }),
)

function renderPage() {
  profileService.createProfile({ name: "Julien", category: "HC" })
  return render(
    <MemoryRouter>
      <ProfileProvider>
        <QuestionListsProvider>
          <HomePage />
        </QuestionListsProvider>
      </ProfileProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  vi.mocked(questionMetadataService.getExistingByIds).mockClear()
})

describe("HomePage — list entries (Story 4.6)", () => {
  test("shows both cards (same model as the main ones) with their counts, ignoring questions no longer in the data", async () => {
    questionListsService.toggleFavorite("2025-qf-1")
    questionListsService.recordMistake("2025-qf-2")
    questionListsService.recordMistake("2025-qf-3")
    questionListsService.recordMistake("2025-qf-99")
    renderPage()
    expect(await screen.findByText(/mises de côté avec le signet\. 1 question\./)).toBeInTheDocument()
    expect(await screen.findByText(/jusqu'à ce que tu les trouves\. 2 questions\./)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Mes favoris/ })).toHaveAttribute("href", "/favoris")
    expect(screen.getByRole("link", { name: /Mes erreurs/ })).toHaveAttribute("href", "/erreurs")
  })

  test("no card at all for empty lists", async () => {
    renderPage()
    expect(await screen.findByRole("link", { name: /S'entraîner/ })).toBeInTheDocument()
    await waitFor(() => expect(questionMetadataService.getExistingByIds).toHaveBeenCalled())
    expect(screen.queryByRole("link", { name: /Mes favoris/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Mes erreurs/ })).not.toBeInTheDocument()
  })

  test("only the non-empty list gets a card", async () => {
    questionListsService.recordMistake("2025-qf-2")
    renderPage()
    expect(await screen.findByRole("link", { name: /Mes erreurs/ })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Mes favoris/ })).not.toBeInTheDocument()
  })

  test("a list holding only questions no longer in the data counts as empty", async () => {
    questionListsService.toggleFavorite("2025-qf-99")
    questionListsService.recordMistake("2025-qf-1")
    renderPage()
    expect(await screen.findByRole("link", { name: /Mes erreurs/ })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Mes favoris/ })).not.toBeInTheDocument()
  })
})
