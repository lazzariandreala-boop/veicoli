<template>
  <div>
    <div class="gallery">
      <button v-for="(id, i) in modelValue" :key="id" class="cell" @click="openAt(i)">
        <MediaThumb :id="id" />
        <span v-if="editable" class="remove" @click.stop="remove(id)"><X :size="14" /></span>
      </button>
      <label v-if="editable" class="cell add">
        <input type="file" :accept="accept" multiple hidden @change="onPick" />
        <Loader v-if="busy" :size="22" class="spin" />
        <template v-else><ImagePlus :size="22" /><span>{{ addLabel }}</span></template>
      </label>
    </div>
    <MediaViewer v-model:index="viewerIndex" :ids="modelValue" />
  </div>
</template>
<script setup lang="ts">
import { ImagePlus, Loader, X } from 'lucide-vue-next'
const props = withDefaults(defineProps<{ modelValue: string[]; editable?: boolean; accept?: string; addLabel?: string }>(), {
  editable: false, accept: 'image/*,video/*', addLabel: 'Aggiungi',
})
const emit = defineEmits<{ 'update:modelValue': [string[]]; removed: [string] }>()
const viewerIndex = ref<number | null>(null)
const busy = ref(false)
const openAt = (i: number) => { viewerIndex.value = i }
async function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  busy.value = true
  try {
    const ids = await storeFiles(input.files)
    emit('update:modelValue', [...props.modelValue, ...ids])
  } catch (err) {
    toast('Impossibile salvare il file', 'danger')
  } finally {
    busy.value = false
    input.value = ''
  }
}
function remove(id: string) {
  emit('update:modelValue', props.modelValue.filter((x) => x !== id))
  emit('removed', id)
}
</script>
<style scoped>
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.cell { position: relative; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 14px; }
.add { aspect-ratio: 1; display: grid; place-items: center; align-content: center; gap: 6px; border: 1.5px dashed var(--line-2); color: var(--text-2); font-size: 12px; font-weight: 600; background: var(--surface-2); }
.remove { position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,.65); color: white; display: grid; place-items: center; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
</style>
