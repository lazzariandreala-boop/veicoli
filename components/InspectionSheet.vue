<template>
  <BottomSheet :open="open" :title="record ? 'Modifica revisione' : 'Revisione fatta'" @close="$emit('close')">
    <div class="stack" style="gap: 12px">
      <div class="segmented">
        <button v-for="o in outcomes" :key="o.value" type="button" :class="{ on: f.outcome === o.value }" @click="f.outcome = o.value">{{ o.label }}</button>
      </div>
      <div class="grid-2">
        <FField v-model="f.date" label="Data" type="date" required />
        <FField v-model="f.km" label="Km" type="number" />
        <FField v-model="f.cost" label="Costo" type="money" />
        <FField v-model="f.center" label="Centro revisioni" />
      </div>
      <FField v-model="f.notes" label="Note" type="textarea" />
      <div class="form-actions">
        <button v-if="record" class="btn danger" @click="remove"><Trash2 :size="18" /></button>
        <button class="btn primary grow" :disabled="!f.date" @click="save"><Check :size="18" /> Salva</button>
      </div>
    </div>
  </BottomSheet>
</template>
<script setup lang="ts">
import { Check, Trash2 } from 'lucide-vue-next'
import type { Inspection, Vehicle } from '~/utils/types'
const props = defineProps<{ open: boolean; vehicle: Vehicle; record?: Inspection | null }>()
const emit = defineEmits<{ close: [] }>()
const outcomes = [{ value: 'regolare', label: 'Regolare' }, { value: 'ripetere', label: 'Da ripetere' }, { value: 'sospeso', label: 'Sospeso' }] as const
const f = reactive<Partial<Inspection>>({})
watch(() => props.open, (o) => {
  if (!o) return
  Object.assign(f, { date: todayISO(), km: props.vehicle.currentKm, cost: undefined, center: undefined, notes: undefined, outcome: 'regolare' }, props.record ? structuredClone(toRaw(props.record)) : {})
}, { immediate: true })
async function save() {
  const rec = JSON.parse(JSON.stringify({ ...toRaw(f), id: props.record?.id ?? uid(), vehicleId: props.vehicle.id, createdAt: props.record?.createdAt ?? Date.now() })) as Inspection
  await db().inspections.put(rec)
  if (rec.km && (!props.vehicle.currentKm || rec.km > props.vehicle.currentKm)) await db().vehicles.update(props.vehicle.id, { currentKm: rec.km })
  toast('Revisione registrata')
  emit('close')
}
async function remove() {
  if (!props.record || !(await confirmDialog({ title: 'Eliminare questa revisione?', ok: 'Elimina', danger: true }))) return
  await db().inspections.delete(props.record.id)
  emit('close')
}
</script>
