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
  if (d < 0) return 'Scaduto'
  if (d === 0) return 'Oggi'
  if (d === 1) return '1 giorno'
  return `${d} giorni`
})
</script>

<style scoped>
.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}
.badge-ok      { background: var(--ok-bg);    color: var(--ok-text); }
.badge-warn    { background: var(--warn-bg);   color: var(--warn-text); }
.badge-alert   { background: var(--alert-bg);  color: var(--alert-text); }
.badge-danger,
.badge-expired { background: var(--danger-bg); color: var(--danger-text); }
.badge-none    { background: var(--bg-input);  color: var(--text-tertiary); }
</style>
