import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"
import { ArchiveSummaryPage } from "./ArchiveSummaryPage"
import { fixtureMetadata } from "../test/questionFixtures"

vi.mock("../services/questionService", () => ({ questionService: { getQuestion: vi.fn() } }))
vi.mock("../services/questionMetadataService", () => ({ questionMetadataService: { getEditionQuestions: vi.fn() } }))

import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"

describe("ArchiveSummaryPage (Story 3.4)", () => {
  test("lists titles and levels from the manifest alone, each linking to its question", async () => {
    vi.mocked(questionMetadataService.getEditionQuestions).mockResolvedValue([
      fixtureMetadata(1),
      fixtureMetadata(2, { title: undefined, tier: "CM" }),
    ])
    render(
      <MemoryRouter initialEntries={["/archives/2025/qf/sommaire"]}>
        <Routes>
          <Route path="/archives/:year/:phase/sommaire" element={<ArchiveSummaryPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByRole("link", { name: /Titre 1/ })).toHaveAttribute("href", "/archives/2025/qf/1")
    expect(screen.getByRole("link", { name: /2025-qf-2/ })).toHaveTextContent("CM")
    expect(questionService.getQuestion).not.toHaveBeenCalled()
  })
})
