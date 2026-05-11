import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Brain, Layers, Search, Library, Shuffle, Languages, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import ChakmaText from '../components/ChakmaText'

const SECTIONS = [
  {
    to:       '/alphabet-practice',
    title:    'Alphabet Practice',
    subtitle: 'All 63 characters · Grid & flashcard study',
    Icon:     BookOpen,
    tag:      'Study',
    accent:   'sky',
  },
  {
    to:       '/alphabet-quiz',
    title:    'Alphabet Quiz',
    subtitle: 'Chakma ↔ Bengali MCQ · Adaptive scheduling',
    Icon:     Brain,
    tag:      'Quiz',
    accent:   'indigo',
  },
  {
    to:       '/modules',
    title:    'Module Quizzes',
    subtitle: '5 modules · Unlock via practice · Track progress',
    Icon:     Layers,
    tag:      'Modules',
    accent:   'violet',
  },
  {
    to:       '/explorer',
    title:    'Script Explorer',
    subtitle: 'Full Unicode block U+11100–U+1114F',
    Icon:     Search,
    tag:      'Reference',
    accent:   'blue',
  },
  {
    to:       '/trainer',
    title:    'Vocabulary Trainer',
    subtitle: '808 words · SM-2 spaced repetition',
    Icon:     Library,
    tag:      'Flashcards',
    accent:   'emerald',
  },
  {
    to:       '/quiz',
    title:    'Mixed Quiz',
    subtitle: 'Meaning · Script · Sentence · Romanization',
    Icon:     Shuffle,
    tag:      'Quiz',
    accent:   'amber',
  },
  {
    to:       '/transliterator',
    title:    'Transliterator',
    subtitle: 'Romanized → Unicode · Avro-style input',
    Icon:     Languages,
    tag:      'Tool',
    accent:   'rose',
  },
]

const ACCENT = {
  sky:     { icon: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',     tag: 'text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-950/60',     ring: 'group-hover:shadow-sky-100/60 dark:group-hover:shadow-sky-900/40' },
  indigo:  { icon: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40', tag: 'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/60', ring: 'group-hover:shadow-indigo-100/60 dark:group-hover:shadow-indigo-900/40' },
  violet:  { icon: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40', tag: 'text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-950/60', ring: 'group-hover:shadow-violet-100/60 dark:group-hover:shadow-violet-900/40' },
  blue:    { icon: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40', tag: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/60',   ring: 'group-hover:shadow-blue-100/60 dark:group-hover:shadow-blue-900/40' },
  emerald: { icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40', tag: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60', ring: 'group-hover:shadow-emerald-100/60 dark:group-hover:shadow-emerald-900/40' },
  amber:   { icon: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40', tag: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60', ring: 'group-hover:shadow-amber-100/60 dark:group-hover:shadow-amber-900/40' },
  rose:    { icon: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40', tag: 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60',   ring: 'group-hover:shadow-rose-100/60 dark:group-hover:shadow-rose-900/40' },
}

export default function Home() {
  const { user }   = useAuth()
  const [status,  setStatus]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/alphabet-quiz/status')
      .then(r => setStatus(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pretestPct  = status?.pretest_score  != null ? Math.round(status.pretest_score  / 20 * 100) : null
  const posttestPct = status?.posttest_score != null ? Math.round(status.posttest_score / 20 * 100) : null

  return (
    <div className="max-w-3xl mx-auto">

      {/* Hero */}
      <div className="mb-8 pt-2">
        <div className="flex items-center gap-2 mb-4">
          <ChakmaText size="base" className="text-gray-300 dark:text-gray-700">𑄃𑄎𑄴𑄦𑄳𑄃</ChakmaText>
          <span className="text-xs text-gray-300 dark:text-gray-700 font-mono">· Ajhā Pāṭh</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          {user?.username
            ? <>Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user.username}</span></>
            : 'Welcome to ChakmaLearn'
          }
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
          Interactive learning platform for the Chakma script — the indigenous writing system of the Chakma people, Unicode U+11100–U+1114F.
        </p>
      </div>

      {/* Stats */}
      {!loading && status && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Pre-test"  value={status.pretest_score  != null ? `${status.pretest_score}/20`  : '—'} sub={pretestPct  != null ? `${pretestPct}%`  : 'Not taken'} accent={pretestPct  != null ? (pretestPct  >= 70 ? 'emerald' : 'amber') : 'gray'} />
          <StatCard label="Answered"  value={status.practice_count}                                               sub="questions"                                                accent="indigo" />
          <StatCard label="Post-test" value={status.posttest_score != null ? `${status.posttest_score}/20` : '—'} sub={posttestPct != null ? `${posttestPct}%` : 'Locked'}    accent={posttestPct != null ? (posttestPct >= 70 ? 'emerald' : 'amber') : 'gray'} />
        </div>
      )}

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {SECTIONS.map(({ to, title, subtitle, Icon, tag, accent }) => {
          const a = ACCENT[accent]
          return (
            <Link
              key={to}
              to={to}
              className={`group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 hover:shadow-lg transition-all duration-200 ${a.ring}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-xl ${a.icon}`}>
                  <Icon size={16} />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${a.tag}`}>
                  {tag}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {title}
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150" />
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{subtitle}</p>
            </Link>
          )
        })}
      </div>

      {/* About */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">About</p>
        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <p>
            Built on the <strong className="text-gray-700 dark:text-gray-300">ChakmaBridge</strong> vocabulary dataset (808 words) and{' '}
            <strong className="text-gray-700 dark:text-gray-300">ChakmaNMT</strong> sentence corpus (7,056 pairs).
            Quiz scoring uses a combined <strong className="text-gray-700 dark:text-gray-300">chrF + NED</strong> metric.
            Flashcards use <strong className="text-gray-700 dark:text-gray-300">SM-2</strong> spaced repetition.
          </p>
          <p>
            The Chakma script (Ajhā Pāṭh) is a Brahmic abugida with 38 consonants and vowels, encoded at Unicode U+11100–U+1114F. Requires Noto Sans Chakma.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  const colorMap = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber:   'text-amber-500  dark:text-amber-400',
    indigo:  'text-indigo-600 dark:text-indigo-400',
    gray:    'text-gray-400   dark:text-gray-600',
  }
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 px-4 py-4 text-center">
      <p className={`text-xl font-bold ${colorMap[accent] ?? colorMap.gray}`}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mt-1">{label}</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>
    </div>
  )
}
