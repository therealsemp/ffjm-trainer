import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, test } from "vitest"
import { FavoriteButton } from "./FavoriteButton"
import { questionListsService } from "../services/questionListsService"
import { QuestionListsProvider } from "../services/QuestionListsContext"

beforeEach(() => {
  window.localStorage.clear()
})

describe("FavoriteButton (Story 4.2)", () => {
  test("toggles the favorite, its accessible name stating the action", async () => {
    const user = userEvent.setup()
    render(
      <QuestionListsProvider>
        <FavoriteButton questionId="2025-qf-1" />
      </QuestionListsProvider>,
    )
    await user.click(screen.getByRole("button", { name: "Ajouter aux favoris" }))
    expect(questionListsService.isFavorite("2025-qf-1")).toBe(true)
    const button = screen.getByRole("button", { name: "Retirer des favoris" })
    expect(button).toHaveAttribute("aria-pressed", "true")
    await user.click(button)
    expect(questionListsService.isFavorite("2025-qf-1")).toBe(false)
    expect(screen.getByRole("button", { name: "Ajouter aux favoris" })).toBeInTheDocument()
  })

  test("two buttons for the same question stay in sync", async () => {
    const user = userEvent.setup()
    render(
      <QuestionListsProvider>
        <FavoriteButton questionId="2025-qf-1" />
        <FavoriteButton questionId="2025-qf-1" />
      </QuestionListsProvider>,
    )
    await user.click(screen.getAllByRole("button", { name: "Ajouter aux favoris" })[0])
    expect(screen.getAllByRole("button", { name: "Retirer des favoris" })).toHaveLength(2)
  })
})
