import type { CategoryCode } from "./profile"

// The 6 real tiers a question can natively belong to (not the 8 FFJM
// categories — L1/GP share one tier, as do L2/HC, since they share the
// same question pool). See shared/categories.mjs, the canonical source.
export type Tier = "CE" | "CM" | "C1" | "C2" | "L1/GP" | "L2/HC"

export type Phase = "qf" | "sf" | "fn"

// Full French label for a phase code — the only place this mapping lives,
// so any display of a phase goes through it rather than hardcoding text
// next to `question.phase` wherever it's shown.
export const PHASE_LABELS: Record<Phase, string> = {
  qf: "Quarts de finale",
  sf: "Demi-finale",
  fn: "Finale",
}

// Lightweight per-question record from the build-time manifest
// (app/public/data/questions.json) — never the question's actual content
// (statement/correction), see docs/technical-architecture.md.
export interface QuestionMetadata {
  id: string
  year: number
  phase: Phase
  number: number
  // Same value as the full `Question.title` (absent when the question has
  // none), copied here so listing screens (edition summary, favorites,
  // mistakes) can show titles without fetching each question's content.
  title?: string
  tier: Tier
  categories: CategoryCode[]
  // False for a question whose only source was a results-only solution PDF
  // (no reasoning to transcribe) — the full `Question.correction` is absent
  // in that case. Denormalized here (rather than only checked after
  // fetching full content) so the training-mode draw can filter these out
  // *before* fetching anything, per the session config toggle (Story 2.1).
  hasDetailedCorrection: boolean
}

// A figure referenced from RichContent.markdown via `![...](figure:<id>)` —
// matched against this array by `id`. `imageUrl` is a bare filename, next
// to the question's own JSON file; `svg` is raw inline SVG source.
export interface Figure {
  id: string
  description?: string
  svg?: string
  imageUrl?: string
}

export interface RichContent {
  markdown: string
  figures?: Figure[]
}

// The full question content — only the fields the app actually renders
// (the real file on disk has more: sourceFiles, coefficient...).
export interface Question {
  id: string
  year: number
  phase: Phase
  number: number
  tier: Tier
  categories: CategoryCode[]
  title?: string
  statement: RichContent
  answer: {
    type: "exact-numeric" | "exact-text" | "open"
    value?: string | number
  }
  // Absent when the only available source was a results-only solution PDF
  // (no reasoning to transcribe) — see ingest/TRANSCRIPTION-GUIDE.md rule
  // 10. `answer.value` is guaranteed present whenever this is absent (see
  // shared/validate.mjs), so there's always something to show as "the
  // answer" even with no detailed explanation to go with it.
  correction?: RichContent
}
