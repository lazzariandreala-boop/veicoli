<template>
  <div class="dt card flat" :class="tone">
    <div class="icon-bubble" :class="tone"><component :is="icon" :size="20" /></div>
    <div class="grow">
      <div class="row" style="gap: 8px"><strong>{{ d.label }}</strong><span class="chip" :class="tone">{{ relativeDays(d.days) }}</span></div>
      <div class="faint" style="font-size: 13px; margin-top: 2px">{{ d.detail ?? '' }}{{ d.detail ? ' · ' : '' }}{{ formatDate(d.date) }}</div>
    </div>
    <button class="btn sm" @click="$emit('action')">{{ actionLabel }}</button>
  </div>
</template>
<script setup lang="ts">
import { ClipboardCheck, Landmark, ShieldCheck } from 'lucide-vue-next'
import { formatDate } from '~/utils/deadlines'
import type { Deadline } from '~/utils/types'
const props = defineProps<{ d: Deadline & { days: number } }>()
defineEmits<{ action: [] }>()
const tone = computed(() => urgency(props.d.days))
const icon = computed(() => ({ bollo: Landmark, assicurazione: ShieldCheck, revisione: ClipboardCheck })[props.d.kind])
const actionLabel = computed(() => ({ bollo: 'Pagato', assicurazione: 'Rinnova', revisione: 'Fatta' })[props.d.kind])
</script>
<style scoped>
.dt { display: flex; align-items: center; gap: 12px; padding: 14px; }
.dt.danger { border-color: rgba(248, 113, 113, .35); }
.dt.warn { border-color: rgba(251, 191, 36, .3); }
</style>
