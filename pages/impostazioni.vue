<template>
  <div class="page">
    <header class="topbar"><div class="grow"><div class="eyebrow">Impostazioni</div><h1>Altro</h1></div></header>

    <HoloCard glow="violet" :cut="20">
      <div class="garage">
        <div class="hexlogo"><CarFront :size="24" /></div>
        <div class="grow">
          <strong>Il mio garage</strong>
          <div class="g-sub">{{ count }} {{ count === 1 ? 'veicolo' : 'veicoli' }}{{ storage ? ' · ' + storage : '' }}</div>
        </div>
      </div>
    </HoloCard>

    <section class="section" style="margin-top: 16px">
      <div class="list">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="list-item">
          <div class="icon-bubble" :class="l.tone"><component :is="l.icon" :size="19" /></div>
          <div class="grow"><strong>{{ l.label }}</strong></div>
          <span v-if="l.value" class="faint" style="font-size: 13px">{{ l.value }}</span>
          <ChevronRight :size="18" class="faint" />
        </NuxtLink>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Notifiche</h2></div>
      <div class="list">
        <div class="list-item" style="cursor: default">
          <div class="icon-bubble" :class="permTone"><Bell :size="19" /></div>
          <div class="grow"><strong>Promemoria scadenze</strong><div class="faint" style="font-size: 13px">{{ permText }}</div></div>
          <button v-if="notificationState.permission !== 'granted' && notificationState.permission !== 'web'" class="btn sm" @click="enable">Attiva</button>
        </div>
        <button class="list-item" @click="test"><div class="icon-bubble"><BellRing :size="19" /></div><div class="grow"><strong>Invia una notifica di prova</strong><div class="faint" style="font-size: 13px">Arriva tra 3 secondi</div></div></button>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Lettura avanzata del libretto</h2></div>
      <div class="card flat stack" style="gap: 12px">
        <p class="muted" style="margin: 0; font-size: 14px">Il libretto viene letto sul telefono, senza internet. Se vuoi una lettura più precisa con foto storte o poco nitide, inserisci una chiave API di Claude (console.anthropic.com): le immagini vengono inviate solo quando scansioni un libretto. La chiave resta su questo telefono.</p>
        <FField v-model="key" label="Chiave API" placeholder="sk-ant-…" />
        <div class="row">
          <button class="btn sm" :disabled="key === aiSettings.apiKey" @click="aiSettings.apiKey = (key ?? '').trim(); toast('Chiave salvata')">Salva chiave</button>
          <button v-if="aiSettings.apiKey" class="btn sm danger" @click="aiSettings.apiKey = ''; key = ''">Rimuovi</button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Backup</h2></div>
      <div class="list">
        <button class="list-item" :disabled="busy" @click="doExport"><div class="icon-bubble accent"><Download :size="19" /></div>
          <div class="grow"><strong>Esporta backup</strong><div class="faint" style="font-size: 13px">Tutti i veicoli, foto e video in un file .zip da salvare su Drive o sul PC</div></div></button>
        <label class="list-item"><div class="icon-bubble"><Upload :size="19" /></div>
          <div class="grow"><strong>Ripristina backup</strong><div class="faint" style="font-size: 13px">Sostituisce i dati attuali con quelli del file</div></div>
          <input type="file" accept=".zip,application/zip" hidden @change="doImport" /></label>
      </div>
      <p class="faint" style="font-size: 13px">I dati restano solo su questo telefono: fai un backup ogni tanto, soprattutto prima di cambiare telefono.</p>
    </section>

    <section class="section">
      <div class="section-head"><h2>Aspetto</h2></div>
      <div class="segmented">
        <button v-for="t in themes" :key="t.value" :class="{ on: theme === t.value }" @click="setTheme(t.value)">{{ t.label }}</button>
      </div>
    </section>

    <section class="section about">
      <div class="logo"><CarFront :size="26" /></div>
      <strong>Veicoli</strong>
      <span class="faint">Versione {{ version }} · {{ count }} veicoli · {{ storage }}</span>
    </section>
  </div>
</template>
<script setup lang="ts">
import { Bell, BellRing, CalendarClock, CarFront, ChartLine, ChevronRight, Download, Upload } from 'lucide-vue-next'
const version = '1.0.0'
const key = ref(aiSettings.apiKey)
const busy = ref(false)
const { data: count } = useLive(() => db().vehicles.count(), 0)
const storage = ref('')
const links = computed(() => [
  { to: '/veicoli', label: 'I miei veicoli', icon: CarFront, tone: 'accent', value: `${count.value}` },
  { to: '/scadenze', label: 'Scadenze e notifiche', icon: CalendarClock, tone: 'warn', value: notificationState.permission === 'granted' ? 'Attive' : '' },
  { to: '/report', label: 'Report spese', icon: ChartLine, tone: 'cyan', value: '' },
])
onMounted(async () => {
  checkPermission()
  const est = await navigator.storage?.estimate?.()
  if (est?.usage !== undefined) storage.value = `${(est.usage / 1024 / 1024).toFixed(1).replace('.', ',')} MB usati`
  navigator.storage?.persist?.()
})
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
  } catch (e) {
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
  } catch (err) {
    toast(err instanceof Error ? err.message : 'Ripristino non riuscito', 'danger')
  }
}
const themes = [{ value: 'auto', label: 'Automatico' }, { value: 'dark', label: 'Scuro' }, { value: 'light', label: 'Chiaro' }]
const theme = ref(useTheme())
function setTheme(t: string) { theme.value = t; applyTheme(t) }
</script>
<style scoped>
.garage { display: flex; align-items: center; gap: 14px; padding: 18px 18px 18px 20px; }
.garage strong { font-family: var(--font-display); font-size: 18px; color: #fff; }
.g-sub { font-size: 13px; color: rgba(220, 225, 255, .7); margin-top: 2px; }
.hexlogo { width: 52px; height: 58px; flex: none; display: grid; place-items: center; color: #fff; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); background: linear-gradient(135deg, #7c5cff, #22e5ff); }
.about { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; margin-top: 34px; }
.logo { width: 56px; height: 62px; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); display: grid; place-items: center; color: white; background: linear-gradient(135deg, var(--accent), var(--accent-2)); box-shadow: 0 12px 28px -10px rgba(124, 92, 255, .8); }
.about span { font-size: 13px; }
</style>
