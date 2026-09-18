#!/usr/bin/env node
// Generates app/public/data/ from data/validated/: a mirror copy of the
// validated tree (so a question's full content is fetchable at
// /data/{year}/{phase}/qNN.json, no transformation) plus a flat metadata
// manifest, questions.json (id/year/phase/number/tier/categories only, no
// content) that the app loads once to drive listing/weighted-draw logic
// without fetching every question. See docs/technical-architecture.md
// ("Accès aux données").
//
// Regenerated on every `npm run dev`/`build` — never hand-edited, never
// committed (see .gitignore).

import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VALIDATED_DIR = path.join(__dirname, "..", "..", "data", "validated")
const OUTPUT_DIR = path.join(__dirname, "..", "public", "data")

function listDirs(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function build() {
  rmSync(OUTPUT_DIR, { recursive: true, force: true })
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const manifest = []

  for (const year of listDirs(VALIDATED_DIR)) {
    const yearDir = path.join(VALIDATED_DIR, year)
    for (const phase of listDirs(yearDir)) {
      const phaseDir = path.join(yearDir, phase)
      const outDir = path.join(OUTPUT_DIR, year, phase)
      mkdirSync(outDir, { recursive: true })

      for (const file of readdirSync(phaseDir)) {
        const srcPath = path.join(phaseDir, file)
        copyFileSync(srcPath, path.join(outDir, file))

        if (file.endsWith(".json")) {
          const question = JSON.parse(readFileSync(srcPath, "utf8"))
          manifest.push({
            id: question.id,
            year: question.year,
            phase: question.phase,
            number: question.number,
            tier: question.tier,
            categories: question.categories,
          })
        }
      }
    }
  }

  const manifestPath = path.join(OUTPUT_DIR, "questions.json")
  writeFileSync(manifestPath, JSON.stringify(manifest))
  console.log(`build-data-index: wrote ${manifest.length} question(s) to ${path.relative(process.cwd(), manifestPath)}`)
}

build()
