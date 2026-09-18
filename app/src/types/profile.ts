// FFJM category codes, in the order a human picks a school level, not the
// canonical tier-ranking order used elsewhere in the project (see
// shared/categories.mjs) — this list is just UI content for Story 1.2.
export type CategoryCode = "CE" | "CM" | "C1" | "C2" | "L1" | "L2" | "GP" | "HC"

export interface CategoryOption {
  code: CategoryCode
  label: string
  description: string
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { code: "CE", label: "CE1 / CE2", description: "Écoliers cours élémentaire" },
  { code: "CM", label: "CM1 / CM2", description: "Écoliers cours moyen" },
  { code: "C1", label: "6e / 5e", description: "Collégiens cycle 1" },
  { code: "C2", label: "4e / 3e", description: "Collégiens cycle 2" },
  { code: "L1", label: "2nde / 1ère / Terminale", description: "Lycéens" },
  { code: "L2", label: "Étudiant (Bac+1 à Bac+5)", description: "Étudiants" },
  { code: "GP", label: "Adulte, grand public", description: "Grand public" },
  { code: "HC", label: "Haute compétition", description: "Compétiteurs confirmés" },
]

export interface Profile {
  name: string
  category: CategoryCode
}
