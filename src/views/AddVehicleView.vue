<template>
  <div class="page">
    <div class="form-header">
      <button class="back-btn" @click="goBack">✕</button>
      <h1 class="form-title">{{ isEdit ? 'Modifica veicolo' : 'Nuovo veicolo' }}</h1>
      <button class="save-btn-header" :disabled="saving" @click="submit">
        {{ saving ? '...' : 'Salva' }}
      </button>
    </div>

    <div class="form-scroll">
      <div v-if="errors.length" class="error-box">
        <div v-for="e in errors" :key="e">• {{ e }}</div>
      </div>

      <!-- ─ Sezione: nome e tipo ─ -->
      <div class="section">
        <div class="section-label">Veicolo</div>
        <div class="form-card">
          <div class="field">
            <label class="field-label">Nome / soprannome *</label>
            <input v-model="form.name" class="field-input" placeholder="es. Panda rossa, MT-07…" maxlength="40" />
          </div>
          <div class="field-divider" />
          <div class="field">
            <label class="field-label">Tipo</label>
            <div class="type-grid">
              <button
                v-for="t in types" :key="t.value"
                class="type-btn" :class="{ active: form.type === t.value }"
                @click="onTypeChange(t.value)"
              >
                <span class="type-emoji">{{ t.emoji }}</span>
                <span class="type-name">{{ t.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ─ Sezione: marca / modello / versione ─ -->
      <div class="section">
        <div class="section-label">Marca e modello</div>
        <div class="form-card">

          <!-- Marca -->
          <div class="field cascade-field">
            <label class="field-label">Marca</label>
            <div class="search-wrap">
              <input
                v-model="brandSearch"
                class="field-input"
                placeholder="Cerca marca…"
                @focus="brandDropOpen = true"
                @blur="onBrandBlur"
                autocomplete="off"
              />
              <span class="chevron" :class="{ open: brandDropOpen }">›</span>
            </div>
            <div v-if="brandDropOpen && filteredBrands.length" class="dropdown">
              <div
                v-for="b in filteredBrands" :key="b"
                class="dropdown-item"
                @mousedown.prevent="selectBrand(b)"
              >{{ b }}</div>
            </div>
            <div v-if="brandDropOpen && brandSearch.length > 0 && !filteredBrands.length" class="dropdown">
              <div class="dropdown-empty">Nessun risultato — scrivi liberamente</div>
            </div>
          </div>

          <div class="field-divider" />

          <!-- Modello -->
          <div class="field cascade-field">
            <label class="field-label">Modello</label>
            <div class="search-wrap">
              <input
                v-model="modelSearch"
                class="field-input"
                :placeholder="form.brand ? 'Cerca modello…' : 'Seleziona prima la marca'"
                :disabled="!form.brand"
                @focus="modelDropOpen = true"
                @blur="onModelBlur"
                autocomplete="off"
              />
              <span class="chevron" :class="{ open: modelDropOpen }">›</span>
            </div>
            <div v-if="modelDropOpen && filteredModels.length" class="dropdown">
              <div
                v-for="m in filteredModels" :key="m"
                class="dropdown-item"
                @mousedown.prevent="selectModel(m)"
              >{{ m }}</div>
            </div>
            <div v-if="modelDropOpen && modelSearch.length > 0 && !filteredModels.length" class="dropdown">
              <div class="dropdown-empty">Nessun risultato — scrivi liberamente</div>
            </div>
          </div>

          <div class="field-divider" />

          <!-- Versione -->
          <div class="field cascade-field">
            <label class="field-label">Versione / allestimento</label>
            <div class="search-wrap">
              <input
                v-model="form.version"
                class="field-input"
                :placeholder="form.model ? 'Cerca o scrivi versione…' : 'Seleziona prima il modello'"
                :disabled="!form.model"
                @focus="versionDropOpen = true"
                @blur="onVersionBlur"
                autocomplete="off"
              />
              <span class="chevron" :class="{ open: versionDropOpen }">›</span>
            </div>
            <div v-if="versionDropOpen && filteredVersions.length" class="dropdown">
              <div
                v-for="v in filteredVersions" :key="v"
                class="dropdown-item"
                @mousedown.prevent="selectVersion(v)"
              >{{ v }}</div>
            </div>
          </div>

          <!-- Anteprima riepilogo -->
          <template v-if="vehicleSummary">
            <div class="field-divider" />
            <div class="vehicle-summary">
              <span class="summary-icon">{{ summaryEmoji }}</span>
              <span class="summary-text">{{ vehicleSummary }}</span>
            </div>
          </template>

        </div>
        <p class="section-note">💡 Se il tuo veicolo non è in elenco, scrivi liberamente — il dato viene salvato lo stesso.</p>
      </div>

      <!-- ─ Sezione: dati tecnici ─ -->
      <div class="section">
        <div class="section-label">Dati tecnici</div>
        <div class="form-card">
          <div class="field">
            <label class="field-label">Targa *</label>
            <input
              v-model="form.plate" class="field-input field-plate"
              placeholder="XX000XX" maxlength="10"
              @input="form.plate = form.plate.toUpperCase()"
            />
          </div>
          <div class="field-divider" />
          <div class="field">
            <label class="field-label">Codice VIN / telaio</label>
            <input
              v-model="form.vin" class="field-input"
              placeholder="17 caratteri alfanumerici" maxlength="17"
              @input="form.vin = form.vin.toUpperCase()"
            />
          </div>
          <div class="field-divider" />
          <div class="field-row">
            <div class="field flex-1">
              <label class="field-label">Anno acquisto</label>
              <input v-model.number="form.yearBuy" class="field-input" type="number" :min="1970" :max="currentYear" placeholder="2022" />
            </div>
            <div class="field flex-1">
              <label class="field-label">Anno immatricolazione</label>
              <input v-model.number="form.yearReg" class="field-input" type="number" :min="1970" :max="currentYear" placeholder="2021" />
            </div>
          </div>
          <div class="field-divider" />
          <div class="field">
            <label class="field-label">Colore</label>
            <input v-model="form.color" class="field-input" placeholder="es. Grigio Moonstone" maxlength="30" />
          </div>
        </div>
      </div>

      <!-- ─ Sezione: scadenze ─ -->
      <div class="section">
        <div class="section-label">Scadenze</div>
        <div class="form-card">
          <div class="field">
            <label class="field-label">Bollo (tassa di proprietà) <span class="field-hint">data di scadenza</span></label>
            <input v-model="form.bollo" class="field-input" type="date" />
            <div v-if="bolloInfo" class="field-info" :class="bolloInfo.cls">{{ bolloInfo.text }}</div>
          </div>
          <div class="field-divider" />
          <div class="field">
            <label class="field-label">Assicurazione RCA <span class="field-hint">data di scadenza</span></label>
            <input v-model="form.assicurazione" class="field-input" type="date" />
            <div v-if="assicInfo" class="field-info" :class="assicInfo.cls">{{ assicInfo.text }}</div>
          </div>
          <div class="field-divider" />
          <div class="field">
            <label class="field-label">Revisione periodica <span class="field-hint">data di scadenza</span></label>
            <input v-model="form.revisione" class="field-input" type="date" />
            <div v-if="revInfo" class="field-info" :class="revInfo.cls">{{ revInfo.text }}</div>
          </div>
        </div>
        <p class="section-note">🔔 Riceverai notifiche automatiche 30, 15 e 1 giorno prima di ogni scadenza.</p>
      </div>

      <!-- ─ Note ─ -->
      <div class="section">
        <div class="section-label">Note</div>
        <div class="form-card">
          <div class="field">
            <textarea
              v-model="form.notes" class="field-input field-textarea"
              placeholder="Officina di fiducia, numero polizza, note varie…"
              rows="3" maxlength="500"
            />
          </div>
        </div>
      </div>

      <!-- ─ Elimina (solo edit) ─ -->
      <div v-if="isEdit" class="section">
        <div class="form-card danger-card">
          <button class="danger-btn" @click="confirmDelete">🗑️ Elimina veicolo</button>
        </div>
      </div>

      <div style="height:40px" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVehiclesStore } from '../stores/vehicles'
import { getBrands, getModels, getVersions, getTypeByBrand } from '../data/vehiclesDb'

const router = useRouter()
const route = useRoute()
const store = useVehiclesStore()

const isEdit = computed(() => !!route.params.id && route.name === 'edit-vehicle')
const currentYear = new Date().getFullYear()
const saving = ref(false)
const errors = ref([])

const types = [
  { value: 'car',   label: 'Auto',    emoji: '🚗' },
  { value: 'moto',  label: 'Moto',    emoji: '🏍️' },
  { value: 'van',   label: 'Furgone', emoji: '🚐' },
  { value: 'truck', label: 'Camion',  emoji: '🚛' }
]

// ─── Form ─────────────────────────────────────────────────────────────────────
const form = ref({
  name: '', type: 'car', plate: '', vin: '',
  yearBuy: currentYear, yearReg: currentYear,
  brand: '', model: '', version: '',
  color: '', bollo: '', assicurazione: '', revisione: '', notes: ''
})

// ─── Cascade dropdown state ───────────────────────────────────────────────────
const brandSearch   = ref('')
const modelSearch   = ref('')
const brandDropOpen = ref(false)
const modelDropOpen = ref(false)
const versionDropOpen = ref(false)

// Marche filtrate per tipo e ricerca
const filteredBrands = computed(() => {
  const all = getBrands(form.value.type === 'truck' ? 'van' : form.value.type)
  if (!brandSearch.value) return all
  const q = brandSearch.value.toLowerCase()
  return all.filter(b => b.toLowerCase().includes(q))
})

// Modelli filtrati per marca e ricerca
const filteredModels = computed(() => {
  if (!form.value.brand) return []
  const t = form.value.type === 'truck' ? 'van' : form.value.type
  const all = getModels(form.value.brand, t)
  if (!modelSearch.value) return all
  const q = modelSearch.value.toLowerCase()
  return all.filter(m => m.toLowerCase().includes(q))
})

// Versioni filtrate per marca+modello e testo versione
const filteredVersions = computed(() => {
  if (!form.value.brand || !form.value.model) return []
  const all = getVersions(form.value.brand, form.value.model)
  if (!form.value.version) return all
  const q = form.value.version.toLowerCase()
  return all.filter(v => v.toLowerCase().includes(q))
})

// Anteprima riepilogo
const EMOJIS = { car: '🚗', moto: '🏍️', van: '🚐', truck: '🚛' }
const summaryEmoji = computed(() => EMOJIS[form.value.type] || '🚗')
const vehicleSummary = computed(() => {
  const parts = [form.value.brand, form.value.model, form.value.version].filter(Boolean)
  return parts.length >= 2 ? parts.join(' ') : ''
})

// ─── Cascade handlers ─────────────────────────────────────────────────────────
function selectBrand(b) {
  form.value.brand = b
  brandSearch.value = b
  brandDropOpen.value = false
  // Reset modello e versione
  form.value.model = ''
  form.value.version = ''
  modelSearch.value = ''
  // Auto-imposta tipo dalla marca
  const detectedType = getTypeByBrand(b)
  if (detectedType) form.value.type = detectedType
}

function selectModel(m) {
  form.value.model = m
  modelSearch.value = m
  modelDropOpen.value = false
  form.value.version = ''
}

function selectVersion(v) {
  form.value.version = v
  versionDropOpen.value = false
}

function onBrandBlur() {
  setTimeout(() => {
    brandDropOpen.value = false
    // Se l'utente ha scritto qualcosa che non corrisponde, salvalo come brand libero
    if (brandSearch.value && brandSearch.value !== form.value.brand) {
      form.value.brand = brandSearch.value
    }
  }, 150)
}

function onModelBlur() {
  setTimeout(() => {
    modelDropOpen.value = false
    if (modelSearch.value && modelSearch.value !== form.value.model) {
      form.value.model = modelSearch.value
    }
  }, 150)
}

function onVersionBlur() {
  setTimeout(() => { versionDropOpen.value = false }, 150)
}

function onTypeChange(newType) {
  form.value.type = newType
  // Reset cascata se la marca non è compatibile col nuovo tipo
  form.value.brand = ''
  form.value.model = ''
  form.value.version = ''
  brandSearch.value = ''
  modelSearch.value = ''
}

// ─── Deadline helpers ─────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(dateStr); d.setHours(0,0,0,0)
  return Math.round((d - today) / 86400000)
}

