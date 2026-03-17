<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" exact-active-class="active">
      <span class="nav-icon">🚗</span>
      <span class="nav-label">Garage</span>
    </router-link>
    <router-link to="/scadenze" class="nav-item" active-class="active">
      <span class="nav-icon">📅</span>
      <span class="nav-label">Scadenze</span>
      <span v-if="urgentCount > 0" class="nav-badge">{{ urgentCount }}</span>
    </router-link>
    <router-link to="/notifiche" class="nav-item" active-class="active">
      <span class="nav-icon">🔔</span>
      <span class="nav-label">Notifiche</span>
    </router-link>
    <router-link to="/impostazioni" class="nav-item" active-class="active">
      <span class="nav-icon">⚙️</span>
      <span class="nav-label">Impostazioni</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useVehiclesStore } from '../stores/vehicles'

const store = useVehiclesStore()

const urgentCount = computed(() =>
  store.upcomingDeadlines.filter(d => d.days <= 30 && d.days >= 0).length
)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--nav-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: stretch;
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
  color: var(--text-tertiary);
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.nav-item.active {
  color: var(--accent);
}
.nav-icon {
  font-size: 22px;
  line-height: 1;
}
.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.nav-badge {
  position: absolute;
  top: 8px;
  right: calc(50% - 20px);
  min-width: 16px;
  height: 16px;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}
</style>
