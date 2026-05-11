import { useEffect } from 'react'
import ChakmaText from './ChakmaText'

export default function CharacterModal({ char, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!char) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex flex-col items-center mb-6">
          <ChakmaText size="xl">{char.char}</ChakmaText>
          <span className="font-mono text-xs text-gray-400 dark:text-gray-500 mt-1">{char.codepoint}</span>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="Unicode name" value={char.unicode_name} mono />
          <Row label="Category"     value={char.category} />
          <Row label="Romanization" value={char.romanization} />
          <Row label="IPA"          value={char.ipa} mono />
          <Row label="Note"         value={char.note} />

          {char.example_word && (
            <div className="border-t border-gray-100 dark:border-slate-700 pt-3 mt-3">
              <dt className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Example word</dt>
              <dd className="flex items-baseline gap-3">
                <ChakmaText size="lg">{char.example_word}</ChakmaText>
                <span className="text-gray-500 dark:text-gray-400 italic text-sm">({char.example_roman})</span>
              </dd>
            </div>
          )}
        </dl>

        {/* TODO: stroke order animation */}
        <p className="mt-5 text-xs text-gray-300 dark:text-gray-600 text-center italic">
          Stroke order animation — coming soon
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, mono = false }) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <dt className="text-gray-400 dark:text-gray-500 w-28 shrink-0">{label}</dt>
      <dd className={`text-gray-800 dark:text-gray-200 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
