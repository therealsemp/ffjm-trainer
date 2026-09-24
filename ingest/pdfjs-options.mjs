// Shared pdfjs getDocument() options for every ingest script that renders a
// PDF page (render-page, crop-figure, autocrop-figure, preview-crop).
//
// Older/scanned FFJM PDFs use embedded standard fonts and JBig2-compressed
// images that pdfjs can't handle from its defaults alone — without these, it
// silently drops the affected text/figures instead of erroring loudly, which
// is worse (e.g. the grid digits of 2020-fn Q10 vanished from crops). Point
// it at the data pdfjs-dist itself ships.

import path from "node:path"
import { fileURLToPath } from "node:url"

const PDFJS_DIST_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "node_modules", "pdfjs-dist")

export const PDFJS_OPTIONS = {
  standardFontDataUrl: path.join(PDFJS_DIST_ROOT, "standard_fonts") + path.sep,
  wasmUrl: path.join(PDFJS_DIST_ROOT, "wasm") + path.sep,
}
