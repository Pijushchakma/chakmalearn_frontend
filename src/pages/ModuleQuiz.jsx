import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { MODULES } from '../data/modules'
import ChakmaText from '../components/ChakmaText'
import BengaliText from '../components/BengaliText'

function OptionButton({ opt, idx, mode, answered, correctIndex, onClick }) {
  const isCorrect = answered !== null && idx === correctIndex
  const isWrong   = answered !== null && idx === answered && idx !== correctIndex

  return (
    <button
      onClick={() => onClick(idx)}
      disabled={answered !== null}
      className={`
        w-full text-left px-5 py-3.5 rounded-xl border
        transition-all duration-150 cursor-pointer flex items-center gap-3
        ${isCorrect
          ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-600'
          : isWrong
          ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/60 dark:border-rose-600'
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 disabled:opacity-40'}
      `}
    >
      <span className="text-sm w-5 shrink-0 text-gray-300 dark:text-gray-600">
        {isCorrect ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + idx)}
      </span>
      <span className={`text-lg font-medium ${
        isCorrect ? 'text-emerald-700 dark:text-emerald-300'
        : isWrong  ? 'text-rose-700 dark:text-rose-300'
        : 'text-gray-700 dark:text-gray-200'
      }`}>
        {mode === 'ccp_to_bn'
          ? <BengaliText size="lg">{opt.bengali_label}</BengaliText>
          : <ChakmaText  size="lg">{opt.char}</ChakmaText>
        }
      </span>
      {answered !== null && idx === correctIndex && (
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 font-mono">
          {opt.romanization}
        </span>
      )}
    </button>
  )
}

export default function ModuleQuiz() {
  const { moduleId } = useParams()
  const navigate     = useNavigate()
  const modMeta      = MODULES.find(m => m.id === moduleId)

  const [state,     setState]     = useState('loading')  // loading | quiz | submitting | results | error
  const [questions, setQuestions] = useState([])
  const [current,   setCurrent]   = useState(0)
  const [answers,   setAnswers]   = useState([])         // { codepoint, mode, selected_codepoint }
  const [feedback,  setFeedback]  = useState(null)       // { correct: bool } for current question
  const [results,   setResults]   = useState(null)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    api.get(`/module-quiz/${moduleId}/questions`)
      .then(r => {
        setQuestions(r.data.questions)
        setState('quiz')
      })
      .catch(e => {
        if (e.response?.status === 401) navigate('/login')
        setError(e.response?.data?.detail ?? 'Failed to load quiz.')
        setState('error')
      })
  }, [moduleId, navigate])

  function handleChoice(idx) {
    const q              = questions[current]
    const selectedOption = q.options[idx]
    const isCorrect      = selectedOption.codepoint === q.codepoint

    setFeedback({ idx, isCorrect, correctIndex: q.correct_index })

    const newAnswer = {
      codepoint:          q.codepoint,
      mode:               q.mode,
      selected_codepoint: selectedOption.codepoint,
    }
    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    setTimeout(() => {
      setFeedback(null)
      if (current < questions.length - 1) {
        setCurrent(c => c + 1)
      } else {
        submitAnswers(updatedAnswers)
      }
    }, 700)
  }

  async function submitAnswers(finalAnswers) {
    setState('submitting')
    try {
      const r = await api.post(`/module-quiz/${moduleId}/submit`, { answers: finalAnswers })
      setResults(r.data)
      setState('results')
    } catch {
      setError('Failed to submit. Please try again.')
      setState('error')
    }
  }

  if (state === 'loading') {
    return (
      <div className="text-center py-24 text-4xl animate-pulse text-gray-200 dark:text-gray-700">…</div>
    )
  }

  if (state === 'error') {
    return (
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate('/modules')} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer mb-6 block">
          ← Back to Modules
        </button>
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 text-center">
          <p className="text-rose-600 dark:text-rose-400 text-sm font-medium">{error}</p>
          <button
            onClick={() => navigate('/alphabet-quiz')}
            className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer"
          >
            Go practice →
          </button>
        </div>
      </div>
    )
  }

  if (state === 'submitting') {
    return (
      <div className="text-center py-24">
        <p className="text-4xl animate-pulse text-gray-200 dark:text-gray-700">…</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Saving results…</p>
      </div>
    )
  }

  if (state === 'results' && results) {
    const pct   = results.percentage
    const color = pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose'
    const colorMap = {
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
      amber:   'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
      rose:    'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
    }

    return (
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate('/modules')} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer mb-6 block">
          ← Back to Modules
        </button>

        <div className={`rounded-2xl border p-8 text-center mb-5 ${colorMap[color]}`}>
          <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {results.score} / {results.total}
          </p>
          <p className={`text-xl font-semibold mb-3 ${colorMap[color].split(' ').find(c => c.startsWith('text-'))}`}>
            {pct}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {modMeta?.name ?? moduleId} module · {pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good progress — keep practising.' : 'Keep practising to improve.'}
          </p>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-2 mb-6">
          {results.details.map((d, i) => {
            const char = questions.find(q => q.codepoint === d.codepoint)
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm ${
                  d.is_correct
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30'
                }`}
              >
                <span className={d.is_correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                  {d.is_correct ? '✓' : '✗'}
                </span>
                {char && <ChakmaText size="base">{char.char}</ChakmaText>}
                <span className="text-gray-400 dark:text-gray-500 text-xs">=</span>
                {char && <BengaliText size="base">{char.bengali_label}</BengaliText>}
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500 ml-1">{char?.romanization}</span>
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 capitalize">
                  {d.mode.replace('_to_', '→').replace('ccp', 'Chakma').replace('bn', 'Bengali')}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/modules')}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            All Modules
          </button>
          <button
            onClick={() => { setState('loading'); setCurrent(0); setAnswers([]); setFeedback(null); setResults(null)
              api.get(`/module-quiz/${moduleId}/questions`)
                .then(r => { setQuestions(r.data.questions); setState('quiz') })
                .catch(() => { setError('Failed to reload.'); setState('error') })
            }}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Retake →
          </button>
        </div>
      </div>
    )
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────────
  const q = questions[current]
  if (!q) return null

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/modules')}
          className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
        >
          ←
        </button>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {modMeta?.name ?? moduleId}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {current + 1} / {questions.length}
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-10 text-center mb-5 min-h-[160px] flex items-center justify-center">
        {q.mode === 'ccp_to_bn'
          ? <ChakmaText size="xl">{q.char}</ChakmaText>
          : <BengaliText size="lg" weight="medium">{q.bengali_label}</BengaliText>
        }
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((opt, idx) => (
          <OptionButton
            key={idx}
            opt={opt} idx={idx} mode={q.mode}
            answered={feedback ? feedback.idx : null}
            correctIndex={feedback ? feedback.correctIndex : null}
            onClick={handleChoice}
          />
        ))}
      </div>
    </div>
  )
}
