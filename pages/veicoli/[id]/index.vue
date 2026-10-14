<template>
  <div v-if="v" class="detail">
    <div class="hero" :class="{ photo: !!cover }">
      <img v-if="cover" :src="cover" alt="" class="cover" />
      <div class="shade" />
      <div v-if="!cover" class="neon-wrap"><NeonVehicle :kind="v.kind" :accent="v.accent" /></div>
      <div class="hero-bar">
        <button class="glass-btn" aria-label="Indietro" @click="back"><ChevronLeft :size="22" /></button>
        <div class="row">
          <NuxtLink :to="`/veicoli/${v.id}/modifica`" class="glass-btn" aria-label="Modifica"><Pencil :size="19" /></NuxtLink>
          <button class="glass-btn" aria-label="Altro" @click="menu = true"><Ellipsis :size="20" /></button>
        </div>
      </div>
      <div class="hero-info">
        <div class="grow" style="min-width: 0">
          <div class="row" style="gap: 8px; margin-bottom: 8px">
            <span class="pill"><KindIcon :kind="v.kind" :size="14" /> {{ KIND_LABEL[v.kind] }}</span>
            <span v-if="v.status !== 'attivo'" class="pill dark">{{ STATUS_LABEL[v.status] }}</span>
          </div>
          <h1>{{ vehicleName(v) }}</h1>
          <p v-if="sub">{{ sub }}</p>
          <div style="margin-top: 12px"><PlateBadge :plate="v.plate" size="lg" /></div>
        </div>
        <button v-if="v.status === 'attivo' && deadlines.length" class="ring" :class="health" :aria-label="`Scadenze in regola: ${healthPct}%`" @click="setTab('scadenze')">
          <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" class="r-track" /><circle cx="32" cy="32" r="27" class="r-val" :stroke-dasharray="`${(healthPct / 100) * 169.6} 169.6`" transform="rotate(-90 32 32)" /></svg>
          <b>{{ healthPct }}%</b><span>{{ HEALTH_LABEL[health] }}</span>
        </button>
      </div>
    </div>

    <div class="page" style="padding-top: 0">
      <nav class="tabs">
        <button v-for="t in tabs" :key="t.id" class="tab" :class="{ on: tab === t.id }" @click="setTab(t.id)">
          {{ t.label }}<span v-if="t.count" class="count">{{ t.count }}</span>
        </button>
      </nav>

      <!-- PANORAMICA -->
      <div v-if="tab === 'panoramica'" class="stack" style="gap: 14px">
        <div v-if="route.query.nuovo && v.status === 'attivo' && !bolli.length && !policies.length" class="card next-steps">
          <strong>Imposta le scadenze</strong>
          <p class="muted" style="margin: 4px 0 12px; font-size: 14px">Registra bollo e assicurazione: Veicoli calcola le date e ti avvisa per tempo.</p>
          <div class="grid-2">
            <button class="btn sm" @click="open.bollo = true"><Landmark :size="16" /> Bollo pagato</button>
            <button class="btn sm" @click="open.policy = true"><ShieldCheck :size="16" /> Assicurazione</button>
          </div>
        </div>

        <div class="grid-3">
          <div class="stat card flat"><Gauge :size="18" /><b class="num">{{ v.currentKm ? int(v.currentKm) : '—' }}</b><span>km</span></div>
          <div class="stat card flat"><Wallet :size="18" /><b class="num">{{ money(totals.running, true) }}</b><span>spese</span></div>
          <div class="stat card flat"><CalendarDays :size="18" /><b class="num">{{ ownedFor }}</b><span>possesso</span></div>
        </div>

        <template v-if="v.status === 'attivo'">
          <div class="section-head" style="margin: 6px 0 -4px"><h2>Scadenze</h2></div>
          <DeadlineTile v-for="d in deadlines" :key="d.kind" :d="d" @action="deadlineAction(d.kind)" />
          <div v-if="!deadlines.find((d) => d.kind === 'bollo') && !v.bolloExempt" class="list-item card flat missing" @click="open.bollo = true">
            <div class="icon-bubble"><Landmark :size="20" /></div><div class="grow"><strong>Bollo</strong><div class="faint" style="font-size: 13px">Registra l'ultimo pagamento per ricevere il promemoria</div></div><Plus :size="18" />
          </div>
          <div v-if="!policies.length" class="list-item card flat missing" @click="open.policy = true">
            <div class="icon-bubble"><ShieldCheck :size="20" /></div><div class="grow"><strong>Assicurazione</strong><div class="faint" style="font-size: 13px">Aggiungi la polizza: ti avviso 30, 15, 1 giorno prima e il giorno stesso</div></div><Plus :size="18" />
          </div>
        </template>
        <div v-else class="card flat end-card">
          <div class="row"><div class="icon-bubble danger"><Flag :size="20" /></div>
            <div class="grow"><strong>{{ STATUS_LABEL[v.status] }}{{ v.end?.date ? ` il ${formatDate(v.end.date)}` : '' }}</strong>
              <div class="faint" style="font-size: 13px">{{ endLine }}</div></div></div>
        </div>

        <div class="section-head" style="margin: 6px 0 -4px"><h2>Ultimi lavori</h2><button v-if="works.length" class="btn ghost sm" @click="setTab('lavori')">Tutti</button></div>
        <div v-if="works.length" class="list">
          <WorkRow v-for="w in works.slice(0, 3)" :key="w.id" :w="w" @click="editWork(w)" />
        </div>
        <button class="btn block" @click="editWork(null)"><Wrench :size="18" /> Aggiungi un lavoro</button>
      </div>

      <!-- SCADENZE -->
      <div v-else-if="tab === 'scadenze'" class="stack" style="gap: 18px">
        <section>
          <div class="section-head"><h2>Bollo</h2><button class="btn sm" @click="editBollo(null)"><Plus :size="16" /> Pagato</button></div>
          <p v-if="v.bolloExempt" class="chip ok">Veicolo esente</p>
          <div v-if="bolli.length" class="list">
            <button v-for="b in bolli" :key="b.id" class="list-item" @click="editBollo(b)">
              <div class="icon-bubble ok"><Landmark :size="19" /></div>
              <div class="grow"><strong>Pagato il {{ formatDate(b.paidDate) }}</strong><div class="faint" style="font-size: 13px">Prossimo: {{ monthName(b.nextDueMonth) }}</div></div>
              <span class="num" style="font-weight: 700">{{ money(b.amount) }}</span>
            </button>
          </div>
          <p v-else class="faint">Nessun pagamento registrato.</p>
        </section>
        <section>
          <div class="section-head"><h2>Assicurazione</h2><button class="btn sm" @click="editPolicy(null, policies[0])"><Plus :size="16" /> {{ policies.length ? 'Rinnova' : 'Aggiungi' }}</button></div>
          <div v-if="policies.length" class="list">
            <button v-for="p in policies" :key="p.id" class="list-item" @click="editPolicy(p)">
              <div class="icon-bubble accent"><ShieldCheck :size="19" /></div>
              <div class="grow"><strong>{{ p.company || 'Polizza' }}</strong><div class="faint" style="font-size: 13px">{{ p.startDate ? formatDate(p.startDate) + ' → ' : 'Scade il ' }}{{ formatDate(p.endDate) }}{{ p.coverage ? ' · ' + p.coverage : '' }}</div></div>
              <span class="num" style="font-weight: 700">{{ money(p.price) }}</span>
            </button>
          </div>
          <p v-else class="faint">Nessuna polizza registrata.</p>
        </section>
        <section>
          <div class="section-head"><h2>Revisione</h2><button class="btn sm" @click="editInspection(null)"><Plus :size="16" /> Fatta</button></div>
          <p v-if="nextRev" class="muted" style="margin: 0 0 10px">Prossima entro il <b>{{ formatDate(nextRev) }}</b> <span class="faint">(4 anni dalla prima immatricolazione, poi ogni 2)</span></p>
          <div v-if="inspections.length" class="list">
            <button v-for="i in inspections" :key="i.id" class="list-item" @click="editInspection(i)">
              <div class="icon-bubble" :class="i.outcome === 'regolare' ? 'ok' : 'warn'"><ClipboardCheck :size="19" /></div>
              <div class="grow"><strong>{{ formatDate(i.date) }}</strong><div class="faint" style="font-size: 13px">{{ i.outcome === 'regolare' ? 'Regolare' : i.outcome === 'ripetere' ? 'Da ripetere' : 'Sospeso' }}{{ i.km ? ' · ' + km(i.km) : '' }}{{ i.center ? ' · ' + i.center : '' }}</div></div>
              <span class="num" style="font-weight: 700">{{ money(i.cost) }}</span>
            </button>
          </div>
        </section>
      </div>

      <!-- LAVORI -->
      <div v-else-if="tab === 'lavori'" class="stack" style="gap: 14px">
        <div class="row"><div class="grow"><div class="eyebrow">Totale lavori</div><b style="font-size: 22px" class="num">{{ money(totals.works) }}</b></div>
          <button class="btn primary sm" @click="editWork(null)"><Plus :size="16" /> Lavoro</button></div>
        <template v-for="(list, year) in worksByYear" :key="year">
          <div class="section-head" style="margin: 8px 0 -4px"><h2>{{ year }}</h2><span class="faint num">{{ money(list.reduce((s, w) => s + (w.cost ?? 0), 0)) }}</span></div>
          <div class="list"><WorkRow v-for="w in list" :key="w.id" :w="w" @click="editWork(w)" /></div>
        </template>
        <div v-if="!works.length" class="empty"><div class="icon-bubble"><Wrench :size="26" /></div><h3>Nessun lavoro</h3><p>Tagliandi, gomme, riparazioni: tieni traccia di tutto con foto e fatture.</p></div>
      </div>

      <!-- INCIDENTI -->
      <div v-else-if="tab === 'incidenti'" class="stack" style="gap: 14px">
        <button class="btn block" @click="editIncident(null)"><Siren :size="18" /> Registra un incidente</button>
        <div v-for="i in incidents" :key="i.id" class="card flat incident" @click="editIncident(i)">
          <div class="row">
            <span class="chip" :class="faultTone(i.fault)">{{ FAULT_LABEL[i.fault] }}</span>
            <span v-if="i.totalLoss" class="chip danger">Veicolo distrutto</span>
            <span class="grow" />
            <span class="faint" style="font-size: 13px">{{ formatDate(i.date) }}{{ i.time ? ' · ' + i.time : '' }}</span>
          </div>
          <strong style="display: block; margin-top: 10px">{{ i.place || 'Luogo non indicato' }}</strong>
          <p v-if="i.description" class="muted clamp">{{ i.description }}</p>
          <div v-if="i.otherPartyPlate || i.otherPartyName" class="faint" style="font-size: 13px; margin-top: 6px">Controparte: {{ [i.otherPartyName, i.otherPartyPlate, i.otherPartyInsurer].filter(Boolean).join(' · ') }}</div>
          <div v-if="i.mediaIds.length" class="strip" @click.stop><MediaGallery :model-value="i.mediaIds" /></div>
          <div v-if="i.damageCost || i.reimbursed" class="row" style="margin-top: 10px; font-size: 13.5px">
            <span v-if="i.damageCost">Danni <b>{{ money(i.damageCost) }}</b></span>
            <span v-if="i.reimbursed">Rimborso <b>{{ money(i.reimbursed) }}</b></span>
          </div>
        </div>
        <div v-if="!incidents.length" class="empty"><div class="icon-bubble ok"><ShieldCheck :size="26" /></div><h3>Nessun incidente</h3><p>Speriamo resti così.</p></div>
      </div>

      <!-- LIBRETTO -->
      <div v-else-if="tab === 'libretto'" class="stack" style="gap: 14px">
        <NuxtLink :to="`/veicoli/${v.id}/modifica?scan=1`" class="btn block"><ScanText :size="18" /> Rileggi il libretto</NuxtLink>
        <div v-if="v.librettoMediaIds.length" class="card flat"><MediaGallery :model-value="v.librettoMediaIds" /></div>
        <div v-for="g in librettoGroups" :key="g.title" class="card flat">
          <div class="eyebrow" style="margin-bottom: 4px">{{ g.title }}</div>
          <dl class="kv"><div v-for="r in g.rows" :key="r[0]"><dt>{{ r[0] }}</dt><dd>{{ r[1] }}</dd></div></dl>
        </div>
        <div v-if="!librettoGroups.length" class="empty"><p>Nessun dato del libretto. Usa "Rileggi il libretto" per compilarli in automatico.</p></div>
      </div>

      <!-- STORIA -->
      <div v-else-if="tab === 'storia'" class="stack" style="gap: 14px">
        <div class="card flat">
          <div class="row" style="margin-bottom: 6px"><div class="icon-bubble accent"><HandCoins :size="19" /></div><strong class="grow">Acquisto</strong>
            <NuxtLink :to="`/veicoli/${v.id}/modifica`" class="btn ghost sm">Modifica</NuxtLink></div>
          <dl class="kv">
            <div><dt>Data</dt><dd>{{ formatDate(v.purchase.date) || '—' }}</dd></div>
            <div><dt>Prezzo</dt><dd>{{ money(v.purchase.price) }}</dd></div>
            <div><dt>Condizione</dt><dd>{{ ({ nuovo: 'Nuovo', usato: 'Usato', km0: 'Km 0' } as any)[v.purchase.condition ?? ''] ?? '—' }}</dd></div>
            <div><dt>Venditore</dt><dd>{{ v.purchase.seller || '—' }}</dd></div>
            <div><dt>Dove</dt><dd>{{ v.purchase.place || '—' }}</dd></div>
            <div><dt>Km all'acquisto</dt><dd>{{ km(v.purchase.km) }}</dd></div>
          </dl>
          <p v-if="v.purchase.notes" class="muted" style="margin: 8px 0 0">{{ v.purchase.notes }}</p>
        </div>
        <div class="card flat">
          <div class="row" style="margin-bottom: 6px"><div class="icon-bubble danger"><Flag :size="19" /></div><strong class="grow">Vendita o fine</strong>
            <button class="btn ghost sm" @click="open.end = true">{{ v.end ? 'Modifica' : 'Registra' }}</button></div>
          <dl v-if="v.end" class="kv">
            <div><dt>Esito</dt><dd>{{ STATUS_LABEL[v.end.type] }}</dd></div>
            <div><dt>Data</dt><dd>{{ formatDate(v.end.date) || '—' }}</dd></div>
            <div><dt>{{ v.end.type === 'venduto' ? 'Prezzo di vendita' : 'Incasso / rimborso' }}</dt><dd>{{ money(v.end.price) }}</dd></div>
            <div v-if="v.end.buyer"><dt>Acquirente</dt><dd>{{ v.end.buyer }}</dd></div>
            <div v-if="v.end.km"><dt>Km finali</dt><dd>{{ km(v.end.km) }}</dd></div>
          </dl>
          <p v-else class="faint" style="margin: 4px 0 0">Quando lo vendi, se viene distrutto o rottamato, registralo qui.</p>
        </div>
        <div class="card flat">
          <div class="row" style="margin-bottom: 6px"><div class="icon-bubble"><Wallet :size="19" /></div><strong class="grow">Bilancio</strong></div>
          <dl class="kv">
            <div><dt>Acquisto</dt><dd>{{ money(v.purchase.price) }}</dd></div>
            <div><dt>Lavori</dt><dd>{{ money(totals.works) }}</dd></div>
            <div><dt>Bollo</dt><dd>{{ money(totals.bollo) }}</dd></div>
            <div><dt>Assicurazione</dt><dd>{{ money(totals.insurance) }}</dd></div>
            <div><dt>Revisioni</dt><dd>{{ money(totals.inspections) }}</dd></div>
            <div><dt>Danni non rimborsati</dt><dd>{{ money(totals.incidents) }}</dd></div>
            <div v-if="v.end?.price"><dt>Incassato a fine possesso</dt><dd style="color: var(--ok)">− {{ money(v.end.price) }}</dd></div>
            <div><dt><b>Costo totale</b></dt><dd style="font-size: 16px">{{ money(totals.net) }}</dd></div>
          </dl>
        </div>
        <div class="card flat">
          <div class="row" style="margin-bottom: 10px"><div class="icon-bubble"><History :size="19" /></div><strong class="grow">Targhe</strong></div>
          <div class="stack" style="gap: 10px">
            <div class="row"><PlateBadge :plate="v.plate" size="sm" /><span class="faint" style="font-size: 13px">attuale</span></div>
            <div v-for="p in v.plateHistory" :key="p.plate" class="row"><PlateBadge :plate="p.plate" size="sm" />
              <span class="faint" style="font-size: 13px">{{ [p.from && formatDate(p.from), p.to && formatDate(p.to)].filter(Boolean).join(' → ') }} {{ p.note }}</span></div>
          </div>
        </div>
        <div v-if="v.notes" class="card flat"><div class="eyebrow">Note</div><p style="margin: 6px 0 0; white-space: pre-wrap">{{ v.notes }}</p></div>
      </div>
    </div>

    <button v-if="fabAction" class="fab" style="bottom: calc(var(--safe-bottom) + 22px)" :aria-label="fabAction.label" @click="fabAction.run"><Plus :size="28" /></button>

    <BolloSheet :open="open.bollo" :vehicle="v" :record="edit.bollo" @close="open.bollo = false" />
    <PolicySheet :open="open.policy" :vehicle="v" :record="edit.policy" :renew-from="edit.renew" @close="open.policy = false" />
    <InspectionSheet :open="open.inspection" :vehicle="v" :record="edit.inspection" @close="open.inspection = false" />
    <WorkSheet :open="open.work" :vehicle="v" :record="edit.work" @close="open.work = false" />
    <IncidentSheet :open="open.incident" :vehicle="v" :record="edit.incident" @close="open.incident = false" />
    <EndSheet :open="open.end" :vehicle="v" :incidents="incidents" @close="open.end = false" />

    <BottomSheet :open="menu" @close="menu = false">
      <div class="list" style="box-shadow: none">
        <NuxtLink :to="`/veicoli/${v.id}/modifica`" class="list-item"><Pencil :size="19" /> Modifica dati</NuxtLink>
        <button class="list-item" @click="menu = false; open.end = true"><Flag :size="19" /> {{ v.status === 'attivo' ? 'Venduto, distrutto o rottamato' : 'Modifica fine del possesso' }}</button>
        <button class="list-item" @click="exportSheet"><Share2 :size="19" /> Condividi scheda (testo)</button>
        <button class="list-item" style="color: var(--danger)" @click="remove"><Trash2 :size="19" /> Elimina veicolo</button>
      </div>
    </BottomSheet>
  </div>
  <div v-else-if="!loading" class="page"><div class="empty"><h3>Veicolo non trovato</h3><NuxtLink to="/" class="btn">Torna al garage</NuxtLink></div></div>
