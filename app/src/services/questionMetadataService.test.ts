import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import type { QuestionMetadata } from "../types/question"

// `questionMetadataService` caches its manifest fetch in a module-level
// variable — reset the module graph between tests so each test controls
// its own mocked manifest instead of reusing a previous test's cache.
beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockManifest(questions: QuestionMetadata[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(questions), { status: 200, headers: { "content-type": "application/json" } })),
  )
}

const Q = (overrides: Partial<QuestionMetadata>): QuestionMetadata => ({
  id: "id",
  year: 2025,
  phase: "qf",
  number: 1,
  tier: "CE",
  categories: ["CE"],
  ...overrides,
})

describe("getAvailableTiers", () => {
  test("a low category only unlocks tiers up to itself", async () => {
    const { questionMetadataService } = await import("./questionMetadataService")
    expect(questionMetadataService.getAvailableTiers("CE")).toEqual(["CE"])
  })

  test("a high category unlocks every tier", async () => {
    const { questionMetadataService } = await import("./questionMetadataService")
    expect(questionMetadataService.getAvailableTiers("HC")).toEqual(["CE", "CM", "C1", "C2", "L1/GP", "L2/HC"])
  })

  test("L1 and GP both unlock up to the same composite tier", async () => {
    const { questionMetadataService } = await import("./questionMetadataService")
    expect(questionMetadataService.getAvailableTiers("L1")).toEqual(questionMetadataService.getAvailableTiers("GP"))
  })
})

describe("pickWeightedTier", () => {
  test("a single level is always picked", async () => {
    const { questionMetadataService } = await import("./questionMetadataService")
    for (let i = 0; i < 20; i++) {
      expect(questionMetadataService.pickWeightedTier(["C1"])).toBe("C1")
    }
  })

  test("only picks among the given levels", async () => {
    const { questionMetadataService } = await import("./questionMetadataService")
    const levels: Array<"CE" | "CM"> = ["CE", "CM"]
    for (let i = 0; i < 50; i++) {
      expect(levels).toContain(questionMetadataService.pickWeightedTier(levels))
    }
  })
})

describe("isAboveCM", () => {
  test("CE and CM are not above CM", async () => {
    const { questionMetadataService } = await import("./questionMetadataService")
    expect(questionMetadataService.isAboveCM("CE")).toBe(false)
    expect(questionMetadataService.isAboveCM("CM")).toBe(false)
  })

  test("C1 and above are above CM", async () => {
    const { questionMetadataService } = await import("./questionMetadataService")
    expect(questionMetadataService.isAboveCM("C1")).toBe(true)
    expect(questionMetadataService.isAboveCM("L2/HC")).toBe(true)
  })
})

describe("pickRandomQuestionInTier", () => {
  test("only returns a question from the requested tier", async () => {
    mockManifest([Q({ id: "a", tier: "CE" }), Q({ id: "b", tier: "CM" }), Q({ id: "c", tier: "CE" })])
    const { questionMetadataService } = await import("./questionMetadataService")
    for (let i = 0; i < 10; i++) {
      const picked = await questionMetadataService.pickRandomQuestionInTier("CE")
      expect(["a", "c"]).toContain(picked.id)
    }
  })
})

describe("getById", () => {
  test("resolves an existing id", async () => {
    mockManifest([Q({ id: "found-me" })])
    const { questionMetadataService } = await import("./questionMetadataService")
    expect((await questionMetadataService.getById("found-me")).id).toBe("found-me")
  })

  test("throws for an unknown id", async () => {
    mockManifest([Q({ id: "exists" })])
    const { questionMetadataService } = await import("./questionMetadataService")
    await expect(questionMetadataService.getById("unknown")).rejects.toThrow(/Unknown question id/)
  })
})

describe("getAvailableEditions", () => {
  test("groups phases by year, most recent year first", async () => {
    mockManifest([
      Q({ year: 2024, phase: "qf" }),
      Q({ year: 2025, phase: "sf" }),
      Q({ year: 2024, phase: "fn" }),
      Q({ year: 2025, phase: "qf" }),
    ])
    const { questionMetadataService } = await import("./questionMetadataService")
    expect(await questionMetadataService.getAvailableEditions()).toEqual([
      { year: 2025, phases: ["qf", "sf"] },
      { year: 2024, phases: ["qf", "fn"] },
    ])
  })

  test("a year missing a phase only lists the phases it actually has", async () => {
    mockManifest([Q({ year: 2023, phase: "sf" }), Q({ year: 2023, phase: "fn" })])
    const { questionMetadataService } = await import("./questionMetadataService")
    expect(await questionMetadataService.getAvailableEditions()).toEqual([{ year: 2023, phases: ["sf", "fn"] }])
  })
})

describe("getEditionQuestions", () => {
  test("sorts by question number, not manifest order", async () => {
    mockManifest([
      Q({ id: "q3", year: 2025, phase: "qf", number: 3 }),
      Q({ id: "q1", year: 2025, phase: "qf", number: 1 }),
      Q({ id: "q2", year: 2025, phase: "qf", number: 2 }),
      Q({ id: "other-edition", year: 2024, phase: "qf", number: 1 }),
    ])
    const { questionMetadataService } = await import("./questionMetadataService")
    const questions = await questionMetadataService.getEditionQuestions(2025, "qf")
    expect(questions.map((q) => q.id)).toEqual(["q1", "q2", "q3"])
  })
})
