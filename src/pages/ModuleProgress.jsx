import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { MODULES_WITH_DATA } from '../data/modules'
import ChakmaText from '../components/ChakmaText'

const COLOR_CLASSES = {
  indigo:  { ring: 'ring-indigo-200 dark:ring-indigo-800',  badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',  btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',       bar: 'bg-indigo-400' },
  violet:  { ring: 'ring-violet-200 dark:ring-violet-800',  badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',  btn: 'bg-violet-600 hover:bg-violet-700 text-white',       bar: 'bg-violet-400' },
  blue:    { ring: 'ring-blue-200 dark:ring-blue-800',      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',          btn: 'bg-blue-600 hover:bg-blue-700 text-white',           bar: 'bg-blue-400' },
  emerald: { ring: 'ring-emerald-200 dark:ring-emerald-800',badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',   bar: 'bg-emerald-400' },
  amber:   { ring: 'ring-amber-200 dark:ring-amber-800',    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',      btn: 'bg-amber-500 hover:bg-amber-600 text-white',         bar: 'bg-amber-400' },
}

function ScoreBadge({ score, total }) {
  if (score === null) return null
  const pct = Math.round(score / total * 100)
  const cls = pct >= 80
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
    : pct >= 50
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
    : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {score}/{total} · {pct}%
    </span>
  )
}

export default function ModuleProgress() {
  const navigate = useNavigate()
  const [status,  setStatus]  = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const r = await api.get('/module-quiz/status')
      setStatus(r.data)
    } catch (e) {
      if (e.response?.status === 401) navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="text-center py-24 text-4xl animate-pulse text-gray-200 dark:text-gray-700">…</div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Module Quizzes</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Practice all characters in a module via Alphabet Quiz to unlock its assessment
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES_WITH_DATA.map(mod => {
          const s   = status?.[mod.id] ?? { practiced: 0, total: mod.codepoints.length, unlocked: false, best_score: null, best_total: null, attempt_count: 0 }
          const pct = s.total > 0 ? Math.round(s.practiced / s.total * 100) : 0
          const cc  = COLOR_CLASSES[mod.color] ?? COLOR_CLASSES.indigo
          const preview = mod.chars.slice(0, 4)

          return (
            <div
              key={mod.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col gap-3
                ${s.unlocked ? `ring-1 ${cc.ring}` : ''}`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{mod.name}</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{mod.description}</p>
                </div>
                {s.best_score !== null && (
                  <ScoreBadge score={s.best_score} total={s.best_total} />
                )}
              </div>

              {/* Character preview */}
              <div className="flex items-center gap-2 flex-wrap">
                {preview.map(ch => (
                  <span
                    key={ch.codepoint}
                    className="bg-gray-50 dark:bg-slate-700 rounded-lg px-2 py-1"
                  >
                    <ChakmaText size="base">{ch.char}</ChakmaText>
                  </span>
                ))}
                {mod.chars.length > 4 && (
                  <span className="text-xs text-gray-300 dark:text-gray-600">+{mod.chars.length - 4}</span>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {s.practiced} / {s.total} practiced
                  </span>
                  {s.unlocked && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cc.badge}`}>
                      Unlocked
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cc.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Action */}
              {s.unlocked ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/modules/${mod.id}`)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${cc.btn}`}
                  >
                    {s.attempt_count === 0 ? 'Take Quiz →' : 'Retake →'}
                  </button>
                  {s.attempt_count > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {s.attempt_count}× taken
                    </span>
                  )}
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-2 rounded-xl text-xs font-medium text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-slate-700/50 cursor-not-allowed"
                >
                  🔒 Practice {s.total - s.practiced} more to unlock
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
