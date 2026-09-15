const listEl = document.getElementById("question-list")
const emptyState = document.getElementById("empty-state")
const questionView = document.getElementById("question-view")
const renderedEl = document.getElementById("rendered")
const validateBtn = document.getElementById("validate-btn")
const validateStatus = document.getElementById("validate-status")
const pdfFrame = document.getElementById("pdf-frame")
const pdfTabs = document.getElementById("pdf-tabs")

let currentFile = null

async function loadQuestionList() {
  const res = await fetch("/api/questions")
  const questions = await res.json()
  listEl.innerHTML = ""

  const groups = new Map()
  for (const q of questions) {
    const key = `${q.year} — ${q.phase}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(q)
  }

  for (const [examLabel, items] of groups) {
    const group = document.createElement("div")
    group.className = "exam-group"
    const h2 = document.createElement("h2")
    h2.textContent = `${examLabel} (${items.length})`
    group.appendChild(h2)

    items.sort((a, b) => a.number - b.number)
    for (const q of items) {
      const btn = document.createElement("button")
      btn.className = "question-item"
      btn.textContent = `${q.number}. ${q.title ?? "(sans titre)"}`
      btn.dataset.file = q.file
      btn.addEventListener("click", () => selectQuestion(q.file))
      group.appendChild(btn)
    }
    listEl.appendChild(group)
  }

  if (questions.length === 0) {
    listEl.innerHTML = "<p style='color:#999;font-size:13px'>Rien en attente de revue.</p>"
  }
}

// `marked` follows CommonMark, which treats `\(` and `\)` as backslash
// escapes for literal "(" and ")" — it silently drops the backslash, so by
// the time KaTeX's auto-render would look for `\( \)` delimiters they're
// already gone. To avoid that, pull out every math segment first, render it
// straight to HTML with KaTeX, and swap in an alnum placeholder (untouched
// by markdown escaping) that we substitute back in after `marked.parse`.
function extractMath(markdown) {
  const rendered = []
  const withPlaceholders = markdown.replace(/\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g, (match, display, inline) => {
    const expr = display ?? inline
    let html
    try {
      html = katex.renderToString(expr, { displayMode: display !== undefined, throwOnError: false })
    } catch {
      html = escapeHtml(match)
    }
    const token = `KATEXPLACEHOLDER${rendered.length}ENDPLACEHOLDER`
    rendered.push(html)
    return token
  })
  return { withPlaceholders, rendered }
}

function reinsertMath(html, rendered) {
  return html.replace(/KATEXPLACEHOLDER(\d+)ENDPLACEHOLDER/g, (_, i) => rendered[Number(i)])
}

// Figures can be referenced inline in the markdown as `figure:<id>`, or just
// listed in the figures array with no inline reference. Handle both: swap
// inline placeholders for the real asset URL, then append any figure that
// was never referenced inline as its own block at the end.
function renderRichContent(section) {
  if (!section) return ""
  let markdown = section.markdown
  const referencedIds = new Set()

  for (const fig of section.figures ?? []) {
    if (!fig.imageUrl) continue
    const placeholder = `figure:${fig.id}`
    if (markdown.includes(placeholder)) {
      referencedIds.add(fig.id)
      markdown = markdown.replaceAll(placeholder, `/assets/${encodeURIComponent(fig.imageUrl)}`)
    }
  }

  const { withPlaceholders, rendered } = extractMath(markdown)
  let html = `<div class="rich-content">${reinsertMath(marked.parse(withPlaceholders), rendered)}</div>`

  const unreferenced = (section.figures ?? []).filter((f) => f.imageUrl && !referencedIds.has(f.id))
  for (const fig of unreferenced) {
    html += `<figure class="extra-figure">
      <img src="/assets/${encodeURIComponent(fig.imageUrl)}" alt="${escapeHtml(fig.description ?? fig.id)}" />
      <figcaption>${escapeHtml(fig.description ?? fig.id)}</figcaption>
    </figure>`
  }

  return html
}

function escapeHtml(s) {
  const div = document.createElement("div")
  div.textContent = s
  return div.innerHTML
}

// Mirrors the UI rule in docs/functional-spec.md: the FFJM "give the number
// of solutions" instruction is shown whenever a question applies to a
// category above CM, not stored as per-question data.
function needsSolutionCountNotice(categories) {
  return categories.some((c) => c !== "CE" && c !== "CM")
}

// Changing only the fragment (#page=...) of an <iframe> src that otherwise
// stays the same doesn't reload the embedded PDF viewer in most browsers —
// it's treated as an in-page anchor jump. Blanking the iframe first forces a
// real reload, so switching questions (same PDF, different #page=) actually
// re-opens at the new position instead of leaving the old page displayed.
//
// Navigating to "about:blank" is itself asynchronous: a fixed short delay
// (e.g. requestAnimationFrame) races it and intermittently loses — the real
// src gets set before the blank page actually finished loading, and the
// browser drops it. Wait for the blank page's own `load` event instead, and
// guard with a token in case another question is selected before that fires.
let pdfLoadToken = 0
function switchPdf(url, tabs, activeIndex) {
  const token = ++pdfLoadToken
  const onBlankLoaded = () => {
    pdfFrame.removeEventListener("load", onBlankLoaded)
    if (token === pdfLoadToken) pdfFrame.src = url
  }
  pdfFrame.addEventListener("load", onBlankLoaded)
  pdfFrame.src = "about:blank"

  pdfTabs.innerHTML = ""
  tabs.forEach((tab, i) => {
    const btn = document.createElement("button")
    btn.textContent = tab.label
    if (i === activeIndex) btn.classList.add("active")
    btn.addEventListener("click", () => switchPdf(tab.url, tabs, i))
    pdfTabs.appendChild(btn)
  })
}

async function selectQuestion(file) {
  currentFile = file
  document.querySelectorAll(".question-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.file === file)
  })

  const res = await fetch(`/api/questions/${encodeURIComponent(file)}`)
  const { question: q, pdfUrls } = await res.json()

  emptyState.hidden = true
  questionView.hidden = false
  validateStatus.textContent = ""
  validateStatus.className = ""

  const tabs = [
    { label: "Énoncé", url: pdfUrls.statement },
    ...pdfUrls.detailedSolutions.map((url, i) => ({
      label: pdfUrls.detailedSolutions.length > 1 ? `Solution ${i + 1}` : "Solution détaillée",
      url,
    })),
  ]
  switchPdf(tabs[0].url, tabs, 0)

  renderedEl.innerHTML = `
    <div class="meta-row">
      ${q.examTitle ?? ""} ${q.champNumber ? `· ${q.champNumber}e championnat` : ""}
    </div>
    <h2 class="q-title">${q.number}. ${escapeHtml(q.title ?? "")} <small style="color:#888;font-weight:normal">(coef. ${q.coefficient}, ${q.coefficientSource})</small></h2>
    <div class="meta-row">${q.categories.map((c) => `<span class="badge">${c}</span>`).join("")}</div>

    ${needsSolutionCountNotice(q.categories) ? `<div class="general-instructions">Pour qu'un problème soit complètement résolu, donnez le nombre de ses solutions, et donnez la solution s'il n'en a qu'une, ou deux solutions s'il en a plus d'une.</div>` : ""}

    <div class="section-label">Énoncé</div>
    ${renderRichContent(q.statement)}

    <div class="section-label">Réponse attendue</div>
    <div class="answer-box"><strong>${q.answer.type}</strong>${q.answer.value !== undefined ? `: ${escapeHtml(String(q.answer.value))}` : ""}</div>

    <div class="section-label">Correction</div>
    ${renderRichContent(q.correction)}
  `
}

validateBtn.addEventListener("click", async () => {
  if (!currentFile) return
  validateStatus.textContent = "Validation…"
  validateStatus.className = ""

  const res = await fetch(`/api/questions/${encodeURIComponent(currentFile)}/validate`, { method: "POST" })
  const data = await res.json()

  if (res.ok && data.ok) {
    validateStatus.textContent = "Validé ✓ — déplacé vers data/validated"
    validateStatus.className = "ok"
    currentFile = null
    questionView.hidden = true
    emptyState.hidden = false
    loadQuestionList()
  } else {
    validateStatus.className = "error"
    validateStatus.textContent = (data.errors ?? [data.error ?? "erreur inconnue"]).join(" · ")
  }
})

loadQuestionList()
