import type { TableHTMLAttributes } from "react"

// react-markdown's `table` renderer, wrapped in its own horizontally
// scrollable container so a wide table (many columns) never makes the
// whole page scroll sideways — only the table itself does. No visual
// scroll hint: the browser's own overlay scrollbar (appears while
// scrolling, hides otherwise) already made this discoverable in testing.
export function ScrollableTable(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  )
}
