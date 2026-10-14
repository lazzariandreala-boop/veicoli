# Veicoli

App Android (Nuxt 3 + Vue + Capacitor) per gestire auto, moto e altri veicoli: dati del libretto letti in automatico, acquisto e vendita, lavori con foto e fatture, incidenti con foto/video, spese e promemoria delle scadenze.

## Cosa fa

- **Più veicoli**, anche venduti, distrutti, rottamati o rubati (restano in archivio con lo storico) e con **targhe precedenti** o vecchie targhe provinciali.
- **Autocompilazione dal libretto**: fotografa la carta di circolazione o scegli il PDF. La lettura avviene sul telefono, offline (Tesseract OCR con due passaggi di pulizia dell'immagine), e riconosce i codici armonizzati (A, B, C.2.x, D.1–D.3, E, F, G, I, J, K, L, O, P, Q, S, U, V) più le note di pagina 3 (costruttore, misure, pneumatici, classe Euro, progressivo PRA). Facoltativa la *lettura avanzata* con Claude, inserendo una chiave API nelle Impostazioni.
- **Acquisto** (data, prezzo, venditore, dove, km) e **fine del possesso** (vendita con prezzo e acquirente, distruzione, rottamazione, furto).
- **Lavori** (tagliandi, gomme, carrozzeria…) con km, costo, officina, foto, video e PDF.
- **Incidenti**: torto/ragione/concorso, luogo, controparte, CAI, n° sinistro, danni, rimborso, foto e video; se il veicolo è distrutto passa in archivio.
- **Scadenze e notifiche** (sempre alle 9:00):
  - **Bollo**: inserisci la data di pagamento, l'app calcola il mese del prossimo pagamento (stesso mese dell'anno dopo, o mese fisso se la tua regione lo prevede) e ti avvisa **il 1° di quel mese**.
  - **Assicurazione**: avvisi **30 e 15 giorni prima, il giorno prima e il giorno stesso** della scadenza.
  - **Revisione** (in più): 4 anni dalla prima immatricolazione, poi ogni 2 anni; avviso il 1° del mese e 15 giorni prima.
- **Spese** per anno, per voce e per veicolo; bilancio completo di ogni veicolo.
- **Backup** in un file .zip (dati + foto + video) da salvare su Drive o PC, e ripristino.

I dati restano sul telefono (IndexedDB); nessun server.

## Sviluppo

```bash
npm install          # copia anche i file dell'OCR in public/ocr
npm run dev          # http://localhost:3000
npm test             # test del lettore del libretto e del calcolo scadenze
```

## Generare l'APK

Serve Android Studio (o l'SDK Android) e Java 21.

```bash
npm install
npm run apk:debug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

In alternativa `npm run cap:sync` e poi `npx cap open android` per aprire il progetto in Android Studio (Build ▸ Build APK).

### APK firmato (release)

1. Crea la chiave una volta sola (conservala bene: serve per tutti gli aggiornamenti):
   `keytool -genkey -v -keystore android/app/veicoli.jks -alias veicoli -keyalg RSA -keysize 2048 -validity 10000`
2. Crea `android/keystore.properties`:
   ```
   storeFile=veicoli.jks
   storePassword=...
   keyAlias=veicoli
   keyPassword=...
   ```
3. `npm run apk:release` → `android/app/build/outputs/apk/release/app-release.apk`

### Con GitHub Actions

Il workflow `.github/workflows/android.yml` costruisce l'APK a ogni push su `main` (o a mano da *Actions ▸ Run workflow*) e lo allega come artefatto `veicoli-apk`. Per l'APK firmato aggiungi i secret `ANDROID_KEYSTORE_BASE64` (`base64 -w0 veicoli.jks`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## Struttura

- `utils/libretto.ts` – lettura dei campi del libretto dal testo OCR (testata in `tests/`)
- `utils/deadlines.ts` – calcolo di bollo, assicurazione, revisione e promemoria
- `composables/ocr.ts` – OCR sul telefono (PDF e foto, binarizzazione globale e adattiva)
- `composables/ai.ts` – lettura avanzata facoltativa con Claude
- `composables/notifications.ts` – programmazione delle notifiche locali
- `composables/db.ts` – archivio locale (Dexie / IndexedDB)
- `pages/` – Garage, scheda veicolo, Scadenze, Spese, Impostazioni
- `scripts/make-icons.mjs` – genera le immagini di icona e splash in `assets/` (poi `npx capacitor-assets generate --android`)
