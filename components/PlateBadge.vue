<template>
  <div class="plate" :class="[style, size]" :title="plate">
    <div v-if="style === 'eu'" class="band"><span class="stars">✦</span><b>I</b></div>
    <div class="chars">
      <template v-if="style === 'old' && province">
        <span class="prov">{{ province }}</span>{{ rest }}
      </template>
      <template v-else>{{ display || '— — —' }}</template>
    </div>
    <div v-if="style === 'eu'" class="band right" />
  </div>
</template>
<script setup lang="ts">
import { plateKind } from '~/utils/libretto'
const props = withDefaults(defineProps<{ plate: string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
const clean = computed(() => (props.plate || '').toUpperCase().replace(/[^A-Z0-9]/g, ''))
const kind = computed(() => plateKind(clean.value))
const style = computed(() => (kind.value === 'storica' ? 'old' : 'eu'))
const display = computed(() => {
  const s = clean.value
  if (kind.value === 'auto') return `${s.slice(0, 2)} ${s.slice(2, 5)} ${s.slice(5)}`
  if (kind.value === 'moto') return `${s.slice(0, 2)} ${s.slice(2)}`
  return props.plate.toUpperCase()
})
const province = computed(() => clean.value.match(/^(ROMA|[A-Z]{2})/)?.[1])
const rest = computed(() => ' ' + clean.value.slice(province.value?.length ?? 0))
</script>
<style scoped>
.plate { display: inline-flex; align-items: stretch; background: #f7f8fb; color: #111; border-radius: 7px; border: 1.5px solid #1b1f2a; box-shadow: 0 2px 0 rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.7); overflow: hidden; font-family: 'Space Grotesk Variable', monospace; font-weight: 700; letter-spacing: .06em; height: 30px; }
.plate .chars { padding: 0 10px; display: flex; align-items: center; font-size: 16px; white-space: nowrap; }
.plate .band { width: 18px; background: #1f47b8; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 2px; font-size: 10px; }
.plate .band .stars { color: #ffd84d; font-size: 7px; margin-bottom: auto; margin-top: 3px; }
.plate .band b { font-size: 10px; line-height: 1; }
.plate .band.right { width: 10px; }
.plate.old { background: #f4f1e6; }
.plate.old .prov { color: #e2541b; margin-right: 2px; }
.plate.sm { height: 24px; border-radius: 5px; }
.plate.sm .chars { font-size: 13px; padding: 0 7px; }
.plate.sm .band { width: 14px; font-size: 8px; }
.plate.sm .band.right { width: 7px; }
.plate.lg { height: 40px; border-radius: 9px; }
.plate.lg .chars { font-size: 22px; padding: 0 14px; }
.plate.lg .band { width: 24px; }
.plate.lg .band b { font-size: 13px; }
.plate.lg .band.right { width: 13px; }
</style>
