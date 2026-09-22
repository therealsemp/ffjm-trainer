import type { CategoryCode } from "../types/profile"
import type { Phase, QuestionMetadata, Tier } from "../types/question"
import { fetchJson } from "./fetchJson"

// One entry per year present in the data, phases ordered qf -> sf -> fn
// (Story 3.1) — never a phase absent from that year's actual data.
export interface Edition {
  year: number
  phases: Phase[]
}

// Exported since the archive selection page (Story 3.1) needs the full,
// fixed order to always render all 3 phases, greying out the ones absent
// from a given year rather than only listing what exists.
export const PHASE_ORDER: Phase[] = ["qf", "sf", "fn"]

// Canonical tier order — mirrors shared/categories.mjs's CANONICAL_ORDER,
// collapsed to the 6 real tiers (L1/GP and L2/HC are one tier each, since
// they share the same question pool). Exported since trainingSessionService
// and the stats display also need the full, ordered tier list.
export const TIER_ORDER: Tier[] = ["CE", "CM", "C1", "C2", "L1/GP", "L2/HC"]

// Which tier a profile category maxes out at.
const CATEGORY_TO_TIER: Record<CategoryCode, Tier> = {
  CE: "CE",
  CM: "CM",
  C1: "C1",
  C2: "C2",
  L1: "L1/GP",
  GP: "L1/GP",
  L2: "L2/HC",
  HC: "L2/HC",
}

// Official coefficients, incremental per tier (how many questions natively
// belong to that tier) — not the cumulative total a candidate of a given
// category answers overall. See Story 2.2.
const TIER_COEFFICIENTS: Record<Tier, number> = {
  CE: 5,
  CM: 3,
  C1: 3,
  C2: 3,
  "L1/GP": 2,
  "L2/HC": 2,
}

let manifestPromise: Promise<QuestionMetadata[]> | null = null

function loadManifest(): Promise<QuestionMetadata[]> {
  if (!manifestPromise) {
    // Don't cache a failed attempt — a transient failure (e.g. the dev
    // server mid-restart) would otherwise poison every future draw for
    // the rest of the page's life, since nothing would ever retry.
    manifestPromise = fetchJson<QuestionMetadata[]>(
      `${import.meta.env.BASE_URL}data/questions.json`,
      "Failed to load question metadata",
    ).catch((error: unknown) => {
      manifestPromise = null
      throw error
    })
  }
  return manifestPromise
}

export const questionMetadataService = {
  // Kicks off (and caches) the manifest fetch without waiting on it — call
  // this as early as possible (see AppLayout) so it's likely already
  // resolved by the time a screen actually needs it.
  preload(): void {
    void loadManifest()
  },

  // Every tier from the simplest up to the one matching `category`,
  // inclusive (Story 2.1).
  getAvailableTiers(category: CategoryCode): Tier[] {
    const maxTier = CATEGORY_TO_TIER[category]
    return TIER_ORDER.slice(0, TIER_ORDER.indexOf(maxTier) + 1)
  },

  // Weighted random pick among `levels`, renormalized over just those
  // levels (Story 2.2). Assumes `levels` is non-empty — Story 2.1 requires
  // at least one selected level before a session can start.
  pickWeightedTier(levels: Tier[]): Tier {
    const total = levels.reduce((sum, tier) => sum + TIER_COEFFICIENTS[tier], 0)
    let roll = Math.random() * total
    for (const tier of levels) {
      roll -= TIER_COEFFICIENTS[tier]
      if (roll < 0) return tier
    }
    return levels[levels.length - 1]
  },

  // Uniform random pick among every question of a given tier.
  async pickRandomQuestionInTier(tier: Tier): Promise<QuestionMetadata> {
    const manifest = await loadManifest()
    const pool = manifest.filter((question) => question.tier === tier)
    return pool[Math.floor(Math.random() * pool.length)]
  },

  // Used by questionService to resolve an id into year/phase/number before
  // fetching the question's full content.
  async getById(id: string): Promise<QuestionMetadata> {
    const manifest = await loadManifest()
    const entry = manifest.find((question) => question.id === id)
    if (!entry) throw new Error(`Unknown question id: ${id}`)
    return entry
  },

  // The FFJM "number of solutions" instruction (see functional-spec.md)
  // applies whenever a question's tier is strictly above CM.
  isAboveCM(tier: Tier): boolean {
    return TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf("CM")
  },

  // Every edition (year + phase) actually present in the data, most recent
  // year first (Story 3.1) — only combinations that exist are ever listed.
  async getAvailableEditions(): Promise<Edition[]> {
    const manifest = await loadManifest()
    const phasesByYear = new Map<number, Set<Phase>>()
    for (const question of manifest) {
      if (!phasesByYear.has(question.year)) phasesByYear.set(question.year, new Set())
      phasesByYear.get(question.year)!.add(question.phase)
    }
    return [...phasesByYear.entries()]
      .sort(([yearA], [yearB]) => yearB - yearA)
      .map(([year, phases]) => ({ year, phases: PHASE_ORDER.filter((phase) => phases.has(phase)) }))
  },

  // An edition's full question list, in the contest's official order
  // (Story 3.2) — `number` is that order, not just a file-naming detail.
  async getEditionQuestions(year: number, phase: Phase): Promise<QuestionMetadata[]> {
    const manifest = await loadManifest()
    return manifest
      .filter((question) => question.year === year && question.phase === phase)
      .sort((a, b) => a.number - b.number)
  },
}
