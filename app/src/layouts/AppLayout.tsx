// Persistent header for every page reached once a profile exists (Story
// 1.3's "My account" entry point). Rendered via a parent <Route> with
// nested children — <Outlet /> is React Router's equivalent of an Ember
// route's {{outlet}}. The theme control (Story 1.4) lives on the account
// page, not here.

import { Link, Outlet } from "react-router-dom"
import { useProfile } from "../services/ProfileContext"

export function AppLayout() {
  const { profile } = useProfile()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-brand-line px-4 py-3">
        <Link to="/accueil" className="flex items-center gap-2 font-heading text-lg font-bold">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="h-8 w-8" />
          FFJM Trainer
        </Link>
        <Link
          to="/compte"
          aria-label="Mon compte"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-gold bg-brand-blue font-heading font-bold text-white"
        >
          {profile?.name.charAt(0).toUpperCase()}
        </Link>
      </header>
      <Outlet />
    </div>
  )
}
