<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="index !== null && ids[index]" class="viewer" @click.self="close">
        <div class="bar">
          <span class="count">{{ index + 1 }} / {{ ids.length }}</span>
          <div class="row">
            <button class="vbtn" aria-label="Condividi" @click="share"><Share2 :size="20" /></button>
            <button class="vbtn" aria-label="Chiudi" @click="close"><X :size="22" /></button>
          </div>
        </div>
        <div class="stage" @touchstart.passive="ts" @touchend.passive="te">
          <img v-if="url && !isVideo && !isPdf" :src="url" alt="" />
          <video v-else-if="url && isVideo" :src="url" controls autoplay playsinline />
          <iframe v-else-if="url && isPdf" :src="url" />
        </div>
        <button v-if="index > 0" class="nav l" @click="go(-1)"><ChevronLeft :size="26" /></button>
        <button v-if="index < ids.length - 1" class="nav r" @click="go(1)"><ChevronRight :size="26" /></button>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { ChevronLeft, ChevronRight, Share2, X } from 'lucide-vue-next'
const props = defineProps<{ ids: string[] }>()
const index = defineModel<number | null>('index', { default: null })
const { url, type } = useMediaUrl(() => (index.value !== null ? props.ids[index.value] : undefined))
const isVideo = computed(() => type.value?.startsWith('video/'))
const isPdf = computed(() => type.value === 'application/pdf')
const close = () => { index.value = null }
const go = (d: number) => { if (index.value !== null) index.value = Math.max(0, Math.min(props.ids.length - 1, index.value + d)) }
let x0 = 0
const ts = (e: TouchEvent) => { x0 = e.touches[0].clientX }
const te = (e: TouchEvent) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1) }
async function share() {
  if (index.value === null) return
  const m = await db().media.get(props.ids[index.value])
  if (m) await shareBlob(m.blob, m.name || `veicoli-${m.id}`)
}
</script>
<style scoped>
.viewer { position: fixed; inset: 0; z-index: 90; background: rgba(0,0,0,.94); display: flex; flex-direction: column; }
.bar { display: flex; justify-content: space-between; align-items: center; padding: calc(var(--safe-top) + 10px) 14px 10px; color: white; }
.count { font-weight: 600; opacity: .8; }
.vbtn { width: 42px; height: 42px; border-radius: 50%; border: 0; background: rgba(255,255,255,.12); color: white; display: grid; place-items: center; cursor: pointer; }
.stage { flex: 1; display: grid; place-items: center; padding: 10px; min-height: 0; }
.stage img, .stage video { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; }
.stage iframe { width: 100%; height: 100%; border: 0; background: white; border-radius: 8px; }
.nav { position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(255,255,255,.12); color: white; display: grid; place-items: center; cursor: pointer; }
.nav.l { left: 10px; } .nav.r { right: 10px; }
</style>
