import type { CSSProperties } from "react"
import { RANK_SLUGS } from "../services/sessionRank"
import type { Rank } from "../types/trainingSession"

interface RankBadgeProps {
  rank: Rank
  // "large": the end-of-session centerpiece (animated when rendered inside
  // a `.rank-anim` container, see index.css). "small": a still chip, for
  // the account page's per-rank counts (Story 1.5).
  size?: "large" | "small"
}

// More sparkles for the more festive ranks; none below S.
const SPARKLE_COUNT: Record<Rank, number> = { "S+": 12, S: 8, A: 0, B: 0, C: 0, D: 0 }

export function RankBadge({ rank, size = "large" }: RankBadgeProps) {
  const rankClass = `rank-${RANK_SLUGS[rank]}`

  if (size === "small") {
    return <span className={`rank-chip ${rankClass}`}>{rank}</span>
  }

  const sparkleCount = SPARKLE_COUNT[rank]
  return (
    <div className={`rank-badge-wrap ${rankClass}`}>
      <span aria-hidden="true" className="rank-ribbon" />
      {Array.from({ length: sparkleCount }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="rank-sparkle"
          style={
            {
              "--angle": `${(360 / sparkleCount) * index}deg`,
              "--delay": `${(index % 3) * 0.12}s`,
            } as CSSProperties
          }
        >
          ✦
        </span>
      ))}
      <div role="img" aria-label={`Rang ${rank}`} className={`rank-badge ${rankClass}`}>
        <span aria-hidden="true" className="rank-letter">
          {rank}
        </span>
      </div>
    </div>
  )
}
