<template><component :is="icon" :size="size" :stroke-width="1.9" /></template>
<script setup lang="ts">
import { Car, Caravan, Motorbike, Scooter, Truck, Van, CarFront } from 'lucide-vue-next'
const props = withDefaults(defineProps<{ kind?: string; size?: number }>(), { size: 22 })
const icon = computed(() => ({ auto: Car, moto: Motorbike, ciclomotore: Scooter, furgone: Van, camper: Caravan, rimorchio: Truck } as Record<string, any>)[props.kind ?? ''] ?? CarFront)
</script>
