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

/** Durata della polizza: 6 o 12 mesi se lo dicono le date, altrimenti quella scelta. */
function policyMonthsOf(d: ParsedDoc) {
  if (d.startDate && d.endDate) {
    const m = Math.round((new Date(d.endDate).getTime() - new Date(d.startDate).getTime()) / (30.44 * 86400000))
    if (m === 6 || m === 12) return m
  }
  return d.validityMonths
}

/** Salva il documento come lavoro, polizza, revisione o bollo. Restituisce la scheda da aprire. */
export async function saveDocument(doc: ParsedDoc, vehicle: Vehicle, files: File[], opts: { setPurchaseDate?: boolean } = {}): Promise<string> {
  const mediaIds = files.length ? await storeFiles(files) : []
  const base = { id: uid(), vehicleId: vehicle.id, createdAt: Date.now() }
  let tab = 'lavori'
  if (doc.kind === 'assicurazione') {
    const rec: InsurancePolicy = { ...base, company: doc.company, policyNumber: doc.policyNumber, startDate: doc.startDate, endDate: doc.endDate!, price: doc.total, durationMonths: policyMonthsOf(doc), coverage: doc.title, mediaIds }
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

const sameMoney = (a?: number, b?: number) => a === undefined || b === undefined || Math.abs(a - b) < 0.01
const fmt = (iso?: string) => (iso ? iso.split('-').reverse().join('/') : '')

/** Se il documento è già stato registrato su questo veicolo restituisce una frase che lo spiega. */
export async function findDuplicate(doc: ParsedDoc, vehicleId: string): Promise<string | undefined> {
  const of = <T>(t: 'policies' | 'inspections' | 'bolli' | 'works') => (db() as any)[t].where('vehicleId').equals(vehicleId).toArray() as Promise<T[]>
  if (doc.kind === 'assicurazione') {
    if (!doc.endDate) return
    const hit = (await of<InsurancePolicy>('policies')).find((p) => p.endDate === doc.endDate
      || (!!doc.policyNumber && clean(p.policyNumber) === clean(doc.policyNumber) && p.startDate === doc.startDate))
    return hit && `Questa polizza è già registrata (scadenza ${fmt(hit.endDate)}${hit.company ? ', ' + hit.company : ''}).`
  }
  if (!doc.date) return
  if (doc.kind === 'revisione') {
    const hit = (await of<Inspection>('inspections')).find((i) => i.date === doc.date)
    return hit && `Questa revisione è già registrata (fatta il ${fmt(hit.date)}).`
  }
  if (doc.kind === 'bollo') {
    const hit = (await of<BolloPayment>('bolli')).find((b) => b.paidDate === doc.date && sameMoney(b.amount, doc.total))
    return hit && `Questo bollo è già registrato (pagato il ${fmt(hit.paidDate)}).`
  }
  if (doc.kind === 'libretto') return
  const num = doc.number && clean(doc.number)
  const hit = (await of<Work>('works')).find((w) => (w.date === doc.date && sameMoney(w.cost, doc.total) && (doc.total !== undefined || w.title === doc.title))
    || (!!num && num.length >= 3 && w.date === doc.date && clean(w.notes).includes('FATTURAN' + num)))
  return hit && `Questo documento è già registrato: «${hit.title}» del ${fmt(hit.date)}.`
}