</template>

<script setup lang="ts">
import {
  CalendarDays, ChevronLeft, ClipboardCheck, Ellipsis, Flag, Gauge, HandCoins, History, Landmark, Pencil, Plus,
  ScanText, Share2, ShieldCheck, Siren, Trash2, Wallet, Wrench,
} from 'lucide-vue-next'
import { daysBetween, deadlinesFor, formatDate, monthName, nextInspectionDate, parseISO, vehicleName } from '~/utils/deadlines'
import { LIBRETTO_LABELS, type LibrettoData } from '~/utils/libretto'
import type { BolloPayment, DeadlineKind, Fault, Incident, InsurancePolicy, Inspection, Work } from '~/utils/types'

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))
const { data: v, loading } = useLive(() => db().vehicles.get(id.value), undefined, id)
const byVehicle = <T,>(t: string, sort: string) => useLive<T[]>(async () => (await (db() as any)[t].where('vehicleId').equals(id.value).sortBy(sort)).reverse(), [], id).data
const works = byVehicle<Work>('works', 'date')
const incidents = byVehicle<Incident>('incidents', 'date')
const bolli = byVehicle<BolloPayment>('bolli', 'paidDate')
const policies = byVehicle<InsurancePolicy>('policies', 'endDate')
const inspections = byVehicle<Inspection>('inspections', 'date')
const { url: cover } = useMediaUrl(() => v.value?.coverMediaId)

