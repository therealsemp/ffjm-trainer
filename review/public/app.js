const listEl = document.getElementById("question-list")
const emptyState = document.getElementById("empty-state")
const questionView = document.getElementById("question-view")
const renderedEl = document.getElementById("rendered")
const validateBtn = document.getElementById("validate-btn")
const validateStatus = document.getElementById("validate-status")
const pdfFrame = document.getElementById("pdf-frame")
const pdfTabs = document.getElementById("pdf-tabs")

let currentQuestion = null // { year, phase, file }
let orderedQuestions = [] // flat list, same order as rendered in the sidebar

// Questions live at data/needs-review/{year}/{phase}/{file} — this string
// identifies one uniquely, for dataset attributes and API URLs alike.
function questionKey({ year, phase, file }) {
  return `${year}/${phase}/${file}`
}

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

  orderedQuestions = []
  for (const [examLabel, items] of groups) {
    const group = document.createElement("div")
    group.className = "exam-group"
    const h2 = document.createElement("h2")
    h2.textContent = `${examLabel} (${items.length})`
    group.appendChild(h2)

    items.sort((a, b) => a.number - b.number)
    for (const q of items) {
      orderedQuestions.push(q)
      const btn = document.createElement("button")
      btn.className = "question-item"
      btn.textContent = `${q.number}. ${q.title ?? "(sans titre)"}`
      btn.dataset.key = questionKey(q)
      btn.addEventListener("click", () => selectQuestion(q))
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
// assetBase is "{year}/{phase}" — figures live at data/needs-review/{year}/{phase}/
// alongside their question's JSON, so imageUrl (a bare filename) is resolved
// against it to build the /assets URL.
function renderRichContent(section, assetBase) {
  if (!section) return ""
  let markdown = section.markdown
  const referencedIds = new Set()

  for (const fig of section.figures ?? []) {
    if (!fig.imageUrl) continue
    const placeholder = `figure:${fig.id}`
    if (markdown.includes(placeholder)) {
      referencedIds.add(fig.id)
      markdown = markdown.replaceAll(placeholder, `/assets/${assetBase}/${encodeURIComponent(fig.imageUrl)}`)
    }
  }

  const { withPlaceholders, rendered } = extractMath(markdown)
  let html = `<div class="rich-content">${reinsertMath(marked.parse(withPlaceholders), rendered)}</div>`

  const unreferenced = (section.figures ?? []).filter((f) => f.imageUrl && !referencedIds.has(f.id))
  for (const fig of unreferenced) {
    html += `<figure class="extra-figure">
      <img src="/assets/${assetBase}/${encodeURIComponent(fig.imageUrl)}" alt="${escapeHtml(fig.description ?? fig.id)}" />
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

async function selectQuestion({ year, phase, file }) {
  currentQuestion = { year, phase, file }
  const key = questionKey(currentQuestion)
  document.querySelectorAll(".question-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.key === key)
  })

  const res = await fetch(`/api/questions/${year}/${phase}/${encodeURIComponent(file)}`)
  const { question: q, pdfUrls } = await res.json()
  const assetBase = `${year}/${phase}`

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
    <div class="meta-row">
      <span class="badge badge-tier">tier ${escapeHtml(q.tier ?? "?")}</span>
      ${q.categories.map((c) => `<span class="badge">${c}</span>`).join("")}
    </div>

    <div class="section-label">Énoncé</div>
    ${renderRichContent(q.statement, assetBase)}

    <div class="section-label">Réponse attendue</div>
    <div class="answer-box"><strong>${q.answer.type}</strong>${q.answer.value !== undefined ? `: ${escapeHtml(String(q.answer.value))}` : ""}</div>

    <div class="section-label">Correction</div>
    ${renderRichContent(q.correction, assetBase)}
  `
}

validateBtn.addEventListener("click", async () => {
  if (!currentQuestion) return
  validateStatus.textContent = "Validation…"
  validateStatus.className = ""

  const { year, phase, file } = currentQuestion
  const res = await fetch(`/api/questions/${year}/${phase}/${encodeURIComponent(file)}/validate`, { method: "POST" })
  const data = await res.json()

  if (res.ok && data.ok) {
    // The validated question disappears from the list, so whatever was next
    // after it shifts into its old index — select that one automatically
    // instead of dropping back to the empty state after every validation.
    const idx = orderedQuestions.findIndex((q) => questionKey(q) === questionKey(currentQuestion))
    await loadQuestionList()
    const next = orderedQuestions[idx]
    if (next) {
      await selectQuestion(next)
      validateStatus.textContent = "Validé ✓ — question suivante chargée"
      validateStatus.className = "ok"
    } else {
      currentQuestion = null
      questionView.hidden = true
      emptyState.hidden = false
    }
  } else {
    validateStatus.className = "error"
    validateStatus.textContent = (data.errors ?? [data.error ?? "erreur inconnue"]).join(" · ")
  }
})

loadQuestionList().then(() => {
  if (orderedQuestions[0]) selectQuestion(orderedQuestions[0])
})
