import { useState } from 'react'
import ALL_VOCAB from '../data/vocabulary.json'
import FlashCardDeck from '../components/FlashCardDeck'

const DECKS = [
  { label: 'First 100 words',  count: 100,  cards: ALL_VOCAB.slice(0, 100) },
  { label: 'Beginner',         count: null, cards: ALL_VOCAB.filter(v => v.difficulty === 1) },
  { label: 'Intermediate',     count: null, cards: ALL_VOCAB.filter(v => v.difficulty === 2) },
  { label: 'Advanced',         count: null, cards: ALL_VOCAB.filter(v => v.difficulty === 3) },
  { label: 'All words',        count: 808,  cards: ALL_VOCAB },
].map(d => ({ ...d, count: d.count ?? d.cards.length }))

export default function VocabularyTrainer() {
  const [deckIdx, setDeckIdx] = useState(0)
  const [deckKey, setDeckKey] = useState(0)

  function switchDeck(i) {
    setDeckIdx(i)
    setDeckKey(k => k + 1)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Vocabulary</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Flip cards to reveal meanings — the app shows you each word when you're most likely to forget it
        </p>
      </div>

      {/* Deck picker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">Choose a deck</p>
        <div className="flex flex-wrap gap-2">
          {DECKS.map((d, i) => (
            <button
              key={d.label}
              onClick={() => switchDeck(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                deckIdx === i
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300'
              }`}
            >
              {d.label}
              <span className="ml-1.5 opacity-60">({d.count})</span>
            </button>
          ))}
        </div>
      </div>

      <FlashCardDeck key={deckKey} cards={DECKS[deckIdx].cards} />
    </div>
  )
}