function deadlineInfo(dateStr) {
  const d = daysUntil(dateStr)
  if (d === null) return null
  if (d < 0)   return { cls: 'info-danger', text: `Scaduta da ${Math.abs(d)} giorni` }
  if (d === 0) return { cls: 'info-danger', text: 'Scade oggi!' }
  if (d <= 15) return { cls: 'info-danger', text: `Scade tra ${d} giorni — urgente!` }
  if (d <= 30) return { cls: 'info-warn',   text: `Scade tra ${d} giorni` }
  return { cls: 'info-ok', text: `In scadenza tra ${d} giorni` }
}

const bolloInfo = computed(() => deadlineInfo(form.value.bollo))
const assicInfo = computed(() => deadlineInfo(form.value.assicurazione))
const revInfo   = computed(() => deadlineInfo(form.value.revisione))

// ─── Load dati se edit ────────────────────────────────────────────────────────
onMounted(async () => {
  if (!store.loaded) await store.load()
  if (isEdit.value) {
    const v = store.getVehicleById(route.params.id)
    if (v) {
      Object.keys(form.value).forEach(k => { if (v[k] !== undefined) form.value[k] = v[k] })
      brandSearch.value = v.brand || ''
      modelSearch.value = v.model || ''
    }
  }
})

// ─── Submit ───────────────────────────────────────────────────────────────────
function validate() {
  const errs = []
  if (!form.value.name.trim()) errs.push('Il nome del veicolo è obbligatorio')
  if (!form.value.plate.trim()) errs.push('La targa è obbligatoria')
  return errs
}

