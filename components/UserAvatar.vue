<template>
  <img v-if="cloud.user?.photo && !broken" :src="cloud.user.photo" class="ua" :style="box" alt="" referrerpolicy="no-referrer" @error="broken = true" />
  <span v-else class="ua" :style="box">{{ initial }}</span>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number }>(), { size: 40 })
const broken = ref(false)
const box = computed(() => ({ width: props.size + 'px', height: props.size + 'px', fontSize: Math.round(props.size * 0.42) + 'px' }))
const initial = computed(() => (cloud.user?.name || cloud.user?.email || '?').trim().charAt(0).toUpperCase())
</script>
<style scoped>
.ua { display: grid; place-items: center; flex: none; border-radius: 50%; object-fit: cover; color: #fff; font-weight: 700; background: var(--grad-primary); box-shadow: 0 0 0 2px var(--surface-solid), 0 0 0 3.5px color-mix(in srgb, var(--accent) 60%, transparent); }
</style>
