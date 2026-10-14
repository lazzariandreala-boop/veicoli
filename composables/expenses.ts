import { toISO } from '~/utils/deadlines'
import type { BolloPayment, Incident, InsurancePolicy, Inspection, Vehicle, Work } from '~/utils/types'

export type ExpenseCat = 'lavori' | 'assicurazione' | 'bollo' | 'revisioni' | 'danni'
/** Ordine e colori (palette --series-1..5) delle categorie di spesa. */
export const EXPENSE_CATS: { id: ExpenseCat; label: string; short: string; color: string }[] = [
  { id: 'lavori', label: 'Lavori e manutenzione', short: 'Lavori', color: 'var(--series-1)' },
  { id: 'assicurazione', label: 'Assicurazione', short: 'Assicurazione', color: 'var(--series-2)' },
  { id: 'bollo', label: 'Bollo', short: 'Bollo', color: 'var(--series-3)' },
  { id: 'revisioni', label: 'Revisioni', short: 'Revisioni', color: 'var(--series-4)' },
  { id: 'danni', label: 'Danni da incidenti', short: 'Danni', color: 'var(--series-5)' },
]

export interface Expense { id: string; vehicleId: string; date: string; amount: number; cat: ExpenseCat; title: string; tab: string }

/** Tutte le spese di gestione (acquisti esclusi), aggiornate in tempo reale. */
export function useExpenses() {
  const { data, loading } = useLive(async () => {
    const d = db()
    const [vehicles, works, bolli, policies, inspections, incidents] = await Promise.all([
      d.vehicles.toArray(), d.works.toArray(), d.bolli.toArray(), d.policies.toArray(), d.inspections.toArray(), d.incidents.toArray(),
    ])
    return { vehicles, works, bolli, policies, inspections, incidents }
  }, { vehicles: [] as Vehicle[], works: [] as Work[], bolli: [] as BolloPayment[], policies: [] as InsurancePolicy[], inspections: [] as Inspection[], incidents: [] as Incident[] })

  const vehicles = computed(() => data.value.vehicles)
  const entries = computed<Expense[]>(() => {
    const d = data.value
    return [
      ...d.works.map((x) => ({ id: x.id, vehicleId: x.vehicleId, date: x.date, amount: x.cost ?? 0, cat: 'lavori' as const, title: x.title, tab: 'lavori' })),
      ...d.bolli.map((x) => ({ id: x.id, vehicleId: x.vehicleId, date: x.paidDate, amount: x.amount ?? 0, cat: 'bollo' as const, title: 'Bollo auto', tab: 'scadenze' })),
      ...d.policies.map((x) => ({ id: x.id, vehicleId: x.vehicleId, date: x.startDate ?? x.endDate, amount: x.price ?? 0, cat: 'assicurazione' as const, title: x.company ? `Assicurazione ${x.company}` : 'Assicurazione', tab: 'scadenze' })),
      ...d.inspections.map((x) => ({ id: x.id, vehicleId: x.vehicleId, date: x.date, amount: x.cost ?? 0, cat: 'revisioni' as const, title: 'Revisione', tab: 'scadenze' })),
      ...d.incidents.map((x) => ({ id: x.id, vehicleId: x.vehicleId, date: x.date, amount: Math.max(0, (x.damageCost ?? 0) - (x.reimbursed ?? 0)), cat: 'danni' as const, title: 'Danni incidente', tab: 'incidenti' })),
    ].filter((e) => e.amount > 0 && e.date).sort((a, b) => b.date.localeCompare(a.date))
  })
  return { data, loading, vehicles, entries }
}

export type Period = '30g' | '6m' | '1a' | 'tutto'
export const PERIODS: { id: Period; label: string }[] = [
  { id: '30g', label: '30 giorni' }, { id: '6m', label: '6 mesi' }, { id: '1a', label: '1 anno' }, { id: 'tutto', label: 'Tutto' },
]

/** Intervallo [da, a) in ISO del periodo corrente e di quello precedente di pari durata. */
export function periodRange(p: Period, today = new Date()): { from: string; to: string; prevFrom: string } | null {
  if (p === 'tutto') return null
  const to = new Date(today); to.setDate(to.getDate() + 1)
  const from = new Date(today)
  const prev = new Date(today)
  if (p === '30g') { from.setDate(from.getDate() - 29); prev.setDate(prev.getDate() - 59) }
  else {
    const m = p === '6m' ? 6 : 12
    from.setMonth(from.getMonth() - m); from.setDate(from.getDate() + 1)
    prev.setMonth(prev.getMonth() - 2 * m); prev.setDate(prev.getDate() + 1)
  }
  return { from: toISO(from), to: toISO(to), prevFrom: toISO(prev) }
}
