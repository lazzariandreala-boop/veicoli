<template>
  <div class="thumb" :class="{ video: isVideo }">
    <img v-if="url && !isVideo && !isPdf" :src="url" alt="" loading="lazy" />
    <video v-else-if="url && isVideo" :src="url + '#t=0.5'" muted playsinline preload="metadata" />
    <div v-else-if="isPdf" class="doc"><FileText :size="26" /><span>PDF</span></div>
    <div v-else class="skeleton" style="position:absolute;inset:0;border-radius:0" />
    <div v-if="isVideo" class="play"><Play :size="18" fill="currentColor" /></div>
  </div>
</template>
<script setup lang="ts">
import { FileText, Play } from 'lucide-vue-next'
const props = defineProps<{ id: string }>()
const { url, type } = useMediaUrl(() => props.id)
const isVideo = computed(() => type.value?.startsWith('video/'))
const isPdf = computed(() => type.value === 'application/pdf')
</script>
<style scoped>
.thumb { position: relative; aspect-ratio: 1; border-radius: 14px; overflow: hidden; background: var(--surface-3); }
.thumb img, .thumb video { width: 100%; height: 100%; object-fit: cover; }
.play { position: absolute; inset: 0; display: grid; place-items: center; color: white; background: linear-gradient(transparent, rgba(0,0,0,.35)); }
.play svg { filter: drop-shadow(0 2px 6px rgba(0,0,0,.6)); }
.doc { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 4px; color: var(--text-2); font-size: 11px; font-weight: 700; }
</style>
