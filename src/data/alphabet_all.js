// Full Chakma alphabet for AlphabetPractice — all categories.
// `label` is what shows alongside the Chakma char in the practice grid.
import { ALPHABET as VOWELS_CONSONANTS } from './alphabet_bengali'

const VOWEL_SIGNS = [
  { char: '𑄧', codepoint: 'U+11127', category: 'vowel_sign', romanization: 'ə',  ipa: '/ə/',  label: 'া',  note: 'schwa (short a)' },
  { char: '𑄨', codepoint: 'U+11128', category: 'vowel_sign', romanization: 'i',  ipa: '/i/',  label: 'ি',  note: 'short i' },
  { char: '𑄩', codepoint: 'U+11129', category: 'vowel_sign', romanization: 'ī',  ipa: '/iː/', label: 'ী',  note: 'long ī' },
  { char: '𑄪', codepoint: 'U+1112A', category: 'vowel_sign', romanization: 'u',  ipa: '/u/',  label: 'ু',  note: 'short u' },
  { char: '𑄫', codepoint: 'U+1112B', category: 'vowel_sign', romanization: 'ū',  ipa: '/uː/', label: 'ূ',  note: 'long ū' },
  { char: '𑄬', codepoint: 'U+1112C', category: 'vowel_sign', romanization: 'e',  ipa: '/e/',  label: 'ে',  note: 'e' },
  { char: '𑄭', codepoint: 'U+1112D', category: 'vowel_sign', romanization: 'ai', ipa: '/ai/', label: 'ৈ',  note: 'ai' },
  { char: '𑄮', codepoint: 'U+1112E', category: 'vowel_sign', romanization: 'o',  ipa: '/o/',  label: 'ো',  note: 'o' },
  { char: '𑄯', codepoint: 'U+1112F', category: 'vowel_sign', romanization: 'au', ipa: '/au/', label: 'ৌ',  note: 'au' },
  { char: '𑄰', codepoint: 'U+11130', category: 'vowel_sign', romanization: 'oi', ipa: '/oi/', label: 'oi', note: 'oi (no Bengali equiv.)' },
  { char: '𑅅', codepoint: 'U+11145', category: 'vowel_sign', romanization: 'ā',  ipa: '/aː/', label: 'ā',  note: 'long ā (rare)' },
  { char: '𑅆', codepoint: 'U+11146', category: 'vowel_sign', romanization: 'ei', ipa: '/ei/', label: 'ei', note: 'ei' },
]

const SIGNS = [
  { char: '𑄀', codepoint: 'U+11100', category: 'sign', romanization: '~',   ipa: '◌̃',  label: 'ঁ',  note: 'candrabindu – nasalization' },
  { char: '𑄁', codepoint: 'U+11101', category: 'sign', romanization: 'ṁ',   ipa: '◌̃',  label: 'ং',  note: 'anusvara – nasal' },
  { char: '𑄂', codepoint: 'U+11102', category: 'sign', romanization: 'ḥ',   ipa: '◌ʰ', label: 'ঃ',  note: 'visarga – aspiration' },
]

const DIGITS = [
  { char: '𑄶', codepoint: 'U+11136', category: 'digit', romanization: '0', ipa: '0', label: '০', note: 'zero' },
  { char: '𑄷', codepoint: 'U+11137', category: 'digit', romanization: '1', ipa: '1', label: '১', note: 'one' },
  { char: '𑄸', codepoint: 'U+11138', category: 'digit', romanization: '2', ipa: '2', label: '২', note: 'two' },
  { char: '𑄹', codepoint: 'U+11139', category: 'digit', romanization: '3', ipa: '3', label: '৩', note: 'three' },
  { char: '𑄺', codepoint: 'U+1113A', category: 'digit', romanization: '4', ipa: '4', label: '৪', note: 'four' },
  { char: '𑄻', codepoint: 'U+1113B', category: 'digit', romanization: '5', ipa: '5', label: '৫', note: 'five' },
  { char: '𑄼', codepoint: 'U+1113C', category: 'digit', romanization: '6', ipa: '6', label: '৬', note: 'six' },
  { char: '𑄽', codepoint: 'U+1113D', category: 'digit', romanization: '7', ipa: '7', label: '৭', note: 'seven' },
  { char: '𑄾', codepoint: 'U+1113E', category: 'digit', romanization: '8', ipa: '8', label: '৮', note: 'eight' },
  { char: '𑄿', codepoint: 'U+1113F', category: 'digit', romanization: '9', ipa: '9', label: '৯', note: 'nine' },
]

// Add `label` fallback for vowels/consonants (they use bengali_label)
const BASE = VOWELS_CONSONANTS.map(a => ({ ...a, label: a.bengali_label }))

export const ALPHABET_ALL = [...BASE, ...VOWEL_SIGNS, ...SIGNS, ...DIGITS]
