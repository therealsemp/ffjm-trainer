// Small builders for Epic 4 tests (list pages, list consultation, home):
// questions of an imaginary 2025 quarter-final, id "2025-qf-<number>".

import type { Question, QuestionMetadata } from "../types/question"

export function fixtureMetadata(number: number, overrides: Partial<QuestionMetadata> = {}): QuestionMetadata {
  return {
    id: `2025-qf-${number}`,
    year: 2025,
    phase: "qf",
    number,
    title: `Titre ${number}`,
    tier: "CE",
    categories: ["CE"],
    hasDetailedCorrection: true,
    ...overrides,
  }
}

export function fixtureQuestion(number: number, overrides: Partial<Question> = {}): Question {
  return {
    id: `2025-qf-${number}`,
    year: 2025,
    phase: "qf",
    number,
    tier: "CE",
    categories: ["CE"],
    title: `Titre ${number}`,
    statement: { markdown: `Énoncé ${number}.` },
    answer: { type: "exact-numeric", value: 42 },
    correction: { markdown: `Explication ${number}.` },
    ...overrides,
  }
}
