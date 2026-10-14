// Riconoscimento dei documenti del veicolo (fatture d'officina, assicurazione, revisione,
// bollo, passaggio di proprietà) a partire dal testo letto con l'OCR.
import { digits, normalizePlate, parseDate } from './libretto.ts'
import type { WorkCategory } from './types'

export type DocKind = 'libretto' | 'fattura' | 'assicurazione' | 'revisione' | 'bollo' | 'passaggio' | 'sconosciuto'

export const DOC_LABEL: Record<DocKind, string> = {
  libretto: 'Libretto',
  fattura: 'Lavoro / tagliando',
  assicurazione: 'Assicurazione',
  revisione: 'Revisione',
  bollo: 'Bollo',
  passaggio: 'Passaggio di proprietà',
  sconosciuto: 'Altro documento',
}

export interface DocItem { code?: string; text: string; amount?: number }

export interface ParsedDoc {
  kind: DocKind
  plate?: string
  vin?: string
  date?: string          // data del documento (fattura, revisione, pagamento)
  total?: number
  km?: number
  // fattura / tagliando
  number?: string
  workshop?: string
  title?: string
  category?: WorkCategory
  items?: DocItem[]
  service?: string[]     // voci del tagliando riconosciute (TAGLIANDO_ITEMS)
  // assicurazione
  company?: string
  policyNumber?: string
  startDate?: string
  endDate?: string
  // revisione
  outcome?: 'regolare' | 'ripetere' | 'sospeso'
  nextDate?: string
  center?: string
  // bollo
  fromMonth?: string     // 'YYYY-MM'
  toMonth?: string
  nextDueMonth?: string
  validityMonths?: number
  notes?: string
}

