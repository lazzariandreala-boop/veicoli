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
  date: { type: String, default: null }
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

const barClass = computed(() => ({
  'bar-ok': status.value === 'ok',
  'bar-warn': status.value === 'warn',
  'bar-alert': status.value === 'alert',
  'bar-danger': status.value === 'danger' || status.value === 'expired'
}))

const daysClass = computed(() => ({
  'days-ok': status.value === 'ok',
  'days-warn': status.value === 'warn',
  'days-alert': status.value === 'alert',
  'days-danger': status.value === 'danger' || status.value === 'expired'
}))

const barWidth = computed(() => {
  const d = days.value
  if (d === null) return 0
  if (d < 0) return 100
  return Math.max(4, Math.min(100, 100 - (d / 365) * 100))
})

const daysLabel = computed(() => {
  const d = days.value
  if (d === null) return '—'
  if (d < 0) return `Scaduto da ${Math.abs(d)}gg`
  if (d === 0) return 'Scade oggi!'
  if (d === 1) return 'Domani'
  return `${d} giorni`
})
</script>

<style scoped>
.deadline-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
}
.dl-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 108px;
}
.dl-label {
  font-size: 13px;
  font-weight: 500;
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
  height: 5px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.dl-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.bar-ok    { background: var(--ok); }
.bar-warn  { background: var(--warn); }
.bar-alert { background: var(--alert); }
.bar-danger{ background: var(--danger); }

.dl-days {
  font-size: 12px;
  font-weight: 600;
}
.days-ok    { color: var(--ok-text); }
.days-warn  { color: var(--warn-text); }
.days-alert { color: var(--alert-text); }
.days-danger{ color: var(--danger-text); }
</style>
