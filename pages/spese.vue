<template>
  <div class="page" style="padding-bottom: calc(var(--nav-h) + var(--safe-bottom) + 96px)">
    <header class="topbar">
      <div class="grow"><div class="eyebrow">Costi di gestione</div><h1>Spese</h1></div>
      <NuxtLink to="/report" class="icon-btn" aria-label="Report"><ChartLine :size="21" /></NuxtLink>
    </header>

    <div class="chips" style="margin-bottom: 12px">
      <button class="chip-btn" :class="{ on: cat === 'all' }" @click="cat = 'all'">Tutte</button>
      <button v-for="c in EXPENSE_CATS" :key="c.id" class="chip-btn" :class="{ on: cat === c.id }" @click="cat = c.id">{{ c.short }}</button>
    </div>
    <div v-if="vehicles.length > 1" class="chips" style="margin-bottom: 12px">
      <button class="chip-btn" :class="{ on: vehicleId === 'all' }" @click="vehicleId = 'all'">Tutti i veicoli</button>
      <button v-for="v in vehicles" :key="v.id" class="chip-btn" :class="{ on: vehicleId === v.id }" @click="vehicleId = v.id">{{ vehicleName(v) }}</button>
    </div>
    <div class="segmented" style="margin-bottom: 16px">
      <button v-for="p in PERIODS" :key="p.id" :class="{ on: period === p.id }" @click="period = p.id">{{ p.label }}</button>
    </div>

    <HoloCard glow="violet" :cut="22">
      <div class="total">
        <div class="grow">
          <div class="t-lbl">Spese totali</div>
          <div class="t-num num">{{ money(total) }}</div>
          <div v-if="delta !== null" class="delta" :class="delta > 0 ? 'up' : 'down'">
            <component :is="delta > 0 ? TrendingUp : TrendingDown" :size="14" /> {{ delta > 0 ? '+' : '' }}{{ delta }}% <span>vs periodo prec.</span>
          </div>
          <div v-else class="delta"><span>{{ filtered.length }} movimenti</span></div>
        </div>
        <div class="mini" aria-hidden="true">
          <span v-for="(m, i) in months" :key="m.key" :style="{ height: Math.max(6, (m.total / maxMonth) * 64) + 'px', opacity: .45 + (i / months.length) * .55 }" />
        </div>
      </div>
    </HoloCard>

    <section class="section">
      <div class="section-head"><h2>Movimenti</h2><span class="faint" style="font-size: 13px">{{ filtered.length }}</span></div>
      <div v-if="filtered.length" class="stack" style="gap: 10px">
        <NuxtLink v-for="e in visible" :key="e.cat + e.id" :to="`/veicoli/${e.vehicleId}?tab=${e.tab}`" class="exp" :style="{ '--c': catOf(e.cat).color }">
          <span class="exp-ico"><component :is="ICONS[e.cat]" :size="19" /></span>
          <div class="grow" style="min-width: 0">
            <strong class="ellipsis">{{ e.title }}</strong>
            <div class="faint ellipsis" style="font-size: 12.5px">{{ vName(e.vehicleId) }} · {{ formatDate(e.date) }}</div>
          </div>
          <b class="num">{{ money(e.amount) }}</b>
        </NuxtLink>
        <button v-if="filtered.length > limit" class="btn ghost block" @click="limit += 30">Mostra altri</button>
      </div>
      <div v-else class="empty"><p>{{ vehicles.length ? 'Nessuna spesa in questo periodo.' : 'Aggiungi un veicolo per iniziare a registrare le spese.' }}</p></div>
    </section>

    <section v-if="purchases || sales" class="section">
      <div class="section-head"><h2>Acquisti e vendite</h2></div>
      <div class="grid-2">
        <div class="card flat"><div class="eyebrow">Acquisti</div><b class="num" style="font-size: 20px">{{ money(purchases, true) }}</b></div>
        <div class="card flat"><div class="eyebrow">Incassi</div><b class="num" style="font-size: 20px; color: var(--ok)">{{ money(sales, true) }}</b></div>
      </div>
    </section>

    <button v-if="vehicles.length" class="add-btn" @click="addOpen = true"><Plus :size="19" /> Aggiungi spesa</button>

    <BottomSheet :open="addOpen" @close="addOpen = false">
      <h2 style="margin: 0 0 12px">Nuova spesa</h2>
      <div v-if="activeVehicles.length > 1" class="field" style="margin-bottom: 14px">
        <span>Veicolo</span>
        <select v-model="addVehicle" class="input"><option v-for="v in activeVehicles" :key="v.id" :value="v.id">{{ vehicleName(v) }}</option></select>
      </div>
      <div class="list">
        <button v-for="t in ADD_TYPES" :key="t.add" class="list-item" @click="goAdd(t)">
          <span class="exp-ico" :style="{ '--c': catOf(t.cat).color }"><component :is="ICONS[t.cat]" :size="19" /></span>
          <div class="grow" style="text-align: left"><strong>{{ t.label }}</strong><div class="faint" style="font-size: 12.5px">{{ t.hint }}</div></div>
          <ChevronRight :size="18" class="faint" />
        </button>
      </div>
    </BottomSheet>
  </div>
</template>
<script setup lang="ts">
import { ChartLine, ChevronRight, ClipboardCheck, Landmark, Plus, ShieldCheck, TrendingDown, TrendingUp, TriangleAlert, Wrench } from 'lucide-vue-next'
import { formatDate, vehicleName } from '~/utils/deadlines'
import { EXPENSE_CATS, PERIODS, periodRange, type ExpenseCat, type Period } from '~/composables/expenses'

