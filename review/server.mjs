#!/usr/bin/env node
// Local review tool: lists questions waiting in data/needs-review, renders
// them next to their source PDF, and promotes a question (its JSON + figure
// PNGs) to data/validated once it passes validation and looks right.
//
// This is dev tooling, not part of the deployed app — it only runs on the
// reviewer's machine.
//
// Usage: node server.mjs [port]

import express from "express"
import { readFileSync, writeFileSync, readdirSync, existsSync, renameSync, unlinkSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { validateQuestion } from "../shared/validate.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const NEEDS_REVIEW = path.join(ROOT, "data", "needs-review")
const VALIDATED = path.join(ROOT, "data", "validated")
const RAW = path.join(ROOT, "data", "raw")

const PORT = parseInt(process.argv[2] || "5175", 10)

// Bare filename only (no path separators, no "..") — every file we touch
// lives directly inside NEEDS_REVIEW, so this is enough to rule out traversal.
const SAFE_NAME = /^[A-Za-z0-9._-]+$/

function isSafeName(name) {
  return typeof name === "string" && SAFE_NAME.test(name) && !name.includes("..")
}

function listQuestionFiles() {
  return readdirSync(NEEDS_REVIEW)
    .filter((f) => f.endsWith(".json"))
    .sort()
}

function readQuestion(file) {
  return JSON.parse(readFileSync(path.join(NEEDS_REVIEW, file), "utf8"))
}

// sourceFiles paths are relative to the question file's own directory, e.g.
// "../raw/2026/2026_qf_statement.pdf" — turn that into a URL our /raw static
// route can serve.
function sourcePathToUrl(relPath) {
  const resolved = path.resolve(NEEDS_REVIEW, relPath)
  const fromRaw = path.relative(RAW, resolved)
  return "/raw/" + fromRaw.split(path.sep).map(encodeURIComponent).join("/")
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
  const summaries = listQuestionFiles().map((file) => {
    const q = readQuestion(file)
    return {
      file,
      year: q.year,
      phase: q.phase,
      number: q.number,
      id: q.id,
      title: q.title,
      coefficient: q.coefficient,
      categories: q.categories,
    }
  })
  res.json(summaries)
})

app.get("/api/questions/:file", (req, res) => {
  const { file } = req.params
  if (!isSafeName(file) || !file.endsWith(".json")) return res.status(400).json({ error: "invalid filename" })
  const filePath = path.join(NEEDS_REVIEW, file)
  if (!existsSync(filePath)) return res.status(404).json({ error: "not found" })

  const q = readQuestion(file)
  const pdfUrls = {
    statement: sourcePathToUrl(q.sourceFiles.statement),
    detailedSolutions: q.sourceFiles.detailedSolutions.map(sourcePathToUrl),
  }
  res.json({ question: q, pdfUrls })
})

app.post("/api/questions/:file/validate", (req, res) => {
  const { file } = req.params
  if (!isSafeName(file) || !file.endsWith(".json")) return res.status(400).json({ error: "invalid filename" })
  const filePath = path.join(NEEDS_REVIEW, file)
  if (!existsSync(filePath)) return res.status(404).json({ error: "not found" })

  const q = readQuestion(file)
  const errors = []
  validateQuestion(q, errors, NEEDS_REVIEW)
  if (errors.length > 0) {
    return res.status(422).json({ ok: false, errors })
  }

  const imageFiles = allFigureImageUrls(q)
  for (const img of imageFiles) {
    if (!isSafeName(img)) return res.status(400).json({ error: `unsafe image filename: ${img}` })
  }

  // Move the JSON and every figure PNG it references into validated/.
  renameSync(filePath, path.join(VALIDATED, file))
  for (const img of imageFiles) {
    const from = path.join(NEEDS_REVIEW, img)
    if (existsSync(from)) renameSync(from, path.join(VALIDATED, img))
  }

  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`FFJM Trainer review tool: http://localhost:${PORT}`)
})
