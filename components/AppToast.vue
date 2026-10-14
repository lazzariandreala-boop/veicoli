<template>
  <div class="toasts">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.tone">
        <CircleCheck v-if="t.tone === 'ok'" :size="18" />
        <CircleAlert v-else :size="18" />
        <span>{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
<script setup lang="ts">
import { CircleAlert, CircleCheck } from 'lucide-vue-next'
</script>
<style scoped>
.toasts { position: fixed; top: calc(var(--safe-top) + 12px); left: 16px; right: 16px; z-index: 100; display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none; }
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 16px; background: var(--surface-3); color: var(--text); box-shadow: 0 16px 40px -12px rgba(0,0,0,.6); border: 1px solid var(--line-2); font-weight: 600; font-size: 14px; max-width: 480px; }
.toast.ok svg { color: var(--ok); }
.toast.danger svg { color: var(--danger); }
.toast.info svg { color: var(--accent); }
.toast-enter-active, .toast-leave-active { transition: all .25s cubic-bezier(.2,.8,.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-12px) scale(.97); }
</style>
