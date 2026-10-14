import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bolloNextDueMonth, buildReminders, nextInspectionDate, toISO } from '../utils/deadlines.ts'

test('bollo: si ripaga nello stesso mese dell\'anno dopo', () => {
  assert.equal(bolloNextDueMonth('2026-10-13'), '2027-10')
  assert.equal(bolloNextDueMonth('2026-01-31'), '2027-01')
})

test('bollo con mese fisso (es. gennaio)', () => {
  assert.equal(bolloNextDueMonth('2026-12-20', 12, 1), '2028-01')
  assert.equal(bolloNextDueMonth('2027-01-10', 12, 1), '2028-01')
  assert.equal(bolloNextDueMonth('2027-03-10', 12, 1), '2028-01')
})

test('revisione: 4 anni dalla prima immatricolazione, poi ogni 2', () => {
  assert.equal(nextInspectionDate('2026-10-13'), '2030-10-31')
  assert.equal(nextInspectionDate('2020-05-02', [{ id: 'r', vehicleId: 'v', date: '2024-05-10', outcome: 'regolare', createdAt: 0 }]), '2026-05-31')
})

const vehicle: any = { id: 'v1', status: 'attivo', plate: 'FX74364', libretto: { marca: 'CFMOTO', modello: '800MT', dataPrimaImmatricolazione: '2026-10-13' }, plateHistory: [], purchase: {} }

test('promemoria assicurazione a -30, -15, -1 e il giorno stesso alle 9', () => {
  const r = buildReminders([{ vehicle, bolli: [], inspections: [], policies: [{ id: 'p', vehicleId: 'v1', endDate: '2027-10-13', mediaIds: [], createdAt: 0 }] }], new Date(2026, 9, 14))
    .filter((x) => x.kind === 'assicurazione')
  assert.deepEqual(r.map((x) => toISO(x.at)), ['2027-09-13', '2027-09-28', '2027-10-12', '2027-10-13'])
  assert.ok(r.every((x) => x.at.getHours() === 9))
})

test('promemoria bollo il primo del mese di pagamento', () => {
  const r = buildReminders([{ vehicle, policies: [], inspections: [], bolli: [{ id: 'b', vehicleId: 'v1', paidDate: '2026-10-13', validityMonths: 12, nextDueMonth: '2027-10', createdAt: 0 }] }], new Date(2026, 9, 14))
    .filter((x) => x.kind === 'bollo')
  assert.deepEqual(r.map((x) => toISO(x.at)), ['2027-10-01'])
})

test('nessun promemoria per veicoli venduti', () => {
  const r = buildReminders([{ vehicle: { ...vehicle, status: 'venduto' }, policies: [{ id: 'p', vehicleId: 'v1', endDate: '2027-10-13', mediaIds: [], createdAt: 0 }], inspections: [], bolli: [] }], new Date(2026, 9, 14))
  assert.equal(r.length, 0)
})
