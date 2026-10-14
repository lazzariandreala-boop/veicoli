// Lettura dei campi della carta di circolazione italiana (libretto) dal
// testo OCR. I campi sono identificati dai codici armonizzati UE stampati
// sul documento: (A), (B), (C.2.1), (D.1) ... (V.9).
// Il modulo è puro (nessuna dipendenza dal browser) per poterlo testare in Node.

export interface LibrettoData {
  targa?: string
  numeroCarta?: string            // es. DG 0549048
  numeroArchivio?: string         // N° stampato in alto, es. M020903VI26
  dataPrimaImmatricolazione?: string // (B) ISO yyyy-mm-dd
  dataImmatricolazione?: string   // (I) ISO
  intestatarioCognome?: string    // (C.2.1)
  intestatarioNome?: string       // (C.2.2)
  intestatarioNascita?: string    // "nato il ... a ..."
  codiceFiscale?: string
  indirizzo?: string              // (C.2.3)
  marca?: string                  // (D.1)
  tipo?: string                   // (D.2) tipo/variante/versione
  modello?: string                // (D.3) denominazione commerciale
  telaio?: string                 // (E) VIN
  massaMaxTecnica?: number        // (F.1) kg
  massaMax?: number               // (F.2) kg
  massaComplesso?: number         // (F.3) kg
  massaInServizio?: number        // (G) kg
  categoria?: string              // (J) es. M1, L3e
  usoDestinazione?: string        // (J.1)
  carrozzeria?: string            // (J.2)
  omologazione?: string           // (K)
  assi?: number                   // (L)
  massaRimorchiabileFrenata?: number // (O.1)
  massaRimorchiabileNonFrenata?: number // (O.2)
  cilindrata?: number             // (P.1) cm³
  potenzaKw?: number              // (P.2)
  alimentazione?: string          // (P.3) normalizzata
  codiceMotore?: string           // (P.5)
  rapportoPotenzaPeso?: number    // (Q) kW/kg
  posti?: number                  // (S.1)
  postiInPiedi?: number           // (S.2)
  livelloSonoro?: number          // (U.1) dB(A)
  regimeGiri?: number             // (U.2) min-1
  co2?: number                    // (V.7) g/km
  direttivaAmbientale?: string    // (V.9)
  classeEuro?: string             // es. EURO 5+
  costruttore?: string
  lunghezza?: number              // m
  larghezza?: number              // m
  altezza?: number                // m
  cambio?: string
  pneumatici?: string
  progressivoPra?: string
  tipoVeicolo?: VehicleKind
}

export type VehicleKind = 'auto' | 'moto' | 'ciclomotore' | 'furgone' | 'camper' | 'rimorchio' | 'altro'

type Label =
  | 'A' | 'B' | 'C.2.1' | 'C.2.2' | 'C.2.3' | 'D.1' | 'D.2' | 'D.3' | 'E'
  | 'F.1' | 'F.2' | 'F.3' | 'G' | 'I' | 'J' | 'J.1' | 'J.2' | 'K' | 'L'
  | 'O.1' | 'O.2' | 'P.1' | 'P.2' | 'P.3' | 'P.5' | 'Q' | 'S.1' | 'S.2'
  | 'U.1' | 'U.2' | 'V.7' | 'V.9' | string

// Etichette con sotto-indice e senza, come compaiono sul documento.
const NO_SUB = new Set(['A', 'B', 'E', 'G', 'I', 'J', 'K', 'L', 'Q'])

// Lettere che l'OCR confonde con cifre o simboli, per l'iniziale dell'etichetta.
function labelLetterCandidates(ch: string): string[] {
  const c = ch.toUpperCase()
  const map: Record<string, string[]> = {
    '0': ['O', 'Q', 'D'], O: ['O', 'Q', 'D'], D: ['D', 'O'], Q: ['Q', 'O'],
    '5': ['S', 'J'], S: ['S', 'J'], $: ['S', 'J'], '3': ['J', 'S'], J: ['J'],
    '8': ['S', 'B'], B: ['B'], '1': ['I', 'J'], L: ['L', 'I'], '|': ['I'], I: ['I', 'J'],
    '4': ['A'], A: ['A'], '6': ['G'], G: ['G'], W: ['V'], Y: ['V'], V: ['V'],
    U: ['U'], P: ['P'], F: ['F'], E: ['E'], K: ['K'], C: ['C'], N: ['N'], H: ['N'], R: ['P'],
  }
  return map[c] ?? [c]
}

