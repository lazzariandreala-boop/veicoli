<template>
  <div class="shell">
    <!-- pagina Premium senza abbonamento: la copro invece di smontarla, così il cambio di pagina resta stabile -->
    <PremiumLock v-if="lock" :feature="lock" :title="String(route.meta.premiumTitle ?? '')" page :back="!showNav" />
    <div v-show="!lock" class="slot"><slot /></div>
    <nav v-if="showNav" class="nav">
      <svg class="nav-bg" viewBox="0 0 400 96" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="navfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--nav-1)" /><stop offset="1" style="stop-color: var(--nav-2)" /></linearGradient>
          <linearGradient id="navline" x1="0" x2="1"><stop offset="0" style="stop-color: var(--nav-line); stop-opacity: .15" /><stop offset=".5" style="stop-color: var(--nav-line)" /><stop offset="1" style="stop-color: var(--nav-line); stop-opacity: .15" /></linearGradient>
        </defs>
        <path d="M0 26 Q0 16 12 16 L130 16 C160 16 165 2 200 2 C235 2 240 16 270 16 L388 16 Q400 16 400 26 L400 96 L0 96 Z" fill="url(#navfill)" />
        <path d="M6 18 L130 16 C160 16 165 2 200 2 C235 2 240 16 270 16 L394 18" fill="none" stroke="url(#navline)" stroke-width="1.6" vector-effect="non-scaling-stroke" />
      </svg>
      <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to" class="nav-item" :class="{ on: isOn(t.to) }">
        <span class="ico"><UserAvatar v-if="t.to === '/impostazioni' && cloud.user" :size="24" /><component :is="t.icon" v-else :size="21" :stroke-width="isOn(t.to) ? 2.3 : 1.8" /></span>
        <span>{{ t.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { CalendarClock, CarFront, House, LayoutGrid, Wallet } from 'lucide-vue-next'
import type { PremiumFeature } from '~/composables/premium'

const route = useRoute()
const tabs = [
  { to: '/', label: 'Home', icon: House },
  { to: '/veicoli', label: 'Veicoli', icon: CarFront },
  { to: '/scadenze', label: 'Scadenze', icon: CalendarClock },
  { to: '/spese', label: 'Spese', icon: Wallet },
  { to: '/impostazioni', label: 'Profilo', icon: LayoutGrid },
]
const NAV_PAGES = [...tabs.map((t) => t.to), '/report']
const showNav = computed(() => NAV_PAGES.includes(route.path))
const lock = computed(() => (route.meta.premium && !isPremium.value ? route.meta.premium as PremiumFeature : null))
const isOn = (to: string) => route.path === to || (to === '/spese' && route.path === '/report')
</script>

<style scoped>
.shell { min-height: 100dvh; }
.slot { display: contents; }
.nav {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 30;
  display: grid; grid-template-columns: repeat(5, 1fr); align-items: end;
  height: calc(var(--nav-h) + var(--safe-bottom)); padding: 0 6px calc(var(--safe-bottom) + 8px);
}
.nav-bg { position: absolute; left: 0; right: 0; bottom: 0; top: -14px; width: 100%; height: calc(100% + 14px); filter: drop-shadow(0 -6px 18px rgba(40, 20, 110, .22)) drop-shadow(0 -1px 8px var(--nav-on-glow)); pointer-events: none; }
.nav-item { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; height: 58px; color: var(--nav-ico); font-size: 11px; font-weight: 600; transition: color .2s; }
.ico { display: grid; place-items: center; width: 40px; height: 32px; border-radius: 12px; transition: background .2s, box-shadow .2s, color .2s; }
.nav-item.on { color: var(--nav-on); }
.nav-item.on .ico { color: var(--nav-on); background: radial-gradient(circle, rgba(124, 92, 255, .3), rgba(124, 92, 255, 0) 70%); filter: drop-shadow(0 0 8px var(--nav-on-glow)); }
</style>
