<template>
  <NuxtLink :to="`/veicoli/${vehicle.id}`" class="vlink" :class="{ inactive: vehicle.status !== 'attivo' }">
    <HoloCard :glow="health === 'danger' ? 'rose' : health === 'off' ? 'violet' : 'amber'" :cut="26">
      <div class="vrow">
        <div class="thumb" :class="{ photo: !!cover }">
          <img v-if="cover" :src="cover" alt="" />
          <VehicleArt v-else :kind="vehicle.kind" :accent="vehicle.accent" />
        </div>
        <div class="grow info">
          <h3 class="ellipsis">{{ vehicleName(vehicle) }}</h3>
          <div class="plate">{{ vehicle.plate || 'Senza targa' }}</div>
        </div>
      </div>
      <div class="foot">
        <span class="meta ellipsis"><Fuel :size="14" /> {{ meta }}</span>
        <span class="badge" :class="health"><component :is="health === 'ok' ? Clock3 : AlertTriangle" :size="12" /> {{ label }}</span>
      </div>
    </HoloCard>
  </NuxtLink>
</template>
<script setup lang="ts">
import { AlertTriangle, Clock3, Fuel } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'
import type { Vehicle } from '~/utils/types'
import { HEALTH_LABEL, vehicleHealth, type DeadlineView } from '~/composables/garage'

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
.vlink.inactive { opacity: .75; filter: saturate(.55); }
.vrow { display: flex; align-items: center; gap: 12px; padding: 16px 16px 6px 12px; }
.thumb { width: 104px; height: 62px; flex: none; display: grid; place-items: center; }
.thumb img { max-height: 100%; filter: drop-shadow(0 6px 10px rgba(0, 0, 0, .5)); }
.thumb.photo img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
.info h3 { font-size: 17px; font-weight: 700; color: var(--holo-text); letter-spacing: -0.01em; }
.plate { margin-top: 4px; font-size: 14px; font-weight: 500; letter-spacing: .04em; color: var(--holo-text-2); }
.foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 16px 14px; }
.meta { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--holo-text-2); min-width: 0; }
.badge { flex: none; display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 10px; font-size: 12px; font-weight: 700; border: 1px solid; }
.badge.ok { color: #ffc062; border-color: rgba(255, 168, 60, .45); background: rgba(255, 150, 40, .16); }
.badge.warn { color: #ff9d57; border-color: rgba(255, 120, 50, .6); background: rgba(255, 110, 40, .2); box-shadow: 0 0 12px rgba(255, 120, 50, .35); }
.badge.danger { color: #ff8db0; border-color: rgba(255, 92, 138, .6); background: rgba(255, 92, 138, .18); box-shadow: 0 0 12px rgba(255, 92, 138, .35); }
.badge.off { color: #c8c2ff; border-color: rgba(160, 150, 255, .4); background: rgba(124, 92, 255, .14); }
@media (prefers-color-scheme: light) { :root:not([data-theme='dark']) .badge.ok { color: #b86a00; background: rgba(255, 160, 40, .14); } }
:root[data-theme='light'] .badge.ok { color: #b86a00; background: rgba(255, 160, 40, .14); }
</style>