interface Token { label: Label; value: string; line: number; next: string }

const LABEL_RE = /[(\[{]\s*([A-Za-z0-9$|])\s*(?:[.,:]\s*([0-9Il|]))?\s*(?:[.,:]\s*([0-9Il|]))?\s*[)\]}]/g

function fixDigit(d?: string) {
  if (!d) return d
  return d.replace(/[Il|]/g, '1')
}

function resolveLabel(ch: string, sub?: string, sub2?: string, value = ''): Label | null {
  sub = fixDigit(sub)
  sub2 = fixDigit(sub2)
  const lettersInValue = (value.match(/[A-Z]/gi) ?? []).length
  for (const L of labelLetterCandidates(ch)) {
    if (sub2) {
      if (L === 'C' && sub === '2') return `C.2.${sub2}`
      continue
    }
    if (!sub) {
      if (NO_SUB.has(L)) {
        // '0' / 'O' senza sotto-indice è (Q); 'D' senza sotto-indice non esiste
        return L
      }
      continue
    }
    // con sotto-indice
    if (L === 'J' || L === 'S') {
      if (sub === '1' || sub === '2') {
        // J.1 / J.2 hanno testo (uso, carrozzeria); S.1 / S.2 sono numeri
        if (ch.toUpperCase() === 'J') return `J.${sub}`
        return lettersInValue >= 3 ? `J.${sub}` : `S.${sub}`
      }
      continue
    }
    if (L === 'D' || L === 'O') {
      if (ch.toUpperCase() === 'D' && ['1', '2', '3'].includes(sub)) return `D.${sub}`
      if (['1', '2', '3'].includes(sub) && lettersInValue >= 2 && !/^\s*$/.test(value)) {
        if (sub === '3' || lettersInValue >= 2) return `D.${sub}`
      }
      if (sub === '1' || sub === '2') return `O.${sub}`
      if (sub === '3') return 'D.3'
      continue
    }
    if (['F', 'N', 'P', 'U', 'V'].includes(L)) return `${L}.${sub}`
    if (L === 'C') return `C.${sub}`
  }
  return null
}

function tokenize(text: string): Token[] {
  const lines = text.split(/\r?\n/)
  const tokens: Token[] = []
  lines.forEach((raw, li) => {
    const line = raw
    const matches = [...line.matchAll(LABEL_RE)]
    matches.forEach((m, i) => {
      const start = (m.index ?? 0) + m[0].length
      const end = i + 1 < matches.length ? (matches[i + 1].index ?? line.length) : line.length
      // tre o più spazi separano di solito le due colonne del documento
      const value = line.slice(start, end).replace(/^\s+/, '').split(/\s{3,}/)[0]
      const label = resolveLabel(m[1], m[2], m[3], value)
      if (!label) return
      tokens.push({ label, value: cleanValue(value), line: li, next: lines[li + 1] ?? '' })
    })
  })
  return tokens
}

