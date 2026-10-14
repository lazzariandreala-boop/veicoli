<template>
  <div class="page">
    <header class="topbar">
      <h1>Report</h1>
      <NuxtLink to="/spese" class="icon-btn" aria-label="Spese"><ChevronLeft :size="22" /></NuxtLink>
    </header>

    <div v-if="vehicles.length > 1" class="chips" style="margin-bottom: 12px">
      <button class="chip-btn" :class="{ on: vehicleId === 'all' }" @click="vehicleId = 'all'">Tutti i veicoli</button>
      <button v-for="v in vehicles" :key="v.id" class="chip-btn" :class="{ on: vehicleId === v.id }" @click="vehicleId = v.id">{{ vehicleName(v) }}</button>
    </div>
    <div class="segmented" style="margin-bottom: 16px">
      <button v-for="p in PERIODS" :key="p.id" :class="{ on: period === p.id }" @click="period = p.id; sel = -1">{{ p.label }}</button>
    </div>

    <div class="card chart-card">
        <div class="t-lbl">Spese totali</div>
        <div class="t-row">
          <span class="t-num num">{{ money(total) }}</span>
          <span v-if="delta !== null" class="delta" :class="delta > 0 ? 'up' : 'down'">{{ delta > 0 ? '+' : '' }}{{ delta }}%</span>
        </div>
        <div class="chart" @pointermove="hover" @pointerdown="hover" @pointerleave="sel = -1">
          <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="plot" aria-hidden="true">
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8cff" stop-opacity=".6" /><stop offset=".6" stop-color="#3d5afe" stop-opacity=".18" /><stop offset="1" stop-color="#3d5afe" stop-opacity="0" /></linearGradient>
              <linearGradient id="stroke" x1="0" x2="1"><stop offset="0" stop-color="#3d8bff" /><stop offset="1" stop-color="#4fd2ff" /></linearGradient>
            </defs>
            <line v-for="g in 3" :key="g" x1="0" :x2="W" :y1="(H - PAD) * (g / 3)" :y2="(H - PAD) * (g / 3)" class="grid" />
            <path :d="areaPath" fill="url(#area)" />
            <path :d="linePath" fill="none" stroke="url(#stroke)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" class="line" />
            <line v-if="sel >= 0" :x1="pts[sel]!.x" :x2="pts[sel]!.x" y1="0" :y2="H - PAD" class="cursor" />
          </svg>
          <span v-for="(p, i) in pts" :key="i" class="pt" :class="{ on: sel === i }" :style="{ left: (p.x / W) * 100 + '%', top: (p.y / H) * 100 + '%' }" />
          <div v-if="sel >= 0" class="tip" :style="{ left: Math.min(78, Math.max(22, (pts[sel]!.x / W) * 100)) + '%' }">
            <b class="num">{{ money(buckets[sel]!.total) }}</b><span>{{ buckets[sel]!.long }}</span>
          </div>
        </div>
        <div class="xlabels"><span v-for="(b, i) in buckets" :key="i" :class="{ hide: !showLabel(i) }">{{ b.label }}</span></div>
    </div>

    <section class="section">
      <div class="card donut-card">
        <svg width="0" height="0" style="position: absolute" aria-hidden="true"><defs>
          <linearGradient v-for="c in cats" :id="'dg-' + c.id" :key="c.id" x1="0" y1="0" x2="1" y2="1"><stop offset="0" :stop-color="c.color" /><stop offset="1" :stop-color="c.color" stop-opacity=".6" /></linearGradient>
        </defs></svg>
        <h2 style="font-size: 17px; margin: 0 0 14px">Ripartizione spese</h2>
        <div v-if="total" class="donut-row">
          <svg viewBox="0 0 120 120" class="donut" aria-hidden="true">
            <circle cx="60" cy="60" r="44" class="track" />
            <circle v-for="s in slices" :key="s.id" cx="60" cy="60" r="44" fill="none" :stroke="`url(#dg-${s.id})`" stroke-width="18"
              :stroke-dasharray="`${s.len} ${CIRC - s.len}`" :stroke-dashoffset="-s.offset" transform="rotate(-90 60 60)" />
            <text x="60" y="57" text-anchor="middle" class="d-num">{{ cats.length }}</text>
            <text x="60" y="73" text-anchor="middle" class="d-lbl">voci</text>
          </svg>
          <ul class="legend">
            <li v-for="c in cats" :key="c.id"><i :style="{ background: c.color }" /><span class="grow">{{ c.short }}</span><b class="num">{{ c.pct }}%</b></li>
          </ul>
        </div>
        <p v-else class="faint" style="margin: 0">Nessuna spesa in questo periodo.</p>
      </div>
    </section>

    <section v-if="cats.length" class="section">
      <div class="list">
        <div v-for="c in cats" :key="c.id" class="list-item" style="cursor: default">
          <i class="sw" :style="{ background: c.color }" />
          <span class="grow">{{ c.label }}</span>
          <b class="num">{{ money(c.total) }}</b>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import { monthName, vehicleName } from '~/utils/deadlines'