const tab = ref<string>((route.query.tab as string) || 'panoramica')
const setTab = (t: string) => { tab.value = t; router.replace({ query: { ...route.query, tab: t, nuovo: undefined } }) }
const tabs = computed(() => [
  { id: 'panoramica', label: 'Panoramica' },
  { id: 'scadenze', label: 'Scadenze' },
  { id: 'lavori', label: 'Lavori', count: works.value.length },
  { id: 'incidenti', label: 'Incidenti', count: incidents.value.length },
  { id: 'libretto', label: 'Libretto' },
  { id: 'storia', label: 'Storia e costi' },
])

const open = reactive({ bollo: false, policy: false, inspection: false, work: false, incident: false, end: false })
const edit = reactive<{ bollo: BolloPayment | null; policy: InsurancePolicy | null; renew: InsurancePolicy | null; inspection: Inspection | null; work: Work | null; incident: Incident | null }>({
  bollo: null, policy: null, renew: null, inspection: null, work: null, incident: null,
})
const menu = ref(false)
const editBollo = (r: BolloPayment | null) => { edit.bollo = r; open.bollo = true }
const editPolicy = (r: InsurancePolicy | null, renew?: InsurancePolicy) => { edit.policy = r; edit.renew = r ? null : renew ?? null; open.policy = true }
const editInspection = (r: Inspection | null) => { edit.inspection = r; open.inspection = true }
const editWork = (r: Work | null) => { edit.work = r; open.work = true }
const editIncident = (r: Incident | null) => { edit.incident = r; open.incident = true }
// Arrivo da "Aggiungi spesa": apre direttamente il modulo richiesto
let addDone = false
watch(loading, (l) => {
  if (l || !v.value || addDone) return
  addDone = true
  const add = route.query.add as string | undefined
  if (add === 'work') editWork(null)
  else if (add === 'bollo') editBollo(null)
  else if (add === 'policy') editPolicy(null, policies.value[0])
  else if (add === 'inspection') editInspection(null)
  else if (add === 'incident') editIncident(null)
  if (add) router.replace({ query: { ...route.query, add: undefined } })
}, { immediate: true })

