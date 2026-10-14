<template>
  <div class="page">
    <template v-if="loading">
      <div class="skeleton" style="height: 160px; margin-top: 40px" />
      <div class="skeleton" style="height: 110px; margin-top: 14px" />
    </template>

    <!-- Benvenuto (nessun veicolo) -->
    <div v-else-if="!vehicles.length" class="welcome">
      <div class="hex-wrap">
        <svg class="hex" viewBox="0 0 220 240" aria-hidden="true">
          <defs>
            <linearGradient id="hexg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22e5ff" /><stop offset=".5" stop-color="#7c5cff" /><stop offset="1" stop-color="#ff5c8a" /></linearGradient>
            <linearGradient id="hexf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c5cff" stop-opacity=".22" /><stop offset="1" stop-color="#22e5ff" stop-opacity=".04" /></linearGradient>
          </defs>
          <polygon points="110,6 212,62 212,178 110,234 8,178 8,62" fill="url(#hexf)" stroke="url(#hexg)" stroke-width="3" />
          <polygon points="110,22 198,70 198,170 110,218 22,170 22,70" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="1" />
        </svg>
        <div class="logo">VEICOLI</div>
      </div>
      <NeonVehicle kind="auto" class="hero-car" />
      <p class="tagline">Il tuo garage, sempre sotto controllo.<br /><span>Libretto, lavori, scadenze e spese in un solo posto.</span></p>
      <NuxtLink to="/veicoli/nuovo?scan=1" class="btn neon block start"><ScanText :size="19" /> Inizia dal libretto</NuxtLink>
      <NuxtLink to="/veicoli/nuovo" class="manual">Preferisci? <b>Inserisci a mano</b></NuxtLink>
    </div>

    <!-- Dashboard -->
    <template v-else>
      <header class="topbar">
        <div class="grow">
          <div class="eyebrow">{{ greeting }}</div>
          <h1>Il tuo garage</h1>
        </div>
        <NuxtLink to="/scadenze" class="icon-btn" aria-label="Scadenze"><Bell :size="21" /><i v-if="urgentCount" class="dot" /></NuxtLink>
      </header>

      <label class="search">
        <Search :size="18" />
        <input v-model="q" class="input" type="search" placeholder="Cerca veicolo o targa..." />
      </label>

      <div class="stat-row">
        <HoloCard glow="violet" :cut="26" class="stat">
          <div class="stat-in">
            <div>
              <div class="stat-num">{{ active.length }}</div>
              <div class="stat-lbl">{{ active.length === 1 ? 'veicolo' : 'veicoli' }} in uso</div>
              <div class="stat-sub">{{ urgentCount ? `${urgentCount} scadenz${urgentCount === 1 ? 'a' : 'e'} entro 30 giorni` : 'Tutto in regola' }}</div>
            </div>
            <div class="stat-art">
              <img v-if="cover" :src="cover" alt="" />
              <NeonVehicle v-else :kind="featured?.kind ?? 'auto'" :accent="featured?.accent" />
            </div>
          </div>
        </HoloCard>
      </div>

      <div class="quick">
        <NuxtLink v-for="a in actions" :key="a.label" :to="a.to" class="qa" :class="a.tone">
          <span class="qa-ico"><component :is="a.icon" :size="21" /></span>
          <span>{{ a.label }}</span>
        </NuxtLink>
      </div>

      <section v-if="next" class="section">
        <NuxtLink :to="`/veicoli/${next.vehicleId}?tab=scadenze`" class="next" :class="urgency(next.days)">
          <span class="pulse" />
          <div class="grow">
            <div class="eyebrow">Prossima scadenza</div>
            <strong>{{ next.label }} · {{ vehicleName(next.vehicle) }}</strong>
          </div>
          <span class="when">{{ relativeDays(next.days) }}</span>
        </NuxtLink>
      </section>

      <section class="section">
        <div class="section-head"><h2>I tuoi veicoli</h2><NuxtLink to="/veicoli" class="link">Vedi tutti <ChevronRight :size="15" /></NuxtLink></div>
        <TransitionGroup name="list" tag="div" class="stack" style="gap: 14px">
          <VehicleCard v-for="v in shown" :key="v.id" :vehicle="v" :deadlines="deadlinesByVehicle.get(v.id) ?? []" />
        </TransitionGroup>
        <div v-if="!shown.length" class="empty"><p>Nessun veicolo corrisponde a "{{ q }}".</p></div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Bell, CalendarClock, ChartLine, ChevronRight, Plus, ScanText, Search, Wallet } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'

