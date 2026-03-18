<template>
  <div class="deadline-row">
    <div class="dl-left">
      <span class="dl-label">{{ label }}</span>
      <span class="dl-date">{{ fmtDate }}</span>
    </div>
    <div class="dl-right">
      <div class="dl-bar-wrap">
        <div class="dl-bar" :class="barClass" :style="{ width: barWidth + '%' }" />
      </div>
      <span class="dl-days" :class="daysClass">{{ daysLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  date:  { type: String, default: null }
})

const today = new Date(); today.setHours(0, 0, 0, 0)

const days = computed(() => {
  if (!props.date) return null
  const d = new Date(props.date); d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
})

const fmtDate = computed(() => {
  if (!props.date) return 'Non impostata'
  return new Date(props.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
})

const status = computed(() => {
  const d = days.value
  if (d === null) return 'none'
  if (d < 0) return 'expired'
  if (d <= 15) return 'danger'
  if (d <= 30) return 'alert'
  if (d <= 60) return 'warn'
  return 'ok'
})

const barClass = computed(() => `bar-${status.value === 'expired' ? 'danger' : status.value}`)
const daysClass = computed(() => `days-${status.value === 'expired' ? 'danger' : status.value}`)

const barWidth = computed(() => {
  const d = days.value
  if (d === null) return 0
  if (d < 0) return 100
  return Math.max(5, Math.min(100, 100 - (d / 365) * 100))
})

const daysLabel = computed(() => {
  const d = days.value
  if (d === null) return '—'
  if (d < 0) return `Scaduto da ${Math.abs(d)}g`
  if (d === 0) return 'Scade oggi!'
  if (d === 1) return 'Domani'
  return `${d}g`
})
</script>

<style scoped>
.deadline-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 0;
}
.dl-left {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 110px;
}
.dl-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}
.dl-date {
  font-size: 11px;
  color: var(--text-tertiary);
}
.dl-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}
.dl-bar-wrap {
  width: 100%;
  height: 6px;
  background: var(--border);
  border-radius: 99px;
  overflow: hidden;
}
.dl-bar {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(.32,.72,0,1);
}
.bar-ok     { background: var(--ok-grad); }
.bar-warn   { background: var(--warn-grad); }
.bar-alert  { background: var(--alert-grad); }
.bar-danger { background: var(--danger-grad); }
.bar-none   { background: var(--border); }

.dl-days {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.days-ok     { color: var(--ok); }
.days-warn   { color: var(--warn); }
.days-alert  { color: var(--alert); }
.days-danger { color: var(--danger); }
.days-none   { color: var(--text-tertiary); }
</style>
