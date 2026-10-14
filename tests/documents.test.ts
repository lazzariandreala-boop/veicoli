import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyDocument, parseDocument } from '../utils/documents.ts'

// Estratti di letture OCR reali (dati personali sostituiti)
const fattura = `W      Bisson Auto s.p.a.
Concessionaria Volvo
POCLMENTO N 3480/44                      Et 20/10/2023                   ROSSI MARIO
TIPO DI DOCUMENTO VO-SC-FATTURA OFFICINA
COMMESSA | MOD VEICOLO                 TARGA                 KM                         TELAIO                                        NR FOGLIO
900          235A8120C1              FL862SV          130842                YV1PWA8BCJ1044067                       1
CODICE ARTICOLO       DESCRIZIONE                                             QUANTITA        PREZZO            SCONTO | IMPORTO         AL VA
INTERVENTO 1          Sost cablaggio batteria
31450530 SCATOLA FUSIBILI                               1,000       88,00               88,00 |22
37239  Quadretto distribuz. elettrica con p     0, 500     65,00            32,50 |22
20/10/23          147,01 sese VARE            sconto                     120,50        22                    26,51 |TOTALE IMPOSTA
 TOTALE NETTO                                                                          TOTALE DOCUMENTO
120,50                                                             _ 147,01`

const tagliando = `FATTURA FISCALE
|          V90 D4 AWD Geartronic | FL862SV                                          YV1PWA8BCJ1044067                                               70152
|             coocs                             DESCRIZIONE         il         | meno   x | iMaorto            NA
|         17301                      Tagliando base                                         UL           6.00     4,00         |               2400) 22%
32140029                  FILTRO OLIO                                           PZ          19.40)     1.00115,00%|                16,49| 22 %
39999130000         OLIO MOTORE VOLVO OW-20               LT       29,51|  5,20|12,00%)          135,04) 22 %
31658359              KIT PASTIGLIE FREN                         PZ       123.00) 1,00|12.00%)           108,24 | 22 %
I                                               Totale corrispettivo pagato. 567,00
i         FATTURA FISCALE               X | 0280599 0354        0103-05                    803306 | 29/07/2021                 1
IMPONIBILE
i                        120,00                     345,24                        0,00                   465,24                 102,35                      567,59`

const bollo = `pagoP    RICEVUTA DI PAGAMENTO
Data e ora
01 maggio 2025, 17:20:01
/RFB/96000017375524527/TXT/FL862SV-MAG2025/APR2026-XXXXXX00X00X000X-EC VENETO-E. 45%
Ente Creditore
Automobile Club Italia
Totale                   454,40 €`

const revisione = `CERTIFICATO DI REVISIONE
NATURA DEL CONTROLLO                                 (3) DATA                          CODICE ANTIFALSIFICAZIONE
REVISIONE    10/07/2025
N° autorizzazione: 127/1 del 22/06/2006
Ragione Sociale:
PUNTO REVISIONI VICENTINO S.R.L. SRL
(2) Targa             Stato        (5) Categoria
FL862SV | | 1 |] { Mm |]
(1) VIN / Telaio N°              (4) km
YV1PWA8BCJ1044067 | |__ 156428   |
(7) Risultato controllo tecnico
REGOLARE
(8ì Data del successivo controllo
Entro il 31/07/2027`

const polizza = `Unipol Assicurazioni S AA                                       CERTIFICATO DI ASSICURAZIONE
COD AGENZIA  COO SUDAO   RAMO POSLIONE ASSICURATIVA    AGUNZIA
1/42043_ [100    |30/219807983      ARLIGRANO
CONTRALNTE E SUO DOMICILIORE SOCNZA
TARGA VEICOLO
FL862SV
LFFCTTO GARANZIA
nuto etemusio i 23/04/2026
PERIONO DI ASSICURAZIONE PER NL QUALE É STATO PAGATO IL PREMIO
0001 DEL    24/04/2026   Mon   24/04/2027
CARTA VERDE`

const pra = `Pubblico Registro Automobilistico di VICENZA
Targa: FL862SV
Tipo richiesta: (33) TRASFERIMENTO DI PROPRIETA'
Registro progressivo: K890743T dei 07/09/2023 VI
Imposta di bolo                                   0.00
Totalo                                                    617,00`

test('riconosce il tipo di documento', () => {
  assert.equal(classifyDocument(fattura), 'fattura')
  assert.equal(classifyDocument(tagliando), 'fattura')
  assert.equal(classifyDocument(bollo), 'bollo')
  assert.equal(classifyDocument(revisione), 'revisione')
  assert.equal(classifyDocument(polizza), 'assicurazione')
  assert.equal(classifyDocument(pra), 'passaggio')
})

test('fattura officina: data, km, totale, righe', () => {
  const d = parseDocument([fattura])
  assert.equal(d.plate, 'FL862SV')
  assert.equal(d.vin, 'YV1PWA8BCJ1044067')
  assert.equal(d.date, '2023-10-20')
  assert.equal(d.km, 130842)
  assert.equal(d.total, 147.01)
  assert.equal(d.number, '3480/44')
  assert.equal(d.workshop, 'Bisson Auto S.P.A.')
  assert.equal(d.title, 'Sost cablaggio batteria')
  assert.equal(d.category, 'batteria')
  assert.deepEqual(d.items?.map((i) => i.amount), [88, 32.5])
})

test('tagliando: categoria e voci', () => {
  const d = parseDocument([tagliando])
  assert.equal(d.category, 'tagliando')
  assert.equal(d.date, '2021-07-29')
  assert.equal(d.km, 70152)
  assert.equal(d.total, 567.59)
  for (const k of ['olio', 'filtro-olio', 'pastiglie']) assert.ok(d.service?.includes(k), k)
})

test('bollo: periodo e prossimo pagamento', () => {
  const d = parseDocument([bollo])
  assert.equal(d.date, '2025-05-01')
  assert.equal(d.total, 454.4)
  assert.equal(d.fromMonth, '2025-05')
  assert.equal(d.toMonth, '2026-04')
  assert.equal(d.nextDueMonth, '2026-05')
  assert.equal(d.validityMonths, 12)
})

test('revisione: data, prossima, km, esito, centro', () => {
  const d = parseDocument([revisione])
  assert.equal(d.date, '2025-07-10')
  assert.equal(d.nextDate, '2027-07-31')
  assert.equal(d.km, 156428)
  assert.equal(d.outcome, 'regolare')
  assert.equal(d.center, 'PUNTO REVISIONI VICENTINO S.R.L.')
})

test('assicurazione: compagnia, periodo, polizza', () => {
  const d = parseDocument([polizza])
  assert.equal(d.company, 'Unipol')
  assert.equal(d.startDate, '2026-04-24')
  assert.equal(d.endDate, '2027-04-24')
  assert.equal(d.date, '2026-04-23')
  assert.equal(d.policyNumber, '30/219807983')
  assert.equal(d.plate, 'FL862SV')
})

test('passaggio di proprietà: data e totale', () => {
  const d = parseDocument([pra])
  assert.equal(d.date, '2023-09-07')
  assert.equal(d.total, 617)
  assert.equal(d.title, 'Passaggio di proprietà')
})
