import type { ReactNode } from "react"

interface PageContainerProps {
  // Exactly two widths, on purpose — normal (max-w-3xl) is the default for
  // every page, wide (max-w-5xl) is reserved for the question page, the one
  // place that needs the extra room for a statement/correction. Don't
  // introduce a third value here; that's how this drifted last time.
  wide?: boolean
  gap?: string
  className?: string
  children: ReactNode
}

export function PageContainer({ wide = false, gap = "gap-6", className = "", children }: PageContainerProps) {
  return (
    <main className={`mx-auto flex ${wide ? "max-w-5xl" : "max-w-3xl"} flex-col ${gap} px-4 py-8 ${className}`}>
      {children}
    </main>
  )
}