const sub = computed(() => {
  if (!v.value) return ''
  const l = v.value.libretto
  return [v.value.nickname ? [l.marca, l.modello].filter(Boolean).join(' ') : undefined, l.dataPrimaImmatricolazione?.slice(0, 4),
    l.cilindrata ? `${l.cilindrata} cc` : undefined, l.potenzaKw ? `${l.potenzaKw} kW (${kwToCv(l.potenzaKw)} CV)` : undefined, l.alimentazione].filter(Boolean).join(' · ')
})

const deadlines = computed(() => {
  if (!v.value) return []
  const today = new Date()
  return deadlinesFor({ vehicle: v.value, bolli: bolli.value, policies: policies.value, inspections: inspections.value })
    .map((d) => ({ ...d, days: daysBetween(today, parseISO(d.date)) }))
})
const health = computed(() => vehicleHealth(v.value!, deadlines.value as any))
const healthPct = computed(() => (deadlines.value.length ? Math.round((deadlines.value.filter((d) => d.days > 30).length / deadlines.value.length) * 100) : 100))
const nextRev = computed(() => nextInspectionDate(v.value?.libretto.dataPrimaImmatricolazione, inspections.value))

function deadlineAction(kind: DeadlineKind) {
  if (kind === 'bollo') editBollo(null)
  else if (kind === 'assicurazione') editPolicy(null, policies.value[0])
  else editInspection(null)
}

