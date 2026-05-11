import { useState, useMemo } from 'react'
import alphabetData from '../data/chakma_alphabet.json'
import AlphabetGrid, { FILTERS, FILTER_LABELS } from '../components/AlphabetGrid'
import CharacterModal from '../components/CharacterModal'
import SearchBar from '../components/SearchBar'

const TAB_ICONS = {
  all:        '⊞',
  consonant:  'ক',
  vowel:      'অ',
  vowel_sign: '◌া',
  digit:      '১',
  mark:       '◌্',
  sign:       '◌ঁ',
}

export default function ScriptExplorer() {
  const [filter, setFilter]     = useState('all')
  const [query, setQuery]       = useState('')
  const [selected, setSelected] = useState(null)

  const filteredByTab = useMemo(() =>
    filter === 'all' ? alphabetData : alphabetData.filter(c => c.category === filter),
    [filter]
  )

  const counts = useMemo(() => {
    const m = {}
    for (const f of FILTERS) {
      m[f] = f === 'all' ? alphabetData.length : alphabetData.filter(c => c.category === f).length
    }
    return m
  }, [])

  function handleTabClick(f) {
    setFilter(f)
    setQuery('')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Script Explorer</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Browse all {alphabetData.length} characters in the Chakma alphabet with pronunciation and examples
        </p>
      </div>

      {/* Search + Tabs card */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm mb-6 overflow-hidden">

        {/* Search row */}
        <div className="px-4 pt-4 pb-3">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* Tabs */}
        <div className="relative">
          {/* Bottom border baseline */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gray-100 dark:bg-slate-700" />

          <div className="flex overflow-x-auto scrollbar-none px-4 gap-1">
            {FILTERS.filter(f => counts[f] > 0).map(f => {
              const active = filter === f && !query
              return (
                <button
                  key={f}
                  onClick={() => handleTabClick(f)}
                  className={`
                    relative flex items-center gap-1.5 px-3 py-3
                    text-xs font-medium whitespace-nowrap
                    cursor-pointer
                    transition-colors duration-150
                    border-b-2
                    ${active
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <span className="opacity-60 text-[11px]">{TAB_ICONS[f]}</span>
                  {FILTER_LABELS[f]}
                  <span className={`
                    inline-flex items-center justify-center
                    min-w-[18px] h-[18px] px-1
                    rounded-full text-[10px] font-semibold
                    ${active
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-gray-500'
                    }
                  `}>
                    {counts[f]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Search result hint */}
      {query && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 px-1">
          Searching <span className="font-mono bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{query}</span>
          {' '}across {filter === 'all' ? 'all categories' : FILTER_LABELS[filter]}
        </p>
      )}

      {/* Grid */}
      <AlphabetGrid
        chars={filteredByTab}
        query={query}
        selectedChar={selected}
        onSelect={setSelected}
      />

      <CharacterModal char={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
