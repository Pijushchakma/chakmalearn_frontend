import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { LogOut, Sun, Moon, ChevronDown } from 'lucide-react'
import ChakmaText from './ChakmaText'
import { useAuth } from '../context/AuthContext'

const PRIMARY = [
  { to: '/',                  label: 'Home',         end: true },
  { to: '/alphabet-practice', label: 'Practice' },
  { to: '/alphabet-quiz',     label: 'Alphabet Quiz' },
  { to: '/modules',           label: 'Modules' },
  { to: '/dashboard',         label: 'Dashboard' },
]

const MORE = [
  { to: '/explorer',      label: 'Script Explorer' },
  { to: '/trainer',       label: 'Vocabulary' },
  { to: '/quiz',          label: 'Mixed Quiz' },
  { to: '/transliterator',label: 'Transliterator' },
]

const MORE_PATHS = MORE.map(l => l.to)

export default function NavBar() {
  const [dark,     setDark]     = useState(() => localStorage.getItem('dark') === 'true')
  const [moreOpen, setMoreOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const moreRef   = useRef(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark)
  }, [dark])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close dropdown on route change
  useEffect(() => { setMoreOpen(false) }, [location.pathname])

  const moreIsActive = MORE_PATHS.includes(location.pathname)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200/60 dark:shadow-indigo-900/60">
            <ChakmaText size="base" className="text-white text-xs leading-none">𑄌𑄟</ChakmaText>
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            ChakmaLearn
          </span>
        </NavLink>

        {/* Primary links */}
        <div className="flex items-center gap-0.5 flex-1">
          {PRIMARY.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(o => !o)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                moreIsActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800'
              }`}
            >
              More
              <ChevronDown size={12} className={`transition-transform duration-150 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-lg shadow-black/8 dark:shadow-black/40 py-1 z-50">
                {MORE.map(({ to, label }) => {
                  const isActive = location.pathname === to
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`flex items-center px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-gray-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {label}
                    </NavLink>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {user && (
            <span className="text-xs text-gray-400 dark:text-gray-600 hidden md:inline mr-1.5 font-mono">
              {user.username}
            </span>
          )}
          <button
            onClick={() => setDark(d => !d)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>

      </div>
    </nav>
  )
}
