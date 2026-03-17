<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Impostazioni</h1>
      <p class="page-sub">Sincronizzazione e configurazione</p>
    </div>

    <div class="content-area">
      <!-- Gist Sync -->
      <section class="section">
        <div class="section-header">
          <span class="section-icon">☁️</span>
          <div>
            <h2 class="section-title">Sincronizzazione Gist</h2>
            <p class="section-desc">Mantieni i dati sincronizzati tra dispositivi tramite un GitHub Gist privato.</p>
          </div>
        </div>

        <div class="card">
          <div class="field">
            <label class="field-label">Personal Access Token</label>
            <input
              v-model="token"
              type="password"
              class="field-input"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              autocomplete="off"
              spellcheck="false"
            />
            <p class="field-hint">
              Vai su <strong>github.com → Settings → Developer settings → Personal access tokens → Fine-grained</strong>
              e crea un token con permesso <code>Gists: Read and write</code>.
            </p>
          </div>

          <div class="field">
            <label class="field-label">Gist ID</label>
            <div class="gist-id-row">
              <input
                v-model="gistId"
                type="text"
                class="field-input"
                placeholder="a1b2c3d4e5f6..."
                autocomplete="off"
                spellcheck="false"
              />
              <button
                class="btn-create"
                :disabled="!token || creating"
                @click="handleCreateGist"
              >
                {{ creating ? '...' : 'Crea' }}
              </button>
            </div>
            <p class="field-hint">Inserisci l'ID di un Gist esistente oppure clicca <strong>Crea</strong> per generarne uno nuovo.</p>
          </div>

          <div v-if="saveError" class="alert-error">{{ saveError }}</div>
          <div v-if="saveOk" class="alert-ok">Impostazioni salvate!</div>

          <button class="btn-save" :disabled="saving" @click="handleSave">
            {{ saving ? 'Salvataggio...' : 'Salva impostazioni' }}
          </button>
        </div>
      </section>

      <!-- Sync Status -->
      <section class="section" v-if="settings.gistToken && settings.gistId">
        <div class="section-header">
          <span class="section-icon">🔄</span>
          <div>
            <h2 class="section-title">Stato sincronizzazione</h2>
          </div>
        </div>

        <div class="card">
          <div class="status-row">
            <span class="status-dot" :class="`status-${settings.syncStatus}`" />
            <span class="status-label">{{ statusLabel }}</span>
          </div>

          <div v-if="settings.lastSync" class="status-time">
            Ultima sync: {{ formatDate(settings.lastSync) }}
          </div>

          <div v-if="settings.syncStatus === 'error' && settings.lastError" class="alert-error">
            {{ settings.lastError }}
          </div>

          <button class="btn-sync" :disabled="syncing" @click="handleSyncNow">
            {{ syncing ? 'Sincronizzazione...' : 'Sincronizza ora' }}
          </button>
        </div>
      </section>

      <!-- Data section -->
      <section class="section">
        <div class="section-header">
          <span class="section-icon">🗄️</span>
          <div>
            <h2 class="section-title">Dati locali</h2>
          </div>
        </div>
        <div class="card">
          <div class="data-row">
            <span class="data-label">Veicoli salvati</span>
            <span class="data-value">{{ vehiclesStore.vehicles.length }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useVehiclesStore } from '../stores/vehicles'
import { createGist, pullFromGist, pushToGist } from '../composables/useGistSync'

const settings = useSettingsStore()
const vehiclesStore = useVehiclesStore()

const token = ref('')
const gistId = ref('')
const saving = ref(false)
const creating = ref(false)
const syncing = ref(false)
const saveError = ref('')
const saveOk = ref(false)

onMounted(async () => {
  if (!vehiclesStore.loaded) await vehiclesStore.load()
  token.value = settings.gistToken
  gistId.value = settings.gistId
})

const statusLabel = computed(() => {
  const s = settings.syncStatus
  if (s === 'syncing') return 'Sincronizzazione in corso...'
  if (s === 'error') return 'Errore di sincronizzazione'
  if (s === 'ok') return 'Sincronizzato'
  return 'In attesa'
})

function formatDate(iso) {
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function handleCreateGist() {
  if (!token.value) return
  creating.value = true
  saveError.value = ''
  try {
    const id = await createGist(token.value)
    gistId.value = id
  } catch (e) {
    saveError.value = e.message
  } finally {
    creating.value = false
  }
}

async function handleSave() {
  saving.value = true
  saveError.value = ''
  saveOk.value = false
  try {
    settings.gistToken = token.value.trim()
    settings.gistId = gistId.value.trim()
    await settings.save()
    saveOk.value = true
    setTimeout(() => (saveOk.value = false), 3000)
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}

async function handleSyncNow() {
  syncing.value = true
  settings.syncStatus = 'syncing'
  settings.lastError = ''
  try {
    await pushToGist(settings.gistToken, settings.gistId, vehiclesStore.vehicles)
    settings.syncStatus = 'ok'
    settings.lastSync = new Date().toISOString()
    await settings.save()
  } catch (e) {
    settings.syncStatus = 'error'
    settings.lastError = e.message
  } finally {
    syncing.value = false
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-page);
}
.page-header {
  padding: 56px 20px 16px;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}
.page-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.content-area {
  flex: 1;
  padding: 0 20px calc(var(--nav-height) + var(--safe-bottom) + 24px);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1024px) {
  .page-header { padding-top: 32px; }
  .content-area { padding-bottom: 24px; max-width: 640px; }
}

.section {}
.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.section-icon { font-size: 20px; margin-top: 1px; }
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.section-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.5;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.field-input {
  background: var(--bg-input);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-primary);
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.field-input:focus { border-color: var(--accent); }
.field-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.5;
}
.field-hint code {
  background: var(--bg-card-2);
  padding: 1px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.gist-id-row {
  display: flex;
  gap: 8px;
}
.gist-id-row .field-input { flex: 1; }

.btn-create {
  padding: 10px 14px;
  background: var(--bg-card-2);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-create:hover:not(:disabled) { background: var(--border); }
.btn-create:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-save {
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-sync {
  padding: 10px;
  background: var(--bg-card-2);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}
.btn-sync:disabled { opacity: 0.5; cursor: not-allowed; }

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-idle .status-dot, .status-dot.status-idle { background: var(--text-tertiary); }
.status-syncing .status-dot, .status-dot.status-syncing {
  background: var(--warn);
  animation: pulse-dot 1s ease infinite;
}
.status-ok .status-dot, .status-dot.status-ok { background: var(--ok); }
.status-error .status-dot, .status-dot.status-error { background: var(--danger); }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}
.status-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.data-label { font-size: 14px; color: var(--text-secondary); }
.data-value { font-size: 16px; font-weight: 700; color: var(--text-primary); }

.alert-error {
  background: var(--danger-bg);
  color: var(--danger-text);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}
.alert-ok {
  background: var(--ok-bg);
  color: var(--ok-text);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}
</style>