const sum = (xs: (number | undefined)[]) => xs.reduce<number>((s, x) => s + (x ?? 0), 0)
const totals = computed(() => {
  const w = sum(works.value.map((x) => x.cost))
  const b = sum(bolli.value.map((x) => x.amount))
  const ins = sum(policies.value.map((x) => x.price))
  const insp = sum(inspections.value.map((x) => x.cost))
  const inc = sum(incidents.value.map((x) => Math.max(0, (x.damageCost ?? 0) - (x.reimbursed ?? 0))))
  const running = w + b + ins + insp + inc
  const net = (v.value?.purchase.price ?? 0) + running - (v.value?.end?.price ?? 0)
  return { works: w, bollo: b, insurance: ins, inspections: insp, incidents: inc, running, net }
})

const ownedFor = computed(() => {
  const start = v.value?.purchase.date ?? v.value?.libretto.dataImmatricolazione
  if (!start) return '—'
  const end = v.value?.end?.date ? parseISO(v.value.end.date) : new Date()
  const days = daysBetween(parseISO(start), end)
  if (days < 60) return `${Math.max(0, days)} gg`
  const months = Math.floor(days / 30.44)
  return months < 24 ? `${months} mesi` : `${(months / 12).toFixed(1).replace('.', ',')} anni`
})

