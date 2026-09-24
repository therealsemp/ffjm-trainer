#!/usr/bin/env node
// Renders a full PDF page with a red rectangle overlay showing a proposed
// crop box, WITHOUT cropping — use this to sanity-check a figure's
// coordinates in context (does the box bleed into a neighboring column or
// question title?) before committing to crop-figure.mjs. Same coordinate
// space and scale (3) as crop-figure.mjs, so a box validated here can be
// passed to crop-figure.mjs unchanged.
//
// Usage: node preview-crop.mjs <pdf> <page> <x> <y> <w> <h> <out.png>

import { createCanvas } from "@napi-rs/canvas"
import { readFileSync, writeFileSync } from "node:fs"
import { PDFJS_OPTIONS } from "./pdfjs-options.mjs"

const SCALE = 3

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

const [, , pdfPath, pageArg, xArg, yArg, wArg, hArg, outPath] = process.argv
const pageNum = parseInt(pageArg, 10)
const [x, y, w, h] = [xArg, yArg, wArg, hArg].map(Number)

const data = new Uint8Array(readFileSync(pdfPath))
const doc = await pdfjsLib.getDocument({ data, ...PDFJS_OPTIONS }).promise
const page = await doc.getPage(pageNum)
const viewport = page.getViewport({ scale: SCALE })

const canvas = createCanvas(viewport.width, viewport.height)
const ctx = canvas.getContext("2d")
await page.render({ canvasContext: ctx, viewport }).promise

ctx.strokeStyle = "red"
ctx.lineWidth = 2
ctx.strokeRect(x, y, w, h)

writeFileSync(outPath, canvas.toBuffer("image/png"))
console.log(`preview [${x},${y},${w},${h}] @ scale ${SCALE} on page ${pageNum} -> ${outPath}`)
