<template>
  <NuxtLink :to="`/veicoli/${vehicle.id}`" class="vcard" :class="{ inactive: vehicle.status !== 'attivo' }">
    <div class="hero" :style="{ background: gradient }">
      <img v-if="cover" :src="cover" alt="" class="cover" />
      <div class="shade" />
      <div class="ghost"><KindIcon :kind="vehicle.kind" :size="132" /></div>
      <div class="top">
        <span class="kind"><KindIcon :kind="vehicle.kind" :size="15" /> {{ KIND_LABEL[vehicle.kind] }}</span>
        <span v-if="vehicle.status !== 'attivo'" class="status">{{ STATUS_LABEL[vehicle.status] }}</span>
      </div>
      <div class="bottom">
        <div class="grow">
          <h3 class="ellipsis">{{ vehicleName(vehicle) }}</h3>
          <p class="ellipsis">{{ subtitle }}</p>
        </div>
        <PlateBadge :plate="vehicle.plate" size="sm" />
      </div>
    </div>
    <div v-if="deadlines.length" class="dl">
      <span v-for="d in deadlines" :key="d.kind" class="chip" :class="urgency(d.days)">
        <component :is="ICONS[d.kind]" :size="13" /> {{ d.label }} · {{ relativeDays(d.days) }}
      </span>
    </div>
  </NuxtLink>
</template>
<script setup lang="ts">
import { Landmark, ShieldCheck, ClipboardCheck } from 'lucide-vue-next'
import { vehicleName } from '~/utils/deadlines'
import type { Vehicle } from '~/utils/types'
import type { DeadlineView } from '~/composables/garage'

const props = defineProps<{ vehicle: Vehicle; deadlines: DeadlineView[] }>()
const ICONS: Record<string, any> = { bollo: Landmark, assicurazione: ShieldCheck, revisione: ClipboardCheck }
const gradient = computed(() => accentGradient(props.vehicle.accent))
const { url: cover } = useMediaUrl(() => props.vehicle.coverMediaId)
const subtitle = computed(() => {
  const l = props.vehicle.libretto
  const parts = [
    props.vehicle.nickname ? [l.marca, l.modello].filter(Boolean).join(' ') : undefined,
    l.dataPrimaImmatricolazione?.slice(0, 4),
    l.cilindrata ? `${l.cilindrata} cc` : undefined,
    l.alimentazione,
  ].filter(Boolean)
  return parts.join(' · ') || 'Dati del libretto non inseriti'
})
</script>
<style scoped>
.vcard { display: block; background: var(--surface); border: 1px solid var(--line); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow); transition: transform .15s; }
.vcard:active { transform: scale(.985); }
.vcard.inactive .hero { filter: grayscale(.75) brightness(.8); }
.hero { position: relative; height: 168px; padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between; color: white; overflow: hidden; }
.cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.05) 30%, rgba(0,0,0,.55)); }
.ghost { position: absolute; right: -18px; top: -6px; opacity: .18; transform: rotate(-8deg); }
.cover ~ .ghost { display: none; }
.top, .bottom { position: relative; display: flex; align-items: center; gap: 10px; }
.top { justify-content: space-between; }
.kind, .status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 99px; background: rgba(0,0,0,.25); backdrop-filter: blur(8px); }
.status { background: rgba(0,0,0,.5); }
.bottom { align-items: flex-end; }
h3 { font-size: 22px; font-weight: 700; text-shadow: 0 2px 12px rgba(0,0,0,.3); }
p { margin: 2px 0 0; font-size: 13px; opacity: .9; }
.dl { display: flex; gap: 6px; flex-wrap: wrap; padding: 12px 14px; }
</style>
