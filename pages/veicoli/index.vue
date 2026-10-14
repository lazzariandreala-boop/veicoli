<template>
  <div class="page">
    <header class="topbar">
      <div class="grow"><div class="eyebrow">{{ vehicles.length }} in garage</div><h1>I tuoi veicoli</h1></div>
      <NuxtLink to="/veicoli/nuovo" class="icon-btn" aria-label="Aggiungi veicolo"><Plus :size="22" /></NuxtLink>
    </header>

    <label class="search" style="margin-bottom: 14px">
      <Search :size="18" />
      <input v-model="q" class="input" type="search" placeholder="Cerca veicolo o targa..." />
    </label>

    <div class="segmented" style="margin-bottom: 16px">
      <button v-for="f in filters" :key="f.value" :class="{ on: filter === f.value }" @click="filter = f.value">{{ f.label }} · {{ count(f.value) }}</button>
    </div>

    <template v-if="loading"><div class="skeleton" style="height: 120px" /></template>
    <TransitionGroup v-else name="list" tag="div" class="stack" style="gap: 14px">
      <VehicleCard v-for="v in shown" :key="v.id" :vehicle="v" :deadlines="deadlinesByVehicle.get(v.id) ?? []" />
    </TransitionGroup>
    <div v-if="!loading && !shown.length" class="empty">
      <div class="icon-bubble accent"><CarFront :size="26" /></div>
      <h3>{{ vehicles.length ? 'Nessun risultato' : 'Garage vuoto' }}</h3>
      <p>{{ vehicles.length ? 'Prova un altro filtro o un\'altra ricerca.' : 'Aggiungi il primo veicolo partendo dal libretto.' }}</p>
      <NuxtLink v-if="!vehicles.length" to="/veicoli/nuovo?scan=1" class="btn neon">Scansiona il libretto</NuxtLink>
    </div>
    <NuxtLink to="/veicoli/nuovo" class="fab" aria-label="Aggiungi veicolo"><Plus :size="28" /></NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { CarFront, Plus, Search } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'

const { vehicles, deadlinesByVehicle, loading } = useGarage()
const q = ref('')
const filter = ref<'attivi' | 'tutti' | 'archivio'>('attivi')
const filters = [
  { value: 'attivi', label: 'In uso' },
  { value: 'archivio', label: 'Passati' },
  { value: 'tutti', label: 'Tutti' },
] as const
const match = (f: string, s: string) => (f === 'tutti' ? true : f === 'attivi' ? s === 'attivo' : s !== 'attivo')
const count = (f: string) => vehicles.value.filter((v) => match(f, v.status)).length
const shown = computed(() => {
  const s = q.value.trim().toLowerCase().replace(/\s+/g, '')
  return vehicles.value
    .filter((v) => match(filter.value, v.status))
    .filter((v) => !s || (vehicleName(v) + v.plate + v.plateHistory.map((p) => p.plate).join('')).toLowerCase().replace(/\s+/g, '').includes(s))
})
watchEffect(() => { if (!loading.value && vehicles.value.length && !count('attivi')) filter.value = 'tutti' })
</script>

<style scoped>
.list-enter-active, .list-leave-active { transition: all .25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(8px); }
</style>
