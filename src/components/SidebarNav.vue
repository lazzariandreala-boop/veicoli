<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">🏎️</div>
      <div>
        <div class="brand-name">Veicoli</div>
        <div class="brand-tagline">Il tuo garage digitale</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="sidebar-item" exact-active-class="active">
        <span class="sidebar-icon">🏠</span>
        <span class="sidebar-label">Garage</span>
      </router-link>
      <router-link to="/scadenze" class="sidebar-item" active-class="active">
        <span class="sidebar-icon">📅</span>
        <span class="sidebar-label">Scadenze</span>
        <span v-if="urgentCount > 0" class="sidebar-badge">{{ urgentCount }}</span>
      </router-link>
      <router-link to="/notifiche" class="sidebar-item" active-class="active">
        <span class="sidebar-icon">🔔</span>
        <span class="sidebar-label">Notifiche</span>
      </router-link>
      <router-link to="/impostazioni" class="sidebar-item" active-class="active">
        <span class="sidebar-icon">⚙️</span>
        <span class="sidebar-label">Impostazioni</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="sync-pill" :class="syncClass">
        <span class="sync-dot" />
        <span class="sync-label">{{ syncLabel }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useVehiclesStore } from '../stores/vehicles'
import { useSettingsStore } from '../stores/settings'

const store = useVehiclesStore()
const settings = useSettingsStore()

const urgentCount = computed(() =>
  store.upcomingDeadlines.filter(d => d.days <= 30 && d.days >= 0).length
)

const syncClass = computed(() => {
  if (!settings.gistToken || !settings.gistId) return 'sync-none'
  return `sync-${settings.syncStatus}`
})

const syncLabel = computed(() => {
  if (!settings.gistToken || !settings.gistId) return 'Sync non attivo'
  if (settings.syncStatus === 'syncing') return 'Sincronizzazione...'
  if (settings.syncStatus === 'error') return 'Errore sync'
  if (settings.syncStatus === 'ok' && settings.lastSync) {
    const d = new Date(settings.lastSync)
    return `Sync ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
  }
  return 'Sync attivo'
})
</script>

<style scoped>
.sidebar {
  width: 220px;
  flex-shrink: 0;
  height: 100dvh;
  position: sticky;
  top: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 50;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 24px 16px 20px;
  border-bottom: 1px solid var(--border);
}
.brand-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: var(--accent-grad);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brand-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}
.brand-tagline {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
}
.sidebar-item:hover {
  background: var(--bg-page);
  color: var(--text-primary);
}
.sidebar-item.active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 600;
}

.sidebar-icon { font-size: 17px; line-height: 1; }
.sidebar-label { flex: 1; }

.sidebar-badge {
  min-width: 18px;
  height: 18px;
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

.sidebar-footer {
  padding: 12px 10px;
  border-top: 1px solid var(--border);
}

.sync-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 99px;
  background: var(--bg-page);
}
.sync-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--text-tertiary);
}
.sync-syncing .sync-dot { background: var(--warn); animation: pulse-dot 1s ease infinite; }
.sync-ok .sync-dot    { background: var(--ok); }
.sync-error .sync-dot { background: var(--danger); }
.sync-none .sync-dot  { background: var(--text-tertiary); }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.sync-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
