#!/usr/bin/env node
// Crops a figure out of a PDF page like crop-figure.mjs, but the (x, y, w, h)
// box given is only a GENEROUS, approximate region — this script renders it
// at high internal resolution, finds the connected ink blobs inside it,
// picks the one closest to the box's center (the figure the caller meant to
// capture), and crops to that blob's measured bounding box (+ a small fixed
// margin) instead of the box given verbatim.
//
// This replaces the old workflow of eyeballing a pixel-perfect box (and
// iterating preview-crop.mjs until it looked right): here the box only needs
// to be "big enough to fully contain the figure, roughly centered on it",
// which is much easier to get right in one pass, and the actual tight
// boundary is measured, not guessed. Neighboring text caught in the same
// generous box (expected on dense two-column pages) forms separate ink
// blobs and is ignored rather than dragged into the bounding box — that
// distinction is exactly what a plain "bounding box of all non-white
// pixels" approach (tried first, and rejected) could not make. See
// ingest/TRANSCRIPTION-GUIDE.md rule 3bis.
//
// Coordinates (x, y, w, h) are in the same coordinate space as
// crop-figure.mjs / preview-crop.mjs (page rendered at OUTPUT_SCALE) — locate
// them the same way, but there is no need for precision: err generously.
//
// Usage: node autocrop-figure.mjs <pdf> <page> <x> <y> <w> <h> <out.png> [margin]

import { createCanvas } from "@napi-rs/canvas"
import { readFileSync, writeFileSync } from "node:fs"

const OUTPUT_SCALE = 1.5 // matches crop-figure.mjs / preview-crop.mjs
const DETECT_SCALE = 3 // internal render scale used for ink-boundary detection
const RATIO = DETECT_SCALE / OUTPUT_SCALE
const DEFAULT_MARGIN = 6 // px, at OUTPUT_SCALE, added around the measured ink box
const INK_COLOR_DISTANCE_THRESHOLD = 30 // 0-441 (max RGB Euclidean distance); above this counts as "ink", relative to the region's own background color
const DILATE_RADIUS = 3 // px, at DETECT_SCALE — bridges dashed lines/antialiasing gaps without merging separate text/figure blocks
const EDGE_WARNING_DISTANCE = 3 // px, at DETECT_SCALE

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

const [, , pdfPath, pageArg, xArg, yArg, wArg, hArg, outPath, marginArg] = process.argv
const pageNum = parseInt(pageArg, 10)
const [x, y, w, h] = [xArg, yArg, wArg, hArg].map(Number)
const margin = marginArg ? parseFloat(marginArg) : DEFAULT_MARGIN

const data = new Uint8Array(readFileSync(pdfPath))
const doc = await pdfjsLib.getDocument({ data }).promise
const page = await doc.getPage(pageNum)
const viewport = page.getViewport({ scale: DETECT_SCALE })

const full = createCanvas(viewport.width, viewport.height)
await page.render({ canvasContext: full.getContext("2d"), viewport }).promise

const [dx, dy, dw, dh] = [x, y, w, h].map((v) => Math.round(v * RATIO))

const region = createCanvas(dw, dh)
region.getContext("2d").drawImage(full, dx, dy, dw, dh, 0, 0, dw, dh)
const { data: px } = region.getContext("2d").getImageData(0, 0, dw, dh)

// Background color is estimated as the mode of the region's pixel colors
// (quantized to reduce antialiasing/JPEG-artifact noise) rather than assumed
// to be white: a colored page background (e.g. a pale green FFJM statement
// PDF) would otherwise fall under a plain luminance threshold and get
// misclassified as ink across the whole region, merging the entire page into
// one blob. By far the largest area in any generous crop box is background,
// so its mode is a robust estimate regardless of hue.
function quantKey(r, g, b) {
  return `${Math.round(r / 16)},${Math.round(g / 16)},${Math.round(b / 16)}`
}
const colorCounts = new Map()
for (let p = 0; p < dw * dh; p++) {
  const idx = p * 4
  const key = quantKey(px[idx], px[idx + 1], px[idx + 2])
  colorCounts.set(key, (colorCounts.get(key) || 0) + 1)
}
let bgKey = null, bgCount = -1
for (const [key, count] of colorCounts) {
  if (count > bgCount) { bgCount = count; bgKey = key }
}
const [bgR, bgG, bgB] = bgKey.split(",").map((v) => Number(v) * 16)

const ink = new Uint8Array(dw * dh)
for (let j = 0; j < dh; j++) {
  for (let i = 0; i < dw; i++) {
    const idx = (j * dw + i) * 4
    const dr = px[idx] - bgR, dg = px[idx + 1] - bgG, db = px[idx + 2] - bgB
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)
    ink[j * dw + i] = dist > INK_COLOR_DISTANCE_THRESHOLD ? 1 : 0
  }
}

// Separable dilation: bridges small gaps (dashed lines, antialiasing) so a
// figure made of dashes/thin strokes forms one connected blob, without
// merging genuinely separate elements (text a comfortable margin away).
function dilate(mask, width, height, radius) {
  const tmp = new Uint8Array(width * height)
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let v = 0
      for (let k = -radius; k <= radius && !v; k++) {
        const ii = i + k
        if (ii >= 0 && ii < width && mask[j * width + ii]) v = 1
      }
      tmp[j * width + i] = v
    }
  }
  const out = new Uint8Array(width * height)
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let v = 0
      for (let k = -radius; k <= radius && !v; k++) {
        const jj = j + k
        if (jj >= 0 && jj < height && tmp[jj * width + i]) v = 1
      }
      out[j * width + i] = v
    }
  }
  return out
}

