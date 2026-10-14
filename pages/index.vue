<template>
  <div class="page">
    <header class="topbar">
      <div class="grow">
        <div class="eyebrow">{{ greeting }}</div>
        <h1>Il tuo garage</h1>
      </div>
      <NuxtLink to="/veicoli/nuovo" class="icon-btn" aria-label="Aggiungi veicolo"><Plus :size="22" /></NuxtLink>
    </header>

    <template v-if="loading">
      <div class="skeleton" style="height: 220px; margin-top: 12px" />
      <div class="skeleton" style="height: 220px; margin-top: 14px" />
    </template>

    <template v-else-if="!vehicles.length">
      <div class="welcome card">
        <div class="glow" />
        <div class="icon-bubble accent big"><Sparkles :size="30" /></div>
        <h2>Benvenuto in Veicoli</h2>
        <p class="muted">Tieni in ordine auto e moto: libretto, lavori, incidenti, spese e scadenze, tutto in un posto.</p>
        <NuxtLink to="/veicoli/nuovo?scan=1" class="btn primary block"><ScanText :size="19" /> Scansiona il libretto</NuxtLink>
        <NuxtLink to="/veicoli/nuovo" class="btn block">Inserisci a mano</NuxtLink>
      </div>
    </template>

    <template v-else>
      <div v-if="soon.length" class="section" style="margin-top: 8px">
        <div class="section-head"><h2>In arrivo</h2><NuxtLink to="/scadenze" class="faint" style="font-size: 14px; font-weight: 600">Tutte</NuxtLink></div>
        <div class="soon">
          <NuxtLink v-for="d in soon" :key="d.vehicleId + d.kind" :to="`/veicoli/${d.vehicleId}?tab=scadenze`" class="soon-card" :class="urgency(d.days)">
            <span class="when">{{ relativeDays(d.days) }}</span>
            <strong>{{ d.label }}</strong>
            <span class="faint ellipsis">{{ vehicleName(d.vehicle) }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="section">
        <div class="chips" style="margin-bottom: 14px">
          <button v-for="f in filters" :key="f.value" class="chip-btn" :class="{ on: filter === f.value }" @click="filter = f.value">
            {{ f.label }} <span class="faint" style="margin-left: 4px">{{ count(f.value) }}</span>
          </button>
        </div>
        <TransitionGroup name="list" tag="div" class="stack" style="gap: 14px">
          <VehicleCard v-for="v in shown" :key="v.id" :vehicle="v" :deadlines="deadlinesByVehicle.get(v.id) ?? []" />
        </TransitionGroup>
        <div v-if="!shown.length" class="empty"><p>Nessun veicolo in questa categoria.</p></div>
      </div>
      <NuxtLink to="/veicoli/nuovo" class="fab" aria-label="Aggiungi veicolo"><Plus :size="28" /></NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Plus, ScanText, Sparkles } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'

const { vehicles, deadlines, deadlinesByVehicle, loading } = useGarage()
const filter = ref<'attivi' | 'tutti' | 'archivio'>('attivi')
const filters = [
  { value: 'attivi', label: 'In uso' },
  { value: 'archivio', label: 'Venduti e passati' },
  { value: 'tutti', label: 'Tutti' },
] as const
const match = (f: string, s: string) => (f === 'tutti' ? true : f === 'attivi' ? s === 'attivo' : s !== 'attivo')
const shown = computed(() => vehicles.value.filter((v) => match(filter.value, v.status)))
const count = (f: string) => vehicles.value.filter((v) => match(f, v.status)).length
const soon = computed(() => deadlines.value.filter((d) => d.days <= 60).slice(0, 8))
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera'
})
watchEffect(() => { if (!loading.value && vehicles.value.length && !count('attivi')) filter.value = 'tutti' })
</script>

<style scoped>
.welcome { position: relative; overflow: hidden; text-align: center; padding: 34px 22px 22px; margin-top: 20px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.welcome h2 { font-size: 24px; }
.welcome p { margin: 0 0 8px; max-width: 360px; }
.welcome .glow { position: absolute; inset: -40% -20% auto; height: 260px; background: radial-gradient(closest-side, rgba(124, 92, 255, .35), transparent); pointer-events: none; }
.icon-bubble.big { width: 68px; height: 68px; border-radius: 22px; }
.soon { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 2px 16px 6px; }
.soon::-webkit-scrollbar { display: none; }
.soon-card { flex: none; width: 150px; padding: 14px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); display: flex; flex-direction: column; gap: 3px; position: relative; overflow: hidden; }
.soon-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
.soon-card.danger::before { background: var(--danger); }
.soon-card.warn::before { background: var(--warn); }
.soon-card.ok::before { background: var(--ok); }
.soon-card .when { font-size: 12px; font-weight: 700; }
.soon-card.danger .when { color: var(--danger); }
.soon-card.warn .when { color: var(--warn); }
.soon-card.ok .when { color: var(--ok); }
.soon-card strong { font-size: 16px; font-family: var(--font-display); }
.soon-card .faint { font-size: 12.5px; }
.list-enter-active, .list-leave-active { transition: all .25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(8px); }
</style>
