<template>
  <div class="page no-nav">
    <header class="topbar">
      <button class="icon-btn" aria-label="Indietro" @click="$router.back()"><ChevronLeft :size="22" /></button>
      <div class="title-sm">{{ doc ? DOC_LABEL[doc.kind] : 'Leggi un documento' }}</div>
    </header>

    <!-- scelta del file -->
    <div v-if="!busy && !doc" class="stack" style="gap: 14px">
      <HoloCard glow="violet" soft :cut="28">
        <div class="intro">
          <div class="icon-bubble accent"><ScanText :size="24" /></div>
          <h2>Fotografa o scegli un documento</h2>
          <p class="muted">Riconosco il tipo e compilo i dati. Tu controlli e salvi.</p>
          <div class="types">
            <span v-for="t in TYPES" :key="t.label" class="type"><component :is="t.icon" :size="15" />{{ t.label }}</span>
          </div>
        </div>
      </HoloCard>
      <label class="btn primary big"><Camera :size="20" /> Fotografa<input type="file" accept="image/*" capture="environment" hidden @change="onPick" /></label>
      <label class="btn big"><FileUp :size="20" /> Foto o PDF<input type="file" accept="image/*,application/pdf" multiple hidden @change="onPick" /></label>
      <p v-if="error" class="err"><CircleAlert :size="16" /> {{ error }}</p>
    </div>

    <!-- lettura -->
    <div v-else-if="busy" class="card progress-wrap">
      <div class="scan-anim"><ScanText :size="34" /><div class="beam" /></div>
      <strong>{{ stage }}</strong>
      <div class="bar"><div :style="{ width: Math.round(pct * 100) + '%' }" /></div>
      <span class="faint num" style="font-size: 13px">{{ Math.round(pct * 100) }}%</span>
    </div>

    <!-- verifica dei dati -->
    <div v-else-if="doc" class="stack" style="gap: 16px">
      <div class="chips kinds">
        <button v-for="k in KINDS" :key="k" type="button" class="chip-btn" :class="{ on: doc.kind === k }" @click="changeKind(k)">{{ DOC_LABEL[k] }}</button>
      </div>

      <template v-if="doc.kind === 'libretto'">
        <div class="card">
          <strong>È un libretto di circolazione</strong>
          <p class="muted" style="margin: 4px 0 14px; font-size: 14px">Creo un nuovo veicolo con i dati letti{{ doc.plate ? ` (targa ${doc.plate})` : '' }}.</p>
          <button class="btn primary block" @click="newFromLibretto"><Plus :size="18" /> Crea il veicolo</button>
        </div>
      </template>

      <template v-else>
        <div class="field">
          <span>Veicolo</span>
          <select v-model="vehicleId" class="input">
            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ vehicleName(v) }}{{ v.plate ? ' · ' + v.plate : '' }}</option>
          </select>
          <small v-if="matchedBy" class="match"><CircleCheck :size="14" /> Riconosciuto {{ matchedBy }} sul documento</small>
          <small v-else-if="doc.plate" class="faint">Sul documento ho letto la targa {{ doc.plate }}: controlla che sia il veicolo giusto.</small>
        </div>

        <!-- lavoro / tagliando / passaggio -->
        <template v-if="doc.kind === 'fattura' || doc.kind === 'passaggio' || doc.kind === 'sconosciuto'">
          <div v-if="doc.kind !== 'passaggio'" class="chips cats">
            <button v-for="c in WORK_CATEGORIES" :key="c.value" type="button" class="chip-btn" :class="{ on: doc.category === c.value }" @click="doc.category = c.value">{{ c.label }}</button>
          </div>
          <FField v-model="doc.title" :label="doc.category === 'tagliando' && doc.kind !== 'passaggio' ? 'Titolo' : doc.kind === 'passaggio' ? 'Descrizione' : 'Cosa è stato fatto'" required />
          <ServiceChecklist v-if="doc.category === 'tagliando' && doc.kind !== 'passaggio'" v-model="doc.service!" />
          <div class="grid-2">
            <FField v-model="doc.date" label="Data" type="date" required />
            <FField v-model="doc.total" label="Totale" type="money" />
            <FField v-if="doc.kind !== 'passaggio'" v-model="doc.km" label="Km" type="number" />
            <FField v-if="doc.kind !== 'passaggio'" v-model="doc.workshop" label="Officina" />
          </div>
          <div v-if="doc.items?.length" class="items card flat">
            <div class="eyebrow" style="margin-bottom: 6px">Righe della fattura</div>
            <div v-for="(it, i) in doc.items" :key="i" class="item">
              <span class="grow">{{ it.text }}</span>
              <span class="num">{{ it.amount !== undefined ? money(it.amount) : '' }}</span>
              <button class="x" aria-label="Togli riga" @click="doc.items!.splice(i, 1)"><X :size="15" /></button>
            </div>
          </div>
          <label v-if="doc.kind === 'passaggio' && vehicle && !vehicle.purchase.date" class="toggle">
            <span><strong style="font-size: 14px">Usa come data d'acquisto</strong><br><span class="faint" style="font-size: 12.5px">Il veicolo non ha ancora una data d'acquisto</span></span>
            <input v-model="setPurchaseDate" type="checkbox" />
          </label>
        </template>

        <!-- assicurazione -->
        <template v-else-if="doc.kind === 'assicurazione'">
          <div class="grid-2">
            <FField v-model="doc.company" label="Compagnia" />
            <FField v-model="doc.policyNumber" label="N° polizza" />
            <FField v-model="doc.startDate" label="Dal" type="date" />
            <FField v-model="doc.endDate" label="Scadenza" type="date" required />
            <FField v-model="doc.total" label="Premio pagato" type="money" />
            <FField v-model="doc.title" label="Coperture" placeholder="RCA, furto…" />
          </div>
        </template>

        <!-- revisione -->
        <template v-else-if="doc.kind === 'revisione'">
          <div class="segmented">
            <button v-for="o in OUTCOMES" :key="o.value" type="button" :class="{ on: doc.outcome === o.value }" @click="doc.outcome = o.value">{{ o.label }}</button>
          </div>
          <div class="grid-2">
            <FField v-model="doc.date" label="Fatta il" type="date" required />
            <FField v-model="doc.nextDate" label="Prossima entro" type="date" />
            <FField v-model="doc.km" label="Km" type="number" />
            <FField v-model="doc.total" label="Costo" type="money" />
          </div>
          <FField v-model="doc.center" label="Centro revisioni" />
        </template>

        <!-- bollo -->
        <template v-else-if="doc.kind === 'bollo'">
          <div class="grid-2">
            <FField v-model="doc.date" label="Pagato il" type="date" required />
            <FField v-model="doc.total" label="Importo" type="money" />
            <FField v-model="doc.nextDueMonth" label="Prossimo pagamento" type="month" />
            <FField v-model="doc.validityMonths" label="Mesi coperti" type="number" />
          </div>
          <p v-if="doc.fromMonth && doc.toMonth" class="faint" style="margin: -4px 0 0; font-size: 13px">Sulla ricevuta: periodo da {{ monthName(doc.fromMonth) }} a {{ monthName(doc.toMonth) }}.</p>
        </template>

        <button class="btn primary big" :disabled="!canSave || saving" @click="save"><Check :size="19" /> Salva nel veicolo</button>
      </template>
      <button class="btn ghost" @click="reset">Leggi un altro documento</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Camera, Check, ChevronLeft, CircleAlert, CircleCheck, ClipboardCheck, FileText, FileUp, Landmark, Plus, Repeat, ScanText, ShieldCheck, Wrench, X } from 'lucide-vue-next'
