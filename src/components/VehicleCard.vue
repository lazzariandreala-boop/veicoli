<template>
  <div class="vehicle-card" @click="$emit('click')">

    <!-- Colored banner header -->
    <div class="card-banner" :class="bannerClass">
      <!-- Orbs decorativi -->
      <div class="banner-orb banner-orb-1" />
      <div class="banner-orb banner-orb-2" />

      <div class="banner-content">
        <div class="banner-emoji">{{ vehicleEmoji }}</div>
        <div class="banner-info">
          <div class="banner-name">{{ vehicle.name }}</div>
          <div class="banner-plate">{{ vehicle.plate }}</div>
        </div>
        <div class="banner-status-badge" v-if="urgentCount > 0" :class="badgeClass">
          {{ urgentCount }} scad.
        </div>
        <div class="banner-chevron">›</div>
      </div>
    </div>

    <!-- Deadline rows -->
    <div class="card-body">
      <DeadlineRow label="Bollo" :date="vehicle.bollo" />
      <div class="row-divider" />
      <DeadlineRow label="Assicurazione" :date="vehicle.assicurazione" />
      <div class="row-divider" />
      <DeadlineRow label="Revisione" :date="vehicle.revisione" />
    </div>

    <!-- Alert footer -->
    <div v-if="urgentCount > 0" class="card-alert" :class="alertClass">
      <span class="alert-dot" />
      {{ alertText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DeadlineRow from './DeadlineRow.vue'

const props = defineProps({ vehicle: { type: Object, required: true } })
defineEmits(['click'])

const EMOJIS = { car: '🚗', moto: '🏍️', van: '🚐', truck: '🚛' }
const vehicleEmoji = computed(() => EMOJIS[props.vehicle.type] || '🚗')

function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
}

const deadlineDays = computed(() =>
  [props.vehicle.bollo, props.vehicle.assicurazione, props.vehicle.revisione]
    .map(daysUntil).filter(d => d !== null)
)

const urgentCount = computed(() =>
  deadlineDays.value.filter(d => d !== null && d <= 30).length
)

const minDays = computed(() => {
  if (!deadlineDays.value.length) return null
  return Math.min(...deadlineDays.value)
})

const status = computed(() => {
  const m = minDays.value
  if (m === null) return 'ok'
  if (m < 0 || m <= 15) return 'danger'
  if (m <= 30) return 'warn'
  return 'ok'
})

const bannerClass = computed(() => `banner-${status.value}`)
const badgeClass  = computed(() => `badge-${status.value}`)
const alertClass  = computed(() => `alert-${status.value}`)

const alertText = computed(() => {
  const min = Math.min(...deadlineDays.value.filter(d => d !== null && d <= 30))
  if (min < 0) return 'Scadenze già passate — rinnova subito'
  if (min === 0) return 'Scade oggi!'
  if (min === 1) return 'Scade domani!'
  return `${urgentCount.value} scadenz${urgentCount.value === 1 ? 'a' : 'e'} entro 30 giorni`
})
</script>

<style scoped>
.vehicle-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(13,10,30,0.1);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(.32,.72,0,1), box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  background: var(--bg-card);
}
.vehicle-card:hover  { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(13,10,30,0.15); }
.vehicle-card:active { transform: scale(0.975); }

/* ── Banner ── */
.card-banner {
  position: relative;
  overflow: hidden;
  padding: 18px 16px 16px;
}

.banner-ok     { background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); }
.banner-warn   { background: linear-gradient(135deg, #78350F 0%, #B45309 100%); }
.banner-danger { background: linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%); }

/* Orbs decorativi */
.banner-orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  pointer-events: none;
}
.banner-orb-1 { width: 80px; height: 80px; top: -24px; right: 40px; }
.banner-orb-2 { width: 48px; height: 48px; top: 10px; right: 20px; }

.banner-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
}

.banner-emoji {
  font-size: 34px;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
}

.banner-info { flex: 1; min-width: 0; }
.banner-name {
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.3px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.banner-plate {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

.banner-status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 99px;
  white-space: nowrap;
  letter-spacing: 0.2px;
}
.badge-warn   { background: rgba(255,255,255,0.25); color: #fff; }
.badge-danger { background: rgba(255,255,255,0.25); color: #fff; }

.banner-chevron {
  font-size: 24px;
  color: rgba(255,255,255,0.7);
  line-height: 1;
}

/* ── Body ── */
.card-body {
  padding: 4px 16px 12px;
  background: var(--bg-card);
}
.row-divider {
  height: 1px;
  background: var(--border);
  margin: 0 0;
}

/* ── Alert footer ── */
.card-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 12px;
  font-weight: 700;
}
.alert-warn   { background: var(--warn-bg);   color: var(--warn); }
.alert-danger { background: var(--danger-bg); color: var(--danger); }

.alert-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  animation: blink 1.3s ease infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.35; transform: scale(0.8); }
}
</style>
