# Veicoli App

App Android per la gestione delle scadenze dei veicoli (bollo, assicurazione, revisione)
con notifiche automatiche 30gg, 15gg e 1gg prima della scadenza.

## Stack

- Vue 3 + Vite (SPA)
- Pinia (state management)
- Vue Router 4 (hash mode)
- Capacitor 6 (wrapper Android)
- @capacitor/local-notifications
- @capacitor/preferences (storage persistente)

---

## Setup iniziale (una sola volta)

```bash
# 1. Installa le dipendenze
npm install

# 2. Prima build
npm run build

# 3. Inizializza Capacitor (se non già fatto)
npx cap init "Veicoli" "it.andrea.veicoliapp" --web-dir dist

# 4. Aggiungi la piattaforma Android
npx cap add android

# 5. Sincronizza
npx cap sync android
```

---

## Permessi Android

Dopo `npx cap add android`, apri il file:

  `android/app/src/main/AndroidManifest.xml`

e aggiungi dentro `<manifest>` (prima di `<application>`):

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.USE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

Vedi anche il file `android-permissions-ref.xml` nella root del progetto.

---

## Sviluppo

```bash
# Dev server browser (senza notifiche native, tutto il resto funziona)
npm run dev

# Build + sync + apri Android Studio
npm run android
```

---

## Build APK in Android Studio

1. Apri il progetto con `npx cap open android` oppure `npm run android`
2. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. L'APK si trova in `android/app/build/outputs/apk/debug/app-debug.apk`

Per un APK firmato (release):
- **Build → Generate Signed Bundle / APK**
- Crea o usa un keystore esistente

---

## Aggiornare l'app

Ogni volta che modifichi il codice:

```bash
npm run build        # rebuild Vite
npx cap sync android # copia i file nell'Android project
# poi ricompila da Android Studio
```

Oppure usa lo script unico:

```bash
npm run android
```

---

## Struttura del progetto

```
src/
├── main.js                         # Entry point (+ init canale notifiche)
├── App.vue                         # Root component + transizioni
├── router/
│   └── index.js                    # Vue Router (hash mode)
├── stores/
│   └── vehicles.js                 # Pinia store + persistenza Preferences
├── composables/
│   └── useNotifications.js         # Logica Capacitor LocalNotifications
├── views/
│   ├── HomeView.vue                 # Lista veicoli + stats
│   ├── ScadenzeView.vue             # Scadenze filtrabili per urgenza
│   ├── NotificheView.vue            # Preview notifiche pianificate
│   ├── AddVehicleView.vue           # Form aggiunta/modifica veicolo
│   └── VehicleDetailView.vue        # Scheda dettaglio veicolo
├── components/
│   ├── VehicleCard.vue              # Card veicolo con barre scadenza
│   ├── DeadlineRow.vue              # Riga singola scadenza con barra
│   ├── DeadlineBadge.vue            # Pill colorato giorni rimanenti
│   └── BottomNav.vue                # Navigazione bottom tab
└── assets/
    └── main.css                     # Design system + CSS variables
```

---

## Logica notifiche

Le notifiche vengono pianificate in tre momenti per ogni scadenza:

| Trigger     | Orario  | Messaggio                              |
|-------------|---------|----------------------------------------|
| 30 giorni prima | 09:00 | "Scade tra 30 giorni (gg/mm/aaaa)"  |
| 15 giorni prima | 09:00 | "Scade tra 15 giorni (gg/mm/aaaa)"  |
| 1 giorno prima  | 09:00 | "⚠️ Scade domani! Assicurati di rinnovarlo" |

Le notifiche vengono cancellate e ricreate ad ogni modifica del veicolo.
È possibile forzare il ricalcolo dalla scheda dettaglio o dalla view Notifiche.

---

## Note sul bollo

Il bollo in Italia non ha una scadenza automaticamente calcolabile
(dipende da regione, esenzioni, rateizzazioni). La data di scadenza
va inserita manualmente dall'utente.

Per la **revisione**: la prima è a 4 anni dall'immatricolazione, poi ogni 2 anni.
È consigliabile aggiungere un calcolo automatico come futura feature.
