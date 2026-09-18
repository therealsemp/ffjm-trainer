// Story 1.1 — automatic detection and redirection on load. No UI of its
// own: it only decides where "/" sends the user.

import { Navigate } from "react-router-dom"
import { useProfile } from "../services/ProfileContext"

export function RootRedirect() {
  const { profile } = useProfile()
  return <Navigate to={profile ? "/accueil" : "/profil/creation"} replace />
}
