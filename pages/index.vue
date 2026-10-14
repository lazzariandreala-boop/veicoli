<template>
  <div class="page">
    <template v-if="loading">
      <div class="skeleton" style="height: 160px; margin-top: 40px" />
      <div class="skeleton" style="height: 110px; margin-top: 14px" />
    </template>

    <!-- Benvenuto (nessun veicolo): schermata a tutto schermo come nel mockup -->
    <div v-else-if="!vehicles.length" class="welcome" :class="dark ? 'w-dark' : 'w-light'">
      <div class="hex-wrap">
        <svg class="hex" viewBox="0 0 300 330" aria-hidden="true">
          <defs>
            <linearGradient id="hexg" x1=".5" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#ffb35c" /><stop offset=".45" stop-color="#a66bff" /><stop offset="1" stop-color="#4f8cff" /></linearGradient>
            <linearGradient id="hexd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".35" /><stop offset=".5" stop-color="#9aa8ff" stop-opacity=".12" /><stop offset="1" stop-color="#ffffff" stop-opacity=".28" /></linearGradient>
            <linearGradient id="hexf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".07" /><stop offset="1" stop-color="#ffffff" stop-opacity="0" /></linearGradient>
          </defs>
          <path d="M150 10 L282 86 Q290 91 290 100 L290 230 Q290 239 282 244 L150 320 L18 244 Q10 239 10 230 L10 100 Q10 91 18 86 Z" fill="url(#hexf)" :stroke="dark ? 'url(#hexd)' : 'url(#hexg)'" :stroke-width="dark ? 2 : 4" stroke-linejoin="round" />
        </svg>
        <div class="logo">VEICOLI</div>
      </div>
      <div class="hero-car"><VehicleArt :hero="dark ? 'dark' : 'light'" /></div>
      <p class="tagline">Il tuo garage, sempre sotto controllo.</p>
      <NuxtLink to="/veicoli/nuovo?scan=1" class="btn neon start">Inizia</NuxtLink>
      <p class="manual">Preferisci? <NuxtLink to="/veicoli/nuovo">Inserisci a mano</NuxtLink> · <NuxtLink to="/impostazioni?backup=1">Ripristina backup</NuxtLink></p>
    </div>

    <!-- Dashboard -->
    <template v-else>
      <header class="topbar">
        <h1>Il tuo garage</h1>
        <NuxtLink to="/scadenze" class="icon-btn" aria-label="Scadenze"><Bell :size="20" /><i v-if="urgentCount" class="dot" /></NuxtLink>
      </header>

      <div class="hero-row">
        <div class="stat-tile">
          <div class="stat-num">{{ active.length }}</div>
          <div class="stat-lbl">{{ active.length === 1 ? 'veicolo' : 'veicoli' }}</div>
          <div class="stat-sub">{{ urgentCount ? `${urgentCount} in scadenza` : 'Tutto in regola' }}</div>
        </div>
        <NuxtLink v-if="featured" :to="`/veicoli/${featured.id}`" class="feat">
          <div class="feat-art">
            <img v-if="cover" :src="cover" alt="" class="feat-photo" />
            <VehicleArt v-else :kind="featured.kind" :accent="featured.accent" />
          </div>
        </NuxtLink>
      </div>

      <NuxtLink to="/veicoli/nuovo?scan=1" class="btn primary scan"><ScanLine :size="22" /> Aggiungi dal libretto</NuxtLink>

      <section v-if="next" class="section" style="margin-top: 20px">
        <NuxtLink :to="`/veicoli/${next.vehicleId}?tab=scadenze`" class="next card" :class="urgency(next.days)">
          <span class="pulse" />
          <div class="grow">
            <div class="eyebrow">Prossima scadenza</div>
            <strong class="ellipsis" style="display: block">{{ next.label }} · {{ vehicleName(next.vehicle) }}</strong>
          </div>
          <span class="when">{{ relativeDays(next.days) }}</span>
        </NuxtLink>
      </section>

      <section class="section" style="margin-top: 22px">
        <div class="section-head"><h2>I tuoi veicoli</h2><NuxtLink v-if="vehicles.length > shown.length" to="/veicoli" class="link">Vedi tutti <ChevronRight :size="15" /></NuxtLink></div>
        <TransitionGroup name="list" tag="div" class="stack" style="gap: 14px">
          <VehicleCard v-for="v in shown" :key="v.id" :vehicle="v" :deadlines="deadlinesByVehicle.get(v.id) ?? []" />
        </TransitionGroup>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Bell, ChevronRight, ScanLine } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'

const { vehicles, deadlines, deadlinesByVehicle, loading } = useGarage()
const dark = useIsDark()
const active = computed(() => vehicles.value.filter((v) => v.status === 'attivo'))
const featured = computed(() => active.value[0] ?? vehicles.value[0])
const { url: cover } = useMediaUrl(() => featured.value?.coverMediaId)
const urgentCount = computed(() => deadlines.value.filter((d) => d.days <= 30 && d.vehicle.status === 'attivo').length)
const next = computed(() => deadlines.value.find((d) => d.vehicle.status === 'attivo'))
const shown = computed(() => (active.value.length ? active.value : vehicles.value).slice(0, 4))
</script>

