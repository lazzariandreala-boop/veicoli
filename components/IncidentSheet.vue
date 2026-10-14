<template>
  <BottomSheet :open="open" :title="record ? 'Modifica incidente' : 'Nuovo incidente'" @close="$emit('close')">
    <div class="stack" style="gap: 12px">
      <div>
        <div class="field" style="margin-bottom: 6px"><span>Responsabilità</span></div>
        <div class="segmented fault">
          <button v-for="(l, k) in FAULT_LABEL" :key="k" type="button" :class="[{ on: f.fault === k }, k]" @click="f.fault = k">{{ l }}</button>
        </div>
      </div>
      <div class="grid-2">
        <FField v-model="f.date" label="Data" type="date" required />
        <FField v-model="f.time" label="Ora" type="time" />
      </div>
      <FField v-model="f.place" label="Luogo" placeholder="Via, città" />
      <FField v-model="f.description" label="Come è successo" type="textarea" />

      <div>
        <div class="field" style="margin-bottom: 8px"><span>Foto e video</span></div>
        <MediaGallery v-model="f.mediaIds!" editable accept="image/*,video/*,application/pdf" add-label="Foto/Video" />
      </div>

      <div class="eyebrow" style="margin-top: 6px">Controparte</div>
      <div class="grid-2">
        <FField v-model="f.otherPartyName" label="Nome conducente" />
        <FField v-model="f.otherPartyPlate" label="Targa" upper />
        <FField v-model="f.otherPartyInsurer" label="Assicurazione" />
        <FField v-model="f.otherPartyPolicy" label="N° polizza" upper />
      </div>

      <div class="eyebrow" style="margin-top: 6px">Pratica e danni</div>
      <div class="stack" style="gap: 8px">
        <label class="toggle"><span>Constatazione amichevole (CAI) firmata</span><input v-model="f.cai" type="checkbox" /></label>
        <label class="toggle"><span>Intervento di polizia / vigili</span><input v-model="f.police" type="checkbox" /></label>
        <label class="toggle"><span>Feriti</span><input v-model="f.injuries" type="checkbox" /></label>
      </div>
      <div class="grid-2">
        <FField v-model="f.claimNumber" label="N° sinistro" upper />
        <FField v-model="f.damageCost" label="Danni stimati" type="money" />
        <FField v-model="f.reimbursed" label="Rimborso ricevuto" type="money" />
      </div>
      <label class="toggle danger-toggle">
        <span><strong>Veicolo distrutto</strong><br><span class="faint" style="font-size: 12.5px">Il veicolo passa nell'archivio come distrutto e non riceve più promemoria</span></span>
        <input v-model="f.totalLoss" type="checkbox" />
      </label>
      <div class="form-actions">
        <button v-if="record" class="btn danger" @click="remove"><Trash2 :size="18" /></button>
        <button class="btn primary grow" :disabled="!f.date" @click="save"><Check :size="18" /> Salva</button>
      </div>
    </div>
  </BottomSheet>
</template>
<script setup lang="ts">
import { Check, Trash2 } from 'lucide-vue-next'
import type { Incident, Vehicle } from '~/utils/types'
const props = defineProps<{ open: boolean; vehicle: Vehicle; record?: Incident | null }>()
const emit = defineEmits<{ close: [] }>()
const f = reactive<Partial<Incident>>({ mediaIds: [] })
let original: string[] = []
watch(() => props.open, (o) => {
  if (!o) return
  Object.assign(f, {
    date: todayISO(), time: undefined, place: undefined, fault: 'da_definire', description: undefined, otherPartyName: undefined, otherPartyPlate: undefined,
    otherPartyInsurer: undefined, otherPartyPolicy: undefined, cai: false, police: false, injuries: false, claimNumber: undefined,
    damageCost: undefined, reimbursed: undefined, totalLoss: false, mediaIds: [],
  }, props.record ? structuredClone(toRaw(props.record)) : {})
  original = [...(f.mediaIds ?? [])]
}, { immediate: true })
async function save() {
  const rec = JSON.parse(JSON.stringify({ ...toRaw(f), id: props.record?.id ?? uid(), vehicleId: props.vehicle.id, createdAt: props.record?.createdAt ?? Date.now(), mediaIds: f.mediaIds ?? [] })) as Incident
  await db().incidents.put(rec)
  await deleteMedia(original.filter((id) => !rec.mediaIds.includes(id)))
  if (rec.totalLoss && props.vehicle.status === 'attivo') {
    await db().vehicles.update(props.vehicle.id, { status: 'distrutto', end: { type: 'distrutto', date: rec.date, price: rec.reimbursed, incidentId: rec.id }, updatedAt: Date.now() })
    toast('Incidente salvato, veicolo segnato come distrutto')
  } else toast('Incidente salvato')
  emit('close')
}
async function remove() {
  if (!props.record || !(await confirmDialog({ title: 'Eliminare questo incidente?', text: 'Verranno eliminati anche foto e video.', ok: 'Elimina', danger: true }))) return
  await deleteMedia(props.record.mediaIds)
  await db().incidents.delete(props.record.id)
  emit('close')
}
</script>
<style scoped>
.fault { grid-auto-flow: row; grid-template-columns: 1fr 1fr; }
.fault button.on.torto { background: var(--danger-soft); color: var(--danger); }
.fault button.on.ragione { background: var(--ok-soft); color: var(--ok); }
.fault button.on.concorso { background: var(--warn-soft); color: var(--warn); }
.danger-toggle input:checked { background: var(--danger); }
</style>
