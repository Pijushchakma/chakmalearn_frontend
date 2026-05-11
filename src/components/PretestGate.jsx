import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import ChakmaText from './ChakmaText'
import BengaliText from './BengaliText'

export default function PretestGate() {
  const { checkPretest, logout } = useAuth()
  const navigate = useNavigate()

  const [stage,     setStage]     = useState('intro')
  const [questions, setQuestions] = useState([])
  const [answers,   setAnswers]   = useState({})
  const [current,   setCurrent]   = useState(0)
  const [result,    setResult]    = useState(null)
  const [errMsg,    setErrMsg]    = useState('')

  async function loadTest() {
    try {
      const { data } = await api.get('/alphabet-quiz/assessment?type=pre')
      if (data.already_taken) { await checkPretest(); return }
      setQuestions(data.questions)
      setStage('test')
    } catch {
      setErrMsg('Could not load the quiz. Please refresh and try again.')
      setStage('error')
    }
  }

  async function submitTest() {
    setStage('submitting')
    try {
      const payload = {
        test_type: 'pre',
        answers: questions.map(q => ({
          question_id:    q.question_id,
          selected_index: answers[q.question_id] ?? 0,
        })),
      }
      const { data } = await api.post('/alphabet-quiz/assessment/submit', payload)
      setResult(data)
      setStage('done')
      await checkPretest()
      navigate('/', { replace: true })
    } catch {
      setErrMsg('Failed to save your answers. Please try again.')
      setStage('error')
    }
  }

  function handleChoice(questionId, idx, isLast) {
    setAnswers(a => ({ ...a, [questionId]: idx }))
    if (!isLast) setTimeout(() => setCurrent(c => c + 1), 500)
  }

  // ── Intro ─────────────────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/50">
              <ChakmaText size="base" className="text-white">𑄌𑄟𑄴𑄟</ChakmaText>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-black/5 p-8 text-center">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              A quick starting quiz
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Before you dive in, we want to see what you already know about the Chakma alphabet. This helps us track your progress.
            </p>

            <div className="flex flex-col gap-2 mb-7 text-left">
              {[
                ['20 questions', 'About 3 minutes'],
                ['No pressure', 'This is just your starting point'],
                ['Saved automatically', 'You can compare after practising'],
              ].map(([title, sub]) => (
                <div key={title} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{title}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={loadTest}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200/60 dark:shadow-indigo-900/40 cursor-pointer"
            >
              Begin quiz →
            </button>
          </div>

          <button
            onClick={logout}
            className="mt-5 w-full text-center text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
          <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{errMsg}</p>
          <button
            onClick={() => { setErrMsg(''); setStage('intro') }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Submitting ────────────────────────────────────────────────────────────────
  if (stage === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl animate-pulse text-gray-200 dark:text-gray-700 mb-4">…</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Saving your answers…</p>
        </div>
      </div>
    )
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  if (stage === 'done' && result) {
    const pct   = Math.round(result.score / result.total * 100)
    const color = pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400'
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className={`text-6xl font-bold mb-1 ${color}`}>{result.score}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">out of {result.total}</p>
          <p className={`text-lg font-semibold mb-4 ${color}`}>{pct}%</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8 leading-relaxed">
            Your starting score has been saved. Practice the alphabet, then take the final quiz to see how much you've improved.
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-700 animate-pulse">Loading your app…</p>
        </div>
      </div>
    )
  }

  // ── Test ──────────────────────────────────────────────────────────────────────
  if (stage !== 'test' || questions.length === 0) return null

  const q      = questions[current]
  const total  = questions.length
  const chosen = answers[q.question_id] ?? null
  const isLast = current === total - 1
  const allDone = Object.keys(answers).length === total
  const progressPct = Math.round(((current + (chosen !== null ? 1 : 0)) / total) * 100)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
          {current + 1} / {total}
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <button
          onClick={logout}
          className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-pointer shrink-0 transition-colors"
        >
          Exit
        </button>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Context label */}
          <p className="text-xs text-center text-gray-400 dark:text-gray-600 mb-4 font-medium">
            {q.mode === 'ccp_to_bn'
              ? 'What is this Chakma character in Bengali?'
              : 'Which Chakma character matches this Bengali letter?'}
          </p>

          {/* Prompt */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-10 text-center mb-5 min-h-[150px] flex items-center justify-center">
            {q.mode === 'ccp_to_bn'
              ? <ChakmaText size="xl">{q.char}</ChakmaText>
              : <BengaliText size="lg" weight="medium">{q.bengali_label}</BengaliText>
            }
          </div>

          {/* Options */}
          <div className="space-y-2.5 mb-6">
            {q.options.map((opt, idx) => {
              const isCorrect = chosen !== null && idx === q.correct_index
              const isWrong   = chosen !== null && idx === chosen && idx !== q.correct_index
              return (
                <button
                  key={idx}
                  onClick={() => handleChoice(q.question_id, idx, isLast)}
                  disabled={chosen !== null}
                  className={`
                    w-full text-left px-5 py-3.5 rounded-xl border
                    transition-all duration-150 cursor-pointer flex items-center gap-3
                    ${isCorrect
                      ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-600'
                      : isWrong
                      ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/60 dark:border-rose-600'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 disabled:opacity-40'}
                  `}
                >
                  <span className="text-sm w-5 shrink-0 text-gray-300 dark:text-gray-600">
                    {isCorrect ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    {q.mode === 'ccp_to_bn'
                      ? <BengaliText size="lg">{opt.bengali_label}</BengaliText>
                      : <ChakmaText  size="lg">{opt.char}</ChakmaText>
                    }
                  </span>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          {chosen !== null && !isLast && (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            >
              Next →
            </button>
          )}
          {chosen !== null && isLast && (
            <button
              onClick={allDone ? submitTest : undefined}
              disabled={!allDone}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            >
              {allDone ? 'See my score →' : 'Answer all questions first'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
