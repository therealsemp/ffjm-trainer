// Epic 4 lists: an ISO date shown as a French short date (24/09/2026).
export function formatListDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR")
}