import { DOC_LABEL, parseDocument, type DocKind, type ParsedDoc } from '~/utils/documents'
import { monthName, vehicleName } from '~/utils/deadlines'
import { parseLibrettoMulti } from '~/utils/libretto'

const route = useRoute()
const router = useRouter()
const { vehicles } = useGarage()
const TYPES = [
  { label: 'Fatture e tagliandi', icon: Wrench }, { label: 'Assicurazione', icon: ShieldCheck }, { label: 'Revisione', icon: ClipboardCheck },
  { label: 'Bollo', icon: Landmark }, { label: 'Passaggio di proprietà', icon: Repeat }, { label: 'Libretto', icon: FileText },
]
const KINDS: DocKind[] = ['fattura', 'assicurazione', 'revisione', 'bollo', 'passaggio', 'libretto']
const OUTCOMES = [{ value: 'regolare', label: 'Regolare' }, { value: 'ripetere', label: 'Da ripetere' }, { value: 'sospeso', label: 'Sospeso' }] as const

const busy = ref(false)
const stage = ref('')
const pct = ref(0)
const error = ref('')
const saving = ref(false)
const texts = ref<string[]>([])
const files = shallowRef<File[]>([])
const doc = ref<ParsedDoc | null>(null)
const vehicleId = ref<string | undefined>(route.query.veicolo as string | undefined)
const matchedBy = ref<string>()
const setPurchaseDate = ref(true)
const vehicle = computed(() => vehicles.value.find((v) => v.id === vehicleId.value))

