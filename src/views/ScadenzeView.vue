<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Scadenze</h1>
      <p class="page-sub">Ordinate per urgenza</p>
    </div>

    <div class="content-area">
      <!-- Filtri -->
      <div class="filter-row">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span v-if="f.count > 0" class="filter-count">{{ f.count }}</span>
        </button>
      </div>

      <!-- Empty -->
      <div v-if="!store.loaded" class="loading">
        <div v-for="i in 3" :key="i" class="skeleton-row" />
      </div>

      <div v-else-if="filteredDeadlines.length === 0" class="empty-state">
        <div class="empty-icon">✅</div>
        <h2 class="empty-title">Tutto in regola</h2>
        <p class="empty-sub">Nessuna scadenza in questa categoria.</p>
      </div>

      <!-- Lista -->
      <div v-else class="deadlines-list">
        <div
          v-for="item in filteredDeadlines"
          :key="`${item.vehicleId}-${item.key}`"
          class="deadline-card"
          @click="goDetail(item.vehicleId)"
        >
          <div class="dc-left">
            <div class="dc-vehicle">
              <span class="dc-emoji">{{ vehicleEmoji(item.vehicleType) }}</span>
              <div>
                <div class="dc-vehicle-name">{{ item.vehicleName }}</div>
                <div class="dc-vehicle-plate">{{ item.vehiclePlate }}</div>
              </div>
            </div>
            <div class="dc-deadline-label">{{ item.label }}</div>
            <div class="dc-date">{{ fmtDate(item.date) }}</div>
          </div>
          <div class="dc-right">
            <DeadlineBadge :days="item.days" />
            <div class="dc-arrow">›</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVehiclesStore } from '../stores/vehicles'
import DeadlineBadge from '../components/DeadlineBadge.vue'

const router = useRouter()
const store = useVehiclesStore()
const activeFilter = ref('all')

onMounted(async () => {
  if (!store.loaded) await store.load()
})

const EMOJIS = { car: '🚗', moto: '🏍️', van: '🚐', truck: '🚛' }
function vehicleEmoji(type) { return EMOJIS[type] || '🚗' }

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

const allDeadlines = computed(() => store.upcomingDeadlines)

const expired  = computed(() => allDeadlines.value.filter(d => d.days < 0))
const urgent   = computed(() => allDeadlines.value.filter(d => d.days >= 0 && d.days <= 15))
const warning  = computed(() => allDeadlines.value.filter(d => d.days > 15 && d.days <= 30))
const upcoming = computed(() => allDeadlines.value.filter(d => d.days > 30))

const filters = computed(() => [
  { value: 'all',      label: 'Tutte',    count: expired.value.length + urgent.value.length + warning.value.length },
  { value: 'expired',  label: 'Scadute',  count: expired.value.length },
  { value: 'urgent',   label: '≤ 15gg',   count: urgent.value.length },
  { value: 'warning',  label: '≤ 30gg',   count: warning.value.length },
  { value: 'upcoming', label: 'Future',   count: upcoming.value.length }
])

const filteredDeadlines = computed(() => {
  switch (activeFilter.value) {
    case 'expired':  return expired.value
    case 'urgent':   return urgent.value
    case 'warning':  return warning.value
    case 'upcoming': return upcoming.value
    default: return allDeadlines.value
  }
})

function goDetail(id) { router.push(`/veicolo/${id}`) }
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-page);
}
.page-header {
  padding: 56px 20px 12px;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}
.page-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.content-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(var(--nav-height) + var(--safe-bottom) + 16px);
}

/* Filtri */
.filter-row {
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-row::-webkit-scrollbar { display: none; }
.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border-mid);
  background: var(--bg-card);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.filter-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.filter-count {
  font-size: 11px;
  font-weight: 700;
  background: rgba(255,255,255,0.3);
  border-radius: 8px;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
}
.filter-btn:not(.active) .filter-count {
  background: var(--danger-bg);
  color: var(--danger-text);
}

/* List */
.deadlines-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.deadline-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 12px;
  transition: transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.deadline-card:active { transform: scale(0.985); }
.dc-left { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.dc-vehicle { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.dc-emoji { font-size: 18px; }
.dc-vehicle-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.dc-vehicle-plate { font-size: 11px; color: var(--text-tertiary); }
.dc-deadline-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.dc-date { font-size: 12px; color: var(--text-tertiary); }
.dc-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.dc-arrow { font-size: 20px; color: var(--text-tertiary); }

/* Skeleton */
.loading { padding: 0 20px; display: flex; flex-direction: column; gap: 10px; }
.skeleton-row {
  height: 100px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border);
  animation: pulse 1.4s ease infinite;
}
@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Empty */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 64px 32px; gap: 10px;
}
.empty-icon { font-size: 48px; }
.empty-title { font-size: 20px; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 14px; color: var(--text-secondary); }
</style>
