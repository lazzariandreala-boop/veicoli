<template>
  <!-- assicurazione -->
  <template v-if="doc.kind === 'assicurazione'">
    <div class="grid-2">
      <FField v-model="doc.company" label="Compagnia" />
      <FField v-model="doc.policyNumber" label="N° polizza" />
      <FField v-model="doc.startDate" label="Dal" type="date" />
      <FField v-model="doc.endDate" label="Scadenza" type="date" required />
      <FField v-model="doc.total" label="Premio pagato" type="money" />
      <FField v-model="doc.title" label="Coperture" placeholder="RCA, furto…" />
    </div>
    <div class="field"><span>Durata</span>
      <div class="segmented">
        <button v-for="m in [6, 12]" :key="m" type="button" :class="{ on: policyMonths === m }" @click="setPolicyMonths(m)">{{ m }} mesi</button>
      </div>
    </div>
  </template>

  <!-- revisione -->
  <template v-else-if="doc.kind === 'revisione'">
    <div class="segmented">
      <button v-for="o in OUTCOMES" :key="o.value" type="button" :class="{ on: doc.outcome === o.value }" @click="doc.outcome = o.value">{{ o.label }}</button>
    </div>
    <div class="grid-2">
      <FField v-model="doc.date" label="Fatta il" type="date" required />
      <FField v-model="doc.nextDate" label="Prossima entro" type="date" />
      <FField v-model="doc.km" label="Km" type="number" />
      <FField v-model="doc.total" label="Costo" type="money" />
    </div>
    <FField v-model="doc.center" label="Centro revisioni" />
  </template>

  <!-- bollo -->
  <template v-else-if="doc.kind === 'bollo'">
    <div class="grid-2">
      <FField v-model="doc.date" label="Pagato il" type="date" required />
      <FField v-model="doc.total" label="Importo" type="money" />
      <FField v-model="doc.nextDueMonth" label="Prossimo pagamento" type="month" />
      <FField v-model="doc.validityMonths" label="Mesi coperti" type="number" />
    </div>
    <p v-if="doc.fromMonth && doc.toMonth" class="faint" style="margin: -4px 0 0; font-size: 13px">Sulla ricevuta: periodo da {{ monthName(doc.fromMonth) }} a {{ monthName(doc.toMonth) }}.</p>
  </template>
</template>
<script setup lang="ts">
import { addMonths, monthName, parseISO, toISO } from '~/utils/deadlines'
import type { ParsedDoc } from '~/utils/documents'

// Campi di bollo, assicurazione e revisione letti da un documento (modificabili prima di salvare)
const props = defineProps<{ doc: ParsedDoc }>()
const OUTCOMES = [{ value: 'regolare', label: 'Regolare' }, { value: 'ripetere', label: 'Da ripetere' }, { value: 'sospeso', label: 'Sospeso' }] as const
const policyMonths = computed(() => {
  const d = props.doc
  if (d.startDate && d.endDate) {
    const m = Math.round((parseISO(d.endDate).getTime() - parseISO(d.startDate).getTime()) / (30.44 * 86400000))
    if (m === 6 || m === 12) return m
  }
  return d.validityMonths
})
function setPolicyMonths(m: number) {
  const d = props.doc
  d.startDate ??= todayISO()
  d.validityMonths = m
  d.endDate = toISO(addMonths(parseISO(d.startDate), m))
}
</script>