async function submit() {
  errors.value = validate()
  if (errors.value.length) return
  saving.value = true
  try {
    const data = { ...form.value }
    if (isEdit.value) await store.updateVehicle(route.params.id, data)
    else await store.addVehicle(data)
    goBack()
  } catch (e) {
    errors.value = ['Si è verificato un errore. Riprova.']
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!confirm(`Eliminare definitivamente "${form.value.name}"?`)) return
  await store.deleteVehicle(route.params.id)
  router.replace('/')
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/')
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; min-height: 100dvh; background: var(--bg-page); }

.form-header {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  padding: 56px 16px 14px;
  background: var(--bg-page);
  border-bottom: 1px solid var(--border);
}
.form-title { font-size: 17px; font-weight: 600; color: var(--text-primary); }
.back-btn {
  background: none; border: none; font-size: 20px;
  color: var(--text-secondary); cursor: pointer;
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
}
.save-btn-header {
  background: var(--accent); color: #fff; border: none;
  border-radius: 20px; padding: 7px 18px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.save-btn-header:disabled { opacity: 0.5; }

.form-scroll { overflow-y: auto; flex: 1; }

.section { padding: 24px 20px 0; }
.section-label {
  font-size: 12px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.8px; color: var(--text-secondary); margin-bottom: 10px; padding-left: 4px;
}
.section-note { font-size: 12px; color: var(--text-secondary); padding: 8px 4px 0; line-height: 1.5; }

.form-card {
  background: var(--bg-card); border-radius: var(--radius-lg);
  border: 1px solid var(--border); overflow: visible; position: relative;
}
.field { padding: 12px 16px; }
.field-divider { height: 1px; background: var(--border); }
.field-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); display: block; margin-bottom: 6px; }
.field-hint { font-size: 11px; color: var(--text-tertiary); font-weight: 400; margin-left: 6px; }
.field-input {
  width: 100%; background: transparent; border: none; outline: none;
  font-size: 15px; color: var(--text-primary); font-family: inherit; padding: 0;
}
.field-input:disabled { color: var(--text-tertiary); }
.field-plate { text-transform: uppercase; font-weight: 600; letter-spacing: 1px; }
.field-textarea { resize: none; line-height: 1.5; }
.field-row { display: flex; }
.field-row .field { flex: 1; }
.field-row .field:first-child { border-right: 1px solid var(--border); }
.flex-1 { flex: 1; }

