// Generic local persistence, independent of the underlying browser storage
// mechanism (localStorage today, could be something else later). Every
// other service reads/writes through this — never `localStorage` directly —
// so the mechanism can change without touching callers.

const PREFIX = "ffjm-trainer:"

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, value)
  } catch {
    // Storage unavailable (private browsing, quota, disabled) — the app
    // still works, this write is silently dropped.
  }
}

function removeRaw(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore, see writeRaw()
  }
}

export const storage = {
  get<T>(key: string): T | null {
    const raw = readRaw(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  set<T>(key: string, value: T): void {
    writeRaw(key, JSON.stringify(value))
  },
  remove(key: string): void {
    removeRaw(key)
  },
}
