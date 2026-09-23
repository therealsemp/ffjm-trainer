import { test, describe } from "node:test"
import assert from "node:assert/strict"
import { CANONICAL_ORDER, TIERS, categoryRank, isCanonicallySorted, tierForCategories } from "./categories.mjs"

describe("categoryRank", () => {
  test("ranks follow CANONICAL_ORDER", () => {
    assert.equal(categoryRank("CE"), 0)
    assert.equal(categoryRank("HC"), CANONICAL_ORDER.length - 1)
  })

  test("unknown category has no rank", () => {
    assert.equal(categoryRank("XX"), undefined)
  })
})

describe("isCanonicallySorted", () => {
  test("accepts an empty list", () => {
    assert.equal(isCanonicallySorted([]), true)
  })

  test("accepts a single category", () => {
    assert.equal(isCanonicallySorted(["C1"]), true)
  })

  test("accepts a properly ordered list", () => {
    assert.equal(isCanonicallySorted(["CE", "CM", "C1", "C2", "L1", "GP", "L2", "HC"]), true)
  })

  test("accepts a sparse but ordered list", () => {
    assert.equal(isCanonicallySorted(["C1", "C2", "HC"]), true)
  })

  test("accepts repeated equal-rank entries", () => {
    assert.equal(isCanonicallySorted(["L1", "L1"]), true)
  })

  test("rejects an out-of-order list", () => {
    assert.equal(isCanonicallySorted(["CM", "CE"]), false)
  })

  test("rejects an out-of-order list even when only the tail is wrong", () => {
    assert.equal(isCanonicallySorted(["CE", "CM", "C2", "C1"]), false)
  })

  test("rejects an unknown category", () => {
    assert.equal(isCanonicallySorted(["CE", "XX"]), false)
  })
})

describe("tierForCategories", () => {
  test("undefined for an empty or missing list", () => {
    assert.equal(tierForCategories([]), undefined)
    assert.equal(tierForCategories(undefined), undefined)
  })

  test("a single category maps to its own tier", () => {
    assert.equal(tierForCategories(["CE"]), "CE")
    assert.equal(tierForCategories(["C2"]), "C2")
  })

  test("picks the lowest-ranked category, regardless of input order", () => {
    assert.equal(tierForCategories(["C2", "L1", "GP", "HC"]), "C2")
    assert.equal(tierForCategories(["HC", "CE"]), "CE")
  })

  test("L1 and GP collapse to the same composite tier", () => {
    assert.equal(tierForCategories(["L1", "GP"]), "L1/GP")
    assert.equal(tierForCategories(["GP"]), "L1/GP")
  })

  test("L2 and HC collapse to the same composite tier", () => {
    assert.equal(tierForCategories(["L2", "HC"]), "L2/HC")
    assert.equal(tierForCategories(["HC"]), "L2/HC")
  })

  test("every derived tier is one of the 6 canonical tiers", () => {
    for (const category of CANONICAL_ORDER) {
      assert.ok(TIERS.includes(tierForCategories([category])))
    }
  })
})
