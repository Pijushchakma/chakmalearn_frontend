import { useState } from 'react'
import FlashCard from './FlashCard'

export default function FlashCardDeck({ cards }) {
  const [index, setIndex]   = useState(0)
  const [known, setKnown]   = useState([])
  const [unknown, setUnknown] = useState([])
  const [done, setDone]     = useState(false)

  const card = cards[index]
  const total = cards.length

  function markKnown() {
    setKnown(k => [...k, card.id])
    advance()
  }

  function markUnknown() {
    setUnknown(u => [...u, card.id])
    advance()
  }

  function advance() {
    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  function restart() {
    setIndex(0)
    setKnown([])
    setUnknown([])
    setDone(false)
  }

  if (done) {
    const pct = Math.round((known.length / total) * 100)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-5xl mb-4">{pct >= 70 ? '🎉' : '📚'}</p>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Session complete!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-1">
          You knew <span className="font-semibold text-green-600 dark:text-green-400">{known.length}</span> of{' '}
          <span className="font-semibold">{total}</span> cards ({pct}%)
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
          {unknown.length} card{unknown.length !== 1 ? 's' : ''} to review
        </p>
        <button
          onClick={restart}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Restart deck
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400 dark:text-gray-500">
          Card {index + 1} of {total}
        </span>
        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
          {known.length} known
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mb-5">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${((index) / total) * 100}%` }}
        />
      </div>

      <FlashCard item={card} />

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={() => index > 0 && setIndex(i => i - 1)}
          disabled={index === 0}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
        >
          ← Prev
        </button>

        <button
          onClick={markUnknown}
          className="px-5 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:text-red-400 font-medium text-sm transition-colors"
        >
          ✗ Don't know
        </button>

        <button
          onClick={markKnown}
          className="px-5 py-2 rounded-lg bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:text-green-400 font-medium text-sm transition-colors"
        >
          ✓ Know it
        </button>

        <button
          onClick={advance}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm transition-colors"
        >
          Skip →
        </button>
      </div>
    </div>
  )
}
