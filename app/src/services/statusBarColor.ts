// Story 5.1: status bar color of the installed (standalone) Android app.
// index.html declares one `theme-color` meta per system color scheme (with a
// `media` query), which covers the "system" theme preference on its own. An
// explicit theme choice (Story 1.4) must win over the OS setting, like
// `data-theme` does for the CSS: both metas are then set to that theme's
// color, so whichever one the browser picks shows the forced theme.

import type { ThemePreference } from "../types/theme"

type Scheme = "light" | "dark"

// Light: the "Vif" blue (--color-brand-blue). Dark: the "Classique"
// background (--color-brand-bg, dark). Keep in sync with index.html's metas.
export const STATUS_BAR_COLORS: Record<Scheme, string> = {
  light: "#2955a6",
  dark: "#0f1b2d",
}

export function applyStatusBarColor(preference: ThemePreference): void {
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][data-scheme]')
  for (const meta of metas) {
    const scheme = meta.dataset.scheme as Scheme
    meta.content = STATUS_BAR_COLORS[preference === "system" ? scheme : preference]
  }
}