<style scoped>
/* ---------- benvenuto ---------- */
.welcome { position: fixed; inset: 0; z-index: 40; overflow: hidden auto; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: calc(var(--safe-top) + 24px) 24px calc(var(--safe-bottom) + 24px); }
.w-light { background: radial-gradient(90% 55% at 50% 30%, #5a3fc4 0%, #2c1e78 45%, #140f3d 100%); }
.w-dark { background: radial-gradient(90% 55% at 50% 30%, #1a1f3e 0%, #0b0e22 55%, #05070f 100%); }
.hex-wrap { position: relative; width: min(74vw, 300px); aspect-ratio: 300 / 330; display: grid; place-items: center; margin-bottom: -22%; }
.hex { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.w-light .hex { filter: drop-shadow(0 0 10px rgba(255, 170, 90, .9)) drop-shadow(0 0 26px rgba(150, 100, 255, .9)); animation: breathe 4s ease-in-out infinite; }
.w-dark .hex { filter: drop-shadow(0 0 12px rgba(150, 170, 255, .35)); }
.logo { position: relative; top: -6%; font-family: var(--font-display); font-weight: 600; font-size: clamp(32px, 10vw, 44px); letter-spacing: .06em; color: #fff; text-shadow: 0 0 22px rgba(200, 180, 255, .8); }
.hero-car { position: relative; width: min(112vw, 520px); margin: 0 -10vw; }
.hero-car::after { content: ''; position: absolute; left: 12%; right: 12%; bottom: 2%; height: 18%; border-radius: 50%; background: radial-gradient(closest-side, rgba(150, 110, 255, .55), transparent); filter: blur(6px); z-index: -1; }
.w-dark .hero-car::after { background: radial-gradient(closest-side, rgba(120, 140, 200, .35), transparent); }
.tagline { margin: 18px 0 26px; color: rgba(235, 236, 255, .88); font-size: 17px; font-weight: 500; }
.start { width: min(80vw, 320px); height: 80px; font-size: 21px; }
.manual { margin-top: 18px; font-size: 13.5px; color: rgba(225, 228, 255, .65); }
.manual a { color: #7fd8ff; font-weight: 600; }
@keyframes breathe { 50% { filter: drop-shadow(0 0 16px rgba(255, 170, 90, 1)) drop-shadow(0 0 40px rgba(150, 100, 255, 1)); } }

/* ---------- dashboard ---------- */
.hero-row { margin-top: 8px; }
.scan { width: 100%; height: 60px; margin-top: 22px; font-size: 16.5px; border-radius: 999px; }
.hero-row { position: relative; display: flex; align-items: stretch; min-height: 150px; }
.stat-tile { position: relative; z-index: 1; width: 52%; padding: 22px 20px; color: #fff;
  border-radius: 22px 46px 46px 22px; corner-top-right-shape: bevel; corner-bottom-right-shape: bevel;
  background: linear-gradient(150deg, #1f7c86 0%, #1b3e66 45%, #1a1d48 100%);
  box-shadow: 0 18px 30px -14px rgba(20, 60, 110, .7), inset 0 1px 0 rgba(255, 255, 255, .18); }
:root[data-theme='dark'] .stat-tile { background: linear-gradient(150deg, rgba(60, 40, 40, .55), rgba(20, 22, 54, .8)); border: 1.5px solid rgba(255, 150, 70, .55); box-shadow: 0 0 22px -6px rgba(255, 140, 60, .6), inset 0 1px 0 rgba(255, 255, 255, .08); }
@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) .stat-tile { background: linear-gradient(150deg, rgba(60, 40, 40, .55), rgba(20, 22, 54, .8)); border: 1.5px solid rgba(255, 150, 70, .55); box-shadow: 0 0 22px -6px rgba(255, 140, 60, .6), inset 0 1px 0 rgba(255, 255, 255, .08); } }
.stat-num { font-family: var(--font-display); font-size: 50px; font-weight: 700; line-height: 1; }
.stat-lbl { margin-top: 6px; font-size: 15px; color: rgba(235, 240, 255, .9); }
.stat-sub { margin-top: 10px; font-size: 12px; color: #9ef0ff; font-weight: 600; }
.feat { position: absolute; right: -8px; top: -14px; bottom: -6px; width: 62%; z-index: 2; display: grid; place-items: center; }
.feat-art { width: 100%; filter: drop-shadow(0 18px 18px rgba(20, 10, 60, .45)); }
.feat-photo { width: 92%; margin-left: auto; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 18px; }

.next { display: flex; align-items: center; gap: 12px; padding: 13px 16px; }
.next strong { font-size: 14.5px; }
.next .when { font-size: 13px; font-weight: 700; flex: none; }
.pulse { width: 10px; height: 10px; border-radius: 50%; flex: none; background: var(--ok); color: var(--ok); animation: pulse 2s infinite; }
.next.warn .pulse { background: var(--warn); color: var(--warn); }
.next.danger .pulse { background: var(--danger); color: var(--danger); }
.next.warn .when { color: var(--warn); }
.next.danger .when { color: var(--danger); }
.next.ok .when { color: var(--ok); }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 60%, transparent); } 100% { box-shadow: 0 0 0 12px transparent; } }
.list-enter-active, .list-leave-active { transition: all .25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(8px); }
</style>
