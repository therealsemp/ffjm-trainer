import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { ListQuestionPage } from "./ListQuestionPage"
import { ProfileProvider } from "../services/ProfileContext"
import { questionListsService } from "../services/questionListsService"
import { QuestionListsProvider } from "../services/QuestionListsContext"
import { fixtureMetadata, fixtureQuestion } from "../test/questionFixtures"

vi.mock("../services/questionService", () => ({ questionService: { getQuestion: vi.fn() } }))
vi.mock("../services/questionMetadataService", () => ({ questionMetadataService: { getExistingByIds: vi.fn() } }))

import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"

vi.mocked(questionMetadataService.getExistingByIds).mockImplementation(async (ids: string[]) =>
  ids.flatMap((id) => {
    const number = Number(id.split("-")[2])
    return number <= 5 ? [fixtureMetadata(number)] : []
  }),
)
vi.mocked(questionService.getQuestion).mockImplementation(async (id: string) => fixtureQuestion(Number(id.split("-")[2])))

const day = (n: number) => new Date(Date.UTC(2026, 8, n, 12))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ProfileProvider>
        <QuestionListsProvider>
          <Routes>
            <Route path="/favoris" element={<div>Page Mes favoris</div>} />
            <Route path="/erreurs" element={<div>Page Mes erreurs</div>} />
            <Route path="/favoris/:questionId" element={<ListQuestionPage key="favorites" kind="favorites" />} />
            <Route path="/erreurs/:questionId" element={<ListQuestionPage key="mistakes" kind="mistakes" />} />
            <Route path="/archives/:year/:phase/:number" element={<div>Archives</div>} />
          </Routes>
        </QuestionListsProvider>
      </ProfileProvider>
    </MemoryRouter>,
  )
}

// Favorites, most recent first: 3, 2, 1.
function threeFavorites() {
  questionListsService.toggleFavorite("2025-qf-1", day(1))
  questionListsService.toggleFavorite("2025-qf-2", day(2))
  questionListsService.toggleFavorite("2025-qf-3", day(3))
}

beforeEach(() => {
  window.localStorage.clear()
})

describe("ListQuestionPage (Story 4.5)", () => {
  test("shows the question with its position in the list, a link back, answers hidden", async () => {
    threeFavorites()
    renderAt("/favoris/2025-qf-2")
    expect(await screen.findByText("Énoncé 2.")).toBeInTheDocument()
    expect(screen.getByText("Favori 2 / 3")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Mes favoris" })).toHaveAttribute("href", "/favoris")
    expect(screen.queryByText("Explication 2.")).not.toBeInTheDocument()
  })

  test("Previous / Next follow the list's order and are hidden at the bounds", async () => {
    const user = userEvent.setup()
    threeFavorites()
    renderAt("/favoris/2025-qf-3")
    await screen.findByText("Énoncé 3.")
    expect(screen.queryByRole("link", { name: "Précédent" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("link", { name: "Suivant" }))
    expect(await screen.findByText("Énoncé 2.")).toBeInTheDocument()
    await user.click(screen.getByRole("link", { name: "Suivant" }))
    expect(await screen.findByText("Énoncé 1.")).toBeInTheDocument()
    expect(screen.getByText("Favori 3 / 3")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Suivant" })).not.toBeInTheDocument()
  })

  test("answers stay shown when moving on", async () => {
    const user = userEvent.setup()
    threeFavorites()
    renderAt("/favoris/2025-qf-3")
    await screen.findByText("Énoncé 3.")
    await user.click(screen.getByRole("checkbox", { name: "Afficher les réponses" }))
    await user.click(screen.getAllByRole("link", { name: "Suivant" })[0])
    expect(await screen.findByText("Explication 2.")).toBeInTheDocument()
  })

  test("removing the displayed favorite keeps it displayed and the order frozen", async () => {
    const user = userEvent.setup()
    threeFavorites()
    renderAt("/favoris/2025-qf-2")
    await screen.findByText("Énoncé 2.")
    await user.click(screen.getByRole("button", { name: "Retirer des favoris" }))
    expect(screen.getByText("Énoncé 2.")).toBeInTheDocument()
    expect(screen.getByText("Favori 2 / 3")).toBeInTheDocument()
    await user.click(screen.getByRole("link", { name: "Suivant" }))
    expect(await screen.findByText("Énoncé 1.")).toBeInTheDocument()
    expect(screen.getByText("Favori 3 / 3")).toBeInTheDocument()
  })

  test("the edition line links to the question in the archives", async () => {
    threeFavorites()
    renderAt("/favoris/2025-qf-2")
    await screen.findByText("Énoncé 2.")
    expect(screen.getByRole("link", { name: "2025 · Quarts de finale · Question 2" })).toHaveAttribute(
      "href",
      "/archives/2025/qf/2",
    )
  })

  test("a question not (or no longer) in the list redirects to the list page", async () => {
    questionListsService.recordMistake("2025-qf-1", day(1))
    renderAt("/erreurs/2025-qf-4")
    expect(await screen.findByText("Page Mes erreurs")).toBeInTheDocument()
  })

  test("mistakes list: position label, and consulting never changes the mistakes list", async () => {
    const user = userEvent.setup()
    questionListsService.recordMistake("2025-qf-1", day(1))
    questionListsService.recordMistake("2025-qf-2", day(2))
    renderAt("/erreurs/2025-qf-2")
    await screen.findByText("Énoncé 2.")
    expect(screen.getByText("Erreur 1 / 2")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: "Afficher les réponses" }))
    await user.click(screen.getAllByRole("link", { name: "Suivant" })[0])
    await screen.findByText("Énoncé 1.")
    expect(questionListsService.getMistakes()).toHaveLength(2)
  })
})