const endLine = computed(() => {
  const e = v.value?.end
  if (!e) return ''
  return [e.price ? (e.type === 'venduto' ? `Venduto a ${money(e.price)}` : `Incasso ${money(e.price)}`) : undefined, e.buyer, e.notes].filter(Boolean).join(' · ')
})

const worksByYear = computed(() => {
  const g: Record<string, Work[]> = {}
  for (const w of works.value) (g[w.date.slice(0, 4)] ??= []).push(w)
  return Object.fromEntries(Object.entries(g).sort((a, b) => b[0].localeCompare(a[0])))
})

const faultTone = (f: Fault) => ({ torto: 'danger', ragione: 'ok', concorso: 'warn', da_definire: '' }[f])

const librettoGroups = computed(() => {
  if (!v.value) return []
  const l = v.value.libretto as Record<string, any>
  const fmt = (k: string, val: any) => {
    if (k.startsWith('data')) return formatDate(val)
    if (k === 'potenzaKw') return `${val} kW · ${kwToCv(val)} CV`
    if (k === 'cilindrata') return `${int(val)} cm³`
    if (k.startsWith('massa')) return `${int(val)} kg`
    if (k === 'lunghezza' || k === 'larghezza' || k === 'altezza') return `${String(val).replace('.', ',')} m`
    return String(val)
  }
  const defs: [string, (keyof LibrettoData)[]][] = [
    ['Veicolo', ['marca', 'modello', 'tipo', 'telaio', 'categoria', 'carrozzeria', 'usoDestinazione', 'costruttore']],
    ['Documento', ['dataPrimaImmatricolazione', 'dataImmatricolazione', 'numeroCarta', 'numeroArchivio', 'progressivoPra', 'omologazione']],
    ['Motore ed emissioni', ['cilindrata', 'potenzaKw', 'alimentazione', 'codiceMotore', 'classeEuro', 'co2', 'direttivaAmbientale', 'cambio', 'livelloSonoro', 'regimeGiri', 'rapportoPotenzaPeso']],
    ['Masse e misure', ['massaMax', 'massaInServizio', 'massaMaxTecnica', 'massaComplesso', 'massaRimorchiabileFrenata', 'massaRimorchiabileNonFrenata', 'posti', 'postiInPiedi', 'assi', 'lunghezza', 'larghezza', 'altezza', 'pneumatici']],
    ['Intestatario', ['intestatarioCognome', 'intestatarioNome', 'codiceFiscale', 'intestatarioNascita', 'indirizzo']],
  ]
  return defs.map(([title, keys]) => ({
    title,
    rows: keys.filter((k) => l[k] !== undefined && l[k] !== '').map((k) => [LIBRETTO_LABELS[k].replace(/\s*\([A-Z0-9.]+\)$/, ''), fmt(k, l[k])]),
  })).filter((g) => g.rows.length)
})