const { vehicles, entries } = useExpenses()
const router = useRouter()
const ICONS: Record<ExpenseCat, any> = { lavori: Wrench, assicurazione: ShieldCheck, bollo: Landmark, revisioni: ClipboardCheck, danni: TriangleAlert }
const catOf = (c: ExpenseCat) => EXPENSE_CATS.find((x) => x.id === c)!
const cat = ref<ExpenseCat | 'all'>('all')
const vehicleId = ref('all')
const period = ref<Period>('1a')
const limit = ref(30)

const scoped = computed(() => entries.value.filter((e) => (vehicleId.value === 'all' || e.vehicleId === vehicleId.value) && (cat.value === 'all' || e.cat === cat.value)))
const range = computed(() => periodRange(period.value))
const filtered = computed(() => scoped.value.filter((e) => !range.value || (e.date >= range.value.from && e.date < range.value.to)))
const visible = computed(() => filtered.value.slice(0, limit.value))
const total = computed(() => filtered.value.reduce((s, e) => s + e.amount, 0))
const delta = computed(() => {
  const r = range.value
  if (!r) return null
  const prev = scoped.value.filter((e) => e.date >= r.prevFrom && e.date < r.from).reduce((s, e) => s + e.amount, 0)
  if (!prev) return null
  return Math.round(((total.value - prev) / prev) * 100)
})
const months = computed(() => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { key, total: scoped.value.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0) }
  })
})
const maxMonth = computed(() => Math.max(1, ...months.value.map((m) => m.total)))
const vName = (id: string) => { const v = vehicles.value.find((x) => x.id === id); return v ? vehicleName(v) : '' }

const inRange = (iso?: string) => !!iso && (!range.value || (iso >= range.value.from && iso < range.value.to))
const inScope = (id: string) => vehicleId.value === 'all' || id === vehicleId.value
const purchases = computed(() => cat.value !== 'all' ? 0 : vehicles.value.filter((v) => inScope(v.id) && inRange(v.purchase.date)).reduce((s, v) => s + (v.purchase.price ?? 0), 0))
const sales = computed(() => cat.value !== 'all' ? 0 : vehicles.value.filter((v) => inScope(v.id) && inRange(v.end?.date)).reduce((s, v) => s + (v.end?.price ?? 0), 0))

// Aggiungi spesa: scelgo veicolo e tipo, poi apro il modulo nella scheda del veicolo
const activeVehicles = computed(() => vehicles.value.filter((v) => v.status === 'attivo').concat(vehicles.value.filter((v) => v.status !== 'attivo')))
const addOpen = ref(false)
const addVehicle = ref('')
watchEffect(() => { if (!addVehicle.value || !vehicles.value.some((v) => v.id === addVehicle.value)) addVehicle.value = vehicleId.value !== 'all' ? vehicleId.value : activeVehicles.value[0]?.id ?? '' })
const ADD_TYPES = [
  { add: 'work', tab: 'lavori', cat: 'lavori', label: 'Lavoro o manutenzione', hint: 'Tagliando, gomme, riparazioni...' },
  { add: 'bollo', tab: 'scadenze', cat: 'bollo', label: 'Bollo pagato', hint: 'Calcolo la prossima scadenza' },
  { add: 'policy', tab: 'scadenze', cat: 'assicurazione', label: 'Assicurazione', hint: 'Promemoria a 30, 15, 1 e 0 giorni' },
  { add: 'inspection', tab: 'scadenze', cat: 'revisioni', label: 'Revisione', hint: 'Esito e costo' },
  { add: 'incident', tab: 'incidenti', cat: 'danni', label: 'Incidente o danno', hint: 'Con foto e video' },
] as const
function goAdd(t: (typeof ADD_TYPES)[number]) {
  addOpen.value = false
  if (addVehicle.value) router.push(`/veicoli/${addVehicle.value}?tab=${t.tab}&add=${t.add}`)
}
</script>
<style scoped>
.total { display: flex; align-items: flex-end; gap: 12px; padding: 18px 18px 18px 22px; }
.t-lbl { font-size: 13px; font-weight: 600; color: rgba(220, 225, 255, .7); }
.t-num { font-family: var(--font-display); font-size: 34px; font-weight: 700; color: #fff; letter-spacing: -.02em; margin: 4px 0 6px; text-shadow: 0 0 16px rgba(124, 92, 255, .7); }
.delta { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; }
.delta span { font-weight: 500; color: rgba(220, 225, 255, .6); }
.delta.up { color: #ff7aa2; }
.delta.down { color: #3ff0c4; }
.mini { display: flex; align-items: flex-end; gap: 5px; height: 70px; }
.mini span { width: 10px; border-radius: 4px 4px 2px 2px; background: linear-gradient(180deg, #22e5ff, #7c5cff); box-shadow: 0 0 10px rgba(34, 229, 255, .5); }
.exp { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); backdrop-filter: blur(14px); }
.exp strong { display: block; font-size: 14.5px; }
.exp b { font-size: 15px; }
.exp-ico { width: 40px; height: 40px; flex: none; border-radius: 12px; display: grid; place-items: center; color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 45%, transparent), 0 0 12px color-mix(in srgb, var(--c) 30%, transparent); }
.add-btn { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(var(--nav-h) + var(--safe-bottom) + 18px); z-index: 20; display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; border-radius: 99px; border: 1px solid rgba(160, 140, 255, .7); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;
  background: linear-gradient(90deg, rgba(124, 92, 255, .85), rgba(80, 70, 220, .85)); box-shadow: 0 0 22px rgba(124, 92, 255, .6), 0 10px 24px rgba(0, 0, 0, .4); backdrop-filter: blur(12px); }
.add-btn:active { transform: translateX(-50%) scale(.97); }
</style>
