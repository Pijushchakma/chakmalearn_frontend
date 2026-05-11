import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Target, Flame, ClipboardList } from 'lucide-react'
import api from '../api/client'

const STAT_CARDS = [
  {
    key:        'total_learned',
    label:      'Correct answers',
    Icon:       CheckCircle2,
    gradient:   'from-emerald-50 to-emerald-100/40 dark:from-emerald-950/40 dark:to-emerald-900/20',
    border:     'border-emerald-100 dark:border-emerald-900/40',
    iconColor:  'text-emerald-500 dark:text-emerald-400',
    valueColor: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    key:        'accuracy_today',
    label:      "Today's accuracy",
    Icon:       Target,
    pct:        true,
    gradient:   'from-indigo-50 to-indigo-100/40 dark:from-indigo-950/40 dark:to-indigo-900/20',
    border:     'border-indigo-100 dark:border-indigo-900/40',
    iconColor:  'text-indigo-500 dark:text-indigo-400',
    valueColor: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    key:        'current_streak',
    label:      'Day streak',
    Icon:       Flame,
    gradient:   'from-orange-50 to-orange-100/40 dark:from-orange-950/40 dark:to-orange-900/20',
    border:     'border-orange-100 dark:border-orange-900/40',
    iconColor:  'text-orange-500 dark:text-orange-400',
    valueColor: 'text-orange-700 dark:text-orange-300',
  },
  {
    key:        'due_today',
    label:      'Due today',
    Icon:       ClipboardList,
    gradient:   'from-violet-50 to-violet-100/40 dark:from-violet-950/40 dark:to-violet-900/20',
    border:     'border-violet-100 dark:border-violet-900/40',
    iconColor:  'text-violet-500 dark:text-violet-400',
    valueColor: 'text-violet-700 dark:text-violet-300',
  },
]

const MODULE_LABELS = {
  mcq_meaning:       'Meaning MCQ',
  mcq_script:        'Script MCQ',
  fill_romanization: 'Romanization',
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/progress/stats')
      .then(r => setStats(r.data))
      .catch(err => {
        if (err.response?.status === 401) navigate('/login')
        else setError('Could not load stats')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <LoadingShell />
  if (error)   return <p className="text-rose-500 text-sm">{error}</p>

  const byCategory = stats.accuracy_by_category || {}

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Longest streak: <span className="font-semibold text-orange-500">{stats.longest_streak} days</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {STAT_CARDS.map(({ key, label, Icon, pct, gradient, border, iconColor, valueColor }) => (
          <div key={key} className={`bg-gradient-to-br ${gradient} rounded-2xl border ${border} p-5`}>
            <Icon size={16} className={`${iconColor} mb-3`} />
            <p className={`text-2xl font-bold ${valueColor}`}>
              {pct ? `${Math.round(stats[key] * 100)}%` : stats[key]}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Accuracy by category */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">
          Accuracy by question type
        </p>
        {Object.entries(byCategory).length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No quiz data yet — go answer some questions!</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(byCategory).map(([qt, acc]) => {
              const pct      = Math.round(acc * 100)
              const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              return (
                <div key={qt}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-600 dark:text-gray-400">{MODULE_LABELS[qt] ?? qt}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      {stats.due_today > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-indigo-200/40 dark:shadow-indigo-900/40">
          <div>
            <p className="font-bold text-white">{stats.due_today} cards due today</p>
            <p className="text-xs text-indigo-200 mt-0.5">Keep your streak going!</p>
          </div>
          <button
            onClick={() => navigate('/trainer')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Review →
          </button>
        </div>
      )}
    </div>
  )
}

function LoadingShell() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-100 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
  )
}
