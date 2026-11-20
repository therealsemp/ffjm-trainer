import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { applyStatusBarColor, STATUS_BAR_COLORS } from "./statusBarColor"

function metaContent(scheme: "light" | "dark"): string | null {
  return document.querySelector(`meta[name="theme-color"][data-scheme="${scheme}"]`)?.getAttribute("content") ?? null
}

describe("applyStatusBarColor", () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta name="theme-color" content="${STATUS_BAR_COLORS.light}" media="(prefers-color-scheme: light)" data-scheme="light" />
      <meta name="theme-color" content="${STATUS_BAR_COLORS.dark}" media="(prefers-color-scheme: dark)" data-scheme="dark" />
    `
  })

  afterEach(() => {
    document.head.innerHTML = ""
  })

  test("forced light sets both metas to the light color", () => {
    applyStatusBarColor("light")
    expect(metaContent("light")).toBe(STATUS_BAR_COLORS.light)
    expect(metaContent("dark")).toBe(STATUS_BAR_COLORS.light)
  })

  test("forced dark sets both metas to the dark color", () => {
    applyStatusBarColor("dark")
    expect(metaContent("light")).toBe(STATUS_BAR_COLORS.dark)
    expect(metaContent("dark")).toBe(STATUS_BAR_COLORS.dark)
  })

  test("system restores each meta to its own scheme's color", () => {
    applyStatusBarColor("dark")
    applyStatusBarColor("system")
    expect(metaContent("light")).toBe(STATUS_BAR_COLORS.light)
    expect(metaContent("dark")).toBe(STATUS_BAR_COLORS.dark)
  })
})
