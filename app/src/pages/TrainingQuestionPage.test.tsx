import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { TrainingQuestionPage } from "./TrainingQuestionPage"
import { ProfileProvider } from "../services/ProfileContext"
import { QuestionListsProvider } from "../services/QuestionListsContext"
import { questionListsService } from "../services/questionListsService"
import { playSound } from "../services/soundEffects"
import { trainingSessionService } from "../services/trainingSessionService"
import { TrainingSessionProvider } from "../services/TrainingSessionContext"
import type { Question } from "../types/question"

vi.mock("../services/soundEffects", () => ({ playSound: vi.fn() }))

vi.mock("../services/questionService", () => ({
  questionService: { getQuestion: vi.fn() },
}))

// Every test drives the draw via `?q=<id>` (the page's own escape hatch for
// forcing a specific question), but the mount-time effect still calls
// `drawNext` unconditionally before the component's own early-return checks
// run — for a test that omits `?q=`, that would otherwise fall through to
// the real weighted draw and hit the network. Stub it so that path is inert
// no matter which test triggers it.
vi.mock("../services/questionMetadataService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/questionMetadataService")>()
  return {
    ...actual,
    questionMetadataService: {
      ...actual.questionMetadataService,
      pickWeightedTier: vi.fn(() => "CE"),
      pickRandomQuestionInTier: vi.fn(async () => ({
        id: "unused-fallback-id",
        year: 2025,
        phase: "qf",
        number: 1,
        tier: "CE",
        categories: ["CE"],
        hasDetailedCorrection: true,
      })),
    },
  }
})

import { questionService } from "../services/questionService"

const getQuestion = vi.mocked(questionService.getQuestion)

function baseQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "2025-qf-1",
    year: 2025,
    phase: "qf",
    number: 1,
    tier: "CE",
    categories: ["CE"],
    title: "Une question",
    statement: { markdown: "Voici l'énoncé." },
    answer: { type: "exact-numeric", value: 42 },
    correction: { markdown: "Voici l'explication détaillée." },
    ...overrides,
  }
}

// `?q=<id>` forces the draw to a specific question (bypassing the weighted
// random tier/question pick entirely) — the documented escape hatch this
// page already offers for exactly this kind of deterministic testing.
function renderPage(
  question: Question,
  { targetCount = null, includeWithoutDetailedCorrection = false }: { targetCount?: number | null; includeWithoutDetailedCorrection?: boolean } = {},
) {
  getQuestion.mockResolvedValue(question)
  trainingSessionService.startSession(
    ["CE", "CM", "C1", "C2", "L1/GP", "L2/HC"],
    targetCount,
    includeWithoutDetailedCorrection,
  )
  return render(
    <MemoryRouter initialEntries={[`/?q=${question.id}`]}>
      <ProfileProvider>
        <QuestionListsProvider>
          <TrainingSessionProvider>
            <Routes>
              <Route path="/" element={<TrainingQuestionPage />} />
              <Route path="/entrainement/recap" element={<div>Récapitulatif</div>} />
              <Route path="/entrainement/configuration" element={<div>Configuration</div>} />
            </Routes>
          </TrainingSessionProvider>
        </QuestionListsProvider>
      </ProfileProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  getQuestion.mockReset()
  vi.mocked(playSound).mockClear()
})

describe("TrainingQuestionPage — standard flow", () => {
  test("shows the statement but hides the answer/correction until revealed", async () => {
    renderPage(baseQuestion())
    expect(await screen.findByText("Voici l'énoncé.")).toBeInTheDocument()
    expect(screen.queryByText(/Réponse :/)).not.toBeInTheDocument()
    expect(screen.queryByText("Voici l'explication détaillée.")).not.toBeInTheDocument()
  })

  test("revealing shows both the short answer and the detailed correction", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion())
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    expect(screen.getByText("Réponse :")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.getByText("Explication détaillée")).toBeInTheDocument()
    expect(screen.getByText("Voici l'explication détaillée.")).toBeInTheDocument()
  })

  test("self-assessment is offered twice (short answer + detailed explanation) and both work", async () => {
    const user = userEvent.setup()
    const q1 = baseQuestion({ id: "q1" })
    const q2 = baseQuestion({ id: "q2", statement: { markdown: "Deuxième énoncé." } })
    getQuestion.mockResolvedValueOnce(q1).mockResolvedValueOnce(q2)
    trainingSessionService.startSession(["CE"], null, false)
    render(
      <MemoryRouter initialEntries={["/?q=q1"]}>
        <ProfileProvider>
          <QuestionListsProvider>
            <TrainingSessionProvider>
              <Routes>
                <Route path="/" element={<TrainingQuestionPage />} />
              </Routes>
            </TrainingSessionProvider>
          </QuestionListsProvider>
        </ProfileProvider>
      </MemoryRouter>,
    )
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    const foundButtons = screen.getAllByRole("button", { name: "J'avais trouvé" })
    expect(foundButtons).toHaveLength(2)
    // Click the *second* instance (inside "Explication détaillée") — same
    // handler as the first, per TrainingQuestionPage.tsx.
    await user.click(foundButtons[1])
    expect(trainingSessionService.getSessionStats().CE.found).toBe(1)
  })

  test("the FFJM 'number of solutions' disclaimer only shows above CM", async () => {
    renderPage(baseQuestion({ tier: "CE" }))
    await screen.findByText("Voici l'énoncé.")
    expect(screen.queryByText(/Règlement officiel FFJM/)).not.toBeInTheDocument()
  })

  test("the FFJM 'number of solutions' disclaimer shows for a tier above CM", async () => {
    renderPage(baseQuestion({ tier: "C1", categories: ["C1"] }))
    await screen.findByText("Voici l'énoncé.")
    expect(screen.getByText(/Règlement officiel FFJM/)).toBeInTheDocument()
  })

  test("'Ignorer' draws the next question without revealing the answer", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion())
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: /Ignorer/ }))
    await waitFor(() => expect(getQuestion).toHaveBeenCalledTimes(2))
    expect(screen.queryByText(/Réponse :/)).not.toBeInTheDocument()
  })

  test("'J'avais trouvé' records a found outcome and draws the next question", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion(), { targetCount: null })
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    await user.click(screen.getAllByRole("button", { name: "J'avais trouvé" })[0])
    expect(trainingSessionService.getSessionStats().CE.found).toBe(1)
    await waitFor(() => expect(getQuestion).toHaveBeenCalledTimes(2))
    // Back to the un-revealed state for the freshly drawn question.
    expect(screen.queryByText(/Réponse :/)).not.toBeInTheDocument()
  })

  test("reaching the session target navigates to the recap instead of drawing again", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion(), { targetCount: 1 })
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    await user.click(screen.getAllByRole("button", { name: "J'avais trouvé" })[0])
    expect(await screen.findByText("Récapitulatif")).toBeInTheDocument()
  })
})

