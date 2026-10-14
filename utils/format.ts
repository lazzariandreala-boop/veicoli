import type { Fault, VehicleStatus, WorkCategory } from './types'
import type { VehicleKind } from './libretto'

const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const eur0 = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const intf = new Intl.NumberFormat('it-IT')

export const money = (n?: number | null, round = false) => (n === undefined || n === null || Number.isNaN(n) ? '—' : (round ? eur0 : eur).format(n))
export const int = (n?: number | null) => (n === undefined || n === null ? '—' : intf.format(n))
export const km = (n?: number | null) => (n === undefined || n === null ? '—' : `${intf.format(n)} km`)
export const kwToCv = (kw?: number) => (kw ? Math.round(kw * 1.35962) : undefined)

export const KIND_LABEL: Record<VehicleKind, string> = {
  auto: 'Auto', moto: 'Moto', ciclomotore: 'Ciclomotore', furgone: 'Furgone', camper: 'Camper', rimorchio: 'Rimorchio', altro: 'Altro',
}

export const STATUS_LABEL: Record<VehicleStatus, string> = {
  attivo: 'In uso', venduto: 'Venduto', distrutto: 'Distrutto', rottamato: 'Rottamato', rubato: 'Rubato',
}

export const FAULT_LABEL: Record<Fault, string> = {
  torto: 'A torto', ragione: 'A ragione', concorso: 'Concorso di colpa', da_definire: 'Da definire',
}

export const WORK_CATEGORIES: { value: WorkCategory; label: string }[] = [
  { value: 'tagliando', label: 'Tagliando' },
  { value: 'olio', label: 'Cambio olio' },
  { value: 'gomme', label: 'Gomme' },
  { value: 'freni', label: 'Freni' },
  { value: 'distribuzione', label: 'Distribuzione' },
  { value: 'batteria', label: 'Batteria' },
  { value: 'meccanica', label: 'Meccanica' },
  { value: 'carrozzeria', label: 'Carrozzeria' },
  { value: 'elettronica', label: 'Elettronica' },
  { value: 'accessori', label: 'Accessori' },
  { value: 'revisione', label: 'Revisione' },
  { value: 'altro', label: 'Altro' },
]
export const workCategoryLabel = (c: WorkCategory) => WORK_CATEGORIES.find((x) => x.value === c)?.label ?? c

export const ACCENTS = [
  ['#7c5cff', '#22d3ee'],
  ['#ff5c8a', '#ffb35c'],
  ['#10b981', '#a3e635'],
  ['#3b82f6', '#06b6d4'],
  ['#f97316', '#facc15'],
  ['#e11d48', '#7c3aed'],
  ['#64748b', '#cbd5e1'],
  ['#0ea5e9', '#6366f1'],
]
export const accentGradient = (accent: string) => {
  const pair = ACCENTS.find((a) => a[0] === accent) ?? ACCENTS[0]
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`
}

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function relativeDays(n: number) {
  if (n === 0) return 'oggi'
  if (n === 1) return 'domani'
  if (n === -1) return 'ieri'
  if (n < 0) return `scaduta da ${-n} giorni`
  if (n < 60) return `tra ${n} giorni`
  const m = Math.round(n / 30)
  return m < 24 ? `tra ${m} mesi` : `tra ${Math.round(m / 12)} anni`
}

export function urgency(n: number): 'danger' | 'warn' | 'ok' {
  if (n < 0 || n <= 7) return 'danger'
  if (n <= 30) return 'warn'
  return 'ok'
}
