<template>
  <div class="scanner card" :class="{ busy }">
    <div class="scan-glow" />
    <template v-if="!busy">
      <div class="row" style="align-items: flex-start">
        <div class="icon-bubble accent"><ScanText :size="22" /></div>
        <div class="grow">
          <strong style="font-size: 16px">Compila dal libretto</strong>
          <p class="muted" style="margin: 2px 0 0; font-size: 13.5px">Fotografa la carta di circolazione (tutte le facciate) o scegli il PDF: i campi si compilano da soli.</p>
        </div>
      </div>
      <div class="grid-2" style="margin-top: 14px">
        <label class="btn primary">
          <Camera :size="18" /> Fotografa
          <input type="file" accept="image/*" capture="environment" hidden @change="onPick" />
        </label>
        <label class="btn">
          <FileUp :size="18" /> Foto o PDF
          <input type="file" accept="image/*,application/pdf" multiple hidden @change="onPick" />
        </label>
      </div>
      <label v-if="hasAi" class="toggle" style="margin-top: 12px">
        <span><strong style="font-size: 14px">Lettura avanzata</strong><br><span class="faint" style="font-size: 12.5px">Più precisa con foto storte o poco nitide (serve internet)</span></span>
        <input v-model="useAi" type="checkbox" />
      </label>
      <p v-if="lastResult" class="result"><CircleCheck :size="16" /> {{ lastResult }}</p>
      <p v-if="error" class="result err"><CircleAlert :size="16" /> {{ error }}</p>
    </template>
    <template v-else>
      <div class="progress-wrap">
        <div class="scan-anim"><ScanText :size="34" /><div class="beam" /></div>
        <strong>{{ stage }}</strong>
        <div class="bar"><div :style="{ width: Math.round(pct * 100) + '%' }" /></div>
        <span class="faint num" style="font-size: 13px">{{ Math.round(pct * 100) }}%</span>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { Camera, CircleAlert, CircleCheck, FileUp, ScanText } from 'lucide-vue-next'
import type { LibrettoData } from '~/utils/libretto'

const emit = defineEmits<{ result: [data: LibrettoData, files: File[]] }>()
const busy = ref(false)
const stage = ref('')
const pct = ref(0)
const error = ref('')
const lastResult = ref('')
const hasAi = computed(() => !!aiSettings.apiKey)
const useAi = ref(true)

async function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return
  busy.value = true
  error.value = ''
  lastResult.value = ''
  const progress = (s: string, p: number) => { stage.value = s; pct.value = p }
  try {
    let data: LibrettoData
    if (hasAi.value && useAi.value) {
      try {
        data = await readLibrettoAI(files, progress)
      } catch (err) {
        toast(`${describeAiError(err)} Uso la lettura sul telefono.`, 'info')
        data = (await readLibrettoOffline(files, progress)).data
      }
    } else {
      data = (await readLibrettoOffline(files, progress)).data
    }
    const n = Object.keys(data).filter((k) => k !== 'tipoVeicolo').length
    if (n < 3) {
      error.value = 'Non sono riuscito a leggere il libretto. Prova con una foto più nitida, dritta e ben illuminata.'
    } else {
      lastResult.value = `${n} campi compilati dal libretto. Controllali qui sotto.`
      emit('result', data, files)
    }
  } catch (err) {
    console.error(err)
    error.value = 'Lettura non riuscita: ' + (err instanceof Error ? err.message : String(err))
  } finally {
    busy.value = false
  }
}
</script>
<style scoped>
.scanner { position: relative; overflow: hidden; border-color: rgba(124, 92, 255, .35); }
.scan-glow { position: absolute; right: -60px; top: -80px; width: 220px; height: 220px; background: radial-gradient(closest-side, rgba(34, 211, 238, .22), transparent); pointer-events: none; }
.result { display: flex; gap: 8px; align-items: center; margin: 12px 0 0; font-size: 13.5px; font-weight: 600; color: var(--ok); }
.result.err { color: var(--danger); align-items: flex-start; }
.result svg { flex: none; }
.progress-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 14px 0 6px; text-align: center; }
.scan-anim { position: relative; width: 74px; height: 74px; border-radius: 22px; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent); overflow: hidden; }
.beam { position: absolute; left: 8px; right: 8px; height: 3px; border-radius: 3px; background: linear-gradient(90deg, transparent, var(--accent-2), transparent); box-shadow: 0 0 14px var(--accent-2); animation: beam 1.4s ease-in-out infinite alternate; }
@keyframes beam { from { top: 10px } to { top: 61px } }
.bar { width: 100%; max-width: 320px; height: 8px; border-radius: 99px; background: var(--surface-3); overflow: hidden; }
.bar > div { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .3s ease; }
</style>