/** Voci tipiche di un tagliando, con le parole che le identificano su una fattura. */
export const TAGLIANDO_ITEMS: { key: string; label: string; re: RegExp }[] = [
  { key: 'olio', label: 'Olio motore', re: /OLIO\s+MOTORE|\bOLIO\b(?!\s+FRENI)/ },
  { key: 'filtro-olio', label: 'Filtro olio', re: /FILTRO\s+(?:DELL?'?\s*)?OLIO|FILTRO\s+MOTORE/ },
  { key: 'filtro-aria', label: 'Filtro aria', re: /FILTRO\s+(?:DELL?'?\s*)?ARIA(?!\s+ABITACOLO)/ },
  { key: 'filtro-abitacolo', label: 'Filtro abitacolo', re: /ABITACOLO|ANTIPOLLINE|POLLINE/ },
  { key: 'filtro-carburante', label: 'Filtro carburante', re: /FILTRO\s+(?:CARBURANTE|GASOLIO|NAFTA|BENZINA)/ },
  { key: 'candele', label: 'Candele', re: /CANDEL/ },
  { key: 'liquido-freni', label: 'Liquido freni', re: /LIQUIDO\s+FRENI|OLIO\s+FRENI/ },
  { key: 'pastiglie', label: 'Pastiglie freni', re: /PASTIGLI/ },
  { key: 'dischi', label: 'Dischi freni', re: /DISCH/ },
  { key: 'distribuzione', label: 'Distribuzione', re: /DISTRIBUZIONE|CINGHIA/ },
  { key: 'refrigerante', label: 'Liquido refrigerante', re: /REFRIGERANT|ANTIGELO/ },
  { key: 'gomme', label: 'Gomme', re: /PNEUMATIC|GOMM/ },
  { key: 'batteria', label: 'Batteria', re: /BATTERI/ },
  { key: 'catena', label: 'Kit catena', re: /CATENA|CORONA|PIGNONE/ },
  { key: 'software', label: 'Aggiornamento software', re: /SOFTWARE/ },
  { key: 'controllo', label: 'Controllo generale', re: /CONTROLLO\s+GENERALE|VERIFICA\s+STATO|CHECK/ },
]

const MONTHS_IT = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE']
const MONTH_ABBR = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC']

const INSURERS = ['UnipolSai', 'Unipol', 'Generali', 'Allianz Direct', 'Allianz', 'AXA', 'Zurich', 'Reale Mutua', 'Cattolica', 'Sara Assicurazioni', 'Vittoria', 'Groupama',
  'Helvetia', 'Itas', 'Verti', 'Genertel', 'Genialloyd', 'Prima', 'ConTe', 'Linear', 'Direct Line', 'Quixa', 'HDI', 'Italiana Assicurazioni', 'Bene Assicurazioni',
  'Assimoco', 'Nobis', 'Elba', 'Amissima', 'Tua Assicurazioni', 'Toro', 'Fondiaria', 'Milano Assicurazioni', 'Aviva', 'Intesa Sanpaolo Assicura', 'Poste Assicura', 'Zuritel']

// --- utilità -----------------------------------------------------------

/** Tutte le date nel testo, nell'ordine in cui compaiono (gg/mm/aaaa, gg.mm.aaaa, gg/mm/aa, "1 maggio 2025"). */
export function findDates(text: string): { iso: string; index: number; line: string }[] {
  const out: { iso: string; index: number; line: string }[] = []
  const lineAt = (i: number) => text.slice(text.lastIndexOf('\n', i) + 1, (text.indexOf('\n', i) + 1 || text.length + 1) - 1)
  for (const m of text.matchAll(/(?<![\d/])([0-3OI]?[0-9OI])\s?[./-]\s?([01OI]?[0-9OI])\s?[./-]\s?((?:19|20)[0-9OI]{2}|[0-9]{2})(?![\d/])/g)) {
    let y = digits(m[3])
    if (y.length === 2) y = (Number(y) > 70 ? '19' : '20') + y
    const iso = parseDate(`${digits(m[1])}/${digits(m[2])}/${y}`)
    if (iso) out.push({ iso, index: m.index!, line: lineAt(m.index!) })
  }
  const up = text.toUpperCase()
  for (const m of up.matchAll(new RegExp(`\\b(\\d{1,2})\\s+(${MONTHS_IT.join('|')})\\s+(\\d{4})\\b`, 'g'))) {
    const iso = parseDate(`${m[1]}/${MONTHS_IT.indexOf(m[2]) + 1}/${m[3]}`)
    if (iso) out.push({ iso, index: m.index!, line: lineAt(m.index!) })
  }
  return out.sort((a, b) => a.index - b.index)
}

/** Importi in formato italiano (1.234,56) con la riga in cui compaiono. */
export function findAmounts(text: string): { value: number; line: string }[] {
  const out: { value: number; line: string }[] = []
  for (const line of text.split('\n')) {
    if (/CAP(ITALE)?\.?\s*SOC|SOCIALE/i.test(line)) continue
    for (const m of line.matchAll(/(?<![\d.,])(\d{1,3}(?:\.\d{3})+|\d{1,6})\s?,\s?(\d{2})(?![\d,]|\s?%)/g)) {
      const v = Number(m[1].replace(/\./g, '') + '.' + m[2])
      if (Number.isFinite(v)) out.push({ value: v, line })
    }
  }
  return out
}

const PLATE_RE = /(?<![A-Z0-9])([A-Z]{2}\s?[0-9OIS]{3}\s?[A-Z]{2}|[A-Z]{2}\s?[0-9OI]{5})(?![A-Z0-9])/g

export function findPlates(text: string): string[] {
  // ogni lettura conta 1; +2 se letta così com'è (senza correzioni), +3 se sulla riga della "TARGA"
  const lines = text.toUpperCase().split('\n')
  const score = new Map<string, number>()
  lines.forEach((l, i) => {
    const near = /TARGA|\(A\)/.test(l) || /TARGA/.test(lines[i - 1] ?? '')
    for (const m of l.matchAll(PLATE_RE)) {
      if (/REA\s*$|N[°.]?\s*$/.test(l.slice(0, m.index))) continue
      const p = normalizePlate(m[1])
      if (!/^[A-Z]{2}(\d{3}[A-Z]{2}|\d{5})$/.test(p) || /^(IT|EU|UE|CF|NR)/.test(p)) continue
      score.set(p, (score.get(p) ?? 0) + 1 + (m[1].replace(/\s/g, '') === p ? 2 : 0) + (near ? 3 : 0))
    }
  })
  return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([p]) => p)
}

export function findVins(text: string): string[] {
  const res: string[] = []
  for (const m of text.toUpperCase().matchAll(/(?<![A-Z0-9])([A-HJ-NPR-Z0-9]{17})(?![A-Z0-9])/g)) {
    // un telaio ha sia lettere che cifre e inizia col codice costruttore (lettere o cifre, mai tutto numerico)
    if (/[A-Z]/.test(m[1]) && /\d{4}/.test(m[1]) && !/^\d+$/.test(m[1].slice(0, 3))) res.push(m[1])
  }
  return res
}

function mostFrequent<T>(xs: T[]): T | undefined {
  const c = new Map<T, number>()
  for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1)
  return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

const tidy = (s: string) => s.replace(/[|_\[\]{}“”"‘’]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
const cap = (s: string) => s.toLowerCase().replace(/(^|[\s'(-])\p{L}/gu, (c) => c.toUpperCase())
const sentence = (s: string) => { const t = s.toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1) }

// --- riconoscimento del tipo -------------------------------------------

const SIGNS: Record<Exclude<DocKind, 'sconosciuto'>, RegExp[]> = {
  libretto: [/CARTA\s+DI\s+CIRCOLAZION/, /\(D\.\s?1\)/, /\(J\.\s?1\)/, /\(P\.\s?3\)/, /\(C\.\s?2\.\s?1\)/, /\(V\.\s?9\)/, /MINISTERO\s+DELLE\s+INFRASTRUTTURE/],
  revisione: [/CERTIFICATO\s+DI\s+REVISIONE/, /CENTRO\s+DI\s+CONTROLLO/, /SUCCESSIVO\s+CONTROLLO/, /CARENZE\s+CONSTATATE/, /RISULTATO\s+CONTROLLO/, /ANTIFALSIFICAZIONE/],
  assicurazione: [/ASSICURAZION/, /CARTA\s+VERDE/, /INSURANCE\s+CARD/, /PERIODO\s+DI\s+ASSICURAZIONE/, /CONTRAENTE/, /EFFETTO\s+GARANZIA/, /PREMIO/],
  bollo: [/PAGOPA|PAGO\s?PA/, /RICEVUTA\s+DI\s+PAGAMENTO/, /TASSA\s+AUTO|TASSA\s+AUTOMOBILISTICA|BOLLO\s+AUTO/, /[A-Z]{3}\d{4}\s?\/\s?[A-Z]{3}\d{4}/, /ENTE\s+CREDITORE/],
  passaggio: [/PUBBLICO\s+REGISTRO\s+AUTOMOBILISTICO/, /TRASFERIMENTO\s+DI\s+PROPRIET/, /IMPOSTA\s+PROVINCIALE\s+TRASCRIZIONE/, /REGISTRO\s+PROGRESSIVO/, /PASSAGGIO\s+DI\s+PROPRIET/],
  fattura: [/FATTURA/, /OFFICINA/, /IMPONIBILE/, /TOTALE\s+DOCUMENTO/, /INTERVENTO/, /TAGLIANDO/, /RICAMBI|MANODOPERA/, /QUANTIT/],
}

export function classifyDocument(text: string): DocKind {
  const up = text.toUpperCase()
  const scores = Object.entries(SIGNS).map(([k, rs]) => [k, rs.filter((r) => r.test(up)).length] as const)
  // segnali forti che bastano da soli
  if (/CERTIFICATO\s+DI\s+REVISIONE/.test(up)) return 'revisione'
  if (/PUBBLICO\s+REGISTRO\s+AUTOMOBILISTICO|TRASFERIMENTO\s+DI\s+PROPRIET/.test(up) && !/CARTA\s+DI\s+CIRCOLAZION/.test(up)) return 'passaggio'
  if (/[A-Z]{3}20\d{2}\s?\/\s?[A-Z]{3}20\d{2}/.test(up) && /PAGO|RICEVUTA|AUTOMOBILE\s+CLUB/.test(up)) return 'bollo'
  const best = scores.sort((a, b) => b[1] - a[1])[0]!
  return best[1] >= 2 ? (best[0] as DocKind) : 'sconosciuto'
}

// --- parser per tipo ---------------------------------------------------

function parseFattura(text: string, out: ParsedDoc) {
  const up = text.toUpperCase()
  const lines = up.split('\n')
  const dates = findDates(text)
  // data del documento: la prima con anno a 4 cifre (le scadenze di pagamento usano spesso l'anno a 2)
  out.date = (dates.find((d) => /DEL\b|DATA|DOCUMENTO|FATTURA|\bET\b/.test(d.line.toUpperCase())) ?? dates[0])?.iso
  const num = up.match(/(?:DOCUMENTO|[A-Z]{2,6}MENTO|FATTURA)\s*N[°.O]?\s*:?\s*(\d[A-Z0-9/-]{1,14})/) ?? up.match(/N\.?\s*DOCUMENTO[\s\S]{0,80}?\b(\d{3,10})\b/)
  if (num) out.number = num[1]
  // totale: il valore più alto tra quelli sulle righe dei totali, altrimenti il più alto in assoluto
  const amounts = findAmounts(text)
  const totalLines = amounts.filter((a) => /TOTALE|TOT\.?\s|PAGATO|CORRISPETTIVO|DARE/i.test(a.line))
  out.total = Math.max(...(totalLines.length ? totalLines : amounts).map((a) => a.value), 0) || undefined
  if (totalLines.length && amounts.length) out.total = Math.max(out.total ?? 0, ...amounts.map((a) => a.value).filter((v) => v < (out.total ?? 0) * 1.25)) || out.total
  // chilometri: numero di 4-6 cifre sulla riga con targa o telaio
  const idLines = lines.filter((l) => (out.plate && l.replace(/\s/g, '').includes(out.plate)) || (out.vin && l.includes(out.vin.slice(0, 8))) || /PERCORRENZA|\bKM\b/.test(l))
  const kmCands: number[] = []
  for (const l of idLines) {
    const clean = l.replace(/[A-Z0-9]{17}/g, ' ')
    for (const m of clean.matchAll(/(?<![A-Z0-9.,/])(\d{1,3}\.\d{3}|\d{4,6})(?![A-Z0-9,/]|\.\d)/g)) kmCands.push(Number(m[1].replace('.', '')))
  }
  const kmLine = lines.findIndex((l) => /\bKM\b|PERCORRENZA/.test(l))
  if (!kmCands.length && kmLine >= 0) {
    for (const m of (lines[kmLine + 1] ?? '').matchAll(/(?<![A-Z0-9])(\d{4,6})(?![A-Z0-9])/g)) kmCands.push(Number(m[1]))
  }
  const km = kmCands.filter((n) => n >= 100 && n < 1_500_000 && !(n >= 1990 && n <= 2099)).sort((a, b) => b - a)[0]
  if (km) out.km = km
  // officina: prima riga dell'intestazione con forma societaria
  const head = text.split('\n').slice(0, 14)
  const ws = head.map((l) => l.match(/([A-Za-zÀ-ú][\wÀ-ú&'. -]{2,40}?)\s+(S\.?\s?P\.?\s?A\.?|S\.?\s?R\.?\s?L\.?|S\.?\s?N\.?\s?C\.?|S\.?\s?A\.?\s?S\.?)(?![a-z])/i)).find(Boolean)
  if (ws) out.workshop = tidy(`${ws[1].replace(/^\W*(?:\w\s+|\d+\s+)?/, '')} ${ws[2].toUpperCase().replace(/\s/g, '')}`)
  // interventi e righe di dettaglio
  const interventions = [...up.matchAll(/INT[EF]?R?V?ENTO\s*\d*\s+([A-Z][A-Z0-9 .,'’/-]{3,60})/g)].map((m) => sentence(tidy(m[1].split(/\s{3,}/)[0]!)))
  const items: DocItem[] = []
  const all0 = text.split('\n')
  const start = Math.max(0, all0.findIndex((l) => /DESCRIZIONE|CODICE\s+ARTICOLO|CODICE\s+ART/i.test(l)))
  for (const l of all0.slice(start)) {
    const m = l.match(/^[^A-Za-z0-9]{0,6}(?:[A-Za-z]\s)?[\[{(‘'"]?(\d{4,12})\s+([A-Za-zÀ-ú][A-Za-zÀ-ú0-9 .,'’/-]{2,60}?)(?=\s{2,}|\s+[A-Z]{1,2}\s+\d|\s*\||\s+\d|$)/)
    if (!m || /INTERVENTO/i.test(m[2])) continue
    const nums = findAmounts(l)
    items.push({ code: m[1], text: sentence(tidy(m[2])), amount: nums.length ? nums[nums.length - 1]!.value : undefined })
  }
  const consumo = up.match(/MATERIALE\s+DI\s+CONSUMO[^\n]*/)
  if (consumo && !items.some((i) => /consumo/i.test(i.text))) {
    const a = findAmounts(consumo[0])
    items.push({ text: 'Materiale di consumo', amount: a.at(-1)?.value })
  }
  out.items = items
  const all = up
  out.service = TAGLIANDO_ITEMS.filter((t) => t.re.test(all)).map((t) => t.key)
  const isTagliando = /TAGL[I1]?AND|TAGLTAND|SERVIZIO\s+ORIGINALE|MANUTENZIONE\s+PROGRAMMATA|SERVICE\s+PACK/.test(all)
  out.category = isTagliando ? 'tagliando'
    : /DISTRIBUZIONE|CINGHIA/.test(all) ? 'distribuzione'
    : /PNEUMATIC|GOMM|EQUILIBRATUR|CONVERGENZA/.test(all) ? 'gomme'
    : /PASTIGLI|DISCH[IO]\s+FRENO|FRENI/.test(all) ? 'freni'
    : /BATTERI/.test(all) ? 'batteria'
    : /CARROZZ|VERNICIAT|PARAURT|LAMIER/.test(all) ? 'carrozzeria'
    : /OLIO\s+MOTORE|CAMBIO\s+OLIO/.test(all) ? 'olio'
    : /ELETTRIC|CABLAGG|FUSIBIL|CENTRALINA|SOFTWARE/.test(all) ? 'elettronica'
    : 'meccanica'
  out.title = isTagliando
    ? (interventions.find((i) => /tagliand/i.test(i)) ?? 'Tagliando')
    : interventions.length ? interventions.join(' · ') : items.slice(0, 3).map((i) => i.text).join(', ') || undefined
}

function parseAssicurazione(text: string, out: ParsedDoc) {
  const up = text.toUpperCase()
  const ins = INSURERS.find((n) => new RegExp(`\\b${n.toUpperCase().replace(/ /g, '\\s+')}\\b`).test(up))
  if (ins) out.company = ins
  const dates = findDates(text).map((d) => d.iso).filter((d) => d >= '2000-01-01')
  const uniq = [...new Set(dates)].sort()
  const end = uniq.at(-1)
  if (end) {
    out.endDate = end
    // inizio: la data esattamente 12 (o 6) mesi prima della scadenza, altrimenti la precedente
    const y = Number(end.slice(0, 4))
    const oneYear = `${y - 1}${end.slice(4)}`
    const sixMonths = (() => { const d = new Date(end); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10) })()
    out.startDate = uniq.find((d) => d === oneYear || d === sixMonths) ?? uniq.filter((d) => d < end).at(-1)
  }
  const paid = up.match(/(?:PAGAMENTO|PAGATO|EFFETTUATO|EFETTUATO|ETEMUSIO)[^\n]{0,60}?(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/)
  out.date = paid ? parseDate(paid[1]) : out.startDate
  const pol = up.match(/(?:POLIZZA|POSIZIONE|CONTRATTO)[^\n]{0,30}\n?[^\n]*?\b(\d{1,3}\/\d{6,12}|\d{8,14})\b/) ?? up.match(/\b(\d{1,3}\/\d{7,12})\b/)
  if (pol) out.policyNumber = pol[1]
  const premio = findAmounts(text).filter((a) => /PREMIO|TOTALE|IMPORTO/i.test(a.line)).map((a) => a.value)
  if (premio.length) out.total = Math.max(...premio)
}

function parseRevisione(text: string, out: ParsedDoc) {
  const up = text.toUpperCase()
  const dates = findDates(text).filter((d) => !/AUTORIZZAZ/i.test(d.line))
  const next = dates.find((d) => /ENTRO|SUCCESSIV/i.test(d.line)) ?? (up.match(/SUCCESSIVO\s+CONTROLLO[\s\S]{0,80}?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/) ? { iso: parseDate(up.match(/SUCCESSIVO\s+CONTROLLO[\s\S]{0,80}?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/)![1])! } : undefined)
  if (next?.iso) out.nextDate = next.iso
  const done = dates.filter((d) => d.iso !== out.nextDate && (!out.nextDate || d.iso < out.nextDate)).map((d) => d.iso).sort().at(-1)
  if (done) out.date = done
  if (!out.nextDate && out.date) {
    const d = new Date(out.date); d.setMonth(d.getMonth() + 25, 0)
    out.nextDate = d.toISOString().slice(0, 10)
  }
  if (!out.date && out.nextDate) {
    // il certificato vale 2 anni: la revisione è stata fatta nello stesso mese di 2 anni prima
    out.date = `${Number(out.nextDate.slice(0, 4)) - 2}${out.nextDate.slice(4, 8)}01`
  }
  out.outcome = /SOSPES/.test(up) ? 'sospeso' : /RIPETER/.test(up) ? 'ripetere' : 'regolare'
  const kmm = up.match(/\bKM\b[^\n]*\n?[^\n]*?(?<![A-Z0-9])(\d{1,3}\.\d{3}|\d{3,7})(?![A-Z0-9/])/)
  const kms = [...up.split('\n').filter((l) => /\b\d{5,7}\b/.test(l) && /[A-Z0-9]{17}|KM/.test(l)).join(' ').replace(/[A-Z0-9]{17}/g, ' ').matchAll(/(?<![A-Z0-9/])(\d{4,7})(?![A-Z0-9/])/g)].map((m) => Number(m[1]))
  const km = kms.sort((a, b) => b - a)[0] ?? (kmm ? Number(kmm[1].replace('.', '')) : undefined)
  if (km && km > 50) out.km = km
  const rsAt = text.search(/RAGIONE\s+SOCIALE/i)
  const rs = rsAt >= 0 ? text.slice(rsAt).split('\n').map((l, i) => tidy(i ? l : l.replace(/^.*?SOCIALE[.:]?/i, ''))).find((l) => /[A-Za-z]{3}/.test(l)) : undefined
  if (rs) out.center = rs.replace(/\s+(S\.?R\.?L\.?)\s+SRL$/i, ' $1')
  const cost = findAmounts(text).filter((a) => /TARIFFA|IMPORTO|TOTALE|EURO|€/i.test(a.line)).map((a) => a.value)
  if (cost.length) out.total = Math.max(...cost)
}

function parseBollo(text: string, out: ParsedDoc) {
  const up = text.toUpperCase()
  const per = up.match(/([A-Z]{3})\s?(20\d{2})\s?\/\s?([A-Z]{3})\s?(20\d{2})/)
  if (per) {
    const m1 = MONTH_ABBR.indexOf(per[1]), m2 = MONTH_ABBR.indexOf(per[3])
    if (m1 >= 0 && m2 >= 0) {
      out.fromMonth = `${per[2]}-${String(m1 + 1).padStart(2, '0')}`
      out.toMonth = `${per[4]}-${String(m2 + 1).padStart(2, '0')}`
      const months = (Number(per[4]) - Number(per[2])) * 12 + (m2 - m1) + 1
      out.validityMonths = months > 0 && months <= 24 ? months : 12
      const next = new Date(Number(per[4]), m2 + 1, 1)
      out.nextDueMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
    }
  }
  const dates = findDates(text)
  out.date = (dates.find((d) => /DATA|PAGAMENTO|ESEGUIT|ORA/i.test(d.line)) ?? dates[0])?.iso
  const amounts = findAmounts(text)
  const tot = amounts.filter((a) => /TOTALE|IMPORTO/i.test(a.line)).map((a) => a.value)
  out.total = (tot.length ? Math.max(...tot) : mostFrequent(amounts.map((a) => a.value))) || undefined
}

function parsePassaggio(text: string, out: ParsedDoc) {
  const dates = findDates(text)
  out.date = (dates.find((d) => /PROGRESSIVO|DEL\b|DATA/i.test(d.line)) ?? dates[0])?.iso
  const tot = findAmounts(text).filter((a) => /TOTAL/i.test(a.line)).map((a) => a.value)
  out.total = tot.length ? Math.max(...tot) : Math.max(0, ...findAmounts(text).map((a) => a.value)) || undefined
  out.title = /TRASFERIMENTO\s+DI\s+PROPRIET|PASSAGGIO/i.test(text) ? 'Passaggio di proprietà' : 'Pratica PRA'
}

/**
 * Ricava tipo e dati da uno o più testi OCR dello stesso documento (passaggi diversi).
 * I campi si prendono dal passaggio che li legge, partendo dal primo.
 */
export function parseDocument(texts: string[], forceKind?: DocKind): ParsedDoc {
  const joined = texts.join('\n')
  const kind = forceKind ?? classifyDocument(joined)
  const out: ParsedDoc = { kind }
  out.plate = findPlates(joined)[0]
  out.vin = mostFrequent(findVins(joined))
  const one = (t: string): ParsedDoc => {
    const o: ParsedDoc = { kind, plate: out.plate, vin: out.vin }
    if (kind === 'fattura' || kind === 'sconosciuto') parseFattura(t, o)
    else if (kind === 'assicurazione') parseAssicurazione(t, o)
    else if (kind === 'revisione') parseRevisione(t, o)
    else if (kind === 'bollo') parseBollo(t, o)
    else if (kind === 'passaggio') parsePassaggio(t, o)
    return o
  }
  const per = texts.map(one)
  // per le righe di dettaglio si sceglie il passaggio che ne ha lette di più
  const best = [...per].sort((a, b) => (b.items?.length ?? 0) - (a.items?.length ?? 0))[0]
  for (const p of per) {
    for (const [k, v] of Object.entries(p) as [keyof ParsedDoc, any][]) {
      if (v === undefined || (Array.isArray(v) && !v.length)) continue
      if ((out as any)[k] === undefined) (out as any)[k] = v
    }
  }
  if (best?.items?.length) out.items = best.items
  out.service = [...new Set(per.flatMap((p) => p.service ?? []))]
  // revisione: se un passaggio legge sia la data sia la scadenza, quei due valori vincono
  if (kind === 'revisione') {
    const both = per.find((p) => p.date && p.nextDate && Number(p.nextDate.slice(0, 4)) - Number(p.date.slice(0, 4)) === 2 && !p.date.endsWith('-01'))
    if (both) { out.date = both.date; out.nextDate = both.nextDate }
  }
  // totale: il valore letto da più passaggi
  const totals = per.map((p) => p.total).filter((t): t is number => !!t)
  if (totals.length) out.total = mostFrequent(totals) ?? out.total
  const kms = per.map((p) => p.km).filter((t): t is number => !!t)
  if (kms.length) out.km = mostFrequent(kms) ?? out.km
  return out
}

/** Distanza di modifica, per confrontare targhe e telai letti con qualche errore. */
export function editDistance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0]![j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
  }
  return d[a.length]![b.length]!
}

export const tagliandoLabel = (key: string) => TAGLIANDO_ITEMS.find((t) => t.key === key)?.label ?? key
export { cap as capitalizeWords }
