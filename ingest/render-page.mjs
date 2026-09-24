#!/usr/bin/env node
// Renders one PDF page to a PNG, for visually locating figure crop boxes.
//
// Usage: node scripts/render-page.mjs <pdf> <page> <scale> <out.png>

import { createCanvas } from "@napi-rs/canvas"
import { readFileSync, writeFileSync } from "node:fs"
import { PDFJS_OPTIONS } from "./pdfjs-options.mjs"

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

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