async function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])
  input.value = ''
  if (!picked.length) return
  busy.value = true
  error.value = ''
  try {
    // tre letture diverse: testo pulito, colori originali e testo sparso nei riquadri dei moduli
    texts.value = await ocrTexts(picked, (s, p) => { stage.value = s; pct.value = p }, ['otsu', 'gray', 'sparse'])
    files.value = picked
    apply(parseDocument(texts.value))
    if (doc.value?.kind === 'sconosciuto') doc.value.kind = 'fattura'
  } catch (err) {
    console.error(err)
    error.value = 'Lettura non riuscita: ' + (err instanceof Error ? err.message : String(err))
  } finally {
    busy.value = false
  }
}

function apply(d: ParsedDoc) {
  if (d.kind === 'fattura' || d.kind === 'sconosciuto') d.service ??= []
  doc.value = d
  const m = matchVehicle(vehicles.value, d)
  matchedBy.value = m.vehicle ? (m.by === 'telaio' ? 'dal telaio' : 'dalla targa') : undefined
  if (m.vehicle) vehicleId.value = m.vehicle.id
  else if (!vehicleId.value) vehicleId.value = vehicles.value.find((v) => v.status === 'attivo')?.id ?? vehicles.value[0]?.id
}

function changeKind(k: DocKind) {
  if (!doc.value || doc.value.kind === k) return
  apply(parseDocument(texts.value, k))
}

const canSave = computed(() => {
  const d = doc.value
  if (!d || !vehicle.value) return false
  if (d.kind === 'assicurazione') return !!d.endDate
  return !!d.date
})

async function save() {
  if (!doc.value || !vehicle.value) return
  saving.value = true
  try {
    const tab = await saveDocument(toRaw(doc.value), vehicle.value, files.value, { setPurchaseDate: setPurchaseDate.value })
    toast(`${DOC_LABEL[doc.value.kind]} salvato`)
    router.replace(`/veicoli/${vehicle.value.id}?tab=${tab}`)
  } catch (err) {
    console.error(err)
    toast('Salvataggio non riuscito', 'danger')
  } finally {
    saving.value = false
  }
}

function newFromLibretto() {
  pendingLibretto.value = { data: parseLibrettoMulti(texts.value), files: files.value }
  router.replace('/veicoli/nuovo')
}

function reset() {
  doc.value = null
  texts.value = []
  files.value = []
  matchedBy.value = undefined
}
</script>

<style scoped>
.intro { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 14px 12px 12px; color: #fff; }
.intro h2 { margin: 8px 0 0; font-size: 20px; }
.intro .muted { color: rgba(225, 228, 255, .75); margin: 0; }
.types { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.type { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: #dfe3ff; background: rgba(255, 255, 255, .08); border: 1px solid rgba(255, 255, 255, .12); }
.big { height: 58px; border-radius: 999px; font-size: 16.5px; }
.err { display: flex; gap: 8px; align-items: flex-start; color: var(--danger); font-weight: 600; font-size: 14px; margin: 0; }
.kinds, .cats { flex-wrap: wrap; overflow: visible; }
.match { display: inline-flex; align-items: center; gap: 6px; color: var(--ok); font-weight: 600; }
.items { padding: 12px 14px; }
.item { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-top: 1px solid var(--line); font-size: 13.5px; }
.item:first-of-type { border-top: 0; }
.item .num { font-weight: 700; white-space: nowrap; }
.x { width: 28px; height: 28px; flex: none; border-radius: 50%; border: 0; background: var(--surface-3); color: var(--text-2); display: grid; place-items: center; cursor: pointer; }
.progress-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 16px; text-align: center; margin-top: 30px; }
.scan-anim { position: relative; width: 74px; height: 74px; border-radius: 22px; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent); overflow: hidden; }
.beam { position: absolute; left: 8px; right: 8px; height: 3px; border-radius: 3px; background: linear-gradient(90deg, transparent, var(--accent-2), transparent); box-shadow: 0 0 14px var(--accent-2); animation: beam 1.4s ease-in-out infinite alternate; }
@keyframes beam { from { top: 10px } to { top: 61px } }
.bar { width: 100%; max-width: 320px; height: 8px; border-radius: 99px; background: var(--surface-3); overflow: hidden; }
.bar > div { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .3s ease; }
</style>
