import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { ALPHABET } from '../data/alphabet_bengali'
import ChakmaText from '../components/ChakmaText'
import BengaliText from '../components/BengaliText'

// ── Offline fallback (no backend call needed for question building) ────────────
function buildOfflineQuestion(mode, alphabet = ALPHABET) {
  const target      = alphabet[Math.floor(Math.random() * alphabet.length)]
  const others      = alphabet.filter(a => a.char !== target.char)
  const distractors = shuffle(others).slice(0, 3)
  const options     = shuffle([target, ...distractors])
  return { ...target, mode, options, correctIndex: options.indexOf(target), answered: null }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const MODES = [
  { key: 'ccp_to_bn', label: 'Chakma → Bengali', shortIcon: '𑄇→ক' },
  { key: 'bn_to_ccp', label: 'Bengali → Chakma', shortIcon: 'ক→𑄇' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function OptionButton({ opt, idx, mode, answered, correctIndex, onClick }) {
  const isCorrect  = answered !== null && idx === correctIndex
  const isWrong    = answered !== null && idx === answered && idx !== correctIndex

  return (
    <button
      onClick={() => onClick(idx)}
      disabled={answered !== null}
      className={`
        w-full text-left px-5 py-3.5 rounded-xl border
        transition-all duration-150 cursor-pointer flex items-center gap-3
        ${isCorrect ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-600'
          : isWrong ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/60 dark:border-rose-600'
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 disabled:opacity-50'}
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
          {opt.romanization} · {opt.ipa}
        </span>
      )}
    </button>
  )
}

// ── Pre/Post test ──────────────────────────────────────────────────────────────

function AssessmentView({ testType, onComplete, navigate }) {
  const [questions, setQuestions] = useState(null)
  const [answers,   setAnswers]   = useState({})   // question_id → selected_index
  const [current,   setCurrent]   = useState(0)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    api.get(`/alphabet-quiz/assessment?type=${testType}`)
      .then(r => {
        if (r.data.already_taken) {
          setResult({ already_taken: true, score: r.data.score })
        } else {
          setQuestions(r.data.questions)
        }
      })
      .catch(err => {
        if (err.response?.status === 401) navigate('/login')
        else setError('Failed to load assessment.')
      })
      .finally(() => setLoading(false))
  }, [testType, navigate])

  function handleChoice(questionId, idx) {
    setAnswers(a => ({ ...a, [questionId]: idx }))
  }

  async function handleSubmit() {
    const payload = {
      test_type: testType,
      answers: questions.map(q => ({
        question_id:    q.question_id,
        selected_index: answers[q.question_id] ?? 0,
      })),
    }
    try {
      const r = await api.post('/alphabet-quiz/assessment/submit', payload)
      setResult(r.data)
      onComplete()
    } catch {
      setError('Submit failed. Please try again.')
    }
  }

  if (loading) return <div className="text-center py-24 text-4xl animate-pulse text-gray-200 dark:text-gray-700">…</div>
  if (error)   return <p className="text-rose-500 text-sm">{error}</p>

  if (result) {
    if (result.already_taken) {
      return (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
          <p className="text-amber-700 dark:text-amber-300 font-semibold">
            You already completed this quiz (score: {result.score}/20).
          </p>
          <button onClick={onComplete} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold cursor-pointer">
            Back to practice
          </button>
        </div>
      )
    }
    const pct = Math.round(result.score / result.total * 100)
    const color = pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose'
    return (
      <div className={`bg-${color}-50 dark:bg-${color}-950/40 border border-${color}-200 dark:border-${color}-800 rounded-2xl p-8 text-center`}>
        <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1">{result.score} / {result.total}</p>
        <p className={`text-lg font-semibold text-${color}-600 dark:text-${color}-400 mb-4`}>{pct}%</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {testType === 'pre' ? 'Your starting score is saved. Now practice and take the final quiz later to see your improvement.' : 'Final quiz complete! Check your progress to see how much you have improved.'}
        </p>
        <button onClick={onComplete} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors">
          {testType === 'pre' ? 'Start practising →' : 'See my progress →'}
        </button>
      </div>
    )
  }

  if (!questions) return null
  const q       = questions[current]
  const total   = questions.length
  const chosen  = answers[q.question_id] ?? null
  const allDone = Object.keys(answers).length === total

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {testType === 'pre' ? 'Starting quiz' : 'Final quiz'} · {current + 1}/{total}
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-10 text-center mb-5 min-h-[140px] flex items-center justify-center">
        {q.mode === 'ccp_to_bn'
          ? <ChakmaText size="xl">{q.char}</ChakmaText>
          : <BengaliText size="lg" weight="medium">{q.bengali_label}</BengaliText>
        }
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {q.options.map((opt, idx) => (
          <OptionButton
            key={idx}
            opt={opt} idx={idx} mode={q.mode}
            answered={chosen !== null ? chosen : null}
            correctIndex={q.correct_index}
            onClick={(i) => {
              handleChoice(q.question_id, i)
              setTimeout(() => {
                if (current < total - 1) setCurrent(c => c + 1)
              }, 600)
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {current > 0 && (
          <button onClick={() => setCurrent(c => c - 1)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:border-indigo-300">
            ← Back
          </button>
        )}
        {allDone && (
          <button onClick={handleSubmit} className="ml-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors">
            Submit test →
          </button>
        )}
      </div>
    </div>
  )
}

// ── Learning curve panel ───────────────────────────────────────────────────────

function LearningCurve({ navigate }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/alphabet-quiz/learning_curve')
      .then(r => setData(r.data))
      .catch(err => { if (err.response?.status === 401) navigate('/login') })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className="text-center py-8 text-gray-300 dark:text-gray-700 animate-pulse">…</div>
  if (!data || data.overall.attempts === 0) return (
    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
      No practice data yet. Answer some questions to see your progress.
    </p>
  )

  const weakest = data.by_character.slice(0, 8)

  return (
    <div className="space-y-5">
      {/* Overall */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total answered', val: data.overall.attempts },
          { label: 'Correct', val: data.overall.correct },
          { label: 'Accuracy', val: `${Math.round(data.overall.accuracy * 100)}%` },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3 text-center">
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{s.val}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weakest characters */}
      {weakest.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Needs practice
          </p>
          <div className="space-y-1.5">
            {weakest.map(c => {
              const pct = Math.round(c.accuracy * 100)
              const bar = pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
              return (
                <div key={c.codepoint} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-4 py-2.5">
                  <ChakmaText size="base" className="w-8 text-center">{c.char}</ChakmaText>
                  <span className="text-sm text-gray-400 dark:text-gray-500">=</span>
                  <BengaliText size="base" className="w-8">{c.bengali_label}</BengaliText>
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-8">{c.romanization}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-12 text-right">
                    {c.correct}/{c.attempts}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Daily */}
      {data.by_day.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Daily accuracy</p>
          <div className="space-y-1">
            {data.by_day.slice(-7).map(d => {
              const pct = Math.round(d.accuracy * 100)
              const bar = pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
              return (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono w-24">{d.date}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-10 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AlphabetQuiz() {
  const navigate = useNavigate()

  const [view,       setView]       = useState('loading')  // loading | practice | pretest | posttest | curve
  const [mode,       setMode]       = useState('ccp_to_bn')
  const [category,   setCategory]   = useState('all')      // all | vowel | consonant | digit
  const [scheduling, setScheduling] = useState('random')
  const [question,   setQuestion]   = useState(null)
  const [session,    setSession]    = useState({ correct: 0, total: 0 })
  const [status,     setStatus]     = useState(null)

  const fetchStatus = useCallback(() => {
    api.get('/alphabet-quiz/status')
      .then(r => {
        setStatus(r.data)
        setView(r.data.has_pretest ? 'practice' : 'pre_banner')
      })
      .catch(err => {
        if (err.response?.status === 401) navigate('/login')
        else setView('practice')   // offline fallback
      })
  }, [navigate])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  const loadNext = useCallback((currentMode, currentScheduling, currentCategory) => {
    const params = new URLSearchParams({ mode: currentMode, scheduling: currentScheduling })
    if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory)
    api.get(`/alphabet-quiz/next?${params}`)
      .then(r => {
        const q = r.data
        setQuestion({ ...q, options: q.options, correctIndex: q.correct_index, answered: null })
      })
      .catch(() => setQuestion(buildOfflineQuestion(currentMode)))
  }, [])

  useEffect(() => {
    if (view === 'practice') loadNext(mode, scheduling, category)
  }, [view, mode, scheduling, category, loadNext])

  function switchMode(m)     { setMode(m);     setSession({ correct: 0, total: 0 }); loadNext(m, scheduling, category) }
  function switchScheduling(s){ setScheduling(s); loadNext(mode, s, category) }
  function switchCategory(c) { setCategory(c); setSession({ correct: 0, total: 0 }); loadNext(mode, scheduling, c) }

  async function handleChoice(idx) {
    if (!question || question.answered !== null) return
    const isCorrect = idx === question.correctIndex
    setQuestion(q => ({ ...q, answered: idx }))
    setSession(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))

    try {
      await api.post('/alphabet-quiz/answer', {
        codepoint:  question.codepoint,
        mode:       question.mode,
        is_correct: isCorrect,
        scheduling,
        category,
      })
    } catch { /* non-critical */ }
  }

  function handleNext() {
    loadNext(mode, scheduling)
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (view === 'loading') {
    return <div className="text-center py-24 text-4xl animate-pulse text-gray-200 dark:text-gray-700">…</div>
  }

  if (view === 'pretest' || view === 'posttest') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('practice')} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">← Back</button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {view === 'pretest' ? 'Starting quiz' : 'Final quiz'}
          </h1>
        </div>
        <AssessmentView
          testType={view === 'pretest' ? 'pre' : 'post'}
          onComplete={() => { fetchStatus(); setView('practice') }}
          navigate={navigate}
        />
      </div>
    )
  }

  if (view === 'curve') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('practice')} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">← Back</button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Learning Curve</h1>
          <a
            href="/api/alphabet-quiz/export"
            className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Export CSV
          </a>
        </div>
        <LearningCurve navigate={navigate} />
      </div>
    )
  }

  // ── Practice view ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Alphabet Quiz</h1>
          {session.total > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Session: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{session.correct}</span>/{session.total}
              {' '}· {Math.round((session.correct / session.total) * 100)}%
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('curve')}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Progress
          </button>
        </div>
      </div>

      {/* Pre-test banner */}
      {view === 'pre_banner' && (
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 mb-5 flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Take the starting quiz first</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400">
              20 questions · records your starting level · takes ~3 minutes
            </p>
          </div>
          <button
            onClick={() => setView('pretest')}
            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Start →
          </button>
        </div>
      )}

      {/* Post-test prompt after enough practice */}
      {status?.has_pretest && !status?.has_posttest && status?.practice_count >= 20 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 mb-5 flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Ready for the final quiz?</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              You've answered {status.practice_count} questions. Take the final quiz to see how much you've improved.
            </p>
          </div>
          <button
            onClick={() => setView('posttest')}
            className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Take final quiz →
          </button>
        </div>
      )}

      {/* Mode + scheduling tabs */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm mb-6 overflow-hidden">
        <div className="relative">
          <div className="absolute bottom-0 inset-x-0 h-px bg-gray-100 dark:bg-slate-700" />
          <div className="flex px-3 gap-0.5">
            {MODES.map(m => (
              <button
                key={m.key}
                onClick={() => switchMode(m.key)}
                className={`
                  relative flex items-center gap-2 px-4 py-3
                  text-xs font-medium whitespace-nowrap cursor-pointer
                  transition-colors duration-150 border-b-2
                  ${mode === m.key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'}
                `}
              >
                <span className="font-mono text-xs">{m.shortIcon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        {/* Category filter */}
        <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700 flex flex-wrap gap-1">
          {[['all','All'],['vowel','Vowels'],['consonant','Consonants'],['digit','Numbers']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => switchCategory(val)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                category === val
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-semibold'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="px-4 py-2.5 bg-gray-50/60 dark:bg-slate-900/40 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {mode === 'ccp_to_bn' ? 'See Chakma — pick the equivalent' : 'See the equivalent — pick the Chakma character'}
          </p>
          <div className="flex items-center gap-1">
            {[['random', 'Random'], ['weighted', 'Smart']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => switchScheduling(val)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  scheduling === val
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question */}
      {question && (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-10 text-center mb-5 min-h-[160px] flex items-center justify-center">
            {question.mode === 'ccp_to_bn'
              ? <ChakmaText size="xl">{question.char}</ChakmaText>
              : <BengaliText size="lg" weight="medium">{question.bengali_label}</BengaliText>
            }
          </div>

          <div className="space-y-2.5 mb-5">
            {question.options.map((opt, idx) => (
              <OptionButton
                key={idx}
                opt={opt} idx={idx} mode={question.mode}
                answered={question.answered}
                correctIndex={question.correctIndex}
                onClick={handleChoice}
              />
            ))}
          </div>

          {question.answered !== null && (
            <>
              <div className={`rounded-2xl px-5 py-4 mb-5 border text-sm font-semibold ${
                question.answered === question.correctIndex
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}>
                {question.answered === question.correctIndex
                  ? `✓ Correct!  ${question.char} = ${question.bengali_label}  (${question.romanization})`
                  : `✗ Incorrect — ${question.char} = ${question.bengali_label}  (${question.romanization})`
                }
              </div>
              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors"
              >
                Next →
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
