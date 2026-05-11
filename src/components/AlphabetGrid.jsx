import ChakmaText from './ChakmaText'

const FILTERS = ['all', 'consonant', 'vowel', 'vowel_sign', 'digit', 'mark', 'sign']
const FILTER_LABELS = {
  all: 'All',
  consonant: 'Consonants',
  vowel: 'Vowels',
  vowel_sign: 'Vowel Signs',
  digit: 'Digits',
  mark: 'Marks',
  sign: 'Signs',
}

export default function AlphabetGrid({ chars, query, selectedChar, onSelect }) {
  const filtered = chars.filter(c => {
    if (!query) return true
    // Strip the combining-circle prefix (◌) so typing "e" matches "◌e", "◌ei"
    const roman = c.romanization.replace('◌', '').toLowerCase()
    return roman.startsWith(query.toLowerCase())
  })

  if (filtered.length === 0) {
    return (
      <p className="text-center text-gray-400 dark:text-gray-500 py-12">
        No characters match &ldquo;{query}&rdquo;
      </p>
    )
  }

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
      {filtered.map(c => (
        <button
          key={c.codepoint}
          onClick={() => onSelect(c)}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all
            ${selectedChar?.codepoint === c.codepoint
              ? 'bg-indigo-100 border-indigo-400 dark:bg-indigo-900 dark:border-indigo-500 shadow-md'
              : 'bg-white border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-500'
            }`}
        >
          <ChakmaText size="lg">{c.char}</ChakmaText>
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate w-full text-center">
            {c.romanization}
          </span>
        </button>
      ))}
    </div>
  )
}

export { FILTERS, FILTER_LABELS }
