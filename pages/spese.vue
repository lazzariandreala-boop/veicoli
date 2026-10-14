<template>
  <div class="page">
    <header class="topbar"><h1>Spese</h1></header>

    <div class="chips" style="margin-bottom: 14px">
      <button class="chip-btn" :class="{ on: vehicleId === 'all' }" @click="vehicleId = 'all'">Tutti i veicoli</button>
      <button v-for="v in vehicles" :key="v.id" class="chip-btn" :class="{ on: vehicleId === v.id }" @click="vehicleId = v.id">{{ vehicleName(v) }}</button>
    </div>

    <div class="hero-num card">
      <div class="eyebrow">{{ year === 'all' ? 'Totale speso' : `Speso nel ${year}` }}</div>
      <div class="big num">{{ money(total, true) }}</div>
      <div class="faint" style="font-size: 13px">Lavori, bollo, assicurazione, revisioni e danni non rimborsati. Acquisti esclusi.</div>
    </div>

    <section v-if="years.length" class="section">
      <div class="section-head"><h2>Per anno</h2><span class="faint" style="font-size: 13px">Tocca un anno per filtrare</span></div>
      <div class="card flat">
        <div class="bars" role="list">
          <button v-for="y in years" :key="y.year" class="bar-col" :class="{ dim: year !== 'all' && year !== y.year }" role="listitem"
            :aria-label="`${y.year}: ${money(y.total)}`" @click="year = year === y.year ? 'all' : y.year">
            <span class="bar-val num">{{ compact(y.total) }}</span>
            <span class="bar" :style="{ height: Math.max(3, (y.total / maxYear) * 120) + 'px' }" />
            <span class="bar-lbl">{{ y.year }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Per voce</h2></div>
      <div class="card flat stack" style="gap: 14px">
        <p v-if="!categories.length" class="faint" style="margin: 0">Nessuna spesa registrata.</p>
        <div v-for="c in categories" :key="c.label" class="hrow">
          <div class="row" style="justify-content: space-between"><span>{{ c.label }}</span><b class="num">{{ money(c.total) }}</b></div>
          <div class="track"><div class="fill" :style="{ width: (maxCat ? (c.total / maxCat) * 100 : 0) + '%' }" /></div>
        </div>
      </div>
    </section>

    <section v-if="vehicleId === 'all' && perVehicle.length > 1" class="section">
      <div class="section-head"><h2>Per veicolo</h2></div>
      <div class="list">
        <NuxtLink v-for="p in perVehicle" :key="p.v.id" :to="`/veicoli/${p.v.id}?tab=storia`" class="list-item">
          <div class="icon-bubble" :style="{ background: accentGradient(p.v.accent), color: 'white' }"><KindIcon :kind="p.v.kind" :size="20" /></div>
          <div class="grow"><strong class="ellipsis" style="display: block">{{ vehicleName(p.v) }}</strong><span class="faint" style="font-size: 13px">{{ p.v.plate }}</span></div>
          <b class="num">{{ money(p.total, true) }}</b>
        </NuxtLink>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Acquisti e vendite</h2></div>
      <div class="grid-2">
        <div class="card flat"><div class="eyebrow">Acquisti</div><b class="num" style="font-size: 20px">{{ money(purchases, true) }}</b></div>
        <div class="card flat"><div class="eyebrow">Incassi</div><b class="num" style="font-size: 20px; color: var(--ok)">{{ money(sales, true) }}</b></div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { vehicleName } from '~/utils/deadlines'
import type { BolloPayment, Incident, InsurancePolicy, Inspection, Vehicle, Work } from '~/utils/types'

const { data } = useLive(async () => {
  const d = db()
  const [vehicles, works, bolli, policies, inspections, incidents] = await Promise.all([
    d.vehicles.toArray(), d.works.toArray(), d.bolli.toArray(), d.policies.toArray(), d.inspections.toArray(), d.incidents.toArray(),
  ])
  return { vehicles, works, bolli, policies, inspections, incidents }
}, { vehicles: [] as Vehicle[], works: [] as Work[], bolli: [] as BolloPayment[], policies: [] as InsurancePolicy[], inspections: [] as Inspection[], incidents: [] as Incident[] })

const vehicleId = ref('all')
const year = ref<string>('all')
const vehicles = computed(() => data.value.vehicles)

interface Entry { vehicleId: string; date: string; amount: number; cat: string }
const entries = computed<Entry[]>(() => {
  const d = data.value
  return [
    ...d.works.map((x) => ({ vehicleId: x.vehicleId, date: x.date, amount: x.cost ?? 0, cat: 'Lavori e manutenzione' })),
    ...d.bolli.map((x) => ({ vehicleId: x.vehicleId, date: x.paidDate, amount: x.amount ?? 0, cat: 'Bollo' })),
    ...d.policies.map((x) => ({ vehicleId: x.vehicleId, date: x.startDate ?? x.endDate, amount: x.price ?? 0, cat: 'Assicurazione' })),
    ...d.inspections.map((x) => ({ vehicleId: x.vehicleId, date: x.date, amount: x.cost ?? 0, cat: 'Revisioni' })),
    ...d.incidents.map((x) => ({ vehicleId: x.vehicleId, date: x.date, amount: Math.max(0, (x.damageCost ?? 0) - (x.reimbursed ?? 0)), cat: 'Danni da incidenti' })),
  ].filter((e) => e.amount > 0)
})
const byVehicle = computed(() => entries.value.filter((e) => vehicleId.value === 'all' || e.vehicleId === vehicleId.value))
const filtered = computed(() => byVehicle.value.filter((e) => year.value === 'all' || e.date.startsWith(year.value)))
const total = computed(() => filtered.value.reduce((s, e) => s + e.amount, 0))
const years = computed(() => {
  const m = new Map<string, number>()
  for (const e of byVehicle.value) m.set(e.date.slice(0, 4), (m.get(e.date.slice(0, 4)) ?? 0) + e.amount)
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-8).map(([year, total]) => ({ year, total }))
})
const maxYear = computed(() => Math.max(1, ...years.value.map((y) => y.total)))
const categories = computed(() => {
  const cats = ['Lavori e manutenzione', 'Assicurazione', 'Bollo', 'Revisioni', 'Danni da incidenti']
  return cats.map((label) => ({ label, total: filtered.value.filter((e) => e.cat === label).reduce((s, e) => s + e.amount, 0) }))
    .filter((c) => c.total > 0).sort((a, b) => b.total - a.total)
})
const maxCat = computed(() => Math.max(...categories.value.map((c) => c.total)))
const perVehicle = computed(() => vehicles.value.map((v) => ({ v, total: filtered.value.filter((e) => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0) }))
  .sort((a, b) => b.total - a.total))
