<template>
  <div class="page">
    <header class="topbar"><h1>Profilo</h1></header>

    <div class="eyebrow" style="margin: 4px 0 8px">Account Google</div>
    <CloudCard />

    <button v-if="cloud.user" class="card plan" :class="{ pro: isPremium }" @click="openPaywall()">
      <div class="plan-ico"><Crown :size="22" /></div>
      <div class="grow">
        <strong>{{ isPremium ? 'Premium attivo' : 'Piano gratuito' }}</strong>
        <div class="faint">{{ isPremium ? (premium.expires ? 'Si rinnova il ' + formatDate(premium.expires.slice(0, 10)) : 'Tutte le funzioni sbloccate') : `1 veicolo con libretto e foto · Premium ${premium.price}` }}</div>
      </div>
      <span v-if="!isPremium" class="btn sm primary">Passa a Premium</span>
      <ChevronRight v-else :size="18" class="faint" />
    </button>

    <div class="eyebrow" style="margin: 22px 0 8px">Impostazioni</div>

    <NuxtLink to="/veicoli" class="card profile">
      <div class="avatar"><CarFront :size="24" /></div>
      <div class="grow">
        <strong>Il mio garage</strong>
        <div class="faint">{{ count }} {{ count === 1 ? 'veicolo' : 'veicoli' }}{{ storage ? ' · ' + storage : '' }}</div>
      </div>
      <ChevronRight :size="18" class="faint" />
    </NuxtLink>

    <div class="list rows">
      <component :is="r.to ? NuxtLink : 'button'" v-for="r in rows" :key="r.label" :to="r.to" class="list-item" @click="r.sheet && (sheet = r.sheet)">
        <component :is="r.icon" :size="21" class="row-ico" />
        <span class="grow label">{{ r.label }}</span>
        <span v-if="r.lock && !isPremium" class="pro-tag"><Lock :size="11" /> Premium</span>
        <span v-else-if="r.value" class="value">{{ r.value }}</span>
        <ChevronRight :size="17" class="faint" />
      </component>
    </div>

    <div class="eyebrow" style="margin: 22px 0 8px">Account e privacy</div>
    <div class="list rows">
      <button v-if="cloud.user" class="list-item" @click="copyId">
        <Fingerprint :size="21" class="row-ico" /><span class="grow label">ID account</span><span class="value mono">{{ cloud.user.uid.slice(0, 10) }}…</span><Copy :size="16" class="faint" />
      </button>
      <a v-if="premium.store" :href="manageSubscriptionUrl()" target="_blank" class="list-item">
        <Crown :size="21" class="row-ico" /><span class="grow label">Gestisci o disdici l'abbonamento</span><ChevronRight :size="17" class="faint" />
      </a>
      <NuxtLink to="/privacy" class="list-item"><ShieldCheck :size="21" class="row-ico" /><span class="grow label">Informativa privacy</span><ChevronRight :size="17" class="faint" /></NuxtLink>
      <NuxtLink to="/termini" class="list-item"><FileText :size="21" class="row-ico" /><span class="grow label">Termini di servizio</span><ChevronRight :size="17" class="faint" /></NuxtLink>
      <button v-if="cloud.user" class="list-item" @click="sheet = 'elimina'"><Trash2 :size="21" class="row-ico danger-ico" /><span class="grow label" style="color: var(--danger)">Elimina account</span><ChevronRight :size="17" class="faint" /></button>
    </div>

    <!-- Elimina account -->
    <BottomSheet :open="sheet === 'elimina'" title="Elimina account" @close="!deleting && (sheet = '')">
      <div class="stack" style="gap: 12px">
        <p class="muted" style="margin: 0; font-size: 14px">Vengono cancellati per sempre:</p>
        <ul class="del-list">
          <li>i veicoli, le scadenze, le spese e le foto salvati nel cloud;</li>
          <li>tutti i dati e i file su questo telefono;</li>
          <li>il tuo account in Veicoli Personali.</li>
        </ul>
        <p class="muted" style="margin: 0; font-size: 14px">Se vuoi tenere una copia, prima fai un <button class="linkish" @click="sheet = 'backup'">backup</button>.</p>
        <p v-if="premium.store" class="warn-box">L'abbonamento Premium non si ferma da solo: disdicilo da <a :href="manageSubscriptionUrl()" target="_blank">{{ storeName }}</a>, altrimenti continua a rinnovarsi.</p>
        <p class="faint" style="margin: 0; font-size: 13px">Ti chiederò di confermare l'account Google.</p>
        <button class="btn danger block" :disabled="deleting" @click="removeAccount">
          <LoaderCircle v-if="deleting" :size="18" class="spin" /> {{ deleting ? deleteStage : 'Elimina tutto per sempre' }}
        </button>
      </div>
    </BottomSheet>

    <!-- Notifiche -->
    <BottomSheet :open="sheet === 'notifiche'" title="Scadenze e notifiche" @close="sheet = ''">
      <template v-if="!isPremium">
        <PremiumLock feature="notifiche" title="Notifiche delle scadenze" />
        <p class="faint" style="font-size: 13px">Nel piano gratuito l'app non invia notifiche. Con Premium ricevi un promemoria prima di bollo, assicurazione e revisione.</p>
      </template>
      <div v-else class="list">
        <div class="list-item" style="cursor: default">
          <div class="icon-bubble" :class="permTone"><Bell :size="19" /></div>
          <div class="grow"><strong>Promemoria scadenze</strong><div class="faint" style="font-size: 13px">{{ permText }}</div></div>
          <button v-if="notificationState.permission !== 'granted' && notificationState.permission !== 'web'" class="btn sm" @click="enable">Attiva</button>
        </div>
        <button class="list-item" @click="test"><div class="icon-bubble"><BellRing :size="19" /></div><div class="grow"><strong>Invia una notifica di prova</strong><div class="faint" style="font-size: 13px">Arriva tra 3 secondi</div></div></button>
        <NuxtLink to="/scadenze" class="list-item" @click="sheet = ''"><div class="icon-bubble accent"><CalendarClock :size="19" /></div><div class="grow"><strong>Vedi tutte le scadenze</strong></div></NuxtLink>
      </div>
      <p v-if="isPremium" class="faint" style="font-size: 13px">Bollo: il 1° del mese in cui va pagato. Assicurazione: 30 e 15 giorni prima, il giorno prima e il giorno stesso. Revisione: il 1° del mese e 15 giorni prima. Sempre alle 9:00.</p>
    </BottomSheet>

    <!-- Tema -->
    <BottomSheet :open="sheet === 'tema'" title="Tema" @close="sheet = ''">
      <div class="segmented">
        <button v-for="t in themes" :key="t.value" :class="{ on: theme === t.value }" @click="setTheme(t.value)">{{ t.label }}</button>
      </div>
      <p class="faint" style="font-size: 13px">Automatico segue il tema chiaro o scuro del telefono.</p>
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
        <strong>Veicoli Personali</strong>
        <span class="faint">Versione {{ version }} · {{ count }} veicoli · {{ storage }}</span>
        <p class="faint credits">Modello 3D dell'auto: "Car Concept" dai glTF Sample Assets di Khronos, basato sul modello di Unity Fan, licenza CC BY 4.0. Modello 3D della moto fornito da Andrea (creato con Meshy).</p>
      </div>
    </BottomSheet>
  </div>
