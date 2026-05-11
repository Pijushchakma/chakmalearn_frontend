import { useState, useCallback } from 'react'
import { toChakma, codepoints } from '../utils/transliterator'
import ChakmaText from '../components/ChakmaText'

const EXAMPLES = [
  { roman: 'chakma',    meaning: 'Chakma' },
  { roman: 'phul',      meaning: 'flower' },
  { roman: 'Tui bhari dol', meaning: 'You are very beautiful' },
  { roman: 'Mui gom agong', meaning: 'I am fine' },
  { roman: 'nangaan',   meaning: 'name' },
  { roman: 'ghora',     meaning: 'house' },
]

const REFERENCE = [
  {
    title: 'Vowels (after consonant → sign; alone → letter)',
    rows: [
      ['a', '𑄧', 'schwa /ə/'], ['aa / A', '—', 'inherent AA'],
      ['i', '𑄨', '/i/'], ['ii / I', '𑄩', 'long ī'],
      ['u', '𑄪', '/u/'], ['uu / U', '𑄫', 'long ū'],
      ['e', '𑄬', '/e/'], ['o', '𑄮', '/o/'],
      ['ai / E', '𑄭', 'ai'], ['au / O', '𑄯', 'au'],
    ],
  },
  {
    title: 'Case rules (dental vs retroflex)',
    rows: [
      ['T', '𑄖', 'dental t (ত)'],  ['t / tt', '𑄑', 'retroflex ṭ'],
      ['Th', '𑄗', 'dental th'],     ['th / tth', '𑄒', 'retroflex ṭh'],
      ['D', '𑄘', 'dental d (দ)'],  ['d / dd', '𑄓', 'retroflex ḍ'],
      ['Dh', '𑄙', 'dental dh'],    ['dh / ddh', '𑄔', 'retroflex ḍh'],
      ['N', '𑄕', 'retroflex ṇ'],   ['n', '𑄚', 'dental n'],
    ],
  },
  {
    title: 'Common consonants',
    rows: [
      ['k', '𑄇', 'ka'], ['kh', '𑄈', 'kha'], ['g', '𑄉', 'ga'], ['gh', '𑄊', 'gha'],
      ['c', '𑄌', 'ca (unaspirated)'], ['ch', '𑄍', 'cha (aspirated)'],
      ['j', '𑄎', 'ja'], ['jh', '𑄏', 'jha'], ['p', '𑄛', 'pa'], ['ph', '𑄜', 'pha'],
      ['b', '𑄝', 'ba'], ['bh', '𑄞', 'bha'], ['m', '𑄟', 'ma'], ['y', '𑄡', 'ya'],
      ['r', '𑄢', 'ra'], ['l', '𑄣', 'la'], ['w', '𑄤', 'wa'], ['h', '𑄦', 'ha'],
      ['s / S / sh', '𑄥', 'sa/sha'], ['ng', '𑄋', 'nga (ঙ)'], ['NG', '𑄁', 'anusvara (ং)'],
      ['ny', '𑄐', 'nya'], ['v', '𑅇', 'va'],
    ],
  },
  {
    title: 'Clusters & special',
    rows: [
      ['C + C', '𑄳', 'VIRAMA auto-inserted between consonants'],
      ['e.g. kma', '𑄇𑄳𑄟𑄧', 'k + VIRAMA + m + a'],
    ],
  },
]

export default function Transliterator() {
  const [input, setInput]       = useState('')
  const [showCp, setShowCp]     = useState(false)
  const [copied, setCopied]     = useState(false)

  const output = toChakma(input)
  const cp     = output ? codepoints(output) : ''

  function handleExample(roman) {
    setInput(roman)
  }

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [output])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Transliterator</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Type Chakma words using English letters below and see them converted to the Chakma script instantly.
        </p>
      </div>

      {/* Examples */}
      <div className="flex flex-wrap gap-2 mb-5">
        {EXAMPLES.map(ex => (
          <button
            key={ex.roman}
            onClick={() => handleExample(ex.roman)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
          >
            {ex.roman}
            <span className="ml-1.5 text-indigo-400 dark:text-indigo-500">{ex.meaning}</span>
          </button>
        ))}
      </div>

      {/* Main conversion area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Input */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Type in English letters
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. chakma, phul, mui gom agong…"
            autoFocus
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none font-mono"
          />
          {input && (
            <button
              onClick={() => setInput('')}
              className="mt-2 self-end text-xs text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Chakma script
            </label>
            {output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCp(s => !s)}
                  className="text-xs text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {showCp ? 'hide' : 'codepoints'}
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[9rem] px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 flex flex-col justify-center">
            {output ? (
              <>
                <ChakmaText size="xl" className="leading-relaxed break-all">
                  {output}
                </ChakmaText>
                {showCp && (
                  <p className="mt-3 text-xs font-mono text-gray-400 dark:text-gray-600 break-all leading-relaxed">
                    {cp}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-300 dark:text-gray-700 italic">Output appears here…</p>
            )}
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <button
          className="w-full px-5 py-3.5 flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={() => document.getElementById('ref-body').classList.toggle('hidden')}
        >
          <span>Quick Reference</span>
          <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">click to toggle</span>
        </button>
        <div id="ref-body" className="hidden">
          <div className="border-t border-gray-100 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-700">
            {REFERENCE.map(section => (
              <div key={section.title} className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {section.title}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                  {section.rows.map(([roman, chakma, note]) => (
                    <div key={roman} className="flex items-baseline gap-2">
                      <code className="text-xs font-mono bg-gray-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded shrink-0">
                        {roman}
                      </code>
                      <ChakmaText size="base" className="shrink-0">{chakma}</ChakmaText>
                      {note && (
                        <span className="text-xs text-gray-400 dark:text-gray-600 truncate">{note}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
