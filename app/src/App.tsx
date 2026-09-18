import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ProfileProvider } from "./services/ProfileContext"
import { ThemeProvider } from "./services/ThemeContext"
import { TrainingSessionProvider } from "./services/TrainingSessionContext"
import { AppLayout } from "./layouts/AppLayout"
import { RootRedirect } from "./pages/RootRedirect"
import { ProfileCreationPage } from "./pages/ProfileCreationPage"
import { HomePage } from "./pages/HomePage"
import { AccountPage } from "./pages/AccountPage"
import { SessionConfigPage } from "./pages/SessionConfigPage"
import { TrainingQuestionPage } from "./pages/TrainingQuestionPage"

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ProfileProvider>
          <TrainingSessionProvider>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/profil/creation" element={<ProfileCreationPage />} />
              <Route element={<AppLayout />}>
                <Route path="/accueil" element={<HomePage />} />
                <Route path="/compte" element={<AccountPage />} />
                <Route path="/entrainement/configuration" element={<SessionConfigPage />} />
                <Route path="/entrainement/question" element={<TrainingQuestionPage />} />
              </Route>
            </Routes>
          </TrainingSessionProvider>
        </ProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
