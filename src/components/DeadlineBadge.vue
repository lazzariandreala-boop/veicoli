<template>
  <span class="badge" :class="badgeClass">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  days: { type: Number, default: null }
})

const status = computed(() => {
  const d = props.days
  if (d === null || d === undefined) return 'none'
  if (d < 0) return 'expired'
  if (d <= 15) return 'danger'
  if (d <= 30) return 'alert'
  if (d <= 60) return 'warn'
  return 'ok'
})

const badgeClass = computed(() => `badge-${status.value}`)

const label = computed(() => {
  const d = props.days
  if (d === null || d === undefined) return '—'
  if (d < 0) return `Scaduto`
  if (d === 0) return 'Oggi!'
  if (d === 1) return '1g'
  return `${d}g`
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 99px;
  white-space: nowrap;
  letter-spacing: 0.2px;
}
.badge-ok      { background: var(--ok-bg);     color: var(--ok); }
.badge-warn    { background: var(--warn-bg);   color: var(--warn); }
.badge-alert   { background: var(--alert-bg);  color: var(--alert); }
.badge-danger,
.badge-expired { background: var(--danger-bg); color: var(--danger); }
.badge-none    { background: var(--bg-input);  color: var(--text-tertiary); }
</style>