</template>
<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { Bell, BellRing, CalendarClock, CarFront, ChartColumn, ChevronRight, Copy, Crown, DatabaseBackup, Download, FileText, Fingerprint, Info, LoaderCircle, Lock, Palette, ShieldCheck, Trash2, Upload, Wallet } from 'lucide-vue-next'
import { formatDate } from '~/utils/deadlines'
import { NuxtLink } from '#components'

const version = '1.2.0'
const route = useRoute()
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
  { label: 'Scadenze e notifiche', icon: Bell, sheet: 'notifiche', value: notificationState.permission === 'granted' ? 'Attive' : '', lock: true },
  { label: 'Spese', icon: Wallet, to: '/spese', lock: true },
  { label: 'Report', icon: ChartColumn, to: '/report', lock: true },
  { label: 'Tema', icon: Palette, sheet: 'tema', value: themes.find((t) => t.value === theme.value)?.label },
  { label: 'Backup dati', icon: DatabaseBackup, sheet: 'backup' },
  { label: 'Info app', icon: Info, sheet: 'info' },
] as { label: string; icon: any; to?: string; sheet?: string; value?: string; lock?: boolean }[])
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
async function test() { if ((await sendTestNotification()) !== false) toast('Notifica in arrivo', 'info') }
const storeName = Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Google Play'
async function copyId() {
  try { await navigator.clipboard.writeText(cloud.user!.uid); toast('ID copiato') } catch { toast(cloud.user!.uid, 'info') }
}
const deleting = ref(false)
const deleteStage = ref('')
async function removeAccount() {
  if (!(await confirmDialog({ title: 'Eliminare l\'account?', text: 'Non si può annullare: i tuoi dati vengono cancellati dal cloud e da questo telefono.', ok: 'Elimina', danger: true }))) return
  deleting.value = true
  try {
    await deleteAccount((s) => { deleteStage.value = s })
    sheet.value = ''
    await navigateTo('/')
    toast('Account eliminato')
  } catch (e: any) {
    console.error(e)
    toast(/cancel|popup-closed/i.test(String(e?.code ?? e?.message)) ? 'Eliminazione annullata' : 'Eliminazione non riuscita: ' + (e?.message ?? e), 'danger')
    if (cloud.user) retrySync()
  } finally { deleting.value = false }
}
async function doExport() {
  busy.value = true
  try {
    const { blob, filename } = await exportBackup()
    await shareBlob(blob, filename, 'Backup Veicoli Personali')
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
.plan { display: flex; align-items: center; gap: 14px; width: 100%; margin-top: 12px; padding: 14px 16px; text-align: left; cursor: pointer; color: inherit; font: inherit; }
.plan strong { font-size: 15.5px; color: var(--title); }
.plan .faint { font-size: 12.5px; margin-top: 2px; }
.plan-ico { width: 44px; height: 44px; flex: none; border-radius: 14px; display: grid; place-items: center; color: var(--violet); background: var(--accent-soft); }
.plan.pro .plan-ico { color: #fff; background: var(--grad-primary); box-shadow: var(--grad-primary-glow); }
.pro-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: var(--violet); background: var(--accent-soft); padding: 3px 8px; border-radius: 7px; }
.mono { font-family: ui-monospace, monospace; }
.danger-ico { color: var(--danger); }
.del-list { margin: 0; padding-left: 20px; font-size: 14px; color: var(--text); display: flex; flex-direction: column; gap: 4px; }
.warn-box { margin: 0; padding: 10px 12px; border-radius: 12px; font-size: 13.5px; background: var(--warn-soft); color: var(--warn); font-weight: 600; }
.warn-box a { color: inherit; text-decoration: underline; }
.linkish { background: none; border: 0; padding: 0; font: inherit; color: var(--violet); font-weight: 600; cursor: pointer; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
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
