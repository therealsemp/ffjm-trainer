#!/usr/bin/env node
// Renders one PDF page to a PNG, for visually locating figure crop boxes.
//
// Usage: node scripts/render-page.mjs <pdf> <page> <scale> <out.png>

import { createCanvas } from "@napi-rs/canvas"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

// Older/scanned FFJM PDFs use embedded standard fonts and JBig2-compressed
// images that pdfjs can't handle from its defaults alone — without these, it
// silently drops the affected text/figures instead of erroring loudly, which
// is worse. Point it at the data pdfjs-dist itself ships.
const PDFJS_DIST_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "node_modules", "pdfjs-dist")
const PDFJS_OPTIONS = {
  standardFontDataUrl: path.join(PDFJS_DIST_ROOT, "standard_fonts") + path.sep,
  wasmUrl: path.join(PDFJS_DIST_ROOT, "wasm") + path.sep,
}

const [, , pdfPath, pageArg, scaleArg, outPath] = process.argv
const pageNum = parseInt(pageArg, 10)
const scale = parseFloat(scaleArg)

const data = new Uint8Array(readFileSync(pdfPath))
const doc = await pdfjsLib.getDocument({ data, ...PDFJS_OPTIONS }).promise
const page = await doc.getPage(pageNum)
const viewport = page.getViewport({ scale })

const canvas = createCanvas(viewport.width, viewport.height)
await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise

writeFileSync(outPath, canvas.toBuffer("image/png"))
console.log(`page ${pageNum} @ scale ${scale} -> ${outPath} (${viewport.width}x${viewport.height})`)
