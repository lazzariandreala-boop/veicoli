<template>
  <NuxtLink :to="`/veicoli/${vehicle.id}`" class="vlink" :class="{ inactive: vehicle.status !== 'attivo' }">
    <HoloCard :glow="HEALTH_GLOW[health]" shape="tr" :cut="18">
      <div class="vrow">
        <div class="thumb">
          <img v-if="cover" :src="cover" alt="" />
          <NeonVehicle v-else :kind="vehicle.kind" :accent="vehicle.accent" />
        </div>
        <div class="grow info">
          <h3 class="ellipsis">{{ vehicleName(vehicle) }}</h3>
          <div class="plate">{{ vehicle.plate || 'Senza targa' }}</div>
        </div>
        <ChevronRight :size="18" class="chev" />
      </div>
      <div class="foot">
        <span class="meta ellipsis"><Fuel :size="14" /> {{ meta }}</span>
        <span class="badge" :class="health"><component :is="health === 'ok' ? ShieldCheck : AlertTriangle" :size="13" /> {{ label }}</span>
      </div>
    </HoloCard>
  </NuxtLink>
</template>
<script setup lang="ts">
import { AlertTriangle, ChevronRight, Fuel, ShieldCheck } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'
import type { Vehicle } from '~/utils/types'
import { HEALTH_GLOW, HEALTH_LABEL, vehicleHealth, type DeadlineView } from '~/composables/garage'

const props = defineProps<{ vehicle: Vehicle; deadlines: DeadlineView[] }>()
const { url: cover } = useMediaUrl(() => props.vehicle.coverMediaId)
const health = computed(() => vehicleHealth(props.vehicle, props.deadlines))
const label = computed(() => (health.value === 'off' ? STATUS_LABEL[props.vehicle.status] : HEALTH_LABEL[health.value]))
const meta = computed(() => {
  const l = props.vehicle.libretto
  const fuel = l.alimentazione ? l.alimentazione.charAt(0) + l.alimentazione.slice(1).toLowerCase() : KIND_LABEL[props.vehicle.kind]
  const kmv = props.vehicle.currentKm ?? props.vehicle.purchase.km
  return [fuel, kmv != null ? km(kmv) : l.dataPrimaImmatricolazione?.slice(0, 4)].filter(Boolean).join(' • ')
})
</script>
<style scoped>
.vlink { display: block; transition: transform .15s; }
.vlink:active { transform: scale(.985); }
.vlink.inactive { opacity: .72; filter: saturate(.5); }
.vrow { display: flex; align-items: center; gap: 12px; padding: 14px 14px 8px; }
.thumb { width: 92px; height: 58px; flex: none; border-radius: 12px; overflow: hidden; display: grid; place-items: center; background: radial-gradient(closest-side, rgba(124, 92, 255, .25), transparent); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb :deep(svg) { width: 100%; height: auto; }
.info h3 { font-size: 16.5px; font-weight: 700; font-family: var(--font-display); color: #fff; }
.plate { margin-top: 3px; font-size: 13px; font-weight: 600; letter-spacing: .08em; color: rgba(220, 225, 255, .7); }
.chev { color: rgba(220, 225, 255, .5); flex: none; }
.foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 14px 13px; border-top: 1px solid rgba(255, 255, 255, .07); margin: 0 4px; }
.meta { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: rgba(220, 225, 255, .72); min-width: 0; }
.badge { flex: none; display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 700; border: 1px solid; }
.badge.ok { color: #3ff0c4; border-color: rgba(25, 227, 177, .5); background: rgba(25, 227, 177, .12); }
.badge.warn { color: #ffbf4d; border-color: rgba(255, 168, 32, .55); background: rgba(255, 168, 32, .13); box-shadow: 0 0 10px rgba(255, 168, 32, .3); }
.badge.danger { color: #ff7aa2; border-color: rgba(255, 92, 138, .55); background: rgba(255, 92, 138, .14); box-shadow: 0 0 10px rgba(255, 92, 138, .3); }
.badge.off { color: #c8c2ff; border-color: rgba(160, 150, 255, .4); background: rgba(124, 92, 255, .12); }
</style>
