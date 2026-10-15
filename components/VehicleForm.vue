<template>
  <div class="stack" style="gap: 14px">
    <LibrettoScanner v-if="showScanner" @result="applyLibretto" />

    <section class="card flat stack" style="gap: 14px">
      <div class="preview" :style="{ background: accentGradient(form.accent) }">
        <img v-if="coverUrl" :src="coverUrl" alt="" class="cover" />
        <div class="ghost"><KindIcon :kind="form.kind" :size="110" /></div>
        <div class="pv-bottom">
          <div class="grow">
            <strong class="ellipsis">{{ previewName }}</strong>
          </div>
          <PlateBadge :plate="form.plate" size="sm" />
        </div>
        <label class="cover-btn">
          <ImagePlus :size="16" /> {{ form.coverMediaId ? 'Cambia foto' : 'Foto' }}
          <input type="file" accept="image/*" hidden @change="pickCover" />
        </label>
      </div>

      <div>
        <div class="field"><span>Tipo di veicolo</span></div>
        <div class="kinds">
          <button v-for="k in kinds" :key="k" type="button" class="kind" :class="{ on: form.kind === k }" @click="form.kind = k">
            <KindIcon :kind="k" :size="22" /><span>{{ KIND_LABEL[k] }}</span>
          </button>
        </div>
      </div>

      <div class="grid-2">
        <FField v-model="form.plate" label="Targa attuale" upper placeholder="AB123CD" :filled="filled.has('targa')" />
        <FField v-model="form.nickname" label="Nome (facoltativo)" placeholder="es. La rossa" />
      </div>

      <div>
        <div class="field"><span>Colore della scheda</span></div>
        <div class="swatches">
          <button v-for="a in ACCENTS" :key="a[0]" type="button" class="swatch" :class="{ on: form.accent === a[0] }" :style="{ background: `linear-gradient(135deg, ${a[0]}, ${a[1]})` }" @click="form.accent = a[0]" />
        </div>
      </div>
    </section>

    <FoldSection title="Dati del libretto" :subtitle="librettoSubtitle" :initially-open="filled.size > 0 || !isNew" tone="accent">
      <template #icon><FileText :size="20" /></template>
      <p v-if="filled.size" class="legend"><i /> letto dal libretto: controlla i valori</p>
      <template v-for="g in groups" :key="g.title">
        <div class="eyebrow" style="margin-top: 6px">{{ g.title }}</div>
        <div class="grid-2">
          <FField v-for="f in g.fields" :key="f.key" v-model="lib[f.key]" :label="LIBRETTO_LABELS[f.key]" :type="f.type"
            :upper="f.upper" :filled="filled.has(f.key)" :style="f.wide ? 'grid-column: 1 / -1' : ''" :options="f.options"
            :hint="f.key === 'potenzaKw' && form.libretto.potenzaKw ? `${kwToCv(form.libretto.potenzaKw)} CV` : undefined" />
        </div>
      </template>
      <div>
        <div class="eyebrow" style="margin: 6px 0 8px">Foto del libretto</div>
        <MediaGallery v-model="form.librettoMediaIds" editable accept="image/*,application/pdf" add-label="Aggiungi" />
      </div>
    </FoldSection>

    <FoldSection title="Targhe precedenti" :subtitle="form.plateHistory.length ? `${form.plateHistory.length} registrate` : 'Per veicoli ritargati o con targhe vecchie'" :initially-open="form.plateHistory.length > 0">
      <template #icon><History :size="20" /></template>
      <div v-for="(p, i) in form.plateHistory" :key="i" class="plate-row card flat tight">
        <div class="grid-2">
          <FField v-model="p.plate" label="Targa" upper placeholder="VI 123456" />
          <FField v-model="p.note" label="Nota" placeholder="es. targa originale" />
          <FField v-model="p.from" label="Dal" type="date" />
          <FField v-model="p.to" label="Al" type="date" />
        </div>
        <button type="button" class="btn sm danger" style="margin-top: 10px" @click="form.plateHistory.splice(i, 1)"><Trash2 :size="15" /> Rimuovi</button>
      </div>
      <button type="button" class="btn block" @click="form.plateHistory.push({ plate: '' })"><Plus :size="18" /> Aggiungi targa</button>
    </FoldSection>

    <FoldSection title="Acquisto" :subtitle="purchaseSubtitle" :initially-open="isNew">
      <template #icon><HandCoins :size="20" /></template>
      <div class="segmented">
        <button v-for="c in conditions" :key="c.value" type="button" :class="{ on: form.purchase.condition === c.value }" @click="form.purchase.condition = c.value">{{ c.label }}</button>
      </div>
      <div class="grid-2">
        <FField v-model="form.purchase.date" label="Data d'acquisto" type="date" />
        <FField v-model="form.purchase.price" label="Prezzo pagato" type="money" />
        <FField v-model="form.purchase.seller" label="Venditore" placeholder="Concessionaria, privato…" />
        <FField v-model="form.purchase.place" label="Dove" placeholder="Città, indirizzo" />
        <FField v-model="form.purchase.km" label="Km all'acquisto" type="number" />
        <FField v-model="form.currentKm" label="Km attuali" type="number" />
      </div>
      <FField v-model="form.purchase.notes" label="Note sull'acquisto" type="textarea" placeholder="Permute, garanzia, accessori inclusi…" />
    </FoldSection>

    <FoldSection title="Bollo" :subtitle="form.bolloExempt ? 'Esente' : form.bolloMonthOverride ? `Mese fisso: ${MONTHS[form.bolloMonthOverride - 1]}` : 'Calcolato dalla data di pagamento'">
      <template #icon><Landmark :size="20" /></template>
      <label class="toggle"><span>Veicolo esente dal bollo<br><span class="faint" style="font-size: 12.5px">es. storico oltre 30 anni, disabili</span></span><input v-model="form.bolloExempt" type="checkbox" /></label>
      <FField v-model="form.bolloMonthOverride" label="Mese di pagamento fisso (facoltativo)" :options="MONTHS.map((m, i) => ({ value: i + 1, label: m }))"
        hint="Alcune regioni fanno pagare le moto in un mese fisso (es. gennaio). Lascia vuoto per usare la data in cui paghi." />
    </FoldSection>

    <VehicleDocs v-if="isNew && isPremium" v-model="pendingDocs" :plate="form.plate" />
    <PremiumLock v-else-if="isNew" feature="scadenze" title="Bollo, assicurazione e revisione" />

    <FField v-model="form.notes" label="Note" type="textarea" placeholder="Qualsiasi cosa da ricordare" />

    <div class="form-actions" style="background: linear-gradient(to top, var(--bg) 70%, transparent)">
      <button type="button" class="btn" @click="$emit('cancel')">Annulla</button>
      <button type="button" class="btn primary grow" :disabled="saving" @click="save"><Check :size="18" /> {{ isNew ? 'Aggiungi al garage' : 'Salva modifiche' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, FileText, HandCoins, History, ImagePlus, Landmark, Plus, Trash2 } from 'lucide-vue-next'
import { LIBRETTO_LABELS, plateKind, type LibrettoData } from '~/utils/libretto'
import { vehicleName } from '~/utils/deadlines'
import type { Vehicle } from '~/utils/types'
import type { ParsedDoc } from '~/utils/documents'
import type { VehicleKind } from '~/utils/libretto'

const props = defineProps<{ vehicle?: Vehicle; scan?: boolean }>()
const emit = defineEmits<{ saved: [id: string]; cancel: [] }>()
const isNew = computed(() => !props.vehicle)
const showScanner = computed(() => isNew.value || props.scan)

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
const kinds: VehicleKind[] = ['auto', 'moto', 'ciclomotore', 'furgone', 'camper', 'rimorchio', 'altro']
const conditions = [{ value: 'nuovo', label: 'Nuovo' }, { value: 'km0', label: 'Km 0' }, { value: 'usato', label: 'Usato' }] as const

function blank(): Vehicle {
  return {
    id: uid(), createdAt: Date.now(), updatedAt: Date.now(), kind: 'auto', accent: ACCENTS[0][0], status: 'attivo',
    plate: '', plateHistory: [], libretto: {}, librettoMediaIds: [], purchase: { condition: 'usato' },
  }
}
const form = reactive<Vehicle>(props.vehicle ? structuredClone(toRaw(props.vehicle)) : blank())
const lib = form.libretto as Record<string, any>
const filled = reactive(new Set<string>())
// bollo, assicurazione e revisione caricati nel modulo: si salvano dopo il veicolo
const pendingDocs = ref<Partial<Record<'bollo' | 'assicurazione' | 'revisione', { doc: ParsedDoc; files: File[] }>>>({})
const saving = ref(false)
const { url: coverUrl } = useMediaUrl(() => form.coverMediaId)
const previewName = computed(() => vehicleName(form as Vehicle) === 'Veicolo' ? 'Nuovo veicolo' : vehicleName(form as Vehicle))

type F = { key: keyof LibrettoData; type?: 'text' | 'number' | 'date'; upper?: boolean; wide?: boolean; options?: { value: any; label: string }[] }
const fuels = ['Benzina', 'Diesel', 'Benzina/GPL', 'Benzina/Metano', 'Ibrida', 'Elettrica'].map((v) => ({ value: v, label: v }))
const groups: { title: string; fields: F[] }[] = [
  { title: 'Veicolo', fields: [
    { key: 'marca', upper: true }, { key: 'modello', upper: true }, { key: 'tipo', upper: true, wide: true },
    { key: 'telaio', upper: true, wide: true }, { key: 'categoria' }, { key: 'carrozzeria', upper: true },
    { key: 'usoDestinazione', upper: true, wide: true }, { key: 'costruttore', upper: true, wide: true },
  ] },
  { title: 'Date e documento', fields: [
    { key: 'dataPrimaImmatricolazione', type: 'date' }, { key: 'dataImmatricolazione', type: 'date' },
    { key: 'numeroCarta', upper: true }, { key: 'numeroArchivio', upper: true }, { key: 'progressivoPra', upper: true }, { key: 'omologazione', upper: true },
  ] },
  { title: 'Motore', fields: [
    { key: 'cilindrata', type: 'number' }, { key: 'potenzaKw', type: 'number' }, { key: 'alimentazione', options: fuels },
    { key: 'codiceMotore', upper: true }, { key: 'classeEuro' }, { key: 'co2', type: 'number' }, { key: 'cambio' },
    { key: 'direttivaAmbientale', upper: true }, { key: 'livelloSonoro', type: 'number' }, { key: 'regimeGiri', type: 'number' }, { key: 'rapportoPotenzaPeso', type: 'number' },
  ] },
  { title: 'Masse, posti e misure', fields: [
    { key: 'massaMax', type: 'number' }, { key: 'massaInServizio', type: 'number' }, { key: 'massaMaxTecnica', type: 'number' },
    { key: 'massaComplesso', type: 'number' }, { key: 'massaRimorchiabileFrenata', type: 'number' }, { key: 'massaRimorchiabileNonFrenata', type: 'number' },
    { key: 'posti', type: 'number' }, { key: 'postiInPiedi', type: 'number' }, { key: 'assi', type: 'number' },
    { key: 'lunghezza', type: 'number' }, { key: 'larghezza', type: 'number' }, { key: 'altezza', type: 'number' },
    { key: 'pneumatici', wide: true, upper: true },
  ] },
  { title: 'Intestatario', fields: [
    { key: 'intestatarioCognome', upper: true }, { key: 'intestatarioNome', upper: true }, { key: 'codiceFiscale', upper: true, wide: true },
    { key: 'intestatarioNascita', wide: true }, { key: 'indirizzo', upper: true, wide: true },
  ] },
]

const librettoSubtitle = computed(() => {
  const n = Object.values(form.libretto).filter((v) => v !== undefined && v !== '').length
  return n ? `${n} campi compilati` : 'Marca, modello, telaio, motore, masse…'
})
const purchaseSubtitle = computed(() => {
  const p = form.purchase
  return [p.date ? formatDateShort(p.date) : undefined, p.price ? money(p.price, true) : undefined, p.seller].filter(Boolean).join(' · ') || 'Quando, quanto, da chi'
})
function formatDateShort(d: string) { return d.split('-').reverse().join('/') }

async function applyLibretto(data: LibrettoData, files: File[]) {
  filled.clear()
  for (const [k, v] of Object.entries(data)) {
    if (k === 'tipoVeicolo') continue
    if (v !== undefined && v !== '') { lib[k] = v; filled.add(k) }
  }
  if (data.targa) { form.plate = data.targa; filled.add('targa') }
  if (data.tipoVeicolo) form.kind = data.tipoVeicolo
  else if (data.targa) { const k = plateKind(data.targa); if (k === 'moto' || k === 'auto' || k === 'ciclomotore') form.kind = k }
  // conserva anche le immagini del libretto nella scheda del veicolo
  const ids = await storeFiles(files)
  form.librettoMediaIds = [...form.librettoMediaIds, ...ids]
  if (!form.purchase.date && data.dataImmatricolazione && form.purchase.condition !== 'usato') form.purchase.date = data.dataImmatricolazione
}


// libretto già letto dalla schermata "Leggi un documento" (subito, così la sezione del libretto si apre già compilata)
if (pendingLibretto.value && isNew.value) {
  const p = pendingLibretto.value
  pendingLibretto.value = null
  applyLibretto(p.data, p.files)
}

async function pickCover(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  const [id] = await storeFiles([input.files[0]])
  const old = form.coverMediaId
  form.coverMediaId = id
  if (old && old !== props.vehicle?.coverMediaId) deleteMedia([old])
  input.value = ''
}

async function save() {
  if (!form.plate && !form.libretto.marca && !form.nickname) {
    toast('Inserisci almeno targa, marca o un nome', 'danger')
    return
  }
  saving.value = true
  try {
    const v: Vehicle = JSON.parse(JSON.stringify(toRaw(form)))
    v.plate = (v.plate || '').toUpperCase().replace(/\s+/g, '')
    v.libretto.targa = v.plate || v.libretto.targa
    v.plateHistory = v.plateHistory.filter((p) => p.plate?.trim()).map((p) => ({ ...p, plate: p.plate.toUpperCase().trim() }))
    v.updatedAt = Date.now()
    if (props.vehicle?.coverMediaId && props.vehicle.coverMediaId !== v.coverMediaId) await deleteMedia([props.vehicle.coverMediaId])
    const docs = Object.values(pendingDocs.value).filter((p) => p && (p.doc.kind === 'assicurazione' ? p.doc.endDate : p.doc.date))
    const skipped = Object.values(pendingDocs.value).length - docs.length
    await db().vehicles.put(v)
    for (const p of docs) await saveDocument(JSON.parse(JSON.stringify(toRaw(p!.doc))), v, p!.files)
    if (skipped) toast(`${skipped === 1 ? 'Un documento non è stato salvato' : skipped + ' documenti non sono stati salvati'}: manca la data`, 'danger')
    toast(isNew.value ? `Veicolo aggiunto al garage${docs.length ? ` con ${docs.length} ${docs.length === 1 ? 'documento' : 'documenti'}` : ''}` : 'Modifiche salvate')
    emit('saved', v.id)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.preview { position: relative; height: 150px; border-radius: 18px; overflow: hidden; color: white; padding: 14px; display: flex; flex-direction: column; justify-content: flex-end; }
.preview .cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.preview::after { content: ''; position: absolute; inset: 0; background: linear-gradient(transparent 40%, rgba(0,0,0,.5)); }
.preview .ghost { position: absolute; right: -10px; top: -10px; opacity: .2; transform: rotate(-8deg); }
.pv-bottom { position: relative; z-index: 1; display: flex; align-items: flex-end; gap: 10px; }
.pv-bottom strong { font-size: 20px; font-family: var(--font-display); display: block; }
.cover-btn { position: absolute; z-index: 1; top: 12px; right: 12px; display: inline-flex; gap: 6px; align-items: center; padding: 7px 12px; border-radius: 99px; background: rgba(0,0,0,.35); backdrop-filter: blur(8px); font-size: 12.5px; font-weight: 700; cursor: pointer; }
.kinds { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 6px; }
.kind { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; border-radius: 14px; border: 1px solid var(--line-2); background: var(--surface-2); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; }
.kind.on { border-color: var(--accent); background: var(--accent-soft); color: var(--text); }
.swatches { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
.swatch { width: 36px; height: 36px; border-radius: 12px; border: 2px solid transparent; cursor: pointer; }
.swatch.on { border-color: var(--text); box-shadow: 0 0 0 3px var(--bg) inset; }
.plate-row { background: var(--surface-2); }
.legend { display: flex; align-items: center; gap: 7px; margin: 0 0 4px; font-size: 12.5px; font-weight: 600; color: var(--accent-2); }
.legend i { width: 7px; height: 7px; border-radius: 50%; background: var(--accent-2); box-shadow: 0 0 6px var(--accent-2); }
</style>