/* ─── Cascade dropdown ─── */
.cascade-field { position: relative; }
.search-wrap { display: flex; align-items: center; gap: 6px; }
.chevron {
  font-size: 20px; color: var(--text-tertiary); transition: transform 0.2s;
  flex-shrink: 0; line-height: 1; transform: rotate(90deg);
}
.chevron.open { transform: rotate(-90deg); }

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: -1px;
  right: -1px;
  background: var(--bg-card);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 200;
  max-height: 220px;
  overflow-y: auto;
}
.dropdown-item {
  padding: 11px 14px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  border-bottom: 1px solid var(--border);
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover, .dropdown-item:active { background: var(--bg-input); }
.dropdown-empty {
  padding: 12px 14px;
  font-size: 13px;
  color: var(--text-tertiary);
  font-style: italic;
}

/* ─── Riepilogo veicolo ─── */
.vehicle-summary {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: var(--accent-light);
}
.summary-icon { font-size: 20px; }
.summary-text { font-size: 14px; font-weight: 500; color: var(--accent); }

/* ─── Tipo ─── */
.type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.type-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 4px; background: var(--bg-input);
  border: 2px solid transparent; border-radius: var(--radius-md); cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.type-btn.active { border-color: var(--accent); background: var(--accent-light); }
.type-emoji { font-size: 22px; line-height: 1; }
.type-name { font-size: 11px; font-weight: 500; color: var(--text-secondary); }

/* ─── Info scadenze ─── */
.field-info {
  font-size: 12px; font-weight: 500; margin-top: 6px; padding: 4px 8px; border-radius: 6px;
}
.info-ok     { background: var(--ok-bg);     color: var(--ok-text); }
.info-warn   { background: var(--warn-bg);   color: var(--warn-text); }
.info-danger { background: var(--danger-bg); color: var(--danger-text); }

/* ─── Danger zone ─── */
.danger-card { border-color: var(--danger-bg); }
.danger-btn {
  width: 100%; padding: 14px; background: transparent; border: none;
  font-size: 15px; color: var(--danger-text); font-weight: 500; cursor: pointer; font-family: inherit;
}

/* ─── Errori ─── */
.error-box {
  margin: 12px 20px 0; background: var(--danger-bg); color: var(--danger-text);
  border-radius: var(--radius-md); padding: 12px 14px; font-size: 14px; line-height: 1.6;
}
</style>
