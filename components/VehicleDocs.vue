<template>
  <FoldSection title="Bollo, assicurazione e revisione" :subtitle="subtitle" :initially-open="true" tone="accent">
    <template #icon><ScanText :size="20" /></template>
    <p class="faint" style="margin: 0; font-size: 13px">Carica la ricevuta o il certificato: leggo i dati e li salvo insieme al veicolo.</p>

    <div v-for="s in SLOTS" :key="s.kind" class="slot">
      <div class="slot-head">
        <div class="icon-bubble" :class="docs[s.kind] ? 'ok' : ''"><component :is="s.icon" :size="18" /></div>
        <div class="grow">
          <strong>{{ s.label }}</strong>
          <div class="faint" style="font-size: 12.5px">{{ state[s.kind]?.busy ? state[s.kind]!.stage : docs[s.kind] ? summary(s.kind) : s.hint }}</div>
        </div>
        <button v-if="docs[s.kind]" type="button" class="btn sm ghost" aria-label="Togli" @click="remove(s.kind)"><X :size="16" /></button>
      </div>

      <div v-if="state[s.kind]?.busy" class="bar"><div :style="{ width: Math.round((state[s.kind]!.pct || 0) * 100) + '%' }" /></div>

      <template v-else-if="!docs[s.kind]">
        <div class="slot-actions">
          <label class="btn sm primary"><FileUp :size="16" /> Da foto o PDF<input type="file" accept="image/*,application/pdf" multiple hidden @change="read(s.kind, $event)" /></label>
          <button type="button" class="btn sm" @click="manual(s.kind)"><Pencil :size="15" /> A mano</button>
        </div>
        <p v-if="state[s.kind]?.error" class="err">{{ state[s.kind]!.error }}</p>
      </template>

      <div v-else class="stack" style="gap: 12px">
        <p v-if="plateWarning(s.kind)" class="warn"><CircleAlert :size="15" /> {{ plateWarning(s.kind) }}</p>
        <DocFields :doc="docs[s.kind]!.doc" />
      </div>
    </div>
  </FoldSection>
</template>

<script setup lang="ts">
import { CircleAlert, ClipboardCheck, FileUp, Landmark, Pencil, ScanText, ShieldCheck, X } from 'lucide-vue-next'
import { editDistance, parseDocument, type ParsedDoc } from '~/utils/documents'

type Kind = 'bollo' | 'assicurazione' | 'revisione'

const props = defineProps<{ plate?: string }>()
const docs = defineModel<Partial<Record<Kind, { doc: ParsedDoc; files: File[] }>>>({ required: true })

const SLOTS = [
  { kind: 'bollo', label: 'Bollo', hint: 'Ricevuta di pagamento', icon: Landmark },
  { kind: 'assicurazione', label: 'Assicurazione', hint: 'Polizza o quietanza', icon: ShieldCheck },
  { kind: 'revisione', label: 'Revisione', hint: 'Certificato dell\'ultima revisione', icon: ClipboardCheck },
] as const
const state = reactive<Partial<Record<Kind, { busy: boolean; stage: string; pct: number; error?: string }>>>({})

const subtitle = computed(() => {
  const n = Object.values(docs.value).filter(Boolean).length
  return n ? `${n} di 3 inseriti` : 'Carica i documenti per le scadenze'
})

async function read(kind: Kind, e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return
  state[kind] = { busy: true, stage: 'Preparo la lettura…', pct: 0 }
  const st = state[kind]! // proxy reattivo: l'avanzamento si vede mentre legge
  try {
    const texts = await ocrTexts(files, (s, p) => { st.stage = s; st.pct = p }, ['otsu', 'gray', 'sparse'])
    const doc = parseDocument(texts, kind)
    docs.value = { ...docs.value, [kind]: { doc: reactive(doc), files } }
  } catch (err) {
    console.error(err)
    st.error = 'Lettura non riuscita: ' + (err instanceof Error ? err.message : String(err))
  } finally {
    st.busy = false
  }
}

function manual(kind: Kind) {
  const doc: ParsedDoc = kind === 'assicurazione'
    ? { kind, startDate: todayISO(), title: 'RCA' } as ParsedDoc
    : kind === 'revisione' ? { kind, date: todayISO(), outcome: 'regolare' } as ParsedDoc
    : { kind, date: todayISO(), validityMonths: 12 } as ParsedDoc
  docs.value = { ...docs.value, [kind]: { doc: reactive(doc), files: [] } }
}

function remove(kind: Kind) {
  const next = { ...docs.value }
  delete next[kind]
  docs.value = next
}

const fmt = (iso?: string) => (iso ? iso.split('-').reverse().join('/') : '—')
function summary(kind: Kind) {
  const d = docs.value[kind]!.doc
  const n = docs.value[kind]!.files.length
  const file = n ? ` · ${n} file` : ''
  if (kind === 'assicurazione') return `Scade il ${fmt(d.endDate)}${d.total !== undefined ? ' · ' + money(d.total) : ''}${file}`
  if (kind === 'revisione') return `Fatta il ${fmt(d.date)}${d.nextDate ? ' · prossima ' + fmt(d.nextDate) : ''}${file}`
  return `Pagato il ${fmt(d.date)}${d.total !== undefined ? ' · ' + money(d.total) : ''}${file}`
}

const clean = (s?: string) => (s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
function plateWarning(kind: Kind) {
  const read = clean(docs.value[kind]?.doc.plate)
  const mine = clean(props.plate)
  if (!read || !mine || editDistance(read, mine) <= 1) return ''
  return `Sul documento c'è la targa ${read}, diversa da quella del veicolo: controlla che sia il documento giusto.`
}
</script>

<style scoped>
.slot { border-top: 1px solid var(--line); padding-top: 12px; display: flex; flex-direction: column; gap: 10px; }
.slot-head { display: flex; align-items: center; gap: 12px; }
.slot-head strong { font-size: 14.5px; }
.slot-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.slot-actions .btn { cursor: pointer; }
.bar { height: 6px; border-radius: 99px; background: var(--surface-3); overflow: hidden; }
.bar > div { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .3s ease; }
.err { margin: 0; color: var(--danger); font-size: 13px; font-weight: 600; }
.warn { display: flex; gap: 6px; align-items: flex-start; margin: 0; font-size: 13px; font-weight: 600; color: var(--warn, #f5a524); }
</style>
