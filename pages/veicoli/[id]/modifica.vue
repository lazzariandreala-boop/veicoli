<template>
  <div class="page no-nav">
    <header class="topbar">
      <button class="icon-btn" aria-label="Indietro" @click="$router.back()"><ChevronLeft :size="22" /></button>
      <div class="title-sm">Modifica veicolo</div>
    </header>
    <VehicleForm v-if="vehicle" :vehicle="vehicle" :scan="route.query.scan === '1'" @saved="$router.back()" @cancel="$router.back()" />
    <div v-else-if="!loading" class="empty"><h3>Veicolo non trovato</h3></div>
  </div>
</template>
<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
const route = useRoute()
const id = computed(() => String(route.params.id))
const { data: vehicle, loading } = useLive(() => db().vehicles.get(id.value), undefined, id)
</script>
