import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import ChakmaText from '../components/ChakmaText'
import BengaliText from '../components/BengaliText'

const QUIZ_MODES = [
  { key: 'all',              label: 'All types',    description: 'A mix of all question types' },
  { key: 'mcq_meaning',      label: 'Word meaning', description: 'See a Chakma word — pick the English meaning' },
  { key: 'mcq_script',       label: 'Script match', description: 'See an English word — pick the Chakma script' },
  { key: 'mcq_sentence',     label: 'Sentences',    description: 'Read a sentence — choose the right translation' },
  { key: 'mcq_alphabet',     label: 'Alphabet',     description: 'Identify Chakma characters' },
  { key: 'fill_romanization', label: 'Spelling',    description: 'Type the English spelling of a Chakma word' },
]

const TYPE_COLORS = {
  mcq_meaning:       'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
  mcq_script:        'text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
  mcq_sentence:      'text-teal-700 bg-teal-100 dark:text-teal-300 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
  mcq_alphabet:      'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
  fill_romanization: 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
}

function PromptText({ text, isCpp }) {
  if (isCpp) return <ChakmaText size="xl">{text}</ChakmaText>
  return <BengaliText size="lg" weight="medium">{text}</BengaliText>
}

function OptionText({ text, isCpp }) {
  if (isCpp) return <ChakmaText size="lg">{text}</ChakmaText>
  if (/^[\x00-\x7F]*$/.test(text)) return <span>{text}</span>
  return <BengaliText size="sm">{text}</BengaliText>
}

