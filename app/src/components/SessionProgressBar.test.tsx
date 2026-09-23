import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { SessionProgressBar } from "./SessionProgressBar"

function segments(container: HTMLElement) {
  return container.querySelectorAll("[role='img'] > div")
}

describe("SessionProgressBar", () => {
  test("renders exactly `target` segments", () => {
    const { container } = render(<SessionProgressBar outcomes={[]} target={5} />)
    expect(segments(container)).toHaveLength(5)
  })

  test("renders zero segments for a target of 0", () => {
    const { container } = render(<SessionProgressBar outcomes={[]} target={0} />)
    expect(segments(container)).toHaveLength(0)
  })

  test("colors segments in order for answered questions, leaves the rest neutral", () => {
    const { container } = render(<SessionProgressBar outcomes={["found", "notFound"]} target={4} />)
    const [s1, s2, s3, s4] = Array.from(segments(container)) as HTMLElement[]
    expect(s1.style.backgroundColor).toBe("var(--color-status-good)")
    expect(s2.style.backgroundColor).toBe("var(--color-status-warning)")
    expect(s3.style.backgroundColor).toBe("")
    expect(s4.style.backgroundColor).toBe("")
  })

  test("exposes progress via an accessible label", () => {
    render(<SessionProgressBar outcomes={["found"]} target={10} />)
    expect(screen.getByRole("img", { name: "Progression de la session : 1 sur 10 questions" })).toBeInTheDocument()
  })

  test("more outcomes than target still renders only `target` segments (defensive)", () => {
    const { container } = render(<SessionProgressBar outcomes={["found", "found", "found"]} target={2} />)
    expect(segments(container)).toHaveLength(2)
  })
})
