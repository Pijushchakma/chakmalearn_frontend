import { ALPHABET_ALL } from './alphabet_all'

const _by_cp = Object.fromEntries(ALPHABET_ALL.map(a => [a.codepoint, a]))

export const MODULES = [
  {
    id: 'vowels',
    name: 'Vowels',
    description: 'a · i · u · e — the four independent vowels',
    color: 'indigo',
    codepoints: ['U+11103', 'U+11104', 'U+11105', 'U+11106'],
  },
  {
    id: 'stops',
    name: 'Stops & Affricates',
    description: 'k kh g gh ng · c ch j jh ny',
    color: 'violet',
    codepoints: [
      'U+11107', 'U+11108', 'U+11109', 'U+1110A', 'U+1110B',
      'U+1110C', 'U+1110D', 'U+1110E', 'U+1110F', 'U+11110',
    ],
  },
  {
    id: 'retroflex_dental',
    name: 'Retroflex & Dental',
    description: 'ṭ ṭh ḍ ḍh ṇ · t th d dh n',
    color: 'blue',
    codepoints: [
      'U+11111', 'U+11112', 'U+11113', 'U+11114', 'U+11115',
      'U+11116', 'U+11117', 'U+11118', 'U+11119', 'U+1111A',
    ],
  },
  {
    id: 'labials',
    name: 'Labials & Approximants',
    description: 'p ph b bh m · yy y r l w s h lh v',
    color: 'emerald',
    codepoints: [
      'U+1111B', 'U+1111C', 'U+1111D', 'U+1111E', 'U+1111F',
      'U+11120', 'U+11121', 'U+11122', 'U+11123', 'U+11124',
      'U+11125', 'U+11126', 'U+11144', 'U+11147',
    ],
  },
  {
    id: 'digits',
    name: 'Digits',
    description: '0 through 9 in Chakma script',
    color: 'amber',
    codepoints: [
      'U+11136', 'U+11137', 'U+11138', 'U+11139', 'U+1113A',
      'U+1113B', 'U+1113C', 'U+1113D', 'U+1113E', 'U+1113F',
    ],
  },
]

export const MODULES_WITH_DATA = MODULES.map(mod => ({
  ...mod,
  chars: mod.codepoints.map(cp => _by_cp[cp]).filter(Boolean),
}))
