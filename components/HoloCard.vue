<template>
  <div class="holo-wrap" :class="[glow]" :style="{ '--cut': cut + 'px' }">
    <div class="holo-border" :class="shape">
      <div class="holo-in" :class="shape"><slot /></div>
    </div>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ glow?: 'violet' | 'cyan' | 'amber' | 'teal' | 'rose'; cut?: number; shape?: 'both' | 'tr' }>(), { glow: 'violet', cut: 22, shape: 'both' })
</script>
<style scoped>
.holo-wrap { --g: 124, 92, 255; --g2: 34, 229, 255; filter: drop-shadow(0 0 14px rgba(var(--g), .45)) drop-shadow(0 14px 22px rgba(0, 0, 0, .45)); }
.holo-wrap.cyan { --g: 34, 229, 255; --g2: 124, 92, 255; }
.holo-wrap.amber { --g: 255, 168, 32; --g2: 255, 92, 138; }
.holo-wrap.teal { --g: 25, 227, 177; --g2: 34, 229, 255; }
.holo-wrap.rose { --g: 255, 92, 138; --g2: 124, 92, 255; }
.holo-border { padding: 1.5px; background: linear-gradient(135deg, rgba(var(--g), 1), rgba(var(--g), .15) 35%, rgba(var(--g2), .12) 65%, rgba(var(--g2), .9)); }
.holo-in { position: relative; overflow: hidden; color: #eef0ff; background: radial-gradient(120% 90% at 100% 0%, rgba(var(--g), .22), transparent 55%), linear-gradient(160deg, rgba(28, 32, 78, .97), rgba(10, 12, 36, .98)); }
.both { clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut)); }
.tr { clip-path: polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, 0 100%); }
</style>