const fabAction = computed(() => {
  if (tab.value === 'lavori') return { label: 'Nuovo lavoro', run: () => editWork(null) }
  if (tab.value === 'incidenti') return { label: 'Nuovo incidente', run: () => editIncident(null) }
  return null
})

function back() {
  if (window.history.length > 1 && !route.query.nuovo) router.back()
  else router.replace('/')
}

async function remove() {
  menu.value = false
  if (!v.value) return
  const ok = await confirmDialog({ title: `Eliminare ${vehicleName(v.value)}?`, text: 'Verranno eliminati per sempre il veicolo, i lavori, gli incidenti, le scadenze e tutte le foto. Se lo hai venduto, usa invece "Venduto" per conservare lo storico.', ok: 'Elimina tutto', danger: true })
  if (!ok) return
  await deleteVehicleCascade(v.value.id)
  toast('Veicolo eliminato')
  router.replace('/')
}

async function exportSheet() {
  menu.value = false
  if (!v.value) return
  const lines = [`${vehicleName(v.value)} – ${v.value.plate}`, sub.value, '']
  for (const g of librettoGroups.value) { lines.push(g.title.toUpperCase()); for (const [k, val] of g.rows) lines.push(`${k}: ${val}`); lines.push('') }
  if (works.value.length) { lines.push('LAVORI'); for (const w of works.value) lines.push(`${formatDate(w.date)} – ${w.title}${w.km ? ` (${km(w.km)})` : ''}${w.cost ? ` – ${money(w.cost)}` : ''}`) }
  await shareBlob(new Blob([lines.join('\n')], { type: 'text/plain' }), `${(v.value.plate || 'veicolo').replace(/\W/g, '')}.txt`)
}
</script>

