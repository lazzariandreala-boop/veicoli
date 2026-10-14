<template>
  <BottomSheet :open="open" :title="record ? 'Modifica lavoro' : category === 'tagliando' ? 'Tagliando fatto' : 'Nuovo lavoro'" @close="$emit('close')">
    <div class="stack" style="gap: 12px">
      <AutofillButton v-if="!record" :vehicle-id="vehicle.id" kind="fattura" what="la fattura" @go="$emit('close')" />
      <div class="chips cats">
        <button v-for="c in WORK_CATEGORIES" :key="c.value" type="button" class="chip-btn" :class="{ on: f.category === c.value }" @click="pickCat(c.value)">{{ c.label }}</button>
      </div>
      <FField v-model="f.title" :label="f.category === 'tagliando' ? 'Titolo' : 'Cosa è stato fatto'" placeholder="es. Tagliando 20.000 km, olio e filtri" required />
      <ServiceChecklist v-if="f.category === 'tagliando'" v-model="f.service!" />
      <div class="grid-2">
        <FField v-model="f.date" label="Data" type="date" required />
        <FField v-model="f.km" label="Km" type="number" />
        <FField v-model="f.cost" label="Costo" type="money" />
        <FField v-model="f.workshop" label="Officina / dove" />
      </div>
      <FField v-model="f.notes" label="Dettagli" type="textarea" placeholder="Ricambi, garanzia, prossimo intervento…" />
      <div>
        <div class="field" style="margin-bottom: 8px"><span>Foto, video e fatture</span></div>
        <MediaGallery v-model="f.mediaIds!" editable accept="image/*,video/*,application/pdf" />
      </div>
      <div class="form-actions">
        <button v-if="record" class="btn danger" @click="remove"><Trash2 :size="18" /></button>
        <button class="btn primary grow" :disabled="!f.title || !f.date" @click="save"><Check :size="18" /> Salva</button>
      </div>
    </div>
  </BottomSheet>
</template>
<script setup lang="ts">
import { Check, Trash2 } from 'lucide-vue-next'
import type { Vehicle, Work, WorkCategory } from '~/utils/types'
const props = defineProps<{ open: boolean; vehicle: Vehicle; record?: Work | null; category?: WorkCategory }>()
const emit = defineEmits<{ close: [] }>()
const f = reactive<Partial<Work>>({ mediaIds: [] })
let original: string[] = []
watch(() => props.open, (o) => {
  if (!o) return
  Object.assign(f, { title: props.category === 'tagliando' ? 'Tagliando' : undefined, category: props.category ?? 'tagliando', service: [], date: todayISO(), km: props.vehicle.currentKm, cost: undefined, workshop: undefined, notes: undefined, mediaIds: [] }, props.record ? structuredClone(toRaw(props.record)) : {})
  original = [...(f.mediaIds ?? [])]
}, { immediate: true })
function pickCat(c: WorkCategory) {
  const prevLabel = workCategoryLabel(f.category!)
  f.category = c
  if (!f.title || f.title === prevLabel) f.title = workCategoryLabel(c)
}
async function save() {
  if (f.category !== 'tagliando') f.service = undefined
  const rec = JSON.parse(JSON.stringify({ ...toRaw(f), id: props.record?.id ?? uid(), vehicleId: props.vehicle.id, createdAt: props.record?.createdAt ?? Date.now(), mediaIds: f.mediaIds ?? [] })) as Work
  await db().works.put(rec)
  await deleteMedia(original.filter((id) => !rec.mediaIds.includes(id)))
  if (rec.km && (!props.vehicle.currentKm || rec.km > props.vehicle.currentKm)) await db().vehicles.update(props.vehicle.id, { currentKm: rec.km })
  toast('Lavoro salvato')
  emit('close')
}
async function remove() {
  if (!props.record || !(await confirmDialog({ title: 'Eliminare questo lavoro?', text: 'Verranno eliminati anche foto e documenti allegati.', ok: 'Elimina', danger: true }))) return
  await deleteMedia(props.record.mediaIds)
  await db().works.delete(props.record.id)
  emit('close')
}
</script>
<style scoped>
.cats { flex-wrap: wrap; overflow: visible; }
</style>
