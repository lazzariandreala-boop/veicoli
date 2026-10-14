<template>
  <svg v-if="isBike" class="neon" viewBox="0 0 400 220" aria-hidden="true">
    <defs>
      <linearGradient :id="`b${uidv}`" x1="0" y1="0" x2="1" y2="1"><stop offset="0" :stop-color="c1" /><stop offset="1" :stop-color="c2" /></linearGradient>
      <filter :id="`g${uidv}`" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <radialGradient :id="`u${uidv}`"><stop offset="0" :stop-color="c1" stop-opacity=".7" /><stop offset="1" :stop-color="c1" stop-opacity="0" /></radialGradient>
    </defs>
    <ellipse cx="200" cy="196" rx="170" ry="14" :fill="`url(#u${uidv})`" />
    <g :filter="`url(#g${uidv})`" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="92" cy="156" r="44" :stroke="c2" stroke-width="5" />
      <circle cx="312" cy="156" r="44" :stroke="c2" stroke-width="5" />
      <circle cx="92" cy="156" r="26" stroke="#ffffff" stroke-opacity=".35" stroke-width="2" />
      <circle cx="312" cy="156" r="26" stroke="#ffffff" stroke-opacity=".35" stroke-width="2" />
      <path d="M92 156 L168 118 L238 120 L312 156" :stroke="`url(#b${uidv})`" stroke-width="7" />
      <path d="M296 70 L312 156" :stroke="c2" stroke-width="6" />
      <path d="M276 64 L306 58" stroke="#ffffff" stroke-width="5" />
      <path d="M118 144 L196 136" stroke="#ffffff" stroke-opacity=".5" stroke-width="5" />
    </g>
    <path d="M172 100 C188 72 244 68 266 96 L256 116 L178 116 Z" :fill="`url(#b${uidv})`" />
    <path d="M110 104 L176 98 L170 114 L120 118 Z" fill="#1a1d44" stroke="#ffffff" stroke-opacity=".25" />
    <path d="M196 84 C214 78 236 80 248 90" stroke="#ffffff" stroke-opacity=".7" stroke-width="3" fill="none" />
    <circle cx="300" cy="82" r="8" fill="#e9fdff" :filter="`url(#g${uidv})`" />
  </svg>
  <svg v-else class="neon" viewBox="0 0 400 170" aria-hidden="true">
    <defs>
      <linearGradient :id="`b${uidv}`" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#1b1f4d" /><stop offset=".55" :stop-color="c1" stop-opacity=".9" /><stop offset="1" stop-color="#11143a" /></linearGradient>
      <linearGradient :id="`w${uidv}`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c6ff" stop-opacity=".55" /><stop offset="1" stop-color="#1b2160" stop-opacity=".85" /></linearGradient>
      <filter :id="`g${uidv}`" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <radialGradient :id="`u${uidv}`"><stop offset="0" :stop-color="c2" stop-opacity=".75" /><stop offset="1" :stop-color="c2" stop-opacity="0" /></radialGradient>
    </defs>
    <ellipse cx="200" cy="150" rx="185" ry="14" :fill="`url(#u${uidv})`" />
    <path d="M18 116 C18 101 30 94 50 90 L112 78 C138 54 172 42 214 42 C256 42 288 54 314 74 L358 82 C375 85 384 95 386 107 L387 120 C387 126 383 130 377 130 L344 130 A36 36 0 0 0 272 130 L134 130 A36 36 0 0 0 62 130 L28 130 C22 130 18 126 18 120 Z" :fill="`url(#b${uidv})`" stroke="#ffffff" stroke-opacity=".18" />
    <path d="M128 80 C148 60 176 52 210 52 L213 80 Z" :fill="`url(#w${uidv})`" />
    <path d="M222 52 C252 53 276 62 296 78 L224 80 Z" :fill="`url(#w${uidv})`" />
    <g :filter="`url(#g${uidv})`" fill="none" stroke-linecap="round">
      <path d="M40 112 C120 104 260 104 370 108" :stroke="c2" stroke-width="2.5" />
      <path d="M112 79 C150 50 270 48 314 75" :stroke="c1" stroke-width="2" stroke-opacity=".9" />
      <circle cx="98" cy="130" r="27" stroke="#2a2f66" stroke-width="10" />
      <circle cx="308" cy="130" r="27" stroke="#2a2f66" stroke-width="10" />
      <circle cx="98" cy="130" r="21" :stroke="c2" stroke-width="3" />
      <circle cx="308" cy="130" r="21" :stroke="c2" stroke-width="3" />
      <path d="M362 94 L382 100" stroke="#e9fdff" stroke-width="5" />
      <path d="M22 104 L36 102" :stroke="'#ff5c8a'" stroke-width="5" />
    </g>
    <circle cx="98" cy="130" r="6" fill="#c9d4ff" /><circle cx="308" cy="130" r="6" fill="#c9d4ff" />
  </svg>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{ kind?: string; accent?: string }>(), { kind: 'auto' })
const uidv = Math.random().toString(36).slice(2, 8)
const isBike = computed(() => props.kind === 'moto' || props.kind === 'ciclomotore')
const pair = computed(() => ACCENTS.find((a) => a[0] === props.accent) ?? ACCENTS[0])
const c1 = computed(() => pair.value[0])
const c2 = computed(() => pair.value[1])
</script>
<style scoped>
.neon { width: 100%; height: auto; display: block; overflow: visible; }
</style>
