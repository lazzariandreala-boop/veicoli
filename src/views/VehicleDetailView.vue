<template>
  <div class="page" v-if="vehicle">
    <!-- Header -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack">‹ Garage</button>
      <button class="edit-btn" @click="goEdit">Modifica</button>
    </div>

    <!-- Hero -->
    <div class="vehicle-hero">
      <div class="hero-emoji">{{ vehicleEmoji }}</div>
      <h1 class="hero-name">{{ vehicle.name }}</h1>
      <div class="hero-meta">
        <span class="plate-badge">{{ vehicle.plate }}</span>
        <span class="hero-model" v-if="vehicle.model">{{ vehicle.model }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="detail-scroll">

      <!-- Scadenze -->
      <div class="section">
        <div class="section-label">Scadenze</div>
        <div class="deadlines-card">
          <div class="deadline-item" v-for="(dl, i) in deadlines" :key="dl.key">
            <div v-if="i > 0" class="item-divider" />
            <div class="dl-header-row">
              <span class="dl-icon">{{ dl.icon }}</span>
              <span class="dl-title">{{ dl.label }}</span>
              <DeadlineBadge :days="dl.days" />
            </div>
            <div class="dl-body">
              <span class="dl-date-big" :class="getDaysClass(dl.days)">{{ dl.fmtDate }}</span>
              <div class="dl-bar-track">
                <div class="dl-bar-fill" :class="getBarClass(dl.days)" :style="{ width: getBarWidth(dl.days) + '%' }" />
              </div>
              <div class="dl-notif-row" v-if="dl.days !== null && dl.days >= 0">
                <span class="notif-chip" v-if="dl.days <= 30">🔔 30gg prima ✓</span>
                <span class="notif-chip" v-if="dl.days <= 15">🔔 15gg prima ✓</span>
                <span class="notif-chip" v-if="dl.days <= 1">🔔 Domani ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dati tecnici -->
      <div class="section">
        <div class="section-label">Dati tecnici</div>
        <div class="info-card">
          <div class="info-row" v-for="row in techInfo" :key="row.label">
            <span class="info-label">{{ row.label }}</span>
            <span class="info-value">{{ row.value || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Note -->
      <div class="section" v-if="vehicle.notes">
        <div class="section-label">Note</div>
        <div class="notes-card">{{ vehicle.notes }}</div>
      </div>

      <!-- Rinfresca notifiche -->
      <div class="section">
        <button class="refresh-notif-btn" :disabled="refreshing" @click="refreshNotifications">
          {{ refreshing ? 'Aggiornamento…' : '🔔 Aggiorna notifiche' }}
        </button>
      </div>

      <div class="bottom-spacer" />
    </div>
  </div>

  <div v-else class="not-found">
    <p>Veicolo non trovato.</p>
    <button @click="goBack">← Torna al garage</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVehiclesStore } from '../stores/vehicles'
import { cancelVehicleNotifications, scheduleVehicleNotifications } from '../composables/useNotifications'
import DeadlineBadge from '../components/DeadlineBadge.vue'

const router = useRouter()
const route = useRoute()
const store = useVehiclesStore()
const refreshing = ref(false)

onMounted(async () => {
  if (!store.loaded) await store.load()
})

const vehicle = computed(() => store.getVehicleById(route.params.id))

const EMOJIS = { car: '🚗', moto: '🏍️', van: '🚐', truck: '🚛' }
const vehicleEmoji = computed(() => EMOJIS[vehicle.value?.type] || '🚗')

const today = new Date(); today.setHours(0, 0, 0, 0)

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
}

function fmtDate(dateStr) {
  if (!dateStr) return 'Non impostata'
  return new Date(dateStr).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
}

const deadlines = computed(() => {
  if (!vehicle.value) return []
  return [
    { key: 'bollo', label: 'Bollo', icon: '🏛️', date: vehicle.value.bollo },
    { key: 'assicurazione', label: 'Assicurazione', icon: '🛡️', date: vehicle.value.assicurazione },
    { key: 'revisione', label: 'Revisione', icon: '🔧', date: vehicle.value.revisione }
  ].map(dl => ({
    ...dl,
    days: daysUntil(dl.date),
    fmtDate: fmtDate(dl.date)
  }))
})

const techInfo = computed(() => {
  if (!vehicle.value) return []
  return [
    { label: 'Tipo', value: { car: 'Automobile', moto: 'Motociclo', van: 'Furgone', truck: 'Camion' }[vehicle.value.type] },
    { label: 'Targa', value: vehicle.value.plate },
    { label: 'Telaio (VIN)', value: vehicle.value.vin },
    { label: 'Anno acquisto', value: vehicle.value.yearBuy },
    { label: 'Anno immatricolazione', value: vehicle.value.yearReg },
    { label: 'Marca', value: vehicle.value.brand },
    { label: 'Modello', value: vehicle.value.model },
    { label: 'Versione', value: vehicle.value.version },
    { label: 'Colore', value: vehicle.value.color }
  ].filter(r => r.value)
})

function getBarClass(days) {
  if (days === null) return ''
  if (days < 0 || days <= 15) return 'bar-danger'
  if (days <= 30) return 'bar-alert'
  if (days <= 60) return 'bar-warn'
  return 'bar-ok'
}

function getDaysClass(days) {
  if (days === null) return ''
  if (days < 0 || days <= 15) return 'text-danger'
  if (days <= 30) return 'text-warn'
  return ''
}

function getBarWidth(days) {
  if (days === null) return 0
  if (days < 0) return 100
  return Math.max(4, Math.min(100, 100 - (days / 365) * 100))
}

async function refreshNotifications() {
  if (!vehicle.value) return
  refreshing.value = true
  try {
    await cancelVehicleNotifications(vehicle.value.id)
    await scheduleVehicleNotifications(vehicle.value)
    alert('Notifiche aggiornate correttamente!')
  } catch (e) {
    alert('Errore nell\'aggiornamento delle notifiche.')
  } finally {
    refreshing.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/')
}
function goEdit() { router.push(`/veicolo/${vehicle.value.id}/modifica`) }
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-page);
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 56px 16px 12px;
}
.back-btn {
  background: none; border: none; font-size: 16px; font-weight: 500;
  color: var(--accent); cursor: pointer; font-family: inherit;
}
.edit-btn {
  background: none; border: none; font-size: 16px; font-weight: 500;
  color: var(--accent); cursor: pointer; font-family: inherit;
}

