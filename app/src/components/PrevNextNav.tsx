// Shared Previous / Next links: each side only rendered when a target is
// given (hidden at the bounds), laid out left/right.

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

export function PrevNextNav({ previousTo, nextTo }: { previousTo?: string; nextTo?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        {previousTo && (
          <Link to={previousTo} className="flex items-center gap-1 font-medium text-brand-blue hover:underline">
            <ChevronLeft size={18} />
            Précédent
          </Link>
        )}
      </div>
      <div>
        {nextTo && (
          <Link to={nextTo} className="flex items-center gap-1 font-medium text-brand-blue hover:underline">
            Suivant
            <ChevronRight size={18} />
          </Link>
        )}
      </div>
    </div>
  )
}
