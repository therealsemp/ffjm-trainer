#!/usr/bin/env node
// Local review tool: lists questions waiting in data/needs-review, renders
// them next to their source PDF, and promotes a question (its JSON + figure
// PNGs) to data/validated once it passes validation and looks right.
//
// Questions live nested as data/{needs-review,validated}/{year}/{phase}/qNN.json
// (mirrors data/raw/{year}/{phase}/), with figure PNGs alongside.
//
// This is dev tooling, not part of the deployed app — it only runs on the
// reviewer's machine.
//
// Usage: node server.mjs [port]

import express from "express"
import { readFileSync, readdirSync, existsSync, mkdirSync, renameSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { validateQuestion } from "../shared/validate.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const NEEDS_REVIEW = path.join(ROOT, "data", "needs-review")
const VALIDATED = path.join(ROOT, "data", "validated")
const RAW = path.join(ROOT, "data", "raw")

const PORT = parseInt(process.argv[2] || "5175", 10)

const SAFE_FILE = /^[A-Za-z0-9._-]+$/
const PHASES = ["qf", "sf", "fn"]

function isSafeName(name) {
  return typeof name === "string" && SAFE_FILE.test(name) && !name.includes("..")
}
function isYear(value) {
  return /^\d{4}$/.test(value)
}
function isPhase(value) {
  return PHASES.includes(value)
}

// { year, phase, file } -> absolute directory containing that question, after
// validating each segment (guards against path traversal via route params).
function questionDir(year, phase) {
  if (!isYear(year) || !isPhase(phase)) return null
  return path.join(NEEDS_REVIEW, year, phase)
}

function listQuestionFiles() {
  const results = []
  if (!existsSync(NEEDS_REVIEW)) return results
  for (const year of readdirSync(NEEDS_REVIEW)) {
    const yearPath = path.join(NEEDS_REVIEW, year)
    if (!isYear(year) || !statSync(yearPath).isDirectory()) continue
    for (const phase of readdirSync(yearPath)) {
      const phasePath = path.join(yearPath, phase)
      if (!isPhase(phase) || !statSync(phasePath).isDirectory()) continue
      for (const file of readdirSync(phasePath)) {
        if (file.endsWith(".json")) results.push({ year, phase, file })
      }
    }
  }
  return results.sort((a, b) => (a.year + a.phase + a.file).localeCompare(b.year + b.phase + b.file))
}

function readQuestion(dir, file) {
  return JSON.parse(readFileSync(path.join(dir, file), "utf8"))
}

// sourceFiles.*.path is relative to the question file's own directory, e.g.
// "../../../raw/2026/qf/2026_qf_statement.pdf" — turn that into a URL our
// /raw static route can serve, and append the page/position as a standard
// PDF "Open Parameters" fragment so the viewer opens roughly where this
// question is, instead of always at page 1. `page=N` is well supported by
// browsers' built-in PDF viewers; the `zoom=100,x,y` part (positioning) is a
// bonus — support for it is inconsistent, page-level is the part we can rely on.
function sourceRefToUrl(ref, dir) {
  const resolved = path.resolve(dir, ref.path)
  const fromRaw = path.relative(RAW, resolved)
  const url = "/raw/" + fromRaw.split(path.sep).map(encodeURIComponent).join("/")
  const fragment = ref.position ? `page=${ref.page}&zoom=100,${ref.position.x},${ref.position.y}` : `page=${ref.page}`
  return `${url}#${fragment}`
}

function allFigureImageUrls(q) {
  const urls = []
  for (const section of [q.statement, q.correction]) {
    for (const fig of section?.figures ?? []) {
      if (fig.imageUrl) urls.push(fig.imageUrl)
    }
  }
  return urls
}

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))
app.use("/assets", express.static(NEEDS_REVIEW))
app.use("/raw", express.static(RAW))

app.get("/api/questions", (req, res) => {
  const summaries = listQuestionFiles().map(({ year, phase, file }) => {
    const q = readQuestion(questionDir(year, phase), file)
    return {
      year,
      phase,
      file,
      id: q.id,
      number: q.number,
      title: q.title,
      coefficient: q.coefficient,
      categories: q.categories,
    }
  })
  res.json(summaries)
})

app.get("/api/questions/:year/:phase/:file", (req, res) => {
  const { year, phase, file } = req.params
  const dir = questionDir(year, phase)
  if (!dir || !isSafeName(file) || !file.endsWith(".json")) return res.status(400).json({ error: "invalid path" })
  const filePath = path.join(dir, file)
  if (!existsSync(filePath)) return res.status(404).json({ error: "not found" })

  const q = readQuestion(dir, file)
  const pdfUrls = {
    statement: sourceRefToUrl(q.sourceFiles.statement, dir),
    detailedSolutions: q.sourceFiles.detailedSolutions.map((ref) => sourceRefToUrl(ref, dir)),
  }
  res.json({ question: q, pdfUrls })
})

app.post("/api/questions/:year/:phase/:file/validate", (req, res) => {
  const { year, phase, file } = req.params
  const dir = questionDir(year, phase)
  if (!dir || !isSafeName(file) || !file.endsWith(".json")) return res.status(400).json({ error: "invalid path" })
  const filePath = path.join(dir, file)
  if (!existsSync(filePath)) return res.status(404).json({ error: "not found" })

  const q = readQuestion(dir, file)
  const errors = []
  validateQuestion(q, errors, dir)
  if (errors.length > 0) {
    return res.status(422).json({ ok: false, errors })
  }

  const imageFiles = allFigureImageUrls(q)
  for (const img of imageFiles) {
    if (!isSafeName(img)) return res.status(400).json({ error: `unsafe image filename: ${img}` })
  }

  const validatedDir = path.join(VALIDATED, year, phase)
  mkdirSync(validatedDir, { recursive: true })

  renameSync(filePath, path.join(validatedDir, file))
  for (const img of imageFiles) {
    const from = path.join(dir, img)
    if (existsSync(from)) renameSync(from, path.join(validatedDir, img))
  }

  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`FFJM Trainer review tool: http://localhost:${PORT}`)
})
