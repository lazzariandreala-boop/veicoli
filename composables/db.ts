import Dexie, { liveQuery, type Table } from 'dexie'
import type { WatchSource } from 'vue'
import type { BolloPayment, Incident, InsurancePolicy, Inspection, Media, Vehicle, Work } from '~/utils/types'

// Archivio locale sul telefono (IndexedDB). Foto e video sono salvati come Blob.
class VeicoliDB extends Dexie {
  vehicles!: Table<Vehicle, string>
  works!: Table<Work, string>
  incidents!: Table<Incident, string>
  bolli!: Table<BolloPayment, string>
  policies!: Table<InsurancePolicy, string>
  inspections!: Table<Inspection, string>
  media!: Table<Media, string>

  constructor() {
    super('veicoli')
    this.version(1).stores({
      vehicles: 'id, status, plate, createdAt',
      works: 'id, vehicleId, date',
      incidents: 'id, vehicleId, date',
      bolli: 'id, vehicleId, paidDate',
      policies: 'id, vehicleId, endDate',
      inspections: 'id, vehicleId, date',
      media: 'id, createdAt',
    })
  }
}

let _db: VeicoliDB | null = null
export function db() {
  if (!_db) _db = new VeicoliDB()
  return _db
}

export function uid() {
  return (crypto as any).randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Ref reattivo legato a una query Dexie: si aggiorna da solo quando cambiano i dati. */
export function useLive<T>(query: () => Promise<T> | T, initial: T, deps?: WatchSource | WatchSource[]) {
  const data = shallowRef<T>(initial) as Ref<T>
  const loading = ref(true)
  let sub: { unsubscribe(): void } | null = null
  const start = () => {
    sub?.unsubscribe()
    sub = liveQuery(query).subscribe({
      next: (v) => { data.value = v; loading.value = false },
      error: (e) => { console.error(e); loading.value = false },
    })
  }
  start()
  if (deps) watch(deps as any, start)
  onScopeDispose(() => sub?.unsubscribe())
  return { data, loading }
}

export async function saveMedia(files: File[] | Blob[]): Promise<string[]> {
  const ids: string[] = []
  for (const f of files) {
    const id = uid()
    await db().media.put({ id, blob: f, type: f.type || 'application/octet-stream', name: (f as File).name, createdAt: Date.now() })
    ids.push(id)
  }
  return ids
}

export async function deleteMedia(ids: string[]) {
  if (ids.length) await db().media.bulkDelete(ids)
}

/** Elimina un veicolo con tutto il suo storico e i file collegati. */
export async function deleteVehicleCascade(id: string) {
  const d = db()
  await d.transaction('rw', [d.vehicles, d.works, d.incidents, d.bolli, d.policies, d.inspections, d.media], async () => {
    const v = await d.vehicles.get(id)
    const works = await d.works.where('vehicleId').equals(id).toArray()
    const incidents = await d.incidents.where('vehicleId').equals(id).toArray()
    const policies = await d.policies.where('vehicleId').equals(id).toArray()
    const mediaIds = [
      ...(v?.librettoMediaIds ?? []), ...(v?.coverMediaId ? [v.coverMediaId] : []),
      ...works.flatMap((w) => w.mediaIds), ...incidents.flatMap((i) => i.mediaIds), ...policies.flatMap((p) => p.mediaIds),
    ]
    await d.media.bulkDelete(mediaIds)
    for (const t of [d.works, d.incidents, d.bolli, d.policies, d.inspections] as Table<any, string>[]) {
      await t.where('vehicleId').equals(id).delete()
    }
    await d.vehicles.delete(id)
  })
}

/** Tutti i dati necessari per scadenze e promemoria. */
export async function loadAllVehicleData() {
  const d = db()
  const [vehicles, bolli, policies, inspections] = await Promise.all([
    d.vehicles.toArray(), d.bolli.toArray(), d.policies.toArray(), d.inspections.toArray(),
  ])
  return vehicles.map((vehicle) => ({
    vehicle,
    bolli: bolli.filter((b) => b.vehicleId === vehicle.id),
    policies: policies.filter((p) => p.vehicleId === vehicle.id),
    inspections: inspections.filter((i) => i.vehicleId === vehicle.id),
  }))
}
