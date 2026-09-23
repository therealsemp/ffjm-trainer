import { beforeEach, describe, expect, test } from "vitest"
import { storage } from "./storage"

beforeEach(() => {
  window.localStorage.clear()
})

describe("storage", () => {
  test("get returns null when nothing was stored", () => {
    expect(storage.get("missing-key")).toBeNull()
  })

  test("set then get round-trips a value", () => {
    storage.set("key", { a: 1, b: ["x", "y"] })
    expect(storage.get("key")).toEqual({ a: 1, b: ["x", "y"] })
  })

  test("remove clears a stored value", () => {
    storage.set("key", 42)
    storage.remove("key")
    expect(storage.get("key")).toBeNull()
  })

  test("get returns null for corrupted (non-JSON) stored data", () => {
    // Bypass storage.set to write something storage.get can't JSON.parse.
    window.localStorage.setItem("ffjm-trainer:key", "not valid json{")
    expect(storage.get("key")).toBeNull()
  })

  test("keys are namespaced, isolated from raw localStorage keys", () => {
    storage.set("key", "value")
    expect(window.localStorage.getItem("key")).toBeNull()
    expect(window.localStorage.getItem("ffjm-trainer:key")).not.toBeNull()
  })
})
