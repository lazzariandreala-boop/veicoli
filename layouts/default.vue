<template>
  <div class="shell">
    <slot />
    <nav v-if="showNav" class="nav">
      <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to" class="nav-item" :class="{ on: isOn(t.to) }">
        <component :is="t.icon" :size="22" :stroke-width="isOn(t.to) ? 2.4 : 1.9" />
        <span>{{ t.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { CalendarClock, Settings2, Warehouse, ChartPie } from 'lucide-vue-next'

const route = useRoute()
const tabs = [
  { to: '/', label: 'Garage', icon: Warehouse },
  { to: '/scadenze', label: 'Scadenze', icon: CalendarClock },
  { to: '/spese', label: 'Spese', icon: ChartPie },
  { to: '/impostazioni', label: 'Impostazioni', icon: Settings2 },
]
const showNav = computed(() => tabs.some((t) => t.to === route.path))
const isOn = (to: string) => route.path === to
</script>

<style scoped>
.shell { min-height: 100dvh; }
.nav {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 30;
  display: grid; grid-template-columns: repeat(4, 1fr);
  height: calc(var(--nav-h) + var(--safe-bottom)); padding-bottom: var(--safe-bottom);
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(20px) saturate(1.6); -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border-top: 1px solid var(--line);
}
.nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: var(--text-3); font-size: 11.5px; font-weight: 600; transition: color .2s; }
.nav-item.on { color: var(--text); }
.nav-item.on :deep(svg) { color: var(--accent); filter: drop-shadow(0 4px 10px rgba(124, 92, 255, .55)); }
</style>
