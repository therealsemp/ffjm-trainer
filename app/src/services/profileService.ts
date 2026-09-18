import { CATEGORY_OPTIONS, type Profile } from "../types/profile"
import { storage } from "./storage"

const PROFILE_KEY = "profile"

const VALID_CATEGORY_CODES = new Set(CATEGORY_OPTIONS.map((option) => option.code))

function isValidProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<Profile>
  return (
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.category === "string" &&
    VALID_CATEGORY_CODES.has(candidate.category as Profile["category"])
  )
}

export const profileService = {
  // Story 1.1, scenario 3: a present-but-corrupted profile is treated as
  // "no profile" rather than surfaced as an error.
  getActiveProfile(): Profile | null {
    const stored = storage.get<Profile>(PROFILE_KEY)
    return isValidProfile(stored) ? stored : null
  },

  createProfile(profile: Profile): void {
    storage.set(PROFILE_KEY, profile)
  },

  resetProfile(): void {
    storage.remove(PROFILE_KEY)
  },
}
