import { beforeEach, describe, expect, test } from "vitest"
import { profileService } from "./profileService"
import { storage } from "./storage"

beforeEach(() => {
  window.localStorage.clear()
})

describe("profileService", () => {
  test("getActiveProfile returns null when nothing was created", () => {
    expect(profileService.getActiveProfile()).toBeNull()
  })

  test("createProfile then getActiveProfile round-trips", () => {
    profileService.createProfile({ name: "Julien", category: "GP" })
    expect(profileService.getActiveProfile()).toEqual({ name: "Julien", category: "GP" })
  })

  test("resetProfile clears the stored profile", () => {
    profileService.createProfile({ name: "Julien", category: "GP" })
    profileService.resetProfile()
    expect(profileService.getActiveProfile()).toBeNull()
  })

  test("a stored profile with an empty name is treated as no profile", () => {
    storage.set("profile", { name: "  ", category: "GP" })
    expect(profileService.getActiveProfile()).toBeNull()
  })

  test("a stored profile with an unknown category is treated as no profile", () => {
    storage.set("profile", { name: "Julien", category: "XX" })
    expect(profileService.getActiveProfile()).toBeNull()
  })

  test("a stored non-object value is treated as no profile", () => {
    storage.set("profile", "just a string")
    expect(profileService.getActiveProfile()).toBeNull()
  })
})
