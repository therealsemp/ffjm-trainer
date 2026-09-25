import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { FavoritesPage } from "./FavoritesPage"
import { MistakesPage } from "./MistakesPage"
import { questionListsService } from "../services/questionListsService"
import { QuestionListsProvider } from "../services/QuestionListsContext"
import { fixtureMetadata } from "../test/questionFixtures"

vi.mock("../services/questionService", () => ({ questionService: { getQuestion: vi.fn() } }))
vi.mock("../services/questionMetadataService", () => ({ questionMetadataService: { getExistingByIds: vi.fn() } }))

import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"

// Questions 1 to 5 exist in the data; anything else doesn't.
const EXISTING = [1, 2, 3, 4, 5]
vi.mocked(questionMetadataService.getExistingByIds).mockImplementation(async (ids: string[]) =>
  ids.flatMap((id) => {
    const number = Number(id.split("-")[2])
    return EXISTING.includes(number) ? [fixtureMetadata(number)] : []
  }),
)

const day = (n: number) => new Date(Date.UTC(2026, 8, n, 12))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QuestionListsProvider>
        <Routes>
          <Route path="/favoris" element={<FavoritesPage />} />
          <Route path="/erreurs" element={<MistakesPage />} />
          <Route path="/favoris/:questionId" element={<div>Consultation favori</div>} />
          <Route path="/erreurs/:questionId" element={<div>Consultation erreur</div>} />
        </Routes>
      </QuestionListsProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe("Mes favoris (Story 4.3)", () => {
  test("lists favorites most recent first, with title, edition, level and date", async () => {
    questionListsService.toggleFavorite("2025-qf-1", day(1))
    questionListsService.toggleFavorite("2025-qf-3", day(3))
    renderAt("/favoris")
    const rows = await screen.findAllByRole("listitem")
    expect(rows.map((row) => within(row).getByText(/^Titre/).textContent)).toEqual(["Titre 3", "Titre 1"])
    expect(within(rows[0]).getByText("2025 · Quarts de finale · Question 3")).toBeInTheDocument()
    expect(within(rows[0]).getByText("CE")).toBeInTheDocument()
    expect(within(rows[0]).getByText("Ajouté le 03/09/2026")).toBeInTheDocument()
    expect(within(rows[0]).getByRole("button", { name: "Retirer des favoris" })).toBeInTheDocument()
  })

  test("unbookmarking a row removes it right away", async () => {
    const user = userEvent.setup()
    questionListsService.toggleFavorite("2025-qf-1", day(1))
    questionListsService.toggleFavorite("2025-qf-2", day(2))
    renderAt("/favoris")
    const rows = await screen.findAllByRole("listitem")
    await user.click(within(rows[0]).getByRole("button", { name: "Retirer des favoris" }))
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    expect(questionListsService.isFavorite("2025-qf-2")).toBe(false)
  })

  test("a row leads to list consultation", async () => {
    const user = userEvent.setup()
    questionListsService.toggleFavorite("2025-qf-1", day(1))
    renderAt("/favoris")
    await user.click(await screen.findByText("Titre 1"))
    expect(screen.getByText("Consultation favori")).toBeInTheDocument()
  })

  test("a favorite whose question no longer exists is not listed", async () => {
    questionListsService.toggleFavorite("2025-qf-99", day(1))
    questionListsService.toggleFavorite("2025-qf-1", day(2))
    renderAt("/favoris")
    expect(await screen.findAllByRole("listitem")).toHaveLength(1)
  })

  test("empty state explains the bookmark", async () => {
    renderAt("/favoris")
    expect(await screen.findByText(/avec le signet/)).toBeInTheDocument()
  })
})

test("list pages never fetch full question files (titles come from the manifest)", async () => {
  questionListsService.toggleFavorite("2025-qf-1", day(1))
  renderAt("/favoris")
  await screen.findAllByRole("listitem")
  expect(questionService.getQuestion).not.toHaveBeenCalled()
})

describe("Mes erreurs (Story 4.4)", () => {
  test("lists mistakes most recent first, dated from the latest mistake", async () => {
    questionListsService.recordMistake("2025-qf-2", day(2))
    questionListsService.recordMistake("2025-qf-4", day(4))
    renderAt("/erreurs")
    const rows = await screen.findAllByRole("listitem")
    expect(rows.map((row) => within(row).getByText(/^Titre/).textContent)).toEqual(["Titre 4", "Titre 2"])
    expect(within(rows[0]).getByText("Ratée le 04/09/2026")).toBeInTheDocument()
  })

  test("the bookmark adds to favorites without removing the mistake", async () => {
    const user = userEvent.setup()
    questionListsService.recordMistake("2025-qf-2", day(2))
    renderAt("/erreurs")
    const [row] = await screen.findAllByRole("listitem")
    await user.click(within(row).getByRole("button", { name: "Ajouter aux favoris" }))
    expect(questionListsService.isFavorite("2025-qf-2")).toBe(true)
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    expect(questionListsService.getMistakes()).toHaveLength(1)
  })

  test("empty state", async () => {
    renderAt("/erreurs")
    expect(await screen.findByText(/Aucune erreur pour l'instant/)).toBeInTheDocument()
  })
})
