import type { ThemePreference } from "../types/theme"
import { storage } from "./storage"

const THEME_KEY = "theme"

const VALID_PREFERENCES: ThemePreference[] = ["light", "dark", "system"]

function isValidPreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && VALID_PREFERENCES.includes(value as ThemePreference)
}

export const themeService = {
  // "system" is the default whenever nothing (valid) is stored yet.
  getPreference(): ThemePreference {
    const stored = storage.get<ThemePreference>(THEME_KEY)
    return isValidPreference(stored) ? stored : "system"
  },

  setPreference(preference: ThemePreference): void {
    storage.set(THEME_KEY, preference)
  },
}
