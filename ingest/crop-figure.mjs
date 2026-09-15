#!/usr/bin/env node
// Crops a figure out of a PDF page and saves it as a standalone PNG, at a
// fixed rendering scale (1.5) chosen as a good size/legibility trade-off for
// on-screen display (see discussion in the review — ~150-300px figures,
// a few KB to a few tens of KB as PNG).
//
// Coordinates (x, y, w, h) are in the coordinate space of a page rendered at
// this same scale — locate them by first rendering the page with
// render-page.mjs at SCALE and reading off pixel coordinates visually.
//
// Usage: node scripts/crop-figure.mjs <pdf> <page> <x> <y> <w> <h> <out.png>

import { createCanvas } from "@napi-rs/canvas"
import { readFileSync, writeFileSync } from "node:fs"

const SCALE = 1.5

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

const [, , pdfPath, pageArg, xArg, yArg, wArg, hArg, outPath] = process.argv
const pageNum = parseInt(pageArg, 10)
const [x, y, w, h] = [xArg, yArg, wArg, hArg].map(Number)

const data = new Uint8Array(readFileSync(pdfPath))
const doc = await pdfjsLib.getDocument({ data }).promise
const page = await doc.getPage(pageNum)
const viewport = page.getViewport({ scale: SCALE })

const full = createCanvas(viewport.width, viewport.height)
await page.render({ canvasContext: full.getContext("2d"), viewport }).promise

const crop = createCanvas(w, h)
crop.getContext("2d").drawImage(full, x, y, w, h, 0, 0, w, h)

writeFileSync(outPath, crop.toBuffer("image/png"))
console.log(`cropped [${x},${y},${w},${h}] @ scale ${SCALE} from page ${pageNum} -> ${outPath}`)
