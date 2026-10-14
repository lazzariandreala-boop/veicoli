<template>
  <BottomSheet :open="open" :title="record ? 'Modifica pagamento bollo' : 'Ho pagato il bollo'" @close="$emit('close')">
    <div class="stack" style="gap: 12px">
      <div class="grid-2">
        <FField v-model="f.paidDate" label="Data di pagamento" type="date" required />
        <FField v-model="f.amount" label="Importo" type="money" />
      </div>
      <FField v-model="f.validityMonths" label="Validità" :options="[{ value: 12, label: '12 mesi' }, { value: 8, label: '8 mesi' }, { value: 4, label: '4 mesi' }]" required />
      <FField v-model="f.nextDueMonth" label="Prossimo pagamento nel mese di" type="month" required
        :hint="`Calcolato in automatico: ${auto ? monthName(auto) : '—'}. Riceverai una notifica il 1° di quel mese.`" />
      <FField v-model="f.notes" label="Note" type="textarea" placeholder="es. pagato con pagoPA, ricevuta…" />
      <div class="form-actions">
        <button v-if="record" class="btn danger" @click="remove"><Trash2 :size="18" /></button>
        <button class="btn primary grow" :disabled="!f.paidDate || !f.nextDueMonth" @click="save"><Check :size="18" /> Salva</button>
      </div>
    </div>
  </BottomSheet>
</template>
<script setup lang="ts">
import { Check, Trash2 } from 'lucide-vue-next'
import { bolloNextDueMonth, monthName } from '~/utils/deadlines'
import type { BolloPayment, Vehicle } from '~/utils/types'

const props = defineProps<{ open: boolean; vehicle: Vehicle; record?: BolloPayment | null }>()
const emit = defineEmits<{ close: [] }>()
const f = reactive<Partial<BolloPayment>>({})
let initializing = false
const auto = computed(() => (f.paidDate ? bolloNextDueMonth(f.paidDate, f.validityMonths ?? 12, props.vehicle.bolloMonthOverride) : undefined))
watch(() => props.open, (o) => {
  if (!o) return
  initializing = true
  Object.assign(f, { paidDate: todayISO(), amount: undefined, validityMonths: 12, notes: undefined, nextDueMonth: undefined }, props.record ? structuredClone(toRaw(props.record)) : {})
  if (!f.nextDueMonth) f.nextDueMonth = auto.value
  nextTick(() => { initializing = false })
}, { immediate: true })
// cambiando data o validità si ricalcola il mese (resta modificabile a mano)
watch(auto, (a) => { if (!initializing && a) f.nextDueMonth = a })
async function save() {
  const rec: BolloPayment = {
    id: props.record?.id ?? uid(), vehicleId: props.vehicle.id, createdAt: props.record?.createdAt ?? Date.now(),
    paidDate: f.paidDate!, amount: f.amount, validityMonths: f.validityMonths ?? 12, nextDueMonth: f.nextDueMonth!, notes: f.notes,
  }
  await db().bolli.put(rec)
  toast(`Bollo registrato. Ti avviso a inizio ${monthName(rec.nextDueMonth)}.`)
  emit('close')
}
async function remove() {
  if (!props.record || !(await confirmDialog({ title: 'Eliminare questo pagamento?', ok: 'Elimina', danger: true }))) return
  await db().bolli.delete(props.record.id)
  emit('close')
}
</script>
