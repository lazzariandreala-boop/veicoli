<template>
  <BottomSheet :open="open" title="Fine del possesso" @close="$emit('close')">
    <div class="stack" style="gap: 12px">
      <div class="segmented danger types">
        <button v-for="t in types" :key="t.value" type="button" :class="{ on: f.type === t.value }" @click="f.type = t.value">{{ t.label }}</button>
      </div>
      <div class="grid-2">
        <FField v-model="f.date" :label="f.type === 'venduto' ? 'Data di vendita' : 'Data'" type="date" />
        <FField v-model="f.price" :label="priceLabel" type="money" />
        <FField v-if="f.type === 'venduto'" v-model="f.buyer" label="Acquirente" />
        <FField v-model="f.km" label="Km finali" type="number" />
      </div>
      <FField v-if="f.type === 'distrutto' && incidents.length" v-model="f.incidentId" label="Incidente collegato" :options="incidents.map((i) => ({ value: i.id, label: `${formatDate(i.date)} · ${i.place ?? FAULT_LABEL[i.fault]}` }))" />
      <FField v-model="f.notes" label="Note" type="textarea" />
      <p class="faint" style="margin: 0; font-size: 13px">Il veicolo resta nell'archivio con tutto lo storico, ma non riceverai più promemoria.</p>
      <div class="form-actions">
        <button v-if="vehicle.end" class="btn" @click="reactivate">Rimetti in uso</button>
        <button class="btn primary grow" @click="save"><Check :size="18" /> Salva</button>
      </div>
    </div>
  </BottomSheet>
</template>
<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { formatDate } from '~/utils/deadlines'
import type { EndOfLife, Incident, Vehicle } from '~/utils/types'
const props = defineProps<{ open: boolean; vehicle: Vehicle; incidents: Incident[] }>()
const emit = defineEmits<{ close: [] }>()
const types = [{ value: 'venduto', label: 'Venduto' }, { value: 'distrutto', label: 'Distrutto' }, { value: 'rottamato', label: 'Rottamato' }, { value: 'rubato', label: 'Rubato' }] as const
const f = reactive<Partial<EndOfLife>>({})
const priceLabel = computed(() => (f.type === 'venduto' ? 'Prezzo di vendita' : f.type === 'rottamato' ? 'Incasso / incentivo' : 'Rimborso assicurazione'))
watch(() => props.open, (o) => {
  if (!o) return
  Object.assign(f, { type: 'venduto', date: todayISO(), price: undefined, buyer: undefined, km: props.vehicle.currentKm, incidentId: undefined, notes: undefined }, props.vehicle.end ? structuredClone(toRaw(props.vehicle.end)) : {})
}, { immediate: true })
async function save() {
  const end = JSON.parse(JSON.stringify(toRaw(f))) as EndOfLife
  await db().vehicles.update(props.vehicle.id, { status: end.type, end, updatedAt: Date.now(), ...(end.km ? { currentKm: end.km } : {}) })
  toast(`Veicolo segnato come ${STATUS_LABEL[end.type].toLowerCase()}`)
  emit('close')
}
async function reactivate() {
  await db().vehicles.update(props.vehicle.id, { status: 'attivo', end: undefined, updatedAt: Date.now() })
  toast('Veicolo di nuovo in uso')
  emit('close')
}
</script>
<style scoped>
.types { grid-auto-flow: row; grid-template-columns: 1fr 1fr; }
</style>
