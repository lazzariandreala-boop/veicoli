<template>
  <button class="list-item" @click="$emit('click')">
    <div class="icon-bubble accent"><Wrench :size="19" /></div>
    <div class="grow">
      <strong class="ellipsis" style="display: block">{{ w.title }}</strong>
      <div class="faint ellipsis" style="font-size: 13px">{{ [formatDate(w.date), w.km ? km(w.km) : null, w.workshop].filter(Boolean).join(' · ') }}</div>
    </div>
    <div style="text-align: right">
      <div class="num" style="font-weight: 700">{{ w.cost !== undefined ? money(w.cost) : '' }}</div>
      <div v-if="w.mediaIds.length" class="faint row" style="gap: 4px; justify-content: flex-end; font-size: 12px"><Paperclip :size="12" />{{ w.mediaIds.length }}</div>
    </div>
  </button>
</template>
<script setup lang="ts">
import { Paperclip, Wrench } from 'lucide-vue-next'
import { formatDate } from '~/utils/deadlines'
import type { Work } from '~/utils/types'
defineProps<{ w: Work }>()
defineEmits<{ click: [] }>()
</script>
