#!/usr/bin/env node
// Validates a single question JSON file (one exercise + its answer, one file
// per question — each file is self-contained: it carries its own
// year/champNumber/phase/sourceFiles rather than inheriting them from a
// parent exam file). Shape follows docs/technical-architecture.md, extended
// with title/number/coefficient/categories.
//
// Used by both /ingest (before a question leaves needs-review) and the
// future /review tool (before promoting a question to validated).
//
// Usage: node shared/validate.mjs <path/to/question.json> [...more files]

import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

const PHASES = ["qf", "sf", "fn"]
const CATEGORIES = ["CE", "CM", "C1", "C2", "L1", "L2", "GP", "HC"]
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

function checkSourcePath(value, fieldPath, errors, baseDir) {
  if (typeof value !== "string" || value === "") {
    fail(errors, fieldPath, "must be a non-empty string path")
    return
  }
  if (path.isAbsolute(value)) {
    fail(errors, fieldPath, "must be a relative path (relative to this question file's own directory), not absolute")
    return
  }
  if (!existsSync(path.join(baseDir, value))) {
    fail(errors, fieldPath, `file not found: ${value} (relative to ${baseDir})`)
  }
}

function validateQuestion(q, errors, baseDir) {
  // Exam-level fields, denormalized into every question file.
  if (!Number.isInteger(q.year)) fail(errors, "year", "must be an integer")
  if (!PHASES.includes(q.phase)) fail(errors, "phase", `must be one of ${PHASES.join(", ")}`)
  if (q.champNumber !== null && !Number.isInteger(q.champNumber)) fail(errors, "champNumber", "must be an integer or null")
  if (q.examTitle !== undefined && typeof q.examTitle !== "string") fail(errors, "examTitle", "must be a string when present")

  if (typeof q.sourceFiles !== "object" || q.sourceFiles === null) {
    fail(errors, "sourceFiles", "must be an object")
  } else {
    checkSourcePath(q.sourceFiles.statement, "sourceFiles.statement", errors, baseDir)
    if (!Array.isArray(q.sourceFiles.detailedSolutions) || q.sourceFiles.detailedSolutions.length === 0) {
      fail(errors, "sourceFiles.detailedSolutions", "must be a non-empty array of string paths")
    } else {
      q.sourceFiles.detailedSolutions.forEach((p, i) => checkSourcePath(p, `sourceFiles.detailedSolutions[${i}]`, errors, baseDir))
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
  }

  validateRichContent(q.statement, "statement", errors, baseDir)
  validateRichContent(q.correction, "correction", errors, baseDir)

  if (typeof q.answer !== "object" || q.answer === null) {
    fail(errors, "answer", "must be an object")
  } else {
    if (!ANSWER_TYPES.includes(q.answer.type)) fail(errors, "answer.type", `must be one of ${ANSWER_TYPES.join(", ")}`)
    if (q.answer.type !== "open" && (q.answer.value === undefined || q.answer.value === "")) {
      fail(errors, "answer.value", "required unless answer.type is 'open'")
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

main()
