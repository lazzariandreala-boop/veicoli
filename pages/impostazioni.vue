<template>
  <div class="page">
    <header class="topbar"><h1>Impostazioni</h1></header>

    <NuxtLink to="/veicoli" class="card profile">
      <div class="avatar"><CarFront :size="24" /></div>
      <div class="grow">
        <strong>Il mio garage</strong>
        <div class="faint">{{ count }} {{ count === 1 ? 'veicolo' : 'veicoli' }}{{ storage ? ' · ' + storage : '' }}</div>
      </div>
      <ChevronRight :size="18" class="faint" />
    </NuxtLink>

    <div class="eyebrow" style="margin: 18px 0 8px">Account e cloud</div>
    <CloudCard />

    <div class="list rows">
      <component :is="r.to ? NuxtLink : 'button'" v-for="r in rows" :key="r.label" :to="r.to" class="list-item" @click="r.sheet && (sheet = r.sheet)">
        <component :is="r.icon" :size="21" class="row-ico" />
        <span class="grow label">{{ r.label }}</span>
        <span v-if="r.value" class="value">{{ r.value }}</span>
        <ChevronRight :size="17" class="faint" />
      </component>
    </div>

    <!-- Notifiche -->
    <BottomSheet :open="sheet === 'notifiche'" title="Scadenze e notifiche" @close="sheet = ''">
      <div class="list">
        <div class="list-item" style="cursor: default">
          <div class="icon-bubble" :class="permTone"><Bell :size="19" /></div>
          <div class="grow"><strong>Promemoria scadenze</strong><div class="faint" style="font-size: 13px">{{ permText }}</div></div>
          <button v-if="notificationState.permission !== 'granted' && notificationState.permission !== 'web'" class="btn sm" @click="enable">Attiva</button>
        </div>
        <button class="list-item" @click="test"><div class="icon-bubble"><BellRing :size="19" /></div><div class="grow"><strong>Invia una notifica di prova</strong><div class="faint" style="font-size: 13px">Arriva tra 3 secondi</div></div></button>
        <NuxtLink to="/scadenze" class="list-item" @click="sheet = ''"><div class="icon-bubble accent"><CalendarClock :size="19" /></div><div class="grow"><strong>Vedi tutte le scadenze</strong></div></NuxtLink>
      </div>
      <p class="faint" style="font-size: 13px">Bollo: il 1° del mese in cui va pagato. Assicurazione: 30 e 15 giorni prima, il giorno prima e il giorno stesso. Revisione: il 1° del mese e 15 giorni prima. Sempre alle 9:00.</p>
    </BottomSheet>

    <!-- Tema -->
    <BottomSheet :open="sheet === 'tema'" title="Tema" @close="sheet = ''">
      <div class="segmented">
        <button v-for="t in themes" :key="t.value" :class="{ on: theme === t.value }" @click="setTheme(t.value)">{{ t.label }}</button>
      </div>
      <p class="faint" style="font-size: 13px">Automatico segue il tema chiaro o scuro del telefono.</p>
    </BottomSheet>

    <!-- Lettura avanzata -->
    <BottomSheet :open="sheet === 'ai'" title="Lettura avanzata del libretto" @close="sheet = ''">
      <div class="stack" style="gap: 12px">
        <p class="muted" style="margin: 0; font-size: 14px">Il libretto viene letto sul telefono, senza internet. Se vuoi una lettura più precisa con foto storte o poco nitide, inserisci una chiave API di Claude (console.anthropic.com): le immagini vengono inviate solo quando scansioni un libretto. La chiave resta su questo telefono.</p>
        <FField v-model="key" label="Chiave API" placeholder="sk-ant-…" />
        <div class="row">
          <button class="btn sm primary" :disabled="key === aiSettings.apiKey" @click="aiSettings.apiKey = (key ?? '').trim(); toast('Chiave salvata')">Salva chiave</button>
          <button v-if="aiSettings.apiKey" class="btn sm danger" @click="aiSettings.apiKey = ''; key = ''">Rimuovi</button>
        </div>
      </div>
    </BottomSheet>

    <!-- Backup -->
    <BottomSheet :open="sheet === 'backup'" title="Backup dati" @close="sheet = ''">
      <div class="list">
        <button class="list-item" :disabled="busy" @click="doExport"><div class="icon-bubble accent"><Download :size="19" /></div>
          <div class="grow"><strong>Esporta backup</strong><div class="faint" style="font-size: 13px">Tutti i veicoli, foto e video in un file .zip da salvare su Drive o sul PC</div></div></button>
        <label class="list-item"><div class="icon-bubble"><Upload :size="19" /></div>
          <div class="grow"><strong>Ripristina backup</strong><div class="faint" style="font-size: 13px">Sostituisce i dati attuali con quelli del file</div></div>
          <input type="file" accept=".zip,application/zip" hidden @change="doImport" /></label>
      </div>
      <p v-if="cloud.user" class="faint" style="font-size: 13px">I dati e le foto dei veicoli sono nel cloud; i file dei documenti (foto e PDF) restano solo qui: il backup li salva tutti.</p>
      <p v-else class="faint" style="font-size: 13px">Senza account i dati restano solo su questo telefono: accedi con Google oppure fai un backup ogni tanto.</p>
    </BottomSheet>

    <!-- Info -->
    <BottomSheet :open="sheet === 'info'" title="Info app" @close="sheet = ''">
      <div class="about">
        <div class="logo"><CarFront :size="26" /></div>
        <strong>Veicoli</strong>
        <span class="faint">Versione {{ version }} · {{ count }} veicoli · {{ storage }}</span>
        <p class="faint credits">Modello 3D dell'auto: "Car Concept" dai glTF Sample Assets di Khronos, basato sul modello di Unity Fan, licenza CC BY 4.0. Modello 3D della moto fornito da Andrea (creato con Meshy).</p>
      </div>
    </BottomSheet>
  </div>