function cleanValue(v: string) {
  return v
    .replace(/[|!‘’`“”"_]+/g, ' ')
    .replace(/\s{3,}.*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstSegment(line: string) {
  // testo della riga prima di un'eventuale etichetta o del salto di colonna
  const idx = line.search(/[(\[{]\s*[A-Za-z0-9]\s*[.,)\]}]/)
  const seg = idx >= 0 ? line.slice(0, idx) : line
  return seg.split(/\s{3,}/).map(cleanValue).find(Boolean) ?? ''
}

// --- normalizzazioni ---------------------------------------------------

const toDigit: Record<string, string> = { O: '0', Q: '0', D: '0', I: '1', L: '1', '|': '1', Z: '2', S: '5', B: '8', G: '6', T: '7', A: '4' }
const toLetter: Record<string, string> = { '0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B', '6': 'G', '7': 'T', '4': 'A' }

function digits(s: string) { return s.split('').map((c) => toDigit[c] ?? c).join('') }
function letters(s: string) { return s.split('').map((c) => toLetter[c] ?? c).join('') }

export function parseDate(s?: string): string | undefined {
  if (!s) return
  const m = digits(s.toUpperCase().replace(/\s/g, '')).match(/(\d{1,2})[.\-/,](\d{1,2})[.\-/,](\d{4})/)
  if (!m) return
  const [, d, mo, y] = m
  const dd = Number(d), mm = Number(mo), yy = Number(y)
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yy < 1900 || yy > 2100) return
  return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
}

function parseNumber(s?: string): number | undefined {
  if (!s) return
  const m = digits(s.toUpperCase()).match(/\d+(?:[.,]\d+)?/)
  if (!m) return
  const n = Number(m[0].replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

// Formati targa italiani noti, con le posizioni lettera (L) / cifra (D)
const PLATE_PATTERNS: { re: RegExp; shape: string }[] = [
  { re: /^[A-Z0-9]{2}[A-Z0-9]{3}[A-Z0-9]{2}$/, shape: 'LLDDDLL' }, // auto dal 1994: AB123CD
  { re: /^[A-Z0-9]{2}[A-Z0-9]{5}$/, shape: 'LLDDDDD' },              // moto dal 1999: AB12345
  { re: /^[A-Z0-9]{6}$/, shape: 'LDLLLL' },                           // ciclomotori: X2B3CD (variabile)
]

export function normalizePlate(raw: string): string {
  let s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (s.length === 7) {
    // decidi auto o moto guardando le posizioni 5-6
    const autoScore = [5, 6].filter((i) => /[A-Z]/.test(s[i])).length
    const shape = autoScore >= 1 && !/^\d+$/.test(s.slice(5)) ? 'LLDDDLL' : 'LLDDDDD'
    s = s.split('').map((c, i) => (shape[i] === 'L' ? letters(c) : digits(c))).join('')
  }
  return s
}

export function plateKind(plate: string): 'auto' | 'moto' | 'ciclomotore' | 'storica' | 'altro' {
  const s = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(s)) return 'auto'
  if (/^[A-Z]{2}\d{5}$/.test(s)) return 'moto'
  if (/^[A-Z0-9]{5,6}$/.test(s) && /\d/.test(s) && /[A-Z]/.test(s) && s.length === 6) return 'ciclomotore'
  if (/^(ROMA|[A-Z]{2})[0-9A-Z]{4,7}$/.test(s)) return 'storica'
  return 'altro'
}

function pickMostFrequent(values: string[]): string | undefined {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

function normalizeFuel(s: string): string | undefined {
  const u = s.toUpperCase()
  if (/ELETT|ELECTR|^EL\b/.test(u) && !/BENZ|GAS|IBR/.test(u)) return 'Elettrica'
  if (/IBR|HYB/.test(u)) return 'Ibrida'
  if (/GPL|LPG/.test(u)) return 'Benzina/GPL'
  if (/MET|CNG/.test(u)) return 'Benzina/Metano'
  if (/GASOL|DIES/.test(u)) return 'Diesel'
  if (/BENZ|PETR/.test(u)) return 'Benzina'
  return undefined
}

function fixVin(s: string) {
  const v = s.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/[IL](?=\d)/g, '1').replace(/Q/g, '0')
  return v.length >= 11 ? v.slice(0, 17) : undefined
}

function fixCf(s: string) {
  const raw = s.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (raw.length !== 16) return undefined
  const shape = 'LLLLLLDDLDDLDDDL'
  return raw.split('').map((c, i) => (shape[i] === 'L' ? letters(c) : digits(c))).join('')
}

export function kindFromCategory(cat?: string, uso?: string, carrozzeria?: string): VehicleKind | undefined {
  const c = (cat ?? '').toUpperCase()
  const u = `${uso ?? ''} ${carrozzeria ?? ''}`.toUpperCase()
  if (/CICLOMOTORE/.test(u) || /^L[12]E/.test(c)) return 'ciclomotore'
  if (/MOTOCICLO|MOTOVEICOLO|QUADRICICLO/.test(u) || /^L[3-7]E?/.test(c)) return 'moto'
  if (/CARAVAN|CAMPER|AUTOCARAVAN/.test(u)) return 'camper'
  if (/RIMORCHIO/.test(u) || /^O[1-4]/.test(c)) return 'rimorchio'
  if (/AUTOCARRO|FURGONE/.test(u) || /^N[1-3]/.test(c)) return 'furgone'
  if (/AUTOVETTURA|AUTOVEICOLO/.test(u) || /^M1/.test(c)) return 'auto'
  return undefined
}

// --- parser principale -------------------------------------------------

export function parseLibretto(text: string): LibrettoData {
  const out: LibrettoData = {}
  const upper = text.toUpperCase()
  const tokens = tokenize(upper)
  const get = (l: Label) => tokens.filter((t) => t.label === l)
  const val = (l: Label) => get(l).map((t) => t.value).find((v) => v.length > 0)

  // Targa: compare (A) su ogni pagina; si sceglie la lettura più frequente
  const plates = get('A').map((t) => normalizePlate(t.value.split(' ')[0] + (t.value.split(' ')[1] && t.value.split(' ')[0].length < 4 ? t.value.split(' ')[1] : '')))
    .filter((p) => p.length >= 5 && p.length <= 9)
  const plateFromLine = [...upper.matchAll(/\(A\)\s*[-—–\s|]*([A-Z0-9]{2}\s?[A-Z0-9]{3,6})/g)].map((m) => normalizePlate(m[1]))
  // la targa è stampata anche accanto al N° di archivio in testa a ogni pagina
  const plateNearArchive = upper.split('\n')
    .filter((l) => /M[O0]\d{5,6}[A-Z0-9]{2,4}/.test(l))
    .flatMap((l) => [...l.replace(/M[O0]\d{5,6}[A-Z0-9]{2,4}/g, ' ').matchAll(/(?:^|[^A-Z0-9])([A-Z0-9]{2}\s?[A-Z0-9]{5})(?=$|[^A-Z0-9])/g)].map((m) => normalizePlate(m[1])))
    .filter((p) => /^[A-Z]{2}(\d{5}|\d{3}[A-Z]{2})$/.test(p))
  out.targa = pickMostFrequent([...plates, ...plateFromLine, ...plateNearArchive].filter((p) => /^[A-Z]{2}(\d{5}|\d{3}[A-Z]{2})$/.test(p)))
    ?? pickMostFrequent([...plates, ...plateFromLine])

  const archivio = [...upper.matchAll(/\b(M[O0]\d{5,6}[A-Z0-9]{2,4})\b/g)].map((m) => 'M0' + m[1].slice(2).replace(/O/g, '0'))
  out.numeroArchivio = pickMostFrequent(archivio)
  const carta = upper.match(/\b([A-Z]{2})\s?([0-9OQ]{7})\b/g)
    ?.map((s) => s.replace(/\s/g, ''))
    .find((s) => /^[A-Z]{2}[0-9OQ]{7}$/.test(s) && !s.startsWith('MO'))
  if (carta) out.numeroCarta = `${carta.slice(0, 2)} ${digits(carta.slice(2))}`

  out.dataPrimaImmatricolazione = parseDate(val('B'))
  out.dataImmatricolazione = parseDate(val('I'))

  out.intestatarioCognome = val('C.2.1')?.replace(/[^A-ZÀ-Ü' .-]/g, '').trim() || undefined
  out.intestatarioNome = val('C.2.2')?.replace(/[^A-ZÀ-Ü' .-]/g, '').trim() || undefined

  const cfm = upper.replace(/\s/g, '').match(/[A-Z0-9]{6}[0-9OILSZB]{2}[A-Z][0-9OILSZB]{2}[A-Z][0-9OILSZB]{3}[A-Z]/g)
  const cf = cfm?.map(fixCf).find((c) => c && /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(c))
  if (cf) out.codiceFiscale = cf
  const nato = upper.match(/NAT[OA]\s+IL\s+([0-9OIL]{1,2}[.\-/][0-9OIL]{1,2}[.\-/][0-9OIL]{4})[\s\S]{0,40}?\n?\s*A\s+([A-ZÀ-Ü' ]+?\s*\([A-Z]{2}\))/)
  if (nato) out.intestatarioNascita = `${parseDate(nato[1])?.split('-').reverse().join('/') ?? nato[1]} a ${cleanValue(nato[2])}`

  const addrTok = get('C.2.3').find((t) => t.value)
  if (addrTok) {
    // la riga successiva contiene di solito "CITTÀ (PR)", eventualmente preceduta da sporco OCR
    const nextBeforeLabel = addrTok.next.split(/[(\[{]\s*[A-Z0-9]\s*[.,]\s*\d?\s*[)\]}]/)[0]
    const city = nextBeforeLabel.match(/(\d{5}\s+)?([A-ZÀ-Ü][A-ZÀ-Ü' ]{1,40}?)\s*[({\[]([A-Z]{2})[)}\]]/)
    out.indirizzo = city ? `${addrTok.value}, ${(city[1] ?? '') + city[2].trim()} (${city[3]})` : addrTok.value
  }

  out.marca = val('D.1')?.replace(/(\s[A-Z0-9|])+$/, '')
  out.tipo = val('D.2')
  out.modello = val('D.3')
  const vinRaw = val('E')
  out.telaio = vinRaw ? fixVin(vinRaw) : undefined

  out.massaMaxTecnica = parseNumber(val('F.1'))
  out.massaMax = parseNumber(val('F.2'))
  out.massaComplesso = parseNumber(val('F.3'))
  out.massaInServizio = parseNumber(val('G'))

  const cat = val('J')?.match(/[A-Z0-9]{1,2}[0-9]?[A-Z]?/i)?.[0]
  if (cat) out.categoria = cat.replace(/^([LMNO])([0-9])E$/i, '$1$2e').replace(/^1L/, 'L')
  const usoTok = get('J.1').find((t) => t.value)
  if (usoTok) {
    const cont = firstSegment(usoTok.next)
    out.usoDestinazione = /^(PERSONE|COSE|USO|PROPRIO|TERZI|SPECIALE|-)/.test(cont) ? `${usoTok.value} ${cont}` : usoTok.value
    out.usoDestinazione = out.usoDestinazione.replace(/\s*-\s*/g, ' - ').replace(/\s+/g, ' ')
  }
  const carr = val('J.2')
  if (carr) out.carrozzeria = carr.replace(/^M[O0]\b/, 'M0').replace(/MOTOC\w*/, 'MOTOCICLO').replace(/\(?\s*([A-Z ]+?)\s*\)?$/, '($1)').replace(/\(\(/, '(')
  out.omologazione = val('K')?.split(' ')[0]
  out.assi = parseNumber(val('L'))
  out.massaRimorchiabileFrenata = parseNumber(val('O.1'))
  out.massaRimorchiabileNonFrenata = parseNumber(val('O.2'))

  const cil = parseNumber(val('P.1'))
  if (cil) out.cilindrata = Math.round(cil)
  const kw = parseNumber(val('P.2'))
  if (kw) out.potenzaKw = kw
  const fuel = val('P.3')
  out.alimentazione = fuel ? normalizeFuel(fuel) : undefined
  out.codiceMotore = val('P.5')?.replace(/W{2,}$/, 'W')
  out.rapportoPotenzaPeso = parseNumber(val('Q'))
  out.posti = parseNumber(val('S.1'))
  out.postiInPiedi = parseNumber(val('S.2'))
  out.livelloSonoro = parseNumber(val('U.1'))
  out.regimeGiri = parseNumber(val('U.2'))
  out.co2 = parseNumber(val('V.7'))
  out.direttivaAmbientale = val('V.9')?.replace(/\/V?[UV0]E$/, '/UE')

  // Note in testo libero (pagina 3)
  const free = (re: RegExp) => upper.match(re)?.[1]?.trim()
  out.costruttore = free(/COSTRUTTORE\s*:\s*([^\n]+(?:\n\s*(?:CO\.|S\.P\.A|SPA|LTD|GMBH|AG\b|S\.A\.)[^\n]*)?)/)?.replace(/\s*\n\s*/g, ' ').replace(/\s{3,}.*$/, '')
  out.costruttore = out.costruttore?.replace(/[|‘’]/g, '').replace(/\s+/g, ' ').trim()
    .replace(/(LTD|S\.?P\.?A|GMBH|S\.?R\.?L|INC)[A-Z]?\.?(\s.*)?$/, '$1.')
  const lung = free(/LUNGHEZZA\s*:?\s*[‘']?\s*([0-9OI]+[,.][0-9OI]+)/)
  const larg = free(/LARGHEZZA\s*:?\s*[‘']?\s*([0-9OI]+[,.][0-9OI]+)/)
  const alt = free(/ALTEZZA\s*:?\s*[‘']?\s*([0-9OI]+[,.][0-9OI]+)/)
  out.lunghezza = parseNumber(lung)
  out.larghezza = parseNumber(larg)
  out.altezza = parseNumber(alt)
  const alim = free(/ALIMENTAZIONE\s*:\s*([A-Z/ ]+)/)
  if (alim && !out.alimentazione) out.alimentazione = normalizeFuel(alim)
  if (!out.alimentazione && fuel) out.alimentazione = fuel
  out.cambio = free(/TIPO\s+CAMBIO\s*:\s*([A-Z]+)/)?.toLowerCase()
  const euro = upper.match(/EURO\s*([0-9])\s*([+A-Z]{0,4})/)
  if (euro) out.classeEuro = `Euro ${euro[1]}${euro[2]?.startsWith('+') ? '+' : euro[2] ? ' ' + euro[2] : ''}`.trim()
  const pneAll = [...upper.replace(/R1I(\d)/g, 'R1$1').matchAll(/\b([AP])\s*:\s*(\d{2,3}\/\d{2}\s*Z?R\s?\d{2}[A-Z/]*\s*\d{2,3}[A-Z])/g)]
  const pne = ['A', 'P'].map((ax) => pneAll.find((m) => m[1] === ax)).filter(Boolean) as RegExpMatchArray[]
  if (pne.length) out.pneumatici = pne.map((m) => `${m[1] === 'A' ? 'Ant.' : 'Post.'} ${m[2].replace(/\s+/g, ' ')}`).join(' · ')
  const pra = upper.match(/PROGRESSIVO\s+PRA\s+([0-9OI]{2}\/[0-9OI]{6,8}[A-Z]?)/)
  if (pra) out.progressivoPra = digits(pra[1].slice(0, -1)) + pra[1].slice(-1)

  if (out.marca && out.costruttore && out.marca.length < 3) out.marca = out.costruttore.split(' ')[0]
  out.tipoVeicolo = kindFromCategory(out.categoria, out.usoDestinazione, out.carrozzeria)
    ?? (out.targa ? (plateKind(out.targa) === 'moto' ? 'moto' : plateKind(out.targa) === 'auto' ? 'auto' : undefined) : undefined)

  for (const k of Object.keys(out) as (keyof LibrettoData)[]) {
    if (out[k] === undefined || out[k] === '' || (typeof out[k] === 'number' && Number.isNaN(out[k]))) delete out[k]
  }
  return out
}

// Unisce due letture, preferendo i valori già presenti in `a`.
export function mergeLibretto(a: LibrettoData, b: LibrettoData): LibrettoData {
  const out: any = { ...b }
  for (const [k, v] of Object.entries(a)) if (v !== undefined && v !== '') out[k] = v
  return out
}

export const LIBRETTO_LABELS: Record<keyof LibrettoData, string> = {
  targa: 'Targa (A)',
  numeroCarta: 'N° carta di circolazione',
  numeroArchivio: 'N° archivio',
  dataPrimaImmatricolazione: 'Prima immatricolazione (B)',
  dataImmatricolazione: 'Immatricolazione attuale (I)',
  intestatarioCognome: 'Cognome / Ragione sociale (C.2.1)',
  intestatarioNome: 'Nome (C.2.2)',
  intestatarioNascita: 'Nascita intestatario',
  codiceFiscale: 'Codice fiscale',
  indirizzo: 'Indirizzo (C.2.3)',
  marca: 'Marca (D.1)',
  tipo: 'Tipo / Variante (D.2)',
  modello: 'Denominazione commerciale (D.3)',
  telaio: 'N° telaio / VIN (E)',
  massaMaxTecnica: 'Massa max tecnica kg (F.1)',
  massaMax: 'Massa max ammissibile kg (F.2)',
  massaComplesso: 'Massa max complesso kg (F.3)',
  massaInServizio: 'Massa in servizio kg (G)',
  categoria: 'Categoria (J)',
  usoDestinazione: 'Destinazione e uso (J.1)',
  carrozzeria: 'Carrozzeria (J.2)',
  omologazione: 'N° omologazione (K)',
  assi: 'Numero assi (L)',
  massaRimorchiabileFrenata: 'Rimorchiabile frenata kg (O.1)',
  massaRimorchiabileNonFrenata: 'Rimorchiabile non frenata kg (O.2)',
  cilindrata: 'Cilindrata cm³ (P.1)',
  potenzaKw: 'Potenza kW (P.2)',
  alimentazione: 'Alimentazione (P.3)',
  codiceMotore: 'Codice motore (P.5)',
  rapportoPotenzaPeso: 'Rapporto potenza/peso kW/kg (Q)',
  posti: 'Posti a sedere (S.1)',
  postiInPiedi: 'Posti in piedi (S.2)',
  livelloSonoro: 'Livello sonoro dB (U.1)',
  regimeGiri: 'Regime giri/min (U.2)',
  co2: 'CO₂ g/km (V.7)',
  direttivaAmbientale: 'Direttiva ambientale (V.9)',
  classeEuro: 'Classe ambientale',
  costruttore: 'Costruttore',
  lunghezza: 'Lunghezza m',
  larghezza: 'Larghezza m',
  altezza: 'Altezza m',
  cambio: 'Cambio',
  pneumatici: 'Pneumatici',
  progressivoPra: 'Progressivo PRA',
  tipoVeicolo: 'Tipo di veicolo',
}

/**
 * Unisce le letture di più passaggi OCR (es. soglia globale e adattiva):
 * la targa si sceglie per maggioranza su tutte le occorrenze, gli altri campi
 * dal primo passaggio che li ha letti, validando i formati più delicati.
 */
export function parseLibrettoMulti(texts: string[]): LibrettoData {
  const parsed = texts.map(parseLibretto)
  let out: LibrettoData = {}
  for (const p of parsed) out = mergeLibretto(out, p)
  const all = parseLibretto(texts.join('\n'))
  if (all.targa) out.targa = all.targa
  const vin = parsed.map((p) => p.telaio).find((v) => v && v.length === 17)
  if (vin) out.telaio = vin
  // per i campi su più righe si tiene la lettura più completa
  for (const k of ['indirizzo', 'usoDestinazione', 'costruttore', 'pneumatici'] as const) {
    const best = parsed.map((p) => p[k]).filter(Boolean).sort((a, b) => b!.length - a!.length)[0]
    if (best) out[k] = best
  }
  const cf = parsed.map((p) => p.codiceFiscale).find(Boolean)
  if (cf) out.codiceFiscale = cf
  return out
}
