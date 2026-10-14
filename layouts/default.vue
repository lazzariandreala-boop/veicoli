<template>
  <div class="shell">
    <slot />
    <nav v-if="showNav" class="nav">
      <svg class="nav-curve" viewBox="0 0 400 18" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 18 C 90 18, 120 2, 200 2 S 310 18, 400 18" fill="none" stroke="url(#navg)" stroke-width="1.4" />
        <defs>
          <linearGradient id="navg" x1="0" x2="1"><stop offset="0" stop-color="#7c5cff" stop-opacity=".1" /><stop offset=".5" stop-color="#22e5ff" /><stop offset="1" stop-color="#7c5cff" stop-opacity=".1" /></linearGradient>
        </defs>
      </svg>
      <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to" class="nav-item" :class="{ on: isOn(t.to) }">
        <span class="ico"><component :is="t.icon" :size="21" :stroke-width="isOn(t.to) ? 2.3 : 1.8" /></span>
        <span>{{ t.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { CalendarClock, CarFront, House, LayoutGrid, Wallet } from 'lucide-vue-next'

const route = useRoute()
const tabs = [
  { to: '/', label: 'Home', icon: House },
  { to: '/veicoli', label: 'Veicoli', icon: CarFront },
  { to: '/scadenze', label: 'Scadenze', icon: CalendarClock },
  { to: '/spese', label: 'Spese', icon: Wallet },
  { to: '/impostazioni', label: 'Altro', icon: LayoutGrid },
]
const NAV_PAGES = [...tabs.map((t) => t.to), '/report']
const showNav = computed(() => NAV_PAGES.includes(route.path))
const isOn = (to: string) => route.path === to || (to === '/spese' && route.path === '/report')
</script>

<style scoped>
.shell { min-height: 100dvh; }
.nav {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 30;
  display: grid; grid-template-columns: repeat(5, 1fr);
  height: calc(var(--nav-h) + var(--safe-bottom)); padding-bottom: var(--safe-bottom);
  background: linear-gradient(180deg, rgba(14, 16, 44, .78), rgba(6, 8, 24, .96));
  backdrop-filter: blur(22px) saturate(1.6); -webkit-backdrop-filter: blur(22px) saturate(1.6);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, .35);
}
:root[data-theme='light'] .nav { background: linear-gradient(180deg, rgba(30, 30, 70, .86), rgba(16, 16, 44, .96)); }
.nav-curve { position: absolute; left: 0; right: 0; top: -9px; width: 100%; height: 18px; filter: drop-shadow(0 0 6px rgba(34, 229, 255, .7)); pointer-events: none; }
.nav-item { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: rgba(200, 205, 255, .55); font-size: 11px; font-weight: 600; transition: color .2s; }
.ico { display: grid; place-items: center; width: 38px; height: 30px; border-radius: 12px; transition: background .2s, box-shadow .2s; }
.nav-item.on { color: #fff; }
.nav-item.on .ico { color: #fff; background: linear-gradient(135deg, rgba(124, 92, 255, .55), rgba(34, 229, 255, .25)); box-shadow: 0 0 16px rgba(124, 92, 255, .7), inset 0 0 0 1px rgba(160, 140, 255, .6); }
</style>
