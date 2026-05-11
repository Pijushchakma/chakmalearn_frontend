import { useState, useEffect } from 'react'
import BengaliText from './BengaliText'

export default function FlashCard({ item, onFlip }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => { setFlipped(false) }, [item?.id])

  useEffect(() => {
    const handler = (e) => { if (e.code === 'Space') { e.preventDefault(); flip() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  function flip() {
    setFlipped(f => !f)
    onFlip?.(!flipped)
  }

  if (!item) return null

  const difficultyBadge = {
    1: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400',
    2: 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400',
    3: 'bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400',
  }[item.difficulty]
  const difficultyLabel = ['', 'Easy', 'Medium', 'Hard'][item.difficulty]

  return (
    <div className="flip-card w-full h-72 cursor-pointer" onClick={flip} role="button" aria-label="Flip card">
      <div className={`flip-card-inner rounded-2xl shadow-sm ${flipped ? 'flipped' : ''}`}>

        {/* Front — Bengali-script Chakma + romanization */}
        <div className="flip-card-front flex flex-col items-center justify-center gap-1 p-8 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
          <BengaliText size="lg" weight="medium">{item.chakma_bn_script || '—'}</BengaliText>
          <p className="text-gray-400 dark:text-gray-500 text-sm italic tracking-wide">{item.romanized_chakma}</p>
          <p className="text-gray-200 dark:text-gray-700 text-xs mt-3">Click · Space</p>
        </div>

        {/* Back — English + Bengali + romanization + difficulty */}
        <div className="flip-card-back flex flex-col items-center justify-center gap-1 p-8 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900">
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center leading-snug">
            {item.english}
          </p>
          <BengaliText size="base" className="text-gray-500 dark:text-gray-400 mt-1">
            {item.bangla}
          </BengaliText>
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">{item.romanized_bangla}</p>
          <span className={`mt-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${difficultyBadge}`}>
            {difficultyLabel}
          </span>
        </div>

      </div>
    </div>
  )
}
