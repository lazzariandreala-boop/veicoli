<template>
  <div class="page no-nav">
    <header class="topbar">
      <button class="icon-btn" aria-label="Indietro" @click="$router.back()"><ChevronLeft :size="22" /></button>
      <div class="title-sm">Nuovo veicolo</div>
    </header>
    <VehicleForm @saved="(id) => $router.replace(`/veicoli/${id}?nuovo=1`)" @cancel="$router.back()" />
  </div>
</template>
<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
</script>
