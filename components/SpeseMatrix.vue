<template>
  <div class="matrix">
    <svg viewBox="0 0 340 300" class="mesh" aria-hidden="true">
      <defs>
        <linearGradient id="mx-g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#22e5ff" /><stop offset=".45" stop-color="#7c5cff" /><stop offset="1" stop-color="#ff6fb5" />
        </linearGradient>
        <linearGradient id="mx-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".25" /><stop offset=".5" stop-color="#fff" stop-opacity="1" /><stop offset="1" stop-color="#fff" stop-opacity=".35" />
        </linearGradient>
        <mask id="mx-m"><rect width="340" height="300" fill="url(#mx-fade)" /></mask>
        <radialGradient id="mx-glow"><stop offset="0" stop-color="#7c5cff" stop-opacity=".35" /><stop offset="1" stop-color="#7c5cff" stop-opacity="0" /></radialGradient>
      </defs>
      <ellipse cx="170" cy="180" rx="170" ry="110" fill="url(#mx-glow)" />
      <g mask="url(#mx-m)" fill="none" stroke="url(#mx-g)" stroke-linejoin="round">
        <path v-for="(d, i) in rows" :key="'r' + i" :d="d" stroke-width="1" :stroke-opacity="0.55 + (i / rows.length) * 0.45" />
        <path v-for="(d, i) in cols" :key="'c' + i" :d="d" stroke-width=".8" stroke-opacity=".6" />
        <path :d="ridge" stroke-width="2.4" stroke-opacity="1" class="ridge" />
      </g>
    </svg>
    <div v-for="b in bubbles" :key="b.label" class="bubble" :style="{ left: b.x / 3.4 + '%', top: b.y / 3 + '%', width: b.size + 'px', height: b.size + 'px', '--c': b.color }">
      <strong>{{ b.label }}</strong>
      <span class="num">{{ money(b.value, true) }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
// Superficie a onda ("Spese Matrix" del mockup) con una bolla per ogni voce di spesa.
const props = defineProps<{ items: { label: string; value: number; color: string }[] }>()
const NX = 30, NY = 20
const h = (u: number, v: number) => 0.55 * Math.sin(u * 5.2 + v * 2.4) * Math.cos(v * 3.1 - u * 1.3) + 0.35 * Math.sin(u * 2.1 - v * 4.2 + 1)
const P = (u: number, v: number) => {
  const x = 12 + u * 300 + (v - 0.5) * 40
  const y = 78 + v * 160 - h(u, v) * 64 - u * 18
  return [x, y] as const
}
const line = (pts: (readonly [number, number])[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
const rows = Array.from({ length: NY }, (_, j) => line(Array.from({ length: NX + 1 }, (_, i) => P(i / NX, j / (NY - 1)))))
const cols = Array.from({ length: NX + 1 }, (_, i) => line(Array.from({ length: NY }, (_, j) => P(i / NX, j / (NY - 1)))))
const ridge = line(Array.from({ length: 60 }, (_, i) => P(i / 59, 0.62)))
// posizioni sulla superficie, scelte per non sovrapporsi
const SPOTS = [[0.5, 0.1], [0.2, 0.42], [0.8, 0.3], [0.52, 0.6], [0.8, 0.85], [0.3, 0.9]]
const bubbles = computed(() => {
  const max = Math.max(1, ...props.items.map((i) => i.value))
  return props.items.slice(0, 6).map((it, k) => {
    const [u, v] = SPOTS[k]!
    const [x, y] = P(u, v)
    return { ...it, x, y: y - 10, size: Math.round(74 + (it.value / max) * 26) }
  })
})
</script>
<style scoped>
.matrix { position: relative; width: 100%; aspect-ratio: 340 / 300; margin: 8px 0 4px; }
.mesh { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ridge { filter: drop-shadow(0 0 6px #22e5ff); }
.bubble { position: absolute; transform: translate(-50%, -50%); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 8px; text-align: center; color: #fff;
  background: radial-gradient(circle at 35% 28%, #3a3f78 0%, #1a1d48 55%, #0f1230 100%);
  border: 1px solid color-mix(in srgb, var(--c) 60%, transparent);
  box-shadow: 0 0 18px color-mix(in srgb, var(--c) 55%, transparent), 0 12px 22px -8px rgba(10, 10, 40, .6), inset 0 0 14px color-mix(in srgb, var(--c) 30%, transparent); }
.bubble::after { content: ''; position: absolute; left: 50%; bottom: -7px; width: 12px; height: 12px; background: #11143a; transform: translateX(-50%) rotate(45deg); border-right: 1px solid color-mix(in srgb, var(--c) 60%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--c) 60%, transparent); }
.bubble strong { font-size: 12px; font-weight: 600; line-height: 1.1; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bubble span { font-size: 12px; font-weight: 700; color: #7ff3c8; }
</style>