describe("TrainingQuestionPage — answer sounds (Story 1.6 / 2.7)", () => {
  test("an answer that doesn't complete the session plays its sound", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion(), { targetCount: 5 })
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    await user.click(screen.getAllByRole("button", { name: "J'avais trouvé" })[0])
    expect(playSound).toHaveBeenCalledExactlyOnceWith("ok")
  })

  test("the answer that completes the session plays no answer sound (the recap plays the rank's)", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion(), { targetCount: 1 })
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    await user.click(screen.getAllByRole("button", { name: "J'avais trouvé" })[0])
    expect(await screen.findByText("Récapitulatif")).toBeInTheDocument()
    expect(playSound).not.toHaveBeenCalled()
  })
})

describe("TrainingQuestionPage — mistakes and favorites (Stories 4.1 / 4.2)", () => {
  test("'Je n'avais pas trouvé' records the question in the mistakes list", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion(), { targetCount: 5 })
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    await user.click(screen.getAllByRole("button", { name: "Je n'avais pas trouvé" })[0])
    expect(questionListsService.getMistakes().map((entry) => entry.questionId)).toEqual([baseQuestion().id])
  })

  test("'J'avais trouvé' removes it from the mistakes list, even when completing the session", async () => {
    const user = userEvent.setup()
    questionListsService.recordMistake(baseQuestion().id)
    renderPage(baseQuestion(), { targetCount: 1 })
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    await user.click(screen.getAllByRole("button", { name: "J'avais trouvé" })[0])
    expect(await screen.findByText("Récapitulatif")).toBeInTheDocument()
    expect(questionListsService.getMistakes()).toEqual([])
  })

  test("skipping leaves the mistakes list untouched", async () => {
    const user = userEvent.setup()
    questionListsService.recordMistake(baseQuestion().id)
    renderPage(baseQuestion())
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: /Ignorer/ }))
    expect(questionListsService.getMistakes()).toHaveLength(1)
  })

  test("the bookmark toggles the favorite without affecting the session", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion(), { targetCount: 5 })
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Ajouter aux favoris" }))
    expect(questionListsService.isFavorite(baseQuestion().id)).toBe(true)
    expect(screen.getByText("Voici l'énoncé.")).toBeInTheDocument()
    expect(trainingSessionService.getSessionOutcomes()).toEqual([])
  })
})

describe("TrainingQuestionPage — edge cases", () => {
  test("an answer with no value shows a fallback link to the correction's own figure instead", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion({ answer: { type: "open" } }))
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    expect(screen.getByText("voir la réponse en image à la fin de l'explication détaillée")).toBeInTheDocument()
  })

  test("a question with no detailed correction shows only the short answer, no 'Explication détaillée' section", async () => {
    const user = userEvent.setup()
    renderPage(baseQuestion({ correction: undefined, answer: { type: "exact-numeric", value: 42 } }))
    await screen.findByText("Voici l'énoncé.")
    await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }))
    expect(screen.getByText("Réponse :")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.queryByText("Explication détaillée")).not.toBeInTheDocument()
    // Only the short-answer box's self-assessment buttons — not duplicated.
    expect(screen.getAllByRole("button", { name: "J'avais trouvé" })).toHaveLength(1)
  })

  test("redirects to session configuration when there is no active session", () => {
    trainingSessionService.clearSession()
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ProfileProvider>
          <QuestionListsProvider>
            <TrainingSessionProvider>
              <Routes>
                <Route path="/" element={<TrainingQuestionPage />} />
                <Route path="/entrainement/configuration" element={<div>Configuration</div>} />
              </Routes>
            </TrainingSessionProvider>
          </QuestionListsProvider>
        </ProfileProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText("Configuration")).toBeInTheDocument()
  })

  test("redirects to configuration (not the recap) when the session was already complete on arrival", () => {
    trainingSessionService.startSession(["CE"], 1, false)
    trainingSessionService.recordFound("CE")
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ProfileProvider>
          <QuestionListsProvider>
            <TrainingSessionProvider>
              <Routes>
                <Route path="/" element={<TrainingQuestionPage />} />
                <Route path="/entrainement/recap" element={<div>Récapitulatif</div>} />
                <Route path="/entrainement/configuration" element={<div>Configuration</div>} />
              </Routes>
            </TrainingSessionProvider>
          </QuestionListsProvider>
        </ProfileProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText("Configuration")).toBeInTheDocument()
  })
})
