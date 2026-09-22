import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import type { RichContent as RichContentType } from "../types/question"
import { ZoomableImage } from "./ZoomableImage"

// The transcribed data uses `\( ... \)` / `\[ ... \]` (see
// ingest/TRANSCRIPTION-GUIDE.md), but remark-math only recognizes
// `$...$` / `$$...$$` — normalize before handing markdown to it.
function normalizeLatexDelimiters(markdown: string): string {
  return markdown
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expr: string) => `$$${expr}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, expr: string) => `$${expr}$`)
}

// Figures are referenced inline as `![figure](figure:<id>)`. Resolved by
// rewriting the markdown string to a real URL *before* parsing — handing
// react-markdown the raw `figure:<id>` URL and resolving it in a custom
// `img` component doesn't work, because react-markdown's built-in URL
// sanitizer strips unrecognized schemes first, so the component never
// even sees it. Same technique (and the same anti-collision fix) as
// /review's renderer: match up to the closing `)`, not just the id, so
// one id being a prefix of another (e.g. "...corr-t1" inside
// "...corr-t10") doesn't get partially replaced.
function resolveFigureReferences(markdown: string, content: RichContentType, basePath: string): string {
  let resolved = markdown
  for (const figure of content.figures ?? []) {
    if (!figure.imageUrl) continue
    const placeholder = `figure:${figure.id})`
    resolved = resolved.replaceAll(placeholder, `${basePath}/${encodeURIComponent(figure.imageUrl)})`)
  }
  return resolved
}

interface RichContentProps {
  content: RichContentType
  // Directory the content's own files (figure images) live in, e.g.
  // `${BASE_URL}data/2025/qf` — figures are copied next to the question.
  basePath: string
}

export function RichContent({ content, basePath }: RichContentProps) {
  const markdown = resolveFigureReferences(normalizeLatexDelimiters(content.markdown), content, basePath)

  return (
    <div
      className="flex flex-col gap-3 [&_.katex-display]:overflow-x-auto [&_img]:mx-auto [&_img]:max-w-full
      [&_table]:my-2 [&_table]:border-collapse [&_td]:border [&_td]:border-brand-line [&_td]:p-2
      [&_th]:border [&_th]:border-brand-line [&_th]:bg-brand-bg [&_th]:p-2"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{ img: ZoomableImage }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
