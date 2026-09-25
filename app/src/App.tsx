import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ProfileProvider } from "./services/ProfileContext"
import { ThemeProvider } from "./services/ThemeContext"
import { QuestionListsProvider } from "./services/QuestionListsContext"
import { TrainingSessionProvider } from "./services/TrainingSessionContext"
import { AppLayout } from "./layouts/AppLayout"
import { RootRedirect } from "./pages/RootRedirect"
import { ProfileCreationPage } from "./pages/ProfileCreationPage"
import { HomePage } from "./pages/HomePage"
import { AccountPage } from "./pages/AccountPage"
import { SessionConfigPage } from "./pages/SessionConfigPage"
import { TrainingEntryPage } from "./pages/TrainingEntryPage"
import { TrainingQuestionPage } from "./pages/TrainingQuestionPage"
import { TrainingRecapPage } from "./pages/TrainingRecapPage"
import { ArchiveSelectionPage } from "./pages/ArchiveSelectionPage"
import { ArchiveQuestionPage } from "./pages/ArchiveQuestionPage"
import { ArchiveSummaryPage } from "./pages/ArchiveSummaryPage"
import { FavoritesPage } from "./pages/FavoritesPage"
import { ListQuestionPage } from "./pages/ListQuestionPage"
import { MistakesPage } from "./pages/MistakesPage"

// Development-only visual check page (every end-of-session rank case, see
// Story 2.7's QA notes). `import.meta.env.DEV` is statically false in a
// production build, so both this route and the page's chunk are dropped
// from the deployed site entirely.
const DevGalleryPage = import.meta.env.DEV
  ? lazy(() => import("./pages/DevGalleryPage").then((module) => ({ default: module.DevGalleryPage })))
  : null

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ProfileProvider>
          <TrainingSessionProvider>
            <QuestionListsProvider>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/profil/creation" element={<ProfileCreationPage />} />
                {DevGalleryPage && (
                  <Route
                    path="/dev/rangs"
                    element={
                      <Suspense fallback={null}>
                        <DevGalleryPage />
                      </Suspense>
                    }
                  />
                )}
                <Route element={<AppLayout />}>
                  <Route path="/accueil" element={<HomePage />} />
                  <Route path="/compte" element={<AccountPage />} />
                  <Route path="/entrainement" element={<TrainingEntryPage />} />
                  <Route path="/entrainement/configuration" element={<SessionConfigPage />} />
                  <Route path="/entrainement/question" element={<TrainingQuestionPage />} />
                  <Route path="/entrainement/recap" element={<TrainingRecapPage />} />
                  <Route path="/archives" element={<ArchiveSelectionPage />} />
                  <Route path="/archives/:year/:phase/sommaire" element={<ArchiveSummaryPage />} />
                  <Route path="/archives/:year/:phase/:number" element={<ArchiveQuestionPage />} />
                  <Route path="/favoris" element={<FavoritesPage />} />
                  <Route path="/favoris/:questionId" element={<ListQuestionPage key="favorites" kind="favorites" />} />
                  <Route path="/erreurs" element={<MistakesPage />} />
                  <Route path="/erreurs/:questionId" element={<ListQuestionPage key="mistakes" kind="mistakes" />} />
                </Route>
              </Routes>
            </QuestionListsProvider>
          </TrainingSessionProvider>
        </ProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
