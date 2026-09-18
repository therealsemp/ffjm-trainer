// React wiring around themeService. "system" applies itself via the plain
// CSS media query in index.css — no JS needed for that case. An explicit
// choice is applied by stamping `data-theme` on <html>, which the same
// CSS is written to prefer over the media query either way.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { themeService } from "./themeService"
import type { ThemePreference } from "../types/theme"

interface ThemeContextValue {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => themeService.getPreference())

  useEffect(() => {
    if (preference === "system") {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = preference
    }
  }, [preference])

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      setPreference: (next: ThemePreference) => {
        themeService.setPreference(next)
        setPreferenceState(next)
      },
    }),
    [preference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
