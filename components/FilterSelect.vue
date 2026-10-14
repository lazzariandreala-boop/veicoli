<template>
  <label class="fsel" :class="{ active: modelValue !== defaultValue }">
    <span class="fl">{{ label }}</span>
    <select :value="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <ChevronDown :size="17" class="chev" />
  </label>
</template>
<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
// Filtro compatto: etichetta piccola e valore scelto, su una riga
defineProps<{ label: string; modelValue: string; options: { value: string; label: string }[]; defaultValue?: string }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>
<style scoped>
.fsel { position: relative; display: flex; flex-direction: column; justify-content: center; min-width: 0; height: 54px; padding: 0 34px 0 14px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line-2); backdrop-filter: var(--glass-blur); cursor: pointer; }
.fsel.active { border-color: color-mix(in srgb, var(--accent) 55%, transparent); box-shadow: 0 0 0 3px var(--accent-soft); }
.fl { font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--text-3); line-height: 1.2; }
select { appearance: none; -webkit-appearance: none; border: 0; background: transparent; padding: 0; margin: 0; font: inherit; font-size: 15px; font-weight: 700; color: var(--text); width: 100%; outline: none; cursor: pointer; text-overflow: ellipsis; }
select option { color: #111; }
.chev { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }
</style>
