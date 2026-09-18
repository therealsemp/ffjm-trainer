// Vite's dev server (and possibly other static hosts) answer a genuinely
// missing file with a 200 OK SPA-fallback HTML page instead of a real 404
// — `response.ok` doesn't catch that. Checking Content-Type avoids
// silently handing that HTML to JSON.parse and crashing with a cryptic
// "Unexpected token '<'" instead of a clear, actionable error.
export async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url)
  const contentType = response.headers.get("content-type") ?? ""
  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error(`${errorMessage} (status ${response.status}, content-type "${contentType || "none"}")`)
  }
  return response.json() as Promise<T>
}
