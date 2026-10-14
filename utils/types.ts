import type { LibrettoData, VehicleKind } from './libretto'


export type VehicleStatus = 'attivo' | 'venduto' | 'distrutto' | 'rottamato' | 'rubato'

export interface PlateRecord {
  plate: string
  from?: string
  to?: string
  note?: string
}

export interface Purchase {
  date?: string
  price?: number
  seller?: string        // da chi
  place?: string         // dove (concessionaria, città...)
  km?: number
  condition?: 'nuovo' | 'usato' | 'km0'
  notes?: string
}

export interface EndOfLife {
  type: Exclude<VehicleStatus, 'attivo'>
  date?: string
  price?: number         // prezzo di vendita o rimborso
  buyer?: string
  km?: number
  incidentId?: string
  notes?: string
}

export interface Vehicle {
  id: string
  createdAt: number
  updatedAt: number
  kind: VehicleKind
  nickname?: string
  accent: string          // colore della scheda
  coverMediaId?: string
  status: VehicleStatus
  plate: string
  plateHistory: PlateRecord[]
  libretto: LibrettoData
  librettoMediaIds: string[]
  purchase: Purchase
  end?: EndOfLife
  bolloExempt?: boolean
  bolloMonthOverride?: number // 1-12: mese fisso di pagamento (alcune regioni)
  notes?: string
  currentKm?: number
}

export type WorkCategory =
  | 'tagliando' | 'olio' | 'gomme' | 'freni' | 'distribuzione' | 'batteria'
  | 'carrozzeria' | 'meccanica' | 'elettronica' | 'accessori' | 'revisione' | 'altro'

export interface Work {
  id: string
  vehicleId: string
  date: string
  km?: number
  title: string
  category: WorkCategory
  workshop?: string
  cost?: number
  notes?: string
  mediaIds: string[]
  createdAt: number
}

export type Fault = 'torto' | 'ragione' | 'concorso' | 'da_definire'

export interface Incident {
  id: string
  vehicleId: string
  date: string
  time?: string
  place?: string
  fault: Fault
  description?: string
  otherPartyName?: string
  otherPartyPlate?: string
  otherPartyInsurer?: string
  otherPartyPolicy?: string
  cai?: boolean           // constatazione amichevole (CAI/CID) firmata
  police?: boolean        // intervento autorità
  injuries?: boolean
  claimNumber?: string
  damageCost?: number
  reimbursed?: number
  totalLoss?: boolean     // veicolo distrutto
  mediaIds: string[]
  createdAt: number
}

export interface BolloPayment {
  id: string
  vehicleId: string
  paidDate: string
  amount?: number
  validityMonths: number  // di norma 12
  nextDueMonth: string    // 'YYYY-MM' mese in cui pagare di nuovo
  notes?: string
  createdAt: number
}

export interface InsurancePolicy {
  id: string
  vehicleId: string
  company?: string
  policyNumber?: string
  startDate?: string
  endDate: string         // scadenza
  price?: number
  coverage?: string       // RCA, furto/incendio, kasko...
  notes?: string
  mediaIds: string[]
  createdAt: number
}

export interface Inspection {
  id: string
  vehicleId: string
  date: string
  km?: number
  outcome: 'regolare' | 'ripetere' | 'sospeso'
  cost?: number
  center?: string
  notes?: string
  createdAt: number
}

export interface Media {
  id: string
  blob: Blob
  type: string
  name?: string
  createdAt: number
}

export type DeadlineKind = 'bollo' | 'assicurazione' | 'revisione'

export interface Deadline {
  vehicleId: string
  kind: DeadlineKind
  date: string            // giorno di scadenza (ISO)
  label: string
  detail?: string
}
