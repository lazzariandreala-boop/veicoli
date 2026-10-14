<template>
  <div class="page">
    <header class="topbar">
      <h1>Scadenze</h1>
      <span class="icon-btn" aria-hidden="true"><Bell :size="20" /><i v-if="soonCount" class="dot" /></span>
    </header>

    <div v-if="notificationState.permission === 'denied' || notificationState.permission === 'prompt'" class="card flat warnbox" style="margin-bottom: 14px">
      <div class="row"><BellOff :size="20" /><div class="grow"><strong>Notifiche disattivate</strong><div class="faint" style="font-size: 13px">Attivale per ricevere i promemoria di bollo e assicurazione.</div></div>
        <button class="btn sm" @click="enable">Attiva</button></div>
    </div>

    <template v-if="deadlines.length">
      <div class="segmented">
        <button v-for="f in filters" :key="f.value" :class="{ on: filter === f.value }" @click="filter = f.value">{{ f.label }}</button>
      </div>

      <!-- Sfere olografiche -->
      <div v-if="orbs.length" class="orbs" :style="{ height: orbH + 'px' }">
        <svg class="links" :viewBox="`0 0 100 ${orbH}`" preserveAspectRatio="none" aria-hidden="true">
          <line v-for="(o, i) in orbs.slice(1)" :key="'l' + i" :x1="orbs[i]!.x" :y1="orbs[i]!.y" :x2="o.x" :y2="o.y" />
        </svg>
        <NuxtLink v-for="o in orbs" :key="o.d.vehicleId + o.d.kind" :to="`/veicoli/${o.d.vehicleId}?tab=scadenze`" class="orb" :class="[o.d.kind, urgency(o.d.days)]"
          :style="{ left: o.x + '%', top: o.y + 'px', width: o.size + 'px', height: o.size + 'px' }">
          <component :is="ICONS[o.d.kind]" :size="26" class="orb-ico" />
          <strong>{{ o.d.label }}</strong>
          <span class="ellipsis">{{ shortName(o.d) }}</span>
          <em>{{ relativeDays(o.d.days) }}</em>
        </NuxtLink>
      </div>

      <div v-if="soonCount" class="banner">
        <Sparkles :size="18" />
        <span>Hai <b>{{ soonCount }}</b> scadenz{{ soonCount === 1 ? 'a' : 'e' }} nei prossimi 30 giorni</span>
      </div>

      <section class="section" style="margin-top: 16px">
        <div class="stack" style="gap: 10px">
          <NuxtLink v-for="d in shown" :key="d.vehicleId + d.kind" :to="`/veicoli/${d.vehicleId}?tab=scadenze`" class="dl-row" :class="[d.kind, urgency(d.days)]">
            <div class="date-box"><b>{{ day(d.date) }}</b><span>{{ mon(d.date) }}</span></div>
            <div class="grow" style="min-width: 0">
              <strong>{{ d.label }}</strong>
              <div class="faint ellipsis" style="font-size: 13px">{{ vehicleName(d.vehicle) }}{{ d.vehicle.plate ? ' · ' + d.vehicle.plate : '' }}</div>
            </div>
            <span class="chip" :class="urgency(d.days)">{{ relativeDays(d.days) }}</span>
          </NuxtLink>
        </div>
        <div v-if="!shown.length" class="empty"><p>Nessuna scadenza in questo filtro.</p></div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Prossime notifiche</h2></div>
        <div v-if="upcoming.length" class="list">
          <div v-for="r in upcoming" :key="r.id" class="list-item" style="cursor: default">
            <div class="icon-bubble accent"><Bell :size="18" /></div>
            <div class="grow"><strong style="font-size: 14px">{{ r.title }}</strong><div class="faint" style="font-size: 12.5px">{{ fmtWhen(r.at) }}</div></div>
          </div>
        </div>
        <p class="faint" style="font-size: 13px">Bollo: il 1° del mese in cui va pagato. Assicurazione: 30 e 15 giorni prima, il giorno prima e il giorno stesso. Revisione: il 1° del mese e 15 giorni prima. Sempre alle 9:00.</p>
      </section>
    </template>
    <div v-else class="empty" style="margin-top: 40px">
      <div class="icon-bubble accent"><CalendarCheck :size="28" /></div>
      <h3>Nessuna scadenza</h3>
      <p>Registra bollo e assicurazione nella scheda di un veicolo: le date e i promemoria arrivano da soli.</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Bell, BellOff, CalendarCheck, ClipboardCheck, Landmark, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'
import type { DeadlineView } from '~/composables/garage'

const { deadlines: all } = useGarage()
const deadlines = computed(() => all.value.filter((d) => d.vehicle.status === 'attivo'))
const ICONS: Record<string, any> = { bollo: Landmark, assicurazione: ShieldCheck, revisione: ClipboardCheck }
const filter = ref<'tutte' | 'scadenza' | 'prossime'>('tutte')
const filters = [
  { value: 'tutte', label: 'Tutte' },
  { value: 'scadenza', label: 'In scadenza' },
  { value: 'prossime', label: 'Prossime' },
] as const
const shown = computed(() => deadlines.value.filter((d) => filter.value === 'tutte' ? true : filter.value === 'scadenza' ? d.days <= 30 : d.days > 30))
const soonCount = computed(() => deadlines.value.filter((d) => d.days <= 30).length)