const { vehicles, deadlines, deadlinesByVehicle, loading } = useGarage()
const q = ref('')
const active = computed(() => vehicles.value.filter((v) => v.status === 'attivo'))
const featured = computed(() => active.value[0] ?? vehicles.value[0])
const { url: cover } = useMediaUrl(() => featured.value?.coverMediaId)
const urgentCount = computed(() => deadlines.value.filter((d) => d.days <= 30 && d.vehicle.status === 'attivo').length)
const next = computed(() => deadlines.value.find((d) => d.vehicle.status === 'attivo'))
const shown = computed(() => {
  const s = q.value.trim().toLowerCase().replace(/\s+/g, '')
  const list = s ? vehicles.value : active.value.length ? active.value : vehicles.value
  if (!s) return list.slice(0, 4)
  return list.filter((v) => (vehicleName(v) + v.plate + v.plateHistory.map((p) => p.plate).join('')).toLowerCase().replace(/\s+/g, '').includes(s))
})
const actions = [
  { label: 'Aggiungi', to: '/veicoli/nuovo', icon: Plus, tone: 'violet' },
  { label: 'Scadenze', to: '/scadenze', icon: CalendarClock, tone: 'amber' },
  { label: 'Spese', to: '/spese', icon: Wallet, tone: 'teal' },
  { label: 'Report', to: '/report', icon: ChartLine, tone: 'cyan' },
]
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera'
})
</script>

<style scoped>
.welcome { min-height: calc(100dvh - var(--nav-h) - var(--safe-bottom) - 60px); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 6px; padding-top: 10px; }
.hex-wrap { position: relative; width: 210px; height: 230px; display: grid; place-items: center; }
.hex { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 0 14px rgba(124, 92, 255, .8)) drop-shadow(0 0 30px rgba(34, 229, 255, .35)); animation: breathe 4s ease-in-out infinite; }
.logo { position: relative; font-family: var(--font-display); font-weight: 600; font-size: 34px; letter-spacing: .14em; color: #fff; text-shadow: 0 0 18px rgba(170, 150, 255, .9); padding-left: .14em; }
.hero-car { width: min(100%, 360px); margin-top: -36px; }
.tagline { margin: 4px 0 18px; color: #e6e8ff; font-size: 16px; font-weight: 600; line-height: 1.5; }
.tagline span { color: rgba(210, 215, 255, .6); font-weight: 500; font-size: 14px; }
.start { max-width: 300px; }
.manual { margin-top: 12px; font-size: 14px; color: rgba(210, 215, 255, .6); }
.manual b { color: #7fe9ff; }
@keyframes breathe { 50% { filter: drop-shadow(0 0 20px rgba(124, 92, 255, 1)) drop-shadow(0 0 40px rgba(34, 229, 255, .5)); } }

.search { margin-bottom: 16px; }
.stat-in { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 18px 16px 18px 22px; min-height: 128px; }
.stat-num { font-family: var(--font-display); font-size: 46px; font-weight: 700; line-height: 1; color: #fff; text-shadow: 0 0 18px rgba(124, 92, 255, .8); }
.stat-lbl { margin-top: 4px; font-size: 14px; font-weight: 600; color: rgba(230, 232, 255, .85); }
.stat-sub { margin-top: 8px; font-size: 12px; color: #7fe9ff; }
.stat-art { width: 58%; max-width: 230px; display: grid; place-items: center; }
.stat-art img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 14px; box-shadow: 0 0 24px rgba(124, 92, 255, .5); }
.stat-art :deep(svg) { width: 100%; height: auto; }

.quick { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 18px; }
.qa { display: flex; flex-direction: column; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: var(--text-2); }
.qa-ico { --c: 124, 92, 255; width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; color: #fff;
  background: radial-gradient(circle at 30% 25%, rgba(var(--c), .55), rgba(var(--c), .12) 70%); border: 1px solid rgba(var(--c), .7); box-shadow: 0 0 16px rgba(var(--c), .45), inset 0 0 12px rgba(var(--c), .35); transition: transform .15s; }
.qa:active .qa-ico { transform: scale(.92); }
.qa.amber .qa-ico { --c: 255, 168, 32; }
.qa.teal .qa-ico { --c: 25, 227, 177; }
.qa.cyan .qa-ico { --c: 34, 229, 255; }

.next { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); backdrop-filter: blur(14px); }
.next strong { font-size: 14.5px; }
.next .when { font-size: 13px; font-weight: 700; }
.pulse { width: 10px; height: 10px; border-radius: 50%; flex: none; background: var(--ok); box-shadow: 0 0 0 0 currentColor; animation: pulse 2s infinite; color: var(--ok); }
.next.warn .pulse { background: var(--warn); color: var(--warn); }
.next.danger .pulse { background: var(--danger); color: var(--danger); }
.next.warn .when { color: var(--warn); }
.next.danger .when { color: var(--danger); }
.next.ok .when { color: var(--ok); }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 60%, transparent); } 100% { box-shadow: 0 0 0 12px transparent; } }
.list-enter-active, .list-leave-active { transition: all .25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(8px); }
</style>
