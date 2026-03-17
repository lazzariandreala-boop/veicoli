<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Il mio garage</h1>
        <p class="page-sub">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Stats strip -->
    <div v-if="store.vehicles.length > 0" class="stats-row">
      <div class="stat-pill stat-ok">
        <span class="stat-num">{{ store.stats.ok }}</span>
        <span class="stat-lbl">in regola</span>
      </div>
      <div class="stat-pill stat-warn">
        <span class="stat-num">{{ store.stats.warn }}</span>
        <span class="stat-lbl">attenzione</span>
      </div>
      <div class="stat-pill stat-danger">
        <span class="stat-num">{{ store.stats.danger }}</span>
        <span class="stat-lbl">urgenti</span>
      </div>
    </div>

    <!-- Content -->
    <div class="content-area">
      <!-- Loading -->
      <div v-if="!store.loaded" class="loading-list">
        <div v-for="i in 2" :key="i" class="skeleton-card" />
      </div>

      <!-- Empty state -->
      <div v-else-if="store.vehicles.length === 0" class="empty-state">
        <div class="empty-icon">🚗</div>
        <h2 class="empty-title">Nessun veicolo</h2>
        <p class="empty-sub">Aggiungi il tuo primo veicolo per tenere traccia di bollo, assicurazione e revisione.</p>
        <button class="empty-btn" @click="goAdd">Aggiungi veicolo</button>
      </div>

      <!-- Vehicle list -->
      <div v-else class="vehicle-list">
        <VehicleCard
          v-for="vehicle in store.vehiclesSortedByUrgency"
          :key="vehicle.id"
          :vehicle="vehicle"
          @click="goDetail(vehicle.id)"
        />
      </div>
    </div>

    <!-- FAB -->
    <button v-if="store.loaded && store.vehicles.length > 0" class="fab" @click="goAdd" aria-label="Aggiungi veicolo">
      <span class="fab-icon">+</span>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVehiclesStore } from '../stores/vehicles'
import VehicleCard from '../components/VehicleCard.vue'

const router = useRouter()
const store = useVehiclesStore()

onMounted(async () => {
  if (!store.loaded) await store.load()
})

const subtitle = computed(() => {
  const n = store.vehicles.length
  if (n === 0) return 'Nessun veicolo registrato'
  const urgent = store.stats.warn + store.stats.danger
  if (urgent === 0) return `${n} veicol${n === 1 ? 'o' : 'i'} · tutto in regola ✓`
  return `${n} veicol${n === 1 ? 'o' : 'i'} · ${urgent} scadenz${urgent === 1 ? 'a' : 'e'} in arrivo`
})

function goAdd() { router.push('/veicolo/nuovo') }
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
  background: var(--bg-page);
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
.stats-row {
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
}
.stat-pill {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  gap: 2px;
}
.stat-ok     { background: var(--ok-bg); }
.stat-warn   { background: var(--warn-bg); }
.stat-danger { background: var(--danger-bg); }
.stat-num {
  font-size: 22px;
  font-weight: 700;
}
.stat-ok   .stat-num { color: var(--ok-text); }
.stat-warn .stat-num { color: var(--warn-text); }
.stat-danger .stat-num { color: var(--danger-text); }
.stat-lbl {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-ok   .stat-lbl { color: var(--ok-text); }
.stat-warn .stat-lbl { color: var(--warn-text); }
.stat-danger .stat-lbl { color: var(--danger-text); }

.content-area {
  flex: 1;
  padding: 0 20px calc(var(--nav-height) + var(--safe-bottom) + 80px);
  overflow-y: auto;
}
.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 8px;
}
.loading-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.skeleton-card {
  height: 180px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border);
  animation: pulse 1.4s ease infinite;
}
@keyframes pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 32px;
  gap: 12px;
}
.empty-icon { font-size: 56px; }
.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}
.empty-sub {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 280px;
}
.empty-btn {
  margin-top: 8px;
  padding: 14px 28px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-xl);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

/* FAB */
.fab {
  position: fixed;
  right: 20px;
  bottom: calc(var(--nav-height) + var(--safe-bottom) + 16px);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  border: none;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0,102,255,0.4);
  cursor: pointer;
  transition: transform 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  z-index: 50;
}
.fab:active { transform: scale(0.93); }
.fab-icon { line-height: 1; margin-top: -2px; }
</style>