// Posizioni a zig-zag (x in %, y in px) per le sfere collegate
const SLOTS = [{ x: 68, y: 92 }, { x: 28, y: 196 }, { x: 68, y: 300 }, { x: 30, y: 400 }, { x: 70, y: 500 }]
const orbs = computed(() => shown.value.slice(0, 5).map((d, i) => {
  const size = d.days <= 7 ? 156 : d.days <= 30 ? 146 : d.days <= 90 ? 136 : 128
  return { d, size, ...SLOTS[i]! }
}))
const orbH = computed(() => (orbs.value.length ? SLOTS[orbs.value.length - 1]!.y + 86 : 0))
const shortName = (d: DeadlineView) => d.vehicle.nickname || d.vehicle.libretto.modello || d.vehicle.plate

const upcoming = computed(() => notificationState.upcoming.slice(0, 8))
const M = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC']
const day = (iso: string) => Number(iso.slice(8, 10))
const mon = (iso: string) => `${M[Number(iso.slice(5, 7)) - 1]} ${iso.slice(2, 4)}`
const fmtWhen = (d: Date) => d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' alle ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
async function enable() {
  const p = await requestPermission()
  if (p === 'granted') { await syncReminders(); toast('Notifiche attivate') }
  else toast('Attiva le notifiche dalle impostazioni di Android', 'danger')
}
onMounted(() => { checkPermission(); syncReminders() })
</script>
<style scoped>
.orbs { position: relative; margin: 18px 0 6px; }
.links { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.links line { stroke: rgba(140, 150, 220, .55); stroke-width: 1.4; vector-effect: non-scaling-stroke; }
.orb { --c: 140, 110, 255; --c2: 220, 210, 255; position: absolute; transform: translate(-50%, -50%); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; text-align: center; padding: 14px; color: #1b1d3a;
  background: radial-gradient(circle at 34% 28%, rgba(255, 255, 255, .95) 0%, rgba(var(--c2), .9) 34%, rgba(var(--c), .55) 78%, rgba(var(--c), .75) 100%);
  border: 1.5px solid rgba(255, 255, 255, .8);
  box-shadow: 0 0 30px rgba(var(--c), .55), 0 18px 30px -12px rgba(var(--c), .7), inset 0 -10px 24px rgba(var(--c), .45), inset 0 8px 16px rgba(255, 255, 255, .7);
  animation: float 6s ease-in-out infinite; }
.orb:nth-of-type(2n) { animation-delay: -3s; }
.orb.bollo { --c: 255, 176, 64; --c2: 255, 232, 196; }
.orb.assicurazione { --c: 60, 214, 240; --c2: 205, 247, 255; }
.orb.revisione { --c: 150, 120, 255; --c2: 228, 220, 255; }
.orb .orb-ico { color: rgb(var(--c)); filter: saturate(1.4) brightness(.85); }
.orb strong { font-family: var(--font-display); font-size: 17px; line-height: 1.1; }
.orb span { font-size: 11px; opacity: .7; max-width: 92%; }
.orb em { font-style: normal; font-size: 11.5px; font-weight: 700; margin-top: 2px; opacity: .85; }
.orb.danger { box-shadow: 0 0 0 3px rgba(255, 92, 138, .7), 0 0 30px rgba(255, 92, 138, .7), inset 0 -10px 24px rgba(var(--c), .45), inset 0 8px 16px rgba(255, 255, 255, .7); }
@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) .orb { color: #fff; background: radial-gradient(circle at 34% 28%, rgba(var(--c), .32) 0%, rgba(14, 18, 44, .9) 62%, rgba(var(--c), .35) 100%); border-color: rgba(var(--c), .85); box-shadow: 0 0 26px rgba(var(--c), .55), inset 0 0 26px rgba(var(--c), .35); } }
:root[data-theme='dark'] .orb { color: #fff; background: radial-gradient(circle at 34% 28%, rgba(var(--c), .32) 0%, rgba(14, 18, 44, .9) 62%, rgba(var(--c), .35) 100%); border-color: rgba(var(--c), .85); box-shadow: 0 0 26px rgba(var(--c), .55), inset 0 0 26px rgba(var(--c), .35); }
@keyframes float { 50% { transform: translate(-50%, calc(-50% - 6px)); } }
.banner { display: flex; align-items: center; gap: 10px; padding: 13px 18px; border-radius: 999px; color: #fff; font-size: 14px;
  background: var(--grad-primary); box-shadow: var(--grad-primary-glow); }
.banner b { color: #7fe9ff; }
.dl-row { --c: 124, 92, 255; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: var(--card-bg); border: 1px solid var(--card-border); box-shadow: var(--shadow); }
.dl-row.bollo { --c: 255, 168, 32; }
.dl-row.assicurazione { --c: 25, 227, 177; }
.dl-row strong { font-size: 15px; }
.date-box { width: 48px; height: 52px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none; background: rgba(var(--c), .14); color: rgb(var(--c)); box-shadow: inset 0 0 0 1px rgba(var(--c), .4); }
.date-box b { font-size: 19px; font-family: var(--font-display); line-height: 1; }
.date-box span { font-size: 10px; font-weight: 700; letter-spacing: .04em; margin-top: 3px; opacity: .8; }
.warnbox { border-color: rgba(251, 191, 36, .35); color: var(--warn); }
.warnbox strong { color: var(--text); }
</style>
