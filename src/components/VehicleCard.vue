<template>
  <div class="vehicle-card" @click="$emit('click')">
    <div class="card-header">
      <div class="vehicle-icon">{{ vehicleEmoji }}</div>
      <div class="vehicle-info">
        <div class="vehicle-name">{{ vehicle.name }}</div>
        <div class="vehicle-meta">{{ vehicle.plate }} · Imm. {{ vehicle.yearReg }}</div>
      </div>
      <div class="card-arrow">›</div>
    </div>

    <div class="card-deadlines">
      <DeadlineRow label="Bollo" :date="vehicle.bollo" />
      <div class="divider" />
      <DeadlineRow label="Assicurazione" :date="vehicle.assicurazione" />
      <div class="divider" />
      <DeadlineRow label="Revisione" :date="vehicle.revisione" />
    </div>

    <div v-if="urgentCount > 0" class="urgent-banner" :class="urgentBannerClass">
      <span class="urgent-dot" />
      {{ urgentText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DeadlineRow from './DeadlineRow.vue'

const props = defineProps({
  vehicle: { type: Object, required: true }
})
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
    .map(daysUntil)
    .filter(d => d !== null)
)

const urgentCount = computed(() =>
  deadlineDays.value.filter(d => d !== null && d <= 30).length
)

const urgentBannerClass = computed(() => {
  const min = Math.min(...deadlineDays.value.filter(d => d !== null && d <= 30))
  if (min < 0 || min <= 15) return 'banner-danger'
  return 'banner-warn'
})

const urgentText = computed(() => {
  const urgent = deadlineDays.value.filter(d => d !== null && d <= 30)
  if (!urgent.length) return ''
  const min = Math.min(...urgent)
  if (min < 0) return 'Una o più scadenze sono già passate'
  if (min === 0) return 'Scadenza oggi!'
  if (min === 1) return '1 scadenza imminente domani'
  return `${urgentCount.value} scadenz${urgentCount.value === 1 ? 'a' : 'e'} nei prossimi 30 giorni`
})
</script>

<style scoped>
.vehicle-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.vehicle-card:active {
  transform: scale(0.985);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--border);
}
.vehicle-icon {
  font-size: 26px;
  line-height: 1;
  width: 40px;
  text-align: center;
}
.vehicle-info { flex: 1; }
.vehicle-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.vehicle-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}
.card-arrow {
  font-size: 22px;
  color: var(--text-tertiary);
  line-height: 1;
}
.card-deadlines {
  padding: 4px 14px 8px;
}
.divider {
  height: 1px;
  background: var(--border);
}
.urgent-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 500;
  border-top: 1px solid var(--border);
}
.banner-warn   { background: var(--warn-bg);   color: var(--warn-text); }
.banner-danger { background: var(--danger-bg);  color: var(--danger-text); }
.urgent-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentColor;
}
</style>
