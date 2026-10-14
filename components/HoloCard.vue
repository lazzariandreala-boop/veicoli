<template>
  <div class="holo-wrap" :class="[glow, { soft }]" :style="{ '--cut': cut + 'px' }">
    <div class="holo-border" :class="shape">
      <div class="holo-in" :class="shape"><slot /></div>
    </div>
  </div>
</template>
<script setup lang="ts">
// Card "inchiostro" del mockup: blu notte, angolo smussato con bagliore colorato.
withDefaults(defineProps<{ glow?: 'violet' | 'cyan' | 'amber' | 'teal' | 'rose' | 'blue'; cut?: number; shape?: 'both' | 'tr' | 'hex'; soft?: boolean }>(), { glow: 'violet', cut: 22, shape: 'tr' })
</script>
<style scoped>
.holo-wrap { --g: 124, 92, 255; --g2: 79, 140, 255; filter: drop-shadow(0 0 12px rgba(var(--g), .32)) drop-shadow(0 16px 22px rgba(10, 8, 50, .35)); }
.holo-wrap.cyan { --g: 34, 229, 255; --g2: 79, 140, 255; }
.holo-wrap.amber { --g: 255, 156, 40; --g2: 255, 200, 90; }
.holo-wrap.teal { --g: 25, 227, 177; --g2: 34, 200, 255; }
.holo-wrap.rose { --g: 255, 92, 138; --g2: 255, 140, 90; }
.holo-wrap.blue { --g: 70, 120, 255; --g2: 124, 92, 255; }
.holo-border { padding: 1.2px; background: linear-gradient(225deg, rgba(var(--g), 1) 0%, rgba(var(--g), .35) 22%, rgba(130, 140, 255, .14) 50%, rgba(130, 140, 255, .1) 100%); }
.holo-in { position: relative; overflow: hidden; color: var(--holo-text);
  background:
    radial-gradient(70% 90% at 108% -8%, rgba(var(--g), .75), rgba(var(--g), .22) 38%, transparent 62%),
    radial-gradient(60% 60% at 0% 110%, rgba(var(--g2), .16), transparent 60%),
    var(--holo-base); }
.soft .holo-in { background: radial-gradient(60% 80% at 105% -5%, rgba(var(--g), .45), transparent 60%), var(--holo-base); }
/* angolo smussato: corner-shape dove c'è (Chrome 139+), altrimenti angoli arrotondati */
.tr { border-radius: 18px; border-top-right-radius: var(--cut); corner-top-right-shape: bevel; }
.both { border-radius: 18px; border-top-left-radius: var(--cut); border-bottom-right-radius: var(--cut); corner-top-left-shape: bevel; corner-bottom-right-shape: bevel; }
.hex { border-radius: 26px 46px 26px 26px; corner-top-right-shape: bevel; corner-bottom-right-shape: round; }
.holo-in.tr, .holo-in.both, .holo-in.hex { border-radius: inherit; }
</style>
