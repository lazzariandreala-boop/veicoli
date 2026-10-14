<template>
  <label class="field" :class="{ filled }">
    <span>{{ label }}</span>
    <select v-if="options" v-model="inner" class="input">
      <option v-if="!required" :value="undefined">—</option>
      <option v-for="o in options" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
    </select>
    <textarea v-else-if="type === 'textarea'" v-model="inner" class="input" :placeholder="placeholder" rows="3" />
    <div v-else-if="prefix" class="input-prefix">
      <i>{{ prefix }}</i>
      <input v-model="inner" class="input" :type="htmlType" :inputmode="inputmode" :placeholder="placeholder" :step="step" />
    </div>
    <input v-else v-model="inner" class="input" :type="htmlType" :inputmode="inputmode" :placeholder="placeholder" :step="step"
      :autocapitalize="upper ? 'characters' : undefined" :style="upper ? 'text-transform: uppercase' : undefined" />
    <small v-if="hint" class="faint">{{ hint }}</small>
  </label>
</template>
<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: any
  type?: 'text' | 'number' | 'date' | 'month' | 'time' | 'textarea' | 'money'
  options?: { value: any; label: string }[]
  placeholder?: string
  hint?: string
  filled?: boolean
  upper?: boolean
  required?: boolean
  prefix?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [any] }>()
const isNum = computed(() => props.type === 'number' || props.type === 'money')
const htmlType = computed(() => (isNum.value ? 'text' : props.type === 'textarea' ? 'text' : props.type ?? 'text'))
const inputmode = computed(() => (isNum.value ? 'decimal' : undefined))
const step = computed(() => (props.type === 'money' ? '0.01' : undefined))
const prefix = computed(() => props.prefix ?? (props.type === 'money' ? '€' : undefined))
const inner = computed({
  get: () => (isNum.value && props.modelValue !== undefined && props.modelValue !== null ? String(props.modelValue).replace('.', ',') : props.modelValue ?? (props.options ? undefined : '')),
  set: (v: any) => {
    if (isNum.value) {
      const s = String(v ?? '').replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
      const n = s === '' ? undefined : Number(s)
      emit('update:modelValue', n === undefined || Number.isNaN(n) ? (s === '' ? undefined : props.modelValue) : n)
    } else {
      const val = typeof v === 'string' && props.upper ? v.toUpperCase() : v
      emit('update:modelValue', val === '' ? undefined : val)
    }
  },
})
</script>
