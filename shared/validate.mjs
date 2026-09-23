#!/usr/bin/env node
// Validates a single question JSON file (one exercise + its answer, one file
// per question — each file is self-contained: it carries its own
// year/champNumber/phase/sourceFiles rather than inheriting them from a
// parent exam file). Shape follows docs/technical-architecture.md, extended
// with title/number/coefficient/categories/tier (see shared/categories.mjs).
//
// Used by both /ingest (before a question leaves needs-review) and the
// future /review tool (before promoting a question to validated).
//
// Usage: node shared/validate.mjs <path/to/question.json> [...more files]

import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { CANONICAL_ORDER, TIERS, isCanonicallySorted, tierForCategories } from "./categories.mjs"

const PHASES = ["qf", "sf", "fn"]
const CATEGORIES = CANONICAL_ORDER
const ANSWER_TYPES = ["exact-numeric", "exact-text", "open"]
const COEFFICIENT_SOURCES = ["explicit", "derived-from-number", "derived-from-order"]

function fail(errors, path, msg) {
  errors.push(`${path}: ${msg}`)
}

function validateRichContent(value, fieldPath, errors, baseDir) {
  if (typeof value !== "object" || value === null) {
    fail(errors, fieldPath, "must be an object")
    return
  }
  if (typeof value.markdown !== "string" || value.markdown.trim() === "") {
    fail(errors, fieldPath + ".markdown", "must be a non-empty string")
  }
  if (value.figures !== undefined) {
    if (!Array.isArray(value.figures)) {
      fail(errors, fieldPath + ".figures", "must be an array when present")
    } else {
      value.figures.forEach((fig, i) => {
        const p = `${fieldPath}.figures[${i}]`
        if (typeof fig.id !== "string" || fig.id === "") fail(errors, p + ".id", "must be a non-empty string")
        if (fig.description !== undefined && typeof fig.description !== "string") fail(errors, p + ".description", "must be a string")
        if (fig.pending === true && (fig.svg || fig.imageUrl)) fail(errors, p, "marked pending but already has svg/imageUrl")
        if (fig.pending !== true && !fig.svg && !fig.imageUrl) fail(errors, p, "must have svg or imageUrl, or be marked pending: true")
        if (fig.imageUrl !== undefined) {
          if (fig.imageUrl.includes("/") || fig.imageUrl.includes("\\")) {
            fail(errors, p + ".imageUrl", "must be a bare filename (no path), the image lives next to the question's JSON file")
          } else if (!existsSync(path.join(baseDir, fig.imageUrl))) {
            fail(errors, p + ".imageUrl", `file not found next to the question file: ${fig.imageUrl}`)
          }
        }
      })
    }
  }
}

// A source reference is { path, page, position: { x, y } }. `page` and
// `position` locate roughly where this question starts in the PDF — used
// to jump the PDF viewer there (e.g. "#page=N&zoom=100,x,y") instead of
// always opening at page 1. Best-effort: exploratory feature, not load-bearing
// for anything else, so we validate shape but don't chase sub-pixel accuracy.
function checkSourceRef(value, fieldPath, errors, baseDir) {
  if (typeof value !== "object" || value === null) {
    fail(errors, fieldPath, "must be an object ({ path, page, position })")
    return
  }
  if (typeof value.path !== "string" || value.path === "") {
    fail(errors, fieldPath + ".path", "must be a non-empty string path")
  } else if (path.isAbsolute(value.path)) {
    fail(errors, fieldPath + ".path", "must be a relative path (relative to this question file's own directory), not absolute")
  } else if (!existsSync(path.join(baseDir, value.path))) {
    fail(errors, fieldPath + ".path", `file not found: ${value.path} (relative to ${baseDir})`)
  }
  if (!Number.isInteger(value.page) || value.page < 1) fail(errors, fieldPath + ".page", "must be a positive integer")
  if (typeof value.position !== "object" || value.position === null) {
    fail(errors, fieldPath + ".position", "must be an object ({ x, y })")
  } else {
    if (typeof value.position.x !== "number") fail(errors, fieldPath + ".position.x", "must be a number")
    if (typeof value.position.y !== "number") fail(errors, fieldPath + ".position.y", "must be a number")
  }
}

