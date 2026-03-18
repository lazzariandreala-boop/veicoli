<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" exact-active-class="active">
      <span class="nav-icon">🏠</span>
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
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: stretch;
  z-index: 100;
}

@media (prefers-color-scheme: dark) {
  .bottom-nav { background: rgba(15,23,42,0.94); }
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  position: relative;
  color: var(--text-tertiary);
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.nav-item.active { color: var(--accent); }

.nav-icon {
  font-size: 22px;
  line-height: 1;
  transition: transform 0.2s cubic-bezier(.32,.72,0,1);
}
.nav-item.active .nav-icon { transform: scale(1.15) translateY(-1px); }

.nav-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: opacity 0.15s;
}
.nav-item:not(.active) .nav-label { opacity: 0.6; }

.nav-badge {
  position: absolute;
  top: 8px;
  right: calc(50% - 22px);
  min-width: 17px;
  height: 17px;
  background: var(--danger-grad);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 99px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}
</style>
