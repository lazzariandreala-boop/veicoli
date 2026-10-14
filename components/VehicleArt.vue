<template>
  <img :src="src" alt="" class="vart" :class="{ bike: isBike }" draggable="false" />
</template>
<script setup lang="ts">
// Render 3D (public/vehicles) nel colore del veicolo: auto concept o moto adventure.
const props = withDefaults(defineProps<{ kind?: string; accent?: string; hero?: 'light' | 'dark' }>(), { kind: 'auto' })
const isBike = computed(() => props.kind === 'moto' || props.kind === 'ciclomotore')
const src = computed(() => {
  if (props.hero) return `/vehicles/hero-${props.hero}.webp`
  const i = Math.max(0, ACCENTS.findIndex((a) => a[0] === props.accent))
  return `/vehicles/${isBike.value ? 'bike' : 'car'}-${i}.webp`
})
</script>
<style scoped>
.vart { width: 100%; height: auto; object-fit: contain; user-select: none; -webkit-user-drag: none; }
</style>
