<template>
  <section class="fold card flat">
    <button type="button" class="fold-head" @click="open = !open">
      <div class="icon-bubble" :class="tone"><slot name="icon" /></div>
      <div class="grow">
        <strong>{{ title }}</strong>
        <div v-if="subtitle" class="faint" style="font-size: 13px">{{ subtitle }}</div>
      </div>
      <ChevronDown :size="20" class="chev" :class="{ open }" />
    </button>
    <div v-show="open" class="fold-body"><slot /></div>
  </section>
</template>
<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
const props = defineProps<{ title: string; subtitle?: string; initiallyOpen?: boolean; tone?: string }>()
const open = ref(!!props.initiallyOpen)
defineExpose({ open })
</script>
<style scoped>
.fold { padding: 0; overflow: hidden; }
.fold-head { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: none; border: 0; text-align: left; cursor: pointer; }
.fold-head strong { font-size: 15.5px; }
.chev { color: var(--text-3); transition: transform .2s; }
.chev.open { transform: rotate(180deg); }
.fold-body { padding: 4px 16px 18px; display: flex; flex-direction: column; gap: 12px; }
</style>
