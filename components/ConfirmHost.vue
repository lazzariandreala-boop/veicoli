<template>
  <BottomSheet :open="!!confirmState" top @close="answer(false)">
    <div v-if="confirmState" class="stack" style="gap: 14px">
      <h3 style="font-size: 20px">{{ confirmState.title }}</h3>
      <p v-if="confirmState.text" class="muted" style="margin: 0">{{ confirmState.text }}</p>
      <div class="grid-2" style="margin-top: 6px">
        <button class="btn" @click="answer(false)">Annulla</button>
        <button class="btn" :class="confirmState.danger ? 'danger' : 'primary'" @click="answer(true)">{{ confirmState.ok ?? 'Conferma' }}</button>
      </div>
    </div>
  </BottomSheet>
</template>
<script setup lang="ts">
function answer(v: boolean) {
  const c = confirmState.value
  confirmState.value = null
  c?.resolve(v)
}
</script>
