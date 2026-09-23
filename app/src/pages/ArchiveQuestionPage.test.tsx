import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { ArchiveQuestionPage } from "./ArchiveQuestionPage"
import { ProfileProvider } from "../services/ProfileContext"
import { profileService } from "../services/profileService"
import type { Question, QuestionMetadata } from "../types/question"

vi.mock("../services/questionService", () => ({
  questionService: { getQuestion: vi.fn() },
}))
vi.mock("../services/questionMetadataService", () => ({
  questionMetadataService: { getEditionQuestions: vi.fn() },
}))

import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"

const getQuestion = vi.mocked(questionService.getQuestion)
const getEditionQuestions = vi.mocked(questionMetadataService.getEditionQuestions)

function metadata(number: number, overrides: Partial<QuestionMetadata> = {}): QuestionMetadata {
  return { id: `2025-qf-${number}`, year: 2025, phase: "qf", number, tier: "CE", categories: ["CE"], ...overrides }
}

function question(number: number, overrides: Partial<Question> = {}): Question {
  return {
    id: `2025-qf-${number}`,
    year: 2025,
    phase: "qf",
    number,
    tier: "CE",
    categories: ["CE"],
    title: `Question ${number}`,
    statement: { markdown: `Énoncé ${number}.` },
    answer: { type: "exact-numeric", value: 42 },
    correction: { markdown: `Explication ${number}.` },
    ...overrides,
  }
}

function renderPage(number: number, edition: QuestionMetadata[], questions: Record<number, Question>) {
  getEditionQuestions.mockResolvedValue(edition)
  getQuestion.mockImplementation(async (id: string) => {
    const found = Object.values(questions).find((q) => q.id === id)
    if (!found) throw new Error(`unexpected id ${id}`)
    return found
  })
  return render(
    <MemoryRouter initialEntries={[`/archives/2025/qf/${number}`]}>
      <ProfileProvider>
        <Routes>
          <Route path="/archives/:year/:phase/:number" element={<ArchiveQuestionPage />} />
        </Routes>
      </ProfileProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  getQuestion.mockReset()
  getEditionQuestions.mockReset()
})

