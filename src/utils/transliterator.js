// Romanized Chakma → Native Chakma Unicode (Ajhā Pāṭh)
// Avro/Ridmik-style keyboard — greedy left-to-right match

// prettier-ignore
const CONSONANT_MAP = [
  // 3-char (must come first)
  ['tth', '\u{11112}'], // 𑄒 TTHAA  retroflex aspirate
  ['ddh', '\u{11114}'], // 𑄔 DDHAA  retroflex aspirate
  // 2-char
  ['kh',  '\u{11108}'], // 𑄈 KHAA
  ['gh',  '\u{1110A}'], // 𑄊 GHAA
  ['NG',  '\u{11101}'], // 𑄁 ANUSVARA (anunaasika)
  ['ng',  '\u{1110B}'], // 𑄋 NGAA
  ['ch',  '\u{1110D}'], // 𑄍 CHAA  aspirated
  ['jh',  '\u{1110F}'], // 𑄏 JHAA
  ['ny',  '\u{11110}'], // 𑄐 NYAA
  ['tt',  '\u{11111}'], // 𑄑 TTAA  retroflex (double t)
  ['dd',  '\u{11113}'], // 𑄓 DDAA  retroflex (double d)
  ['nn',  '\u{11115}'], // 𑄕 NNAA  retroflex n
  ['Th',  '\u{11117}'], // 𑄗 THAA  dental aspirate
  ['th',  '\u{11112}'], // 𑄒 TTHAA retroflex aspirate
  ['Dh',  '\u{11119}'], // 𑄙 DHAA  dental aspirate
  ['dh',  '\u{11114}'], // 𑄔 DDHAA retroflex aspirate
  ['ph',  '\u{1111C}'], // 𑄜 PHAA
  ['bh',  '\u{1111E}'], // 𑄞 BHAA
  ['yy',  '\u{11120}'], // 𑄠 YYAA
  ['lh',  '\u{11144}'], // 𑅄 LHA
  ['sh',  '\u{11125}'], // 𑄥 SAA  (sh=শ)
  // 1-char
  ['k',   '\u{11107}'], // 𑄇 KAA
  ['g',   '\u{11109}'], // 𑄉 GAA
  ['c',   '\u{1110C}'], // 𑄌 CAA   unaspirated
  ['j',   '\u{1110E}'], // 𑄎 JAA
  ['t',   '\u{11111}'], // 𑄑 TTAA  retroflex
  ['T',   '\u{11116}'], // 𑄖 TAA   dental
  ['d',   '\u{11113}'], // 𑄓 DDAA  retroflex
  ['D',   '\u{11118}'], // 𑄘 DAA   dental
  ['N',   '\u{11115}'], // 𑄕 NNAA  retroflex n
  ['n',   '\u{1111A}'], // 𑄚 NAA   dental n
  ['p',   '\u{1111B}'], // 𑄛 PAA
  ['b',   '\u{1111D}'], // 𑄝 BAA
  ['M',   '\u{1111F}'], // 𑄟 MAA   (sentence-initial capital)
  ['m',   '\u{1111F}'], // 𑄟 MAA
  ['y',   '\u{11121}'], // 𑄡 YAA
  ['r',   '\u{11122}'], // 𑄢 RAA
  ['l',   '\u{11123}'], // 𑄣 LAA
  ['w',   '\u{11124}'], // 𑄤 WAA
  ['v',   '\u{11147}'], // 𑅇 VA
  ['S',   '\u{11125}'], // 𑄥 SAA   (S=শ Avro-style)
  ['s',   '\u{11125}'], // 𑄥 SAA
  ['H',   '\u{11126}'], // 𑄦 HAA   (sentence-initial capital)
  ['h',   '\u{11126}'], // 𑄦 HAA
]

// prettier-ignore
const VOWEL_SIGN_MAP = [
  ['aa', ''],            // inherent AA — nothing to add
  ['ii', '\u{11129}'],  // 𑄩 long ī
  ['uu', '\u{1112B}'],  // 𑄫 long ū
  ['ai', '\u{1112D}'],  // 𑄭 ai
  ['oi', '\u{11130}'],  // 𑄰 oi
  ['au', '\u{1112F}'],  // 𑄯 au
  ['ei', '\u{11146}'],  // 𑅆 ei
  ['A',  ''],            // long AA = inherent
  ['I',  '\u{11129}'],  // long ī
  ['U',  '\u{1112B}'],  // long ū
  ['E',  '\u{1112D}'],  // ai
  ['O',  '\u{1112F}'],  // au
  ['a',  '\u{11127}'],  // 𑄧 schwa /ə/
  ['i',  '\u{11128}'],  // 𑄨 i
  ['u',  '\u{1112A}'],  // 𑄪 u
  ['e',  '\u{1112C}'],  // 𑄬 e
  ['o',  '\u{1112E}'],  // 𑄮 o
]

// prettier-ignore
const INDEP_VOWEL_MAP = [
  ['aa', '\u{11103}'],  // 𑄃
  ['ii', '\u{11104}'],  // 𑄄
  ['uu', '\u{11105}'],  // 𑄅
  ['ai', '\u{11106}'],  // 𑄆
  ['A',  '\u{11103}'],
  ['I',  '\u{11104}'],
  ['U',  '\u{11105}'],
  ['E',  '\u{11106}'],
  ['a',  '\u{11103}'],  // 𑄃
  ['i',  '\u{11104}'],  // 𑄄
  ['u',  '\u{11105}'],  // 𑄅
  ['e',  '\u{11106}'],  // 𑄆
]

const VIRAMA = '\u{11133}'  // 𑄳 kills inherent vowel (consonant cluster joiner)

function matchFirst(text, mapping) {
  for (const [roman, chakma] of mapping) {
    if (text.startsWith(roman)) return [roman, chakma]
  }
  return [null, null]
}

export function toChakma(roman) {
  const result = []
  let i = 0
  let afterConsonant = false

  while (i < roman.length) {
    const rest = roman.slice(i)

    // 1. Try consonant
    const [cRom, cUni] = matchFirst(rest, CONSONANT_MAP)
    if (cUni !== null) {
      if (afterConsonant) result.push(VIRAMA)
      result.push(cUni)
      i += cRom.length
      afterConsonant = true
      continue
    }

    // 2. Try vowel
    const vowelMap = afterConsonant ? VOWEL_SIGN_MAP : INDEP_VOWEL_MAP
    const [vRom, vUni] = matchFirst(rest, vowelMap)
    if (vUni !== null) {
      if (vUni) result.push(vUni)  // empty string = inherent AA, skip
      i += vRom.length
      afterConsonant = false
      continue
    }

    // 3. Pass through (space, punctuation, digits, unrecognised)
    result.push(roman[i])
    i++
    afterConsonant = false
  }

  return result.join('')
}

export function codepoints(str) {
  return [...str]
    .filter(c => c !== ' ')
    .map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(5, '0')}`)
    .join(' ')
}
