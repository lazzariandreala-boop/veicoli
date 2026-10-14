<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet-backdrop" @click.self="$emit('close')">
        <div class="sheet" role="dialog" aria-modal="true">
          <div class="grip" />
          <div v-if="title" class="sheet-head">
            <h3>{{ title }}</h3>
            <button class="icon-btn" aria-label="Chiudi" @click="$emit('close')"><X :size="20" /></button>
          </div>
          <div class="sheet-body"><slot /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { X } from 'lucide-vue-next'
const props = defineProps<{ open: boolean; title?: string }>()
defineEmits<{ close: [] }>()
watch(() => props.open, (o) => { document.body.style.overflow = o ? 'hidden' : '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })
</script>
<style scoped>
.sheet-backdrop { position: fixed; inset: 0; z-index: 60; background: rgba(5, 7, 12, .62); backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center; }
.sheet { width: 100%; max-width: 640px; max-height: 92dvh; background: var(--surface-solid); border-radius: 26px 26px 0 0; border: 1px solid var(--line-2); border-bottom: 0; display: flex; flex-direction: column; box-shadow: 0 -20px 60px -20px rgba(0,0,0,.7); }
.grip { width: 40px; height: 5px; border-radius: 99px; background: var(--line-2); margin: 10px auto 2px; flex: none; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; padding: 8px 18px 6px; gap: 10px; }
.sheet-head h3 { font-size: 20px; }
.sheet-body { padding: 10px 18px calc(var(--safe-bottom) + 18px); overflow-y: auto; overscroll-behavior: contain; }
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s ease; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .32s cubic-bezier(.2,.9,.25,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