const dilated = dilate(ink, dw, dh, DILATE_RADIUS)

// Connected-component labeling over the dilated mask (8-connectivity), with
// each component's bounding box measured from the ORIGINAL (non-dilated) ink
// pixels only, so dilation affects connectivity decisions but never inflates
// the reported size.
const label = new Int32Array(dw * dh).fill(-1)
const components = []
const stack = []
for (let start = 0; start < dw * dh; start++) {
  if (dilated[start] !== 1 || label[start] !== -1) continue
  const compIndex = components.length
  const comp = { minX: dw, minY: dh, maxX: -1, maxY: -1, count: 0 }
  stack.push(start)
  label[start] = compIndex
  while (stack.length) {
    const p = stack.pop()
    const pi = p % dw, pj = (p / dw) | 0
    if (ink[p]) {
      comp.count++
      if (pi < comp.minX) comp.minX = pi
      if (pi > comp.maxX) comp.maxX = pi
      if (pj < comp.minY) comp.minY = pj
      if (pj > comp.maxY) comp.maxY = pj
    }
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        if (di === 0 && dj === 0) continue
        const ni = pi + di, nj = pj + dj
        if (ni < 0 || ni >= dw || nj < 0 || nj >= dh) continue
        const n = nj * dw + ni
        if (dilated[n] === 1 && label[n] === -1) {
          label[n] = compIndex
          stack.push(n)
        }
      }
    }
  }
  if (comp.count > 0) components.push(comp)
}

if (components.length === 0) {
  console.error(
    `No ink detected in region [${x},${y},${w},${h}] on page ${pageNum} — check coordinates, or the figure has too low contrast for autocrop (fall back to crop-figure.mjs + preview-crop.mjs).`
  )
  process.exit(1)
}

const centerX = dw / 2, centerY = dh / 2
function distToCenter(c) {
  const cx = (c.minX + c.maxX) / 2, cy = (c.minY + c.maxY) / 2
  return Math.hypot(cx - centerX, cy - centerY)
}
components.sort((a, b) => distToCenter(a) - distToCenter(b))
const chosen = components[0]

// Absolute page coordinates (at OUTPUT_SCALE) of each blob, for two reasons:
// to sanity-check which one got chosen, and — for a figure genuinely split
// into several separate blobs on the page (e.g. a grid next to a separate
// token pool, not bridged by DILATE_RADIUS on purpose — merging any two
// nearby blobs unconditionally would reintroduce the original bug of
// dragging in unrelated neighboring text) — to let the caller union the
// relevant blobs' boxes by hand and pass that box to crop-figure.mjs
// directly, instead of falling back to fully manual positioning.
function absBox(c) {
  const absX = x + c.minX / RATIO
  const absY = y + c.minY / RATIO
  const absW = (c.maxX - c.minX) / RATIO
  const absH = (c.maxY - c.minY) / RATIO
  return `[${absX.toFixed(1)},${absY.toFixed(1)},${absW.toFixed(1)},${absH.toFixed(1)}]`
}
console.error(
  `${components.length} ink blob(s) found in region; absolute boxes @ scale ${OUTPUT_SCALE} (same space as crop-figure.mjs): ` +
    components.map((c) => `${absBox(c)}${c === chosen ? " [chosen]" : ""}`).join(", ")
)
if (components.length > 1) {
  console.error(
    `If the figure actually spans more than one blob (e.g. a grid + a separate token pool), this tool only kept the one closest to the input box's center — union the relevant boxes above by hand and pass the result to crop-figure.mjs instead of trusting this output.`
  )
}

const touchesEdge =
  chosen.minX <= EDGE_WARNING_DISTANCE ||
  chosen.minY <= EDGE_WARNING_DISTANCE ||
  chosen.maxX >= dw - 1 - EDGE_WARNING_DISTANCE ||
  chosen.maxY >= dh - 1 - EDGE_WARNING_DISTANCE
if (touchesEdge) {
  console.warn(
    `WARNING: the chosen ink blob touches the edge of the input region [${x},${y},${w},${h}] — the figure may be truncated. Widen the input box and re-run rather than accepting this result.`
  )
}

const marginDetect = margin * RATIO
const cropMinX = Math.max(0, chosen.minX - marginDetect)
const cropMinY = Math.max(0, chosen.minY - marginDetect)
const cropMaxX = Math.min(dw, chosen.maxX + marginDetect)
const cropMaxY = Math.min(dh, chosen.maxY + marginDetect)
const cropW = cropMaxX - cropMinX
const cropH = cropMaxY - cropMinY

const outW = cropW / RATIO
const outH = cropH / RATIO
const out = createCanvas(outW, outH)
out.getContext("2d").drawImage(region, cropMinX, cropMinY, cropW, cropH, 0, 0, outW, outH)

writeFileSync(outPath, out.toBuffer("image/png"))
console.log(
  `autocrop: input [${x},${y},${w},${h}] @ scale ${OUTPUT_SCALE} -> chosen blob + ${margin}px margin -> ${outPath} (${Math.round(outW)}x${Math.round(outH)})`
)