.vehicle-hero {
  padding: 8px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}
.hero-emoji { font-size: 56px; line-height: 1; }
.hero-name {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}
.hero-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
.plate-badge {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  background: var(--bg-card);
  border: 1px solid var(--border-mid);
  border-radius: 6px;
  padding: 3px 10px;
  color: var(--text-primary);
}
.hero-model { font-size: 14px; color: var(--text-secondary); }

.detail-scroll { overflow-y: auto; flex: 1; }
.section { padding: 0 20px 20px; }
.section-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  padding-left: 4px;
}

/* Deadlines card */
.deadlines-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
}
.deadline-item { padding: 14px 16px; }
.item-divider { height: 1px; background: var(--border); margin: 0; }
.dl-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.dl-icon { font-size: 16px; }
.dl-title { font-size: 15px; font-weight: 600; color: var(--text-primary); flex: 1; }
.dl-body { display: flex; flex-direction: column; gap: 8px; }
.dl-date-big { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.dl-date-big.text-danger { color: var(--danger-text); }
.dl-date-big.text-warn   { color: var(--warn-text); }
.dl-bar-track {
  height: 6px;
  background: var(--bg-input);
  border-radius: 3px;
  overflow: hidden;
}
.dl-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.bar-ok     { background: var(--ok); }
.bar-warn   { background: var(--warn); }
.bar-alert  { background: var(--alert); }
.bar-danger { background: var(--danger); }

.dl-notif-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.notif-chip {
  font-size: 11px;
  background: var(--accent-light);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* Info card */
.info-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 14px; color: var(--text-secondary); }
.info-value { font-size: 14px; font-weight: 500; color: var(--text-primary); text-align: right; max-width: 60%; }

/* Notes */
.notes-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Refresh btn */
.refresh-notif-btn {
  width: 100%;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: 500;
  color: var(--accent);
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}
.refresh-notif-btn:disabled { opacity: 0.5; }

.not-found {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 100dvh; gap: 16px;
  color: var(--text-secondary);
}

.bottom-spacer { height: 32px; }
</style>
