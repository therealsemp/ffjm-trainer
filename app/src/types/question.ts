import type { CategoryCode } from "./profile"

// The 6 real tiers a question can natively belong to (not the 8 FFJM
// categories — L1/GP share one tier, as do L2/HC, since they share the
// same question pool). See shared/categories.mjs, the canonical source.
export type Tier = "CE" | "CM" | "C1" | "C2" | "L1/GP" | "L2/HC"

// Lightweight per-question record from the build-time manifest
// (app/public/data/questions.json) — never the question's actual content
// (statement/correction), see docs/technical-architecture.md.
export interface QuestionMetadata {
  id: string
  year: number
  phase: "qf" | "sf" | "fn"
  number: number
  tier: Tier
  categories: CategoryCode[]
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
// (the real file on disk has more: sourceFiles, coefficient, title...).
export interface Question {
  id: string
  year: number
  phase: "qf" | "sf" | "fn"
  number: number
  tier: Tier
  categories: CategoryCode[]
  statement: RichContent
  answer: {
    type: "exact-numeric" | "exact-text" | "open"
    value?: string | number
  }
  correction: RichContent
}