describe("ArchiveQuestionPage — standard flow", () => {
  test("shows the statement, answers hidden by default", async () => {
    const edition = [metadata(1), metadata(2)]
    renderPage(1, edition, { 1: question(1), 2: question(2) })
    expect(await screen.findByText("Énoncé 1.")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Afficher les réponses" })).not.toBeChecked()
    expect(screen.queryByText(/Réponse :/)).not.toBeInTheDocument()
    expect(screen.queryByText("Explication détaillée")).not.toBeInTheDocument()
  })

  test("toggling reveals the answer and the detailed explanation", async () => {
    const user = userEvent.setup()
    const edition = [metadata(1)]
    renderPage(1, edition, { 1: question(1) })
    await screen.findByText("Énoncé 1.")
    await user.click(screen.getByRole("checkbox", { name: "Afficher les réponses" }))
    expect(screen.getByText(/Réponse :/)).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.getByText("Explication détaillée")).toBeInTheDocument()
    expect(screen.getByText("Explication 1.")).toBeInTheDocument()
  })

  test("a middle question shows both Précédent and Suivant", async () => {
    const edition = [metadata(1), metadata(2), metadata(3)]
    renderPage(2, edition, { 2: question(2) })
    await screen.findByText("Énoncé 2.")
    // The Précédent/Suivant pair is rendered twice (above the statement and
    // again below the answer), so assert presence via getAllByText.
    expect(screen.getAllByText("Précédent").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Suivant").length).toBeGreaterThan(0)
  })

  test("the first question hides Précédent but still shows Suivant", async () => {
    const edition = [metadata(1), metadata(2), metadata(3)]
    renderPage(1, edition, { 1: question(1) })
    await screen.findByText("Énoncé 1.")
    expect(screen.queryByText("Précédent")).not.toBeInTheDocument()
    expect(screen.getAllByText("Suivant").length).toBeGreaterThan(0)
  })

  test("the last question hides Suivant but still shows Précédent", async () => {
    const edition = [metadata(1), metadata(2), metadata(3)]
    renderPage(3, edition, { 3: question(3) })
    await screen.findByText("Énoncé 3.")
    expect(screen.queryByText("Suivant")).not.toBeInTheDocument()
    expect(screen.getAllByText("Précédent").length).toBeGreaterThan(0)
  })

  test("shows an out-of-category warning only when the profile's category isn't in the question's categories", async () => {
    profileService.createProfile({ name: "Julien", category: "CM" })
    const edition = [metadata(1)]
    renderPage(1, edition, { 1: question(1, { categories: ["CE"] }) })
    expect(await screen.findByText(/ne fait pas partie de ta catégorie/)).toBeInTheDocument()
  })

  test("no out-of-category warning when the profile's category is included", async () => {
    profileService.createProfile({ name: "Julien", category: "CE" })
    const edition = [metadata(1)]
    renderPage(1, edition, { 1: question(1, { categories: ["CE"] }) })
    await screen.findByText("Énoncé 1.")
    expect(screen.queryByText(/ne fait pas partie de ta catégorie/)).not.toBeInTheDocument()
  })
})

describe("ArchiveQuestionPage — edge cases", () => {
  test("an answer with no value hides the 'Réponse' box entirely, showing only the explanation", async () => {
    const user = userEvent.setup()
    const edition = [metadata(1)]
    renderPage(1, edition, { 1: question(1, { answer: { type: "open" } }) })
    await screen.findByText("Énoncé 1.")
    await user.click(screen.getByRole("checkbox", { name: "Afficher les réponses" }))
    expect(screen.queryByText(/Réponse :/)).not.toBeInTheDocument()
    expect(screen.getByText("Explication détaillée")).toBeInTheDocument()
    expect(screen.getByText("Explication 1.")).toBeInTheDocument()
  })

  test("redirects to /archives when the edition has no questions at all", async () => {
    getEditionQuestions.mockResolvedValue([])
    render(
      <MemoryRouter initialEntries={["/archives/2025/qf/1"]}>
        <ProfileProvider>
          <Routes>
            <Route path="/archives/:year/:phase/:number" element={<ArchiveQuestionPage />} />
            <Route path="/archives" element={<div>Liste des archives</div>} />
          </Routes>
        </ProfileProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByText("Liste des archives")).toBeInTheDocument()
  })

  test("redirects to /archives when the requested question number doesn't exist in the edition", async () => {
    getEditionQuestions.mockResolvedValue([metadata(1), metadata(2)])
    render(
      <MemoryRouter initialEntries={["/archives/2025/qf/99"]}>
        <ProfileProvider>
          <Routes>
            <Route path="/archives/:year/:phase/:number" element={<ArchiveQuestionPage />} />
            <Route path="/archives" element={<div>Liste des archives</div>} />
          </Routes>
        </ProfileProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByText("Liste des archives")).toBeInTheDocument()
  })

  test("the toggle stays on when navigating from one question to the next", async () => {
    const user = userEvent.setup()
    const edition = [metadata(1), metadata(2)]
    renderPage(1, edition, { 1: question(1), 2: question(2) })
    await screen.findByText("Énoncé 1.")
    await user.click(screen.getByRole("checkbox", { name: "Afficher les réponses" }))
    expect(screen.getByText(/Réponse :/)).toBeInTheDocument()
    await user.click(screen.getAllByText("Suivant")[0])
    await screen.findByText("Énoncé 2.")
    expect(screen.getByRole("checkbox", { name: "Afficher les réponses" })).toBeChecked()
    expect(screen.getByText(/Réponse :/)).toBeInTheDocument()
  })
})