function AnswerQuality({ score }) {
  const pct   = Math.round(score * 100)
  const color = score >= 0.85 ? 'bg-emerald-500' : score >= 0.60 ? 'bg-amber-500' : 'bg-rose-500'
  const label = score >= 0.85 ? 'Great spelling' : score >= 0.60 ? 'Almost right' : 'Keep practising'
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Quiz() {
  const [mode,         setMode]         = useState('all')
  const [question,     setQuestion]     = useState(null)
  const [selected,     setSelected]     = useState(null)
  const [result,       setResult]       = useState(null)
  const [typed,        setTyped]        = useState('')
  const [loading,      setLoading]      = useState(true)
  const [score,        setScore]        = useState(null)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const navigate = useNavigate()

  const loadNext = useCallback((currentMode) => {
    setLoading(true)
    setSelected(null)
    setResult(null)
    setTyped('')
    setScore(null)
    const params = currentMode && currentMode !== 'all' ? `?type=${currentMode}` : ''
    api.get(`/quiz/next${params}`)
      .then(r => setQuestion(r.data))
      .catch(err => { if (err.response?.status === 401) navigate('/login') })
      .finally(() => setLoading(false))
  }, [navigate])

  function switchMode(newMode) {
    setMode(newMode)
    setQuestion(null)
    setSessionStats({ correct: 0, total: 0 })
    loadNext(newMode)
  }

  useEffect(() => { loadNext(mode) }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  async function submitAnswer(userAnswer, correctAnswer) {
    const { data } = await api.post('/quiz/answer', {
      vocab_id:       question.vocab_id,
      question_type:  question.question_type,
      user_answer:    userAnswer,
      correct_answer: correctAnswer ?? question.options[question.correct_index],
      sentence_id:    question.sentence_id ?? null,
    })
    setResult(data)
    setSessionStats(s => ({
      correct: s.correct + (data.is_correct ? 1 : 0),
      total:   s.total + 1,
    }))
    if (question.question_type === 'fill_romanization') {
      const m = data.explanation?.match(/(\d+)%/)
      if (m) setScore(parseInt(m[1]) / 100)
    }
  }

  function handleChoice(idx) {
    if (result) return
    setSelected(idx)
    submitAnswer(question.options[idx], question.options[question.correct_index])
  }

  function handleTypingSubmit(e) {
    e.preventDefault()
    if (result || !typed.trim()) return
    setSelected(typed)
    submitAnswer(typed.trim(), question.options[question.correct_index])
  }

  const currentModeInfo = QUIZ_MODES.find(m => m.key === mode)
  const isTyping  = question?.question_type === 'fill_romanization'
  const typeColor = question ? (TYPE_COLORS[question.question_type] || TYPE_COLORS.mcq_meaning) : ''

  return (
    <div className="max-w-xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Mixed Quiz</h1>
          {sessionStats.total > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sessionStats.correct}</span> correct
              {' '}out of {sessionStats.total}
              {' '}· {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* Mode tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm mb-6 overflow-hidden">
        <div className="relative">
          <div className="absolute bottom-0 inset-x-0 h-px bg-gray-100 dark:bg-slate-800" />
          <div className="flex overflow-x-auto scrollbar-none px-3 gap-0.5">
            {QUIZ_MODES.map(m => (
              <button
                key={m.key}
                onClick={() => switchMode(m.key)}
                className={`
                  relative px-3 py-3 text-xs font-semibold whitespace-nowrap cursor-pointer
                  transition-colors duration-150 border-b-2
                  ${mode === m.key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'}
                `}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-2.5 bg-gray-50/60 dark:bg-slate-950/40">
          <p className="text-xs text-gray-400 dark:text-gray-500">{currentModeInfo?.description}</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-24 text-4xl animate-pulse text-gray-200 dark:text-gray-700">…</div>
      )}

      {!loading && question && (
        <>
          {/* Type badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-5 ${typeColor}`}>
            {question.question_label}
          </div>

          {/* Prompt */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 text-center mb-5 min-h-[130px] flex flex-col items-center justify-center gap-2">
            <PromptText text={question.prompt} isCpp={question.prompt_is_chakma} />
            {question.prompt_romanization && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">{question.prompt_romanization}</p>
            )}
          </div>

          {/* MCQ options */}
          {!isTyping && (
            <div className="space-y-2.5 mb-5">
              {question.options.map((opt, idx) => {
                const isCorrectIdx = result && idx === question.correct_index
                const isWrongPick  = result && idx === selected && !result.is_correct
                return (
                  <button
                    key={idx}
                    onClick={() => handleChoice(idx)}
                    disabled={!!result}
                    className={`
                      w-full text-left px-5 py-3.5 rounded-xl border
                      transition-all duration-150 cursor-pointer flex items-center gap-3
                      ${isCorrectIdx
                        ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-600'
                        : isWrongPick
                        ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/60 dark:border-rose-600'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 disabled:opacity-40'}
                    `}
                  >
                    <span className="text-sm w-5 shrink-0 text-gray-300 dark:text-gray-600">
                      {isCorrectIdx ? '✓' : isWrongPick ? '✗' : String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`text-sm font-medium ${
                      isCorrectIdx ? 'text-emerald-700 dark:text-emerald-300'
                      : isWrongPick ? 'text-rose-700 dark:text-rose-300'
                      : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      <OptionText text={opt} isCpp={question.options_are_chakma} />
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Typing input */}
          {isTyping && (
            <form onSubmit={handleTypingSubmit} className="mb-5 space-y-3">
              <input
                type="text"
                value={typed}
                onChange={e => setTyped(e.target.value)}
                disabled={!!result}
                placeholder="Type the English spelling…"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all"
              />
              {!result && (
                <button
                  type="submit"
                  disabled={!typed.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                >
                  Check answer
                </button>
              )}
            </form>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-2xl p-5 mb-5 border ${
              result.is_correct
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                : 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
            }`}>
              <p className={`font-semibold text-sm mb-1 ${
                result.is_correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
              }`}>
                {result.is_correct ? 'Correct!' : 'Not quite'}
              </p>
              {result.explanation && !isTyping && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{result.explanation}</p>
              )}
              {!result.is_correct && result.correct_answer && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Answer: <span className="font-semibold text-gray-800 dark:text-gray-200">
                    <OptionText text={result.correct_answer} isCpp={question.prompt_is_chakma} />
                  </span>
                </p>
              )}
              {isTyping && score !== null && <AnswerQuality score={score} />}
            </div>
          )}

          {result && (
            <button
              onClick={() => loadNext(mode)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            >
              Next question →
            </button>
          )}
        </>
      )}
    </div>
  )
}