<style scoped>
.hero { position: relative; min-height: calc(var(--safe-top) + 370px); color: white; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
  background: radial-gradient(70% 60% at 50% 45%, rgba(124, 92, 255, .38), transparent 70%), radial-gradient(60% 40% at 80% 10%, rgba(34, 229, 255, .18), transparent), linear-gradient(180deg, #0c0f2e, #060818); }
.hero::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: linear-gradient(90deg, transparent, #22e5ff, #7c5cff, transparent); box-shadow: 0 0 14px #22e5ff; }
.hero .cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(6, 8, 24, .5), transparent 30%, rgba(6, 8, 24, .2) 50%, rgba(6, 8, 24, .92)); }
.neon-wrap { position: absolute; left: 50%; top: calc(var(--safe-top) + 40px); width: min(74%, 360px); transform: translateX(-50%); opacity: .95; }
.neon-wrap :deep(svg) { width: 100%; height: auto; }
.hero-bar { position: relative; display: flex; justify-content: space-between; padding: calc(var(--safe-top) + 12px) 16px 0; }
.glass-btn { width: 42px; height: 42px; border-radius: 14px; border: 1px solid rgba(160, 150, 255, .35); display: grid; place-items: center; color: white; background: rgba(14, 16, 44, .55); backdrop-filter: blur(12px); cursor: pointer; box-shadow: 0 0 12px rgba(124, 92, 255, .25); }
.hero-info { position: relative; display: flex; align-items: flex-end; gap: 12px; padding: 20px 16px 22px; max-width: 760px; width: 100%; margin: 0 auto; }
.hero-info h1 { font-size: 30px; font-weight: 700; line-height: 1.1; text-shadow: 0 0 18px rgba(124, 92, 255, .7); }
.hero-info p { margin: 6px 0 0; opacity: .85; font-size: 14px; }
.pill { display: inline-flex; gap: 6px; align-items: center; padding: 5px 10px; border-radius: 99px; background: rgba(124, 92, 255, .25); border: 1px solid rgba(160, 150, 255, .45); backdrop-filter: blur(8px); font-size: 12px; font-weight: 700; }
.pill.dark { background: rgba(0,0,0,.6); }
.ring { --c: 25, 227, 177; position: relative; flex: none; width: 84px; height: 84px; border: 0; padding: 0; background: none; color: #fff; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring.warn { --c: 255, 168, 32; }
.ring.danger { --c: 255, 92, 138; }
.ring svg { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 0 6px rgba(var(--c), .9)); }
.r-track { fill: rgba(10, 12, 36, .6); stroke: rgba(255, 255, 255, .12); stroke-width: 5; }
.r-val { fill: none; stroke: rgb(var(--c)); stroke-width: 5; stroke-linecap: round; transition: stroke-dasharray .6s; }
.ring b { position: relative; font-family: var(--font-display); font-size: 18px; line-height: 1; }
.ring span { position: relative; font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; opacity: .85; margin-top: 2px; }
.tabs { top: 0; }
.tab .count { margin-left: 6px; font-size: 11.5px; padding: 1px 7px; border-radius: 99px; background: var(--surface-3); color: var(--text-2); }
.stat { display: flex; flex-direction: column; gap: 2px; padding: 12px; color: var(--text-3); }
.stat b { color: var(--text); font-size: 17px; font-family: var(--font-display); margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat span { font-size: 12px; }
.missing { border-style: dashed; cursor: pointer; padding: 14px 16px; border-radius: var(--radius); }
.next-steps { border-color: rgba(124, 92, 255, .4); background: linear-gradient(135deg, var(--accent-soft), transparent); }
.incident { cursor: pointer; }
.clamp { margin: 4px 0 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-size: 14px; }
.strip { margin-top: 10px; }
.strip :deep(.gallery) { grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); }
.end-card { border-color: rgba(248, 113, 113, .3); }
</style>
