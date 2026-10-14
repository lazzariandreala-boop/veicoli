import type { LibrettoData } from '~/utils/libretto'
import { editDistance, type ParsedDoc } from '~/utils/documents'
import { bolloNextDueMonth } from '~/utils/deadlines'
import type { BolloPayment, InsurancePolicy, Inspection, Vehicle, Work } from '~/utils/types'

/** Libretto letto dalla schermata documenti, da usare nel modulo del nuovo veicolo. */
export const pendingLibretto = shallowRef<{ data: LibrettoData; files: File[] } | null>(null)

const clean = (s?: string) => (s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')

/** Trova il veicolo del documento confrontando targa (anche vecchie targhe) e telaio, tollerando errori di lettura. */
export function matchVehicle(vehicles: Vehicle[], doc: Pick<ParsedDoc, 'plate' | 'vin'>): { vehicle?: Vehicle; by?: 'targa' | 'telaio' } {
  let best: { v: Vehicle; score: number; by: 'targa' | 'telaio' } | undefined
  for (const v of vehicles) {
    const plates = [v.plate, ...v.plateHistory.map((p) => p.plate)].map(clean).filter(Boolean)
    if (doc.plate) {
      const d = Math.min(...plates.map((p) => editDistance(p, clean(doc.plate))))
      if (d <= 1 && (!best || 10 - d > best.score)) best = { v, score: 10 - d, by: 'targa' }
    }
    if (doc.vin && v.libretto.telaio) {
      const d = editDistance(clean(v.libretto.telaio), clean(doc.vin))
      if (d <= 3 && (!best || 9 - d > best.score)) best = { v, score: 9 - d, by: 'telaio' }
    }
  }
  return best ? { vehicle: best.v, by: best.by } : {}
}

const plain = <T>(x: T): T => JSON.parse(JSON.stringify(x))

/** Salva il documento come lavoro, polizza, revisione o bollo. Restituisce la scheda da aprire. */
export async function saveDocument(doc: ParsedDoc, vehicle: Vehicle, files: File[], opts: { setPurchaseDate?: boolean } = {}): Promise<string> {
  const mediaIds = files.length ? await storeFiles(files) : []
  const base = { id: uid(), vehicleId: vehicle.id, createdAt: Date.now() }
  let tab = 'lavori'
  if (doc.kind === 'assicurazione') {
    const rec: InsurancePolicy = { ...base, company: doc.company, policyNumber: doc.policyNumber, startDate: doc.startDate, endDate: doc.endDate!, price: doc.total, coverage: doc.title, mediaIds }
    await db().policies.put(plain(rec))
    tab = 'scadenze'
  } else if (doc.kind === 'revisione') {
    const rec: Inspection = { ...base, date: doc.date!, km: doc.km, outcome: doc.outcome ?? 'regolare', cost: doc.total, center: doc.center, nextDate: doc.nextDate, mediaIds }
    await db().inspections.put(plain(rec))
    tab = 'scadenze'
  } else if (doc.kind === 'bollo') {
    const rec: BolloPayment = {
      ...base, paidDate: doc.date!, amount: doc.total, validityMonths: doc.validityMonths ?? 12,
      nextDueMonth: doc.nextDueMonth ?? bolloNextDueMonth(doc.date!, doc.validityMonths ?? 12, vehicle.bolloMonthOverride),
      notes: doc.fromMonth && doc.toMonth ? `Periodo ${doc.fromMonth.split('-').reverse().join('/')} – ${doc.toMonth.split('-').reverse().join('/')}` : undefined, mediaIds,
    }
    await db().bolli.put(plain(rec))
    tab = 'scadenze'
  } else {
    const lines = (doc.items ?? []).map((i) => `• ${i.text}${i.amount !== undefined ? ` — ${money(i.amount)}` : ''}`)
    const notes = [doc.number ? `Fattura n. ${doc.number}` : '', ...lines, doc.notes ?? ''].filter(Boolean).join('\n') || undefined
    const rec: Work = {
      ...base, date: doc.date!, km: doc.km, title: doc.title || workCategoryLabel(doc.category ?? 'altro'), category: doc.kind === 'passaggio' ? 'altro' : doc.category ?? 'meccanica',
      workshop: doc.workshop, cost: doc.total, notes, service: doc.category === 'tagliando' ? doc.service : undefined, mediaIds,
    }
    await db().works.put(plain(rec))
    if (doc.kind === 'passaggio' && opts.setPurchaseDate && doc.date) {
      await db().vehicles.update(vehicle.id, { purchase: { ...plain(vehicle.purchase), date: doc.date }, updatedAt: Date.now() })
    }
  }
  if (doc.km && (!vehicle.currentKm || doc.km > vehicle.currentKm)) await db().vehicles.update(vehicle.id, { currentKm: doc.km })
  return tab
}
