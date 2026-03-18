<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Notifiche</h1>
      <p class="page-sub">Promemoria pianificati</p>
    </div>

    <div class="content-area">
      <!-- Info banner -->
      <div class="info-banner">
        <span class="info-icon">⏰</span>
        <span>Promemoria a <strong>30g</strong>, <strong>15g</strong> e <strong>1g</strong> prima di ogni scadenza, alle <strong>09:00</strong>.</span>
      </div>

      <!-- Loading -->
      <div v-if="!store.loaded" class="loading">
        <div v-for="i in 4" :key="i" class="skeleton-row" />
      </div>

      <!-- Empty -->
      <div v-else-if="notifications.length === 0" class="empty-state">
        <div class="empty-blob">🔔</div>
        <h2 class="empty-title">Nessuna notifica</h2>
        <p class="empty-sub">Aggiungi veicoli con scadenze future per abilitare i promemoria automatici.</p>
      </div>

      <!-- Lista notifiche -->
      <div v-else>
        <div class="list-header">
          <span class="list-count">{{ notifications.length }} promemori attivi</span>
          <button class="refresh-btn" :disabled="refreshing" @click="refreshAll">
            {{ refreshing ? '⏳' : '↺ Aggiorna' }}
          </button>
        </div>

        <div class="notif-list">
          <div
            v-for="notif in notifications"
            :key="notif.id"
            class="notif-card"
            :class="getCardClass(notif)"
          >
            <div class="notif-top">
              <div class="notif-bell-wrap" :class="getBellClass(notif)">🔔</div>
              <div class="notif-info">
                <div class="notif-title">{{ notif.label }} – {{ notif.vehicleName }}</div>
                <div class="notif-plate">{{ notif.vehiclePlate }}</div>
              </div>
              <div class="notif-when-badge" :class="getWhenBadgeClass(notif)">
                {{ notif.daysBefore === 1 ? '1g prima' : `${notif.daysBefore}g prima` }}
              </div>
            </div>
            <div class="notif-dates">
              <div class="notif-date-row">
                <span class="nd-label">Invio</span>
                <span class="nd-value">{{ fmtDateTime(notif.triggerAt) }}</span>
              </div>
              <div class="notif-date-row">
                <span class="nd-label">Scadenza</span>
                <span class="nd-value nd-accent">{{ fmtDate(notif.expiryDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permessi -->
      <div v-if="store.vehicles.length > 0" class="permissions-note">
        <span>⚠️</span>
        <p>Assicurati di aver concesso i permessi per le notifiche nelle impostazioni Android.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVehiclesStore } from '../stores/vehicles'
import { buildNotificationsPreview, scheduleVehicleNotifications, cancelVehicleNotifications } from '../composables/useNotifications'

const store = useVehiclesStore()
const refreshing = ref(false)

onMounted(async () => {
  if (!store.loaded) await store.load()
})

const notifications = computed(() => buildNotificationsPreview(store.vehicles))

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtDateTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(d); target.setHours(0,0,0,0)
  const diff = Math.round((target - today) / 86400000)
  const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
  if (diff === 0) return `Oggi alle ${timeStr}`
  if (diff === 1) return `Domani alle ${timeStr}`
  return `${dateStr} alle ${timeStr}`
}

function getCardClass(notif) {
  if (notif.daysBefore === 1)  return 'card-danger'
  if (notif.daysBefore === 15) return 'card-warn'
  return 'card-ok'
}
function getBellClass(notif) {
  if (notif.daysBefore === 1)  return 'bell-danger'
  if (notif.daysBefore === 15) return 'bell-warn'
  return 'bell-ok'
}
function getWhenBadgeClass(notif) {
  if (notif.daysBefore === 1)  return 'wb-danger'
  if (notif.daysBefore === 15) return 'wb-warn'
  return 'wb-ok'
}

async function refreshAll() {
  refreshing.value = true
  try {
    for (const vehicle of store.vehicles) {
      await cancelVehicleNotifications(vehicle.id)
      await scheduleVehicleNotifications(vehicle)
    }
  } finally {
    refreshing.value = false
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-page);
}
.page-header {
  padding: 56px 20px 16px;
}
.page-title {
  font-size: 30px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.8px;
}
.page-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px calc(var(--nav-height) + var(--safe-bottom) + 16px);
}

.info-banner {
  display: flex;
  gap: 10px;
  background: var(--accent-light);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--accent);
  line-height: 1.5;
  align-items: flex-start;
}
.info-icon { font-size: 16px; flex-shrink: 0; }

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.list-count { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.refresh-btn {
  background: var(--accent-light);
  border: none;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  cursor: pointer;
  font-family: inherit;
  padding: 5px 12px;
  transition: opacity 0.15s;
}
.refresh-btn:disabled { opacity: 0.5; }

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.notif-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-left-width: 4px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.card-danger { border-left-color: var(--danger); }
.card-warn   { border-left-color: var(--warn); }
.card-ok     { border-left-color: var(--ok); }

.notif-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 10px;
}
.notif-bell-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.bell-ok     { background: var(--ok-bg); }
.bell-warn   { background: var(--warn-bg); }
.bell-danger { background: var(--danger-bg); }

.notif-info { flex: 1; }
.notif-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.notif-plate { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

.notif-when-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 99px;
  white-space: nowrap;
}
.wb-ok     { background: var(--ok-bg);     color: var(--ok); }
.wb-warn   { background: var(--warn-bg);   color: var(--warn); }
.wb-danger { background: var(--danger-bg); color: var(--danger); }

.notif-dates {
  border-top: 1px solid var(--border);
  padding: 9px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.notif-date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nd-label { font-size: 12px; color: var(--text-secondary); }
.nd-value { font-size: 12px; font-weight: 600; color: var(--text-primary); }
.nd-accent { color: var(--accent); }

.permissions-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 20px;
  padding: 12px 14px;
  background: var(--warn-bg);
  color: var(--warn-text);
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.5;
}

.loading { display: flex; flex-direction: column; gap: 10px; }
.skeleton-row {
  height: 110px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  animation: pulse 1.5s ease infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 64px 32px; gap: 12px;
}
.empty-blob {
  width: 90px; height: 90px;
  background: var(--accent-light);
  border-radius: 26px;
  display: flex; align-items: center; justify-content: center;
  font-size: 44px; margin-bottom: 4px;
}
.empty-title { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.empty-sub { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }

@media (min-width: 1024px) {
  .page-header { padding-top: 36px; }
  .content-area { padding-bottom: 32px; max-width: 720px; }
}
</style>
