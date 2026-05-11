import { useState } from 'react'
import { ALPHABET_ALL } from '../data/alphabet_all'
import ChakmaText from '../components/ChakmaText'
import BengaliText from '../components/BengaliText'

const FILTERS = [
  { key: 'all',        label: 'All characters' },
  { key: 'vowel',      label: 'Vowels' },
  { key: 'consonant',  label: 'Consonants' },
  { key: 'vowel_sign', label: 'Vowel marks' },
  { key: 'sign',       label: 'Signs' },
  { key: 'digit',      label: 'Numbers' },
].map(f => ({
  ...f,
  count: f.key === 'all'
    ? ALPHABET_ALL.length
    : ALPHABET_ALL.filter(a => a.category === f.key).length,
}))

function ItemLabel({ item }) {
  const lbl = item.label ?? item.bengali_label ?? item.romanization
  if (item.category === 'vowel' || item.category === 'consonant' || item.category === 'sign') {
    return <BengaliText size="lg">{lbl}</BengaliText>
  }
  return <span className="text-lg font-medium text-gray-700 dark:text-gray-200">{lbl}</span>
}

export default function AlphabetPractice() {
  const [filter,   setFilter]   = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [index,    setIndex]    = useState(0)
  const [revealed, setRevealed] = useState(false)

  const filtered = filter === 'all' ? ALPHABET_ALL : ALPHABET_ALL.filter(a => a.category === filter)
  const current  = filtered[Math.min(index, filtered.length - 1)]

  function changeFilter(key) { setFilter(key); setIndex(0); setRevealed(false) }
  function goNext() { setIndex(i => (i + 1) % filtered.length); setRevealed(false) }
  function goPrev() { setIndex(i => (i - 1 + filtered.length) % filtered.length); setRevealed(false) }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Alphabet Practice</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse all Chakma characters and their Bengali equivalents
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 shrink-0">
          {[['grid', 'Grid'], ['study', 'Flashcards']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setViewMode(val); setIndex(0); setRevealed(false) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === val
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => changeFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filter === f.key
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              filter === f.key
                ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-gray-500'
            }`}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map(a => (
            <div
              key={a.codepoint}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col items-center gap-3 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all"
            >
              <ChakmaText size="lg">{a.char}</ChakmaText>
              <div className="flex items-center gap-2">
                <span className="text-gray-200 dark:text-gray-700">=</span>
                <ItemLabel item={a} />
              </div>
              <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                {a.romanization}
              </span>
              {a.note && (
                <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">{a.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Flashcard view */}
      {viewMode === 'study' && current && (
        <div>
          {/* Progress */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-600 tabular-nums">
              {index + 1} / {filtered.length}
            </span>
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((index + 1) / filtered.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-300 dark:text-gray-700 capitalize">
              {current.category?.replace('_', ' ')}
            </span>
          </div>

          {/* Card */}
          <div
            onClick={() => setRevealed(r => !r)}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-12 text-center cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors mb-5 min-h-[260px] flex flex-col items-center justify-center gap-5 select-none"
          >
            <ChakmaText size="xl">{current.char}</ChakmaText>

            {!revealed ? (
              <p className="text-xs text-gray-300 dark:text-gray-700 mt-2">Tap to reveal</p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ItemLabel item={current} />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                    {current.romanization}
                  </span>
                  {current.ipa && (
                    <span className="text-xs text-gray-400 dark:text-gray-600 font-mono">{current.ipa}</span>
                  )}
                </div>
                {current.note && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">{current.note}</p>
                )}
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              ← Prev
            </button>
            {!revealed && (
              <button
                onClick={() => setRevealed(true)}
                className="flex-1 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                Reveal
              </button>
            )}
            <button
              onClick={goNext}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
