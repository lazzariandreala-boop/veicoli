<template>
  <div class="svc">
    <div class="field"><span>Cosa è stato fatto</span></div>
    <div class="svc-grid">
      <button v-for="t in TAGLIANDO_ITEMS" :key="t.key" type="button" class="svc-item" :class="{ on: model.includes(t.key) }" @click="toggle(t.key)">
        <span class="tick"><Check :size="14" /></span>{{ t.label }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { TAGLIANDO_ITEMS } from '~/utils/documents'
const model = defineModel<string[]>({ default: () => [] })
function toggle(k: string) {
  model.value = model.value.includes(k) ? model.value.filter((x) => x !== k) : [...model.value, k]
}
</script>
<style scoped>
.svc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
.svc-item { display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 8px 12px; border-radius: 14px; border: 1px solid var(--line-2); background: var(--surface-2); color: var(--text-2); font-weight: 600; font-size: 13.5px; text-align: left; cursor: pointer; }
.tick { width: 22px; height: 22px; flex: none; border-radius: 7px; display: grid; place-items: center; border: 1.5px solid var(--line-2); color: transparent; }
.svc-item.on { color: var(--text); border-color: rgba(124, 92, 255, .55); background: color-mix(in srgb, #7c5cff 14%, var(--surface-2)); }
.svc-item.on .tick { background: var(--grad-primary); border-color: transparent; color: #fff; }
</style>
