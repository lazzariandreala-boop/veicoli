<template>
  <BottomSheet :open="open" :title="record ? 'Modifica polizza' : 'Assicurazione'" @close="$emit('close')">
    <div class="stack" style="gap: 12px">
      <div class="grid-2">
        <FField v-model="f.company" label="Compagnia" placeholder="es. UnipolSai" />
        <FField v-model="f.policyNumber" label="N° polizza" upper />
        <FField v-model="f.startDate" label="Decorrenza" type="date" />
        <FField v-model="f.endDate" label="Scadenza" type="date" required />
        <FField v-model="f.price" label="Premio pagato" type="money" />
        <FField v-model="f.coverage" label="Coperture" placeholder="RCA, furto, kasko…" />
      </div>
      <div class="chips">
        <button v-for="m in [6, 12]" :key="m" type="button" class="chip-btn" @click="setDuration(m)">Durata {{ m }} mesi</button>
      </div>
      <p class="faint" style="margin: 0; font-size: 13px">Riceverai una notifica 30 e 15 giorni prima, il giorno prima e il giorno della scadenza.</p>
      <div>
        <div class="field" style="margin-bottom: 8px"><span>Documenti (polizza, quietanza)</span></div>
        <MediaGallery v-model="f.mediaIds!" editable accept="image/*,application/pdf" />
      </div>
      <FField v-model="f.notes" label="Note" type="textarea" />
      <div class="form-actions">
        <button v-if="record" class="btn danger" @click="remove"><Trash2 :size="18" /></button>
        <button class="btn primary grow" :disabled="!f.endDate" @click="save"><Check :size="18" /> Salva</button>
      </div>
    </div>
  </BottomSheet>
</template>
<script setup lang="ts">
import { Check, Trash2 } from 'lucide-vue-next'
import { addMonths, parseISO, toISO } from '~/utils/deadlines'
import type { InsurancePolicy, Vehicle } from '~/utils/types'

const props = defineProps<{ open: boolean; vehicle: Vehicle; record?: InsurancePolicy | null; renewFrom?: InsurancePolicy | null }>()
const emit = defineEmits<{ close: [] }>()
const f = reactive<Partial<InsurancePolicy>>({ mediaIds: [] })
watch(() => props.open, (o) => {
  if (!o) return
  Object.assign(f, { company: undefined, policyNumber: undefined, startDate: todayISO(), endDate: undefined, price: undefined, coverage: 'RCA', notes: undefined, mediaIds: [] })
  if (props.record) Object.assign(f, structuredClone(toRaw(props.record)))
  else if (props.renewFrom) {
    // rinnovo: stessa compagnia, decorrenza dalla vecchia scadenza
    const r = props.renewFrom
    Object.assign(f, { company: r.company, policyNumber: r.policyNumber, coverage: r.coverage, startDate: r.endDate })
    const months = r.startDate ? Math.max(1, Math.round((parseISO(r.endDate).getTime() - parseISO(r.startDate).getTime()) / (30.44 * 86400000))) : 12
    f.endDate = toISO(addMonths(parseISO(r.endDate), months))
  }
}, { immediate: true })
function setDuration(m: number) {
  const start = f.startDate ? parseISO(f.startDate) : new Date()
  f.endDate = toISO(addMonths(start, m))
}
async function save() {
  const rec: InsurancePolicy = JSON.parse(JSON.stringify({
    ...toRaw(f), id: props.record?.id ?? uid(), vehicleId: props.vehicle.id, createdAt: props.record?.createdAt ?? Date.now(), mediaIds: f.mediaIds ?? [],
  }))
  await db().policies.put(rec)
  toast('Polizza salvata, promemoria impostati')
  emit('close')
}
async function remove() {
  if (!props.record || !(await confirmDialog({ title: 'Eliminare questa polizza?', ok: 'Elimina', danger: true }))) return
  await deleteMedia(props.record.mediaIds)
  await db().policies.delete(props.record.id)
  emit('close')
}
</script>