</template>
<script setup lang="ts">
import { Bell, BellRing, CalendarClock, CarFront, ChartColumn, ChevronRight, DatabaseBackup, Download, Info, Palette, ScanText, Upload, Wallet } from 'lucide-vue-next'
import { NuxtLink } from '#components'

const version = '1.1.0'
const route = useRoute()
const key = ref(aiSettings.apiKey)
const busy = ref(false)
const sheet = ref(route.query.backup ? 'backup' : '')
const { data: count } = useLive(() => db().vehicles.count(), 0)
const storage = ref('')
onMounted(async () => {
  checkPermission()
  const est = await navigator.storage?.estimate?.()
  if (est?.usage !== undefined) storage.value = `${(est.usage / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
  navigator.storage?.persist?.()
})
const themes = [{ value: 'auto', label: 'Automatico' }, { value: 'dark', label: 'Scuro' }, { value: 'light', label: 'Chiaro' }]
const theme = ref(useTheme())
function setTheme(t: string) { theme.value = t; applyTheme(t) }
const rows = computed(() => [
  { label: 'I miei veicoli', icon: CarFront, to: '/veicoli', value: `${count.value} ${count.value === 1 ? 'veicolo' : 'veicoli'}` },
  { label: 'Scadenze e notifiche', icon: Bell, sheet: 'notifiche', value: notificationState.permission === 'granted' ? 'Attive' : '' },
  { label: 'Categorie spese', icon: Wallet, to: '/spese' },
  { label: 'Report', icon: ChartColumn, to: '/report' },
  { label: 'Tema', icon: Palette, sheet: 'tema', value: themes.find((t) => t.value === theme.value)?.label },
  { label: 'Lettura avanzata', icon: ScanText, sheet: 'ai', value: aiSettings.apiKey ? 'Attiva' : 'Offline' },
  { label: 'Backup dati', icon: DatabaseBackup, sheet: 'backup' },
  { label: 'Info app', icon: Info, sheet: 'info' },
] as { label: string; icon: any; to?: string; sheet?: string; value?: string }[])
const permTone = computed(() => (notificationState.permission === 'granted' ? 'ok' : notificationState.permission === 'web' ? '' : 'warn'))
const permText = computed(() => ({
  granted: `Attive · ${notificationState.scheduled} promemoria programmati`,
  denied: 'Bloccate: attivale dalle impostazioni di Android',
  prompt: 'Non ancora autorizzate',
  unknown: 'Verifica in corso',
  web: 'Disponibili nell\'app Android',
} as Record<string, string>)[notificationState.permission])
async function enable() {
  if ((await requestPermission()) === 'granted') { await syncReminders(); toast('Notifiche attivate') }
  else toast('Attiva le notifiche dalle impostazioni di Android', 'danger')
}
async function test() { await sendTestNotification(); toast('Notifica in arrivo', 'info') }
async function doExport() {
  busy.value = true
  try {
    const { blob, filename } = await exportBackup()
    await shareBlob(blob, filename, 'Backup Veicoli')
  } catch {
    toast('Backup non riuscito', 'danger')
  } finally { busy.value = false }
}
async function doImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!(await confirmDialog({ title: 'Ripristinare il backup?', text: 'I dati attuali verranno sostituiti da quelli del file.', ok: 'Ripristina', danger: true }))) return
  try {
    const r = await importBackup(file)
    toast(`Ripristinati ${r.vehicles} veicoli`)
    sheet.value = ''
  } catch (err) {
    toast(err instanceof Error ? err.message : 'Ripristino non riuscito', 'danger')
  }
}
</script>
<style scoped>
.profile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; margin-bottom: 16px; }
.profile strong { font-size: 16.5px; color: var(--title); }
.profile .faint { font-size: 13px; margin-top: 2px; }
.avatar { width: 54px; height: 54px; flex: none; border-radius: 50%; display: grid; place-items: center; color: #fff; background: var(--grad-primary); box-shadow: var(--grad-primary-glow), inset 0 0 0 3px rgba(255, 255, 255, .25); }
.rows .list-item { padding: 15px 18px; gap: 14px; }
.row-ico { color: var(--text-2); flex: none; }
.label { font-size: 15px; font-weight: 500; color: var(--text); }
.value { font-size: 13px; color: var(--text-3); }
.about { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; padding: 6px 0 4px; }
.logo { width: 56px; height: 62px; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); display: grid; place-items: center; color: white; background: linear-gradient(135deg, var(--accent), var(--accent-2)); }
.about span { font-size: 13px; }
.credits { font-size: 12px; margin-top: 10px; }
</style>
