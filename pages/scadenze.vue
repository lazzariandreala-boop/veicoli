<template>
  <div class="page">
    <header class="topbar"><h1>Scadenze</h1></header>

    <div v-if="notificationState.permission === 'denied' || notificationState.permission === 'prompt'" class="card flat warnbox">
      <div class="row"><BellOff :size="20" /><div class="grow"><strong>Notifiche disattivate</strong><div class="faint" style="font-size: 13px">Attivale per ricevere i promemoria di bollo e assicurazione.</div></div>
        <button class="btn sm" @click="enable">Attiva</button></div>
    </div>

    <template v-if="deadlines.length">
      <section v-for="g in groups" :key="g.title" class="section" style="margin-top: 18px">
        <div class="section-head"><h2>{{ g.title }}</h2><span class="faint">{{ g.items.length }}</span></div>
        <div class="list">
          <NuxtLink v-for="d in g.items" :key="d.vehicleId + d.kind" :to="`/veicoli/${d.vehicleId}?tab=scadenze`" class="list-item">
            <div class="date-box" :class="urgency(d.days)"><b>{{ day(d.date) }}</b><span>{{ mon(d.date) }}</span></div>
            <div class="grow">
              <strong>{{ d.label }}</strong>
              <div class="faint ellipsis" style="font-size: 13px">{{ vehicleName(d.vehicle) }}{{ d.vehicle.plate ? ' · ' + d.vehicle.plate : '' }}</div>
            </div>
            <span class="chip" :class="urgency(d.days)">{{ relativeDays(d.days) }}</span>
          </NuxtLink>
        </div>
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
import { Bell, BellOff, CalendarCheck } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'
const { deadlines } = useGarage()
const groups = computed(() => {
  const g = [
    { title: 'Scadute o urgenti', items: deadlines.value.filter((d) => d.days <= 7) },
    { title: 'Entro 30 giorni', items: deadlines.value.filter((d) => d.days > 7 && d.days <= 30) },
    { title: 'Più avanti', items: deadlines.value.filter((d) => d.days > 30) },
  ]
  return g.filter((x) => x.items.length)
})
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
.date-box { width: 48px; height: 52px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--surface-3); flex: none; }
.date-box b { font-size: 19px; font-family: var(--font-display); line-height: 1; }
.date-box span { font-size: 10px; font-weight: 700; letter-spacing: .04em; color: var(--text-3); margin-top: 3px; }
.date-box.danger { background: var(--danger-soft); color: var(--danger); }
.date-box.warn { background: var(--warn-soft); color: var(--warn); }
.warnbox { border-color: rgba(251, 191, 36, .35); color: var(--warn); }
.warnbox strong { color: var(--text); }
</style>