export function validateQuestion(q, errors, baseDir) {
  // Exam-level fields, denormalized into every question file.
  if (!Number.isInteger(q.year)) fail(errors, "year", "must be an integer")
  if (!PHASES.includes(q.phase)) fail(errors, "phase", `must be one of ${PHASES.join(", ")}`)
  if (q.champNumber !== null && !Number.isInteger(q.champNumber)) fail(errors, "champNumber", "must be an integer or null")
  if (q.examTitle !== undefined && typeof q.examTitle !== "string") fail(errors, "examTitle", "must be a string when present")

  if (typeof q.sourceFiles !== "object" || q.sourceFiles === null) {
    fail(errors, "sourceFiles", "must be an object")
  } else {
    checkSourceRef(q.sourceFiles.statement, "sourceFiles.statement", errors, baseDir)
    if (!Array.isArray(q.sourceFiles.detailedSolutions) || q.sourceFiles.detailedSolutions.length === 0) {
      fail(errors, "sourceFiles.detailedSolutions", "must be a non-empty array of source refs")
    } else {
      q.sourceFiles.detailedSolutions.forEach((ref, i) => checkSourceRef(ref, `sourceFiles.detailedSolutions[${i}]`, errors, baseDir))
    }
  }

  // Question-level fields.
  if (typeof q.id !== "string" || q.id === "") fail(errors, "id", "must be a non-empty string")
  if (!Number.isInteger(q.number) || q.number < 1) fail(errors, "number", "must be a positive integer")
  if (q.title !== undefined && typeof q.title !== "string") fail(errors, "title", "must be a string when present")
  if (typeof q.coefficient !== "number" || q.coefficient <= 0) fail(errors, "coefficient", "must be a positive number")
  if (!COEFFICIENT_SOURCES.includes(q.coefficientSource)) fail(errors, "coefficientSource", `must be one of ${COEFFICIENT_SOURCES.join(", ")}`)
  if (!Array.isArray(q.categories) || q.categories.length === 0) {
    fail(errors, "categories", "must be a non-empty array")
  } else {
    for (const c of q.categories) {
      if (!CATEGORIES.includes(c)) fail(errors, "categories", `unknown category "${c}"`)
    }
    if (!isCanonicallySorted(q.categories)) {
      fail(errors, "categories", `must be sorted in canonical order (${CANONICAL_ORDER.join(" < ")})`)
    }
    if (!TIERS.includes(q.tier)) {
      fail(errors, "tier", `must be one of ${TIERS.join(", ")}`)
    } else if (isCanonicallySorted(q.categories) && q.tier !== tierForCategories(q.categories)) {
      fail(errors, "tier", `inconsistent with categories: expected "${tierForCategories(q.categories)}" (lowest-ranked entry of categories), got "${q.tier}"`)
    }
  }

  validateRichContent(q.statement, "statement", errors, baseDir)
  // `correction` is optional: some editions only have a results-only source
  // (see ingest/TRANSCRIPTION-GUIDE.md rule 10) — the naming convention on
  // disk (`..._solution.pdf` vs `..._solution-detailed.pdf`) is what decides
  // this, not a judgment call made here or during transcription.
  if (q.correction !== undefined) {
    validateRichContent(q.correction, "correction", errors, baseDir)
  }

  if (typeof q.answer !== "object" || q.answer === null) {
    fail(errors, "answer", "must be an object")
  } else {
    if (!ANSWER_TYPES.includes(q.answer.type)) fail(errors, "answer.type", `must be one of ${ANSWER_TYPES.join(", ")}`)
    const hasValue = q.answer.value !== undefined && q.answer.value !== ""
    if (q.answer.type !== "open" && !hasValue) {
      fail(errors, "answer.value", "required unless answer.type is 'open'")
    }
    // Without a correction, an "open" answer can't fall back on "the answer
    // is only shown via the correction's own figure" — that fallback has
    // nothing to fall back to, so the value must be present here instead.
    if (q.correction === undefined && !hasValue) {
      fail(errors, "answer.value", "required when correction is absent (no fallback figure to show the answer)")
    }
  }
}

function main() {
  const files = process.argv.slice(2)
  if (files.length === 0) {
    console.error("Usage: node scripts/validate.mjs <path/to/question.json> [...more files]")
    process.exit(1)
  }

  let anyFailed = false
  for (const file of files) {
    const errors = []
    let q
    try {
      q = JSON.parse(readFileSync(file, "utf8"))
    } catch (e) {
      console.error(`${file}: FAILED TO PARSE (${e.message})`)
      anyFailed = true
      continue
    }
    validateQuestion(q, errors, path.dirname(file))
    if (errors.length === 0) {
      console.log(`${file}: OK`)
    } else {
      anyFailed = true
      console.error(`${file}: ${errors.length} error(s)`)
      for (const e of errors) console.error(`  - ${e}`)
    }
  }
  process.exit(anyFailed ? 1 : 0)
}

// Only run as a CLI when executed directly (`node shared/validate.mjs ...`),
// not when imported as a module (e.g. by /review's server).
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