import { EXPENSE_CATS, PERIODS, periodRange, type Period } from '~/composables/expenses'

const { vehicles, entries } = useExpenses()
const vehicleId = ref('all')
const period = ref<Period>('1a')
const sel = ref(-1)
const W = 320, H = 150, PAD = 10

const scoped = computed(() => entries.value.filter((e) => vehicleId.value === 'all' || e.vehicleId === vehicleId.value))
const range = computed(() => periodRange(period.value))
const filtered = computed(() => scoped.value.filter((e) => !range.value || (e.date >= range.value.from && e.date < range.value.to)))
const total = computed(() => filtered.value.reduce((s, e) => s + e.amount, 0))
const delta = computed(() => {
  const r = range.value
  if (!r) return null
  const prev = scoped.value.filter((e) => e.date >= r.prevFrom && e.date < r.from).reduce((s, e) => s + e.amount, 0)
  return prev ? Math.round(((total.value - prev) / prev) * 100) : null
})

const MS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
interface Bucket { from: string; to: string; label: string; long: string; total: number }
const buckets = computed<Bucket[]>(() => {
  const now = new Date()
  const out: Omit<Bucket, 'total'>[] = []
  if (period.value === '30g') {
    for (let i = 9; i >= 0; i--) {
      const end = new Date(now); end.setDate(end.getDate() - i * 3 + 1)
      const start = new Date(end); start.setDate(start.getDate() - 3)
      const last = new Date(end); last.setDate(last.getDate() - 1)
      out.push({ from: iso(start), to: iso(end), label: `${last.getDate()}/${last.getMonth() + 1}`, long: `${start.getDate() + 0}–${last.getDate()} ${MS[last.getMonth()]}` })
    }
  } else {
    let n = period.value === '6m' ? 6 : 12
    let years = false
    if (period.value === 'tutto') {
      const first = scoped.value.at(-1)?.date
      const fy = first ? Number(first.slice(0, 4)) : now.getFullYear()
      const span = (now.getFullYear() - fy) * 12 + now.getMonth() + 1
      if (span > 24) { years = true; n = Math.min(12, now.getFullYear() - fy + 1) } else n = Math.max(6, span)
    }
    for (let i = n - 1; i >= 0; i--) {
      if (years) {
        const y = now.getFullYear() - i
        out.push({ from: `${y}-01-01`, to: `${y + 1}-01-01`, label: String(y).slice(2), long: String(y) })
      } else {
        const s = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        out.push({ from: iso(s), to: iso(e), label: MS[s.getMonth()]!, long: monthName(iso(s).slice(0, 7)) })
      }
    }
  }
  return out.map((b) => ({ ...b, total: scoped.value.filter((e) => e.date >= b.from && e.date < b.to).reduce((s, e) => s + e.amount, 0) }))
})
const pts = computed(() => {
  const n = buckets.value.length
  const max = Math.max(1, ...buckets.value.map((b) => b.total))
  return buckets.value.map((b, i) => ({ x: n === 1 ? W / 2 : 6 + (i * (W - 12)) / (n - 1), y: (H - PAD) - (b.total / max) * (H - PAD - 16) }))
})
// Curva morbida (Catmull-Rom → Bézier)
const linePath = computed(() => {
  const p = pts.value
  if (!p.length) return ''
  let d = `M${p[0]!.x},${p[0]!.y}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]!, p1 = p[i]!, p2 = p[i + 1]!, p3 = p[i + 2] ?? p2
    const c1y = Math.min(H - PAD, p1.y + (p2.y - p0.y) / 6), c2y = Math.min(H - PAD, p2.y - (p3.y - p1.y) / 6)
    d += ` C${p1.x + (p2.x - p0.x) / 6},${c1y} ${p2.x - (p3.x - p1.x) / 6},${c2y} ${p2.x},${p2.y}`
  }
  return d
})
const areaPath = computed(() => (pts.value.length ? `${linePath.value} L${pts.value.at(-1)!.x},${H - PAD} L${pts.value[0]!.x},${H - PAD} Z` : ''))
const showLabel = (i: number) => { const n = buckets.value.length; const step = n > 8 ? 2 : 1; return (n - 1 - i) % step === 0 }
function hover(ev: PointerEvent) {
  const el = ev.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const x = ((ev.clientX - r.left) / r.width) * W
  let best = 0
  pts.value.forEach((p, i) => { if (Math.abs(p.x - x) < Math.abs(pts.value[best]!.x - x)) best = i })
  sel.value = best
}

const CIRC = 2 * Math.PI * 44
const cats = computed(() => EXPENSE_CATS.map((c) => ({ ...c, total: filtered.value.filter((e) => e.cat === c.id).reduce((s, e) => s + e.amount, 0) }))
  .filter((c) => c.total > 0).map((c) => ({ ...c, pct: Math.round((c.total / (total.value || 1)) * 100) })))
const slices = computed(() => {
  let off = 0
  const gap = cats.value.length > 1 ? 2.5 : 0
  return cats.value.map((c) => {
    const len = Math.max(0.5, (c.total / (total.value || 1)) * CIRC - gap)
    const s = { id: c.id, color: c.color, len, offset: off }
    off += len + gap
    return s
  })
})
</script>
<style scoped>
.chart-card { padding: 18px 16px 14px 18px; }
.t-lbl { font-size: 13.5px; font-weight: 500; color: var(--text-2); }
.t-row { display: flex; align-items: baseline; gap: 10px; margin: 4px 0 10px; }
.t-num { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--title); }
.delta { font-size: 13px; font-weight: 700; }
.delta.up { color: var(--danger); }
.delta.down { color: var(--ok); }
.chart { position: relative; height: 160px; touch-action: pan-y; }
.plot { width: 100%; height: 100%; overflow: visible; }
.grid { stroke: var(--line-2); stroke-width: 1; vector-effect: non-scaling-stroke; }
.line { filter: drop-shadow(0 0 5px rgba(60, 160, 255, .8)); }
.cursor { stroke: var(--text-3); stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
.pt { position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #4fd2ff; border: 2px solid var(--surface-solid); box-shadow: 0 0 8px #4fd2ff; transition: transform .15s; pointer-events: none; }
.pt.on { transform: scale(1.8); background: #fff; }
.tip { position: absolute; top: -8px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; padding: 6px 10px; border-radius: 10px; background: rgba(10, 12, 36, .92); border: 1px solid rgba(34, 229, 255, .6); box-shadow: 0 0 12px rgba(34, 229, 255, .4); pointer-events: none; white-space: nowrap; }
.tip b { color: #fff; font-size: 13px; }
.tip span { font-size: 11px; color: rgba(220, 225, 255, .7); }
.xlabels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10.5px; color: var(--text-3); }
.xlabels span { flex: 1; text-align: center; }
.xlabels span.hide { visibility: hidden; }
.donut-row { display: flex; align-items: center; gap: 18px; }
.donut { width: 132px; height: 132px; flex: none; filter: drop-shadow(0 0 10px rgba(124, 92, 255, .45)); }
.donut .track { fill: none; stroke: var(--surface-3); stroke-width: 18; }
.d-num { fill: var(--text); font-family: var(--font-display); font-size: 20px; font-weight: 700; }
.d-lbl { fill: var(--text-3); font-size: 10px; }
.legend { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; flex: 1; min-width: 0; font-size: 13.5px; }
.legend li { display: flex; align-items: center; gap: 8px; }
.legend i, .sw { width: 10px; height: 10px; border-radius: 3px; flex: none; display: inline-block; }
</style>