const inScope = (v: Vehicle) => vehicleId.value === 'all' || v.id === vehicleId.value
const purchases = computed(() => vehicles.value.filter(inScope).filter((v) => year.value === 'all' || v.purchase.date?.startsWith(year.value)).reduce((s, v) => s + (v.purchase.price ?? 0), 0))
const sales = computed(() => vehicles.value.filter(inScope).filter((v) => year.value === 'all' || v.end?.date?.startsWith(year.value)).reduce((s, v) => s + (v.end?.price ?? 0), 0))
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')}k` : String(Math.round(n)))
</script>
<style scoped>
.hero-num { position: relative; overflow: hidden; background: radial-gradient(120% 140% at 100% 0%, var(--accent-soft), transparent 60%), var(--surface); }
.big { font-size: 40px; font-weight: 700; font-family: var(--font-display); letter-spacing: -0.03em; margin: 4px 0; }
.bars { display: flex; align-items: flex-end; gap: 6px; height: 170px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%; border: 0; background: none; cursor: pointer; padding: 0; min-width: 0; transition: opacity .2s; }
.bar-col.dim { opacity: .35; }
.bar { width: 100%; max-width: 30px; border-radius: 4px 4px 0 0; background: var(--accent); }
.bar-val { font-size: 11px; color: var(--text-2); font-weight: 600; }
.bar-lbl { font-size: 11.5px; color: var(--text-3); font-weight: 600; }
.hrow { display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
.track { height: 8px; border-radius: 4px; background: var(--surface-3); overflow: hidden; }
.fill { height: 100%; border-radius: 4px; background: var(--accent); transition: width .4s ease; }
</style>
