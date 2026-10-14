<template>
  <div class="page" style="padding-bottom: calc(var(--nav-h) + var(--safe-bottom) + 96px)">
    <header class="topbar">
      <h1>Spese</h1>
      <NuxtLink to="/report" class="icon-btn" aria-label="Report"><ChartLine :size="20" /></NuxtLink>
    </header>

    <div class="filters">
      <FilterSelect v-model="cat" label="Categoria" default-value="all" :options="[{ value: 'all', label: 'Tutte' }, ...EXPENSE_CATS.map((c) => ({ value: c.id, label: c.short }))]" />
      <FilterSelect v-model="period" label="Periodo" default-value="1a" :options="PERIODS.map((p) => ({ value: p.id, label: p.label }))" />
      <FilterSelect v-if="vehicles.length > 1" v-model="vehicleId" class="span" label="Veicolo" default-value="all" :options="[{ value: 'all', label: 'Tutti i veicoli' }, ...vehicles.map((v) => ({ value: v.id, label: vehicleName(v) }))]" />
    </div>

    <div class="card total">
      <div class="grow">
        <div class="t-lbl">Spese totali</div>
        <div class="t-num num">{{ money(total) }}</div>
        <div v-if="delta !== null" class="delta" :class="delta > 0 ? 'up' : 'down'">
          <component :is="delta > 0 ? ArrowUp : ArrowDown" :size="14" /> {{ delta > 0 ? '+' : '' }}{{ delta }}%
        </div>
        <div class="t-sub">{{ filtered.length }} moviment{{ filtered.length === 1 ? 'o' : 'i' }} · {{ periodLabel }}</div>
      </div>
      <div class="mini" aria-hidden="true">
        <span v-for="m in months" :key="m.key" :style="{ height: Math.max(8, (m.total / maxMonth) * 86) + 'px' }"><i :style="{ height: Math.max(4, (m.total / maxMonth) * 46) + 'px' }" /></span>
      </div>
    </div>

    <SpeseMatrix v-if="cat === 'all' && matrix.length > 1" :items="matrix" />

    <section class="section" style="margin-top: 18px">
      <div v-if="filtered.length" class="card exp-list">
        <NuxtLink v-for="e in visible" :key="e.cat + e.id" :to="`/veicoli/${e.vehicleId}?tab=${e.tab}`" class="exp" :style="{ '--c': catOf(e.cat).color }">
          <span class="exp-ico"><component :is="ICONS[e.cat]" :size="19" /></span>
          <div class="grow" style="min-width: 0">
            <strong class="ellipsis">{{ e.title }}</strong>
            <div class="sub ellipsis">{{ vName(e.vehicleId) }}</div>
          </div>
          <div class="amt"><b class="num">{{ money(e.amount) }}</b><span>{{ formatDate(e.date) }}</span></div>
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
      <button class="btn primary block scan-doc" @click="addOpen = false; router.push(`/documento${addVehicle ? '?veicolo=' + addVehicle : ''}`)"><ScanText :size="19" /> Leggi da una foto o un PDF</button>
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
import { ArrowDown, ArrowUp, ChartLine, ChevronRight, ClipboardCheck, Landmark, Plus, ScanText, ShieldCheck, TriangleAlert, Wrench } from 'lucide-vue-next'
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
const periodLabel = computed(() => PERIODS.find((p) => p.id === period.value)!.label.toLowerCase())
const matrix = computed(() => EXPENSE_CATS.map((c) => ({ label: c.short, color: c.color, value: filtered.value.filter((e) => e.cat === c.id).reduce((s, e) => s + e.amount, 0) })).filter((x) => x.value > 0))
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
  { add: 'tagliando', tab: 'lavori', cat: 'lavori', label: 'Tagliando', hint: 'Quando e cosa è stato fatto' },
  { add: 'work', tab: 'lavori', cat: 'lavori', label: 'Lavoro o riparazione', hint: 'Gomme, freni, carrozzeria...' },
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
.filters { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.filters .span { grid-column: 1 / -1; }
.total { display: flex; align-items: flex-end; gap: 12px; padding: 20px 20px 18px; }
.t-lbl { font-size: 13.5px; font-weight: 500; color: var(--text-2); }
.t-num { font-family: var(--font-display); font-size: 34px; font-weight: 700; color: var(--title); letter-spacing: -.02em; margin: 4px 0 6px; }
.delta { display: inline-flex; align-items: center; gap: 3px; font-size: 13px; font-weight: 700; }
.delta.up { color: var(--danger); }
.delta.down { color: var(--ok); }
.t-sub { margin-top: 4px; font-size: 12px; color: var(--text-3); }
.mini { display: flex; align-items: flex-end; gap: 6px; height: 92px; }
.mini span { position: relative; width: 11px; border-radius: 4px; background: linear-gradient(180deg, #6d5cff, #3d5afe); box-shadow: 0 0 12px rgba(91, 77, 255, .55); overflow: hidden; }
.mini i { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, #4fd2ff, #2f8cff); }
.exp-list { padding: 4px 0; }
.exp { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
.exp:last-of-type { border-bottom: 0; }
.exp strong { display: block; font-size: 15px; font-weight: 600; color: var(--text); }
.exp .sub { font-size: 12.5px; color: var(--text-3); margin-top: 2px; }
.amt { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex: none; }
.amt b { font-size: 15px; color: var(--title); }
.amt span { font-size: 11.5px; color: var(--text-3); }
.exp-ico { width: 44px; height: 44px; flex: none; border-radius: 14px; display: grid; place-items: center; color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent); border: 1px solid color-mix(in srgb, var(--c) 40%, transparent); box-shadow: 0 0 14px color-mix(in srgb, var(--c) 25%, transparent); }
.add-btn { position: fixed; left: 16px; right: 16px; max-width: 520px; margin: 0 auto; bottom: calc(var(--nav-h) + var(--safe-bottom) + 20px); z-index: 20; display: flex; align-items: center; justify-content: center; gap: 8px; height: 54px; border-radius: 999px; color: #fff; font-weight: 600; font-size: 16px; cursor: pointer;
  border: 0; background: var(--grad-primary); box-shadow: var(--grad-primary-glow), 0 14px 26px -10px rgba(40, 20, 110, .5); }
.add-btn:active { transform: scale(.98); }
.scan-doc { margin-bottom: 14px; height: 54px; border-radius: 999px; }
</style>
