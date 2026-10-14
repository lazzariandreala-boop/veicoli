<template>
  <BottomSheet :open="open" :title="record ? 'Modifica polizza' : 'Assicurazione'" @close="$emit('close')">
    <div class="stack" style="gap: 12px">
      <AutofillButton v-if="!record" :vehicle-id="vehicle.id" kind="assicurazione" what="la polizza o la quietanza" @go="$emit('close')" />
      <div class="grid-2">
        <FField v-model="f.company" label="Compagnia" placeholder="es. UnipolSai" />
        <FField v-model="f.policyNumber" label="N° polizza" upper />
        <FField v-model="f.startDate" label="Decorrenza" type="date" />
        <FField v-model="f.endDate" label="Scadenza" type="date" required />
        <FField v-model="f.price" label="Premio pagato" type="money" />
        <FField v-model="f.coverage" label="Coperture" placeholder="RCA, furto, kasko…" />
      </div>
      <div class="field"><span>Durata</span>
        <div class="segmented">
          <button v-for="m in [6, 12]" :key="m" type="button" :class="{ on: duration === m }" @click="setDuration(m)">{{ m }} mesi</button>
        </div>
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
  Object.assign(f, { company: undefined, policyNumber: undefined, startDate: todayISO(), endDate: undefined, price: undefined, durationMonths: undefined, coverage: 'RCA', notes: undefined, mediaIds: [] })
  if (props.record) Object.assign(f, structuredClone(toRaw(props.record)))
  else if (props.renewFrom) {
    // rinnovo: stessa compagnia, decorrenza dalla vecchia scadenza
    const r = props.renewFrom
    Object.assign(f, { company: r.company, policyNumber: r.policyNumber, coverage: r.coverage, startDate: r.endDate })
    const months = r.durationMonths ?? (r.startDate ? Math.max(1, Math.round((parseISO(r.endDate).getTime() - parseISO(r.startDate).getTime()) / (30.44 * 86400000))) : 12)
    f.endDate = toISO(addMonths(parseISO(r.endDate), months))
  }
}, { immediate: true })
/** Durata letta da decorrenza e scadenza (6 o 12 mesi), altrimenti quella scelta. */
const duration = computed(() => {
  if (f.startDate && f.endDate) {
    const m = Math.round((parseISO(f.endDate).getTime() - parseISO(f.startDate).getTime()) / (30.44 * 86400000))
    if (m === 6 || m === 12) return m
  }
  return f.durationMonths
})
function setDuration(m: number) {
  if (!f.startDate) f.startDate = todayISO()
  f.durationMonths = m
  f.endDate = toISO(addMonths(parseISO(f.startDate), m))
}
async function save() {
  const rec: InsurancePolicy = JSON.parse(JSON.stringify({
    ...toRaw(f), durationMonths: duration.value, id: props.record?.id ?? uid(), vehicleId: props.vehicle.id, createdAt: props.record?.createdAt ?? Date.now(), mediaIds: f.mediaIds ?? [],
  }))
  try {
    await db().policies.put(rec)
    const saved = await db().policies.get(rec.id)
    if (!saved || saved.price !== rec.price || saved.endDate !== rec.endDate) throw new Error('verifica fallita')
  } catch (e) {
    console.error(e)
    toast('Polizza non salvata, riprova', 'danger')
    return
  }
  toast(props.record ? 'Polizza aggiornata' : 'Polizza salvata, promemoria impostati')
  emit('close')
}
async function remove() {
  if (!props.record || !(await confirmDialog({ title: 'Eliminare questa polizza?', ok: 'Elimina', danger: true }))) return
  await deleteMedia(props.record.mediaIds)
  await db().policies.delete(props.record.id)
  emit('close')
}
</script>
