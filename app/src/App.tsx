import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ProfileProvider } from "./services/ProfileContext"
import { ThemeProvider } from "./services/ThemeContext"
import { AppLayout } from "./layouts/AppLayout"
import { RootRedirect } from "./pages/RootRedirect"
import { ProfileCreationPage } from "./pages/ProfileCreationPage"
import { HomePage } from "./pages/HomePage"
import { AccountPage } from "./pages/AccountPage"

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ProfileProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/profil/creation" element={<ProfileCreationPage />} />
            <Route element={<AppLayout />}>
              <Route path="/accueil" element={<HomePage />} />
              <Route path="/compte" element={<AccountPage />} />
            </Route>
          </Routes>
        </ProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
