import type { Question } from "../types/question"
import { fetchJson } from "./fetchJson"
import { questionMetadataService } from "./questionMetadataService"

export const questionService = {
  // Resolves the id via questionMetadataService (already cached) to build
  // the file's path — the copy build-data-index.mjs mirrors from
  // data/validated/, no separate "detail" endpoint to maintain.
  async getQuestion(id: string): Promise<Question> {
    const metadata = await questionMetadataService.getById(id)
    const number = String(metadata.number).padStart(2, "0")
    const url = `${import.meta.env.BASE_URL}data/${metadata.year}/${metadata.phase}/q${number}.json`
    return fetchJson<Question>(url, `Failed to load question ${id}`)
  },
}
