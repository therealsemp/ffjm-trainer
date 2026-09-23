import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
} from "react"

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

// Some source PDFs highlight specific table rows in color (e.g. a big
// data table where a handful of rows are the actual answer) — markdown
// tables have no per-cell styling, so the transcription marks a
// highlighted cell with `~~...~~` (GFM strikethrough, otherwise unused
// in this content) and this renderer repurposes it as "shade this cell"
// instead of drawing a strikethrough line.
function soleStrikethroughContent(children: ReactNode): ReactNode | undefined {
  const items = Children.toArray(children)
  if (items.length !== 1 || !isValidElement(items[0]) || items[0].type !== "del") return undefined
  return (items[0] as ReactElement<{ children?: ReactNode }>).props.children
}

export function HighlightableCell(props: TdHTMLAttributes<HTMLTableCellElement>) {
  const { children, className, ...rest } = props
  const highlighted = soleStrikethroughContent(children)
  if (highlighted !== undefined) {
    return (
      <td {...rest} className={`bg-brand-gold/25 font-semibold ${className ?? ""}`}>
        {highlighted}
      </td>
    )
  }
  return (
    <td {...rest} className={className}>
      {children}
    </td>
  )
}
