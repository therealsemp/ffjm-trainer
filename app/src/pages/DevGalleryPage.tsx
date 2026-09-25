// Development-only page (registered in App.tsx under `import.meta.env.DEV`,
// never part of the production build): renders the end-of-session rank
// display (Story 2.7) for every case worth checking visually, plus the
// account page's per-rank counts (Story 1.5), without having to play whole
// sessions. Deliberately outside AppLayout, so it works without a profile.
// Not user-facing product copy, but kept in French like the rest of the UI.

import { useState } from "react"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { RankCountsSummary } from "../components/RankCountsSummary"
import { SessionRankCard } from "../components/SessionRankCard"
import { ThemeToggle } from "../components/ThemeToggle"
import type { QuestionOutcome, RankCounts } from "../types/trainingSession"

// `found` successes spread evenly across `target` answers, so the dots look
// like a plausible session rather than all greens then all oranges.
function buildOutcomes(found: number, target: number): QuestionOutcome[] {
  return Array.from({ length: target }, (_, index) =>
    Math.floor(((index + 1) * found) / target) > Math.floor((index * found) / target) ? "found" : "notFound",
  )
}

interface GalleryCase {
  title: string
  found: number
  target: number
  skipped: number
}

const CASES: GalleryCase[] = [
  { title: "S+ : 10/10", found: 10, target: 10, skipped: 0 },
  { title: "S+ : 20/20, 4 passées", found: 20, target: 20, skipped: 4 },
  { title: "S : 5/5 (encouragement session plus longue)", found: 5, target: 5, skipped: 0 },
  { title: "S : 8/10, 1 passée", found: 8, target: 10, skipped: 1 },
  { title: "S : 19/20", found: 19, target: 20, skipped: 0 },
  { title: "A : 7/10", found: 7, target: 10, skipped: 0 },
  { title: "A : 9/15, 6 passées", found: 9, target: 15, skipped: 6 },
  { title: "B : 2/5", found: 2, target: 5, skipped: 0 },
  { title: "B : 11/20", found: 11, target: 20, skipped: 2 },
  { title: "C : 1/5, 3 passées", found: 1, target: 5, skipped: 3 },
  { title: "C : 4/20", found: 4, target: 20, skipped: 0 },
  { title: "D : 0/5", found: 0, target: 5, skipped: 0 },
  { title: "D : 3/20", found: 3, target: 20, skipped: 0 },
]

const RANK_COUNTS_EXAMPLES: { title: string; counts: RankCounts }[] = [
  { title: "Quelques rangs obtenus (sans S+)", counts: { S: 1, A: 2, C: 1 } },
  { title: "Tous les rangs", counts: { "S+": 3, S: 5, A: 12, B: 8, C: 2, D: 1 } },
  { title: "Aucun rang (rien n'est affiché)", counts: {} },
]

export function DevGalleryPage() {
  // Bumped to remount every card, which replays their entrance animations.
  const [replayKey, setReplayKey] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  return (
    <PageContainer gap="gap-8" className={reducedMotion ? "rank-reduced-motion" : ""}>
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Galerie de développement : rangs</h1>
        <p className="text-brand-muted">
          Page visible uniquement avec le serveur de développement, absente du site déployé.
        </p>
        <ThemeToggle />
        <div className="flex flex-wrap items-center gap-4">
          <Button type="button" onClick={() => setReplayKey((key) => key + 1)}>
            Rejouer les animations
          </Button>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} />
            Simuler « réduire les animations »
          </label>
        </div>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Fin de session</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {CASES.map((galleryCase) => (
            <div key={`${galleryCase.title}-${replayKey}`} className="flex flex-col gap-2">
              <h3 className="font-semibold">{galleryCase.title}</h3>
              <SessionRankCard
                outcomes={buildOutcomes(galleryCase.found, galleryCase.target)}
                target={galleryCase.target}
                skipped={galleryCase.skipped}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Compte : sessions par rang</h2>
        {RANK_COUNTS_EXAMPLES.map((example) => (
          <div key={example.title} className="flex flex-col gap-2 rounded-xl border border-dashed border-brand-line p-4">
            <p className="text-sm text-brand-muted">{example.title}</p>
            <RankCountsSummary counts={example.counts} />
          </div>
        ))}
      </section>
    </PageContainer>
  )
}
