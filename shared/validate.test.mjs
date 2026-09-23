import { test, describe, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { validateQuestion } from "./validate.mjs"

// validateQuestion checks that sourceFiles/figures point at real files next
// to the question — give it a scratch directory with stub files instead of
// depending on any real data/ fixture.
let dir

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "ffjm-validate-test-"))
  writeFileSync(path.join(dir, "statement.pdf"), "stub")
  writeFileSync(path.join(dir, "solution.pdf"), "stub")
  writeFileSync(path.join(dir, "fig.png"), "stub")
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

function sourceRef(filename) {
  return { path: filename, page: 1, position: { x: 0, y: 0 } }
}

function baseQuestion(overrides = {}) {
  return {
    year: 2025,
    phase: "qf",
    champNumber: 39,
    sourceFiles: {
      statement: sourceRef("statement.pdf"),
      detailedSolutions: [sourceRef("solution.pdf")],
    },
    id: "2025-qf-1",
    number: 1,
    coefficient: 1,
    coefficientSource: "explicit",
    categories: ["CE", "CM"],
    tier: "CE",
    statement: { markdown: "Some statement" },
    correction: { markdown: "Some correction" },
    answer: { type: "exact-numeric", value: 42 },
    ...overrides,
  }
}

function errorsFor(overrides) {
  const errors = []
  validateQuestion(baseQuestion(overrides), errors, dir)
  return errors
}

describe("validateQuestion — standard cases", () => {
  test("accepts a minimal valid question", () => {
    assert.deepEqual(errorsFor({}), [])
  })

  test("accepts champNumber: null", () => {
    assert.deepEqual(errorsFor({ champNumber: null }), [])
  })

  test("accepts an 'open' answer with no value", () => {
    assert.deepEqual(errorsFor({ answer: { type: "open" } }), [])
  })

  test("accepts a figure marked pending", () => {
    assert.deepEqual(
      errorsFor({ statement: { markdown: "text", figures: [{ id: "fig-1", pending: true }] } }),
      [],
    )
  })

  test("accepts a figure with a real imageUrl", () => {
    assert.deepEqual(
      errorsFor({ statement: { markdown: "text", figures: [{ id: "fig-1", imageUrl: "fig.png" }] } }),
      [],
    )
  })
})

describe("validateQuestion — required fields", () => {
  test("rejects a non-integer year", () => {
    assert.ok(errorsFor({ year: "2025" }).some((e) => e.startsWith("year:")))
  })

  test("rejects an unknown phase", () => {
    assert.ok(errorsFor({ phase: "demi" }).some((e) => e.startsWith("phase:")))
  })

  test("rejects a non-integer champNumber", () => {
    assert.ok(errorsFor({ champNumber: "39" }).some((e) => e.startsWith("champNumber:")))
  })

  test("rejects a missing id", () => {
    assert.ok(errorsFor({ id: "" }).some((e) => e.startsWith("id:")))
  })

  test("rejects a non-positive number", () => {
    assert.ok(errorsFor({ number: 0 }).some((e) => e.startsWith("number:")))
  })

  test("rejects a non-positive coefficient", () => {
    assert.ok(errorsFor({ coefficient: 0 }).some((e) => e.startsWith("coefficient:")))
  })

  test("rejects an unknown coefficientSource", () => {
    assert.ok(errorsFor({ coefficientSource: "guessed" }).some((e) => e.startsWith("coefficientSource:")))
  })

  test("rejects an empty detailedSolutions array", () => {
    assert.ok(
      errorsFor({ sourceFiles: { statement: sourceRef("statement.pdf"), detailedSolutions: [] } }).some((e) =>
        e.startsWith("sourceFiles.detailedSolutions:"),
      ),
    )
  })

  test("rejects a source file that doesn't exist on disk", () => {
    assert.ok(
      errorsFor({ sourceFiles: { statement: sourceRef("missing.pdf"), detailedSolutions: [sourceRef("solution.pdf")] } }).some(
        (e) => e.startsWith("sourceFiles.statement.path:"),
      ),
    )
  })
})

describe("validateQuestion — categories/tier", () => {
  test("rejects an empty categories array", () => {
    assert.ok(errorsFor({ categories: [] }).some((e) => e.startsWith("categories:")))
  })

  test("rejects an unknown category", () => {
    assert.ok(errorsFor({ categories: ["XX"] }).some((e) => e.includes("unknown category")))
  })

  test("rejects categories out of canonical order", () => {
    assert.ok(errorsFor({ categories: ["CM", "CE"], tier: "CE" }).some((e) => e.includes("canonical order")))
  })

  test("accepts categories already in canonical order", () => {
    assert.deepEqual(errorsFor({ categories: ["C1", "C2", "L1", "GP"], tier: "C1" }), [])
  })

  test("rejects a tier inconsistent with categories", () => {
    assert.ok(errorsFor({ categories: ["CE", "CM"], tier: "CM" }).some((e) => e.includes("inconsistent")))
  })

  test("rejects an unknown tier", () => {
    assert.ok(errorsFor({ tier: "SuperHC" }).some((e) => e.startsWith("tier:")))
  })
})

describe("validateQuestion — answer", () => {
  test("rejects a non-'open' answer with no value", () => {
    assert.ok(errorsFor({ answer: { type: "exact-numeric" } }).some((e) => e.startsWith("answer.value:")))
  })

  test("rejects a non-'open' answer with an empty-string value", () => {
    assert.ok(errorsFor({ answer: { type: "exact-text", value: "" } }).some((e) => e.startsWith("answer.value:")))
  })

  test("rejects an unknown answer type", () => {
    assert.ok(errorsFor({ answer: { type: "multiple-choice", value: 1 } }).some((e) => e.startsWith("answer.type:")))
  })
})

describe("validateQuestion — figures", () => {
  test("rejects a figure with neither svg, imageUrl, nor pending", () => {
    assert.ok(
      errorsFor({ statement: { markdown: "text", figures: [{ id: "fig-1" }] } }).some((e) =>
        e.includes("must have svg or imageUrl"),
      ),
    )
  })

  test("rejects a figure marked pending that also has an imageUrl", () => {
    assert.ok(
      errorsFor({
        statement: { markdown: "text", figures: [{ id: "fig-1", pending: true, imageUrl: "fig.png" }] },
      }).some((e) => e.includes("already has")),
    )
  })

  test("rejects an imageUrl containing a path separator", () => {
    assert.ok(
      errorsFor({ statement: { markdown: "text", figures: [{ id: "fig-1", imageUrl: "sub/fig.png" }] } }).some((e) =>
        e.includes("bare filename"),
      ),
    )
  })

  test("rejects an imageUrl pointing at a file that doesn't exist", () => {
    assert.ok(
      errorsFor({ statement: { markdown: "text", figures: [{ id: "fig-1", imageUrl: "missing.png" }] } }).some((e) =>
        e.includes("file not found"),
      ),
    )
  })
})
