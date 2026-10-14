import { daysBetween, deadlinesFor, parseISO, vehicleName } from '~/utils/deadlines'
import type { Deadline, Vehicle } from '~/utils/types'

export interface DeadlineView extends Deadline { days: number; vehicle: Vehicle }

/** Elenco veicoli con le rispettive scadenze, aggiornato in tempo reale. */
export function useGarage() {
  const { data, loading } = useLive(() => loadAllVehicleData(), [])
  const vehicles = computed(() => data.value.map((d) => d.vehicle).sort((a, b) => {
    if ((a.status === 'attivo') !== (b.status === 'attivo')) return a.status === 'attivo' ? -1 : 1
    return b.createdAt - a.createdAt
  }))
  const deadlines = computed<DeadlineView[]>(() => {
    const today = new Date()
    return data.value.flatMap((d) => deadlinesFor(d).map((dl) => ({ ...dl, vehicle: d.vehicle, days: daysBetween(today, parseISO(dl.date)) })))
      .sort((a, b) => a.date.localeCompare(b.date))
  })
  const deadlinesByVehicle = computed(() => {
    const m = new Map<string, DeadlineView[]>()
    for (const d of deadlines.value) m.set(d.vehicleId, [...(m.get(d.vehicleId) ?? []), d])
    return m
  })
  return { vehicles, deadlines, deadlinesByVehicle, loading, name: vehicleName }
}

export type Health = 'ok' | 'warn' | 'danger' | 'off'
export const HEALTH_LABEL: Record<Health, string> = { ok: 'In regola', warn: 'In scadenza', danger: 'Scaduto', off: 'Archiviato' }
export const HEALTH_GLOW = { ok: 'teal', warn: 'amber', danger: 'rose', off: 'violet' } as const

/** Stato complessivo delle scadenze di un veicolo. */
export function vehicleHealth(v: Vehicle, dls: DeadlineView[]): Health {
  if (v.status !== 'attivo') return 'off'
  if (dls.some((d) => d.days < 0)) return 'danger'
  if (dls.some((d) => d.days <= 30)) return 'warn'
  return 'ok'
}
