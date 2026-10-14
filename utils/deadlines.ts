// Calcolo delle scadenze (bollo, assicurazione, revisione) e dei promemoria.
// Modulo puro: niente accesso al DB, così è testabile in Node.
import type { BolloPayment, Deadline, InsurancePolicy, Inspection, Vehicle } from './types'

export const REMINDER_HOUR = 9

export function parseISO(d: string): Date {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, (m || 1) - 1, day || 1)
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()
  r.setDate(Math.min(d.getDate(), last))
  return r
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function endOfMonth(ym: string): Date {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0)
}

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Mese in cui va ripagato il bollo.
 * Il bollo vale 12 mesi: se pagato a ottobre 2026 si ripaga a ottobre 2027
 * (scadenza a fine settembre, pagamento entro fine ottobre).
 * Se il veicolo ha un mese fisso (alcune regioni per le moto, es. gennaio),
 * si usa la prima occorrenza di quel mese dopo la scadenza naturale meno un anno.
 */
export function bolloNextDueMonth(paidDate: string, validityMonths = 12, fixedMonth?: number): string {
  const paid = parseISO(paidDate)
  if (fixedMonth && fixedMonth >= 1 && fixedMonth <= 12) {
    // prima occorrenza del mese fisso dopo il mese successivo al pagamento
    // (chi paga a dicembre per il periodo di gennaio ripaga il gennaio dell'anno dopo)
    let d = addMonths(new Date(paid.getFullYear(), paid.getMonth(), 1), 2)
    while (d.getMonth() + 1 !== fixedMonth) d = addMonths(d, 1)
    return monthKey(d)
  }
  return monthKey(addMonths(new Date(paid.getFullYear(), paid.getMonth(), 1), validityMonths))
}

/** Prossima revisione: 4 anni dalla prima immatricolazione, poi ogni 2 anni (entro fine mese). */
export function nextInspectionDate(firstRegistration?: string, inspections: Inspection[] = []): string | undefined {
  const done = inspections.filter((i) => i.outcome === 'regolare').sort((a, b) => b.date.localeCompare(a.date))[0]
  let base: Date
  if (done) base = addMonths(parseISO(done.date), 24)
  else if (firstRegistration) base = addMonths(parseISO(firstRegistration), 48)
  else return undefined
  return toISO(new Date(base.getFullYear(), base.getMonth() + 1, 0))
}

export function daysBetween(from: Date, to: Date) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((b - a) / 86400000)
}

export interface VehicleData {
  vehicle: Vehicle
  bolli: BolloPayment[]
  policies: InsurancePolicy[]
  inspections: Inspection[]
}

export function vehicleName(v: Vehicle) {
  const model = [v.libretto.marca, v.libretto.modello].filter(Boolean).join(' ')
  return v.nickname || model || v.plate || 'Veicolo'
}

/** Scadenze correnti di un veicolo (una per tipo, la più recente). */
export function deadlinesFor({ vehicle, bolli, policies, inspections }: VehicleData): Deadline[] {
  if (vehicle.status !== 'attivo') return []
  const out: Deadline[] = []
  const lastBollo = [...bolli].sort((a, b) => b.paidDate.localeCompare(a.paidDate))[0]
  if (lastBollo && !vehicle.bolloExempt) {
    out.push({
      vehicleId: vehicle.id,
      kind: 'bollo',
      date: toISO(endOfMonth(lastBollo.nextDueMonth)),
      label: 'Bollo',
      detail: `Da pagare nel mese di ${monthName(lastBollo.nextDueMonth)}`,
    })
  }
  const policy = [...policies].sort((a, b) => b.endDate.localeCompare(a.endDate))[0]
  if (policy) {
    out.push({
      vehicleId: vehicle.id,
      kind: 'assicurazione',
      date: policy.endDate,
      label: 'Assicurazione',
      detail: policy.company ? `${policy.company}${policy.policyNumber ? ' · ' + policy.policyNumber : ''}` : undefined,
    })
  }
  const rev = nextInspectionDate(vehicle.libretto.dataPrimaImmatricolazione, inspections)
  if (rev) {
    out.push({ vehicleId: vehicle.id, kind: 'revisione', date: rev, label: 'Revisione', detail: `Entro fine ${monthName(rev.slice(0, 7))}` })
  }
  return out
}

export interface Reminder {
  id: number
  at: Date
  title: string
  body: string
  vehicleId: string
  kind: string
}

function hashId(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h) % 2_000_000_000
}

function at(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), REMINDER_HOUR, 0, 0)
}

/**
 * Promemoria da programmare:
 * - bollo: il primo giorno del mese in cui va pagato;
 * - assicurazione: 30 e 15 giorni prima, il giorno prima e il giorno stesso della scadenza;
 * - revisione: il primo giorno del mese di scadenza e 15 giorni prima della fine del mese.
 */
export function buildReminders(data: VehicleData[], now = new Date()): Reminder[] {
  const out: Reminder[] = []
  for (const d of data) {
    const v = d.vehicle
    const name = vehicleName(v)
    const plate = v.plate ? ` (${v.plate})` : ''
    for (const dl of deadlinesFor(d)) {
      const due = parseISO(dl.date)
      const push = (when: Date, title: string, body: string, tag: string) => {
        const t = at(when)
        if (t > now) out.push({ id: hashId(`${v.id}:${dl.kind}:${dl.date}:${tag}`), at: t, title, body, vehicleId: v.id, kind: dl.kind })
      }
      if (dl.kind === 'bollo') {
        const first = new Date(due.getFullYear(), due.getMonth(), 1)
        push(first, `Bollo da pagare – ${name}`, `Questo mese scade il bollo di ${name}${plate}. Pagalo entro il ${formatDate(dl.date)}.`, 'm1')
      } else if (dl.kind === 'assicurazione') {
        const steps: [number, string][] = [
          [30, 'tra 30 giorni'], [15, 'tra 15 giorni'], [1, 'domani'], [0, 'oggi'],
        ]
        for (const [n, when] of steps) {
          push(addDays(due, -n), `Assicurazione in scadenza ${when}`, `La polizza di ${name}${plate} scade ${when === 'oggi' ? 'oggi' : `il ${formatDate(dl.date)}`}.`, `d${n}`)
        }
      } else if (dl.kind === 'revisione') {
        const first = new Date(due.getFullYear(), due.getMonth(), 1)
        push(first, `Revisione da fare – ${name}`, `La revisione di ${name}${plate} va fatta entro il ${formatDate(dl.date)}.`, 'm1')
        push(addDays(due, -15), `Revisione: mancano 15 giorni`, `Prenota la revisione di ${name}${plate}: scade il ${formatDate(dl.date)}.`, 'd15')
      }
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime())
}

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']

export function monthName(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

export function formatDate(iso?: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function formatDateLong(iso?: string) {
  if (!iso) return ''
  const d = parseISO(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
