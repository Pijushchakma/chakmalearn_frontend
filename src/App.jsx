import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import NavBar            from './components/NavBar'
import PretestGate       from './components/PretestGate'
import ScriptExplorer    from './pages/ScriptExplorer'
import VocabularyTrainer from './pages/VocabularyTrainer'
import Quiz              from './pages/Quiz'
import Dashboard         from './pages/Dashboard'
import Login             from './pages/Login'
import Transliterator      from './pages/Transliterator'
import AlphabetQuiz        from './pages/AlphabetQuiz'
import AlphabetPractice    from './pages/AlphabetPractice'
import ModuleProgress      from './pages/ModuleProgress'
import ModuleQuiz          from './pages/ModuleQuiz'
import Home                from './pages/Home'

function AppRoutes() {
  const { user, pretestDone } = useAuth()

  // Not logged in → only login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*"      element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  // Logged in, pretest status still loading
  if (pretestDone === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-4xl animate-pulse text-gray-200 dark:text-gray-700">…</p>
      </div>
    )
  }

  // Logged in but pre-test not taken → block everything
  if (!pretestDone) {
    return <PretestGate />
  }

  // Full app — pre-test passed
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/login"              element={<Navigate to="/" replace />} />
          <Route path="/"                   element={<Home />} />
          <Route path="/alphabet-practice"  element={<AlphabetPractice />} />
          <Route path="/alphabet-quiz"      element={<AlphabetQuiz />} />
          <Route path="/modules"            element={<ModuleProgress />} />
          <Route path="/modules/:moduleId"  element={<ModuleQuiz />} />
          <Route path="/explorer"           element={<ScriptExplorer />} />
          <Route path="/trainer"            element={<VocabularyTrainer />} />
          <Route path="/quiz"               element={<Quiz />} />
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/transliterator"     element={<Transliterator />} />
          <Route path="*"                   element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
