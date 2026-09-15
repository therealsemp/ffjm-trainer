// FFJM category tiers, canonical order, and the derived "tier" concept —
// shared by /ingest (transcription), the /review validation, and eventually
// /app (building a graduated mock exam for a given category).
//
// A question's `categories` field lists every category that has access to
// it (faithful to whatever the source PDF actually shows — some years start
// every category at problem 1, others stagger start/end per category, see
// ingest/TRANSCRIPTION-GUIDE.md). `categories` must always be sorted in this
// canonical order. `tier` is then simply the lowest-ranked category in that
// list — the category this question was "introduced" at — collapsed to a
// single string, with tied categories (L1/GP, L2/HC — always co-terminous in
// every year sampled so far) merged into one composite label.
//
// `tier` alone is NOT a substitute for `categories`: on a staggered-start
// year (e.g. 2003), a category can have access to a question without being
// its lowest-ranked one (CM's real range was 3-8, but questions 3-5's tier
// is "CE" since CE is lower-ranked and also active there). Reconstructing
// one category's full exam requires filtering `categories`, not grouping by
// `tier`.

export const CANONICAL_ORDER = ["CE", "CM", "C1", "C2", "L1", "GP", "L2", "HC"]

const RANK = Object.fromEntries(CANONICAL_ORDER.map((c, i) => [c, i]))

// Composite tier label per canonical-order index. L1/GP share a tier, as do
// L2/HC — every sampled year (2003, 2018, 2020, 2026) ties them together.
const TIER_LABEL = {
  CE: "CE",
  CM: "CM",
  C1: "C1",
  C2: "C2",
  L1: "L1/GP",
  GP: "L1/GP",
  L2: "L2/HC",
  HC: "L2/HC",
}

export const TIERS = ["CE", "CM", "C1", "C2", "L1/GP", "L2/HC"]

export function categoryRank(category) {
  return RANK[category]
}

// True if `categories` is sorted in canonical order (ties broken by
// CANONICAL_ORDER's own L1-before-GP / L2-before-HC convention).
export function isCanonicallySorted(categories) {
  for (let i = 1; i < categories.length; i++) {
    if (RANK[categories[i - 1]] === undefined || RANK[categories[i]] === undefined) return false
    if (RANK[categories[i - 1]] > RANK[categories[i]]) return false
  }
  return true
}

// The tier a question was introduced at, derived from the lowest-ranked
// entry of its (canonically sorted) `categories` list.
export function tierForCategories(categories) {
  if (!categories || categories.length === 0) return undefined
  const lowest = categories.reduce((min, c) => (RANK[c] < RANK[min] ? c : min), categories[0])
  return TIER_LABEL[lowest]
}
