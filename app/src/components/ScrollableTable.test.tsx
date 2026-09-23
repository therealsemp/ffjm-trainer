import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { HighlightableCell, ScrollableTable } from "./ScrollableTable"

describe("ScrollableTable", () => {
  test("wraps the table in a horizontally scrollable container", () => {
    const { container } = render(
      <ScrollableTable>
        <tbody>
          <tr>
            <td>a</td>
          </tr>
        </tbody>
      </ScrollableTable>,
    )
    const wrapper = container.querySelector(".overflow-x-auto")
    expect(wrapper).not.toBeNull()
    expect(wrapper?.querySelector("table")).not.toBeNull()
  })
})

describe("HighlightableCell", () => {
  test("a cell whose sole child is a <del> is unwrapped and shaded", () => {
    render(
      <table>
        <tbody>
          <tr>
            <HighlightableCell>
              <del>1212</del>
            </HighlightableCell>
          </tr>
        </tbody>
      </table>,
    )
    const cell = screen.getByText("1212")
    expect(cell.tagName).toBe("TD")
    expect(cell.querySelector("del")).toBeNull()
    expect(cell.className).toContain("bg-brand-gold/25")
  })

  test("a plain cell is left untouched", () => {
    render(
      <table>
        <tbody>
          <tr>
            <HighlightableCell>2013</HighlightableCell>
          </tr>
        </tbody>
      </table>,
    )
    const cell = screen.getByText("2013")
    expect(cell.className).not.toContain("bg-brand-gold/25")
  })

  test("a cell with a <del> plus other content is not treated as highlighted", () => {
    render(
      <table>
        <tbody>
          <tr>
            <HighlightableCell>
              <del>partial</del>
              {" and more"}
            </HighlightableCell>
          </tr>
        </tbody>
      </table>,
    )
    const cell = screen.getByText("and more", { exact: false })
    expect(cell.className).not.toContain("bg-brand-gold/25")
    expect(cell.querySelector("del")).not.toBeNull()
  })

  test("preserves other props (e.g. remark-gfm's column alignment style)", () => {
    render(
      <table>
        <tbody>
          <tr>
            <HighlightableCell style={{ textAlign: "center" }}>value</HighlightableCell>
          </tr>
        </tbody>
      </table>,
    )
    expect(screen.getByText("value")).toHaveStyle({ textAlign: "center" })
  })
})
