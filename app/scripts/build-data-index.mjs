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
//
// Built into a temp directory then swapped into place with a rename, not
// built in place after an rmSync: a dev server can be serving
// public/data/ concurrently (its own `npm run dev`/`build` running this
// same script again, e.g. from another terminal), and an in-place
// rmSync+rebuild leaves a real window where the directory is missing or
// half-written — a request landing in that window gets a false "file not
// found" for a question that both existed a moment ago and exists a
// moment later. A rename is a single atomic directory-entry change, so
// concurrent readers only ever see the fully-old or fully-new tree.

import { copyFileSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VALIDATED_DIR = path.join(__dirname, "..", "..", "data", "validated")
const OUTPUT_DIR = path.join(__dirname, "..", "public", "data")
const STAGING_DIR = path.join(__dirname, "..", "public", ".data-staging")

function listDirs(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function build() {
  rmSync(STAGING_DIR, { recursive: true, force: true })
  mkdirSync(STAGING_DIR, { recursive: true })

  const manifest = []

  for (const year of listDirs(VALIDATED_DIR)) {
    const yearDir = path.join(VALIDATED_DIR, year)
    for (const phase of listDirs(yearDir)) {
      const phaseDir = path.join(yearDir, phase)
      const outDir = path.join(STAGING_DIR, year, phase)
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
            hasDetailedCorrection: question.correction !== undefined,
          })
        }
      }
    }
  }

  writeFileSync(path.join(STAGING_DIR, "questions.json"), JSON.stringify(manifest))

  // Atomic swap: rename staging -> data.new-name is instant either way,
  // but renaming *over* an existing non-empty directory fails on Linux —
  // move the old one aside first, into a name nothing ever reads from.
  const previousDir = `${OUTPUT_DIR}.previous`
  rmSync(previousDir, { recursive: true, force: true })
  try {
    renameSync(OUTPUT_DIR, previousDir)
  } catch {
    // No previous public/data/ yet (first run) — nothing to move aside.
  }
  renameSync(STAGING_DIR, OUTPUT_DIR)
  rmSync(previousDir, { recursive: true, force: true })

  console.log(`build-data-index: wrote ${manifest.length} question(s) to ${path.relative(process.cwd(), path.join(OUTPUT_DIR, "questions.json"))}`)
}

build()
