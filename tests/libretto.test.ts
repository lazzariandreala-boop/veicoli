import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseLibretto, normalizePlate, parseDate } from '../utils/libretto.ts'

const expected = {
  targa: 'FX74364', numeroArchivio: 'M020903VI26', dataPrimaImmatricolazione: '2026-10-13',
  intestatarioCognome: 'LAZZARI', intestatarioNome: 'ANDREA', codiceFiscale: 'LZZNDR93R20A459D',
  indirizzo: 'VIA RAFFAELLO 5, VALDAGNO (VI)', marca: 'CFMOTO', tipo: 'CF800-5H 00 A', modello: '800MT',
  telaio: 'LCEPEYLM8S8018621', massaMax: 413, categoria: 'L3e', carrozzeria: 'M0 (MOTOCICLO)',
  cilindrata: 799, potenzaKw: 67, alimentazione: 'Benzina', codiceMotore: '288MW', posti: 2,
  livelloSonoro: 92, regimeGiri: 4625, co2: 120, direttivaAmbientale: '134/2014/UE', classeEuro: 'Euro 5+',
  lunghezza: 2.234, larghezza: 0.853, progressivoPra: '26/0843193R', tipoVeicolo: 'moto',
}

for (const f of ['libretto-cfmoto-global.txt', 'libretto-cfmoto-adaptive.txt']) {
  test(`libretto CFMOTO 800MT (${f})`, () => {
    const r: any = parseLibretto(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'))
    for (const [k, v] of Object.entries(expected)) assert.equal(r[k], v, k)
  })
}

test('targhe e date con errori OCR tipici', () => {
  assert.equal(normalizePlate('FXI4364'), 'FX14364')
  assert.equal(normalizePlate('AB 1Z3 CD'), 'AB123CD')
  assert.equal(normalizePlate('A8123C0'), 'AB123CO')
  assert.equal(parseDate('l3.1O.2026'), '2026-10-13')
})

test('più passaggi OCR uniti: targa per maggioranza', async () => {
  const { parseLibrettoMulti } = await import('../utils/libretto.ts')
  const texts = ['libretto-cfmoto-otsu.txt', 'libretto-cfmoto-adaptive.txt'].map((f) => readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'))
  const r: any = parseLibrettoMulti(texts)
  for (const [k, v] of Object.entries(expected)) assert.equal(r[k], v, k)
  assert.equal(r.usoDestinazione, 'MOTOCICLO PER TRASPORTO PERSONE - USO PROPRIO')
})

test('lettura reale fatta nel browser dal PDF del libretto', async () => {
  const { parseLibrettoMulti } = await import('../utils/libretto.ts')
  const texts = ['libretto-cfmoto-browser-otsu.txt', 'libretto-cfmoto-browser-adaptive.txt'].map((f) => readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'))
  const r: any = parseLibrettoMulti(texts)
  for (const [k, v] of Object.entries(expected)) assert.equal(r[k], v, k)
  assert.match(r.costruttore, /^ZHEJIANG CFMOTO POWER CO\.,\s?LTD\.$/)
})
