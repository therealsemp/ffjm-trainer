import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ProfileProvider } from "./services/ProfileContext"
import { RootRedirect } from "./pages/RootRedirect"
import { ProfileCreationPage } from "./pages/ProfileCreationPage"
import { HomePage } from "./pages/HomePage"

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProfileProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/profil/creation" element={<ProfileCreationPage />} />
          <Route path="/accueil" element={<HomePage />} />
        </Routes>
      </ProfileProvider>
    </BrowserRouter>
  )
}
